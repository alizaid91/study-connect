import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    setLoading,
    setTasks,
    setLists,
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
import { Task, List, TaskForm } from '../types/content';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import ListFormModal from './ListFormModal';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

const TaskBoard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { tasks, lists, loading } = useSelector((state: RootState) => state.tasks);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [defaultBoardId, setDefaultBoardId] = useState<string | null>(null);
    const [activeListenerBoardId, setActiveListenerBoardId] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.uid) return;

        dispatch(setLoading(true));
        let cleanupFunction = () => { };

        let isSettingUp = false;
        let mounted = true;

        const setupBoard = async () => {
            if (isSettingUp || !mounted) return;
            isSettingUp = true;

            try {
                const boardsQuery = query(
                    collection(db, 'boards'),
                    where('userId', '==', user.uid),
                    where('isDefault', '==', true)
                );

                const boardsSnapshot = await getDocs(boardsQuery);

                if (!mounted) {
                    isSettingUp = false;
                    return;
                }

                let boardId: string;
                let boardExists = false;

                if (boardsSnapshot.empty) {
                    const newBoard = {
                        title: 'My Board',
                        userId: user.uid,
                        isDefault: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    const boardRef = await addDoc(collection(db, 'boards'), newBoard);
                    boardId = boardRef.id;

                    if (!mounted) {
                        isSettingUp = false;
                        return;
                    }

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

                if (!mounted) {
                    isSettingUp = false;
                    return;
                }

                setDefaultBoardId(boardId);

                if (boardExists) {
                    const listsQuery = query(
                        collection(db, 'lists'),
                        where('boardId', '==', boardId)
                    );

                    const listsSnapshot = await getDocs(listsQuery);

                    if (!mounted) {
                        isSettingUp = false;
                        return;
                    }

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

                if (!mounted) {
                    isSettingUp = false;
                    return;
                }

                cleanupFunction = setupListeners(boardId);
                isSettingUp = false;
            } catch (error) {
                dispatch(setLoading(false));
                isSettingUp = false;
            }
        };

        setupBoard();

        return () => {
            mounted = false;
            cleanupFunction();
        };
    }, [dispatch, user?.uid]);

    const setupListeners = (boardId: string) => {
        if (activeListenerBoardId === boardId) {
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
        if (!user?.uid || !defaultBoardId) return;

        setIsSubmitting(true);
        try {
            if (editingTask) {
                try {
                    const taskRef = doc(db, 'tasks', editingTask.id);

                    const updatedTask: Record<string, any> = {
                        ...taskData,
                        boardId: defaultBoardId,
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
                    boardId: defaultBoardId,
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
        if (!user?.uid || !defaultBoardId) return;

        setIsSubmitting(true);
        try {
            const nextPosition = lists.length > 0
                ? Math.max(...lists.map(list => list.position)) + 1
                : 0;

            const newList = {
                title,
                boardId: defaultBoardId,
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

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center pb-4 px-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800">Task Board</h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center space-x-2"
                    onClick={handleAddList}
                >
                    <FiPlus />
                    <span>Add List</span>
                </motion.button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex p-4 overflow-x-auto pb-6 h-full" style={{
                    background: 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)'
                }}>
                    {lists.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center text-gray-500">
                            <p className="mb-4 text-lg">No lists yet. Create your first list to get started!</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                                onClick={handleAddList}
                            >
                                <FiPlus />
                                <span>Add List</span>
                            </motion.button>
                        </div>
                    ) : (
                        <>
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
                                <div className="snap-start ml-2 pt-2 flex items-start">
                                    <button
                                        onClick={handleAddList}
                                        className="text-nowrap bg-gray-800 hover:bg-gray-700 text-gray-200 h-10 px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors shadow-sm"
                                    >
                                        <FiPlus />
                                        <span>Add Another List</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {defaultBoardId && (
                <>
                    <TaskModal
                        isOpen={isTaskModalOpen}
                        lists={lists}
                        task={editingTask}
                        listId={selectedListId || undefined}
                        onClose={() => {
                            setIsTaskModalOpen(false);
                            setEditingTask(null);
                            setSelectedListId(null);
                        }}
                        onSave={handleSaveTask}
                        isSubmitting={isSubmitting}
                        boardId={defaultBoardId}
                    />

                    <ListFormModal
                        isOpen={isListModalOpen}
                        onClose={() => setIsListModalOpen(false)}
                        onSave={handleSaveList}
                        isSubmitting={isSubmitting}
                    />
                </>
            )}
        </div>
    );
};

export default TaskBoard; 