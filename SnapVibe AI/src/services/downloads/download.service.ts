import {
  addDoc,
  collection,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { incrementDownload } from "../assets/asset.action";

/* ================= CHECK ================= */

export const hasDownloaded = async (
  userId: string,
  imageId: string
): Promise<boolean> => {
  const q = query(
    collection(db, "downloads"),
    where("userId", "==", userId),
    where("imageId", "==", imageId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/* ================= RECORD DOWNLOAD ================= */

export const recordDownload = async (
  imageId: string,
  userId: string
) => {
  try {
    const already = await hasDownloaded(userId, imageId);

    if (already) {
      return { success: true, duplicate: true };
    }

    // ✅ check image
    const imageRef = doc(db, "images", imageId);
    const imageSnap = await getDoc(imageRef);

    if (!imageSnap.exists()) {
      throw new Error("Image not found");
    }

    // ✅ check user
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const creatorId = imageSnap.data().creatorId || null;

    // 🔥 create download record
    await addDoc(collection(db, "downloads"), {
      imageId,
      userId,
      creatorId,
      createdAt: serverTimestamp(),
    });

    // 🔥 update image downloads + score
    await incrementDownload(imageId);

    // 🔥 update user downloads count
    await updateDoc(userRef, {
      downloadsCount: increment(1),
    });

    return { success: true, duplicate: false };

  } catch (error: any) {
    throw new Error(error.message);
  }
};

/* ================= GET USER DOWNLOADS ================= */

export const getUserDownloads = async (
  userId: string
): Promise<string[]> => {
  try {
    const q = query(
      collection(db, "downloads"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (docItem) => docItem.data().imageId
    );

  } catch (error: any) {
    throw new Error(error.message);
  }
};