import type { SubscriptionPlan } from "../../types/subscription.type";
import { upgradeUserPlan } from "../subscription/subscription.service";
import {
  createTransaction,
  updatePaymentRequestStatus,
} from "../payments/payment.service";
import { getUserProfile } from "../user/user.service";

export const verifyAndUpgrade = async ({
  uid,
  plan,
  amount,
  utr,
  requestId,
}: {
  uid: string;
  plan: SubscriptionPlan;
  amount: number;
  utr: string;
  requestId: string;
}) => {
  try {
    /* ---------------- VALIDATION ---------------- */
    if (!uid || !plan || !amount || !requestId) {
      throw new Error("Invalid verification data");
    }

    if (!utr || utr.length < 8) {
      throw new Error("Invalid UTR");
    }

    /* ---------------- USER CHECK ---------------- */
    const user = await getUserProfile(uid);
    if (!user) throw new Error("User not found");

    /* ---------------- PREVENT DUPLICATE ---------------- */
    if (user.subscription === plan) {
      return {
        success: true,
        message: "Plan already active",
      };
    }

    /* ---------------- UPDATE STATUS → SUBMITTED ---------------- */
    await updatePaymentRequestStatus({
      requestId,
      status: "submitted",
      utr,
    });

    /* ---------------- TRANSACTION ---------------- */
    await createTransaction({
      userId: uid,
      amount,
      status: "success",
      paymentMethod: "upi",
      utr,
      requestId,
    });

    /* ---------------- UPDATE STATUS → APPROVED ---------------- */
    await updatePaymentRequestStatus({
      requestId,
      status: "approved",
      utr,
    });

    /* ---------------- UPGRADE ---------------- */
    await upgradeUserPlan(uid, plan, amount);

    return {
      success: true,
      message: "Upgrade successful 🎉",
    };

  } catch (error: any) {
    console.error("verifyAndUpgrade error:", error);

    /* ---------------- FAIL SAFE ---------------- */
    if (requestId) {
      await updatePaymentRequestStatus({
        requestId,
        status: "rejected",
      });
    }

    return {
      success: false,
      message: error.message || "Upgrade failed",
    };
  }
};