import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, where, getDocs, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RootState, AppDispatch } from '../store';
import { Resource, Bookmark } from '../types/content';
import { addBookmark, removeBookmark } from '../store/slices/bookmarkSlice';
import { setResources } from '../store/slices/resourceSlice';
import { FiTrash2, FiCheckSquare } from 'react-icons/fi';

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
  // Quick filters state and types for resources
  type ResourceFilterValues = {
    branch: string;
    year: string;
    pattern: string;
    type: string;
    subjectName: string;
  };
  interface QuickFilter {
    id: string;
    values: ResourceFilterValues;
  }
  const [resourceQuickFilters, setResourceQuickFilters] = useState<QuickFilter[]>([]);
  // State for drag-and-drop ordering of quick filters
  const [draggedQF, setDraggedQF] = useState<QuickFilter | null>(null);
  const [draggedQFIndex, setDraggedQFIndex] = useState<number | null>(null);
  // Loading states for quick filters
  const [savingQF, setSavingQF] = useState(false);
  const [isDeletingQF, setIsDeletingQF] = useState(false);
  const [deletingQFId, setDeletingQFId] = useState<string | null>(null);

  const [changingBookmarkState, setChangingBookmarkState] = useState(false);
  const [itemToChangeBookmarkState, setItemToChangeBookmarkState] = useState<string>('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const resourcesRef = collection(db, 'resources');
        const q = query(resourcesRef, orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const resourcesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Resource[];
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

  // Fetch saved quick filters for resources
  useEffect(() => {
    if (user) {
      const fetchResourceQuickFilters = async () => {
        const q = query(collection(db, 'resourceQuickFilters'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({
          id: d.id,
          values: {
            branch: d.data().branch,
            year: d.data().year,
            pattern: d.data().pattern,
            type: d.data().type,
            subjectName: d.data().subjectName
          }
        }));
        setResourceQuickFilters(data);
      };
      fetchResourceQuickFilters();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...resources];

    if (filters.branch) {
      filtered = filtered.filter(resource => resource.branch === filters.branch);
    }

    if (filters.year) {
      filtered = filtered.filter(resource => resource.year === filters.year);
    }

    if (filters.pattern) {
      filtered = filtered.filter(resource => resource.pattern === filters.pattern);
    }

    if (filters.type) {
      filtered = filtered.filter(resource => resource.type === filters.type);
    }

    if (filters.subjectName) {
      filtered = filtered.filter(resource => resource.subjectName === filters.subjectName);
    }

    setFilteredResources(filtered);
  }, [filters, resources]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset subject when branch or year changes
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
    let list = resources;
    if (filters.branch) list = list.filter(r => r.branch === filters.branch);
    if (filters.branch !== 'FE' && filters.year) list = list.filter(r => r.year === filters.year);
    if (filters.pattern) list = list.filter(r => r.pattern === filters.pattern);
    if (filters.type) list = list.filter(r => r.type.toLowerCase() === filters.type.toLowerCase());
    const subjects = list.map(r => ({ name: r.subjectName, code: r.subjectCode }));
    return Array.from(new Set(subjects.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));
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

  // Handlers for resource quick filters
  const handleSaveQuickFilter = async () => {
    if (!user) return;
    // prevent duplicates
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
      const payload = { ...filters, userId: user.uid };
      const docRef = await addDoc(collection(db, 'resourceQuickFilters'), payload);
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
      await deleteDoc(doc(db, 'resourceQuickFilters', id));
      setResourceQuickFilters(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error('Error deleting quick filter', err);
    } finally {
      setIsDeletingQF(false);
      setDeletingQFId(null);
    }
  };

  // Drag-and-drop handlers for quick filters
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8 pt-2">
      <h1 className="text-3xl font-bold mb-6 text-center">Resources</h1>
      {resourceQuickFilters.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Quick Filters</h2>
          <div className="flex flex-wrap gap-3">
            {resourceQuickFilters.map((qf, idx) => (
              <div
                key={qf.id}
                draggable
                onDragStart={() => handleQFDragStart(qf, idx)}
                onDragOver={handleQFDragOver}
                onDrop={(e) => handleQFDrop(e, idx)}
                className="bg-white shadow-md rounded-lg p-5 flex items-center justify-between min-w-[240px] space-x-4 cursor-grab"
              >
                <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-700">
                  <span className="font-medium">{qf.values.branch}</span>
                  {qf.values.branch !== 'FE' && qf.values.year && <span>- {qf.values.year}</span>}
                  {qf.values.pattern && <span>- {qf.values.pattern} Pattern</span>}
                  {qf.values.type && <span>- {qf.values.type}</span>}
                  {qf.values.subjectName && <span>- {qf.values.subjectName}</span>}
                </div>
                <div className="flex items-center space-x-4">
                  <FiCheckSquare onClick={() => handleApplyQuickFilter(qf)} className="text-primary-600 hover:text-primary-700 cursor-pointer" size={20} />
                  {isDeletingQF && deletingQFId === qf.id ? (
                    <div role="status" className="inline-flex items-center">
                      <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full mr-2"></div>
                      <span className="sr-only">Deleting...</span>
                    </div>
                  ) : (
                    <FiTrash2 onClick={() => handleDeleteQuickFilter(qf.id)} className="text-red-500 hover:text-red-600 cursor-pointer" size={20} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                name="branch"
                value={filters.branch}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                <option value="FE">First Year</option>
                <option value="CS">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="Civil">Civil</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={filters.branch === 'FE'}
              >
                <option value="">All Years</option>
                <option value="SE">Second Year</option>
                <option value="TE">Third Year</option>
                <option value="BE">Final Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
              <select
                name="pattern"
                value={filters.pattern}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Patterns</option>
                <option value="2019">2019</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="book">Book</option>
                <option value="notes">Notes</option>
                <option value="video">Video</option>
                <option value="decodes">Decodes</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                name="subjectName"
                value={filters.subjectName}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!filters.branch || (filters.branch !== 'FE' && !filters.year)}
              >
                <option value="">All Subjects</option>
                {getAvailableSubjects().map((subject) => (
                  <option key={subject.code} value={subject.name}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Clear Filters
            </button>
            {(filters.branch || filters.year || filters.pattern || filters.type || filters.subjectName) && (
              savingQF ? (
                <button disabled type="button" className="inline-flex items-center bg-primary-600 text-white font-medium rounded px-4 py-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveQuickFilter}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
                >
                  Save Quick Filter
                </button>
              )
            )}
          </div>
        </form>
      </div>

      {filteredResources.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No resources found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-2">
                  {resource.branch} - {resource.year !== 'FE' ? resource.year : ''} {resource.pattern}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Subject:</span> {resource.subjectName}
                </p>
                <p className="text-gray-700 mb-4">
                  <span className="font-medium">Type:</span> {resource.type}
                </p>
                <div className="flex justify-between items-center">
                  <a
                    href={resource.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
                  >
                    View Resource
                  </a>
                  {
                    changingBookmarkState && resource.id === itemToChangeBookmarkState
                      ? <div role="status" className="inline-flex items-center">
                        <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></div>
                        <span className="sr-only">Changing...</span>
                      </div>
                      : <button
                        onClick={() => handleBookmark(resource)}
                        className={`p-2 rounded-full ${isBookmarked(resource.id)
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-gray-500'
                          }`}
                      >
                        <svg
                          className="w-6 h-6"
                          fill={isBookmarked(resource.id) ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;