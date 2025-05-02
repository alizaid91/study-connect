import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, where, getDocs, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RootState, AppDispatch } from '../store';
import { Paper, Bookmark, TaskForm, Task, List } from '../types/content';
import { addBookmark, removeBookmark, fetchBookmarks } from '../store/slices/bookmarkSlice';
import { fetchPapers, setLoading } from '../store/slices/papersSlice';
import { FiTrash2, FiCheckSquare, FiFilter, FiChevronsDown, FiBookmark } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import TaskModal from '../components/TaskModal';
import { setLists, setTasks } from '../store/slices/taskSlice';

interface Subject {
  name: string;
  code: string;
}

const PYQs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookmarks } = useSelector((state: RootState) => state.bookmarks);
  const { papers, loading, error } = useSelector((state: RootState) => state.papers);
  const { lists, tasks } = useSelector((state: RootState) => state.tasks);
  const [saving, setSaving] = useState(false);
  const [changingBookmarkState, setChangingBookmarkState] = useState(false);
  const [itemToChangeBookmarkState, setItemToChangeBookmarkState] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    semester: 0,
    pattern: '',
    paperType: '',
    subjectName: '',
    subjectCode: ''
  });

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [defaultListId, setDefaultListId] = useState<string | null>(null);

  // Quick filters state and types
  type FilterValues = {
    branch: string;
    year: string;
    semester: number;
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
  // UI states
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // Effect to prevent background scrolling when modal is open
  useEffect(() => {
    if (isTaskModalOpen) {
      // Disable scrolling on body
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when modal closes
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isTaskModalOpen]);

  useEffect(() => {
    if (user) {
      dispatch(fetchPapers());
    }

    // fetch task lists
    const fetchTaskLists = async () => {
      if (!user) return;
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
    };

    fetchTaskLists();
  }, [dispatch, user]);

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
            semester: d.data().semester,
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

    if (filters.semester) {
      filtered = filtered.filter(paper => paper.semester === filters.semester);
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

  useEffect(() => {
    // Find the default list (position 0) when lists are loaded
    if (lists.length > 0) {
      const defaultList = lists.find(list => list.position === 0);
      if (defaultList) {
        setDefaultListId(defaultList.id);
      }
    }
  }, [lists]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Filter changed:', name, value);
    console.log(filters)
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
      if (name === 'semester') {
        return {
          ...prev,
          [name]: parseInt(value, 10)
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const setDefaultTaskInfo = (paper: Paper) => {
    setSelectedPaper(paper);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: TaskForm) => {
    if (!user?.uid || !defaultListId) return;

    setIsSubmitting(true);
    try {
      // Get the board ID from the default list
      const defaultList = lists.find(list => list.id === defaultListId);
      if (!defaultList) {
        throw new Error('Default list not found');
      }

      const boardId = defaultList.boardId;

      // Get tasks in the same list to determine position
      const fetchTasks = async (boardId: string) => {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('boardId', '==', boardId)
        );

        onSnapshot(
          tasksQuery,
          (snapshot) => {
            const fetchedTasks = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                position: typeof data.position === 'number' ? data.position : 0,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
              };
            }) as Task[];

            dispatch(setTasks(fetchedTasks));
          },
          (error) => {
            dispatch(setLoading(false));
          }
        );
      }

      await fetchTasks(taskData.boardId);

      const listTasks = tasks.filter(task => task.listId === taskData.listId);
      const position = listTasks.length > 0
        ? Math.max(...listTasks.map(list => list.position)) + 1
        : 0;

      const newTask = {
        ...taskData,
        boardId,
        userId: user.uid,
        position,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to Firestore only - the listener will update Redux
      await addDoc(collection(db, 'tasks'), newTask);

      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error adding task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      branch: '',
      year: '',
      semester: 0,
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
    setItemToChangeBookmarkState(paper.id);
    setChangingBookmarkState(true);
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
    setChangingBookmarkState(false);
  };

  const isBookmarked = (paperId: string) => {
    return bookmarks.some((bookmark: Bookmark) => bookmark.contentId === paperId && bookmark.type === 'Paper');
  };

  const getAvailableSubjects = (): Subject[] => {
    const subjects = papers
      .filter(paper =>
        (!filters.branch || paper.branch === filters.branch) &&
        (!filters.year || paper.year === filters.year)
        && (!filters.semester || paper.semester === filters.semester)
      )
      .map(paper => ({
        name: paper.subjectName,
        code: paper.subjectId
      }));

    return Array.from(new Set(subjects.map(s => JSON.stringify(s))))
      .map(s => JSON.parse(s) as Subject);
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

  // Create a mock task for the modal when a paper is selected
  const taskForModal = useMemo(() => {
    if (!selectedPaper || !defaultListId) return null;

    const defaultList = lists.find(list => list.id === defaultListId);
    if (!defaultList) return null;

    // Create title based on paper information
    const title = 'Solve ' +
      (selectedPaper.year !== 'FE' ? selectedPaper.year : '') +
      '-' + selectedPaper.branch + ' ' +
      (selectedPaper.subjectId.toUpperCase()) + ' ' +
      selectedPaper.paperType + ' Paper of ' +
      selectedPaper.paperName;

    // Create a mock task with the paper information
    return {
      id: 'temp-id', // Temporary ID, will be replaced when saved
      title,
      description: '',
      listId: defaultListId,
      boardId: defaultList.boardId,
      priority: 'high',
      dueDate: '',
      userId: user?.uid || '',
      position: 0,
      attachments: selectedPaper.driveLink ? [selectedPaper.driveLink] : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Task;
  }, [selectedPaper, defaultListId, lists, user]);

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
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-center text-gray-800 pb-2"
      >
        PYQ Papers
      </motion.h1>

      <AnimatePresence initial={false}>
        {quickFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
              <FiFilter className="mr-2" /> Quick Filters
            </h2>
            <div className="flex flex-wrap gap-3">
              {quickFilters.map((qf, idx) => (
                <motion.div
                  key={qf.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  draggable
                  onDragStart={() => handleQFDragStart(qf, idx)}
                  onDragOver={handleQFDragOver}
                  onDrop={(e) => handleQFDrop(e, idx)}
                  className="bg-white shadow-lg rounded-lg p-5 flex items-center justify-between min-w-[240px] space-x-4 cursor-grab transition-all duration-200 hover:shadow-xl border-l-4 border-blue-500"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-700">
                    <span className="font-medium">{qf.values.branch}</span>
                    {qf.values.branch !== 'FE' && qf.values.year && <span>- {qf.values.year}</span>}
                    {qf.values.semester && <span>- Semester {qf.values.semester}</span>}
                    {qf.values.pattern && <span>- {qf.values.pattern} Pattern</span>}
                    {qf.values.paperType && <span>- {qf.values.paperType}</span>}
                    {qf.values.subjectName && <span>- {qf.values.subjectCode}</span>}
                  </div>
                  <div className="flex items-center space-x-4">
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                      <FiCheckSquare onClick={() => handleApplyQuickFilter(qf)} className="text-primary-600 hover:text-primary-700 cursor-pointer" size={20} />
                    </motion.div>
                    {isDeleting && deletingQFId === qf.id ? (
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
            <FiFilter className="mr-2" /> Filter Papers
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

        <AnimatePresence initial={false}>
          {isFilterExpanded && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

                {filters.branch && filters.branch !== 'FE' && (
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
                    >
                      <option value="">All Years</option>
                      <option value="SE">Second Year</option>
                      <option value="TE">Third Year</option>
                      <option value="BE">Final Year</option>
                    </select>
                  </motion.div>
                )}
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <select
                    name="semester"
                    value={filters.semester}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="">All Semesters</option>
                    {
                      filters.branch === 'FE' ? (
                        <>
                          <option value={1}>Semester 1</option>
                          <option value={2}>Semester 2</option>
                        </>
                      ) : filters.year === 'SE' ? (
                        <>
                          <option value={3}>Semester 3</option>
                          <option value={4}>Semester 4</option>
                        </>
                      ) : filters.year === 'TE' ? (
                        <>
                          <option value={5}>Semester 5</option>
                          <option value={6}>Semester 6</option>
                        </>
                      ) : filters.year === 'BE' ? (
                        <>
                          <option value={7}>Semester 7</option>
                          <option value={8}>Semester 8</option>
                        </>
                      ) : null
                    }
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
                        {subject.name} ({subject.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paper Type</label>
                  <select
                    name="paperType"
                    value={filters.paperType}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="">All Paper Types</option>
                    <option value="Insem">Insem</option>
                    <option value="Endsem">Endsem</option>
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
                {(filters.branch || filters.year || filters.pattern || filters.paperType || filters.subjectName) && (
                  saving ?
                    <button disabled type="button" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-6 py-2.5 text-center inline-flex items-center justify-center">
                      <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                      </svg>
                      Saving...
                    </button> :
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={handleSaveQuickFilter}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      Save Quick Filter
                    </motion.button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence initial={false}>
        {filteredPapers.length === 0 ? (
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
              <p>No papers found matching the selected filters.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPapers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-lg shadow-md overflow-hidden relative group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="p-6">
                  <h3 className="text-md md:text-lg font-semibold mb-2 text-gray-800 pr-4">{paper.subjectName}</h3>
                  <p className="text-sm md:text-md text-gray-600 mb-2">
                    {paper.branch} - {paper.year !== 'FE' ? paper.year : ''} {paper.pattern} Pattern
                  </p>
                  <p className="text-sm md:text-md text-gray-700 mb-6">
                    <span className="font-medium">{paper.paperType} </span> <span> Paper </span> <span className="font-medium">{paper.paperName} </span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 text-center">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={paper.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md flex-1 inline-block transition-all duration-200 shadow-md"
                    >
                      View Paper
                    </motion.a>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDefaultTaskInfo(paper)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-md flex-1 inline-block transition-all duration-200 shadow-md"
                    >
                      Add to Tasks
                    </motion.button>
                  </div>
                </div>
                <div className='absolute top-3 right-3 p-1 flex justify-center items-center'>
                  {
                    changingBookmarkState && paper.id === itemToChangeBookmarkState
                      ? <div role="status" className="inline-flex items-center justify-center p-2">
                        <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                        <span className="sr-only">Changing...</span>
                      </div>
                      : <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleBookmark(paper)}
                        className={`rounded-full p-2 ${isBookmarked(paper.id)
                          ? 'text-yellow-500 bg-yellow-50'
                          : 'text-gray-400 bg-gray-50'
                          } transition-all duration-200`}
                      >
                        <FiBookmark
                          className={`w-5 h-5 ${isBookmarked(paper.id) ? 'fill-current' : ''}`}
                        />
                      </motion.button>
                  }
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isTaskModalOpen && defaultListId && taskForModal && (
        <TaskModal
          isOpen={isTaskModalOpen}
          lists={lists}
          task={taskForModal}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedPaper(null);
          }}
          onSave={handleSaveTask}
          isSubmitting={isSubmitting}
          boardId={lists.find(list => list.id === defaultListId)?.boardId || ''}
        />
      )}
    </div>
  );
};

export default PYQs; 