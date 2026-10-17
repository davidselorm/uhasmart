import { NextRequest, NextResponse } from "next/server";
import {
  sendSubscriptionPaymentConfirmation,
  sendSubscriptionRenewalReminder,
} from "@/lib/email";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === "payment_confirmation") {
      const {
        email,
        sellerName,
        planName,
        amountGhs,
        paymentMethod,
        reference,
        expiryDate,
      } = body;

      if (!email || !planName || !amountGhs) {
        return NextResponse.json(
          { error: "Missing required fields (email, planName, amountGhs)" },
          { status: 400 }
        );
      }

      const result = await sendSubscriptionPaymentConfirmation({
        to: email,
        sellerName: sellerName || "Seller",
        planName,
        amountGhs: Number(amountGhs),
        paymentMethod: paymentMethod || "Mobile Money",
        reference: reference || `REF-${Date.now()}`,
        expiryDate: expiryDate || "Active",
      });

      return NextResponse.json({ success: true, result });
    }

    if (type === "renewal_reminder") {
      const { email, sellerName, daysRemaining, expiryDate, isExpired } = body;

      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const result = await sendSubscriptionRenewalReminder({
        to: email,
        sellerName: sellerName || "Seller",
        daysRemaining: Number(daysRemaining) || 0,
        expiryDate: expiryDate || "Soon",
        isExpired: Boolean(isExpired),
      });

      return NextResponse.json({ success: true, result });
    }

    // Cron check: Automatically scans Supabase for sellers expiring in <= 5 days
    if (type === "check_expiring") {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const now = new Date();
      const fiveDaysAhead = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

      // Find sellers whose subscription expires within the next 5 days and reminder not sent yet
      const { data: expiringSellers, error: dbErr } = await supabase
        .from("profiles")
        .select("id, display_name, business_name, subscription_status, subscription_expires_at, subscription_reminder_sent")
        .eq("role", "seller")
        .eq("subscription_reminder_sent", false)
        .lte("subscription_expires_at", fiveDaysAhead);

      if (dbErr) {
        return NextResponse.json({ error: dbErr.message }, { status: 500 });
      }

      let sentCount = 0;
      if (expiringSellers && expiringSellers.length > 0) {
        for (const seller of expiringSellers) {
          // Look up user email via auth or profile
          const { data: userData } = await supabase.auth.admin?.getUserById(seller.id).catch(() => ({ data: null })) || { data: null };
          const email = userData?.user?.email;

          if (email) {
            const expiry = new Date(seller.subscription_expires_at || "");
            const msDiff = expiry.getTime() - now.getTime();
            const daysRemaining = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
            const isExpired = msDiff <= 0;

            await sendSubscriptionRenewalReminder({
              to: email,
              sellerName: seller.business_name || seller.display_name || "Seller",
              daysRemaining,
              expiryDate: expiry.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              isExpired,
            });

            // Mark reminder as sent so they don't get spammed repeatedly
            await supabase
              .from("profiles")
              .update({ subscription_reminder_sent: true })
              .eq("id", seller.id);

            sentCount++;
          }
        }
      }

      return NextResponse.json({ success: true, processed: expiringSellers?.length || 0, sent: sentCount });
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  } catch (err) {
    console.error("Subscription email route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
