import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchBookmarks } from '../store/slices/bookmarkSlice';
import { formatDate } from '../utils/dateUtils';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { resources } = useSelector((state: RootState) => state.resources);
  const { bookmarks } = useSelector((state: RootState) => state.bookmarks);

  useEffect(() => {
    if (user) {
      dispatch(fetchBookmarks(user.uid));
      // Resources are already set in the store from the Resources page
    }
  }, [dispatch, user]);

  const recentTasks = tasks.slice(0, 5);
  const recentResources = resources.slice(0, 5);
  const recentBookmarks = bookmarks.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <Link to="/tasks" className="btn btn-primary">
            Add Task
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
          <p className="text-3xl font-bold text-primary-600">{tasks.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Resources</h3>
          <p className="text-3xl font-bold text-primary-600">{resources.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Completed Tasks</h3>
          <p className="text-3xl font-bold text-primary-600">
            {tasks.filter(task => task.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Bookmarks</h3>
          <p className="text-3xl font-bold text-primary-600">{bookmarks.length}</p>
        </div>
      </div>

      {/* Bookmarks */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bookmarks</h2>
          <Link to="/bookmarks" className="text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {recentBookmarks.length > 0 ? (
            recentBookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
              >
                <div>
                  <h3 className="font-medium">{bookmark.title}</h3>
                  <p className="text-sm text-gray-600">
                    {bookmark.type} • {formatDate(bookmark.createdAt)}
                  </p>
                </div>
                <a
                  href={bookmark.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  View
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No bookmarks yet. Start bookmarking papers and resources!</p>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Tasks</h2>
          <Link to="/tasks" className="text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {recentTasks.length > 0 ? (
            recentTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
              >
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
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
              </div>
            ))
          ) : (
            <p className="text-gray-600">No tasks yet. Create your first task!</p>
          )}
        </div>
      </div>

      {/* Recent Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Resources</h2>
          <Link to="/resources" className="text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {recentResources.length > 0 ? (
            recentResources.map(resource => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
              >
                <div>
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-sm text-gray-600">
                    {resource.type} • {resource.subjectName}
                  </p>
                </div>
                <a
                  href={resource.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  View
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No resources available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 