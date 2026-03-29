import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssets } from "../../services/assets/asset.query";

import {
  Eye,
  Heart,
  Download,
  UserPlus,
} from "lucide-react";

const ITEMS_PER_PAGE = 12; // you can change to 9 if needed

export default function Templates() {
  const [images, setImages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const res = await getAssets("latest");
      setImages(res.data || []);
    };
    load();
  }, []);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);

  const paginatedImages = images.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ---------------- DOWNLOAD ---------------- */
  const handleDownload = (img: any) => {
    const src =
      img.imagePath ||
      img.imageUrl ||
      img.url ||
      "";

    if (!src) return;

    const a = document.createElement("a");
    a.href = src;
    a.download = "image.png";
    a.click();
  };

  return (
    <section className="min-h-screen bg-slate-900 p-6 text-white">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Explore Templates</h1>
        <p className="text-slate-400 text-sm">
          Discover AI-generated images & download instantly
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">

        {paginatedImages.map((img) => {
          const isPremium =
            typeof img.price === "number" && img.price > 0;

          const imageSrc =
            img.imagePath ||
            img.imageUrl ||
            img.url ||
            "/fallback.png";

          return (
            <div
              key={img.id}
              className="relative rounded-xl overflow-hidden bg-black group cursor-pointer"
              onClick={() => navigate(`/image/${img.id}`)}
            >

              {/* IMAGE */}
              <img
                src={imageSrc}
                className="w-full h-56 object-cover transition duration-500 group-hover:scale-105"
              />

              {/* GRADIENT */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

              {/* PREMIUM */}
              {isPremium && (
                <div className="absolute top-2 left-2 z-30">
                  <span className="bg-yellow-400 text-black text-[10px] px-2 py-1 rounded-full font-bold">
                    ₹{img.price}
                  </span>
                </div>
              )}

              {/* FLOATING ICONS */}
              <div className="absolute top-2 right-2 flex flex-col gap-2 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100">

                {/* VIEW */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/image/${img.id}`);
                  }}
                  className="bg-black/60 backdrop-blur p-2 rounded-full"
                >
                  <Eye size={14} className="text-white" />
                </button>

                {/* LIKE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("like clicked");
                  }}
                  className="bg-black/60 backdrop-blur p-2 rounded-full"
                >
                  <Heart size={14} className="text-white" />
                </button>

                {/* DOWNLOAD */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(img);
                  }}
                  className="bg-black/60 backdrop-blur p-2 rounded-full"
                >
                  <Download size={14} className="text-white" />
                </button>

                {/* FOLLOW */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("follow clicked");
                  }}
                  className="bg-white text-black text-[10px] px-2 py-1 rounded-full flex items-center gap-1"
                >
                  <UserPlus size={12} />
                </button>
              </div>

              {/* CREATOR */}
              <div className="absolute bottom-2 left-2 flex items-center gap-2 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                <img
                  src={
                    img.creatorAvatar ||
                    `https://ui-avatars.com/api/?name=${img.creatorName || "User"}`
                  }
                  className="h-7 w-7 rounded-full border border-white"
                />
                <span className="text-xs text-white font-medium">
                  {img.creatorName || "Unknown"}
                </span>
              </div>

              {/* STATS */}
              <div className="absolute bottom-2 right-2 text-xs text-white z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                ❤️ {img.likes || 0} · ⬇ {img.downloads || 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-8 flex-wrap">

        {/* PREV */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 bg-white/10 rounded disabled:opacity-30"
        >
          Prev
        </button>

        {/* PAGE NUMBERS */}
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-white text-black"
                : "bg-white/10"
            }`}
          >
            {i + 1}
          </button>
        ))}

        {/* NEXT */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 bg-white/10 rounded disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </section>
  );
}