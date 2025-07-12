import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSend } from 'react-icons/fi';
import PromptTemplateSection from './PromptTemplateSection';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface PromptInputProps {
  onSend: (input: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({
  onSend,
  disabled,
  loading,
  placeholder = 'Type your message...'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  const { isAIActive } = useSelector((state: RootState) => state.auth);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className='relative'>
      <PromptTemplateSection isTyping={!input.trim()} onSelectPrompt={(prompt) => setInput(prompt)} />
      <div
        className={`flex flex-col gap-2 p-2 border border-gray-300 rounded-3xl transition-all duration-200 bg-white`}
      >
        {/* Input area */}
        <div className="w-full min-h-[20px] md:min-h-[44px]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent border-none focus:ring-0 focus:outline-none text-base placeholder-gray-400"
            rows={1}
            style={{ maxHeight: '200px' }}
          />
        </div>

        {/* Action buttons */}
        <div className='w-full flex justify-between items-center'>
          <div className='p-2 rounded-full transition-all duration-200 flex items-center justify-center bg-gray-200 hover:bg-gray-300'>
            <FiPlus size={18} />
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center
                ${!input.trim() || disabled || loading
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg text-white'
                }`}
              onClick={() => { onSend(input); setInput('') }}
              disabled={!input.trim() || disabled || loading}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FiSend size={18} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput; 