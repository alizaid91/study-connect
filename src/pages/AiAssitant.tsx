import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
  listenToSessions,
  sendMessage,
  setActiveSession,
  setError,
  fetchMessages,
} from "../store/slices/chatSlice";
import { ChatMessage } from "../types/chat";
import Sidebar from "../components/AI-Assistant/Sidebar";
import Message from "../components/AI-Assistant/Message";
import PromptInput from "../components/AI-Assistant/PromptInput";
import EmptyChatState from "../components/AI-Assistant/EmptyChatState";
import { GoSidebarCollapse } from "react-icons/go";
import { IoMdArrowDown } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";
import NewSessionPopup from "../components/AI-Assistant/NewSessionPopup";
import { authService } from "../services/authService";
import ChatPromptLimitReached from "../components/AI-Assistant/ChatPromptLimitReached";
import ErrorMessageBox from "../components/AI-Assistant/ErrorMessageBox";
import NoMessagesState from "../components/AI-Assistant/NoMessagesState";
import Loader1 from "../components/Loaders/Loader1";

const AiAssistant = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const {
    sessions,
    messages,
    activeSessionId,
    loading,
    loadingAi,
    loadingMessages,
  } = useSelector((state: RootState) => state.chat);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sessionActionLoading, setSessionActionLoading] = useState({
    creatingSession: false,
    deletingSession: false,
  });
  const [isCreateSessionPopupOpen, setIsCreateSessionPopupOpen] =
    useState(false);

  const visibleHeight = window.innerHeight - 64;

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
      dispatch(fetchMessages(activeSessionId));
    }
  }, [activeSessionId, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToLastPrompt();
  }, [loadingAi]);

  const scrollToLastPrompt = () => {
    const parent = messagesEndRef.current;
    if (!parent || parent.children.length < 2) return;

    const secondLastChild = parent.children[parent.children.length - 2];
    secondLastChild.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!loadingAi) {
      scrollToBottom();
    }
  }, [activeSessionId, messages]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const atBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 50;

    setShowScrollButton(!atBottom);
  };

  const handleSend = (input: string) => {
    if (!user) return;
    if (!input.trim() || !activeSessionId) return;
    dispatch(
      sendMessage({
        userId: user?.uid,
        sessionId: activeSessionId,
        content: input,
      })
    );
  };

  const handleNewSession = async (newSessionTitle: string) => {
    if (!profile) {
      dispatch(setError("Profile not loaded yet"));
      return;
    }
    setSessionActionLoading({ ...sessionActionLoading, creatingSession: true });
    if (!user?.uid) return;
    const { chatService } = await import("../services/chatService");
    const sessionId = await chatService.createSession(
      user.uid,
      sessionList.length === 0 ? "New Chat" : newSessionTitle
    );
    await authService.updateUserProfile(user.uid, {
      ...profile,
      usage: {
        ...profile.usage,
        chatSessionCount: (profile.usage.chatSessionCount || 0) + 1,
      },
    });
    dispatch(setActiveSession(sessionId));
    setIsCreateSessionPopupOpen(false);
    setIsSidebarCollapsed(window.innerWidth < 768);
    setSessionActionLoading({
      ...sessionActionLoading,
      creatingSession: false,
    });
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    if (!user?.uid) return;
    const { chatService } = await import("../services/chatService");
    try {
      await chatService.renameSession(sessionId, newTitle);
    } catch (error) {
      console.error("Error renaming session:", error);
      dispatch(setError("Failed to rename chat session"));
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user?.uid) return;
    if (!profile) {
      dispatch(setError("Profile not loaded yet"));
      return;
    }
    setSessionActionLoading({ ...sessionActionLoading, deletingSession: true });
    if (activeSessionId === sessionId) {
      const newSessionList = sessionList.filter(
        (session) => session.id !== sessionId
      );
      if (newSessionList.length > 0) {
        dispatch(setActiveSession(newSessionList[0].id));
      } else {
        dispatch(setActiveSession(null));
      }
    }
    const { chatService } = await import("../services/chatService");
    try {
      await chatService.deleteSession(sessionId);
      await authService.updateUserProfile(user.uid, {
        ...profile,
        usage: {
          ...profile.usage,
          chatSessionCount: (profile.usage.chatSessionCount || 0) - 1,
        },
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      dispatch(setError("Failed to delete chat session"));
    } finally {
      setSessionActionLoading({
        ...sessionActionLoading,
        deletingSession: false,
      });
    }
  };

  const sessionList = Object.values(sessions);
  const currentMessages = activeSessionId
    ? messages[activeSessionId] || []
    : [];
  const renderedMessages: ChatMessage[] = [...currentMessages];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div
      style={{ height: visibleHeight, maxHeight: visibleHeight }}
      className="relative flex overflow-hidden w-full"
    >
      {isSidebarCollapsed && !loading && sessionList.length > 0 && (
        <div className="text-gray-900 absolute top-3 left-3 z-10 bg-black/10 backdrop-blur-xl rounded-full">
          <button onClick={toggleSidebar} className="p-2 bg-transparent">
            <GoSidebarCollapse size={22} />
          </button>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center w-full min-h-screen bg-gray-50">
          <Loader1 />
        </div>
      ) : sessionList.length === 0 ? (
        <EmptyChatState onCreateNewChat={() => handleNewSession("New Chat")} />
      ) : (
        <>
          {!loading && !isSidebarCollapsed && sessionList.length > 0 && (
            <motion.div
              className={`w-full absolute top-0 left-0 sm:static sm:max-w-[300px] h-full bg-black/50 md:bg-transparent backdrop-blur-sm z-20 overflow-y-auto`}
            >
              <AnimatePresence>
                <motion.div
                  key="sidebar"
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 30 }}
                  className="h-full max-w-[300px] p-2"
                >
                  <Sidebar
                    sessions={sessionList}
                    activeSessionId={activeSessionId}
                    onSelectSession={(id) => dispatch(setActiveSession(id))}
                    onRenameSession={handleRenameSession}
                    onDeleteSession={handleDeleteSession}
                    setIsCreateSessionPopupOpen={(value: boolean) =>
                      setIsCreateSessionPopupOpen(value)
                    }
                    isCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={(value) =>
                      setIsSidebarCollapsed(value)
                    }
                    sessionActionLoading={sessionActionLoading}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
          <div className="flex flex-col justify-center w-full max-w-full md:max-w-[900px] mx-auto px-2 max-h-full overflow-hidden">
            {loadingMessages ? (
              <div className="flex justify-center items-center w-full min-h-screen bg-gray-50">
                <Loader1 />
              </div>
            ) : (
              <>
                <div
                  ref={chatContainerRef}
                  onScroll={handleScroll}
                  className={`flex flex-col flex-1 max-w-full overflow-auto`}
                >
                  {!loading &&
                  renderedMessages.length === 0 &&
                  !sessions[activeSessionId || ""]?.error ? (
                    <NoMessagesState />
                  ) : (
                    <div
                      style={{
                        paddingBottom: `${loadingAi ? 260 : 0}px`,
                      }}
                      ref={messagesEndRef}
                      className="min-w-full"
                    >
                      {renderedMessages.map((msg, idx) => (
                        <Message
                          key={idx}
                          message={msg}
                          isUser={msg.sender === "user"}
                          showLoading={
                            !sessions[activeSessionId as string]?.error &&
                            msg.sender === "ai" &&
                            msg.content === ""
                          }
                        />
                      ))}
                      {!loading &&
                        activeSessionId &&
                        sessions[activeSessionId]?.error && (
                          <ErrorMessageBox
                            message={sessions[activeSessionId]?.error}
                          />
                        )}
                    </div>
                  )}
                </div>
                <div ref={inputRef} className={`w-full max-w-full`}>
                  <div className="w-full relative pb-2">
                    {renderedMessages && showScrollButton && (
                      <div
                        onClick={scrollToBottom}
                        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 mx-auto cursor-pointer bg-black/50 backdrop-blur-sm text-white shadow-xl rounded-full p-1 flex items-center justify-center`}
                      >
                        <IoMdArrowDown size={28} />
                      </div>
                    )}
                    {!loading &&
                    (profile?.usage.aiPromptUsage?.count as number) >=
                      (profile?.quotas.promptsPerDay as number) ? (
                      <div ref={inputRef} className="w-full pb-2">
                        <ChatPromptLimitReached
                          usedPrompts={
                            profile?.usage.aiPromptUsage?.count as number
                          }
                          promptLimit={profile?.quotas.promptsPerDay as number}
                          aiCredits={profile?.usage.aiCreditsUsed as number}
                          userPlan={profile?.role || "free"}
                        />
                      </div>
                    ) : !loading && profile && sessionList.length > 0 ? (
                      <div className="w-full pt-2">
                        <PromptInput
                          onSend={handleSend}
                          disabled={
                            !activeSessionId ||
                            loading ||
                            loadingAi ||
                            loadingMessages
                          }
                          loading={loading || loadingAi}
                          placeholder="Type your message..."
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
      <NewSessionPopup
        isOpen={isCreateSessionPopupOpen}
        onClose={() => setIsCreateSessionPopupOpen(false)}
        onAddSession={handleNewSession}
        isSubmitting={sessionActionLoading.creatingSession}
      />
    </div>
  );
};

export default AiAssistant;
