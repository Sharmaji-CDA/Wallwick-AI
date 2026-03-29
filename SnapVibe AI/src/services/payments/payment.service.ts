import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
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
  utr?: string;
}) => {
  if (!uid) throw new Error("User not authenticated");

  return await addDoc(collection(db, "upgrade_requests"), {
    userId: uid,
    email,
    accountType,
    plan,
    imageId: imageId || null,
    requestType,
    amount,
    paymentMethod: "upi",

    utr: utr || null,
    status: "pending",

    createdAt: serverTimestamp(),
  });
};

/* ================= UPDATE REQUEST STATUS ================= */

export const updatePaymentRequestStatus = async ({
  requestId,
  status,
  utr,
}: {
  requestId: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  utr?: string;
}) => {
  if (!requestId) throw new Error("Invalid request ID");

  const ref = doc(db, "upgrade_requests", requestId);

  await updateDoc(ref, {
    status,
    ...(utr && { utr }),
    updatedAt: serverTimestamp(),
  });
};

/* ================= CREATE TRANSACTION ================= */

export const createTransaction = async ({
  userId,
  amount,
  status,
  paymentMethod,
  utr,
  requestId,
}: {
  userId: string;
  amount: number;
  status: "success" | "failed";
  paymentMethod: "upi" | "card" | "wallet";
  utr?: string;
  requestId: string;
}) => {
  if (!userId) throw new Error("User not found");

  await addDoc(collection(db, "transactions"), {
    userId,
    amount,
    currency: "INR",
    status,
    paymentMethod,
    utr: utr || null,
    requestId,
    createdAt: serverTimestamp(),
  });
};