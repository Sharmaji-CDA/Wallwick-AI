import type { Timestamp } from "firebase/firestore";

export interface Notification {
  id: string,
  userId: string,        // receiver
  type: "like" | "follow" | "download" | "system",

  title: string,
  message: string,

  imageId?: string,
  creatorId?: string,

  isRead: boolean,

  createdAt: Timestamp
}