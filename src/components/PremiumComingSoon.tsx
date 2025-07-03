import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { closePremiumComingSoon } from '../store/slices/globalPopups';

interface Props {
    isOpen: boolean;
}

const PremiumComingSoonModal = ({ isOpen }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center relative mx-3"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                    >
                        {/* Animated Lock Icon */}
                        <motion.div
                            className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.6 }}
                        >
                            <Lock className="w-6 h-6" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-indigo-600 mb-2">Premium Coming Soon 🚀</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            We're setting up Payment integration. Premium subscriptions will be available very soon.
                        </p>

                        <motion.button
                            onClick={() => { dispatch(closePremiumComingSoon()) }}
                            className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Got It
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PremiumComingSoonModal;