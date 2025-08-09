import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, BookOpen, Bot, LayoutDashboard } from "lucide-react";

const buttons = [
  {
    label: "PYQs",
    icon: <FileText className="w-5 h-5" />,
    to: "/pyqs",
    colors: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  },
  {
    label: "Resources",
    icon: <BookOpen className="w-5 h-5" />,
    to: "/resources",
    colors: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  {
    label: "AI Assistant",
    icon: <Bot className="w-5 h-5" />,
    to: "/ai-assistant",
    colors: "linear-gradient(135deg, #3b82f6 0%, #0d9488 100%)",
  },
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    to: "/dashboard",
    colors: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  }
];

export default function MobileFeatureButtons() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 mx-auto max-w-fit">
      {buttons.map((btn, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to={btn.to}
            className="flex items-center justify-center gap-2 p-3 text-sm md:text-base font-semibold text-white rounded-3xl relative overflow-hidden"
            style={{
              background: btn.colors,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Shimmer Animation */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            {/* Icon + Label Animation */}
            <motion.span
              className="relative z-10 flex items-center gap-2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {btn.icon}
              {btn.label}
            </motion.span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
