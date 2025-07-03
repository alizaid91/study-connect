import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react";
import { UpgradeToPremiumButton } from "../buttons/UpgradeToPremiumButton";

interface ChatLimitReachedProps {
    onClose: () => void;
}

const ChatLimitReached = ({ onClose }: ChatLimitReachedProps) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <div className="min-h-screen px-4 flex items-center justify-center">
                <motion.div
                    className="bg-white shadow-xl w-full max-w-md relative mx-auto rounded-3xl p-6 text-center"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                    <div className="flex justify-center mb-4 text-yellow-500">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">You've reached your chat limit</h2>
                    <p className="mt-2 text-gray-600">
                        Free users can start up to <strong>2 AI chats</strong>. To create more chats, you can upgrade to premium.
                    </p>

                    <div className="mt-6 flex flex-col gap-4">
                        <UpgradeToPremiumButton />
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl px-4 py-2 text-gray-500 hover:text-gray-700 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default ChatLimitReached