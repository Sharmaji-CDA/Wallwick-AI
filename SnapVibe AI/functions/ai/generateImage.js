import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai";
import cors from "cors";

admin.initializeApp();

const corsHandler = cors({ origin: true });

const OPENAI_API_KEY = defineSecret("WORD_KEY123OPEN_YES");

export const generateImage = onRequest(
  {
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 120,
  },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        // Handle preflight request
        if (req.method === "OPTIONS") {
          res.status(204).send("");
          return;
        }

        if (req.method !== "POST") {
          res.status(405).json({ error: "Only POST allowed" });
          return;
        }

        const { prompt, uid } = req.body;

        if (!prompt || !uid) {
          res.status(400).json({ error: "Missing prompt or uid" });
          return;
        }

        const userRef = admin.firestore().doc(`users/${uid}`);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          res.status(403).json({ error: "User not found" });
          return;
        }

        const user = userSnap.data();
        const plan = user?.plan || "basic";
        const aiUsed = user?.aiUsed || 0;

        if (plan === "basic" && aiUsed >= 2) {
          res.status(403).json({
            error: "Free AI limit reached. Upgrade required.",
          });
          return;
        }

        const openai = new OpenAI({
          apiKey: OPENAI_API_KEY.value(),
        });

        const result = await openai.images.generate({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024",
        });

        const imageUrl =
          result.data && result.data.length > 0
            ? result.data[0].url
            : null;

        if (!imageUrl) {
          res.status(500).json({ error: "Image generation failed" });
          return;
        }

        await admin.firestore().collection("images").add({
          imageUrl,
          title: prompt,
          prompt,
          source: "ai",
          createdBy: "ai",
          creatorName: "SnapVibe AI",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          likes: 0,
          downloads: 0,
        });

        await userRef.update({
          aiUsed: aiUsed + 1,
        });

        res.json({ imageUrl });
      } catch (err) {
        console.error("AI ERROR:", err);
        res.status(500).json({ error: "AI generation failed" });
      }
    });
  }
);