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

  /* ---------------- LIMIT ---------------- */
  const dailyLimit = (() => {
    if (!profile) return 0;

    if (profile.role === "creator") {
      return profile.subscription === "premium" ? 500 : 50;
    }

    if (profile.subscription === "standard") return 100;
    if (profile.subscription === "basic") return 20;

    return 3; // free
  })();

  const shouldWatermark =
    profile?.subscription === "free" ||
    profile?.subscription === "basic";

  /* ---------------- HELPERS ---------------- */
  const clearProgressTimers = () => {
    progressTimers.current.forEach(clearTimeout);
    progressTimers.current = [];
  };

  const detectType = (prompt: string) => {
    const p = prompt.toLowerCase();

    if (p.includes("translate")) return "translate";
    if (p.includes("format")) return "format";
    if (p.includes("code")) return "code";
    if (p.includes("solve")) return "solve";
    if (p.includes("explain") || p.includes("tell") || p.includes("what is"))
      return "text";

    return "image";
  };

  /* ---------------- GENERATE ---------------- */
  const handleGenerate = async (prompt: string) => {
    if (loading) return;

    if (!user) {
      navigate("/register");
      return;
    }

    if (!profile) return;

    // 🔥 LIMIT CHECK
    if (profile.aiUsed >= dailyLimit) {
      setError("⚡ Daily limit reached. Upgrade to continue generating.");
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

      const type = detectType(prompt);

      const result = await generateAI(prompt, user.uid, type);

      // Reset previous state
      setImageUrl("");
      setTextResult("");

      if (result.type === "image" && result.imageUrl) {
        setImageUrl(result.imageUrl);
      } else if (result.type === "text" && result.text) {
        setTextResult(result.text);
      } else {
        throw new Error("Invalid AI response");
      }

      setProgressText("");

      // ✅ ONLY refresh (backend already increments)
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

    if (shouldWatermark) {
      setError("Download without watermark requires upgrade.");
      return;
    }

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "ai-image.png";
    link.click();
  };

  return (
    <div className="mx-auto max-w-xl py-20 px-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            AI Generator
          </h1>
          <p className="text-sm text-gray-500">
            Generate images, text, code & more
          </p>
        </div>

        {/* USAGE */}
        {profile && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>Daily usage</span>
            <span className="font-medium text-gray-700">
              {profile.aiUsed} / {dailyLimit}
            </span>
          </div>
        )}

        {/* LIMIT UI */}
        {profile && profile.aiUsed >= dailyLimit && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            ⚡ You've reached today's limit.
            <button
              onClick={() => navigate("/subscription")}
              className="ml-2 font-semibold underline"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* PROMPT BOX */}
        <AIPromptBox
          onSubmit={handleGenerate}
          placeholder="Describe anything (image, code, translate...)"
          buttonText="Generate"
          loading={loading}
        />

        {/* ERROR */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* OUTPUT */}
        <AIHelper loading={loading} error={""}>

          {!loading && !imageUrl && !textResult && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
              Your result will appear here
            </div>
          )}

          {progressText && (
            <p className="text-sm text-gray-500 italic">
              {progressText}
            </p>
          )}

          {/* IMAGE RESULT */}
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

              {shouldWatermark && (
                <div className="rounded-xl bg-yellow-50 border p-3 text-sm text-yellow-700">
                  Download without watermark + unlock more AI usage
                  <button
                    onClick={() => navigate("/subscription")}
                    className="ml-2 underline font-semibold"
                  >
                    Upgrade
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TEXT RESULT */}
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