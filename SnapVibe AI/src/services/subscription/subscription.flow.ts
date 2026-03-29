import type { SubscriptionPlan } from "../../types/subscription.type";
import { safeAction } from "../../utils/safe.action";
import { createPaymentRequest } from "../payments/payment.service";
import { getUserProfile } from "../user/user.service";

export const upgradePlan = async (
  uid: string,
  plan: SubscriptionPlan,
  price: number
) => {
  return safeAction(async () => {
    /* ---------------- USER ---------------- */
    const user = await getUserProfile(uid);
    if (!user) throw new Error("User not found");

    /* ---------------- VALIDATION ---------------- */
    if (!plan) throw new Error("Invalid plan");
    if (!price || price <= 0) throw new Error("Invalid price");

    /* ---------------- PAYMENT REQUEST ---------------- */
    const docRef = await createPaymentRequest({
      uid,
      email: user.email,
      accountType: user.role === "creator" ? "creator" : "user",
      plan,
      requestType: "subscription",
      amount: price,
      utr: undefined, // optional now
    });

    /* ---------------- RESPONSE ---------------- */
    return {
      success: true,
      requestId: docRef.id, // 🔥 IMPORTANT
      message: "Payment request created. Complete payment to upgrade.",
    };
  });
};