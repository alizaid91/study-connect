import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'paper' | 'note' | 'ebook';
  fileUrl: string;
  uploadDate: string;
  userId: string;
  subject: string;
  year?: number;
}

interface ResourceState {
  resources: Resource[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourceState = {
  resources: [],
  loading: false,
  error: null,
};

const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setResources: (state, action: PayloadAction<Resource[]>) => {
      state.resources = action.payload;
      state.error = null;
    },
    addResource: (state, action: PayloadAction<Resource>) => {
      state.resources.push(action.payload);
    },
    deleteResource: (state, action: PayloadAction<string>) => {
      state.resources = state.resources.filter(resource => resource.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setResources,
  addResource,
  deleteResource,
  setLoading,
  setError,
} = resourceSlice.actions;

export default resourceSlice.reducer; 