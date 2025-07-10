import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function NoMessagesState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {/* Heading */}
            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-semibold text-gray-800"
            >
                Start your academic journey with <span className="text-indigo-600">Study Connect AI</span>
            </motion.h2>

            {/* Subtext */}
            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mt-2 max-w-md"
            >
                Ask questions about syllabus, past papers, or anything you're stuck on — we’re here to help!
            </motion.p>

            {/* Call-to-action */}
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: [0, -5, 0], opacity: 1 }}
                transition={{ delay: 1, repeat: Infinity, duration: 1.5 }}
                className="mt-8 text-indigo-500"
            >
                <Sparkles size={32} />
            </motion.div>
        </div>
    );
}
