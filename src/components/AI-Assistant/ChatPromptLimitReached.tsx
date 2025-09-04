import { Zap, MessageSquareWarning, Clock } from "lucide-react";
import { UpgradeToPremiumButton } from "../buttons/UpgradeToPremiumButton";

const ChatPromptLimitReached = ({
  usedPrompts,
  promptLimit,
  aiCredits,
  userPlan,
}: {
  usedPrompts: number;
  promptLimit: number;
  aiCredits: number;
  userPlan: "free" | "premium";
}) => {
  const getResetTimeLeft = () => {
    const now = new Date();
    const nextReset = new Date();
    nextReset.setHours(0, 0, 0, 0); // Midnight today
    nextReset.setDate(nextReset.getDate() + 1); // Move to next day

    const diff = nextReset.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-xl shadow-sm text-center text-sm text-gray-700 animate-fade-in">
      <div className="flex justify-center items-center gap-2 text-yellow-700 font-medium mb-2">
        <MessageSquareWarning className="w-5 h-5" />
        You’ve reached your daily AI usage limit.
      </div>

      <div className="text-gray-800 mb-2">
        <strong>{usedPrompts}</strong> / {promptLimit} prompts used today
        <br />
        Extra AI Credits:{" "}
        <span className="text-green-600 font-semibold">{aiCredits}</span>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4">
        <Clock className="w-4 h-4 text-gray-500" />
        <span>Daily limit resets in: {getResetTimeLeft()}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-3">
        <button
          onClick={() => {
            // open credits modal
          }}
          className="flex items-center justify-center gap-1 border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 font-medium transition"
        >
          <Zap size={16} /> Buy AI Credits
        </button>

        {userPlan === "free" && <UpgradeToPremiumButton />}
      </div>
    </div>
  );
};

export default ChatPromptLimitReached;
