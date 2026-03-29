

const BASE_URL = "https://generateai-2cj2c7urlq-uc.a.run.app";

export const generateAI = async (
  prompt: string,
  uid: string,
) => {
  const res = await fetch(`${BASE_URL}/generateAI`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, uid }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "AI generation failed");
  }

  return data as {
    type: "image" | "text";
    imageUrl?: string;
    text?: string;
  }; // { imageUrl }
};