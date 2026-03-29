import type { SubscriptionPlan } from "../../types/subscription.type";
import { safeAction } from "../../utils/safe.action";
import { createPaymentRequest } from "../payments/payment.service";
import { upgradeUserPlan } from "./subscription.service";

export const upgradePlan = async (
  uid: string,
  plan: SubscriptionPlan,
  price: number
) => {
  return safeAction(async () => {
    // Step 1: Payment request
    await createPaymentRequest({
      uid,
      plan,
      amount: price,
    });

    // Step 2: Upgrade user
    await upgradeUserPlan(uid, plan, price);

    return true;
  });
};