import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { Paper, Bookmark, TaskForm, Task } from "../types/content";
import {
  addBookmark,
  removeBookmark,
  fetchBookmarks,
} from "../store/slices/bookmarkSlice";
import { FiTrash2, FiFilter, FiChevronsDown, FiBookmark } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import TaskModal from "../components/Task-Board/TaskModal";
import { setBoards, setLists, setTasks } from "../store/slices/taskSlice";
import {
  listenToBoards,
  saveTask,
  listenToListsAndTasks,
  createDefaultBoardIfNeeded,
} from "../services/taskServics";
import { setPapers, setLoading } from "../store/slices/papersSlice";
import { papersService, QuickFilter } from "../services/papersService";
import { useNavigate } from "react-router-dom";
import { MdArrowForward } from "react-icons/md";
import Loader1 from "../components/Loaders/Loader1";

const sortQuickFilters = (qf: QuickFilter[]) => {
  return qf.sort((a, b) => {
    const typeA = a.values.paperType?.trim();
    const typeB = b.values.paperType?.trim();

    const isAEmpty = !typeA;
    const isBEmpty = !typeB;

    if (isAEmpty && !isBEmpty) return 1; // a goes after b
    if (!isAEmpty && isBEmpty) return -1; // b goes after a
    if (isAEmpty && isBEmpty) return 0; // both empty, equal

    if (typeA === "Insem" && typeB === "Endsem") return -1;
    if (typeA === "Endsem" && typeB === "Insem") return 1;

    return 0;
  });
};

const PYQs: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const { bookmarks } = useSelector((state: RootState) => state.bookmarks);
  const { papers, loading, error } = useSelector(
    (state: RootState) => state.papers
  );
  const { boards, lists, tasks } = useSelector(
    (state: RootState) => state.tasks
  );

  const [saving, setSaving] = useState(false);
  const [changingBookmarkState, setChangingBookmarkState] = useState(false);
  const [itemToChangeBookmarkState, setItemToChangeBookmarkState] =
    useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [filters, setFilters] = useState({
    branch: "",
    year: "",
    semester: 0,
    pattern: "",
    paperType: "",
    subjectName: "",
    subjectCode: "",
    isReadyMade: false,
  });

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [defaultListId, setDefaultListId] = useState<string | null>(null);
  const [checkingDefaultBoard, setCheckingDefaultBoard] = useState(false);

  // Quick filters state
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);
  const [deletingQFId, setDeletingQFId] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [showMoreQuickFilters, setShowMoreQuickFilters] = useState(false);

  const pyqsRef = useRef<HTMLDivElement>(null);

  // Effect to prevent background scrolling when modal is open
  useEffect(() => {
    if (isTaskModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isTaskModalOpen]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        dispatch(setLoading(true));
        const papers = await papersService.getPapers();
        dispatch(setPapers(papers));
      } catch (error) {
        console.error("Error fetching papers:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchPapers();

    if (!user?.uid) return;

    const fetchQuickFilters = async () => {
      const filters = await papersService.getQuickFilters(user.uid);
      if (user && profile?.semester != 0) {
        const readyMadeFilters = papersService.createReadymadeFilters(
          profile?.branch as string,
          profile?.pattern as string,
          profile?.year,
          profile?.semester
        );

        setQuickFilters(sortQuickFilters([...filters, ...readyMadeFilters]));
      } else {
        setQuickFilters(filters);
      }
    };
    fetchQuickFilters();
    dispatch(fetchBookmarks(user.uid));

    let boardsUnsubscribe: (() => void) | undefined;
    let listsTasksUnsubscribe: (() => void) | undefined;

    // Setup function for checking/creating default board
    const ensureDefaultBoard = async () => {
      if (checkingDefaultBoard) return;

      setCheckingDefaultBoard(true);
      try {
        await createDefaultBoardIfNeeded(user.uid);
      } catch (error) {
        console.error("Error creating default board:", error);
      } finally {
        setCheckingDefaultBoard(false);
      }
    };

    // Setup listener for boards
    boardsUnsubscribe = listenToBoards(
      user.uid,
      async (fetchedBoards) => {
        dispatch(setBoards(fetchedBoards));

        if (
          fetchedBoards.length === 0 ||
          !fetchedBoards.some((board) => board.isDefault)
        ) {
          await ensureDefaultBoard();
        }

        const defaultBoard = fetchedBoards.find((board) => board.isDefault);
        if (defaultBoard && !listsTasksUnsubscribe) {
          listsTasksUnsubscribe = listenToListsAndTasks(
            user.uid,
            (fetchedLists) => dispatch(setLists(fetchedLists)),
            (fetchedTasks) => dispatch(setTasks(fetchedTasks)),
            () => console.error("Error fetching lists or tasks")
          );
        }
      },
      () => console.error("Error fetching boards")
    );

    return () => {
      if (boardsUnsubscribe) boardsUnsubscribe();
      if (listsTasksUnsubscribe) listsTasksUnsubscribe();
    };
  }, [dispatch, user?.uid]);

  useEffect(() => {
    if (!papers.length) return;
    const filtered = papersService.filterPapers(papers, filters);
    setFilteredPapers(filtered);
  }, [filters, papers]);

  useEffect(() => {
    if (lists.length > 0) {
      const defaultBoardId = boards.find((board) => board.isDefault)?.id || "";
      const defaultList = lists.find(
        (list) => list.boardId === defaultBoardId && list.position === 0
      );
      if (defaultList) {
        setDefaultListId(defaultList.id);
      }
    }
  }, [lists]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      if (name === "branch" || name === "year") {
        return {
          ...prev,
          [name]: value,
          subjectName: "",
          subjectCode: "",
        };
      }
      if (name === "subjectName") {
        const subj = papersService
          .getAvailableSubjects(papers, filters)
          .find((s) => s.name === value);
        return {
          ...prev,
          subjectName: value,
          subjectCode: subj ? subj.code.toUpperCase() : "",
        };
      }
      if (name === "semester") {
        return {
          ...prev,
          [name]: parseInt(value, 10),
        };
      }
      return {
        ...prev,
        [name]: value,
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
      const boardId = taskData.boardId;
      await saveTask(taskData, user.uid, boardId, undefined, tasks);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Error adding task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      branch: "",
      year: "",
      semester: 0,
      pattern: "",
      paperType: "",
      subjectName: "",
      subjectCode: "",
      isReadyMade: false,
    });
  };

  // Quick filter handlers
  const handleSaveQuickFilter = async () => {
    if (!user) return;
    if (
      quickFilters.some(
        (q) =>
          q.values.branch === filters.branch &&
          q.values.year === filters.year &&
          q.values.pattern === filters.pattern &&
          q.values.paperType === filters.paperType &&
          q.values.subjectName === filters.subjectName &&
          q.values.isReadyMade === filters.isReadyMade
      )
    ) {
      return;
    }
    try {
      setSaving(true);
      const docRef = await papersService.saveQuickFilter({
        ...filters,
        userId: user.uid,
      });
      setQuickFilters((prev) => [
        ...prev,
        { id: docRef.id, values: { ...filters } },
      ]);
    } catch (err) {
      console.error("Error saving quick filter", err);
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
      await papersService.deleteQuickFilter(id);
      setQuickFilters((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Error deleting quick filter", err);
    } finally {
      setIsDeleting(false);
      setDeletingQFId(null);
    }
  };

  const handleBookmark = async (paper: Paper) => {
    if (!user) return;

    const existingBookmark = bookmarks.find(
      (bookmark: Bookmark) =>
        bookmark.contentId === paper.id && bookmark.type === "Paper"
    );
    setItemToChangeBookmarkState(paper.id);
    setChangingBookmarkState(true);
    if (existingBookmark) {
      await dispatch(removeBookmark(existingBookmark.id));
    } else {
      await dispatch(
        addBookmark({
          userId: user.uid,
          contentId: paper.id,
          type: "Paper",
          paperType: paper.paperType,
          resourceType: null,
          title: paper.subjectName,
          name: paper.paperName,
          description: `${paper.branch} - ${paper.year} ${paper.pattern}`,
          link: paper.driveLink,
          createdAt: new Date().toISOString(),
        })
      );
    }
    setChangingBookmarkState(false);
  };

  const isBookmarked = (paperId: string) => {
    return bookmarks.some(
      (bookmark: Bookmark) =>
        bookmark.contentId === paperId && bookmark.type === "Paper"
    );
  };

  const getAvailableSubjects = () => {
    return papersService.getAvailableSubjects(papers, filters);
  };

  // Create a mock task for the modal when a paper is selected
  const taskForModal = useMemo(() => {
    if (!selectedPaper || !defaultListId) return null;

    const defaultList = lists.find((list) => list.id === defaultListId);
    if (!defaultList) return null;

    const title =
      "Solve " +
      (selectedPaper.year !== "FE" ? selectedPaper.year : "") +
      "-" +
      selectedPaper.branch +
      " " +
      selectedPaper.subjectId.toUpperCase() +
      " " +
      selectedPaper.paperType +
      " Paper of " +
      selectedPaper.paperName;

    return {
      id: "temp-id",
      title,
      description: "",
      listId: defaultListId,
      boardId: boards.find((board) => board.isDefault === true)?.id || "",
      priority: "high",
      dueDate: "",
      userId: user?.uid || "",
      position: 0,
      attachments: selectedPaper.driveLink
        ? [selectedPaper.driveLink]
        : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Task;
  }, [selectedPaper, defaultListId, lists, user]);

  if (loading) {
    return <Loader1 />;
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
        {!user && (
          <div
            className={`flex flex-col items-center justify-center h-full mb-8 bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow-md`}
          >
            <h2 className="text-md sm:text-xl font-semibold mb-4 text-gray-700">
              Signup and complete your profile to access ready-made quick
              filters.
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/auth#signup")}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center"
            >
              Signup
            </motion.button>
          </div>
        )}
        {user && profile?.semester == 0 && (
          <div
            className={`flex items-center justify-between w-full h-full mb-8 bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow-md`}
          >
            <h2 className="text-md sm:text-xl font-semibold text-gray-700">
              Complete your profile to access ready-made quick filters.
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center"
            >
              <MdArrowForward size={24} />
            </motion.button>
          </div>
        )}
        {user && quickFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex flex-col justify-center sm:flex-row sm:items-center sm:justify-start ml-4">
              <div className="flex items-center">
                <FiFilter className="mr-2" /> <span>Quick Filters</span>
              </div>{" "}
              <span className="text-xs text-gray-500 ml-2 mt-1">
                (Click to apply)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {quickFilters
                .slice(
                  0,
                  showMoreQuickFilters
                    ? quickFilters.length
                    : window.innerWidth < 768
                    ? 2
                    : 4
                )
                .map((qf, idx) => (
                  <motion.div
                    key={qf.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    onClick={() => {
                      handleApplyQuickFilter(qf);
                      pyqsRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="bg-white shadow-lg rounded-r-3xl rounded-l-md p-5 flex items-center justify-between min-w-[240px] space-x-4 cursor-pointer transition-all duration-200 hover:shadow-xl border-l-4 border-blue-500"
                  >
                    <div className="flex flex-col gap-1 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">{qf.values.branch}</span>
                        {qf.values.pattern && (
                          <span> - {qf.values.pattern} Pattern</span>
                        )}
                      </div>
                      {qf.values.subjectName && (
                        <span className="font-medium text-red-500">
                          {qf.values.subjectName}
                        </span>
                      )}
                      {qf.values.paperType && (
                        <span
                          className={`font-medium ${
                            qf.values.paperType === "Insem"
                              ? "text-blue-500"
                              : "text-green-500"
                          }`}
                        >
                          {qf.values.paperType} Papers
                        </span>
                      )}
                    </div>
                    {!qf.values.isReadyMade && (
                      <div className="flex items-center space-x-4">
                        {isDeleting && deletingQFId === qf.id ? (
                          <div
                            role="status"
                            className="inline-flex items-center"
                          >
                            <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full mr-2"></div>
                            <span className="sr-only">Deleting...</span>
                          </div>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiTrash2
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuickFilter(qf.id);
                              }}
                              className="text-red-500 hover:text-red-600 cursor-pointer"
                              size={20}
                            />
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
            {quickFilters.length > (window.innerWidth < 768 ? 2 : 4) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-4"
              >
                <motion.button
                  onClick={() => setShowMoreQuickFilters(!showMoreQuickFilters)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  <span>
                    {showMoreQuickFilters ? "Show Less" : "Show More"}
                  </span>
                  <motion.div
                    animate={{ rotate: showMoreQuickFilters ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiChevronsDown size={20} />
                  </motion.div>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100"
      >
        <div
          className={`flex justify-between items-center ${
            isFilterExpanded && "mb-4"
          }`}
        >
          <h2 className="text-xl font-semibold text-gray-700 flex items-center">
            <FiFilter className="mr-2" /> Filter Papers
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiChevronsDown
              className={`transform transition-transform duration-300 ${
                isFilterExpanded ? "rotate-180" : ""
              }`}
              size={24}
            />
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {isFilterExpanded && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch
                  </label>
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

                {filters.branch && filters.branch !== "FE" && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={filters.semester}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="">All Semesters</option>
                    {filters.branch === "FE" ? (
                      <>
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                      </>
                    ) : filters.year === "SE" ? (
                      <>
                        <option value={3}>Semester 3</option>
                        <option value={4}>Semester 4</option>
                      </>
                    ) : filters.year === "TE" ? (
                      <>
                        <option value={5}>Semester 5</option>
                        <option value={6}>Semester 6</option>
                      </>
                    ) : filters.year === "BE" ? (
                      <>
                        <option value={7}>Semester 7</option>
                        <option value={8}>Semester 8</option>
                      </>
                    ) : null}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pattern
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    name="subjectName"
                    value={filters.subjectName}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    disabled={
                      !filters.branch ||
                      (filters.branch !== "FE" && !filters.year)
                    }
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper Type
                  </label>
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
                {(filters.branch ||
                  filters.year ||
                  filters.pattern ||
                  filters.paperType ||
                  filters.subjectName) &&
                  (saving ? (
                    <button
                      disabled
                      type="button"
                      className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-6 py-2.5 text-center inline-flex items-center justify-center"
                    >
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="inline w-4 h-4 me-3 text-white animate-spin"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="#E5E7EB"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentColor"
                        />
                      </svg>
                      Saving...
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={
                        !user
                          ? () => navigate("/auth#login")
                          : handleSaveQuickFilter
                      }
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      {!user
                        ? "Login to save quick filters"
                        : "Save Quick Filter"}
                    </motion.button>
                  ))}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence initial={false}>
        {papers.length && filteredPapers.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow-md"
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
              <p>No papers found matching the selected filters.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              ref={pyqsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPapers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-b-3xl  shadow-md overflow-hidden relative group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <div className="p-6">
                    <h3 className="text-md md:text-lg font-semibold mb-2 text-gray-800 pr-4">
                      {paper.subjectName}
                    </h3>
                    <p className="text-sm md:text-md text-gray-600 mb-2">
                      {paper.branch} - {paper.year !== "FE" ? paper.year : ""}{" "}
                      {paper.pattern} Pattern
                    </p>
                    <p className="text-sm md:text-md text-gray-700 mb-6">
                      <span className="font-medium">{paper.paperType} </span>{" "}
                      <span> Paper </span>{" "}
                      <span className="font-medium">{paper.paperName} </span>
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
                        onClick={
                          !user
                            ? () => navigate("/auth#login")
                            : () => setDefaultTaskInfo(paper)
                        }
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-md flex-1 inline-block transition-all duration-200 shadow-md"
                      >
                        Add to Tasks
                      </motion.button>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 p-1 flex justify-center items-center">
                    {changingBookmarkState &&
                    paper.id === itemToChangeBookmarkState ? (
                      <div
                        role="status"
                        className="inline-flex items-center justify-center p-2"
                      >
                        <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                        <span className="sr-only">Changing...</span>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={
                          !user
                            ? () => navigate("/auth#login")
                            : () => handleBookmark(paper)
                        }
                        className={`rounded-full p-2 ${
                          isBookmarked(paper.id)
                            ? "text-yellow-500 bg-yellow-50"
                            : "text-gray-400 bg-gray-50"
                        } transition-all duration-200`}
                      >
                        <FiBookmark
                          className={`w-5 h-5 ${
                            isBookmarked(paper.id) ? "fill-current" : ""
                          }`}
                        />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isTaskModalOpen && defaultListId && taskForModal && (
        <TaskModal
          isOpen={isTaskModalOpen}
          lists={lists}
          boards={boards}
          task={taskForModal}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedPaper(null);
          }}
          onSave={handleSaveTask}
          isSubmitting={isSubmitting}
          boardId={boards.find((board) => board.isDefault === true)?.id || ""}
        />
      )}
    </div>
  );
};

export default PYQs;
