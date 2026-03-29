import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Search, Upload } from "lucide-react";

const steps = [
  {
    id: "1",
    title: "Explore",
    desc: "Browse trending AI designs created by the community.",
    icon: Search,
    actionText: "Browse Designs",
    actionLink: "/gallery",
  },
  {
    id: "2",
    title: "Create",
    desc: "Generate your own visuals using AI in seconds.",
    icon: Sparkles,
    actionText: "Start Creating",
    actionLink: "/ai/generate",
  },
  {
    id: "3",
    title: "Earn",
    desc: "Upload your creations and earn from downloads.",
    icon: Upload,
    actionText: "Become Creator",
    actionLink: "/subscription?type=creator",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  const [active, setActive] = useState("2"); // 🔥 default focus on CREATE

  const currentStep = steps.find((s) => s.id === active);

  return (
    <section className="bg-slate-950 py-16 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* HEADER */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            How It Works
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Explore → Create → Earn with AI
          </p>
        </div>

        {/* STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">

          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = active === s.id;

            return (
              <div
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`relative cursor-pointer rounded-3xl p-6 text-left transition-all duration-300 border
                ${
                  isActive
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-xl scale-[1.03]"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600"
                }`}
              >

                {/* STEP NUMBER */}
                <div className="absolute top-4 right-4 text-xs text-slate-400">
                  0{index + 1}
                </div>

                {/* ICON */}
                <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-xl bg-white/10">
                  <Icon size={20} />
                </div>

                {/* TITLE */}
                <h3 className="text-lg font-semibold mb-2">
                  {s.title}
                </h3>

                {/* DESC */}
                <p className="text-sm leading-relaxed">
                  {s.desc}
                </p>

                {/* INLINE CTA */}
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(s.actionLink);
                    }}
                    className="mt-4 text-xs font-semibold underline"
                  >
                    {s.actionText} →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* MAIN CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate(currentStep?.actionLink || "/")}
            className="rounded-xl bg-gradient-to-r from-pink-500 to-yellow-400 px-8 py-3 text-sm font-semibold text-black hover:opacity-90 transition"
          >
            {currentStep?.actionText}
          </button>

          <p className="mt-4 text-xs text-slate-500">
            Start free • No credit card required
          </p>
        </div>

      </div>
    </section>
  );
}