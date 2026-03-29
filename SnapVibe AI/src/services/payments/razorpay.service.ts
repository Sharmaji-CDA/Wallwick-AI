export const openRazorpay = ({
  amount,
  user,
  onSuccess,
}: {
  amount: number;
  user: any;
  onSuccess: (paymentId: string) => void;
}) => {

  const options = {
    key: "YOUR_KEY_ID",
    amount: amount * 100, // ₹ to paise
    currency: "INR",
    name: "Your App",
    description: "Upgrade Plan",

    handler: function (response: any) {
      onSuccess(response.razorpay_payment_id);
    },

    prefill: {
      email: user.email,
    },

    theme: {
      color: "#6366f1",
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};