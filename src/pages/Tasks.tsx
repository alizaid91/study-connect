import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addTask, updateTask, deleteTask, setTasks } from '../store/slices/taskSlice';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { Task } from '../store/slices/taskSlice';

const Tasks = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow-md p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{task.title}</h3>
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
            <p className="text-gray-600">{task.description}</p>
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : task.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {task.status}
              </span>
              <p className="text-sm text-gray-500">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(task)}
                className="btn btn-secondary"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="btn bg-red-100 text-red-800 hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingTask ? 'Edit Task' : 'Add Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })
                  }
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'todo' | 'in-progress' | 'completed' })
                  }
                  className="input"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                    setFormData({
                      title: '',
                      description: '',
                      dueDate: '',
                      priority: 'medium',
                      status: 'todo',
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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