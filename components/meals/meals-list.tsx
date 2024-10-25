"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Archive, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { MealDetailsDialog } from "@/components/meals/meal-details-dialog";
import type { Meal } from "@/types/database";

interface MealsListProps {
  meals: Meal[];
  isLoading: boolean;
  onMealArchived: () => void;
}

export function MealsList({ meals, isLoading, onMealArchived }: MealsListProps) {
  const { toast } = useToast();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  async function archiveMeal(id: string) {
    try {
      const { error } = await supabase
        .from("meals")
        .update({ 
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal archived successfully",
      });

      onMealArchived();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive meal",
      });
    }
  }

  if (isLoading) {
    return <div>Loading meals...</div>;
  }

  if (meals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No meals recorded yet. Click the "Add Meal" button to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <Card key={meal.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{meal.name}</CardTitle>
                  <CardDescription>
                    {format(new Date(meal.date), "PPP")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedMeal(meal);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive Meal</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to archive this meal? You can still access it in your meal history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => archiveMeal(meal.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{meal.description}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <div>{meal.calories} kcal</div>
                <div>Protein: {meal.protein}g</div>
                <div>Carbs: {meal.carbs}g</div>
                <div>Fats: {meal.fats}g</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MealDetailsDialog
        meal={selectedMeal}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onMealUpdated={onMealArchived}
      />
    </>
  );
}