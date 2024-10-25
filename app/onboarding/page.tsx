"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/database";

interface PersonalInfo {
  name: string;
  age: string;
  weight: string;
  height: string;
}

interface GoalInfo {
  goal: 'lean_bulk' | 'mass_gain' | 'strength';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
}

export default function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(searchParams.get('step') === '2' ? 2 : 1);
  const [isLoading, setIsLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    age: "",
    weight: "",
    height: "",
  });
  const [goalInfo, setGoalInfo] = useState<GoalInfo>({
    goal: 'lean_bulk',
    activity_level: 'moderate',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/signin");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          // If we have basic info but no goals, go to step 2
          if (profile.name && profile.age && profile.weight && profile.height && !profile.goal) {
            setStep(2);
            setPersonalInfo({
              name: profile.name,
              age: profile.age.toString(),
              weight: profile.weight.toString(),
              height: profile.height.toString(),
            });
          }
          // If we have everything, go to dashboard
          else if (profile.name && profile.age && profile.weight && profile.height && profile.goal) {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    loadProfile();
  }, [router]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (value: 'lean_bulk' | 'mass_gain' | 'strength') => {
    setGoalInfo(prev => ({ ...prev, goal: value }));
  };

  const handleActivityChange = (value: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active') => {
    setGoalInfo(prev => ({ ...prev, activity_level: value }));
  };

  const calculateMacros = async (profile: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/calculate-macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error("Failed to calculate macros");
      return await response.json();
    } catch (error) {
      console.error("Error calculating macros:", error);
      throw error;
    }
  };

  const handleNextStep = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !personalInfo.name ||
      !personalInfo.age ||
      !personalInfo.weight ||
      !personalInfo.height
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save basic info first
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: personalInfo.name,
          age: parseInt(personalInfo.age),
          weight: parseFloat(personalInfo.weight),
          height: parseFloat(personalInfo.height),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setStep(2);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const profile: Partial<UserProfile> = {
        name: personalInfo.name,
        age: parseInt(personalInfo.age),
        weight: parseFloat(personalInfo.weight),
        height: parseFloat(personalInfo.height),
        goal: goalInfo.goal,
        activity_level: goalInfo.activity_level,
      };

      // Calculate recommended macros
      const macros = await calculateMacros(profile);

      // Update profile with calculated targets
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...profile,
          target_calories: macros.calories,
          target_protein: macros.protein,
          target_carbs: macros.carbs,
          target_fats: macros.fats,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile created",
        description: "Your profile has been set up successfully.",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">
            {step === 1 ? "Tell us about yourself" : "Set your goals"}
          </h2>
          <CardDescription>
            {step === 1 
              ? "We'll use this information to personalize your experience"
              : "Help us understand what you want to achieve"
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={step === 1 ? handleNextStep : onSubmit}>
          {step === 1 ? (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  value={personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Age"
                  min="1"
                  max="120"
                  value={personalInfo.age}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  placeholder="Weight (kg)"
                  step="0.1"
                  min="20"
                  max="300"
                  value={personalInfo.weight}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="height"
                  name="height"
                  type="number"
                  placeholder="Height (cm)"
                  step="0.1"
                  min="100"
                  max="250"
                  value={personalInfo.height}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>
            </CardContent>
          ) : (
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">What's your goal?</label>
                <Select
                  value={goalInfo.goal}
                  onValueChange={handleGoalChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lean_bulk">Lean Bulk (Minimize Fat Gain)</SelectItem>
                    <SelectItem value="mass_gain">Mass Gain (Maximum Muscle)</SelectItem>
                    <SelectItem value="strength">Strength Focus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Activity Level</label>
                <Select
                  value={goalInfo.activity_level}
                  onValueChange={handleActivityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (Office Job, No Exercise)</SelectItem>
                    <SelectItem value="light">Light (1-2 Days/Week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 Days/Week)</SelectItem>
                    <SelectItem value="very_active">Very Active (6-7 Days/Week)</SelectItem>
                    <SelectItem value="extra_active">Extra Active (Athlete/Physical Job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          )}
          <CardFooter>
            <Button 
              className="w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading 
                ? step === 1 
                  ? "Saving..." 
                  : "Creating Profile..."
                : step === 1 
                  ? "Next" 
                  : "Complete Profile"
              }
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}