import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    try {
      // Update user's tokens
      const { error: tokenError } = await supabase
        .from("tokens")
        .update({ 
          amount: supabase.sql`amount + 1`,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (tokenError) throw tokenError;

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to process payment completion" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}