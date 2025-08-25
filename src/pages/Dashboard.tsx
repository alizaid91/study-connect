import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { FiClock, FiPaperclip, FiExternalLink } from "react-icons/fi";
import { dashboardService, DashboardData } from "../services/dashboardService";
import { Bookmark, Resource } from "../types/content";
import { setShowPdf } from "../store/slices/globalPopups";

const loader = (
  <div className="flex flex-row gap-2 ml-1 mt-4">
    <div className="w-3 h-3 rounded-full bg-primary-600 animate-bounce"></div>
    <div className="w-3 h-3 rounded-full bg-primary-600 animate-bounce [animation-delay:-.3s]"></div>
    <div className="w-3 h-3 rounded-full bg-primary-600 animate-bounce [animation-delay:-.5s]"></div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const data = await dashboardService.getDashboardData(user.uid);
          setDashboardData(data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user, dispatch]);

  // Helper functions from dashboardService
  const getPriorityColor = dashboardService.getPriorityColor;

  // Extract data from dashboardData
  const tasks = dashboardData?.recentTasks || [];
  const resources: Resource[] = dashboardData?.recentResources || [];
  const recentBookmarks: Bookmark[] =
    dashboardData?.recentBookmarks.slice(0, 5) || [];
  const stats = dashboardData?.stats;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      className="space-y-8 container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/tasks" className="block">
            <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
            {loading ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-primary-600">
                  {stats?.totalTasks ?? 0}
                </p>
                <FaArrowRight className="text-primary-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/pyqs" className="block">
            <h3 className="text-lg font-semibold text-gray-700">
              Available Papers
            </h3>
            {loading ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.availablePapers ?? 0}
                </p>
                <FaArrowRight className="text-blue-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/resources" className="block">
            <h3 className="text-lg font-semibold text-gray-700">
              Available Resources
            </h3>
            {loading ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-primary-600">
                  {stats?.availableResources ?? 0}
                </p>
                <FaArrowRight className="text-primary-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Link to="/bookmarks" className="block">
            <h3 className="text-lg font-semibold text-gray-700">Bookmarks</h3>
            {loading ? (
              loader
            ) : (
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.bookmarks ?? 0}
                </p>
                <FaArrowRight className="text-purple-600 text-xl" />
              </div>
            )}
          </Link>
        </motion.div>
      </motion.div>

      {/* Bookmarks */}
      <motion.div
        className="bg-white rounded-3xl shadow-md p-6"
        variants={itemVariants}
        whileHover={{ y: -5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Bookmarks</h2>
          <Link
            to="/bookmarks"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm md:text-base lg:text-md"
          >
            View All <FaArrowRight />
          </Link>
        </div>
        <div className="space-y-3">
          {recentBookmarks.length > 0 ? (
            recentBookmarks.map((bookmark) => (
              <motion.div
                key={bookmark.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <div className="pr-4">
                  <h3 className="text-sm md:text-base lg:text-md font-medium">
                    {bookmark.title}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base text-gray-600">
                    {bookmark.type} • {formatDate(bookmark.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    dispatch(
                      setShowPdf({
                        pdfId: bookmark.resourceDOKey,
                        title: `${bookmark.title}`,
                      })
                    );
                  }}
                  className="px-6 py-1 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  View
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-sm md:text-base lg:text-md text-gray-600">
              No bookmarks yet. Start bookmarking papers and resources!
            </p>
          )}
        </div>
      </motion.div>

      {/* Recent Tasks */}
      <motion.div
        className="bg-white rounded-3xl shadow-md p-6"
        variants={itemVariants}
        whileHover={{ y: -5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Tasks</h2>
          <Link
            to="/tasks"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm md:text-base lg:text-md"
          >
            View All <FaArrowRight />
          </Link>
        </div>
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <div className="pr-4">
                  <h3 className="text-sm md:text-base lg:text-md font-medium">
                    {task.title}
                  </h3>
                  <div className="flex items-center mt-1 flex-wrap">
                    {task.dueDate && (
                      <span className="flex items-center text-xs text-gray-600 mr-3">
                        <FiClock size={12} className="mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.attachments && (
                      <button
                        onClick={() => {
                          dispatch(
                            setShowPdf({
                              pdfId: task.attachments as string,
                              title: `${task.title}`,
                            })
                          );
                        }}
                        className="pl-2 rounded-xl text-blue-600 font-semibold flex items-center gap-1 hover:bg-blue-50 transition-colors duration-200"
                      >
                        <span>View</span> <FiExternalLink size={14} />
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs md:text-sm lg:text-base ${getPriorityColor(
                      task.priority as "low" | "medium" | "high"
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm md:text-base lg:text-md text-gray-600">
              No tasks yet. Create your first task!
            </p>
          )}
        </div>
      </motion.div>

      {/* Recent Resources */}
      <motion.div
        className="bg-white rounded-3xl shadow-md p-6"
        variants={itemVariants}
        whileHover={{ y: -5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Resources</h2>
          <Link
            to="/resources"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm md:text-base lg:text-md"
          >
            View All <FaArrowRight />
          </Link>
        </div>
        <div className="space-y-3">
          {resources.length > 0 ? (
            resources.map((resource) => (
              <motion.div
                key={resource.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <div className="pr-4">
                  <h3 className="text-sm md:text-base lg:text-md font-medium">
                    {resource.title}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base text-gray-600">
                    {resource.type} • {resource.subjectName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    dispatch(
                      setShowPdf({
                        pdfId: resource.resourceDOKey,
                        title: `${resource.subjectName} ${resource.title}`,
                      })
                    );
                  }}
                  className="px-6 py-1 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  View
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-sm md:text-base lg:text-md text-gray-600">
              No resources available yet.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
