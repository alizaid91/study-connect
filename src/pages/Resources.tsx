import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Resource, Bookmark } from '../types/content';
import { addBookmark, removeBookmark } from '../store/slices/bookmarkSlice';
import { setResources } from '../store/slices/resourceSlice';
import { FiTrash2, FiCheckSquare, FiFilter, FiChevronsDown, FiBookmark } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { resourcesService, QuickFilter } from '../services/resourcesService';

const Resources: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookmarks } = useSelector((state: RootState) => state.bookmarks);
  const { resources } = useSelector((state: RootState) => state.resources);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    pattern: '',
    type: '',
    subjectName: ''
  });
  const [resourceQuickFilters, setResourceQuickFilters] = useState<QuickFilter[]>([]);
  const [draggedQF, setDraggedQF] = useState<QuickFilter | null>(null);
  const [draggedQFIndex, setDraggedQFIndex] = useState<number | null>(null);
  const [savingQF, setSavingQF] = useState(false);
  const [isDeletingQF, setIsDeletingQF] = useState(false);
  const [deletingQFId, setDeletingQFId] = useState<string | null>(null);
  const [changingBookmarkState, setChangingBookmarkState] = useState(false);
  const [itemToChangeBookmarkState, setItemToChangeBookmarkState] = useState<string>('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const resourcesData = await resourcesService.getResources();
        dispatch(setResources(resourcesData));
        setFilteredResources(resourcesData);
      } catch (err) {
        setError('Failed to fetch resources');
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchResourceQuickFilters = async () => {
        const filters = await resourcesService.getQuickFilters(user.uid);
        setResourceQuickFilters(filters);
      };
      fetchResourceQuickFilters();
    }
  }, [user]);

  useEffect(() => {
    const filtered = resourcesService.filterResources(resources, filters);
    setFilteredResources(filtered);
  }, [filters, resources]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'branch' || name === 'year' ? { subjectName: '' } : {})
    }));
  };

  const clearFilters = () => {
    setFilters({
      branch: '',
      year: '',
      pattern: '',
      type: '',
      subjectName: ''
    });
  };

  const getAvailableSubjects = () => {
    return resourcesService.getAvailableSubjects(resources, filters);
  };

  const handleBookmark = async (resource: Resource) => {
    if (!user) return;

    const existingBookmark = bookmarks.find(
      (bookmark: Bookmark) => bookmark.contentId === resource.id && bookmark.type === 'Resource'
    );
    setItemToChangeBookmarkState(resource.id);
    setChangingBookmarkState(true);
    if (existingBookmark) {
      await dispatch(removeBookmark(existingBookmark.id));
    } else {
      await dispatch(addBookmark({
        userId: user.uid,
        contentId: resource.id,
        type: 'Resource',
        title: resource.title,
        name: resource.title,
        paperType: null,
        resourceType: resource.type,
        description: `${resource.branch} - ${resource.year} ${resource.pattern}`,
        link: resource.driveLink,
        createdAt: new Date().toISOString()
      }));
    }
    setChangingBookmarkState(false)
  };

  const isBookmarked = (resourceId: string) => {
    return bookmarks.some((bookmark: Bookmark) => bookmark.contentId === resourceId && bookmark.type === 'Resource');
  };

  const handleSaveQuickFilter = async () => {
    if (!user) return;
    if (resourceQuickFilters.some(q =>
      q.values.branch === filters.branch &&
      q.values.year === filters.year &&
      q.values.pattern === filters.pattern &&
      q.values.type === filters.type &&
      q.values.subjectName === filters.subjectName
    )) {
      return;
    }
    try {
      setSavingQF(true);
      const docRef = await resourcesService.saveQuickFilter({ ...filters, userId: user.uid });
      setResourceQuickFilters(prev => [...prev, { id: docRef.id, values: { ...filters } }]);
    } catch (err) {
      console.error('Error saving quick filter', err);
    } finally {
      setSavingQF(false);
    }
  };

  const handleApplyQuickFilter = (qf: QuickFilter) => {
    setFilters(qf.values);
  };

  const handleDeleteQuickFilter = async (id: string) => {
    try {
      setIsDeletingQF(true);
      setDeletingQFId(id);
      await resourcesService.deleteQuickFilter(id);
      setResourceQuickFilters(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error('Error deleting quick filter', err);
    } finally {
      setIsDeletingQF(false);
      setDeletingQFId(null);
    }
  };

  const handleQFDragStart = (qf: QuickFilter, index: number) => {
    setDraggedQF(qf);
    setDraggedQFIndex(index);
  };

  const handleQFDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleQFDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedQF && draggedQFIndex !== null) {
      const updated = [...resourceQuickFilters];
      updated.splice(draggedQFIndex, 1);
      updated.splice(index, 0, draggedQF);
      setResourceQuickFilters(updated);
    }
    setDraggedQF(null);
    setDraggedQFIndex(null);
  };

  const getResourceTypeIcon = (type: string) => {
    const typeLC = type.toLowerCase();
    if (typeLC === 'book') return '📚';
    if (typeLC === 'notes') return '📝';
    if (typeLC === 'video') return '🎥';
    if (typeLC === 'decodes') return '🧩';
    return '📄';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent animate-spin"></div>
          <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-blue-400 animate-spin animation-delay-150"></div>
          <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-blue-300 border-r-transparent border-b-blue-500 border-l-transparent animate-spin animation-delay-300"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto mt-8"
      >
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-center text-gray-800 pb-2"
      >
        Learning Resources
      </motion.h1>

      <AnimatePresence>
        {resourceQuickFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
              <FiFilter className="mr-2" /> Quick Filters
            </h2>
            <div className="flex flex-wrap gap-3">
              {resourceQuickFilters.map((qf, idx) => (
                <motion.div
                  key={qf.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  draggable
                  onDragStart={() => handleQFDragStart(qf, idx)}
                  onDragOver={handleQFDragOver}
                  onDrop={(e) => handleQFDrop(e, idx)}
                  className="bg-white shadow-lg rounded-lg p-5 flex items-center justify-between min-w-[240px] space-x-4 cursor-grab transition-all duration-200 hover:shadow-xl border-l-4 border-indigo-500"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-700">
                    <span className="font-medium">{qf.values.branch}</span>
                    {qf.values.branch !== 'FE' && qf.values.year && <span>- {qf.values.year}</span>}
                    {qf.values.pattern && <span>- {qf.values.pattern} Pattern</span>}
                    {qf.values.type && <span>- {qf.values.type}</span>}
                    {qf.values.subjectName && <span>- {qf.values.subjectName}</span>}
                  </div>
                  <div className="flex items-center space-x-4">
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                      <FiCheckSquare onClick={() => handleApplyQuickFilter(qf)} className="text-primary-600 hover:text-primary-700 cursor-pointer" size={20} />
                    </motion.div>
                    {isDeletingQF && deletingQFId === qf.id ? (
                      <div role="status" className="inline-flex items-center">
                        <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full mr-2"></div>
                        <span className="sr-only">Deleting...</span>
                      </div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                        <FiTrash2 onClick={() => handleDeleteQuickFilter(qf.id)} className="text-red-500 hover:text-red-600 cursor-pointer" size={20} />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-100"
      >
        <div className={`flex justify-between items-center ${isFilterExpanded && 'mb-4'}`}>
          <h2 className="text-xl font-semibold text-gray-700 flex items-center">
            <FiFilter className="mr-2" /> Filter Resources
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiChevronsDown className={`transform transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`} size={24} />
          </motion.button>
        </div>

        <AnimatePresence>
          {isFilterExpanded && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <select
                    name="branch"
                    value={filters.branch}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="">All Branches</option>
                    <option value="FE">First Year</option>
                    <option value="CS">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="Civil">Civil</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
                </motion.div>

                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    disabled={filters.branch === 'FE'}
                  >
                    <option value="">All Years</option>
                    <option value="SE">Second Year</option>
                    <option value="TE">Third Year</option>
                    <option value="BE">Final Year</option>
                  </select>
                </motion.div>

                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
                  <select
                    name="pattern"
                    value={filters.pattern}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="">All Patterns</option>
                    <option value="2019">2019</option>
                    <option value="2024">2024</option>
                  </select>
                </motion.div>

                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="">All Types</option>
                    <option value="book">Book</option>
                    <option value="notes">Notes</option>
                    <option value="video">Video</option>
                    <option value="decodes">Decodes</option>
                    <option value="other">Other</option>
                  </select>
                </motion.div>

                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    name="subjectName"
                    value={filters.subjectName}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    disabled={!filters.branch || (filters.branch !== 'FE' && !filters.year)}
                  >
                    <option value="">All Subjects</option>
                    {getAvailableSubjects().map((subject) => (
                      <option key={subject.code} value={subject.name}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </motion.div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={clearFilters}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center justify-center"
                >
                  Clear Filters
                </motion.button>
                {(filters.branch || filters.year || filters.pattern || filters.type || filters.subjectName) && (
                  savingQF ? (
                    <button disabled type="button" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-md text-sm px-6 py-2.5 text-center inline-flex items-center justify-center">
                      <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                      </svg>
                      Saving...
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={handleSaveQuickFilter}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      Save Quick Filter
                    </motion.button>
                  )
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {filteredResources.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow-md"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <p>No resources found matching the selected filters.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-lg shadow-md overflow-hidden relative group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-600"></div>
                <div className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">{getResourceTypeIcon(resource.type)}</span>
                      <h3 className="text-xl font-semibold text-gray-800">{resource.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-2">
                      {resource.branch} - {resource.year !== 'FE' ? resource.year : ''} {resource.pattern}
                    </p>
                    <div className="bg-gray-50 p-2 rounded-md mb-4">
                      <p className="text-gray-700 mb-1">
                        <span className="font-medium">Subject:</span> {resource.subjectName}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Type:</span> <span className="capitalize">{resource.type}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={resource.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-md inline-block transition-all duration-200 shadow-md"
                    >
                      View Resource
                    </motion.a>
                    {
                      changingBookmarkState && resource.id === itemToChangeBookmarkState
                        ? <div role="status" className="inline-flex items-center justify-center p-2">
                          <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                          <span className="sr-only">Changing...</span>
                        </div>
                        : <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleBookmark(resource)}
                          className={`rounded-full p-2 ${isBookmarked(resource.id)
                            ? 'text-yellow-500 bg-yellow-100'
                            : 'text-gray-400 bg-gray-100'
                            } transition-all duration-200`}
                        >
                          <FiBookmark
                            className={`w-5 h-5 ${isBookmarked(resource.id) ? 'fill-current' : ''}`}
                          />
                        </motion.button>
                    }
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Resources;