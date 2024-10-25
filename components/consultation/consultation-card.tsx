"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import type { Consultation } from "@/types/database";

interface ConsultationCardProps {
  consultation: Consultation;
  hasToken: boolean;
}

export function ConsultationCard({ consultation, hasToken }: ConsultationCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const previewText = consultation.ai_response.split('.').slice(0, 2).join('.') + '.';
  const needsUnlock = !hasToken && !isExpanded;

  return (
    <Card className="sci-fi-card">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="text-sm text-muted-foreground">
            {new Date(consultation.created_at).toLocaleDateString()}
          </div>
        </div>

        {consultation.remarks && (
          <div className="text-sm">
            <span className="font-medium">Remarks:</span> {consultation.remarks}
          </div>
        )}

        <div className="prose prose-sm max-w-none relative">
          <div className={needsUnlock ? "blur-sm" : ""}>
            <div className="whitespace-pre-wrap">
              {needsUnlock ? previewText : consultation.ai_response}
            </div>
          </div>

          {needsUnlock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={() => router.push("/dashboard/tokens")}
                className="hover-glow"
              >
                <Lock className="mr-2 h-4 w-4" />
                Unlock Full Report
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}