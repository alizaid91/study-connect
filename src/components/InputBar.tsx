import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState, AppDispatch } from '../store';
import { sendMessageAsync } from '../store/slices/chatSlice';

const InputBar: React.FC = () => {
  const [message, setMessage] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.chat);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const messageToSend = message.trim();
      setMessage('');
      await dispatch(sendMessageAsync(messageToSend));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-3 bg-gray-50 rounded-2xl p-3 shadow-sm border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-500 min-h-[24px] max-h-[120px] disabled:opacity-50"
              rows={1}
            />
            
            <motion.button
              type="submit"
              disabled={!message.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                message.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5\" fill="none\" stroke="currentColor\" viewBox="0 0 24 24">
                  <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </motion.button>
          </div>
          
          <div className="flex justify-between items-center mt-2 px-1">
            <p className="text-xs text-gray-500">
              Press Enter to send, Shift + Enter for new line
            </p>
            <p className="text-xs text-gray-400">
              {message.length}/1000
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputBar;