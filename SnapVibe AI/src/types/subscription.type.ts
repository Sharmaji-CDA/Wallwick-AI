import { Timestamp } from "firebase/firestore";
import type { AccountType } from "./user.type";

/* ================= PLAN ================= */

export type SubscriptionPlan =
  | "free"
  | "basic"
  | "premium"
  | "go"
  | "pro";


/* ================= STATUS ================= */

export type SubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled";

/* ================= BILLING ================= */

export type BillingCycle = "monthly";

/* ================= SUBSCRIPTION ================= */

export interface Subscription {
  id: string;

  // 🔗 relation
  userId: string;
  accountType: AccountType;

  // 💳 plan
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;

  // 📊 status
  status: SubscriptionStatus;
  isActive: boolean;

  // ⏳ duration
  startDate: Timestamp;
  endDate: Timestamp;

  // 🎁 trial (optional but powerful)
  isTrial?: boolean;
  trialEndsAt?: Timestamp;

  // 💰 payment (future ready)
  paymentId?: string;
  amount?: number;
  currency?: string;

  // 🔄 lifecycle
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}