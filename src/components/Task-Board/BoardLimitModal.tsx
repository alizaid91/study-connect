import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { UpgradeToPremiumButton } from '../buttons/UpgradeToPremiumButton';

interface BoardLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    userType: 'free' | 'premium';
}

export default function BoardLimitModal({ isOpen, onClose, userType }: BoardLimitModalProps) {
    return (
        <Dialog
            as={motion.div}
            static
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            open={isOpen}
            onClose={onClose}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel
                    as={motion.div}
                    className="text-center inline-block w-full max-w-md p-8 overflow-hidden align-middle bg-white rounded-3xl shadow-xl z-50"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <div className="flex justify-center mb-4 text-yellow-500">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                        Board Limit Reached
                    </h2>
                    <p id="modal-description" className="text-gray-600">
                        You've reached your current board limit ({userType === 'free' ? '2' : '5'} boards for {userType === 'free' ? 'free' : 'premium'} users). {userType === 'free' && 'Upgrade to premium to create more boards.'}
                    </p>

                    <div className="flex flex-col space-y-2 pt-4">
                        {userType === 'free' && (
                            <UpgradeToPremiumButton />
                        )}
                        <button
                            onClick={() => {
                                onClose();
                            }}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 transition"
                        >
                            Manage Boards
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl px-4 py-2 text-gray-500 hover:text-gray-700 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}