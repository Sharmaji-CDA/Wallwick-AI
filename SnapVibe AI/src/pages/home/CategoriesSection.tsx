import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function CategoriesSection() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCategories([
        "Minimal",
        "Dark",
        "Cyberpunk",
        "Anime",
        "Abstract",
        "Festival",
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <section className="relative overflow-hidden mx-auto max-w-7xl bg-slate-900 px-4 sm:px-6 py-12 sm:py-16">

      {/* Subtle background depth */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[200px] w-[90vw] max-w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Explore by Style
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Discover premium wallpapers curated by creators
        </p>
      </div>

      {/* Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => navigate(`/gallery?category=${cat}`)}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 min-h-[80px] text-center transition hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-white group-hover:text-indigo-400">
                {cat}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                View Collection →
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}