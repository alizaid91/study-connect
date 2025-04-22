import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { useState, useEffect } from 'react';
import { fetchBookmarks, removeBookmark } from '../store/slices/bookmarkSlice';
import { formatDate } from '../utils/dateUtils';
import { Bookmark } from '../types/content';

const Bookmarks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookmarks, loading } = useSelector((state: RootState) => state.bookmarks);
  const [activeTab, setActiveTab] = useState<'Paper' | 'Resource'>('Paper');

  useEffect(() => {
    if (user) {
      dispatch(fetchBookmarks(user.uid));
    }
  }, [dispatch, user]);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    await dispatch(removeBookmark(bookmarkId));
  };

  // derive per-tab bookmark lists
  const paperBookmarks = bookmarks.filter(b => b.type === 'Paper');
  const resourceBookmarks = bookmarks.filter(b => b.type === 'Resource');
  const currentBookmarks = activeTab === 'Paper' ? paperBookmarks : resourceBookmarks;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8 pt-2">
      <h1 className="text-3xl font-bold mb-6 text-center">My Bookmarks</h1>

      {/* Tabs for Papers and Resources */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab('Paper')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'Paper' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >Papers</button>
        <button
          onClick={() => setActiveTab('Resource')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'Resource' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >Resources</button>
      </div>

      {/* Listing for active tab */}
      {currentBookmarks.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          {activeTab === 'Paper'
            ? 'No bookmarked papers yet.'
            : 'No bookmarked resources yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBookmarks.map((bookmark: Bookmark) => (
            <div key={bookmark.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{bookmark.title}</h3>
                <p className="text-gray-600 mb-2">
                  {bookmark.type === 'Resource'
                    ? `${bookmark.resourceType?.toLocaleUpperCase()} • ${bookmark.description}`
                    : bookmark.description}
                </p>
                {bookmark.type === 'Paper' && bookmark.paperType && (
                  <p className="text-sm text-gray-500 mb-4">
                    {`${bookmark.paperType} • ${bookmark.name}`}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <a
                    href={bookmark.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    className="text-red-500 hover:text-red-600 p-2 rounded-full"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks; 