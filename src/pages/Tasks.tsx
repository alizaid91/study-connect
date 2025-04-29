import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addTask, updateTask, deleteTask, setTasks } from '../store/slices/taskSlice';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { Task } from '../store/slices/taskSlice';
import { FaGripVertical, FaRegCircle } from 'react-icons/fa';
import { AiOutlineCheckCircle, AiOutlineInbox } from 'react-icons/ai';

const Tasks = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [upadtingTask, setUpdatingTask] = useState(false)
  const [addingTask, setAddingTasks] = useState(false)
  const [deletingTask, setDeletingTask] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(String);
  const [taskToToggleStatus, setTaskToToggleStatus] = useState('');
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'userId'>>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
  });

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.uid) {
        console.log('No user ID found');
        return;
      }
      setLoading(true)
      try {
        // console.log('Fetching tasks for user:', user.uid);
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(tasksQuery);
        // console.log('Firestore query result:', querySnapshot.docs.map(doc => doc.data()));

        const fetchedTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];

        // console.log('Processed tasks:', fetchedTasks);
        dispatch(setTasks(fetchedTasks));
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false)
      }
    };

    fetchTasks();
  }, [user?.uid, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setAddingTasks(true)
    const taskData = {
      ...formData,
      userId: user.uid,
    };
    setUpdatingTask(true)
    try {
      if (editingTask) {
        const taskRef = doc(db, 'tasks', editingTask.id);
        await updateDoc(taskRef, taskData);
        dispatch(updateTask({ ...taskData, id: editingTask.id }));
      } else {
        const docRef = await addDoc(collection(db, 'tasks'), taskData);
        dispatch(addTask({ ...taskData, id: docRef.id }));
      }
      setIsModalOpen(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
      });
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setAddingTasks(false)
      setUpdatingTask(false)
    }
  };

  const handleDelete = async (taskId: string) => {
    setDeletingTask(true)
    setTaskToDelete(taskId)
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      dispatch(deleteTask(taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeletingTask(false)
      setTaskToDelete("")
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    setTaskToToggleStatus(task.id);
    setTogglingStatus(true)
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, { status: newStatus });
      dispatch(updateTask({ ...task, status: newStatus }));
    } catch (error) {
      console.error('Error toggling task status:', error);
    } finally {
      setTogglingStatus(false)
    }
  };

  const handleDragStart = (task: Task, index: number) => {
    setDraggedTask(task);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedTask && draggedIndex !== null) {
      const updated = [...tasks];
      updated.splice(draggedIndex, 1);
      updated.splice(index, 0, draggedTask);
      dispatch(setTasks(updated));
    }
    setDraggedTask(null);
    setDraggedIndex(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8 pt-2">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-3xl font-bold">Tasks</h1>
        {
          tasks.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              Add Task
            </button>
          )
        }
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 col-span-full">
            <AiOutlineInbox className="text-gray-300" size={64} />
            <p className="mt-4 text-gray-500 text-lg">No tasks found</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary mt-6"
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow-md p-6 space-y-4"
              draggable
              onDragStart={(e) => handleDragStart(task, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleToggleComplete(task)} className="focus:outline-none flex items-center justify-center">
                    {
                      togglingStatus && task.id === taskToToggleStatus
                        ? <div role="status" className="inline-flex items-center">
                          <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></div>
                          <span className="sr-only">Changing...</span>
                        </div>
                        : (task.status === 'completed' ? (
                          <AiOutlineCheckCircle className="text-green-500" size={20} />
                        ) : (
                          <FaRegCircle className="text-gray-400" size={20} />
                        ))
                    }
                  </button>
                  <h3 className={`bg-gray-200/40 rounded-md py-1 px-2 text-base sm:text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </h3>
                </div>
                <FaGripVertical className="text-gray-400 cursor-move" size={20} />
              </div>
              <p className="text-gray-600">{task.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${task.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                    }`}
                >
                  {task.priority}
                </span>
              </div>
              <div className="flex flex-col gap-2 text-center sm:flex-row">
                {
                  task.attachPaperContent
                  && <a
                    href={task.attachPaperContent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 rounded inline-block"
                  >
                    View Paper
                  </a>
                }
                <button onClick={() => handleEdit(task)} className="btn btn-secondary">
                  Edit
                </button>
                {
                  deletingTask && taskToDelete === tasks[index].id
                    ? <button disabled type="button" className="btn text-red-800 bg-red-100 hover:bg-red-200 focus:ring-4 focus:ring-red-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-red-100 dark:hover:bg-red-200 dark:focus:ring-red-400 inline-flex items-center justify-center">
                      <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                      </svg>
                      Deleting...
                    </button>
                    : <button onClick={() => handleDelete(task.id)} className="btn bg-red-100 text-red-800 hover:bg-red-200">
                      Delete
                    </button>
                }
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative mx-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingTask(null);
                setFormData({ title: '', description: '', dueDate: '', priority: 'medium', status: 'todo' });
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingTask ? 'Edit Task' : 'Add Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  placeholder="Task Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Task Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  placeholder="Due Date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'todo' | 'in-progress' | 'completed' })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                    setFormData({ title: '', description: '', dueDate: '', priority: 'medium', status: 'todo' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                {
                  addingTask || upadtingTask
                    ? <button disabled type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center justify-center">
                      <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                      </svg>
                      {editingTask ? 'Updating...' : 'Saving...'}
                    </button>
                    : <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      {editingTask ? 'Update' : 'Add'} Task
                    </button>
                }
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks; 