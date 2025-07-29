import React, { FormEvent, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { updateResourceFilterField } from "../../store/slices/filtersSlice";

interface SearchBarProps {
  classes?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ classes }) => {
  const { resourceFilters } = useSelector((state: RootState) => state.filters);
  const dispatch = useDispatch();

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    dispatch(updateResourceFilterField({ field: "searchString", value }));
  };

  return (
    <form className={`${classes}`}>
      <label
        htmlFor="default-search"
        className="mb-2 text-sm font-medium text-gray-900 sr-only"
      >
        Search
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          value={resourceFilters.searchString}
          onChange={(e) => handleChange(e)}
          className="block w-full p-4 pl-10 text-sm text-gray-900 border border-blue-300 rounded-xl bg-blue-50 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search study materials..."
          required
        />
      </div>
    </form>
  );
};

export default SearchBar;
