import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { authService } from "../../services/authService";
import { UserProfile } from "../../types/user";
import { closeProfileComplete } from "../../store/slices/globalPopups";
import { BookOpenText, CalendarDays, GraduationCap, Bot } from "lucide-react";

const steps = [
  "welcome",
  "branch",
  "year",
  "pattern",
  "semester",
  "collegeName",
] as const;
type Step = (typeof steps)[number];

const stepMessages: Record<Step, string> = {
  welcome: "",
  branch: "Which branch are you currently in?",
  year: "Select your current academic year.",
  pattern: "Choose your syllabus pattern (e.g., 2019 or 2024).",
  semester: "Which semester are you currently studying in?",
  collegeName: "Enter your college name to personalize recommendations.",
};

const ProfileCompletionPopup = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<Partial<UserProfile>>({});
  const dispatch = useDispatch();

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (currentStep === "branch" && data.branch === "FE") {
      setStepIndex(steps.indexOf("pattern"));
    } else {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((prev) => prev - 1);
  };

  const handleChange = (field: Step, value: any) => {
    if (field === "branch" && value === "FE") {
      setData((prev) => ({ ...prev, [field]: value, year: "" }));
      return;
    }
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = () => {
    if (!user?.uid) return;
    authService.updateUserProfile(user.uid, data as UserProfile);
    console.log("Profile data submitted:", data);
    dispatch(closeProfileComplete());
  };

  const getSemesterOptions = () => {
    if (data.branch === "FE") return [1, 2];
    if (data.year === "SE") return [3, 4];
    if (data.year === "TE") return [5, 6];
    if (data.year === "BE") return [7, 8];
    return [];
  };

  const selectAnimation = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  const isSubmitDisabled =
    !data.branch ||
    (data.branch !== "FE" && !data.year) ||
    !data.pattern ||
    !data.semester ||
    !data.collegeName;

  const renderStep = () => {
    const baseClass =
      "w-full p-3 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm";

    if (currentStep === "welcome") {
      return (
        <motion.div {...selectAnimation} className="text-center">
          <div className="flex justify-center text-[56px]">🎉</div>

          <h1 className="text-3xl font-bold text-gray-800">
            Welcome to <span className="text-blue-700">Study Connect</span>
          </h1>

          <p className="text-gray-500 max-w-xs mx-auto text-sm">
            Unlock a smarter way to study.{" "}
            <span className="font-bold">
              Let’s complete your profile for a personalized experience!
            </span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
            <div className="bg-blue-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
              <CalendarDays className="text-blue-600 w-5 h-5" />
              PYQs at your fingertips
            </div>
            <div className="bg-green-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
              <BookOpenText className="text-green-600 w-5 h-5" />
              Top Study Resources
            </div>
            <div className="bg-purple-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
              <Bot className="text-purple-600 w-5 h-5" />
              Smart AI Assistant
            </div>
            <div className="bg-orange-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
              <GraduationCap className="text-orange-500 w-5 h-5" />
              Task Management
            </div>
          </div>
        </motion.div>
      );
    }

    switch (currentStep) {
      case "branch":
        return (
          <motion.select
            {...selectAnimation}
            className={baseClass}
            value={data.branch || ""}
            onChange={(e) => handleChange("branch", e.target.value)}
          >
            <option value="">Select Branch</option>
            <option value="FE">First Year</option>
            <option value="CS">Computer Science</option>
            <option value="IT">Information Technology</option>
            <option value="Civil">Civil Engineering</option>
            <option value="Mechanical">Mechanical Engineering</option>
          </motion.select>
        );
      case "year":
        return (
          <motion.select
            {...selectAnimation}
            className={baseClass}
            value={data.year || ""}
            onChange={(e) => handleChange("year", e.target.value)}
          >
            <option value="">Select Year</option>
            <option value="SE">Second Year</option>
            <option value="TE">Third Year</option>
            <option value="BE">Final Year</option>
          </motion.select>
        );
      case "pattern":
        return (
          <motion.select
            {...selectAnimation}
            className={baseClass}
            value={data.pattern || ""}
            onChange={(e) => handleChange("pattern", parseInt(e.target.value))}
          >
            <option value="">Select Pattern</option>
            <option value="2019">2019</option>
            <option value="2024">2024</option>
          </motion.select>
        );
      case "semester":
        const semOptions = getSemesterOptions();
        return (
          <motion.select
            {...selectAnimation}
            className={baseClass}
            value={data.semester || ""}
            onChange={(e) => handleChange("semester", parseInt(e.target.value))}
          >
            <option value="">Select Semester</option>
            {semOptions.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </motion.select>
        );
      case "collegeName":
        return (
          <motion.input
            {...selectAnimation}
            type="text"
            placeholder="E.g., MIT WPU, Pune"
            className={baseClass}
            value={data.collegeName || ""}
            onChange={(e) => handleChange("collegeName", e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center relative mx-3 max-h-[90vh] overflow-y-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          <button
            onClick={() => dispatch(closeProfileComplete())}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-700 border border-gray-400 rounded-full p-1"
          >
            <IoClose size={24} />
          </button>

          {currentStep !== "welcome" && (
            <>
              <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">
                Let's Complete Your Profile
              </h2>
              <p className="text-sm text-gray-700 text-center mb-6">
                {stepMessages[currentStep]}
              </p>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="space-y-4"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-between gap-4">
            {currentStep !== "welcome" ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleBack}
                disabled={stepIndex === 0}
                className="flex-1 px-4 py-2 rounded-3xl bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-all"
              >
                Back
              </motion.button>
            ) : (
              <div className="flex-1" />
            )}

            {isLastStep ? (
              <motion.button
                disabled={isSubmitDisabled}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={onSubmit}
                className={`${
                  isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""
                } flex-1 px-4 py-2 rounded-3xl bg-blue-600 text-white hover:bg-blue-700 transition-all`}
              >
                Submit
              </motion.button>
            ) : currentStep === "welcome" ? (
              <button
                onClick={handleNext}
                className="cssbuttons-io-button rounded-full"
              >
                {" "}
                Get started
                <div className="icon rounded-full">
                  <svg
                    height="24"
                    width="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path
                      d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleNext}
                className="flex-1 px-4 py-2 rounded-3xl bg-blue-700 text-white hover:bg-blue-800 transition-all"
              >
                Next
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileCompletionPopup;
