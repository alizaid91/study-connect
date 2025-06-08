import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../store';
import { resetChat } from '../store/slices/chatSlice';

const ChatHeader: React.FC = () => {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);

  const handleResetChat = () => {
    if (!isLoading && window.confirm('Are you sure you want to clear the chat history?')) {
      dispatch(resetChat());
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">ChatBot Assistant</h1>
            <p className="text-sm text-gray-500">
              {isLoading ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetChat}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Chat
            </motion.button>
          )}
          
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-400'}`} />
            <span className="text-xs text-gray-500">
              {messages.length} messages
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;