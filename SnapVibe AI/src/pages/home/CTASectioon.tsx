import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function CTASection() {
  const { user, profile, loading } = useAuth();

  const getPrimaryCTA = () => {
    if (loading) return null;

    if (!user) {
      return {
        to: "/register",
        text: "Start Free Today →",
      };
    }

    if (profile?.accountType === "creator") {
      return {
        to: "/creator/dashboard",
        text: "Open Creator Dashboard →",
      };
    }

    return {
      to: "/gallery",
      text: "Explore Premium Wallpapers →",
    };
  };

  const cta = getPrimaryCTA();

  return (
    <section className="relative overflow-hidden bg-slate-950 border-t border-slate-800 py-14 sm:py-20 lg:py-24 text-white">

      {/* Subtle glow (ONLY bottom CTA, not everywhere) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[90vw] max-w-[400px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">

        <h2 className="mb-6 text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
          Discover Premium AI Wallpapers
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            or Start Selling Yours
          </span>
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed">
          Buy exclusive mobile wallpapers from creators starting at ₹10
          or generate your own with AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">

          {cta && (
            <Link
              to={cta.to}
              className="w-full sm:w-auto rounded-xl bg-white px-6 sm:px-10 py-3 sm:py-4 text-sm font-semibold text-black transition hover:scale-105 hover:shadow-xl"
            >
              {cta.text}
            </Link>
          )}

          <Link
            to="/subscription?type=creator"
            className="w-full sm:w-auto rounded-xl border border-white/30 px-6 sm:px-10 py-3 sm:py-4 text-sm font-medium transition hover:bg-white/10"
          >
            Become a Creator
          </Link>

        </div>

        <p className="mt-6 text-xs text-slate-500">
          No upfront cost • Earn from every download • Cancel anytime
        </p>

      </div>
    </section>
  );
}