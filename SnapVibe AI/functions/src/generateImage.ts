import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import fetch from "node-fetch";

admin.initializeApp();

/* ---------------- SECRETS ---------------- */
const HF_API_KEY = defineSecret("HUGGINGFACE_API_KEY");
const OPENROUTER_API_KEY = defineSecret("OPENROUTER_API_KEY");

/* ---------------- SMART TYPE DETECTION ---------------- */
const detectType = (prompt: string): string => {
  const p = prompt.toLowerCase();

  if (
    p.includes("image") ||
    p.includes("photo") ||
    p.includes("picture") ||
    p.includes("draw")
  ) return "image";

  if (
    p.includes("code") ||
    p.includes("api") ||
    p.includes("function") ||
    p.includes("javascript") ||
    p.includes("react") ||
    p.includes("angular")
  ) return "code";

  if (p.includes("translate")) return "translate";
  if (p.includes("explain")) return "explain";

  return "text";
};

/* ---------------- FETCH WITH TIMEOUT ---------------- */
const fetchWithTimeout = async (url: string, options: any, timeout = 60000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

/* ---------------- RETRY HANDLER ---------------- */
const callHFWithRetry = async (url: string, options: any, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    const res = await fetchWithTimeout(url, options, 60000);
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json() as Record<string, any>;

      if (
        data?.error &&
        typeof data.error === "string" &&
        data.error.toLowerCase().includes("loading")
      ) {
        console.log(`Model loading... retry ${i + 1}`);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      return { res, data };
    }

    return { res };
  }

  throw new Error("Model failed after retries");
};

export const generateAI = onRequest(
  {
    secrets: [HF_API_KEY, OPENROUTER_API_KEY],
    cors: true,
    timeoutSeconds: 300,
  },
  async (req, res): Promise<void> => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Only POST allowed" });
        return;
      }

      const { prompt, uid } = req.body || {};

      if (!prompt || !uid) {
        res.status(400).json({ error: "Missing prompt or uid" });
        return;
      }

      /* ---------------- AUTO TYPE ---------------- */
      const type = detectType(prompt);
      const isImage = type === "image";

      /* ---------------- USER CHECK ---------------- */
      const userRef = admin.firestore().doc(`users/${uid}`);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        res.status(403).json({ error: "User not found" });
        return;
      }

      const user = userSnap.data()!;
      const subscription = user.subscription || "free";
      const imageUsed = user.aiImageUsed || 0;
      const textUsed = user.aiTextUsed || 0;

      const now = new Date();

      // 🔥 TRIAL CHECK
      if (user.trialEndsAt && now > user.trialEndsAt.toDate()) {
        if (subscription !== "free") {
          res.status(403).json({
            error: "Trial expired. Please upgrade.",
          });
          return;
        }
      }

      // 🟢 FREE PLAN
      if (subscription === "free") {
        if (isImage && imageUsed >= 15) {
          res.status(403).json({
            error: "Free plan: 15 image limit reached",
          });
          return;
        }

        if (!isImage && textUsed >= 50) {
          res.status(403).json({
            error: "Free plan: 50 text limit reached",
          });
          return;
        }
      }

      // 🟡 BASIC
      if (subscription === "basic" && isImage && imageUsed >= 100) {
        res.status(403).json({
          error: "Basic plan image limit reached",
        });
        return;
      }

      // 🔵 STANDARD
      if (subscription === "standard" && isImage && imageUsed >= 300) {
        res.status(403).json({
          error: "Standard plan image limit reached",
        });
        return;
      }

      let responseData: any = {};

      /* ================= IMAGE (HUGGING FACE) ================= */
      if (isImage) {
        const modelUrl =
          "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

        const body = {
          inputs: prompt,
          options: { wait_for_model: true },
        };

        const { res: hfResponse } = await callHFWithRetry(
          modelUrl,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HF_API_KEY.value()}`,
              "Content-Type": "application/json",
              Accept: "image/png",
            },
            body: JSON.stringify(body),
          },
          3
        );

        const contentType = hfResponse.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          res.status(500).json({
            error: "Image model failed. Try again.",
          });
          return;
        }

        const imageBuffer = Buffer.from(await hfResponse.arrayBuffer());

        const bucket = admin.storage().bucket();
        const fileName = `ai/${uid}/${Date.now()}.png`;

        await bucket.file(fileName).save(imageBuffer, {
          metadata: { contentType: "image/png" },
          public: true,
        });

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        await admin.firestore().collection("images").add({
          imageUrl,
          prompt,
          type,
          creatorId: uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        responseData = { type: "image", imageUrl };
      }

      /* ================= TEXT (OPENROUTER FINAL SECURE) ================= */
      else {
        let text = "";

        try {
          const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY.value()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "meta-llama/llama-3-8b-instruct",
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
            }),
          });

          const data = await aiRes.json() as Record<string, any>;

          console.log("AI RAW:", JSON.stringify(data));

          if (!aiRes.ok) {
            res.status(500).json({
              error: data?.error?.message || "AI API failed",
            });
            return;
          }

          text =
            data?.choices?.[0]?.message?.content?.trim() ||
            "AI did not return a response.";

        } catch (err: any) {
          console.error("🔥 AI ERROR:", err);

          res.status(500).json({
            error: err.message || "Text generation failed",
          });
          return;
        }

        await admin.firestore().collection("ai_generations").add({
          type,
          prompt,
          output: text,
          uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        responseData = {
          type: "text",
          text,
        };
      }

      /* ---------------- UPDATE USAGE ---------------- */
      await userRef.update({
        aiImageUsed: isImage ? imageUsed + 1 : imageUsed,
        aiTextUsed: !isImage ? textUsed + 1 : textUsed,
      });

      res.json(responseData);

    } catch (err: any) {
      console.error("AI ERROR:", err);

      if (err.name === "AbortError") {
        res.status(500).json({
          error: "Request timeout. Try again.",
        });
        return;
      }

      res.status(500).json({
        error: err.message || "AI generation failed",
      });
    }
  }
);