import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useAuth } from "../../contexts/auth/useAuth";
import { useNavigate } from "react-router-dom";
import {
  fetchPlansByAccountType,
  type AccountType,
} from "../../services/subscription/subscription.service";

/* ================= TYPES ================= */

type Plan = {
  id: string;
  name: string;
  price: number;
  features: string[];
  revenuePercentage?: number;
};

export default function Subscription() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<AccountType>("user");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= POPUP ================= */

  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowPopup(true);
    }, 500);
    const hideTimer = setTimeout(() => {
      setShowPopup(false);
    }, 10500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  /* ================= LOAD PLANS ================= */

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const data = await fetchPlansByAccountType(activeTab);
        setPlans(data);
      } catch (error) {
        console.error("Plan fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [activeTab]);

  /* ================= HANDLE UPGRADE ================= */

  const handleUpgrade = (planName: string) => {
    if (!user) {
      navigate(
        `/login?redirect=/upgrade?plan=${planName}&type=${activeTab}`
      );
      return;
    }

    navigate(`/upgrade?plan=${planName}&type=${activeTab}`);
  };

  const isUserOnThisTab =
    profile?.role === activeTab;

  /* ================= UI ================= */

  return (
    <>
      {/* ✅ POPUP */}
      {showPopup && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] animate-fadeInDown">
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-xl text-sm flex items-center gap-2">
            🚀 New features & priority upgrades coming soon. Enjoy early access!
          </div>
        </div>
      )}

      <section className="relative bg-gradient-to-b from-white to-slate-100 py-14">
        <div className="mx-auto max-w-6xl px-6">

          {/* HEADER */}
          <div className="mb-16 text-center">
            <p className="text-xs uppercase tracking-widest text-indigo-500 mb-3">
              Pricing
            </p>

            <h1 className="text-4xl font-extrabold text-slate-900">
              Grow with SnapVibe<span className="text-indigo-500">AI</span>
            </h1>

            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              {activeTab === "creator"
                ? "Sell AI wallpapers and earn from every download."
                : "Unlock premium visuals and remove limits."}
            </p>
          </div>

          {/* TABS */}
          <div className="mb-10 flex justify-center">
            <div className="grid w-[360px] grid-cols-2 gap-2 rounded-full bg-slate-200/40 p-1">

              {(["creator", "user"] as AccountType[]).map((type) => {
                const isActive = activeTab === type;

                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`rounded-full py-2 text-sm font-medium ${
                      isActive
                        ? "bg-black text-white"
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {type === "creator"
                      ? "Creator Plans"
                      : "User Plans"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid gap-8 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-white p-8 shadow-sm">
                  <Skeleton className="h-6 w-24 mb-6" />
                  <Skeleton className="h-10 w-32 mb-6" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">

              {plans.map((plan) => {
                const isCurrent =
                  isUserOnThisTab &&
                  profile?.subscription === plan.name;

                const isPopular =
                  plan.name === "premium" || plan.name === "pro";

                const hasTrial = plan.price > 0;

                // ✅ ORIGINAL PRICE LOGIC
                const originalPrice =
                  plan.name === "basic"
                    ? 299
                    : plan.name === "premium"
                    ? 699
                    : null;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-8 flex flex-col justify-between ${
                      isCurrent
                        ? "bg-black text-white"
                        : plan.name === "premium"
                        ? "bg-white text-slate-900 shadow-xl border-2 border-indigo-500 scale-105"
                        : "bg-white text-slate-900 shadow-sm hover:shadow-xl"
                    }`}
                  >
                    {/* POPULAR */}
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs px-4 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}

                    {/* 🔥 OFFER TAGS (E-COMMERCE STYLE) */}
                    <div className="flex gap-2 mb-4 flex-wrap">

                      {/* 🔥 DISCOUNT */}
                      {originalPrice && (
                        <span className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md animate-pulse">
                          {Math.round(((originalPrice - plan.price) / originalPrice) * 100)}% OFF
                        </span>
                      )}

                      {/* 🎁 TRIAL */}
                      {hasTrial && (
                        <span className="bg-white/70 backdrop-blur-md text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200 shadow-sm hover:shadow-md transition">
                          🎁 1 Month Free
                        </span>
                      )}

                    </div>

                    <div>
                      <h2 className="text-xl font-bold capitalize">
                        {plan.name}
                      </h2>

                      {/* PRICE */}
                      <p className="my-6 text-4xl font-extrabold flex items-center gap-2">

                        {originalPrice && (
                          <span className="text-lg text-slate-400 line-through">
                            ₹{originalPrice}
                          </span>
                        )}

                        <span>
                          {plan.price === 0 ? "Free" : `₹${plan.price}`}
                        </span>

                        {plan.price !== 0 && (
                          <span className="ml-2 text-base text-slate-400">
                            / month
                          </span>
                        )}
                      </p>

                      {/* TRIAL TEXT */}
                      {hasTrial && (
                        <p className="text-xs text-indigo-600 font-medium -mt-4 mb-4">
                          🎁 Includes 30-day free trial
                        </p>
                      )}

                      {/* FEATURES */}
                      <ul className="mb-8 space-y-2 text-sm">
                        {plan.features.map((feature, i) => (
                          <li key={i}>✓ {feature}</li>
                        ))}

                        {!isCurrent && (
                          <li className="text-xs text-slate-400">
                            🔒 HD downloads & unlimited access
                          </li>
                        )}
                      </ul>

                      {/* CREATOR */}
                      {activeTab === "creator" &&
                        plan.revenuePercentage && (
                          <div className="mb-6 text-xs text-slate-500">
                            Earn {plan.revenuePercentage}% per sale
                          </div>
                        )}
                    </div>

                    {/* BUTTON */}
                    <Button
                      label={
                        isCurrent
                          ? "Current Plan"
                          : plan.price === 0
                          ? "Start Free"
                          : hasTrial
                          ? "Start Free Trial"
                          : "Upgrade Now"
                      }
                      fullWidth
                      disabled={isCurrent}
                      onClick={() => handleUpgrade(plan.name)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center text-xs text-slate-500">
            Secure UPI payments • Fast activation • Cancel anytime
          </div>

        </div>
      </section>
    </>
  );
}