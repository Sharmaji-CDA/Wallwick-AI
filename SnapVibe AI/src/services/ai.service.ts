const BASE_URL = "https://generateimagehf-2cj2c7urlq-uc.a.run.app";

export const generateAIImage = async (
  prompt: string,
  uid: string
) => {
  const res = await fetch(`${BASE_URL}/generateImageHF`, {
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

  return data; // { imageUrl }
};