import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

type Creator = {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  bio: string;
  tags: string[];
};

export default function FeaturedCreators() {
  const navigate = useNavigate();

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCreators([
        {
          id: "1",
          name: "Neon Studio",
          avatar: "https://i.pravatar.cc/150?img=12",
          followers: 12000,
          bio: "Cyberpunk & neon AI visuals",
          tags: ["Cyberpunk", "Neon", "Dark"],
        },
        {
          id: "2",
          name: "PixelMind AI",
          avatar: "https://i.pravatar.cc/150?img=32",
          followers: 8000,
          bio: "Minimal & abstract AI art",
          tags: ["Minimal", "Abstract"],
        },
        {
          id: "3",
          name: "DarkForge",
          avatar: "https://i.pravatar.cc/150?img=45",
          followers: 5000,
          bio: "Fantasy & cinematic visuals",
          tags: ["Fantasy", "Dark"],
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const formatFollowers = (num: number) =>
    num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;

  return (
    <section className="bg-slate-950 py-16 border-t border-slate-800">

      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* HEADER */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            Top Creators
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Creators earning from AI designs • Join the community
          </p>
        </div>

        {/* GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[200px] rounded-3xl bg-slate-900 animate-pulse"
                />
              ))
            : creators.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-indigo-500 hover:shadow-xl transition group"
                >

                  {/* HEADER */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={c.avatar}
                      className="h-12 w-12 rounded-full ring-2 ring-indigo-500"
                    />

                    <div>
                      <h3 className="text-white font-semibold">
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Users size={12} />
                        {formatFollowers(c.followers)} followers
                      </p>
                    </div>
                  </div>

                  {/* BIO */}
                  <p className="text-sm text-slate-400 mb-4">
                    {c.bio}
                  </p>

                  {/* TAGS */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-white/10 px-2 py-1 rounded-md text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/creator/${c.id}`)}
                    className="w-full rounded-xl bg-white text-black text-sm font-semibold py-2 hover:bg-slate-200 transition"
                  >
                    View Profile
                  </button>
                </div>
              ))}
        </div>

        {/* 🔥 CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-white">
            Start earning with your AI designs
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Upload your creations and earn from downloads
          </p>

          <button
            onClick={() => navigate("/subscription?type=creator")}
            className="mt-6 rounded-xl bg-gradient-to-r from-pink-500 to-yellow-400 px-8 py-3 text-sm font-semibold text-black hover:opacity-90 transition"
          >
            Become a Creator 💰
          </button>
        </div>

      </div>
    </section>
  );
}