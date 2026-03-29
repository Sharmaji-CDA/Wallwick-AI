import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";


/* ================= CREATE PAYMENT REQUEST ================= */

export const createPaymentRequest = async ({
  uid,
  email,
  accountType,
  plan,
  imageId,
  requestType,
  amount,
  utr,
}: {
  uid: string;
  email: string;
  accountType: "user" | "creator";
  plan: string;
  imageId?: string | null;
  requestType: "subscription" | "image_purchase";
  amount: number;
  utr: string;
}) => {
  if (!uid) throw new Error("User not authenticated");
  if (!utr || utr.length < 8) {
    throw new Error("Invalid UTR / Transaction ID");
  }

  return await addDoc(collection(db, "upgrade_requests"), {
    userId: uid,
    email,

    accountType,
    plan,

    imageId: imageId || null,
    requestType,

    amount,

    paymentMethod: "upi",
    utr,

    status: "pending",

    createdAt: serverTimestamp(),
  });
};

/* ================= CREATE TRANSACTION ================= */

export const createTransaction = async ({
  userId,
  amount,
  status,
  paymentMethod,
  utr,
}: {
  userId: string;
  amount: number;
  status: "success" | "failed";
  paymentMethod: "upi" | "card" | "wallet";
  utr?: string;
}) => {
  if (!userId) throw new Error("User not found");

  await addDoc(collection(db, "transactions"), {
    userId,
    amount,
    currency: "INR",
    status,
    paymentMethod,
    utr: utr || null,
    createdAt: serverTimestamp(),
  });
};