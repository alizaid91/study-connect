import React from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare } from 'react-icons/fi';

interface EmptyChatStateProps {
  onCreateNewChat: () => void;
}

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onCreateNewChat }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ minHeight: `${window.innerHeight - 64}px` }}
      className="flex flex-col items-center justify-center bg-gray-50 p-8 h-full w-full"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4"
      >
        <FiMessageSquare className="w-12 h-12 text-blue-500" />
      </motion.div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">No Chats Yet</h2>
      <p className="text-gray-600 text-center mb-4 max-w-md">
        Start a new conversation with our AI assistant to get help with your questions.
      </p>

      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <div
          onClick={onCreateNewChat}
          className="cursor-pointer inline-block px-5 py-2.5 text-sm font-medium text-white rounded-xl relative overflow-hidden w-fit shadow-md"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <motion.div
            className="absolute inset-0 opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
            }}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.span
            className="relative z-10"
            animate={{
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Start New Chat
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmptyChatState; 