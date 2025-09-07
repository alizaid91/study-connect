import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { useState, useEffect } from "react";
import { fetchBookmarks, removeBookmark } from "../store/slices/bookmarkSlice";
import { Bookmark, Resource } from "../types/content";
import { motion, AnimatePresence } from "framer-motion";
import { FiBook, FiFileText, FiTrash2 } from "react-icons/fi";
import { bookmarkService } from "../services/bookmarkService";
import Loader1 from "../components/Loaders/Loader1";
import { setShowPdf } from "../store/slices/globalPopups";
import ViewCollectionPopup from "../components/Study-Resources/ViewCollectionPopup";

const Bookmarks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookmarks, loading } = useSelector(
    (state: RootState) => state.bookmarks
  );
  const [activeTab, setActiveTab] = useState<"Paper" | "Resource">("Paper");
  const [deletingBookmark, setDeletingBookmark] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<string>("");
  const [showCollectionModal, setShowCollectionModal] = useState<{
    open: boolean;
    bookmark: Bookmark | null;
  }>({
    open: false,
    bookmark: null,
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchBookmarks(user.uid));
    }
  }, [dispatch, user]);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    setBookmarkToDelete(bookmarkId);
    setDeletingBookmark(true);
    try {
      await bookmarkService.removeBookmark(bookmarkId);
      dispatch(removeBookmark(bookmarkId));
    } catch (error) {
      console.error("Error removing bookmark:", error);
    } finally {
      setDeletingBookmark(false);
    }
  };

  // derive per-tab bookmark lists
  const paperBookmarks = bookmarks.filter((b) => b.type === "Paper");
  const resourceBookmarks = bookmarks.filter((b) => b.type === "Resource");
  const currentBookmarks =
    activeTab === "Paper" ? paperBookmarks : resourceBookmarks;

  // Function to get appropriate icon based on bookmark type
  const getBookmarkIcon = (bookmark: Bookmark) => {
    if (bookmark.type === "Paper") {
      return <FiFileText className="text-blue-500" />;
    } else {
      const type = bookmark.resourceType?.toLowerCase() || "";
      if (type === "book") return "📚";
      if (type === "notes") return "📝";
      if (type === "video") return "🎥";
      if (type === "decodes") return "🧩";
      return <FiBook className="text-indigo-500" />;
    }
  };

  if (loading) {
    return <Loader1 />;
  }

  return (
    <>
      {showCollectionModal.open && showCollectionModal.bookmark && (
        <ViewCollectionPopup
          onClose={() =>
            setShowCollectionModal({ open: false, bookmark: null })
          }
          bookmark={showCollectionModal.bookmark}
        />
      )}
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-center text-gray-800 pb-2"
        >
          My Bookmarks
        </motion.h1>

        {/* Tabs for Papers and Resources */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex justify-center mb-10 space-x-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("Paper")}
            className={`px-4 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-md ${
              activeTab === "Paper"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiFileText />
            <span>Papers</span>
            {paperBookmarks.length > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === "Paper"
                    ? "bg-white text-blue-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {paperBookmarks.length}
              </span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("Resource")}
            className={`px-4 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-md ${
              activeTab === "Resource"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiBook />
            <span>Resources</span>
            {resourceBookmarks.length > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === "Resource"
                    ? "bg-white text-indigo-600"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                {resourceBookmarks.length}
              </span>
            )}
          </motion.button>
        </motion.div>

        {/* Listing for active tab */}
        <AnimatePresence mode="wait">
          {currentBookmarks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow-md max-w-lg mx-auto"
            >
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <p>
                  {activeTab === "Paper"
                    ? "No bookmarked papers yet. Start adding some from the Papers page!"
                    : "No bookmarked resources yet. Start adding some from the Resources page!"}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentBookmarks.map((bookmark: Bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-lg shadow-md relative group h-full mt-4"
                >
                  {/* Deck Layers - always visible */}
                  {bookmark.subType === "collection" && (
                    <div className="absolute -top-4 left-0 right-0 flex flex-col items-center">
                      <div className="w-[90%] h-2 bg-gray-200 rounded-t-lg mb-[1px]"></div>
                      <div className="w-[95%] h-2 bg-gray-300 rounded-t-lg mb-[1px]"></div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">
                          {getBookmarkIcon(bookmark)}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {bookmark.title}
                        </h3>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md mb-3">
                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                          {bookmark.type === "Resource"
                            ? `${bookmark.resourceType?.toUpperCase()} • ${
                                bookmark.description
                              }`
                            : bookmark.description}
                        </p>

                        {bookmark.type === "Paper" && bookmark.paperType && (
                          <p className="text-xs text-gray-500">
                            {`${bookmark.paperType} • ${bookmark.name}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="flex justify-between items-center mt-2">
                      <button
                        onClick={() => {
                          if (bookmark.subType === "collection") {
                            setShowCollectionModal({
                              open: true,
                              bookmark,
                            });
                          } else {
                            dispatch(
                              setShowPdf({
                                pdfId:
                                  bookmark.files?.[0]?.resourceDOKey ||
                                  bookmark.contentId,
                                title: bookmark.title,
                                totalPages:
                                  bookmark.files?.[0]?.metadata.pages || 0,
                              })
                            );
                          }
                        }}
                        className="px-4 py-1 bg-blue-600 rounded-xl text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-200"
                      >
                        {bookmark.subType === "collection" ? "Open" : "View"}
                      </button>

                      {deletingBookmark && bookmark.id === bookmarkToDelete ? (
                        <div role="status" className="inline-flex items-center">
                          <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                          <span className="sr-only">Deleting...</span>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{
                            scale: 1.2,
                            backgroundColor: "rgba(254, 202, 202, 0.2)",
                          }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleRemoveBookmark(bookmark.id)}
                          className="text-red-500 hover:text-red-600 p-2 rounded-full transition-all duration-200"
                        >
                          <FiTrash2 size={20} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Bookmarks;
