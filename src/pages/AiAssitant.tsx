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
import { GoSidebarCollapse } from "react-icons/go";
import { IoMdArrowDown } from "react-icons/io";
import { motion } from 'framer-motion';
import NewSessionPopup from '../components/AI-Assistant/NewSessionPopup';
import { authService } from '../services/authService';
import ChatPromptLimitReached from '../components/AI-Assistant/ChatPromptLimitReached';

const AiAssistant = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const { sessions, messages, activeSessionId, loading, error, loadingAi, loadingMessages } = useSelector((state: RootState) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [sessionActionLoading, setSessionActionLoading] = useState({
    creatingSession: false,
    deletingSession: false,
  })
  const [isCreateSessionPopupOpen, setIsCreateSessionPopupOpen] = useState(false);

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

  useEffect(() => {
    const scrollDiv = messagesEndRef.current;
    if (scrollDiv) {
      scrollDiv.scrollTop = scrollDiv.scrollHeight;
    }
  }, [messages, activeSessionId]);

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
    if (!user) return
    if (!input.trim() || !activeSessionId) return;
    dispatch(sendMessage({ userId: user?.uid, sessionId: activeSessionId, content: input }));
  };

  const handleNewSession = async (newSessionTitle: string) => {
    if (!profile) {
      dispatch(setError('Profile not loaded yet'));
      return;
    }
    setSessionActionLoading({ ...sessionActionLoading, creatingSession: true });
    if (!user?.uid) return;
    const { chatService } = await import('../services/chatService');
    const sessionId = await chatService.createSession(user.uid, sessionList.length === 0 ? 'New Chat' : newSessionTitle);
    await authService.updateUserProfile(user.uid, { ...profile, chatSessionCount: profile?.chatSessionCount as number + 1 });
    dispatch(setActiveSession(sessionId));
    setIsCreateSessionPopupOpen(false);
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
    if (!profile) {
      dispatch(setError('Profile not loaded yet'));
      return;
    }
    setSessionActionLoading({ ...sessionActionLoading, deletingSession: true });
    if (!user?.uid) return;
    const { chatService } = await import('../services/chatService');
    try {

      await chatService.deleteSession(sessionId);
      await authService.updateUserProfile(user.uid, { ...profile, chatSessionCount: profile?.chatSessionCount as number - 1 });
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
  const renderedMessages: ChatMessage[] = [...currentMessages];

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
                  onRenameSession={handleRenameSession}
                  onDeleteSession={handleDeleteSession}
                  setIsCreateSessionPopupOpen={(value: boolean) => setIsCreateSessionPopupOpen(value)}
                  isCollapsed={isSidebarCollapsed}
                  setIsSidebarCollapsed={(value) => setIsSidebarCollapsed(value)}
                  sessionActionLoading={sessionActionLoading}
                />
              )}
            </motion.div>
          )}
          <div className="relative flex-1 flex flex-col">
            {isSidebarCollapsed && !loading && sessionList.length > 0 && (
              <div className='text-gary-900 absolute top-3 left-3 z-10 bg-gray-300/80 rounded-full'>
                <button
                  onClick={toggleSidebar}
                  className="p-2"
                >
                  <GoSidebarCollapse size={22} />
                </button>
              </div>
            )}
            {!loading && sessionList.length === 0 ? (
              <EmptyChatState onCreateNewChat={() => handleNewSession('New Chat')} />
            ) : (
              <>
                <div className={`mx-auto flex-1 flex flex-col h-full relative w-full ${isSidebarCollapsed ? 'max-w-[320px] sm:max-w-[460px] md:max-w-2xl lg:max-w-5xl' : 'max-w-[320px] sm:max-w-[460px] md:max-w-[400px] lg:max-w-4xl'}`}>
                  <div ref={messagesEndRef} style={{ marginBottom: `${inputRef.current?.scrollHeight}px` }} className="w-full flex-1 overflow-y-auto bg-gray-50">
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
                    {!loadingMessages && renderedMessages.length === 0 && (profile?.aiPromptUsage?.count as number < (profile?.role === 'free' ? 10 : 50)) && (
                      <div className="flex justify-center items-center w-full min-h-full bg-gray-50">
                        <div className="text-gray-500">No messages yet. Start chatting!</div>
                      </div>
                    )}
                    <div className='pb-6'>
                      {renderedMessages.map((msg, idx) => (
                        <Message
                          key={idx}
                          message={msg}
                          isUser={msg.sender === 'user'}
                          showLoading={msg.id === 'ai-streaming' && msg.content === ''}
                        />
                      ))}
                    </div>
                  </div>
                  <div className='w-full absolute bottom-0'>
                    <div className={`${(messages && !isAtBottom) ? 'visible' : 'invisible'} pb-2 bg-white/0 flex w-full justify-center items-center`}>
                      <div
                        onClick={() => {
                          messagesEndRef.current?.scrollTo({ behavior: 'smooth', top: messagesEndRef.current?.scrollHeight });
                        }}
                        className='cursor-pointer border border-gray-500/50 bg-white shadow-xl hover:bg-white/90 rounded-full p-1 flex items-center justify-center'>
                        <IoMdArrowDown size={26} />
                      </div>
                    </div>
                    {
                      !loading && profile?.aiPromptUsage?.count as number === (profile?.role === 'free' ? 10 : 50) ? (
                        <div ref={inputRef} className="w-full">
                          <ChatPromptLimitReached
                            usedPrompts={profile?.aiPromptUsage?.count as number}
                            promptLimit={profile?.role === 'premium' ? 50 : 10}
                            aiCredits={profile?.aiCredits as number}
                            userPlan={profile?.role || 'free'}
                          />
                        </div>
                      ) : !loading ? (
                        <div ref={inputRef} onFocus={window.innerWidth < 768 ? handleInputFocus : undefined} className="w-full">
                          <PromptInput
                            onSend={handleSend}
                            disabled={!activeSessionId || loading || loadingAi || loadingMessages}
                            loading={loading || loadingAi}
                            placeholder="Type your message..."
                          />
                          <div className="text-xs text-gray-400 mt-2 text-center">
                            Press Enter to send, Shift + Enter for new line
                          </div>
                        </div>
                      ) : null
                    }
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )
      }
      <NewSessionPopup
        isOpen={isCreateSessionPopupOpen}
        onClose={() => setIsCreateSessionPopupOpen(false)}
        onAddSession={handleNewSession}
        isSubmitting={sessionActionLoading.creatingSession}
      />
    </div >
  );
};

export default AiAssistant; 