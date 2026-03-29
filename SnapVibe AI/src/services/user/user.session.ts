import { ensureUserDoc, getUserProfile } from "./user.service";

export const loadUserSession = async (
  uid: string,
  email: string
) => {
  try {
    // Step 1: Ensure user exists
    await ensureUserDoc(uid, email);

    // Step 2: Fetch user
    const user = await getUserProfile(uid);

    if (!user) throw new Error("User not loaded");

    return user;
  } catch (error: any) {
    console.error("USER SESSION ERROR:", error);
    throw new Error("Failed to initialize user");
  }
};