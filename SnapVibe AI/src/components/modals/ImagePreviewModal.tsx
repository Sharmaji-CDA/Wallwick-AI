import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth/useAuth";
import type { ImageItem } from "../../types/asset.type";

type Props = {
  image: ImageItem;
  onClose: () => void;
  onLike: () => void;
  isLiked: boolean;
};

export default function ImagePreviewModal({
  image,
  onClose,
  onLike,
  isLiked,
}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPremium = typeof image.price === "number" && image.price > 0;

  // ESC close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDownload = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // PREMIUM IMAGE → GO TO PAYMENT
    if (isPremium) {
      navigate(`/upgrade?imageId=${image.id}&type=user`);
      return;
    }

    // FREE IMAGE DOWNLOAD
    try {
      const response = await fetch(image.imagePath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${image.title.replace(/\s+/g, "-")}.jpg`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="relative flex flex-col md:grid md:grid-cols-2 bg-slate-900">

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-white/70 hover:text-white z-20"
      >
        ✕
      </button>

      {/* IMAGE */}
      <div className="bg-black flex items-center justify-center p-4">
        <img
          src={image.imagePath}
          alt={image.title}
          className="w-full max-h-[70vh] object-contain rounded-xl"
        />
      </div>

      {/* INFO */}
      <div className="flex flex-col justify-between p-6 text-white">

        <div>
          <h2 className="text-xl md:text-2xl font-bold">
            {image.title}
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            by {image.creatorName}
          </p>

          <div className="mt-6 flex items-center gap-6 text-sm flex-wrap">

            <button
              onClick={onLike}
              className={`transition ${
                isLiked ? "text-red-400" : "hover:text-white"
              }`}
            >
              ❤️ {image.likes}
            </button>

            <span>⬇ {image.downloads}</span>

            {isPremium && (
              <span className="rounded-xl border border-yellow-400 px-4 py-1 text-sm text-yellow-300">
                ₹{image.price}
              </span>
            )}
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="mt-8">
          <button
            onClick={handleDownload}
            className="w-full rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-600 transition"
          >
            {isPremium ? `Buy for ₹${image.price}` : "Download"}
          </button>
        </div>

      </div>
    </div>
  );
}