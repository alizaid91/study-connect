import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task, List } from '../types/content';
import TaskCard from './TaskCard';
import { FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2, FiLock, FiCheckCircle, FiClipboard } from 'react-icons/fi';

interface TaskListProps {
  list: List;
  tasks: Task[];
  onAddTask: (listId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditList: (list: List, newTitle: string) => void;
  onDeleteList: (listId: string) => void;
}

const TaskList = ({
  list,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditList,
  onDeleteList
}: TaskListProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(list.title);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if this is the default list (position 0)
  const isDefaultList = list.position === 0;

  // Calculate completion metrics
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed);
    setCompletedTasks(completedTasks);
  }, [tasks]);

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

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() !== '') {
      onEditList(list, newTitle);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-md w-72 min-w-[300px] md:min-w-[340px] max-w-[90vw] mx-2 flex-shrink-0 flex flex-col h-fit max-h-full ${isDefaultList ? 'border-l-4 border-blue-500' : 'border border-gray-100'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-3 flex justify-between items-center border-b border-gray-100">
        {isEditing ? (
          <form onSubmit={handleTitleSubmit} className="flex-1">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onBlur={handleTitleSubmit}
            />
          </form>
        ) : (
          <h3
            className="font-medium text-gray-800 px-1 py-1 cursor-pointer truncate flex items-center"
            onClick={() => {
              setIsEditing(true);
              setNewTitle(list.title);
            }}
            title={list.title}
          >
            {isDefaultList && <FiLock className="mr-1 text-blue-500" size={14} />}
            {list.title} <span className="text-sm text-gray-400 ml-1">({tasks.length})</span>
          </h3>
        )}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
          >
            <FiMoreHorizontal size={16} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white shadow-lg rounded-md overflow-hidden z-10">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setNewTitle(list.title);
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiEdit2 className="mr-2" size={14} />
                Edit
              </button>
              {!isDefaultList ? (
                <button
                  onClick={() => {
                    onDeleteList(list.id);
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <FiTrash2 className="mr-2" size={14} />
                  Delete
                </button>
              ) : (
                <div className="flex w-full items-center px-4 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed">
                  <FiLock className="mr-2" size={14} />
                  Default List (Cannot Delete)
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-3 pt-2 pb-1">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center text-xs text-gray-500">
            <FiCheckCircle className="mr-1" size={12} />
            <span>{completedTasksCount} of {totalTasks} completed</span>
          </div>
          <div className="text-xs font-medium text-gray-500">
            {completionPercentage}%
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${completionPercentage === 100
              ? 'bg-green-500'
              : completionPercentage > 50
                ? 'bg-blue-500'
                : 'bg-blue-400'
              }`}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-380px)] md:max-h-[calc(100vh-260px)]">
        {tasks.length === 0 || completedTasks.length === tasks.length ? (
          <div className="flex flex-col items-center justify-center text-gray-400 py-8 text-sm">
            <FiClipboard className="mb-2 text-gray-300" size={24} />
            <p className="text-center">{completedTasks.length === tasks.length ? 'All Task Completed' : 'No tasks yet'}</p>
            <p className="text-center text-xs mt-1">{tasks.length === 0 ? 'Click below to add your first task!' : 'Nice Work!'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {
              tasks.map((task, index) => {
                if (!task.completed) {
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onEditTask={onEditTask}
                      onDeleteTask={onDeleteTask}
                    />
                  );
                }
                return null;
              })
            }
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 mt-3 flex items-center text-sm transition-colors font-medium"
          onClick={() => onAddTask(list.id)}
        >
          <FiPlus className="mr-2" />
          Add a task
        </motion.button>
      </div>
      {
        completedTasks.length > 0 && (
          <div className="p-2 bg-gray-200/70 m-2 rounded-lg">
            <div className={`w-full flex items-center justify-between cursor-pointer ${showCompletedTasks ? 'mb-4' : 'mb-0'}`} onClick={() => setShowCompletedTasks(!showCompletedTasks)}>
              <h4 className="text-md font-medium text-gray-800 ml-2">Completed Tasks</h4>
              <motion.svg
                animate={{ rotate: showCompletedTasks ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-5 h-5 transform-gpu text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </div>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: showCompletedTasks ? 'auto' : 0,
                opacity: showCompletedTasks ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden transform-gpu"
            >
              <div className="space-y-2">
                {completedTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )
      }
    </motion.div>
  );
};

export default TaskList; 