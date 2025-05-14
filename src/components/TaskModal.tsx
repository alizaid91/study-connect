import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, List, TaskForm, Board } from '../types/content';
import { FiX, FiPaperclip, FiExternalLink } from 'react-icons/fi';

// Helper function to format date to YYYY-MM-DD for input value
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid date

    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

// Helper to format date for display
const formatDateForDisplay = (dateString: string | undefined): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid date

    return date.toLocaleDateString();
  } catch (e) {
    return '';
  }
};

interface TaskModalProps {
  isOpen: boolean;
  lists: List[];
  task?: Task | null;
  boards: Board[];
  listId?: string;
  onClose: () => void;
  onSave: (taskData: TaskForm) => void;
  isSubmitting: boolean;
  boardId: string;
}

const TaskModal = ({
  isOpen,
  lists,
  boards,
  task,
  listId,
  onClose,
  onSave,
  isSubmitting,
  boardId
}: TaskModalProps) => {
  console.log(lists)
  const [form, setForm] = useState<TaskForm>({
    title: '',
    description: '',
    listId: listId || '',
    boardId: boardId,
    priority: 'medium',
    completed: false
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        listId: task.listId,
        boardId: task.boardId,
        priority: task.priority,
        dueDate: task.dueDate || '',
        attachments: task.attachments,
        completed: task.completed || false
      });
    } else if (listId) {
      setForm({
        title: '',
        description: '',
        listId: listId,
        boardId: boardId,
        priority: 'medium',
        dueDate: '',
        completed: false
      });
    }
  }, [task, listId, boardId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a copy of the form data
    const formData = { ...form };

    // If dueDate is empty string, set it to undefined so it gets removed in the backend
    if (formData.dueDate === '') {
      delete formData.dueDate;
    }

    // Remove attachments if undefined or empty array
    if (!formData.attachments || formData.attachments.length === 0) {
      delete formData.attachments;
    }

    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;


    setForm((prev) => {
      if (name as string === "boardId") {
        return {
          ...prev,
          [name]: value,
          listId: lists.find(list => list.boardId === value)?.id || '',
        }
      }

      return {
        ...prev,
        [name]: value,
      }
    })
  };

  const handleClearDate = () => {
    setForm(prev => ({ ...prev, dueDate: '' }));
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
          />
          <div className="px-4 w-full">
            <motion.div
              className="bg-white max-h-[90vh] overflow-y-auto rounded-lg shadow-xl w-full max-w-md relative mx-auto"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {task ? 'Edit Task' : 'Add Task'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                      <select
                        name="boardId"
                        value={form.boardId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="" disabled>Select a board</option>
                        {boards.map(board => (
                          <option key={board.id} value={board.id}>
                            {board.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">List</label>
                      <select
                        name="listId"
                        value={form.listId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="" disabled>Select a list</option>
                        {lists.filter((list) => list.boardId === form.boardId).map(list => (
                          <option key={list.id} value={list.id}>
                            {list.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Task title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          name="priority"
                          value={form.priority}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <div className="relative flex items-center">
                          <input
                            type="date"
                            name="dueDate"
                            value={formatDateForInput(form.dueDate)}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {form.dueDate && (
                            <button
                              type="button"
                              onClick={handleClearDate}
                              className="absolute right-2 text-gray-400 hover:text-gray-600"
                            >
                              <FiX size={16} />
                            </button>
                          )}
                        </div>
                        {form.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {formatDateForDisplay(form.dueDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Task Status */}
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="completed"
                          name="completed"
                          checked={form.completed}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                        />
                        <label htmlFor="completed" className="ml-2 text-sm font-medium text-gray-700">
                          Mark as completed
                        </label>
                      </div>
                    </div>

                    {/* Attachments Section */}
                    {form.attachments && form.attachments.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Attachments
                        </label>
                        <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                          {form.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between mb-2 last:mb-0">
                              <div className="flex items-center">
                                <FiPaperclip className="text-gray-500 mr-2" size={16} />
                                <span className="text-sm text-gray-600 truncate max-w-[240px]">
                                  {attachment.split('/').pop()}
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => window.open(attachment, '_blank')}
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                >
                                  <FiExternalLink size={14} className="mr-1" />
                                  View
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {task ? 'Saving...' : 'Adding...'}
                          </>
                        ) : (
                          task ? 'Save Changes' : 'Add Task'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskModal; 