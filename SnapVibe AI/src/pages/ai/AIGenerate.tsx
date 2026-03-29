import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateAI } from "../../services/ai.service";
import AIPromptBox from "../../components/ai/AIPromptBox";
import AIHelper from "../../components/ai/AIHelper";
import { useAuth } from "../../contexts/auth/useAuth";

export default function AIGenerate() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [textResult, setTextResult] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [progressText, setProgressText] = useState("");

  const progressTimers = useRef<number[]>([]);

  /* ---------------- PLAN + LIMIT ---------------- */

  const plan = profile?.subscription || "free";

  const dailyLimit = (() => {
    if (!profile) return 0;

    if (profile.role === "creator") {
      return plan === "pro" ? 500 : 50;
    }

    if (plan === "premium") return 500;
    if (plan === "basic") return 20;

    return 3; // free
  })();

  /* 🔥 unified usage */
  const usage = (profile?.aiImageUsed || 0) + (profile?.aiTextUsed || 0);

  const shouldWatermark = plan === "free" || plan === "basic";

  /* ---------------- HELPERS ---------------- */

  const clearProgressTimers = () => {
    progressTimers.current.forEach(clearTimeout);
    progressTimers.current = [];
  };

  // const detectType = (prompt: string) => {
  //   const p = prompt.toLowerCase();

  //   if (p.includes("translate")) return "translate";
  //   if (p.includes("format")) return "format";
  //   if (p.includes("code")) return "code";
  //   if (p.includes("solve")) return "solve";
  //   if (p.includes("explain") || p.includes("what is")) return "text";

  //   return "image";
  // };

  /* ---------------- GENERATE ---------------- */

  const handleGenerate = async (prompt: string) => {
    if (loading) return;

    if (!user) {
      navigate("/register");
      return;
    }

    if (!profile) return;

    /* 🔥 LIMIT CHECK */
    if (usage >= dailyLimit) {
      setError("⚡ Daily limit reached. Upgrade to continue.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setLastPrompt(prompt);
      setProgressText("Understanding prompt...");
      setImageUrl("");
      setTextResult("");

      clearProgressTimers();

      progressTimers.current.push(
        window.setTimeout(() => setProgressText("Generating..."), 700),
        window.setTimeout(() => setProgressText("Finalizing..."), 1400)
      );

      // const type = detectType(prompt);

      const result = await generateAI(prompt, user.uid);

      if (result.type === "image" && result.imageUrl) {
        setImageUrl(result.imageUrl);
      } else if (result.type === "text" && result.text) {
        setTextResult(result.text);
      } else {
        throw new Error("Invalid AI response");
      }

      setProgressText("");

      /* 🔥 refresh usage */
      await refreshProfile();

    } catch (e: any) {
      setError(e.message || "Failed to generate");
    } finally {
      clearProgressTimers();
      setLoading(false);
    }
  };

  /* ---------------- DOWNLOAD ---------------- */

  const handleDownload = () => {
    if (!imageUrl) return;

    /* 🔒 restrict free users */
    if (shouldWatermark) {
      navigate("/subscription");
      return;
    }

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "ai-image.png";
    link.click();
  };

  return (
    <div className="mx-auto max-w-xl py-20 px-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-xl font-bold">AI Generator</h1>
          <p className="text-sm text-gray-500">
            Generate images, text, code & more
          </p>
        </div>

        {/* USAGE */}
        {profile && (
          <div className="flex justify-between text-sm">
            <span>Daily usage</span>
            <span className="font-medium">
              {usage} / {dailyLimit}
            </span>
          </div>
        )}

        {/* LIMIT UI */}
        {usage >= dailyLimit && (
          <div className="rounded-xl bg-red-50 border p-4 text-sm text-red-600">
            ⚡ Limit reached.
            <button
              onClick={() => navigate("/subscription")}
              className="ml-2 underline font-semibold"
            >
              Upgrade
            </button>
          </div>
        )}

        {/* PROMPT */}
        <AIPromptBox
          onSubmit={handleGenerate}
          placeholder="Describe anything..."
          buttonText="Generate"
          loading={loading}
        />

        {/* ERROR */}
        {error && (
          <div className="rounded-xl bg-red-50 border p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* OUTPUT */}
        <AIHelper loading={loading} error={""}>

          {progressText && (
            <p className="text-sm text-gray-500 italic">
              {progressText}
            </p>
          )}

          {/* IMAGE */}
          {imageUrl && (
            <div className="space-y-3">

              <div className="relative">
                <img src={imageUrl} className="rounded-xl border" />

                {shouldWatermark && (
                  <div className="absolute inset-0 flex justify-end p-2 text-white font-bold">
                    SnapVibe AI
                  </div>
                )}
              </div>

              <button
                onClick={handleDownload}
                className="rounded-lg bg-black text-white px-4 py-2 text-sm"
              >
                Download
              </button>

            </div>
          )}

          {/* TEXT */}
          {textResult && (
            <div className="rounded-xl bg-gray-900 text-white p-4 text-sm whitespace-pre-wrap">
              {textResult}
            </div>
          )}

        </AIHelper>

        {/* RETRY */}
        {error && lastPrompt && (
          <button
            onClick={() => handleGenerate(lastPrompt)}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Retry
          </button>
        )}

      </div>
    </div>
  );
}