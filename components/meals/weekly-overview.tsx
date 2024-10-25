"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { addDays, format, isToday, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Meal, UserProfile } from "@/types/database";

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealCount: number;
}

interface DailyTarget {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface WeeklyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealCount: number;
}

interface WeeklyOverviewProps {
  meals: Meal[];
}

export function WeeklyOverview({ meals }: WeeklyOverviewProps) {
  const [dailyTarget, setDailyTarget] = useState<DailyTarget | null>(null);
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    async function fetchTargets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("target_calories, target_protein, target_carbs, target_fats")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDailyTarget({
          calories: profile.target_calories,
          protein: profile.target_protein,
          carbs: profile.target_carbs,
          fats: profile.target_fats
        });
      }
    }

    fetchTargets();
  }, []);

  function calculateDailyTotals(date: Date): DailyTotals {
    const dayMeals = meals.filter(meal => 
      meal.date === format(date, "yyyy-MM-dd")
    );

    return {
      calories: dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
      protein: dayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
      carbs: dayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0),
      fats: dayMeals.reduce((sum, meal) => sum + (meal.fats || 0), 0),
      mealCount: dayMeals.length
    };
  }

  function calculateWeeklyTotals(): WeeklyTotals {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + (meal.calories || 0),
      protein: totals.protein + (meal.protein || 0),
      carbs: totals.carbs + (meal.carbs || 0),
      fats: totals.fats + (meal.fats || 0),
      mealCount: totals.mealCount + 1
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      mealCount: 0
    });
  }

  function calculateProgress(current: number, target: number): number {
    if (target === 0) return 0;
    return (current / target) * 100;
  }

  function getProgressColor(progress: number): string {
    if (progress === 0) return "bg-secondary/50";
    if (progress < 80) return "bg-red-100 dark:bg-red-950";
    if (progress < 90) return "bg-yellow-100 dark:bg-yellow-950";
    if (progress <= 110) return "bg-green-100 dark:bg-green-950";
    return "bg-red-100 dark:bg-red-950";
  }

  function getTextColor(progress: number): string {
    if (progress === 0) return "text-muted-foreground";
    if (progress < 80) return "text-red-600 dark:text-red-400";
    if (progress < 90) return "text-yellow-600 dark:text-yellow-400";
    if (progress <= 110) return "text-green-600 dark:text-green-400";
    return "text-red-600 dark:text-red-400";
  }

  const weeklyTotals = calculateWeeklyTotals();
  const weeklyTarget = dailyTarget ? {
    calories: dailyTarget.calories * 7,
    protein: dailyTarget.protein * 7,
    carbs: dailyTarget.carbs * 7,
    fats: dailyTarget.fats * 7
  } : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {weeklyTarget && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm text-muted-foreground">
                  {weeklyTotals.calories} / {weeklyTarget.calories} kcal
                </span>
              </div>
              <Progress 
                value={calculateProgress(weeklyTotals.calories, weeklyTarget.calories)} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm text-muted-foreground">
                  {weeklyTotals.protein.toFixed(1)} / {weeklyTarget.protein} g
                </span>
              </div>
              <Progress 
                value={calculateProgress(weeklyTotals.protein, weeklyTarget.protein)} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Carbs</span>
                <span className="text-sm text-muted-foreground">
                  {weeklyTotals.carbs.toFixed(1)} / {weeklyTarget.carbs} g
                </span>
              </div>
              <Progress 
                value={calculateProgress(weeklyTotals.carbs, weeklyTarget.carbs)} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Fats</span>
                <span className="text-sm text-muted-foreground">
                  {weeklyTotals.fats.toFixed(1)} / {weeklyTarget.fats} g
                </span>
              </div>
              <Progress 
                value={calculateProgress(weeklyTotals.fats, weeklyTarget.fats)} 
                className="h-2"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, index) => {
            const day = addDays(startDate, index);
            const totals = calculateDailyTotals(day);
            const calorieProgress = calculateProgress(totals.calories, dailyTarget?.calories || 0);

            return (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg text-center transition-colors",
                  isToday(day) ? "ring-2 ring-primary/20" : "",
                  getProgressColor(calorieProgress)
                )}
              >
                <div className="text-sm font-medium mb-2">
                  {format(day, "EEE")}
                </div>
                <div className={cn(
                  "text-xl font-bold mb-2",
                  getTextColor(calorieProgress)
                )}>
                  {totals.calories} <span className="text-sm">kcal</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className={getTextColor(calculateProgress(totals.protein, dailyTarget?.protein || 0))}>
                    Protein: {totals.protein}g
                  </div>
                  <div className={getTextColor(calculateProgress(totals.carbs, dailyTarget?.carbs || 0))}>
                    Carbs: {totals.carbs}g
                  </div>
                  <div className={getTextColor(calculateProgress(totals.fats, dailyTarget?.fats || 0))}>
                    Fats: {totals.fats}g
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {totals.mealCount} meals
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}