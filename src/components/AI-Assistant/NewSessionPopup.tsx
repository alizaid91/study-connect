import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ChatLimitReached from './ChatLimitReached';

interface NewSessionPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSession: (title: string) => Promise<void>;
    isSubmitting: boolean;
}

const NewSessionPopup: React.FC<NewSessionPopupProps> = ({ isOpen, onClose, onAddSession, isSubmitting }) => {
    const { profile } = useSelector((state: RootState) => state.auth);
    const [title, setTitle] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAddSession(title).then(() => {
                setTitle('')
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && profile?.chatSessionCount && profile?.chatSessionCount >= (profile.role === 'free' ? 2 : 10) ? (
                <ChatLimitReached onClose={onClose}/>
            ) : isOpen ? (
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
                            className="bg-white rounded-lg shadow-xl w-full max-w-md relative mx-auto"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Create Chat</h2>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Chat Title
                                            </label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter enter chat title"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                                                disabled={isSubmitting || !title.trim()}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    'Create Chat'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            ) : null}
        </AnimatePresence>
    )
}

export default NewSessionPopup