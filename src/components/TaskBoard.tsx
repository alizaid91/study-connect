import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    setLoading,
    setTasks,
    setLists,
    setBoards,
    setSelectedBoardId,
} from '../store/slices/taskSlice';
import { db } from '../config/firebase';
import {
    collection,
    query,
    where,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    writeBatch
} from 'firebase/firestore';
import { Task, List, TaskForm, Board } from '../types/content';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import ListFormModal from './ListFormModal';
import BoardFormModal from './BoardFormModal';
import { motion } from 'framer-motion';
import { FiPlus, FiChevronDown } from 'react-icons/fi';

const TaskBoard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { tasks, lists, boards, selectedBoardId, loading } = useSelector((state: RootState) => state.tasks);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editingBoard, setEditingBoard] = useState<Board | null>(null);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [defaultBoardId, setDefaultBoardId] = useState<string | null>(null);
    const [activeListenerBoardId, setActiveListenerBoardId] = useState<string | null>(null);
    const boardSelectorRef = useRef<HTMLDivElement | null>(null);
    const [isBoardChanging, setIsBoardChanging] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;

        dispatch(setLoading(true));
        let mounted = true;
        let unsubscribeFn: () => void = () => { };

        const setupListeners = async () => {
            try {
                // Fetch boards
                const boardsQuery = query(
                    collection(db, 'boards'),
                    where('userId', '==', user.uid)
                );

                const unsubscribeBoards = onSnapshot(
                    boardsQuery,
                    (snapshot) => {
                        if (!mounted) return;

                        const fetchedBoards = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data()
                        })) as Board[];

                        dispatch(setBoards(fetchedBoards));

                        // Find default board
                        const defaultBoard = fetchedBoards.find(board => board.isDefault);
                        if (defaultBoard) {
                            setDefaultBoardId(defaultBoard.id);

                            // If no board is selected, select the default board
                            if (!selectedBoardId) {
                                dispatch(setSelectedBoardId(defaultBoard.id));
                            }
                        } else if (fetchedBoards.length > 0 && !selectedBoardId) {
                            // If no default board but we have boards, select the first one
                            dispatch(setSelectedBoardId(fetchedBoards[0].id));
                        }
                    },
                    (error) => {
                        if (mounted) {
                            dispatch(setLoading(false));
                        }
                    }
                );

                // Create default board if needed
                await setupDefaultBoard();

                return () => {
                    unsubscribeBoards();
                    if (activeListenerBoardId) {
                        setupBoardListeners(null);
                    }
                };
            } catch (error) {
                if (mounted) {
                    dispatch(setLoading(false));
                }
                return () => { };
            }
        };

        // Initialize listeners and store cleanup function
        setupListeners().then(cleanup => {
            if (mounted) {
                unsubscribeFn = cleanup;
            } else {
                cleanup();
            }
        });

        return () => {
            mounted = false;
            unsubscribeFn();
        };
    }, [dispatch, user?.uid]);

    // Function to create default board if needed
    const setupDefaultBoard = async () => {
        if (!user?.uid) return;

        try {
            const boardsQuery = query(
                collection(db, 'boards'),
                where('userId', '==', user.uid),
                where('isDefault', '==', true)
            );

            const boardsSnapshot = await getDocs(boardsQuery);

            let boardId: string;
            let boardExists = false;

            if (boardsSnapshot.empty) {
                const newBoard = {
                    title: 'My Board',
                    userId: user.uid,
                    isDefault: true,
                    position: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                const boardRef = await addDoc(collection(db, 'boards'), newBoard);
                boardId = boardRef.id;

                const newList = {
                    title: 'To Do',
                    boardId: boardId,
                    userId: user.uid,
                    position: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await addDoc(collection(db, 'lists'), newList);
            } else {
                boardId = boardsSnapshot.docs[0].id;
                boardExists = true;
            }

            setDefaultBoardId(boardId);

            if (boardExists) {
                const listsQuery = query(
                    collection(db, 'lists'),
                    where('boardId', '==', boardId)
                );

                const listsSnapshot = await getDocs(listsQuery);

                if (listsSnapshot.empty) {
                    const newList = {
                        title: 'To Do',
                        boardId: boardId,
                        userId: user.uid,
                        position: 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    await addDoc(collection(db, 'lists'), newList);
                }
            }
        } catch (error) {
            dispatch(setLoading(false));
        }
    };

    // Effect to listen for board selection changes
    useEffect(() => {
        if (!selectedBoardId || !user?.uid) return;

        // Show loading animation when changing boards
        setIsBoardChanging(true);

        // Setup listeners for the selected board
        const cleanup = setupBoardListeners(selectedBoardId);

        // Hide loading animation after a delay
        const timer = setTimeout(() => {
            setIsBoardChanging(false);
        }, 800);

        return () => {
            cleanup();
            clearTimeout(timer);
        };
    }, [selectedBoardId, user?.uid]);

    const setupBoardListeners = (boardId: string | null) => {
        if (activeListenerBoardId === boardId) {
            return () => { };
        }

        // Clear previous listeners
        if (activeListenerBoardId) {
            dispatch(setLists([]));
            dispatch(setTasks([]));
        }

        if (!boardId) {
            setActiveListenerBoardId(null);
            return () => { };
        }

        setActiveListenerBoardId(boardId);

        const listsQuery = query(
            collection(db, 'lists'),
            where('boardId', '==', boardId)
        );

        const unsubscribeLists = onSnapshot(
            listsQuery,
            (snapshot) => {
                const fetchedLists = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })) as List[];

                const sortedLists = fetchedLists.sort((a, b) => a.position - b.position);
                dispatch(setLists(sortedLists));
            },
            (error) => { }
        );

        const tasksQuery = query(
            collection(db, 'tasks'),
            where('boardId', '==', boardId)
        );

        const unsubscribeTasks = onSnapshot(
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
                dispatch(setLoading(false));
            },
            (error) => {
                dispatch(setLoading(false));
            }
        );

        return () => {
            unsubscribeLists();
            unsubscribeTasks();
            setActiveListenerBoardId(null);
        };
    };

    const handleAddTask = (listId: string) => {
        setSelectedListId(listId);
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = async (taskData: TaskForm) => {
        if (!user?.uid || !selectedBoardId) return;

        setIsSubmitting(true);
        try {
            if (editingTask) {
                try {
                    const taskRef = doc(db, 'tasks', editingTask.id);

                    const updatedTask: Record<string, any> = {
                        ...taskData,
                        boardId: selectedBoardId,
                        updatedAt: new Date().toISOString()
                    };

                    if (!updatedTask.dueDate) {
                        delete updatedTask.dueDate;
                    }

                    if (!updatedTask.attachments || updatedTask.attachments.length === 0) {
                        delete updatedTask.attachments;
                    }

                    updatedTask.completed = !!updatedTask.completed;

                    await updateDoc(taskRef, updatedTask);
                } catch (error) { }
            } else {
                const listTasks = tasks.filter(t => t.listId === taskData.listId);
                const position = listTasks.length > 0
                    ? Math.max(...listTasks.map(t => t.position)) + 1
                    : 0;

                const newTask = {
                    ...taskData,
                    boardId: selectedBoardId,
                    userId: user.uid,
                    position,
                    completed: !!taskData.completed,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await addDoc(collection(db, 'tasks'), newTask);
            }

            setIsTaskModalOpen(false);
            setEditingTask(null);
            setSelectedListId(null);
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteDoc(doc(db, 'tasks', taskId));
        } catch (error) { }
    };

    const handleAddList = () => {
        setIsListModalOpen(true);
    };

    const handleSaveList = async (title: string) => {
        if (!user?.uid || !selectedBoardId) return;

        setIsSubmitting(true);
        try {
            const nextPosition = lists.length > 0
                ? Math.max(...lists.map(list => list.position)) + 1
                : 0;

            const newList = {
                title,
                boardId: selectedBoardId,
                userId: user.uid,
                position: nextPosition,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'lists'), newList);
            setIsListModalOpen(false);
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditList = async (list: List, newTitle: string) => {
        try {
            const listRef = doc(db, 'lists', list.id);
            await updateDoc(listRef, {
                title: newTitle,
                updatedAt: new Date().toISOString()
            });
        } catch (error) { }
    };

    const handleDeleteList = async (listId: string) => {
        try {
            const listTasks = tasks.filter(task => task.listId === listId);
            const batch = writeBatch(db);

            batch.delete(doc(db, 'lists', listId));

            listTasks.forEach(task => {
                batch.delete(doc(db, 'tasks', task.id));
            });

            await batch.commit();
        } catch (error) { }
    };

    const handleAddBoard = () => {
        setEditingBoard(null);
        setIsBoardModalOpen(true);
    };

    const handleSaveBoard = async (title: string) => {
        if (!user?.uid) return;

        setIsSubmitting(true);
        try {
            if (editingBoard) {
                const boardRef = doc(db, 'boards', editingBoard.id);
                await updateDoc(boardRef, {
                    title,
                    updatedAt: new Date().toISOString()
                });
            } else {
                const newBoard = {
                    title,
                    userId: user.uid,
                    isDefault: false,
                    position: boards.length + 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                const boardRef = await addDoc(collection(db, 'boards'), newBoard);

                // Create a default list in the new board
                const newList = {
                    title: 'To Do',
                    boardId: boardRef.id,
                    userId: user.uid,
                    position: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await addDoc(collection(db, 'lists'), newList);

                // Set the new board as selected
                dispatch(setSelectedBoardId(boardRef.id));
            }

            setIsBoardModalOpen(false);
            setEditingBoard(null);
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectBoard = (boardId: string) => {
        dispatch(setSelectedBoardId(boardId));
        setIsBoardDropdownOpen(false);
    };

    const getSelectedBoard = () => {
        return boards.find(board => board.id === selectedBoardId) || null;
    };

    // Close board dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isBoardDropdownOpen &&
                boardSelectorRef.current &&
                !boardSelectorRef.current.contains(event.target as Node)) {
                setIsBoardDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isBoardDropdownOpen]);

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

    const getTasksByListId = (listId: string) => {
        const listTasks = tasks.filter(task => task.listId === listId);
        const tasksWithPosition = listTasks.map(task => ({
            ...task,
            position: typeof task.position === 'number' ? task.position : 0
        }));
        return tasksWithPosition.sort((a, b) => a.position - b.position);
    };

    const selectedBoard = getSelectedBoard();

    // Shared loading spinner component
    const LoadingSpinner = () => (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-50 z-10 h-full ">
            <div className="relative w-20 h-20">
                <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent animate-spin"></div>
                <div className="absolute top-2 left-2 w-16 h-16 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-blue-400 animate-spin animation-delay-150"></div>
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full border-4 border-t-blue-300 border-r-transparent border-b-blue-500 border-l-transparent animate-spin animation-delay-300"></div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="w-full">
                <div ref={boardSelectorRef} className="relative w-full flex justify-center">
                    <button
                        onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
                        className="bg-white border border-gray-300 rounded-md px-3 py-2 flex items-center space-x-2 shadow-sm hover:bg-gray-50"
                    >
                        <span className="font-medium">{selectedBoard?.title || 'Select Board'}</span>
                        <FiChevronDown />
                    </button>
                        <div className={`absolute ${isBoardDropdownOpen ? 'visible opacity-100 top-full' : '-top-1 opacity-0 invisible'} transition-all duration-300 z-10 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg`}>
                            <div className="py-1">
                                {boards.map(board => (
                                    <button
                                        key={board.id}
                                        onClick={() => handleSelectBoard(board.id)}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center ${board.id === selectedBoardId ? 'bg-blue-50 text-blue-700' : ''}`}
                                    >
                                        <span>{board.title} {board.isDefault && <span className="text-xs text-gray-500">(Default)</span>}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={handleAddBoard}
                                    className="w-full text-left px-4 py-2 text-blue-600 border-t border-gray-200 hover:bg-blue-50 flex items-center"
                                >
                                    <FiPlus className="mr-2" /> Create New Board
                                </button>
                            </div>
                        </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto relative">
                {isBoardChanging && <LoadingSpinner />}
                {selectedBoardId && (
                    <div className={`flex p-4 overflow-x-auto pb-6 h-full`}>
                        <div className="flex space-x-4 md:space-x-6 pb-4 md:pb-0 snap-x snap-mandatory">
                            {lists.map(list => (
                                <div key={list.id} className="snap-start">
                                    <TaskList
                                        list={list}
                                        tasks={getTasksByListId(list.id)}
                                        onAddTask={handleAddTask}
                                        onEditTask={handleEditTask}
                                        onDeleteTask={handleDeleteTask}
                                        onEditList={handleEditList}
                                        onDeleteList={handleDeleteList}
                                    />
                                </div>
                            ))}
                            <div className="snap-start ml-2 pt-1 flex items-start">
                                <button
                                    onClick={handleAddList}
                                    className="text-nowrap bg-white shadow-md h-10 px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
                                >
                                    <FiPlus />
                                    <span>Add Another List</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedBoardId && (
                <>
                    <TaskModal
                        isOpen={isTaskModalOpen}
                        lists={lists}
                        boards={boards}
                        task={editingTask}
                        listId={selectedListId || undefined}
                        onClose={() => {
                            setIsTaskModalOpen(false);
                            setEditingTask(null);
                            setSelectedListId(null);
                        }}
                        onSave={handleSaveTask}
                        isSubmitting={isSubmitting}
                        boardId={selectedBoardId}
                    />

                    <ListFormModal
                        isOpen={isListModalOpen}
                        onClose={() => setIsListModalOpen(false)}
                        onSave={handleSaveList}
                        isSubmitting={isSubmitting}
                    />
                </>
            )}

            <BoardFormModal
                isOpen={isBoardModalOpen}
                onClose={() => {
                    setIsBoardModalOpen(false);
                    setEditingBoard(null);
                }}
                onSave={handleSaveBoard}
                isSubmitting={isSubmitting}
                initialTitle={editingBoard?.title || ''}
                mode={editingBoard ? 'edit' : 'create'}
            />
        </div>
    );
};

export default TaskBoard; 