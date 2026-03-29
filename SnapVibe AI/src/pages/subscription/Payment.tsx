import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth/useAuth";
import { useState, useEffect } from "react";
import { PLANS } from "../../config/plan";
import { createPaymentRequest } from "../../services/payments/payment.service";
import type { AccountType } from "../../services/subscription/subscription.service";

export default function Upgrade() {

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [utr, setUtr] = useState("");

  // ✅ PARAMS
  const planParam = params.get("plan");
  const typeParam = params.get("type");
  const imageId = params.get("imageId");

  const validPlans = ["basic", "pro", "premium"];
  const validTypes = ["user", "creator"] as const;

  const plan = validPlans.includes(planParam || "") ? planParam! : "basic";
  const type: AccountType = validTypes.includes(typeParam as AccountType)
  ? (typeParam as AccountType)
  : "user";

  const isImagePurchase = Boolean(imageId);

  // ✅ PRICE
  let price = 0;

  if (isImagePurchase) {
    price = 20;
  } else {
    price = PLANS?.[type]?.[plan] ?? 0;
  }

  const UPI_ID = "ashutoshsharma27084@dbs";
  const WHATSAPP = "918586027084";

  // ✅ AUTH CHECK
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  // ✅ WHATSAPP MESSAGE
  const whatsappMessage = encodeURIComponent(`
🧾 Payment Confirmation

Type: ${isImagePurchase ? "Image Purchase" : "Subscription"}

Account Type: ${type}
Plan: ${plan}

ImageId: ${imageId || "N/A"}

Amount: ₹${price}

UTR: ${utr}

Email: ${user.email}
UID: ${user.uid}
`);

  // ✅ SUBMIT
  const submitRequest = async () => {
    try {
      if (!user?.uid || !user?.email) {
        throw new Error("User email missing");
      }

      if (!utr || utr.length < 8) {
        alert("Enter valid UTR / Transaction ID");
        return;
      }

      setSubmitting(true);

      // 🔥 FIREBASE SAVE
      await createPaymentRequest({
        uid: user.uid,
        email: user.email,
        accountType: type,
        plan: plan,
        imageId: imageId || null,
        requestType: isImagePurchase ? "image_purchase" : "subscription",
        amount: price,
        utr, // ✅ IMPORTANT
      });

      // 🔥 WHATSAPP AUTO OPEN
      window.open(
        `https://wa.me/${WHATSAPP}?text=${whatsappMessage}`,
        "_blank"
      );

      alert("Payment submitted for verification");
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6">

        <h1 className="text-xl text-gray-800 font-bold text-center">
          {isImagePurchase ? "Buy Premium Image" : `Upgrade to ${plan}`}
        </h1>

        <div className="text-center">
          <p className="text-gray-500">Amount</p>
          <p className="text-3xl font-bold text-indigo-600">₹{price}</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Pay via UPI</p>
          <p className="font-semibold text-gray-800">{UPI_ID}</p>
        </div>

        {/* ✅ UTR INPUT */}
        <input
          type="text"
          placeholder="Enter UTR / Transaction ID"
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <a
          href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          className="block text-center bg-green-500 text-white py-3 rounded-xl"
        >
          Confirm on WhatsApp
        </a>

        <button
          onClick={submitRequest}
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl"
        >
          {submitting ? "Submitting..." : "I've Paid"}
        </button>

      </div>

    </div>
  );
}