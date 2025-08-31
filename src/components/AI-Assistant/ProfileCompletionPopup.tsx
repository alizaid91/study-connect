import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { authService } from "../../services/authService";
import { UserProfile } from "../../types/user";
import { closeProfileComplete } from "../../store/slices/globalPopups";
import { BookOpenText, CalendarDays, GraduationCap, Bot } from "lucide-react";

const studentSteps = [
  "welcome",
  "branch",
  "year",
  "pattern",
  "semester",
  "collegeName",
] as const;
const educatorSteps = [
  "welcome",
  "designation",
  "branch", // added
  "subjectsHandled",
  "qualifications",
  "collegeName",
] as const;
// Strongly typed Step union
type StudentStep = (typeof studentSteps)[number];
type EducatorStep = (typeof educatorSteps)[number];

const studentStepMessages: Record<StudentStep, string> = {
  welcome: "",
  branch: "Which branch are you currently in?",
  year: "Select your current academic year.",
  pattern: "Choose your syllabus pattern (e.g., 2019 or 2024).",
  semester: "Which semester are you currently studying in?",
  collegeName: "Enter your college name to personalize recommendations.",
};

const educatorStepMessages: Record<EducatorStep, string> = {
  welcome: "",
  designation: "What is your current designation?",
  branch: "Which department / branch do you teach in?", // added
  subjectsHandled: "List the subjects you handle (comma separated).",
  qualifications: "List your academic qualifications (comma separated).",
  collegeName: "Enter your institution / college name.",
};

const ProfileCompletionPopup = () => {
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const isEducator = profile?.accountType === "educator";

  const steps = useMemo(
    () => (isEducator ? educatorSteps : studentSteps),
    [isEducator]
  );
  const stepMessages: Record<string, string> = isEducator
    ? educatorStepMessages
    : studentStepMessages;

  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<Partial<UserProfile>>(profile || {});
  // new raw text states to allow multi-word entries with spaces preserved
  const [subjectsHandledInput, setSubjectsHandledInput] = useState("");
  const [qualificationsInput, setQualificationsInput] = useState("");
  const dispatch = useDispatch();

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    setData(profile || {});
    setSubjectsHandledInput((profile?.subjectsHandled || []).join(", "));
    setQualificationsInput((profile?.qualifications || []).join(", "));
  }, [profile]);

  const handleNext = () => {
    if (!isEducator && currentStep === "branch" && data.branch === "FE") {
      setStepIndex(studentSteps.indexOf("pattern")); // use studentSteps
    } else {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    if (!isEducator && currentStep === "pattern" && data.branch === "FE") {
      setStepIndex(studentSteps.indexOf("branch")); // use studentSteps
    } else {
      setStepIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field === "branch" && value === "FE") {
      setData((prev) => ({ ...prev, [field]: value, year: "" }));
      return;
    }
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = () => {
    if (!user?.uid) return;
    authService.updateUserProfile(user.uid, data as UserProfile);
    dispatch(closeProfileComplete());
  };

  const getSemesterOptions = () => {
    if (data.branch === "FE") return [1, 2];
    if (data.year === "SE") return [3, 4];
    if (data.year === "TE") return [5, 6];
    if (data.year === "BE") return [7, 8];
    return [];
  };

  const isSubmitDisabled = isEducator
    ? !data.designation ||
      !data.branch || // added
      !data.collegeName ||
      !data.subjectsHandled ||
      (Array.isArray(data.subjectsHandled) &&
        data.subjectsHandled.length === 0) ||
      !data.qualifications ||
      (Array.isArray(data.qualifications) && data.qualifications.length === 0)
    : !data.branch ||
      (data.branch !== "FE" && !data.year) ||
      !data.pattern ||
      !data.semester ||
      !data.collegeName;

  const baseClass =
    "w-full p-3 border rounded-3xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm";

  const stepVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const parseListInput = (val: string) =>
    val
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <motion.div variants={stepVariants} className="text-center">
            <div className="flex justify-center text-[56px]">
              {isEducator ? "👩‍🏫" : "🎉"}
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEducator ? (
                <>
                  Welcome, <span className="text-blue-700">Educator</span>
                </>
              ) : (
                <>
                  Welcome to{" "}
                  <span className="text-blue-700">Study Connect</span>
                </>
              )}
            </h1>
            <p className="text-gray-500 max-w-xs mx-auto text-sm mt-2">
              {isEducator
                ? "Empower your teaching with smart tools. "
                : "Unlock a smarter way to study. "}
              <span className="font-bold">
                Let’s complete your profile for a personalized experience!
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
              {isEducator ? (
                <>
                  <div className="bg-blue-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                    <BookOpenText className="text-blue-600 w-5 h-5" /> Share &
                    Curate Resources
                  </div>
                  <div className="bg-green-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                    <Bot className="text-green-600 w-5 h-5" /> AI Assistance for
                    Teaching
                  </div>
                  <div className="bg-purple-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                    <CalendarDays className="text-purple-600 w-5 h-5" />{" "}
                    Organize Academic Tasks
                  </div>
                  <div className="bg-orange-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                    <GraduationCap className="text-orange-500 w-5 h-5" /> Engage
                    Learners
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                    <CalendarDays className="text-blue-600 w-5 h-5" /> PYQs at
                    your fingertips
                  </div>
                  <div className="bg-green-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                    <BookOpenText className="text-green-600 w-5 h-5" /> Top
                    Study Resources
                  </div>
                  <div className="bg-purple-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                    <Bot className="text-purple-600 w-5 h-5" /> Smart AI
                    Assistant
                  </div>
                  <div className="bg-orange-50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                    <GraduationCap className="text-orange-500 w-5 h-5" /> Task
                    Management
                  </div>
                </>
              )}
            </div>
          </motion.div>
        );
      // Student-only steps
      case "branch":
      case "year":
      case "pattern":
      case "semester":
      case "collegeName":
        if (isEducator) {
          if (currentStep === "collegeName") {
            return (
              <motion.input
                variants={stepVariants}
                type="text"
                placeholder="E.g., MIT WPU, Pune"
                className={baseClass}
                value={data.collegeName || ""}
                onChange={(e) => handleChange("collegeName", e.target.value)}
              />
            );
          }
          if (currentStep === "branch") {
            return (
              <motion.select
                variants={stepVariants}
                className={baseClass}
                value={data.branch || ""}
                onChange={(e) => handleChange("branch", e.target.value)}
              >
                <option value="">Select Department</option>
                <option value="CS">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="Civil">Civil Engineering</option>
                <option value="Mechanical">Mechanical Engineering</option>
                <option value="FE">First Year (Common)</option>
              </motion.select>
            );
          }
        } else {
          switch (currentStep) {
            case "branch":
              return (
                <motion.select
                  variants={stepVariants}
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
                  disabled={data.branch === "FE"}
                  variants={stepVariants}
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
                  variants={stepVariants}
                  className={baseClass}
                  value={data.pattern === "" ? "" : data.pattern ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleChange(
                      "pattern",
                      v === "" ? "" : (parseInt(v, 10) as 2019 | 2024)
                    );
                  }}
                >
                  <option value="">Select Pattern</option>
                  <option value="2019">2019</option>
                  <option value="2024">2024</option>
                </motion.select>
              );
            case "semester":
              return (
                <motion.select
                  variants={stepVariants}
                  className={baseClass}
                  value={data.semester || ""}
                  onChange={(e) =>
                    handleChange("semester", parseInt(e.target.value))
                  }
                >
                  <option value="">Select Semester</option>
                  {getSemesterOptions().map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </motion.select>
              );
            case "collegeName":
              return (
                <motion.input
                  variants={stepVariants}
                  type="text"
                  placeholder="E.g., MIT WPU, Pune"
                  className={baseClass}
                  value={data.collegeName || ""}
                  onChange={(e) => handleChange("collegeName", e.target.value)}
                />
              );
          }
        }
        return null;
      // Educator-only steps
      case "designation":
        return (
          <motion.input
            variants={stepVariants}
            type="text"
            placeholder="E.g., Assistant Professor"
            className={baseClass}
            value={data.designation || ""}
            onChange={(e) => handleChange("designation", e.target.value)}
          />
        );
      case "subjectsHandled":
        return (
          <motion.input
            variants={stepVariants}
            type="text"
            placeholder="E.g., Data Structures, DBMS"
            className={baseClass}
            value={subjectsHandledInput}
            onChange={(e) => {
              const val = e.target.value;
              setSubjectsHandledInput(val);
              const list = val
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
              setData((prev) => ({ ...prev, subjectsHandled: list }));
            }}
          />
        );
      case "qualifications":
        return (
          <motion.input
            variants={stepVariants}
            type="text"
            placeholder="E.g., M.Tech, PhD"
            className={baseClass}
            value={qualificationsInput}
            onChange={(e) => {
              const val = e.target.value;
              setQualificationsInput(val);
              const list = val
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
              setData((prev) => ({ ...prev, qualifications: list }));
            }}
          />
        );
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
          layout
          className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center relative mx-3 max-h-[90vh] overflow-y-auto transition-all duration-300"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
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
                {isEducator
                  ? "Complete Your Educator Profile"
                  : "Let's Complete Your Profile"}
              </h2>
              <p className="text-sm text-gray-700 text-center mb-6">
                {stepMessages[currentStep]}
              </p>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.div className="space-y-4">{renderStep()}</motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-between gap-4">
            {currentStep !== "welcome" ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
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
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
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
                Get started
                <div className="icon rounded-full">
                  <svg height="24" width="24" viewBox="0 0 24 24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      fill="currentColor"
                      d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                    />
                  </svg>
                </div>
              </button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
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
