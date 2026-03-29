import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/auth/useAuth";
import { Sparkles, Upload } from "lucide-react";

export default function CTASection() {
  const { user, profile, loading } = useAuth();

  const getPrimaryCTA = () => {
    if (loading) return null;

    if (!user) {
      return {
        to: "/register",
        text: "Start Creating Free",
      };
    }

    if (profile?.role === "creator") {
      return {
        to: "/creator/dashboard",
        text: "Go to Dashboard",
      };
    }

    return {
      to: "/ai/generate",
      text: "Create with AI",
    };
  };

  const cta = getPrimaryCTA();

  return (
    <section className="relative overflow-hidden bg-slate-950 border-t border-slate-800 py-16 sm:py-20 text-white">

      {/* Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[90vw] max-w-[500px] -translate-x-1/2 rounded-full bg-pink-500/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">

        {/* HEADLINE */}
        <h2 className="mb-6 text-3xl sm:text-5xl font-extrabold leading-tight">
          Create, Explore & Earn with AI
          <br />
          <span className="bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
            All in One Platform
          </span>
        </h2>

        {/* SUBTEXT */}
        <p className="mx-auto mb-10 max-w-2xl text-slate-400 text-sm sm:text-base">
          Generate stunning visuals, discover new ideas, and earn from your creations.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          {cta && (
            <Link
              to={cta.to}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gradient-to-r from-pink-500 to-yellow-400 px-8 py-3 text-sm font-semibold text-black hover:opacity-90 transition"
            >
              <Sparkles size={16} />
              {cta.text}
            </Link>
          )}

          <Link
            to="/subscription?type=creator"
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-white/30 px-8 py-3 text-sm font-medium hover:bg-white/10 transition"
          >
            <Upload size={16} />
            Earn as Creator
          </Link>

        </div>

        {/* TRUST */}
        <p className="mt-6 text-xs text-slate-500">
          Free to start • No credit card required • Earn anytime
        </p>

      </div>
    </section>
  );
}