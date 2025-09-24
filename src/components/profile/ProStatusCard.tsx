import { motion } from "framer-motion";
import { Crown, Calendar, Clock } from "lucide-react";

interface ProStatusCardProps {
  isPro: boolean;
  proExpiry: any; // Firestore Timestamp
  subscriptionType: "1month" | "3month" | "6month";
  updatedAt: any; // Firestore Timestamp
}

const ProStatusCard: React.FC<ProStatusCardProps> = ({
  isPro,
  proExpiry,
  subscriptionType,
  updatedAt,
}) => {
  if (!isPro || !proExpiry || !updatedAt) return null;

  // ✅ Convert Firestore Timestamp to JS Date
  const expiryDate = proExpiry.toDate();
  const updatedDate = updatedAt.toDate();

  // 🗓 Format dates in IST
  const formattedExpiry = expiryDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const formattedUpdated = updatedDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  // 📊 Progress calculation
  const totalDays =
    subscriptionType === "1month"
      ? 30
      : subscriptionType === "3month"
      ? 90
      : 180;

  const today = new Date();

  const usedDays = Math.floor(
    (today.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const remainingDays = Math.max(totalDays - usedDays, 0);
  const percentUsed = Math.min((usedDays / totalDays) * 100, 100);

  return (
    <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-white border border-yellow-200 rounded-2xl shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Crown className="h-5 w-5 text-yellow-600" />
        <h3 className="text-sm font-semibold text-yellow-700">
          Pro Subscription (
          {subscriptionType === "1month"
            ? "1 Month"
            : subscriptionType === "3month"
            ? "3 Months"
            : "6 Months"}
          )
        </h3>
      </div>

      {/* Expiry Info */}
      <div className="flex flex-col gap-1 text-sm text-gray-700 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          Expires on:{" "}
          <span className="font-medium text-gray-900">{formattedExpiry}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          Activated on:{" "}
          <span className="text-gray-800">{formattedUpdated}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Used: {usedDays} days</span>
          <span>Remaining: {remainingDays} days</span>
        </div>
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentUsed}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-yellow-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ProStatusCard;
