"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { AddMealDialog } from "@/components/meals/add-meal-dialog";
import { MealsList } from "@/components/meals/meals-list";
import { WeeklyOverview } from "@/components/meals/weekly-overview";
import type { Meal } from "@/types/database";

export function MealsPageClient() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("date", { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load meals",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meals</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Meal
        </Button>
      </div>

      <WeeklyOverview meals={meals} />

      <Separator className="my-8" />

      <MealsList 
        meals={meals} 
        isLoading={isLoading} 
        onMealDeleted={fetchMeals} 
      />

      <AddMealDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onMealAdded={fetchMeals}
      />
    </div>
  );
}