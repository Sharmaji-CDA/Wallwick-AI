import { auth } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { ensureUserDoc, getUserProfile } from "./user/user.service";


/* ================= SIGNUP ================= */

export const signup = async (
  _name: string,
  email: string,
  password: string
) => {
  try {
    const res = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = res.user;

    // Create Firestore user (IMPORTANT)
    await ensureUserDoc(user.uid, email);

    return user;

  } catch (error: any) {
    throw new Error(error.message);
  }
};

/* ================= LOGIN ================= */

export const login = async (
  email: string,
  password: string
) => {
  try {
    const res = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = res.user;

    // Ensure user exists (safe check)
    await ensureUserDoc(user.uid, user.email || "");

    // Fetch profile (IMPORTANT)
    const profile = await getUserProfile(user.uid);

    return { user, profile };

  } catch (error: any) {
    throw new Error(error.message);
  }
};

/* ================= LOGOUT ================= */

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/* ================= AUTH LISTENER ================= */

export const listenToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};