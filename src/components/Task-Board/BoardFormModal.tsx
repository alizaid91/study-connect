import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import BoardLimitModal from './BoardLimitModal';

interface BoardFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string) => void;
    isSubmitting: boolean;
    initialTitle?: string;
    mode?: 'create' | 'edit';
}

const BoardFormModal = ({
    isOpen,
    onClose,
    onSave,
    isSubmitting,
    initialTitle = '',
    mode = 'create'
}: BoardFormModalProps) => {
    const [title, setTitle] = useState(initialTitle);
    const { profile } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
        }
    }, [isOpen, initialTitle]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSave(title.trim());
        }
    };

    return (
        <AnimatePresence>
            {isOpen && profile && profile.boardCount && profile.boardCount >= (profile.role === 'free' ? 2 : 5)
                ? <BoardLimitModal
                    isOpen={isOpen}
                    onClose={onClose}
                    userType={profile.role as 'free' | 'premium'}
                />
                : isOpen && (
                    <Dialog
                        as={motion.div}
                        static
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 overflow-y-auto"
                        open={isOpen}
                        onClose={onClose}
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-40 -z-10" aria-hidden="true"></div>
                        <div className="min-h-screen px-4 text-center">
                            <span className="inline-block h-screen align-middle" aria-hidden="true">
                                &#8203;
                            </span>

                            <Dialog.Panel
                                as={motion.div}
                                className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white rounded-lg shadow-xl z-50"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {mode === 'create' ? 'Create New Board' : 'Edit Board'}
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-500"
                                        onClick={onClose}
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="board-title" className="block text-sm font-medium text-gray-700">
                                            Board Title
                                        </label>
                                        <input
                                            type="text"
                                            id="board-title"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter board title"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            disabled={isSubmitting || !title.trim()}
                                        >
                                            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Board' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </div>
                    </Dialog>
                )}
        </AnimatePresence>
    );
};

export default BoardFormModal; 