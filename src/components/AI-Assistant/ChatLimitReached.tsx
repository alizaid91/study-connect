import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react";
import { UpgradeToPremiumButton } from "../buttons/UpgradeToPremiumButton";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface ChatLimitReachedProps {
    onClose: () => void;
}

const ChatLimitReached = ({ onClose }: ChatLimitReachedProps) => {
    const { profile } = useSelector((state: RootState) => state.auth)
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
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
                        {profile?.role === 'free' ? 'Free' : 'Pro'} users can start up to <strong>{profile?.quotas.chatSessions} AI chats</strong>.{profile?.role === 'free' ? ' Upgrade to Pro to start more chats.' : ''}
                    </p>

                    <div className="mt-6 flex flex-col gap-4">
                        {
                            profile?.role === 'free' && (
                                <UpgradeToPremiumButton />
                            )
                        }
                        <button
                            onClick={onClose}
                            className="w-full rounded-3xl px-4 py-2 border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
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