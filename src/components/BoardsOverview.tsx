import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { Board } from '../types/content';
import BoardFormModal from './BoardFormModal';
import {
  saveBoard,
  deleteBoardWithContent
} from '../services/taskServics';

interface BoardsOverviewProps {
  boards: Board[];
  onSelectBoard: (boardId: string) => void;
}

const BoardsOverview = ({ boards, onSelectBoard }: BoardsOverviewProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [deletingBoard, setDeletingBoard] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<string | null>(null);

  // Reference for clicked elements to handle click outside
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

  const handleCreateBoard = () => {
    setEditingBoard(null);
    setIsBoardModalOpen(true);
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setIsBoardModalOpen(true);
    setMenuOpenFor(null);
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!user?.uid || boards.length <= 1) return;

    setIsSubmitting(true);
    setDeletingBoard(true);
    setDeleteIndex(boardId);
    try {
      await deleteBoardWithContent(boardId);
    } catch (error) {
      console.error('Error deleting board:', error);
    } finally {
      setIsSubmitting(false);
      setDeleteIndex(null);
      setDeletingBoard(false);
      setMenuOpenFor(null);
    }
  };

  const handleSaveBoard = async (title: string) => {
    if (!user?.uid) return;

    setIsSubmitting(true);
    try {
      if (editingBoard) {
        await saveBoard(title, user.uid, boards.length, editingBoard);
      } else {
        await saveBoard(title, user.uid, boards.length);
      }

    } catch (error) {
      console.error('Error saving board:', error);
    } finally {
      setIsSubmitting(false);
      setIsBoardModalOpen(false);
    }
  };

  const toggleMenu = (boardId: string) => {
    setMenuOpenFor(menuOpenFor === boardId ? null : boardId);
  };

  const getRandomGradient = (index: number) => {
    const gradients = [
      'from-blue-400 to-indigo-600',
      'from-green-400 to-emerald-600',
      'from-purple-400 to-violet-600',
      'from-amber-400 to-orange-600',
      'from-red-400 to-rose-600',
      'from-pink-400 to-fuchsia-600',
      'from-cyan-400 to-sky-600',
      'from-teal-400 to-emerald-600'
    ];

    return gradients[index % gradients.length];
  };

  // Handle board selection with animation effect
  const handleBoardSelection = (boardId: string) => {
    onSelectBoard(boardId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">My Boards</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateBoard}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          disabled={isSubmitting}
        >
          <FiPlus />
          <span>Create New Board</span>
        </motion.button>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-medium text-gray-600 mb-4">No boards yet</h2>
          <p className="text-gray-500 mb-6">Create your first board to get started organizing your tasks</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateBoard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 mx-auto"
          >
            <FiPlus />
            <span>Create First Board</span>
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board, index) => (
            <div key={board.id} className="relative group">
              <div className={`absolute z-50 inset-0 bg-white/70 ${deletingBoard && deleteIndex === board.id ? 'flex' : 'hidden'} items-center justify-center text-red-600 text-md font-bold`}>Deleting...</div>
              <motion.div
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-br ${getRandomGradient(index)} h-48 rounded-lg shadow-md flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer`}
                onClick={() => handleBoardSelection(board.id)}
              >
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-white text-xl font-semibold mb-2 truncate">{board.title}</h2>
                    {board.isDefault && (
                      <span className="text-white text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-white text-opacity-80 text-sm">
                    Created: {new Date(board.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>

              <div
                className="absolute top-2 right-2"
                ref={el => menuRefs.current[board.id] = el}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(board.id);
                  }}
                  className="p-1.5 bg-white bg-opacity-30 hover:bg-opacity-40 rounded-full text-white transition-colors duration-200"
                >
                  <FiMoreVertical size={18} />
                </button>

                {menuOpenFor === board.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 py-1 animate-fadeIn">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditBoard(board);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FiEdit2 className="mr-2" size={14} />
                      Edit
                    </button>
                    {!board.isDefault && boards.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBoard(board.id);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <FiTrash2 className="mr-2" size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          <motion.div
            whileHover={{ y: -5 }}
            className="border-2 border-dashed border-gray-300 h-48 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors duration-300 bg-white"
            onClick={handleCreateBoard}
          >
            <div className="bg-gray-100 p-3 rounded-full mb-3">
              <FiPlus size={24} className="text-gray-500" />
            </div>
            <span className="text-gray-600 font-medium">Add New Board</span>
          </motion.div>
        </div>
      )}

      <BoardFormModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onSave={handleSaveBoard}
        isSubmitting={isSubmitting}
        initialTitle={editingBoard?.title || ''}
        mode={editingBoard ? 'edit' : 'create'}
      />
    </div>
  );
};

export default BoardsOverview; 