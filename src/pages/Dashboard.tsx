import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchBookmarks } from '../store/slices/bookmarkSlice';
import { formatDate } from '../utils/dateUtils';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { setTasks, setLists } from '../store/slices/taskSlice';
import { setResources } from '../store/slices/resourceSlice';
import { Resource, Task, List } from '../types/content';
import { fetchPapers } from '../store/slices/papersSlice';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import { FiClock, FiPaperclip, FiExternalLink } from 'react-icons/fi';

const loader = (<div className="flex flex-row gap-2 ml-1 mt-4">
  <div className="w-3 h-3 rounded-full bg-primary-600 animate-bounce"></div>
  <div className="w-3 h-3 rounded-full bg-primary-600 animate-bounce [animation-delay:-.3s]"></div>
  <div className="w-3 h-3 rounded-full bg-primary-600 animate-bounce [animation-delay:-.5s]"></div>
</div>)

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tasks, lists } = useSelector((state: RootState) => state.tasks);
  const { resources, loading: resourcesLoading } = useSelector((state: RootState) => state.resources);
  const { papers, loading: papersLoading } = useSelector((state: RootState) => state.papers);
  const { bookmarks, loading: bookmarksLoading } = useSelector((state: RootState) => state.bookmarks);
  const [loading, setLoading] = useState({
    tasks: false,
    resources: false,
    lists: false,
  });

  // Get task priorities for styling
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
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

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // fetch user-specific tasks
        const fetchUserTasks = async () => {
          setLoading(prev => ({ ...prev, tasks: true }));
          const tasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(tasksQuery);
          const tasksData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          dispatch(setTasks(tasksData as Task[]));
          setLoading(prev => ({ ...prev, tasks: false }));
        };

        // fetch task lists
        const fetchTaskLists = async () => {
          setLoading(prev => ({ ...prev, lists: true }));
          const listsQuery = query(
            collection(db, 'lists'),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(listsQuery);
          const listsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          dispatch(setLists(listsData as List[]));
          setLoading(prev => ({ ...prev, lists: false }));
        };

        // fetch all resources
        const fetchAllResources = async () => {
          setLoading(prev => ({ ...prev, resources: true }));
          const resourcesQuery = query(
            collection(db, 'resources'),
            orderBy('uploadedAt', 'desc')
          );
          const snapshot = await getDocs(resourcesQuery);
          const resourcesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          dispatch(setResources(resourcesData as Resource[]));
          setLoading(prev => ({ ...prev, resources: false }));
        };

        dispatch(fetchBookmarks(user.uid));
        dispatch(fetchPapers());
        
        await fetchUserTasks();
        await fetchTaskLists();
        await fetchAllResources();
      }
    };
    fetchData();
  }, [user, dispatch]);

  // Get tasks by list
  const getTasksByList = (listId: string) => {
    return tasks.filter(task => task.listId === listId);
  };

  // Get the default list (position 0)
  const defaultList = lists.find(list => list.position === 0);
  
  // Get tasks for stats display
  const totalTasks = tasks.length;
  const defaultListTasks = defaultList ? getTasksByList(defaultList.id).length : 0;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;

  const recentTasks = tasks.slice(0, 5);
  const recentResources = resources.slice(0, 5);
  const recentBookmarks = bookmarks.slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Function to open an attachment in a new tab
  const openAttachment = (attachmentUrl: string) => {
    window.open(attachmentUrl, '_blank');
  };

  return (
    <motion.div
      className="space-y-8 container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="px-2 flex justify-between items-center"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <Link to="/tasks" className="btn btn-primary">
            Add Task
          </Link>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/tasks" className="block">
            <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
            {loading.tasks ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-primary-600">{totalTasks}</p>
                <FaArrowRight className="text-primary-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/tasks" className="block">
            <h3 className="text-lg font-semibold text-gray-700">Default List Tasks</h3>
            {loading.tasks || loading.lists ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-blue-600">{defaultListTasks}</p>
                <FaArrowRight className="text-blue-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/tasks" className="block">
            <h3 className="text-lg font-semibold text-gray-700">High Priority Tasks</h3>
            {loading.tasks ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-red-600">{highPriorityTasks}</p>
                <FaArrowRight className="text-red-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/pyqs" className="block">
            <h3 className="text-lg font-semibold text-gray-700">Available Papers</h3>
            {papersLoading ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-blue-600">{papers.length}</p>
                <FaArrowRight className="text-blue-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/resources" className="block">
            <h3 className="text-lg font-semibold text-gray-700">Available Resources</h3>
            {resourcesLoading ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-primary-600">{resources.length}</p>
                <FaArrowRight className="text-primary-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/bookmarks" className="block">
            <h3 className="text-lg font-semibold text-gray-700">Bookmarks</h3>
            {bookmarksLoading ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-purple-600">{bookmarks.length}</p>
                <FaArrowRight className="text-purple-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>
      </motion.div>

      {/* Bookmarks */}
      <motion.div
        className="bg-white rounded-lg shadow-md p-6"
        variants={itemVariants}
        whileHover={{ y: -5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Bookmarks</h2>
          <Link to="/bookmarks" className="text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm md:text-base lg:text-md">
            View All <FaArrowRight />
          </Link>
        </div>
        <div className="space-y-3">
          {recentBookmarks.length > 0 ? (
            recentBookmarks.map(bookmark => (
              <motion.div
                key={bookmark.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <div className='pr-4'>
                  <h3 className="text-sm md:text-base lg:text-md font-medium">{bookmark.title}</h3>
                  <p className="text-xs md:text-sm lg:text-base text-gray-600">
                    {bookmark.type} • {formatDate(bookmark.createdAt)}
                  </p>
                </div>
                <a
                  href={bookmark.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary flex items-center gap-2 text-sm md:text-base lg:text-md"
                >
                  View <FaArrowRight />
                </a>
              </motion.div>
            ))
          ) : (
            <p className="text-sm md:text-base lg:text-md text-gray-600">No bookmarks yet. Start bookmarking papers and resources!</p>
          )}
        </div>
      </motion.div>

      {/* Recent Tasks */}
      <motion.div
        className="bg-white rounded-lg shadow-md p-6"
        variants={itemVariants}
        whileHover={{ y: -5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Tasks</h2>
          <Link to="/tasks" className="text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm md:text-base lg:text-md">
            View All <FaArrowRight />
          </Link>
        </div>
        <div className="space-y-3">
          {recentTasks.length > 0 ? (
            recentTasks.map(task => (
              <motion.div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <div className='pr-4'>
                  <h3 className="text-sm md:text-base lg:text-md font-medium">{task.title}</h3>
                  <div className="flex items-center mt-1 flex-wrap">
                    {task.dueDate && (
                      <span className="flex items-center text-xs text-gray-600 mr-3">
                        <FiClock size={12} className="mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.attachments && task.attachments.length > 0 && (
                      <button
                        onClick={() => openAttachment(task.attachments![0])}
                        className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                      >
                        <FiExternalLink size={12} className="mr-1" />
                        <span>View Paper</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="flex items-center text-xs text-gray-500 mr-2">
                      <FiPaperclip size={12} className="mr-1" />
                      <span>{task.attachments.length}</span>
                    </div>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs md:text-sm lg:text-base ${getPriorityColor(task.priority as 'low' | 'medium' | 'high')}`}>
                    {task.priority}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm md:text-base lg:text-md text-gray-600">No tasks yet. Create your first task!</p>
          )}
        </div>
      </motion.div>

      {/* Recent Resources */}
      <motion.div
        className="bg-white rounded-lg shadow-md p-6"
        variants={itemVariants}
        whileHover={{ y: -5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Resources</h2>
          <Link to="/resources" className="text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm md:text-base lg:text-md">
            View All <FaArrowRight />
          </Link>
        </div>
        <div className="space-y-3">
          {recentResources.length > 0 ? (
            recentResources.map(resource => (
              <motion.div
                key={resource.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <div className='pr-4'>
                  <h3 className="text-sm md:text-base lg:text-md font-medium">{resource.title}</h3>
                  <p className="text-xs md:text-sm lg:text-base text-gray-600">
                    {resource.type} • {resource.subjectName}
                  </p>
                </div>
                <a
                  href={resource.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary flex items-center gap-2 text-sm md:text-base lg:text-md"
                >
                  View <FaArrowRight />
                </a>
              </motion.div>
            ))
          ) : (
            <p className="text-sm md:text-base lg:text-md text-gray-600">No resources available yet.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 