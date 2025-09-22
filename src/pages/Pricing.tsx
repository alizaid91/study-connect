import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/index";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UpgradeToPremiumButton } from "../components/buttons/UpgradeToPremiumButton";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type Feature = {
  name: string;
  availableForFree: {
    isAvailable: boolean;
    quota?: number;
  };
  availableForPro: {
    isAvailable: boolean;
    quota?: number;
  };
};

const features: Feature[] = [
  {
    name: "PYQ Papers",
    availableForFree: {
      isAvailable: true,
    },
    availableForPro: {
      isAvailable: true,
    },
  },
  {
    name: "Solved Papers",
    availableForFree: {
      isAvailable: false,
    },
    availableForPro: {
      isAvailable: true,
    },
  },
  {
    name: "Study Resources",
    availableForFree: {
      isAvailable: true,
    },
    availableForPro: {
      isAvailable: true,
    },
  },
  {
    name: "Download PYQs and Resources PDFs",
    availableForFree: {
      isAvailable: false,
    },
    availableForPro: {
      isAvailable: true,
    },
  },
  {
    name: "Premium Study Resources",
    availableForFree: {
      isAvailable: false,
    },
    availableForPro: {
      isAvailable: true,
    },
  },
  {
    name: "Task Boards",
    availableForFree: {
      isAvailable: true,
      quota: 2,
    },
    availableForPro: {
      isAvailable: true,
      quota: 5,
    },
  },
  {
    name: "AI Chats",
    availableForFree: {
      isAvailable: true,
      quota: 2,
    },
    availableForPro: {
      isAvailable: true,
      quota: 10,
    },
  },
  {
    name: "AI Prompts/day",
    availableForFree: {
      isAvailable: true,
      quota: 5,
    },
    availableForPro: {
      isAvailable: true,
      quota: 50,
    },
  },
  {
    name: "Buy Extra AI Credits",
    availableForFree: {
      isAvailable: true,
    },
    availableForPro: {
      isAvailable: true,
    },
  },
  {
    name: "Super Fast AI Responses",
    availableForFree: {
      isAvailable: false,
    },
    availableForPro: {
      isAvailable: true,
    },
  },
  {
    name: "Priority Support",
    availableForFree: {
      isAvailable: false,
    },
    availableForPro: {
      isAvailable: true,
    },
  },
];

const Pricing = () => {
  const { user, profile } = useSelector((state: RootState) => state.auth);

  const faqs = [
    {
      question: "What happens if I reach my daily AI limit?",
      answer:
        "You can buy extra AI credits anytime, or upgrade to Premium for higher daily limits.",
    },
    {
      question: "Can I cancel Pro anytime?",
      answer:
        "Yes — you can manage or cancel your subscription anytime in your account settings.",
    },
    {
      question: "Will more features be added to Pro?",
      answer:
        "Yes — we are constantly improving Study Connect and Pro users will always get early access to new features.",
    },
  ];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const cardVariants = {
    hover: { scale: 1.01, transition: { duration: 0.1 } },
  };

  const renderFeatureList = (planType: "free" | "pro", features: Feature[]) =>
    features.map((feature, idx) => (
      <li key={idx} className="flex items-center gap-2">
        {planType === "free" && !feature.availableForFree.isAvailable ? (
          <FaTimesCircle className="text-red-500 mt-0.5 flex-shrink-0" />
        ) : (planType === "pro" && feature.availableForPro.isAvailable) ||
          (planType === "free" && feature.availableForFree.isAvailable) ? (
          <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
        ) : null}
        <span className="font-medium text-gray-900">
          {planType === "free"
            ? feature.availableForFree.quota
            : feature.availableForPro.quota}{" "}
          {feature.name}
        </span>
      </li>
    ));

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen py-12 px-6">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Upgrade Your Plan
        </h1>
        <p className="mt-3 text-sm md:text-md text-gray-600 max-w-2xl mx-auto">
          Unlock AI-powered tools and resources designed to supercharge your
          studies.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className={`${
            profile?.role === "free"
              ? "border-2 border-indigo-600 shadow-lg"
              : "border border-gray-200"
          } bg-white rounded-3xl p-6 transition flex flex-col justify-between`}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Free</h2>
            <p className="mt-1 text-gray-500 text-lg">₹0</p>
            <ul className="mt-6 space-y-3">
              {renderFeatureList("free", features)}
            </ul>
          </div>
          {!user ? (
            <Link to="/auth#signup">
              <button className="mt-6 w-full rounded-3xl border border-indigo-600 text-indigo-600 px-4 py-2.5 font-medium hover:bg-indigo-50 transition">
                Sign Up
              </button>
            </Link>
          ) : profile?.role === "free" ? (
            <div className="mt-6 w-full rounded-3xl border border-indigo-600 text-indigo-600 px-4 py-2.5 font-medium text-center">
              Current Plan
            </div>
          ) : null}
        </motion.div>

        {/* Premium Plan */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className={`${
            profile?.role === "premium"
              ? "border-2 border-indigo-600 shadow-lg"
              : "border border-gray-200"
          } bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-3xl p-6 transition flex flex-col justify-between`}
        >
          <div>
            <h2 className="text-2xl font-bold text-indigo-800">Pro</h2>
            <p className="mt-1 text-indigo-700 text-lg">₹99</p>
            <ul className="mt-6 space-y-3">
              {renderFeatureList("pro", features)}
            </ul>
          </div>
          {!user ? (
            <UpgradeToPremiumButton
              text="Login to Continue with Premium"
              extraClasses="mt-6"
            />
          ) : profile?.role === "premium" ? (
            <div className="mt-6 w-full rounded-3xl border border-indigo-600 text-indigo-600 px-4 py-2.5 font-medium text-center">
              Current Plan
            </div>
          ) : (
            <UpgradeToPremiumButton extraClasses="mt-12" />
          )}
        </motion.div>
      </div>

      {/* Benefits Section */}
      <div className="mt-16 max-w-4xl mx-auto text-center border border-gray-200 bg-white rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900">Why go Pro?</h3>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto">
          More boards, more AI chats, faster responses — get the full power of
          Study Connect for your success.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-4 mt-16 bg-gray-50 rounded-2xl py-8 px-4">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Frequently Asked Questions
        </h1>
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <motion.button
              onClick={() => toggleFaq(index)}
              className="w-full p-5 flex items-center justify-between focus:outline-none"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            >
              <h3 className="text-base md:text-lg font-semibold text-left">
                {faq.question}
              </h3>
              <motion.svg
                animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </motion.button>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: openFaqIndex === index ? "auto" : 0,
                opacity: openFaqIndex === index ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-5 pt-0 text-gray-600">{faq.answer}</div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      {!user ||
        (profile?.role === "free" && (
          <div className="mt-16 max-w-4xl mx-auto text-center border border-gray-200 bg-white rounded-2xl p-8 flex flex-col items-center">
            <p className="text-gray-700 text-lg font-bold">
              Ready to unlock the full power of Study Connect?
            </p>
            <UpgradeToPremiumButton extraClasses="max-w-fit mt-4" />
          </div>
        ))}
    </div>
  );
};

export default Pricing;
