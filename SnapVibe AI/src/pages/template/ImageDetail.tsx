import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAssetById } from "../../services/assets/asset.query";
import { downloadAsset } from "../../services/downloads/download.action";

export default function ImageDetail() {
  const { id } = useParams();
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await getAssetById(id!);
      setImage(res);
    };
    load();
  }, [id]);

  if (!image) return null;

  return (
    <div className="p-6">

      <img
        src={image.imagePath}
        className="w-full max-w-xl mx-auto rounded-xl"
      />

      <h2 className="text-xl font-bold mt-4">
        {image.title}
      </h2>

      {/* DOWNLOAD */}
      <button
        className="mt-4 bg-black text-white px-6 py-2 rounded-xl"
        onClick={() => downloadAsset(image.id, "USER_ID")}
      >
        Download
      </button>

      {/* PREMIUM */}
      {image.price && (
        <button className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-xl">
          Buy Premium
        </button>
      )}
    </div>
  );
}