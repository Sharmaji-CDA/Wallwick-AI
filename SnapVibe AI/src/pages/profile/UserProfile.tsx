import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/auth/useAuth";
import { uploadAvatar } from "../../services/storage.service";
import { updateProfile } from "firebase/auth";
import ImageCard from "../../components/asset/AssetCard";
import { updateUserProfileData } from "../../services/user/user.service";
import { getAssetsByCreator } from "../../services/assets/asset.query";
import type { ImageItem } from "../../types/asset.type";
import EditProfileModal from "../../components/modals/EditProfilModal";

export default function UserProfile() {
  const { user, profile, refreshProfile } = useAuth();

  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const isCreator = profile?.role === "creator";

  useEffect(() => {
    if (!user) return;

    setName(profile?.displayName || user.displayName || "");
    setBio(profile?.bio || "");

    if (isCreator) {
      getAssetsByCreator(user.uid)
        .then(setImages)
        .catch((err) => {
          console.error("Failed to fetch assets:", err);
          setImages([]);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, profile, isCreator]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    if (!user) return;

    let photoURL = user.photoURL || "";

    try {
      if (photoFile) {
        photoURL = await uploadAvatar(photoFile, user.uid);
      }

      // ✅ FIXED
      await updateProfile(user, {
        displayName: name,
        photoURL,
      });

      await updateUserProfileData(user.uid, {
        displayName: name,
        bio,
        photoPath: photoURL,
      });

      await refreshProfile();
      setEditOpen(false);

    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* PROFILE HEADER */}
        <div className="rounded-3xl bg-white p-8 shadow-sm mb-12">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-6">
              <img
                src={
                  profile?.photoPath ||
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${name}`
                }
                className="h-24 w-24 rounded-full"
              />

              <div>
                <h1 className="text-2xl text-slate-600 font-bold">
                  {name}
                </h1>
                <p className="text-slate-500">
                  {user.email}
                </p>

                <span className="mt-2 inline-block px-3 py-1 text-xs rounded-full bg-slate-700 text-white">
                  {profile?.role?.toUpperCase()} • {profile?.subscription}
                </span>

                {bio && (
                  <p className="mt-2 text-sm text-slate-600">
                    {bio}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="px-6 py-3 rounded-xl bg-black text-white text-sm font-medium"
            >
              Edit Profile
            </button>

          </div>
        </div>

        {/* ROLE CONTENT */}
        {!isCreator ? (
          <NormalUserSection plan={profile?.subscription} />
        ) : (
          <CreatorSection images={images} loading={loading} />
        )}

        {/* MODAL */}
        {editOpen && (
          <EditProfileModal
            name={name}
            bio={bio}
            setName={setName}
            setBio={setBio}
            setPhotoFile={setPhotoFile}
            onClose={() => setEditOpen(false)}
            onSave={handleSaveProfile}
          />
        )}

      </div>
    </section>
  );
}


/* ================= SECTIONS ================= */

function NormalUserSection({ plan }: { plan?: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Account Overview
      </h2>

      <p className="text-slate-600">
        You are on the <b>{plan?.toUpperCase()}</b> plan.
      </p>

      <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl">
        Upgrade to Creator
      </button>
    </div>
  );
}

function CreatorSection({
  images,
  loading,
}: {
  images: ImageItem[];
  loading: boolean;
}) {
  if (loading) return <div>Loading uploads...</div>;

  return (
    <>
      <h2 className="text-xl font-semibold mb-6">
        Your Uploads
      </h2>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <ImageCard 
            key={img.id} 
            {...img}
            price={img.price ?? undefined}
            imageUrl={img.imagePath}
            likes={0}
            downloads={0}
          />
        ))}
      </div>
    </>
  );
}