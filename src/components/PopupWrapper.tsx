import { AnimatePresence, motion } from "framer-motion";

interface PopupWrapperProps {
    show: boolean;
    children?: React.ReactNode;
}

const PopupWrapper = ({ show, children }: PopupWrapperProps) => {
    return (
        <AnimatePresence>
            {show && (
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
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PopupWrapper;