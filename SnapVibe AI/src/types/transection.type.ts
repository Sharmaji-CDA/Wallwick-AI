import type { Timestamp } from "firebase/firestore";

export interface Transaction {
  id: string;

  userId: string;

  // 🔗 link to request
  requestId?: string;

  amount: number;
  currency: "INR";

  status: "pending" | "success" | "failed";

  paymentMethod: "upi" | "card" | "wallet";

  // 🔥 important for UPI
  utr?: string;

  // 🔥 what type of payment
  requestType?: "subscription" | "image_purchase";

  createdAt: Timestamp;
}