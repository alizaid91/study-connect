import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import ProStatusCard from "./ProStatusCard";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { UpgradeToPremiumButton } from "../buttons/UpgradeToPremiumButton";

const UsageTracker = () => {
  const { profile } = useSelector((state: RootState) => state.auth);
  const plan = profile?.role || "free";
  const dailyAiPrompts = profile?.quotas?.promptsPerDay || 0;
  const usedAiPrompts = profile?.usage.aiPromptUsage?.count || 0;
  const extraCredits = profile?.quotas.aiCredits;
  const percentUsed = {
    aiPrompts: Math.min((usedAiPrompts / dailyAiPrompts) * 100, 100),
    chatSessions: Math.min(
      ((profile?.usage.chatSessionCount || 0) /
        (profile?.quotas.chatSessions as number)) *
        100,
      100
    ),
    boards: Math.min(
      ((profile?.usage.boardCount || 0) /
        (profile?.quotas.taskBoards as number)) *
        100,
      100
    ),
  };

  return (
    <div className="px-2">
      {profile?.proStatus ? (
        <ProStatusCard
          isPro={profile.proStatus.isPro}
          proExpiry={profile.proStatus.proExpiry}
          subscriptionType={profile.proStatus.subscriptionType}
          updatedAt={profile.proStatus.updatedAt}
        />
      ) : (
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-indigo-500" />
          <span className="text-sm font-semibold text-gray-700">
            Current Plan:{" "}
            <span className={`uppercase font-bold text-indigo-600`}>
              {plan}
            </span>
          </span>
        </div>
      )}

      {/* Daily Prompt Tracker */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">
            Daily AI Prompts Used:{" "}
            <span className="font-medium text-gray-800">
              {usedAiPrompts} / {dailyAiPrompts} (Your prompt usage resets every
              day.)
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed?.aiPrompts}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full ${
                percentUsed?.aiPrompts < 80 ? "bg-indigo-500" : "bg-red-500"
              } rounded-full`}
            />
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-1">
            AI Sessions Created:{" "}
            <span className="font-medium text-gray-800">
              {profile?.usage.chatSessionCount} / {profile?.quotas.chatSessions}
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed.chatSessions}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full ${
                percentUsed.chatSessions < 80 ? "bg-indigo-500" : "bg-red-500"
              } rounded-full`}
            />
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-1">
            Task boards created:{" "}
            <span className="font-medium text-gray-800">
              {profile?.usage.boardCount} / {profile?.quotas.taskBoards}
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed.boards}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full ${
                percentUsed.boards < 80 ? "bg-indigo-500" : "bg-red-500"
              } rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Extra AI Credits */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <Zap className="h-4 w-4 text-green-500" />
        Extra AI Credits:{" "}
        <span className="font-medium text-gray-800">{extraCredits}</span>
      </div>

      {/* CTA Buttons */}
      <div className="mt-6 flex flex-col gap-4">
        <button
          onClick={() => {
            // open credit purchase
          }}
          className="w-full sm:w-auto rounded-xl border border-indigo-600 text-indigo-600 px-5 py-2 font-medium hover:bg-indigo-50 transition"
        >
          Buy AI Credits
        </button>
        {plan === "free" && <UpgradeToPremiumButton />}
      </div>
    </div>
  );
};

export default UsageTracker;
