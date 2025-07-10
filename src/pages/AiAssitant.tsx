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
import ErrorMessageBox from '../components/AI-Assistant/ErrorMessageBox';
import NoMessagesState from '../components/AI-Assistant/NoMessagesState';

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
  const visibleHeight = window.innerHeight - 64;

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

  const handelScrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({ behavior: 'smooth', top: messagesEndRef.current.scrollHeight });
      setIsAtBottom(true);
    }
  }

  useEffect(() => {
    handelScrollToBottom();
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
    <div style={{ height: visibleHeight, maxHeight: visibleHeight }} className="flex overflow-hidden w-full">
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
              transition={{ type: "keyframes", stiffness: 60, damping: 50 }}
              className="min-w-[300px] left-0 z-10 max-h-full"
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
          <div className='relative w-full flex justify-center'>
            <div style={{ paddingBottom: `${inputRef.current?.scrollHeight}px` }} className={`flex flex-col max-w-[900px] max-h-full px-2 min-w-[300px] md:min-w-[900px]`}>
              {isSidebarCollapsed && !loading && sessionList.length > 0 && (
                <div className='text-gary-900 absolute top-3 left-3 z-10 bg-gray-300 rounded-full'>
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
                  <div className={`relative mx-auto flex-1 flex flex-col h-full min-w-full max-w-[100vw]`}>
                    <div ref={messagesEndRef} className="min-w-full flex-1 max-h-full overflow-y-auto bg-gray-50 px-4 pb-6">
                      {loadingMessages && (
                        <div className="flex justify-center items-center min-w-[300px] md:min-w-[900px] overflow-hidden min-h-full bg-gray-50">
                          <div className="relative w-24 h-24">
                            <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent animate-spin"></div>
                            <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-blue-400 animate-spin animation-delay-150"></div>
                            <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-blue-300 border-r-transparent border-b-blue-500 border-l-transparent animate-spin animation-delay-300"></div>
                          </div>
                        </div>
                      )}
                      {!loadingMessages && renderedMessages.length === 0 && (profile?.aiPromptUsage?.count as number < (profile?.role === 'free' ? 10 : 50)) ? (
                        <NoMessagesState />
                      ) : (<div>
                        {renderedMessages.map((msg, idx) => (
                          <Message
                            key={idx}
                            message={msg}
                            isUser={msg.sender === 'user'}
                            showLoading={!error && msg.id === 'ai-streaming' && msg.content === ''}
                          />
                        ))}
                        {
                          !loading && error && (
                            <ErrorMessageBox message={error} />
                          )
                        }
                      </div>)}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={`absolute w-full left-1/2 -translate-x-1/2 bottom-0 backdrop-blur-sm max-w-[900px] px-4`}>
              <div className='w-full relative'>
                <div
                  onClick={handelScrollToBottom}
                  className={`${(messages && !isAtBottom) ? 'visible' : 'invisible'} absolute -top-16 left-1/2 -translate-x-1/2 w-8 h-8 mx-auto mb-3 cursor-pointer border border-gray-500/50 bg-white shadow-xl hover:bg-white/90 rounded-full p-1 flex items-center justify-center`}>
                  <IoMdArrowDown size={26} />
                </div>
                {
                  !loading && profile?.aiPromptUsage?.count as number === (profile?.role === 'free' ? 10 : 50) ? (
                    <div ref={inputRef} className="w-full pb-2">
                      <ChatPromptLimitReached
                        usedPrompts={profile?.aiPromptUsage?.count as number}
                        promptLimit={profile?.role === 'premium' ? 50 : 10}
                        aiCredits={profile?.aiCredits as number}
                        userPlan={profile?.role || 'free'}
                      />
                    </div>
                  ) : !loading && sessionList.length > 0 ? (
                    <div ref={inputRef} onFocus={window.innerWidth < 768 ? handleInputFocus : undefined} className="w-full">
                      <PromptInput
                        onSend={handleSend}
                        disabled={!activeSessionId || loading || loadingAi || loadingMessages}
                        loading={loading || loadingAi}
                        placeholder="Type your message..."
                      />
                      <div className="text-xs text-gray-400 mt-2 text-center pb-1">
                        Press Enter to send, Shift + Enter for new line
                      </div>
                    </div>
                  ) : null
                }
              </div>
            </div>
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