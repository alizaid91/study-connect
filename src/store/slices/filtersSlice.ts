import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ResourceFilterValues } from "../../services/resourcesService";

interface FilterState {
  resourceFilters: ResourceFilterValues;
}

const initialState: FilterState = {
  resourceFilters: {
    branch: "",
    year: "",
    semester: "",
    pattern: "",
    type: "",
    subjectName: "",
    searchString: "",
  },
};

const FilterSlice = createSlice({
  name: "paperFilter",
  initialState,
  reducers: {
    setResourceFilters: (
      state,
      action: PayloadAction<FilterState["resourceFilters"]>
    ) => {
      state.resourceFilters = action.payload;
    },
    updateResourceFilterField: <K extends keyof ResourceFilterValues>(
      state: FilterState,
      action: PayloadAction<{
        field: K;
        value: ResourceFilterValues[K];
      }>
    ) => {
      const { field, value } = action.payload;
      state.resourceFilters[field] = value;
    },
    resetResourceFilters: (state) => {
      state.resourceFilters = {
        ...initialState.resourceFilters,
        type: state.resourceFilters.type,
      };
    },
  },
});

export const { setResourceFilters, resetResourceFilters, updateResourceFilterField } = FilterSlice.actions;
export default FilterSlice.reducer;
