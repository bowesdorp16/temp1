"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Meal, UserProfile, Consultation } from "@/types/database";

export default function ConsultationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [tokens, setTokens] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchConsultations();
    fetchTokens();
  }, []);

  async function fetchTokens() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('tokens')
        .select('amount')
        .eq('user_id', user.id)
        .single();

      setTokens(data?.amount || 0);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  }

  async function fetchUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Fetch last week's meals
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { data: mealsData } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", lastWeek.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (profileData) setProfile(profileData);
      if (mealsData) setMeals(mealsData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user data",
      });
    }
  }

  async function fetchConsultations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("consultations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setConsultations(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load consultations",
      });
    }
  }

  async function getConsultation() {
    if (meals.length === 0) {
      toast({
        variant: "destructive",
        title: "No meals found",
        description: "Please add some meals before requesting a consultation.",
      });
      return;
    }

    if (tokens < 1) {
      toast({
        variant: "destructive",
        title: "No tokens",
        description: "Please purchase tokens to get a consultation.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meals,
          profile,
          remarks: remarks.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to get consultation");

      const { analysis } = await response.json();

      // Deduct token
      const { error: tokenError } = await supabase.rpc('deduct_token');
      if (tokenError) throw tokenError;

      const { error } = await supabase.from("consultations").insert({
        user_id: user.id,
        remarks: remarks.trim(),
        ai_response: analysis,
      });

      if (error) throw error;

      await Promise.all([
        fetchConsultations(),
        fetchTokens()
      ]);
      
      setRemarks("");

      toast({
        title: "Success",
        description: "Your consultation is ready!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get consultation",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function truncateResponse(response: string) {
    if (tokens > 0) return response;
    const sentences = response.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 2).join(' ') + ' ...';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Personalized Consultation</h1>
        <p className="text-muted-foreground">
          Get personalized insights about your meals from the past week
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Request New Consultation</h2>
              <div className="text-sm text-muted-foreground">
                Tokens: {tokens}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Additional Remarks (Optional)
                </label>
                <Textarea
                  placeholder="Any specific concerns or symptoms? (e.g., bloating, energy levels)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <Button
                className="w-full"
                onClick={getConsultation}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Analyzing..." : "Get Analysis"}
              </Button>
              {tokens === 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/dashboard/tokens'}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Purchase Tokens
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Consultations</h2>
          {consultations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No consultations yet. Request your first analysis above.
              </CardContent>
            </Card>
          ) : (
            consultations.map((consultation) => (
              <Card key={consultation.id}>
                <CardContent className="p-6 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-sm text-muted-foreground">
                      {new Date(consultation.created_at).toLocaleDateString()}
                    </div>
                    {tokens === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/dashboard/tokens'}
                      >
                        <Lock className="mr-2 h-3 w-3" />
                        Unlock Full Report
                      </Button>
                    )}
                  </div>
                  {consultation.remarks && (
                    <div className="text-sm">
                      <span className="font-medium">Remarks:</span>{" "}
                      {consultation.remarks}
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">
                      {truncateResponse(consultation.ai_response)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}