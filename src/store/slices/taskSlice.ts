import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, List } from '../../types/content';

interface TaskState {
  tasks: Task[];
  lists: List[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  lists: [],
  loading: false,
  error: null
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // List actions
    setLists: (state, action: PayloadAction<List[]>) => {
      // Sort lists by position
      state.lists = action.payload.sort((a, b) => a.position - b.position);
    },
    addList: (state, action: PayloadAction<List>) => {
      state.lists.push(action.payload);
      // Re-sort lists by position
      state.lists.sort((a, b) => a.position - b.position);
    },
    updateList: (state, action: PayloadAction<List>) => {
      const index = state.lists.findIndex(list => list.id === action.payload.id);
      if (index !== -1) {
        state.lists[index] = action.payload;
        // Re-sort lists by position
        state.lists.sort((a, b) => a.position - b.position);
      }
    },
    deleteList: (state, action: PayloadAction<string>) => {
      state.lists = state.lists.filter(list => list.id !== action.payload);
    },
    reorderLists: (state, action: PayloadAction<List[]>) => {
      state.lists = action.payload.sort((a, b) => a.position - b.position);
    },
    
    // Task actions
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    
    // Move task between lists
    moveTask: (state, action: PayloadAction<{
      taskId: string;
      sourceListId: string;
      destinationListId: string;
      destinationIndex: number;
    }>) => {
      const { taskId, sourceListId, destinationListId, destinationIndex } = action.payload;
      
      // Get the task to move
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return;
      
      // Create updated task with new listId
      const updatedTask = {
        ...state.tasks[taskIndex],
        listId: destinationListId,
        updatedAt: new Date().toISOString()
      };
      
      // Update the task in the state
      state.tasks[taskIndex] = updatedTask;
    },
    
    // Clear state (e.g., on logout)
    clearTaskState: (state) => {
      state.tasks = [];
      state.lists = [];
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  setLoading, setError,
  setLists, addList, updateList, deleteList, reorderLists,
  setTasks, addTask, updateTask, deleteTask,
  moveTask,
  clearTaskState
} = taskSlice.actions;

export default taskSlice.reducer; 