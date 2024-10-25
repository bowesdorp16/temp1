"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      router.push("/dashboard/tokens");
    }
  }, [sessionId, router]);

  return (
    <div className="container max-w-md py-16">
      <Card className="sci-fi-card p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Your token has been added to your account. You can now unlock full consultation reports.
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => router.push("/dashboard/consultation")}
            className="w-full hover-glow"
          >
            View Consultations
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full hover-glow"
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}