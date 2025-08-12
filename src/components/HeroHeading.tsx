import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const features = [
  {
    text: "Solved Papers",
    gradient: "bg-gradient-to-r from-amber-400 to-yellow-300",
  },
  {
    text: "Study Resources",
    gradient: "bg-gradient-to-r from-green-400 to-emerald-500",
  },
  {
    text: "AI Assistant",
    gradient: "bg-gradient-to-r from-pink-500 to-rose-400",
  },
  {
    text: "Task Board",
    gradient: "bg-gradient-to-r from-orange-400 to-red-500",
  },
];

export default function HeroHeading({ user }: { user: any }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-8">
      <h1 className="text-4xl md:text-5xl font-extrabold md:font-bold text-white mb-2 max-w-[650px] mx-auto px-4 sm:px-0 text-center">
        {user ? (
          "Welcome Back!"
        ) : (
          <span>
            <h1>Ace Engineering with</h1>{" "}
            <span className="inline-block overflow-hidden h-[1.2em] align-middle">
              <AnimatePresence mode="wait">
                <motion.span
                  key={features[index].text}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-20%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`pb-2 md:pt-1 inline-block bg-clip-text text-transparent ${features[index].gradient}`}
                >
                  {features[index].text}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        )}
      </h1>
    </div>
  );
}
