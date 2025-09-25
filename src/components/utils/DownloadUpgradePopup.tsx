import { motion } from "framer-motion";
import { FiLock, FiX, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { closePdfDownloadIsForPro } from "../../store/slices/globalPopups";

export default function DownloadUpgradePopup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pdfDownloadIsForProOpen } = useSelector(
    (state: RootState) => state.globalPopups
  );

  if (!pdfDownloadIsForProOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full relative"
      >
        {/* Close Button */}
        <button
          onClick={() => dispatch(closePdfDownloadIsForPro())}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Icon with animation */}
        <motion.div
          initial={{ rotate: -15 }}
          animate={{ rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex items-center justify-center mb-4"
        >
          <FiLock className="w-12 h-12 text-yellow-500" />
        </motion.div>

        {/* Heading */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Unlock PDF Downloads
        </h2>
        <p className="text-gray-500 text-center mb-6">
          PDF downloads are available for{" "}
          <span className="font-medium">Pro users</span>. Upgrade now to save
          Papers & Study Resources offline!
        </p>

        {/* CTA Button */}
        <button
          onClick={() => {
            dispatch(closePdfDownloadIsForPro());
            navigate("/pricing");
          }}
          className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow hover:bg-yellow-600 transition"
        >
          <FiStar className="w-5 h-5" />
          Upgrade to Pro
        </button>
      </motion.div>
    </div>
  );
}
