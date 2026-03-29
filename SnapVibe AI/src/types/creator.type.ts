import { Timestamp } from "firebase/firestore";

/* ================= CREATOR ================= */

export interface Creator {
  id: string;

  // Relation
  userId: string;

  // Profile
  displayName: string;
  photoPath?: string;
  bio?: string;

  // Social
  portfolioUrl?: string;
  socialLinks?: string[];
  followers: number;

  // Content
  totalUploads: number;

  // Earnings
  totalSales: number;
  totalEarnings: number;
  todayEarnings: number;
  monthlyEarnings: number;

  // Status
  isVerified?: boolean;

  // System
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}