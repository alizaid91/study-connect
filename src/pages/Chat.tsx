import React from 'react';
import { motion } from 'framer-motion';
import ChatHeader from '../components/ChatHeader';
import ChatWindow from '../components/ChatWindow';
import InputBar from '../components/InputBar';
import ErrorBoundary from '../components/ErrorBoundary';

const Chat: React.FC = () => {
  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-screen flex flex-col bg-gray-50"
      >
        <ChatHeader />
        <ChatWindow />
        <InputBar />
      </motion.div>
    </ErrorBoundary>
  );
};

export default Chat;