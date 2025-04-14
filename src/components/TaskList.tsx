import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addTask, setTasks } from '../store/slices/taskSlice';
import { Task } from '../store/slices/taskSlice';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const TaskList: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.uid) {
        console.log('No user ID found');
        return;
      }
      
      try {
        console.log('Fetching tasks for user:', user.uid);
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(tasksQuery);
        console.log('Firestore query result:', querySnapshot.docs.map(doc => doc.data()));
        
        const fetchedTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        
        console.log('Processed tasks:', fetchedTasks);
        dispatch(setTasks(fetchedTasks));
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [user?.uid, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      console.log('No user ID found when submitting task');
      return;
    }

    const taskData: Omit<Task, 'id'> = {
      title,
      description,
      dueDate,
      priority,
      status: 'todo',
      userId: user.uid,
    };

    try {
      console.log('Adding task to Firestore:', taskData);
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      console.log('Task added with ID:', docRef.id);
      
      const newTask: Task = {
        id: docRef.id,
        ...taskData
      };

      console.log('Dispatching task to Redux:', newTask);
      dispatch(addTask(newTask));
      
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Task
        </button>
      </form>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="text-gray-600 mt-1">{task.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="text-indigo-600 hover:text-indigo-800"
                  onClick={() => {/* TODO: Implement edit */}}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {/* TODO: Implement delete */}}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;