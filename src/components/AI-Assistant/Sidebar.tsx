import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../../types/chat';
import { FiMessageSquare, FiEdit2, FiTrash2, FiLoader } from 'react-icons/fi';
import { GoSidebarExpand } from "react-icons/go";
import { motion, AnimatePresence } from 'framer-motion';
import { CiMenuKebab } from "react-icons/ci";
import { FiEdit } from "react-icons/fi";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => Promise<void>;
  setIsCreateSessionPopupOpen: (value: boolean) => void;
  isCollapsed: boolean;
  setIsSidebarCollapsed: (value: boolean) => void;
  sessionActionLoading: {
    creatingSession: boolean;
    deletingSession: boolean;
  };
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  setIsCreateSessionPopupOpen,
  isCollapsed,
  setIsSidebarCollapsed,
  sessionActionLoading
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteSeesionId, setDeleteSessionId] = useState<string | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpenFor) {
        const menuRef = menuRefs.current[menuOpenFor];
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setMenuOpenFor(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenFor]);

  const handleEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSave = () => {
    if (editingId && editTitle.trim()) {
      onRenameSession(editingId, editTitle.trim());
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleDeleteClick = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      setDeleteSessionId(sessionId);
      onDeleteSession(sessionId).then(() => {
        setDeleteSessionId(null);
      })
      setMenuOpenFor(null);
    }
  };

  return (
    <div className="h-full max-w-[300px] bg-white border-r border-gray-200 flex flex-col rounded-3xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div onClick={() => setIsCreateSessionPopupOpen(true)} className='w-fit py-2 px-3 border border-gray-200 hover:bg-gray-100 rounded-3xl flex items-center justify-center gap-2 cursor-pointer'>
          <FiEdit size={20} /> <span>New Chat</span>
        </div>
        <div onClick={() => setIsSidebarCollapsed(true)} className='text-gary-900 bg-gray-200/80 rounded-full'>
          <button
            className="p-2"
          >
            <GoSidebarExpand size={22} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <h1 className="text-md font-semibold pl-5 pt-2 text-gray-800/90">Chats</h1>
        <AnimatePresence>
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`group p-2 px-4}`}
              ref={el => menuRefs.current[session.id] = el}
            >
              <div
                className={`relative group px-2 flex items-center justify-between rounded-lg transition-colors ${activeSessionId === session.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
                  }`}
              >
                {sessionActionLoading.deletingSession && session.id === deleteSeesionId && (
                  <div className="absolute top-0 left-0 w-full h-full rounded-lg bg-red-500/50 flex items-center justify-center pointer-events-none">
                    <FiLoader size={20} className="animate-spin text-red-500" />
                  </div>
                )}
                {editingId === session.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2 bg-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => {
                      onSelectSession(session.id);
                      setIsSidebarCollapsed(window.innerWidth < 768);
                    }}
                    className={`w-full text-left p-2 flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''
                      }`}
                  >
                    <FiMessageSquare size={18} />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{session.title}</span>
                    )}
                  </button>
                )}

                <div className='relative'>
                  <div className={`${sessionActionLoading.deletingSession && session.id === deleteSeesionId ? 'pointer-events-none' : ''} cursor-pointer ${menuOpenFor === session.id ? 'block' : 'block md:hidden md:group-hover:block'}`} onClick={() => setMenuOpenFor(session.id)}>
                    <CiMenuKebab size={18} />
                  </div>
                  {menuOpenFor && !isCollapsed && menuOpenFor === session.id && (
                    <div className="absolute right-0 top-6 z-50 flex flex-col items-center gap-1 bg-white rounded-lg shadow-md border border-gray-200 p-2 min-w-[100px]">
                      <button
                        onClick={() => handleEdit(session)}
                        className="w-full p-1 text-gray-500 hover:text-blue-600 rounded flex items-center gap-1"
                      >
                        <FiEdit2 size={14} />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(session.id)}
                        className="w-full p-1 text-gray-500 hover:text-red-600 rounded flex items-center gap-1"
                      >
                        <FiTrash2 size={14} />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Sidebar; 