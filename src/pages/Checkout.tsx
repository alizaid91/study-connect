import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiService } from "../services/apiService";
import { Link } from "react-router-dom";

type PlanType = "1month" | "3months" | "6months";

interface Plan {
  id: PlanType;
  name: string;
  months: number;
  price: number;
  originalPrice: number;
  description: string;
}

const plans: Plan[] = [
  {
    id: "1month",
    name: "1 Month",
    months: 1,
    price: 99,
    originalPrice: 99,
    description: "Perfect if you want to try us for a short period.",
  },
  {
    id: "3months",
    name: "3 Months",
    months: 3,
    price: 267,
    originalPrice: 297,
    description: "Best for steady learners — save 10%",
  },
  {
    id: "6months",
    name: "6 Months",
    months: 6,
    price: 362,
    originalPrice: 594,
    description: "Commit & save 39% — best value",
  },
];

export const Checkout: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[0]);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState({
    percent: 0,
    value: 0,
  });
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponChecking, setCouponChecking] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState("");

  const subtotal = selectedPlan.price;
  const finalPrice = subtotal - discount.value;

  useEffect(() => {
    setAppliedCoupon(null);
    setDiscount({ percent: 0, value: 0 });
    setError("");
    setCoupon("");
  }, [selectedPlan]);

  const applyCoupon = async () => {
    if (!coupon.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    if (appliedCoupon && appliedCoupon === coupon.trim().toUpperCase()) {
      setError("Coupon already applied");
      return;
    }

    setError("");
    setCouponChecking(true);

    try {
      const data = await apiService.verifyCoupon(coupon);

      if (data.discountPercent && data.code) {
        const discountValue = Math.floor(
          (selectedPlan.price * data?.discountPercent) / 100
        );

        setDiscount({
          value: discountValue,
          percent: data.discountPercent,
        });
        setAppliedCoupon(data.code);
        setError("");
        setCoupon("");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid coupon code!");
    }

    setCouponChecking(false);
  };

  const removeCoupon = () => {
    setDiscount({
      value: 0,
      percent: 0,
    });
    setAppliedCoupon(null);
    setCoupon("");
    setError("");
  };

  async function handleContinueToPayment() {
    setPaymentProcessing(true);
    setError("");
    try {
      const resp = await apiService.createOrder(
        selectedPlan.id,
        appliedCoupon || undefined
      );
      // resp.orderId (razorpay order id), resp.amount (paise), resp.razorpayKeyId
      const options = {
        key: resp.razorpayKeyId,
        amount: resp.amount,
        currency: "INR",
        name: "Study Connect",
        description: `${selectedPlan.name} plan`,
        order_id: resp.orderId,
        handler: async function (paymentResult: any) {
          // Payment succeeded in client — optionally call backend confirm endpoint
          // but primary processing is via webhook. You can still update UI optimistically.
          console.log("Payment success (client):", paymentResult);
          // optional: call backend to mark immediate success or fetch updated profile
          // await apiService.postPaymentConfirmation(paymentResult)
        },
        prefill: {
          // you can prefill from user profile
          // name: user.displayName,
          // email: user.email
        },
        theme: {
          color: "#2563eb", // blue
        },
      };
      // @ts-ignore (Razorpay global)
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed", response);
        alert("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setPaymentProcessing(false);
    }
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 px-4">
        {/* LEFT - Plan Selection */}
        <motion.div
          className="bg-white rounded-3xl shadow-lg border w-full md:w-2/3 p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Study Connect Pro
          </h2>

          <label className="block text-sm font-medium mb-3 text-gray-600">
            Choose your plan
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = selectedPlan.id === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedPlan(plan)}
                  className={`cursor-pointer rounded-xl p-5 transition-all border ${
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      {plan.name}
                    </span>
                    {isSelected && (
                      <span className="text-blue-600 font-bold text-sm">✓</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    {plan.description}
                  </p>
                  <div className="mt-3 font-bold text-lg">
                    ₹{plan.price}.00
                    {plan.originalPrice > plan.price && (
                      <span className="text-gray-400 text-sm line-through ml-2">
                        ₹{plan.originalPrice}.00
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* RIGHT - Order Summary */}
        <motion.div
          className="bg-white rounded-3xl shadow-lg border w-full md:w-1/3 p-6 flex flex-col justify-between"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Order Summary
            </h3>

            <div className="flex justify-between text-sm mb-2 text-gray-700 font-semibold">
              <span>{selectedPlan.name} plan</span>
              <span>₹{subtotal}.00</span>
            </div>

            {discount.value > 0 && appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600 mb-2 items-center">
                <span>
                  Discount{" "}
                  <span className="font-semibold">
                    ({appliedCoupon} {discount.percent}%)
                  </span>
                  <button
                    className="ml-2 text-red-500 hover:underline text-xs"
                    onClick={removeCoupon}
                  >
                    Remove
                  </button>
                </span>
                <span className="font-semibold">-₹{discount.value}.00</span>
              </div>
            )}

            <div className="border-t my-4"></div>

            {/* Coupon Section */}
            <div className="mb-4">
              <button
                onClick={() => setShowCouponInput((prev) => !prev)}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                Have a coupon code?
              </button>

              {showCouponInput && (
                <>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Enter coupon"
                      className="border rounded-3xl px-3 py-2 col-span-2 focus:ring-2 focus:ring-blue-500"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-3xl hover:bg-blue-700 disabled:opacity-50"
                      onClick={applyCoupon}
                      disabled={couponChecking}
                    >
                      {couponChecking ? "Applying..." : "Apply"}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-2">{error}</p>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>₹{finalPrice}.00</span>
            </div>
          </div>

          <div>
            <button
              onClick={() => !paymentProcessing && !couponChecking && handleContinueToPayment()}
              disabled={paymentProcessing || couponChecking}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-3xl font-medium hover:bg-blue-700"
            >
              {paymentProcessing ? "Processing..." : "Continue to Payment"}
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              By continuing, you agree to our{" "}
              <Link to="/policies" className="text-blue-600 hover:underline">
                Terms & Conditions
              </Link>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
