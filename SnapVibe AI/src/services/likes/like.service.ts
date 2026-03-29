import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { incrementLike } from "../assets/asset.action";

/* ================= CHECK ================= */

export const getUserLikes = async (userId: string) => {
  const q = query(
    collection(db, "likes"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => {
    const data = docItem.data();

    return {
      id: docItem.id,
      userId: data.userId,
      imageId: data.imageId,
      creatorId: data.creatorId ?? null,
      createdAt: data.createdAt,
    };
  });
};

export const isLiked = async (userId: string, imageId: string) => {
  const q = query(
    collection(db, "likes"),
    where("userId", "==", userId),
    where("imageId", "==", imageId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/* ================= TOGGLE ================= */

export const toggleLike = async (userId: string, imageId: string) => {
  const likesRef = collection(db, "likes");

  const q = query(
    likesRef,
    where("userId", "==", userId),
    where("imageId", "==", imageId)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // UNLIKE
    await deleteDoc(snapshot.docs[0].ref);
    await incrementLike(imageId, -1);

    return { liked: false };

  } else {
    // ✅ fetch image to get creatorId
    const imageRef = doc(db, "images", imageId);
    const imageSnap = await getDoc(imageRef);

    if (!imageSnap.exists()) {
      throw new Error("Image not found");
    }

    const creatorId = imageSnap.data().creatorId || null;

    // LIKE
    await addDoc(likesRef, {
      userId,
      imageId,
      creatorId,
      createdAt: serverTimestamp(),
    });

    await incrementLike(imageId, 1);

    return { liked: true };
  }
};