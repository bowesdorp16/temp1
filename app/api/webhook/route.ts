import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get("stripe-signature")!;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, tokens } = session.metadata!;

      // Update user's token balance
      const { data: existingTokens } = await supabase
        .from("tokens")
        .select("amount")
        .eq("user_id", userId)
        .single();

      if (existingTokens) {
        await supabase
          .from("tokens")
          .update({ 
            amount: existingTokens.amount + parseInt(tokens),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabase
          .from("tokens")
          .insert({
            user_id: userId,
            amount: parseInt(tokens),
          });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}