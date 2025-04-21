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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
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
      }
    };

    fetchTasks();
  }, [user?.uid, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const taskData = {
      ...formData,
      userId: user.uid,
    };

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
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      dispatch(deleteTask(taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
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
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, { status: newStatus });
      dispatch(updateTask({ ...task, status: newStatus }));
    } catch (error) {
      console.error('Error toggling task status:', error);
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

  return (
    <div>
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
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleToggleComplete(task)} className="focus:outline-none">
                    {task.status === 'completed' ? (
                      <AiOutlineCheckCircle className="text-green-500" size={20} />
                    ) : (
                      <FaRegCircle className="text-gray-400" size={20} />
                    )}
                  </button>
                  <h3 className={`text-xl font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
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
                  className={`px-3 py-1 rounded-full text-sm ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(task)} className="btn btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(task.id)} className="btn bg-red-100 text-red-800 hover:bg-red-200">
                  Delete
                </button>
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {editingTask ? 'Update' : 'Add'} Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks; 