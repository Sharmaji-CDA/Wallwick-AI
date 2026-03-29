import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

/* ================= CHECK ================= */

export const isFollowing = async (
  userId: string,
  creatorId: string
) => {
  const q = query(
    collection(db, "follows"),
    where("userId", "==", userId),
    where("creatorId", "==", creatorId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/* ================= TOGGLE ================= */

export const toggleFollow = async (
  userId: string,
  creatorId: string
) => {
  const followsRef = collection(db, "follows");

  const q = query(
    followsRef,
    where("userId", "==", userId),
    where("creatorId", "==", creatorId)
  );

  const snapshot = await getDocs(q);

  const creatorRef = doc(db, "users", creatorId);
  const creatorSnap = await getDoc(creatorRef);

  if (!creatorSnap.exists()) {
    throw new Error("Creator not found");
  }

  // ✅ role check
  if (creatorSnap.data().role !== "creator") {
    throw new Error("Can only follow creators");
  }

  const currentFollowers = creatorSnap.data().followers || 0;

  if (!snapshot.empty) {
    // UNFOLLOW
    await deleteDoc(snapshot.docs[0].ref);

    await updateDoc(creatorRef, {
      followers: currentFollowers > 0 ? increment(-1) : 0,
    });

    return { following: false };
  } else {
    // FOLLOW
    await addDoc(followsRef, {
      userId,
      creatorId,
      createdAt: serverTimestamp(),
    });

    await updateDoc(creatorRef, {
      followers: increment(1),
    });

    return { following: true };
  }
};