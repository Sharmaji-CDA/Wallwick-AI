import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/auth/useAuth";
import type { SubscriptionPlan } from "../types/subscription.type";

type Props = {
  children: ReactNode;
  requiredPlan?: SubscriptionPlan;
};

/* USER PLAN LEVEL */
const userPlanHierarchy: Record<string, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

/* CREATOR PLAN LEVEL */
const creatorPlanHierarchy: Record<string, number> = {
  go: 1,
  pro: 2,
};

export default function ProtectedRoute({
  children,
  requiredPlan,
}: Props) {
  const { user, profile, loading } = useAuth();

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  /* ---------------- AUTH ---------------- */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* ---------------- NO PROFILE SAFE ---------------- */
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  /* ---------------- ROLE BASED CHECK ---------------- */
  if (requiredPlan) {
    const role = profile.role;
    const plan = profile.subscription;

    /* ---------- USER ---------- */
    if (role === "user") {
      const userLevel = userPlanHierarchy[plan] ?? 0;
      const requiredLevel = userPlanHierarchy[requiredPlan] ?? 0;

      if (userLevel < requiredLevel) {
        return <Navigate to="/subscription" replace />;
      }
    }

    /* ---------- CREATOR ---------- */
    if (role === "creator") {
      const creatorLevel = creatorPlanHierarchy[plan] ?? 0;
      const requiredLevel = creatorPlanHierarchy[requiredPlan] ?? 0;

      if (creatorLevel < requiredLevel) {
        return <Navigate to="/subscription" replace />;
      }
    }

    /* ---------- ADMIN ---------- */
    if (role === "admin") {
      return <>{children}</>; // full access
    }
  }

  return <>{children}</>;
}