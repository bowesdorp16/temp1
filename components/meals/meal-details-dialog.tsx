"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import type { Meal } from "@/types/database";

interface MealDetailsDialogProps {
  meal: Meal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealUpdated?: () => void;
}

export function MealDetailsDialog({ 
  meal, 
  open, 
  onOpenChange,
  onMealUpdated 
}: MealDetailsDialogProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Meal>>({});

  if (!meal) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    // Parse numerical values
    if (['calories', 'protein', 'carbs', 'fats'].includes(name)) {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('meals')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', meal.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal updated successfully",
      });

      setIsEditing(false);
      onMealUpdated?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update meal",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    setFormData({
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fats: meal.fats || 0,
      description: meal.description,
      analysis: meal.analysis,
    });
    setIsEditing(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{meal.name}</span>
            {!isEditing ? (
              <Button onClick={startEditing}>Edit</Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Calories</div>
              {isEditing ? (
                <Input
                  type="number"
                  name="calories"
                  value={formData.calories || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                />
              ) : (
                <div className="text-2xl font-bold">{meal.calories || 0} kcal</div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Protein</div>
              {isEditing ? (
                <Input
                  type="number"
                  name="protein"
                  value={formData.protein || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              ) : (
                <div className="text-2xl font-bold">{meal.protein || 0}g</div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Carbs</div>
              {isEditing ? (
                <Input
                  type="number"
                  name="carbs"
                  value={formData.carbs || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              ) : (
                <div className="text-2xl font-bold">{meal.carbs || 0}g</div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Fats</div>
              {isEditing ? (
                <Input
                  type="number"
                  name="fats"
                  value={formData.fats || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              ) : (
                <div className="text-2xl font-bold">{meal.fats || 0}g</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            {isEditing ? (
              <Textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
              />
            ) : (
              <p className="text-muted-foreground">{meal.description}</p>
            )}
          </div>

          {(meal.analysis || isEditing) && (
            <div className="space-y-2">
              <h3 className="font-semibold">Analysis</h3>
              {isEditing ? (
                <Textarea
                  name="analysis"
                  value={formData.analysis || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              ) : (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm">{meal.analysis}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground text-right">
            Added on {format(new Date(meal.created_at), "PPP")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}