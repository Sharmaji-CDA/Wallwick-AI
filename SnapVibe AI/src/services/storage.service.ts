import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/firebase";

/* ================= HELPERS ================= */


// Validate image file
const validateImage = (file: File) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, WEBP allowed");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB

  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }
};

/* ================= UPLOAD IMAGE ================= */

export async function uploadImage(file: File, userId: string): Promise<string> {
  try {
    validateImage(file);

    const extension = file.name.split(".").pop();
    const filePath = `uploads/${userId}/${Date.now()}.${extension}`;
    const fileRef = ref(storage, filePath);

    await uploadBytes(fileRef, file, {
      contentType: file.type,
    });

    return filePath; // ✅ return path

  } catch (error: any) {
    throw new Error(error.message);
  }
}

/* ================= UPLOAD AVATAR ================= */

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  try {
    validateImage(file);

    const extension = file.name.split(".").pop();
    const filePath = `avatars/${userId}.${extension}`;
    const fileRef = ref(storage, filePath);

    await uploadBytes(fileRef, file, {
      contentType: file.type,
    });

    return filePath;

  } catch (error: any) {
    throw new Error(error.message);
  }
}