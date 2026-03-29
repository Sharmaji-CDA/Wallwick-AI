// import * as admin from "firebase-admin";
// import { onRequest } from "firebase-functions/v2/https";
// import { defineSecret } from "firebase-functions/params";
// import cors from "cors";

// admin.initializeApp();

// const corsHandler = cors({ origin: true });
// const OPENAI_API_KEY = defineSecret("WORD_KEY123OPEN_YES");

// type AIType =
//   | "image"
//   | "thumbnail"
//   | "banner"
//   | "ui-design"
//   | "realistic"
//   | "code"
//   | "text"
//   | "translate"
//   | "format"
//   | "solve";

// /* ---------------- PROMPT BUILDER ---------------- */
// const buildPrompt = (
//   prompt: string,
//   type: AIType,
//   extra?: any
// ): string => {
//   switch (type) {
//     case "thumbnail":
//       return `YouTube thumbnail, bold text, high contrast, ${prompt}`;

//     case "banner":
//       return `modern website banner, clean layout, ${prompt}`;

//     case "ui-design":
//       return `premium SaaS UI design, clean UX, ${prompt}`;

//     case "realistic":
//       return `ultra realistic, high detail, ${prompt}`;

//     case "translate":
//       return `Translate this into ${extra?.language || "English"}:\n\n${prompt}`;

//     case "format":
//       return `Rewrite this in ${extra?.style || "professional"} style:\n\n${prompt}`;

//     case "solve":
//       return `Explain and solve clearly:\n\n${prompt}`;

//     case "code":
//       return `Write clean production-ready code:\n\n${prompt}`;

//     case "text":
//       return prompt;

//     default:
//       return prompt;
//   }
// };

// export const generateAI = onRequest(
//   {
//     secrets: [OPENAI_API_KEY],
//     timeoutSeconds: 120,
//   },
//   async (req, res) => {
//     corsHandler(req, res, async () => {
//       try {
//         if (req.method === "OPTIONS") {
//           res.status(204).send("");
//           return;
//         }

//         if (req.method !== "POST") {
//           res.status(405).json({ error: "Only POST allowed" });
//           return;
//         }

//         const { prompt, uid, type = "image", ...extra } = req.body;
//         const safeType: AIType = type;

//         if (!prompt || !uid) {
//           res.status(400).json({ error: "Missing prompt or uid" });
//           return;
//         }

//         /* ---------------- USER CHECK ---------------- */
//         const userRef = admin.firestore().doc(`users/${uid}`);
//         const userSnap = await userRef.get();

//         if (!userSnap.exists) {
//           res.status(403).json({ error: "User not found" });
//           return;
//         }

//         const user = userSnap.data();
//         const subscription = user?.subscription || "free";
//         const aiUsed = user?.aiUsed || 0;

//         const isPremium =
//           subscription === "basic" || subscription === "premium";

//         if (!isPremium && aiUsed >= 3) {
//           res.status(403).json({
//             error: "Free AI limit reached. Upgrade required.",
//           });
//           return;
//         }

//         const openai = new OpenAI({
//           apiKey: OPENAI_API_KEY.value(),
//         });

//         const finalPrompt = buildPrompt(prompt, type, extra);

//         let responseData = {};

//         /* ---------------- IMAGE ---------------- */
//         if (
//           ["image", "thumbnail", "banner", "ui-design", "realistic"].includes(type)
//         ) {
//           const result = await openai.images.generate({
//             model: "gpt-image-1",
//             prompt: finalPrompt,
//             size: "1024x1024",
//           });

//           const imageUrl = result.data?.[0]?.url || null;

//           if (!imageUrl) {
//             res.status(500).json({ error: "Image generation failed" });
//             return;
//           }

//           responseData = { type: "image", imageUrl };

//           await admin.firestore().collection("images").add({
//             imageUrl,
//             prompt,
//             type,
//             createdBy: uid,
//             createdAt: admin.firestore.FieldValue.serverTimestamp(),
//             likes: 0,
//             downloads: 0,
//           });
//         }

//         /* ---------------- TEXT / CODE / TRANSLATE ---------------- */
//         else {
//           const completion = await openai.chat.completions.create({
//             model: "gpt-4.1-mini",
//             messages: [
//               {
//                 role: "system",
//                 content:
//                   type === "code"
//                     ? "You are a senior developer."
//                     : "You are a helpful assistant.",
//               },
//               {
//                 role: "user",
//                 content: finalPrompt,
//               },
//             ],
//           });

//           const text =
//             completion.choices?.[0]?.message?.content || "";

//           responseData = { type: "text", text };

//           await admin.firestore().collection("ai_generations").add({
//             type,
//             prompt,
//             output: text,
//             uid,
//             createdAt: admin.firestore.FieldValue.serverTimestamp(),
//           });
//         }

//         /* ---------------- UPDATE USAGE ---------------- */
//         await userRef.update({
//           aiUsed: aiUsed + 1,
//         });

//         res.json(responseData);

//       } catch (err) {
//         console.error("AI ERROR:", err);
//         res.status(500).json({ error: "AI generation failed" });
//       }
//     });
//   }
// );