"use client";

import { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealAdded: () => void;
}

interface FormData {
  name: string;
  description: string;
  date: Date;
}

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  analysis: string;
}

export function AddMealDialog({
  open,
  onOpenChange,
  onMealAdded,
}: AddMealDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      date: new Date(),
    },
  });

  async function analyzeMeal(name: string, description: string): Promise<NutritionalInfo | null> {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealName: name, description }),
      });

      if (!response.ok) throw new Error("Failed to analyze meal");
      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze meal",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true);

      // First analyze the meal
      const nutritionalInfo = await analyzeMeal(data.name, data.description);
      if (!nutritionalInfo) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        name: data.name,
        description: data.description,
        date: format(data.date, "yyyy-MM-dd"),
        calories: nutritionalInfo.calories,
        protein: nutritionalInfo.protein,
        carbs: nutritionalInfo.carbs,
        fats: nutritionalInfo.fats,
        analysis: nutritionalInfo.analysis,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal added successfully",
      });

      form.reset();
      onOpenChange(false);
      onMealAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add meal",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Meal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meal name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter meal description and ingredients"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isAnalyzing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isAnalyzing}>
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzing ? "Analyzing..." : isLoading ? "Adding..." : "Add Meal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}