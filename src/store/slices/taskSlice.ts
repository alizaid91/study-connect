import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, List, Board } from '../../types/content';

interface TaskState {
  tasks: Task[];
  lists: List[];
  boards: Board[];
  selectedBoardId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  lists: [],
  boards: [],
  selectedBoardId: localStorage.getItem('selectedBoardId') || null,
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

    // Board actions
    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload;
    },
    setSelectedBoardId: (state, action: PayloadAction<string | null>) => {
      state.selectedBoardId = action.payload;
      localStorage.setItem('selectedBoardId', action.payload || '');
    },

    // List actions
    setLists: (state, action: PayloadAction<List[]>) => {
      // Sort lists by position
      state.lists = action.payload.sort((a, b) => a.position - b.position);
    },

    // Task actions
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
  }
});

export const {
  setLoading, setError,
  setBoards, setSelectedBoardId,
  setLists,
  setTasks,
} = taskSlice.actions;

export default taskSlice.reducer; 