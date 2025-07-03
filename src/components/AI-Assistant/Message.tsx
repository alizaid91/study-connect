import React from 'react';
import { ChatMessage } from '../../types/chat';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck } from 'react-icons/fi';

interface MessageProps {
  message: ChatMessage;
  isUser: boolean;
  showLoading?: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isUser, showLoading }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full flex ${isUser ? 'justify-end pt-12 mb-3' : 'justify-start'} items-start`}
    >
      <div
        className={`relative px-6 py-3 rounded-3xl transition-all duration-200 break-words overflow-x-auto
          ${isUser
            ? 'max-w-[80%] bg-gradient-to-br from-blue-500 to-blue-700 text-white'
            : 'max-w-full bg-gray-200/70 text-gray-900'
          }`}
      >
        {isUser ? (
          <div className="whitespace-pre-line text-base font-medium tracking-wide">{message.content}</div>
        ) : (
          <div className="prose prose-sm max-w-none break-words overflow-x-auto">
            <ReactMarkdown
              components={{
                code({inline, className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const code = String(children).replace(/\n$/, '');
                  
                  if (!inline && match) {
                    return (
                      <div className="relative group">
                        <div className="absolute right-2 top-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={() => handleCopy(code)}
                            className="p-1.5 bg-gray-700 rounded hover:bg-gray-600 text-white"
                          >
                            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg !mt-2 !mb-4 !bg-gray-800"
                            customStyle={{
                              margin: 0,
                              padding: '1rem',
                              borderRadius: '0.5rem',
                              overflowX: 'auto',
                              maxWidth: '100%'
                            }}
                            {...props}
                          >
                            {code}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono break-words" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="mb-4 last:mb-0 whitespace-pre-wrap break-words">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-4 space-y-1 break-words">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-4 space-y-1 break-words">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1 break-words">{children}</li>
                ),
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4 break-words">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-3 break-words">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-bold mb-2 break-words">{children}</h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 break-words">{children}</blockquote>
                ),
                pre: ({ children }) => (
                  <pre className="overflow-x-auto max-w-full">{children}</pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-200">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 bg-gray-100 text-left text-sm font-medium text-gray-700">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-gray-900 border-t">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {/* Loading animation for pending AI response */}
        {showLoading && !isUser && (
          <div className="flex items-center gap-2 mt-1">
            <span className="flex gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message; 