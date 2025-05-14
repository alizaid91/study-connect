// services/BoardService.ts
import {
    collection, query, where, onSnapshot, getDocs, addDoc, doc,
    updateDoc, deleteDoc, writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Board, List, Task, TaskForm } from '../types/content';

export const listenToBoards = (userId: string, onChange: (boards: Board[]) => void, onError: () => void) => {
    const q = query(collection(db, 'boards'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Board[];
        onChange(boards);
    }, onError);
    return unsubscribe;
};

export const createDefaultBoardIfNeeded = async (userId: string): Promise<string> => {
    const defaultQuery = query(
        collection(db, 'boards'),
        where('userId', '==', userId),
        where('isDefault', '==', true)
    );

    const snapshot = await getDocs(defaultQuery);

    if (snapshot.empty) {
        const newBoard = {
            title: 'My Board',
            userId,
            isDefault: true,
            position: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const boardRef = await addDoc(collection(db, 'boards'), newBoard);

        await addDoc(collection(db, 'lists'), {
            title: 'To Do',
            boardId: boardRef.id,
            userId,
            position: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return boardRef.id;
    } else {
        const boardId = snapshot.docs[0].id;

        const listsQuery = query(collection(db, 'lists'), where('boardId', '==', boardId));
        const listsSnapshot = await getDocs(listsQuery);

        if (listsSnapshot.empty) {
            await addDoc(collection(db, 'lists'), {
                title: 'To Do',
                boardId,
                userId,
                position: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        return boardId;
    }
};

export const listenToListsAndTasks = (
    userId: string,
    onLists: (lists: List[]) => void,
    onTasks: (tasks: Task[]) => void,
    onError: () => void
) => {
    const listsQuery = query(collection(db, 'lists'), where('userId', '==', userId));
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', userId));

    const unsubscribeLists = onSnapshot(listsQuery, snapshot => {
        const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as List[];
        onLists(lists.sort((a, b) => a.position - b.position));
    }, onError);

    const unsubscribeTasks = onSnapshot(tasksQuery, snapshot => {
        const tasks = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                position: typeof data.position === 'number' ? data.position : 0,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
            };
        }) as Task[];
        onTasks(tasks);
    }, onError);

    return () => {
        unsubscribeLists();
        unsubscribeTasks();
    };
};

export const saveTask = async (
    taskData: TaskForm,
    userId: string,
    boardId: string,
    editingTask?: Task,
    existingTasks?: Task[]
) => {
    if (editingTask) {
        const taskRef = doc(db, 'tasks', editingTask.id);
        const updated = {
            ...taskData,
            boardId,
            updatedAt: new Date().toISOString(),
            completed: !!taskData.completed
        };

        if (!updated.dueDate) delete updated.dueDate;
        if (!updated.attachments?.length) delete updated.attachments;

        return updateDoc(taskRef, updated);
    }

    const position = existingTasks?.filter(t => t.listId === taskData.listId)?.length || 0;

    const newTask = {
        ...taskData,
        boardId,
        userId,
        position,
        completed: !!taskData.completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    return addDoc(collection(db, 'tasks'), newTask);
};

export const deleteTask = (taskId: string) => deleteDoc(doc(db, 'tasks', taskId));

export const createList = (title: string, boardId: string, userId: string, position: number) => {
    const newList = {
        title,
        boardId,
        userId,
        position,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    return addDoc(collection(db, 'lists'), newList);
};

export const updateListTitle = (listId: string, newTitle: string) =>
    updateDoc(doc(db, 'lists', listId), {
        title: newTitle,
        updatedAt: new Date().toISOString()
    });

export const deleteListWithTasks = async (listId: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'lists', listId));

    // Get all tasks
    const tasksQuery = query(collection(db, 'tasks'), where('listId', '==', listId));
    const tasksSnapshot = await getDocs(tasksQuery);

    tasksSnapshot.docs.forEach(taskDoc => {
        batch.delete(doc(db, 'tasks', taskDoc.id));
    });

    return batch.commit();
};

export const deleteBoardWithContent = async (boardId: string) => {
    // Get all lists
    const listsQuery = query(collection(db, 'lists'), where('boardId', '==', boardId));
    const listsSnapshot = await getDocs(listsQuery);

    // Get all tasks
    const tasksQuery = query(collection(db, 'tasks'), where('boardId', '==', boardId));
    const tasksSnapshot = await getDocs(tasksQuery);

    // Create a batch to delete everything
    const batch = writeBatch(db);

    // Delete the board
    batch.delete(doc(db, 'boards', boardId));

    // Delete all lists
    listsSnapshot.docs.forEach(listDoc => {
        batch.delete(doc(db, 'lists', listDoc.id));
    });

    // Delete all tasks
    tasksSnapshot.docs.forEach(taskDoc => {
        batch.delete(doc(db, 'tasks', taskDoc.id));
    });

    // Commit the batch
    return batch.commit();
};

export const saveBoard = async (title: string, userId: string, boardsLength: number, editingBoard?: Board) => {
    const timestamp = new Date().toISOString();

    if (editingBoard) {
        return updateDoc(doc(db, 'boards', editingBoard.id), { title, updatedAt: timestamp });
    } else {
        const boardRef = await addDoc(collection(db, 'boards'), {
            title,
            userId,
            isDefault: false,
            position: boardsLength + 1,
            createdAt: timestamp,
            updatedAt: timestamp
        });

        await addDoc(collection(db, 'lists'), {
            title: 'To Do',
            boardId: boardRef.id,
            userId,
            position: 0,
            createdAt: timestamp,
            updatedAt: timestamp
        });

        return boardRef.id;
    }
};