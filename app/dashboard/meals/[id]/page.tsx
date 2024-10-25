"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Meal } from "@/types/database";

export default function MealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  useEffect(() => {
    async function fetchMeal() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("meals")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (error) throw error;
        if (!data) {
          router.push("/dashboard/meals");
          return;
        }

        setMeal(data);
        if (data.nutrition) {
          setNutrition(data.nutrition);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load meal details",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeal();
  }, [params.id, router, toast]);

  const handleNutritionChange = (field: keyof typeof nutrition) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setNutrition(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("meals")
        .update({
          nutrition,
          updated_at: new Date().toISOString()
        })
        .eq("id", params.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal nutrition updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update meal nutrition",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!meal) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/meals")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meals
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{meal.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {format(new Date(meal.date), "PPP")}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{meal.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Nutritional Values</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Calories (kcal)</label>
                <Input
                  type="number"
                  value={nutrition.calories}
                  onChange={handleNutritionChange("calories")}
                  min="0"
                  step="1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Protein (g)</label>
                <Input
                  type="number"
                  value={nutrition.protein}
                  onChange={handleNutritionChange("protein")}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Carbohydrates (g)</label>
                <Input
                  type="number"
                  value={nutrition.carbs}
                  onChange={handleNutritionChange("carbs")}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fats (g)</label>
                <Input
                  type="number"
                  value={nutrition.fats}
                  onChange={handleNutritionChange("fats")}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}