import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  listenToSessions,
  listenToMessages,
  sendMessage,
  setActiveSession,
  setError,
} from '../store/slices/chatSlice';
import { ChatMessage } from '../types/chat';
import Sidebar from '../components/AI-Assistant/Sidebar';
import Message from '../components/AI-Assistant/Message';
import PromptInput from '../components/AI-Assistant/PromptInput';
import EmptyChatState from '../components/AI-Assistant/EmptyChatState';
import { BiMenuAltLeft } from "react-icons/bi";
import { IoMdArrowDown } from "react-icons/io";
import { motion } from 'framer-motion';

const AiAssistant = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sessions, messages, activeSessionId, loading, error, loadingAi, loadingMessages } = useSelector((state: RootState) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [sessionActionLoading, setSessionActionLoading] = useState({
    creatingSession: false,
    deletingSession: false,
  })

  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300)
  }

  // close sidebar initially on mobile view
  useEffect(() => {
    setIsSidebarCollapsed(window.innerWidth < 768);
  }, []);

  // Listen to sessions
  useEffect(() => {
    if (user?.uid) {
      dispatch(listenToSessions(user.uid));
    }
  }, [user?.uid, dispatch]);

  // Listen to messages for active session
  useEffect(() => {
    if (activeSessionId) {
      dispatch(listenToMessages(activeSessionId));
    }
  }, [activeSessionId, dispatch]);

  // Detect if AI is responding (last message is from user and sendMessage is loading)
  useEffect(() => {
    if (!activeSessionId) {
      setAiLoading(false);
      return;
    }
    const msgs = messages[activeSessionId] || [];
    if (msgs.length === 0) {
      setAiLoading(false);
      return;
    }
    // If last message is from user and loading is true, AI is responding
    const lastMsg = msgs[msgs.length - 1];
    setAiLoading(lastMsg.sender === 'user' && loadingAi);
  }, [messages, activeSessionId, loadingAi]);

  useEffect(() => {
    const scrollDiv = messagesEndRef.current;
    if (scrollDiv) {
      scrollDiv.scrollTop = scrollDiv.scrollHeight;
    }
  }, [messages, activeSessionId, aiLoading]);

  const handleScroll = () => {
    if (messagesEndRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current;
      if (scrollTop === 0) return;
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setIsAtBottom(isBottom);
    }
  };

  useEffect(() => {
    const messagesContainer = messagesEndRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll);
      return () => messagesContainer.removeEventListener('scroll', handleScroll);
    }
  }, [messagesEndRef.current]);

  const handleSend = (input: string) => {
    if (!input.trim() || !activeSessionId) return;
    dispatch(sendMessage({ sessionId: activeSessionId, content: input }));
  };

  const handleNewSession = async (newSessionTitle: string) => {
    setSessionActionLoading({ ...sessionActionLoading, creatingSession: true });
    if (!user?.uid) return;
    const { chatService } = await import('../services/chatService');
    const sessionId = await chatService.createSession(user.uid, sessionList.length === 0 ? 'New Chat' : newSessionTitle);
    dispatch(setActiveSession(sessionId));
    setIsSidebarCollapsed(window.innerWidth < 768);
    setSessionActionLoading({ ...sessionActionLoading, creatingSession: false });
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    if (!user?.uid) return;
    const { chatService } = await import('../services/chatService');
    try {
      await chatService.renameSession(sessionId, newTitle);
    } catch (error) {
      console.error('Error renaming session:', error);
      dispatch(setError('Failed to rename chat session'));
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setSessionActionLoading({ ...sessionActionLoading, deletingSession: true });
    if (!user?.uid) return;
    const { chatService } = await import('../services/chatService');
    try {

      await chatService.deleteSession(sessionId);
      if (activeSessionId === sessionId) {
        const newSessionList = sessionList.filter((session) => session.id !== sessionId);
        if (newSessionList.length > 0) {
          dispatch(setActiveSession(newSessionList[0].id))
        } else {
          dispatch(setActiveSession(null));
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      dispatch(setError('Failed to delete chat session'));
    } finally {
      setSessionActionLoading({ ...sessionActionLoading, deletingSession: false });
    }
  };

  const sessionList = Object.values(sessions);
  const currentMessages = activeSessionId ? messages[activeSessionId] || [] : [];

  // Prepare messages for rendering, including a loading AI message if needed
  const renderedMessages: (ChatMessage & { showLoading?: boolean })[] = [...currentMessages];
  if (aiLoading && activeSessionId) {
    renderedMessages.push({
      id: 'ai-loading',
      sessionId: activeSessionId,
      sender: 'ai',
      content: '',
      timestamp: new Date().toISOString(),
      showLoading: true,
    });
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="relative flex h-[79vh] w-full bg-gray-50 rounded-lg shadow-lg min-h-[79vh] md:min-h-[90vh] pb-2 md:pb-0">
      {loading ? (
        <div className="flex justify-center items-center w-full min-h-screen bg-gray-50">
          <div className="relative w-24 h-24">
            <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent animate-spin"></div>
            <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-blue-400 animate-spin animation-delay-150"></div>
            <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-blue-300 border-r-transparent border-b-blue-500 border-l-transparent animate-spin animation-delay-300"></div>
          </div>
        </div>
      ) : (
        <>
          {!loading && !isSidebarCollapsed && sessionList.length > 0 && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "keyframes", stiffness: 60, damping: 20 }}
              className="w-80 absolute top-0 bottom-0 left-0 z-10 h-full md:pt-0 md:static"
            >
              {sessionList.length > 0 && (
                <Sidebar
                  sessions={sessionList}
                  activeSessionId={activeSessionId}
                  onSelectSession={id => dispatch(setActiveSession(id))}
                  onCreateSession={(value: string) => handleNewSession(value)}
                  onRenameSession={handleRenameSession}
                  onDeleteSession={handleDeleteSession}
                  isCollapsed={isSidebarCollapsed}
                  setIsSidebarCollapsed={(value) => setIsSidebarCollapsed(value)}
                  sessionActionLoading={sessionActionLoading}
                />
              )}
            </motion.div>
          )}
          <div className="relative flex-1 flex flex-col">
            {isSidebarCollapsed && !loading && sessionList.length > 0 && (
              <div className='absolute top-3 left-3 z-10 bg-white rounded-full shadow-md hover:bg-gray-50 flex items-center justify-center'>
                <button
                  onClick={toggleSidebar}
                  className="p-1"
                >
                  <BiMenuAltLeft size={28} />
                </button>
              </div>
            )}
            {!loading && sessionList.length === 0 ? (
              <EmptyChatState onCreateNewChat={() => handleNewSession('New Chat')} />
            ) : (
              <>
                <div className={`mx-auto flex-1 flex flex-col h-full relative w-full ${isSidebarCollapsed ? 'max-w-[320px] sm:max-w-[460px] md:max-w-2xl lg:max-w-5xl' : 'max-w-[320px] sm:max-w-[460px] md:max-w-[400px] lg:max-w-4xl'}`}>
                  <div ref={messagesEndRef} style={{ marginBottom: `${inputRef.current?.scrollHeight}px` }} className="pb-4 w-full flex-1 overflow-y-auto bg-gray-50">
                    {error && <div className="text-red-500">{error}</div>}
                    {loadingMessages && (
                      <div className="flex justify-center items-center w-full min-h-full bg-gray-50">
                        <div className="relative w-24 h-24">
                          <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent animate-spin"></div>
                          <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-blue-400 animate-spin animation-delay-150"></div>
                          <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-blue-300 border-r-transparent border-b-blue-500 border-l-transparent animate-spin animation-delay-300"></div>
                        </div>
                      </div>
                    )}
                    {!loadingMessages && renderedMessages.length === 0 && (
                      <div className="flex justify-center items-center w-full min-h-full bg-gray-50">
                        <div className="text-gray-500">No messages yet. Start chatting!</div>
                      </div>
                    )}
                    <div className='w-full'>
                      {renderedMessages.map((msg, idx) => (
                        <Message
                          key={msg.id + (msg.showLoading ? '-loading' : '')}
                          message={msg}
                          isUser={msg.sender === 'user'}
                          showLoading={!!msg.showLoading}
                        />
                      ))}
                    </div>
                    {!isAtBottom && (
                      <div className='absolute bottom-36 left-1/2 transform -translate-x-1/2 w-10 h-10 flex justify-center items-center bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer z-0'
                        onClick={() => {
                          messagesEndRef.current?.scrollTo({ behavior: 'smooth', top: messagesEndRef.current?.scrollHeight });
                        }}>
                        <IoMdArrowDown className='w-6 h-6' />
                      </div>
                    )}
                  </div>
                  <div ref={inputRef} onFocus={window.innerWidth < 768 ? handleInputFocus : undefined} className="w-full absolute bottom-0 bg-white pb-2">
                    <div className='w-full'>
                      <PromptInput
                        onSend={handleSend}
                        disabled={!activeSessionId || loading || loadingAi}
                        loading={loading || loadingAi}
                        placeholder="Type your message..."
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      Press Enter to send, Shift + Enter for new line
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )
      }
    </div >
  );
};

export default AiAssistant; 