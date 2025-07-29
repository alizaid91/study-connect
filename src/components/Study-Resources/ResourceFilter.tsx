import { useDispatch, useSelector } from "react-redux";
import {
  resetResourceFilters,
  updateResourceFilterField,
} from "../../store/slices/filtersSlice";
import { RootState } from "../../store/index";
import { ResourceFilterValues } from "../../services/resourcesService";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { semesterMap } from "../../types/constants";

const branches = ["FE", "CS", "IT", "Civil", "Mechanical"];
const years = ["SE", "TE", "BE"];
const patterns = ["2019", "2024"];

interface ResourceFilterProps {
  isFilterExpanded: boolean;
  setIsFilterExpanded: (value: boolean) => void;
}

const ResourceFilter = ({
  isFilterExpanded,
  setIsFilterExpanded,
}: ResourceFilterProps) => {
  const dispatch = useDispatch();
  const filterValues = useSelector(
    (state: RootState) => state.filters.resourceFilters
  );

  const handleChange = (key: keyof ResourceFilterValues, value: string) => {
    if ((key === "branch" && value === "FE") || key === "branch" || key === "year") {
      dispatch(updateResourceFilterField({ field: "semester", value: "" }));
      dispatch(updateResourceFilterField({ field: "year", value: "" }));
    }
    dispatch(updateResourceFilterField({ field: key, value }));
  };

  const handleReset = () => {
    dispatch(resetResourceFilters());
  };

  useEffect(() => {
    if (isFilterExpanded) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFilterExpanded]);

  const FilterForm = (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label className="block text-sm font-medium text-blue-800 mb-1">
          Branch
        </label>
        <select
          value={filterValues.branch}
          onChange={(e) => handleChange("branch", e.target.value)}
          className="w-full p-2 rounded-lg border border-blue-300 bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>
      {filterValues.branch !== "FE" && filterValues.branch !== "" && (
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">
            Year
          </label>
          <select
            value={filterValues.year}
            onChange={(e) => handleChange("year", e.target.value)}
            className="w-full p-2 rounded-lg border border-blue-300 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {filterValues.branch && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semester
          </label>
          <select
            name="semester"
            value={filterValues.semester}
            onChange={(e) => handleChange("semester", e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">All Semesters</option>
            {semesterMap[
              filterValues.branch === "FE" ? "FE" : filterValues.year
            ]?.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-blue-800 mb-1">
          Pattern
        </label>
        <select
          value={filterValues.pattern}
          onChange={(e) => handleChange("pattern", e.target.value)}
          className="w-full p-2 rounded-lg border border-blue-300 bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Pattern</option>
          {patterns.map((pattern) => (
            <option key={pattern} value={pattern}>
              {pattern}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col justify-end">
        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 transition"
        >
          Reset Filters
        </button>
        <div>
          <button
            onClick={() => setIsFilterExpanded(false)}
            className="lg:hidden mt-2 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 🖥️ Desktop */}
      <div className="max-h-fit min-w-[300px] hidden lg:block bg-gradient-to-br from-[#f5faff] to-[#e6f0ff] rounded-3xl p-6 shadow-md border border-blue-100">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          Filter Resources
        </h2>
        {FilterForm}
      </div>

      {/* 📱 Mobile with Animation */}
      <AnimatePresence>
        {isFilterExpanded && (
          <motion.div
            className="fixed inset-0 bg-gray-900/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsFilterExpanded(false);
              }
            }}
          >
            <motion.div
              className="lg:hidden fixed left-0 right-0 bottom-0 bg-white border-t border-blue-200 z-50 shadow-xl rounded-t-3xl p-4 will-change-transform"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-blue-900">
                  Filter Resources
                </h2>
                <button
                  onClick={() => setIsFilterExpanded(false)}
                  className="text-blue-600 text-sm"
                >
                  Close
                </button>
              </div>
              {FilterForm}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResourceFilter;
