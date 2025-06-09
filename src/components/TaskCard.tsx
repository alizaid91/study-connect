import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Priority } from '../types/content';
import { FiClock, FiMoreHorizontal, FiEdit2, FiTrash2, FiPaperclip, FiExternalLink, FiCheck, FiSquare } from 'react-icons/fi';
import { toggleTaskCompletion } from '../services/taskServics';

interface TaskCardProps {
  task: Task;
  index: number;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const TaskCard = ({ task, index, onEditTask, onDeleteTask }: TaskCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(task.completed || false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsCompleted(task.completed || false);
  }, [task.completed]);
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  // Function to open the first attachment (paper) in a new tab
  const openPaperAttachment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.attachments && task.attachments.length > 0) {
      window.open(task.attachments[0], '_blank');
    }
    setIsMenuOpen(false);
  };

  // Function to toggle task completion
  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    
    try {
      await toggleTaskCompletion(task.id, newCompletedState);
    } catch (error) {
      // Revert state on error
      setIsCompleted(isCompleted);
      console.error('Error toggling task completion:', error);
    }
  };

  // Determine if this task has a paper attachment
  const hasPaperAttachment = task.attachments && task.attachments.length > 0;

  return (
    <motion.div
      className="mb-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`border border-gray-300/70 bg-white rounded-lg hover:shadow-sm p-3 transition-all ${isCompleted ? 'opacity-75' : 'opacity-100'}`}
      >
        <div className="flex">
          {/* Checkbox Column */}
          <div className="flex-shrink-0 mr-3 pt-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleCompletion}
              className={`w-5 h-5 flex items-center justify-center rounded-md border ${
                isCompleted 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'border-gray-300 text-transparent hover:border-blue-500'
              }`}
            >
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiCheck size={14} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Content Column */}
          <div className="flex-grow min-w-0">
            <div 
              className="cursor-pointer"
              onClick={() => onEditTask(task)}
            >
              {/* Title and Menu Row */}
              <div className="flex items-start justify-between mb-1">
                <h3 className={`font-medium text-gray-800 text-sm pr-2 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h3>
                <div className="relative flex-shrink-0" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                  >
                    <FiMoreHorizontal size={16} />
                  </button>
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-1 w-40 bg-white shadow-lg rounded-md overflow-hidden z-50"
                      >
                        {hasPaperAttachment && (
                          <button
                            onClick={openPaperAttachment}
                            className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                          >
                            <FiExternalLink className="mr-2" size={14} />
                            View Paper
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                            setIsMenuOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FiEdit2 className="mr-2" size={14} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                            setIsMenuOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <FiTrash2 className="mr-2" size={14} />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Description Row */}
              {task.description && (
                <p className={`text-gray-600 text-sm mb-2 line-clamp-2 ${isCompleted ? 'text-gray-400' : ''}`}>
                  {task.description}
                </p>
              )}

              {/* Footer Row */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center flex-wrap gap-2">
                  {task.dueDate && (
                    <div className="flex items-center text-xs text-gray-500">
                      <FiClock size={12} className="mr-1" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {hasPaperAttachment && (
                    <button
                      onClick={openPaperAttachment}
                      className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                      title="View attached paper"
                    >
                      <FiExternalLink size={12} className="mr-1" />
                      <span>View Paper</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {hasPaperAttachment && (
                    <div className="flex items-center text-xs text-gray-500">
                      <FiPaperclip size={12} className="mr-1" />
                      <span>{task.attachments?.length}</span>
                    </div>
                  )}
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard; 