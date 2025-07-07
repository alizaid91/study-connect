import { motion } from "framer-motion";
import { Sparkles, Zap, Crown } from "lucide-react";
import { RootState } from "../../store";
import { useSelector } from 'react-redux';
import { UpgradeToPremiumButton } from "../buttons/UpgradeToPremiumButton";

const UsageTracker = () => {
    const { profile } = useSelector((state: RootState) => state.auth);
    const plan = profile?.role || "free";
    const dailyAiPrompts = profile?.role === 'free' ? 10 : 50;
    const usedAiPrompts = profile?.aiPromptUsage?.count || 0;
    const extraCredits = profile?.aiCredits || 0;
    const percentUsed ={
        aiPropmpts: Math.min((usedAiPrompts / dailyAiPrompts) * 100, 100),
        chatSessions: Math.min((profile?.chatSessionCount || 0) / (profile?.role === 'free' ? 2 : 10) * 100, 100),
        boards: Math.min((profile?.boardCount || 0) / (profile?.role === 'free' ? 2 : 5) * 100, 100)
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 w-full mx-auto mt-8">
            {/* Current Plan Header */}
            <div className="flex items-center gap-2 mb-4">
                {plan === "premium" ? (
                    <Crown className="text-yellow-500" />
                ) : (
                    <Sparkles className="text-indigo-500" />
                )}
                <span className="text-sm font-semibold text-gray-700">
                    Current Plan:{" "}
                    <span
                        className={`uppercase font-bold ${plan === "premium" ? "text-yellow-600" : "text-indigo-600"
                            }`}
                    >
                        {plan}
                    </span>
                </span>
            </div>

            {/* Daily Prompt Tracker */}
            <div className="flex flex-col gap-4">
                <div>
                    <div className="text-sm text-gray-600 mb-1">
                        Daily AI Prompts Used:{" "}
                        <span className="font-medium text-gray-800">
                            {usedAiPrompts} / {dailyAiPrompts} (Your prompt usage resets every day.)
                        </span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentUsed.aiPropmpts}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full ${percentUsed.aiPropmpts < 80 ? "bg-indigo-500" : "bg-red-500"
                                } rounded-full`}
                        />
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-600 mb-1">
                        AI Sessions Created:{" "}
                        <span className="font-medium text-gray-800">
                            {profile?.chatSessionCount} / {profile?.role === 'free' ? 2 : 10}
                        </span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentUsed.chatSessions}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full ${percentUsed.chatSessions < 80 ? "bg-indigo-500" : "bg-red-500"
                                } rounded-full`}
                        />
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-600 mb-1">
                        Task boards created:{" "}
                        <span className="font-medium text-gray-800">
                            {profile?.boardCount} / {profile?.role === 'free' ? 2 : 5}
                        </span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentUsed.boards}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full ${percentUsed.boards < 80 ? "bg-indigo-500" : "bg-red-500"
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
                {plan === "free" && (
                    <UpgradeToPremiumButton />
                )}
            </div>
        </div>
    );
};

export default UsageTracker;
