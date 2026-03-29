import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../../firebase/firebase";
import type { UserProfile } from "../../types/user.type";
import { ensureUserDoc, getUserProfile } from "../../services/user/user.service";

/* ================= TYPES ================= */

export type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(null);
          setProfile(null);
          return;
        }

        setUser(currentUser);

        // ✅ FIX: pass email also
        await ensureUserDoc(currentUser.uid, currentUser.email || "");

        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile);

      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /* ================= AUTH METHODS ================= */

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // ✅ FIX: ensure user doc properly
    await ensureUserDoc(cred.user.uid, cred.user.email || "");
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return;

    const updatedProfile = await getUserProfile(auth.currentUser.uid);
    setProfile(updatedProfile);
  };

  /* ================= PROVIDER ================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}