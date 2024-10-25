import { Suspense } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Scale,
  Brain,
  Trophy,
  Dumbbell
} from "lucide-react";

export default async function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Welcome to BulkBlitz</h1>
        <p className="text-muted-foreground">Track your nutrition, hit your macros, and maximize your gains</p>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="sci-fi-card p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Log Your Meals</h2>
                <p className="text-muted-foreground">Track every meal to ensure you're hitting your caloric surplus and protein goals</p>
              </div>
            </div>
            <Button asChild className="w-full hover-glow">
              <Link href="/dashboard/meals">Add New Meal</Link>
            </Button>
          </Card>

          <Card className="sci-fi-card p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Get Expert Analysis</h2>
                <p className="text-muted-foreground">Receive personalized insights on your nutrition and recommendations for optimal muscle growth</p>
              </div>
            </div>
            <Button asChild className="w-full hover-glow">
              <Link href="/dashboard/consultation">Get Analysis</Link>
            </Button>
          </Card>

          <Card className="sci-fi-card p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Update Goals</h2>
                <p className="text-muted-foreground">Adjust your targets as you progress and ensure your nutrition aligns with your muscle-building goals</p>
              </div>
            </div>
            <Button asChild className="w-full hover-glow">
              <Link href="/dashboard/profile">Adjust Goals</Link>
            </Button>
          </Card>
        </div>
      </Suspense>
    </div>
  );
}