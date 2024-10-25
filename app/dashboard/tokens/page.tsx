"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export default function TokensPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokens: 1,
          amount: 1000,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process purchase. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Purchase Token</h1>
        <p className="text-muted-foreground">
          Tokens are required for full consultation reports. Each token unlocks one complete analysis.
        </p>
      </div>

      <Card className="sci-fi-card relative overflow-hidden">
        <div className="absolute top-2 right-2 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
          Single Analysis
        </div>
        <CardHeader>
          <h3 className="text-2xl font-bold">1 Token</h3>
          <p className="text-muted-foreground">Unlock one full consultation report</p>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">€10</div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Coins className="mr-2 h-4 w-4 text-primary" />
              One complete consultation analysis
            </li>
            <li className="flex items-center">
              <Coins className="mr-2 h-4 w-4 text-primary" />
              Detailed nutritional insights
            </li>
            <li className="flex items-center">
              <Coins className="mr-2 h-4 w-4 text-primary" />
              Personalized recommendations
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full hover-glow" 
            onClick={handlePurchase}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Purchase Token"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}