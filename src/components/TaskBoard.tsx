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
import { Task, List, TaskForm, Board } from '../types/content';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import ListFormModal from './ListFormModal';
import BoardFormModal from './BoardFormModal';
import { FiPlus, FiChevronDown } from 'react-icons/fi';
import {
    listenToBoards,
    createDefaultBoardIfNeeded,
    listenToListsAndTasks,
    saveTask,
    deleteTask,
    createList,
    updateListTitle,
    deleteListWithTasks,
    saveBoard
} from '../services/TaskServics';

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

    // Initialize boards and create default board if needed
    useEffect(() => {
        if (!user?.uid) return;

        dispatch(setLoading(true));
        let mounted = true;

        const unsubscribe = listenToBoards(
            user.uid,
            async (fetchedBoards) => {
                console.log("hello");
                if (!mounted) return;
                console.log("Hi");

                dispatch(setBoards(fetchedBoards));

                const defaultBoard = fetchedBoards.find(board => board.isDefault);
                if (defaultBoard) {
                    setDefaultBoardId(defaultBoard.id);
                    if (!selectedBoardId) {
                        dispatch(setSelectedBoardId(defaultBoard.id));
                    }
                } else if (fetchedBoards.length > 0 && !selectedBoardId) {
                    dispatch(setSelectedBoardId(fetchedBoards[0].id));
                }

                const defaultId = await createDefaultBoardIfNeeded(user.uid);
                if (defaultId) {
                    setDefaultBoardId(defaultId);
                }
            },
            () => dispatch(setLoading(false))
        );

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [user?.uid, dispatch, selectedBoardId]);

    // Listen to lists and tasks when board changes
    useEffect(() => {
        if (!selectedBoardId || !user?.uid) return;
        setIsBoardChanging(true);

        // Clear previous board listeners
        if (activeListenerBoardId !== selectedBoardId && activeListenerBoardId !== null) {
            dispatch(setLists([]));
            dispatch(setTasks([]));
        }

        setActiveListenerBoardId(selectedBoardId);

        const unsubscribe = listenToListsAndTasks(
            user.uid,
            (fetchedLists) => dispatch(setLists(fetchedLists)),
            (fetchedTasks) => {
                dispatch(setTasks(fetchedTasks));
                dispatch(setLoading(false));
            },
            () => dispatch(setLoading(false))
        );

        // Hide loading animation after a delay
        const timer = setTimeout(() => {
            setIsBoardChanging(false);
        }, 800);

        return () => {
            clearTimeout(timer);
            unsubscribe();
        };
    }, [selectedBoardId, user?.uid, dispatch, activeListenerBoardId]);

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

    // Task handlers
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
            await saveTask(
                taskData,
                user.uid,
                selectedBoardId,
                editingTask || undefined,
                tasks
            );

            setIsTaskModalOpen(false);
            setEditingTask(null);
            setSelectedListId(null);
        } catch (error) {
            console.error('Error saving task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // List handlers
    const handleAddList = () => {
        setIsListModalOpen(true);
    };

    const handleSaveList = async (title: string) => {
        if (!user?.uid || !selectedBoardId) return;

        setIsSubmitting(true);
        try {
            const position = lists.length > 0
                ? Math.max(...lists.map(list => list.position)) + 1
                : 0;

            await createList(title, selectedBoardId, user.uid, position);
            setIsListModalOpen(false);
        } catch (error) {
            console.error('Error creating list:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditList = async (list: List, newTitle: string) => {
        try {
            await updateListTitle(list.id, newTitle);
        } catch (error) {
            console.error('Error updating list:', error);
        }
    };

    const handleDeleteList = async (listId: string) => {
        try {
            await deleteListWithTasks(listId);
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    // Board handlers
    const handleAddBoard = () => {
        setEditingBoard(null);
        setIsBoardModalOpen(true);
    };

    const handleSaveBoard = async (title: string) => {
        if (!user?.uid) return;

        setIsSubmitting(true);
        try {
            if (editingBoard) {
                await saveBoard(title, user.uid, boards.length, editingBoard);
            } else {
                const newBoardId = await saveBoard(title, user.uid, boards.length);
                if (typeof newBoardId === 'string') {
                    dispatch(setSelectedBoardId(newBoardId));
                }
            }

            setIsBoardModalOpen(false);
            setEditingBoard(null);
        } catch (error) {
            console.error('Error saving board:', error);
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

    // Loading state
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
        <div className="absolute inset-0 flex justify-center items-center bg-gray-50 z-10 h-full">
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
                    <div className="flex p-4 overflow-x-auto pb-6 h-full">
                        <div className="flex space-x-4 md:space-x-6 pb-4 md:pb-0 snap-x snap-mandatory">
                            {lists.filter((list) => list.boardId === selectedBoardId).map(list => (
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