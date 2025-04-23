import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, where, getDocs, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RootState, AppDispatch } from '../store';
import { Paper, Bookmark } from '../types/content';
import { addBookmark, removeBookmark, fetchBookmarks } from '../store/slices/bookmarkSlice';
import { Link } from 'react-router-dom';
import { FiTrash2, FiCheckSquare } from 'react-icons/fi';

interface Subject {
  name: string;
  code: string;
}

const PYQs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookmarks } = useSelector((state: RootState) => state.bookmarks);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    pattern: '',
    paperType: '',
    subjectName: '',
    subjectCode: ''
  });
  // Quick filters state and types
  type FilterValues = {
    branch: string;
    year: string;
    pattern: string;
    paperType: string;
    subjectName: string;
    subjectCode: string;
  };
  interface QuickFilter {
    id: string;
    values: FilterValues;
  }
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);
  // Drag-and-drop state for quick filters ordering
  const [draggedQF, setDraggedQF] = useState<QuickFilter | null>(null);
  const [draggedQFIndex, setDraggedQFIndex] = useState<number | null>(null);
  // ID of the quick filter currently being deleted
  const [deletingQFId, setDeletingQFId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const papersRef = collection(db, 'papers');
        const q = query(papersRef, orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const papersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Paper[];
        setPapers(papersData);
        setFilteredPapers(papersData);
      } catch (err) {
        setError('Failed to fetch papers');
        console.error('Error fetching papers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchBookmarks(user.uid));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      const fetchQuick = async () => {
        const q = query(collection(db, 'quickFilters'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({
          id: d.id,
          values: {
            branch: d.data().branch,
            year: d.data().year,
            pattern: d.data().pattern,
            paperType: d.data().paperType,
            subjectName: d.data().subjectName,
            subjectCode: d.data().subjectCode
          }
        }));
        setQuickFilters(data);
      };
      fetchQuick();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...papers];

    if (filters.branch) {
      filtered = filtered.filter(paper => paper.branch === filters.branch);
    }

    if (filters.year) {
      filtered = filtered.filter(paper => paper.year === filters.year);
    }

    if (filters.pattern) {
      filtered = filtered.filter(paper => paper.pattern === filters.pattern);
    }

    if (filters.paperType) {
      filtered = filtered.filter(paper => paper.paperType === filters.paperType);
    }

    if (filters.subjectName) {
      filtered = filtered.filter(paper => paper.subjectName === filters.subjectName);
    }

    setFilteredPapers(filtered);
  }, [filters, papers]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => {
      // Reset subject filters when branch or year changes
      if (name === 'branch' || name === 'year') {
        return {
          ...prev,
          [name]: value,
          subjectName: '',
          subjectCode: ''
        };
      }
      // When selecting subjectName, also capture its code
      if (name === 'subjectName') {
        const subj = getAvailableSubjects().find(s => s.name === value);
        return {
          ...prev,
          subjectName: value,
          subjectCode: subj ? subj.code.toUpperCase() : ''
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      branch: '',
      year: '',
      pattern: '',
      paperType: '',
      subjectName: '',
      subjectCode: ''
    });
  };

  // Quick filter handlers
  const handleSaveQuickFilter = async () => {
    if (!user) return;
    // Prevent saving duplicate quick filters
    if (quickFilters.some(q =>
      q.values.branch === filters.branch &&
      q.values.year === filters.year &&
      q.values.pattern === filters.pattern &&
      q.values.paperType === filters.paperType &&
      q.values.subjectName === filters.subjectName
    )) {
      return;
    }
    try {
      setSaving(true);
      const payload = { ...filters, userId: user.uid };
      const docRef = await addDoc(collection(db, 'quickFilters'), payload);
      setQuickFilters(prev => [...prev, { id: docRef.id, values: { ...filters } }]);
    } catch (err) {
      console.error('Error saving quick filter', err);
    } finally {
      setSaving(false);
    }
  };
  const handleApplyQuickFilter = (qf: QuickFilter) => {
    setFilters(qf.values);
  };
  const handleDeleteQuickFilter = async (id: string) => {
    try {
      setIsDeleting(true);
      setDeletingQFId(id);
      await deleteDoc(doc(db, 'quickFilters', id));
      setQuickFilters(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error('Error deleting quick filter', err);
    } finally {
      setIsDeleting(false);
      setDeletingQFId(null);
    }
  };

  const handleBookmark = async (paper: Paper) => {
    if (!user) return;

    const existingBookmark = bookmarks.find(
      (bookmark: Bookmark) => bookmark.contentId === paper.id && bookmark.type === 'Paper'
    );

    if (existingBookmark) {
      await dispatch(removeBookmark(existingBookmark.id));
    } else {
      await dispatch(addBookmark({
        userId: user.uid,
        contentId: paper.id,
        type: 'Paper',
        paperType: paper.paperType,
        resourceType: null,
        title: paper.subjectName,
        name: paper.paperName,
        description: `${paper.branch} - ${paper.year} ${paper.pattern}`,
        link: paper.driveLink,
        createdAt: new Date().toISOString()
      }));
    }
  };

  const isBookmarked = (paperId: string) => {
    return bookmarks.some((bookmark: Bookmark) => bookmark.contentId === paperId && bookmark.type === 'Paper');
  };

  const getAvailableSubjects = (): Subject[] => {
    const subjects = papers
      .filter(paper =>
        (!filters.branch || paper.branch === filters.branch) &&
        (!filters.year || paper.year === filters.year)
      )
      .map(paper => ({
        name: paper.subjectName,
        code: paper.subjectId
      }));

    return Array.from(new Set(subjects.map(s => JSON.stringify(s))))
      .map(s => JSON.parse(s));
  };

  // add drag handlers
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
      const updated = [...quickFilters];
      updated.splice(draggedQFIndex, 1);
      updated.splice(index, 0, draggedQF);
      setQuickFilters(updated);
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
      <h1 className="text-3xl font-bold mb-6 text-center">Previous Year Question Papers</h1>
      {quickFilters.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Quick Filters</h2>
          <div className="flex flex-wrap gap-3">
            {quickFilters.map((qf, idx) => (
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
                  {qf.values.paperType && <span>- {qf.values.paperType}</span>}
                  {qf.values.subjectName && <span>- {qf.values.subjectCode}</span>}
                </div>
                <div className="flex items-center space-x-4">
                  <FiCheckSquare onClick={() => handleApplyQuickFilter(qf)} className="text-primary-600 hover:text-primary-700 cursor-pointer" size={20} />
                  {isDeleting && deletingQFId === qf.id ? (
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            {filters.branch && filters.branch !== 'FE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Years</option>
                  <option value="SE">Second Year</option>
                  <option value="TE">Third Year</option>
                  <option value="BE">Final Year</option>
                </select>
              </div>
            )}

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
                    {subject.name} ({subject.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paper Type</label>
              <select
                name="paperType"
                value={filters.paperType}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Paper Types</option>
                <option value="Insem">Insem</option>
                <option value="Endsem">Endsem</option>
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
            {(filters.branch || filters.year || filters.pattern || filters.paperType || filters.subjectName) && (
              saving ? <button disabled type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
                <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                </svg>
                Loading...
              </button> :
                <button
                  type="button"
                  onClick={handleSaveQuickFilter}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
                >
                  Save Quick Filter
                </button>
            )}
          </div>
        </form>
      </div>

      {filteredPapers.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No papers found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{paper.subjectName}</h3>
                <p className="text-gray-600 mb-2">
                  {paper.branch} - {paper.year !== 'FE' ? paper.year : ''} {paper.pattern} Pattern
                </p>
                <p className="text-gray-700 mb-4">
                  <span className="font-medium">{paper.paperType} </span> <span> Paper </span> <span className="font-medium">{paper.paperName} </span>
                </p>
                <div className="flex justify-between items-center">
                  <a
                    href={paper.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
                  >
                    View Paper
                  </a>
                  <button
                    onClick={() => handleBookmark(paper)}
                    className={`p-2 rounded-full ${isBookmarked(paper.id)
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-400 hover:text-gray-500'
                      }`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill={isBookmarked(paper.id) ? 'currentColor' : 'none'}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PYQs; 