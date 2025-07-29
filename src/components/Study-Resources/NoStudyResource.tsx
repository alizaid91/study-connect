import { motion } from "framer-motion";
import noResourceFound from "../../assets/Not-found-removebg-preview.png";

const NoStudyResources = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.img
        src={noResourceFound}
        alt="No Resources Found"
        className="w-[200px] mb-2"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      <motion.h2
        className="text-lg sm:text-xl font-semibold text-blue-700 mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        No Study Resources Found
      </motion.h2>

      <motion.p
        className="text-sm text-gray-500 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        It looks like there are no resources available for the selected filters.
        Try changing the branch, year, or type to explore more resources.
      </motion.p>
    </motion.div>
  );
};

export default NoStudyResources;
