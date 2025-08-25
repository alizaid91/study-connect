import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { closePremiumComingSoon } from "../store/slices/globalPopups";

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
            transition={{ duration: 0.3, type: "spring" }}
          >
            {/* Icon */}
            <motion.div
              className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>

            <h2 className="text-2xl font-bold text-yellow-600 mb-2">
              Upgrading Your Profile ✨
            </h2>
            <p className="text-gray-700 text-sm mb-4">
              You’ll be upgraded to{" "}
              <span className="font-semibold">Premium</span> shortly. Hang tight
              while we finish the setup!
            </p>

            <motion.button
              onClick={() => dispatch(closePremiumComingSoon())}
              className="mt-4 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Okay
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PremiumComingSoonModal;
