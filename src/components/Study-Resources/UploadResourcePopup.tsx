import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoCloudUploadOutline } from "react-icons/io5";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { getSubjects } from "../../types/Subjects";
import { Resource } from "../../types/content";
import { apiService } from "../../services/apiService";

interface Props {
  onClose: () => void;
  onUploaded: () => void;
}

type ResourceType = Resource["type"];
const resourceTypes: ResourceType[] = [
  "book",
  "notes",
  "video",
  "decodes",
  "other",
];
const branches: Resource["branch"][] = [
  "FE",
  "CS",
  "IT",
  "Civil",
  "Mechanical",
];
const patterns: Array<"2019" | "2024"> = ["2019", "2024"];
const years: Array<"SE" | "TE" | "BE"> = ["SE", "TE", "BE"];

const baseInput =
  "w-full rounded-xl border-0 bg-gray-50 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200";
const labelCls = "text-sm font-medium text-gray-700 mb-2";
const errorCls =
  "text-xs text-red-500 mt-2 flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg";
const maxHeight = window.innerHeight - 26;

const UploadResourcePopup = ({ onClose, onUploaded }: Props) => {
  const { profile } = useSelector((s: RootState) => s.auth);
  const [file, setFile] = useState<File | null>(null);

  const [type, setType] = useState<ResourceType>("notes");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [branch, setBranch] = useState<Resource["branch"]>(
    profile?.branch || "FE"
  );
  const [pattern, setPattern] = useState<"2019" | "2024">(
    (profile?.pattern ? String(profile.pattern) : "2024") as "2019" | "2024"
  );
  const [year, setYear] = useState<Resource["year"]>(
    branch === "FE" ? "" : (profile?.year as Resource["year"]) || ""
  );
  const [semester, setSemester] = useState<number>(
    profile?.semester && branch === profile.branch ? profile.semester : 1
  );
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");

  const [subjects, setSubjects] = useState<{ name: string; code: string }[]>(
    []
  );
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  // ESC close
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  // Outside click
  useEffect(() => {
    const handler = () => {
      if (dropRef.current && !dropRef.current.closest(".upload-modal-panel"))
        return;
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  // Load subjects when dependencies change
  const loadSubjects = useCallback(() => {
    setSubjects([]);
    setSubjectCode("");
    setSubjectName("");
    if (!branch || !pattern || !semester) return;
    if (branch !== "FE" && !year) return;
    setLoadingSubjects(true);
    try {
      const patternKey = (
        pattern === "2019" ? "2019Pattern" : "2024Pattern"
      ) as any;
      const list = getSubjects(
        branch as any,
        semester,
        patternKey,
        branch === "FE" ? "" : year
      );
      setSubjects(list);
    } catch {
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }, [branch, pattern, semester, year]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // Semester options
  const semesterOptions = (() => {
    if (branch === "FE") return [1, 2];
    if (year === "SE") return [3, 4];
    if (year === "TE") return [5, 6];
    if (year === "BE") return [7, 8];
    return [];
  })();

  // Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title required";
    if (!type) e.type = "Type required";
    if (!branch) e.branch = "Branch required";
    if (!pattern) e.pattern = "Pattern required";
    if (!semester || semester < 1 || semester > 8) e.semester = "Semester 1-8";
    if (branch !== "FE" && !year) e.year = "Year required";
    if (!subjectCode) e.subject = "Select subject";
    if (!file) e.file = "PDF required";
    if (file && file.type !== "application/pdf") e.file = "Only PDF allowed";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubjectSelect = (code: string) => {
    const subj = subjects.find((s) => s.code === code);
    if (subj) {
      setSubjectCode(subj.code);
      setSubjectName(subj.name);
    } else {
      setSubjectCode("");
      setSubjectName("");
    }
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setErrors((p) => ({ ...p, file: "Only PDF file is allowed" }));
      return;
    }
    setErrors((p) => ({ ...p, file: "" }));
    setFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const simulateProgress = () => {
    setProgress(0);
    let val = 0;
    const id = setInterval(() => {
      val += Math.random() * 18;
      if (val >= 95) {
        clearInterval(id);
      } else {
        setProgress(Math.min(95, Math.floor(val)));
      }
    }, 180);
    return () => clearInterval(id);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;
    if (!profile) return;

    setSubmitting(true);
    const stop = simulateProgress();

    try {
      if (!file) throw new Error("No file selected");

      // 1. Request signed URL from backend
      const { uploadUrl, resourceKey } = await apiService.getUploadUrl(
        file.name,
        file.type
      );
      if (!uploadUrl || !resourceKey)
        throw new Error("Could not get upload URL");

      // 2. Upload file directly to DO Spaces
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // 3. Save resource metadata in Firestore via backend
      const metadata = {
        title: title.trim(),
        description: description.trim() || "",
        type,
        subjectCode,
        subjectName,
        branch,
        year: branch === "FE" ? "" : year,
        semester: String(semester),
        pattern,
        uploadedBy: profile.username,
        resourceKey,
        size: file.size,
        mimeType: file.type,
      };

      await apiService.saveResource(metadata);

      setProgress(100);
      setSuccessMsg("Resource uploaded successfully");
      setTimeout(() => {
        onUploaded();
        onClose();
      }, 900);
    } catch (err: any) {
      stop();
      setSubmitting(false);
      setProgress(0);
      setErrors((p) => ({
        ...p,
        submit: err.message || "Upload failed",
      }));
    }
  };

  const progressStyle = useMemo(
    () => ({
      width: `${progress}%`,
      transition: "width .25s ease",
    }),
    [progress]
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          style={{ height: `${maxHeight}px` }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border-0 flex flex-col overflow-hidden will-change-transform"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
        >
          {/* HEADER - Fixed */}
          <div className="flex-shrink-0 flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Resource
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Share study materials with your community
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
            >
              <IoClose size={20} />
            </button>
          </div>

          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-6"
            style={{
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "thin",
              scrollbarColor: "#CBD5E0 transparent",
            }}
          >
            <form
              onSubmit={onSubmit}
              className="grid gap-8 lg:grid-cols-12"
            >
              {/* LEFT SECTION - File Upload & Basic Info */}
              <div className="lg:col-span-5 space-y-6">
                {/* File Upload Card */}
                <motion.div
                  className="bg-gray-50 rounded-2xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className={labelCls}>Upload PDF File</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className={`group mt-2 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                      file
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                    onClick={() =>
                      document.getElementById("fileInput")?.click()
                    }
                    ref={dropRef}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    <IoCloudUploadOutline
                      size={48}
                      className={`mb-4 transition-colors duration-300 ${
                        file
                          ? "text-green-500"
                          : "text-blue-500 group-hover:text-blue-600"
                      }`}
                    />
                    {!file ? (
                      <>
                        <p className="text-base font-medium text-gray-700 mb-1">
                          Drop your PDF here
                        </p>
                        <p className="text-sm text-gray-500">
                          or click to browse
                        </p>
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="font-medium text-gray-800 mb-1 truncate max-w-[140px]">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.file && (
                    <div className={errorCls}>
                      <FiAlertCircle size={16} /> {errors.file}
                    </div>
                  )}
                </motion.div>

                {/* Basic Info Card */}
                <motion.div
                  className="bg-gray-50 rounded-2xl p-6 space-y-5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div>
                    <label className={labelCls}>Resource Type</label>
                    <select
                      className={baseInput}
                      value={type}
                      onChange={(e) => setType(e.target.value as ResourceType)}
                    >
                      {resourceTypes.map((rt) => (
                        <option key={rt} value={rt}>
                          {rt.charAt(0).toUpperCase() + rt.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <div className={errorCls}>
                        <FiAlertCircle size={16} /> {errors.type}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>Title</label>
                    <input
                      className={baseInput}
                      value={title}
                      maxLength={120}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a clear, descriptive title"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>
                        {errors.title && (
                          <span className="text-red-500 font-medium">
                            {errors.title}
                          </span>
                        )}
                      </span>
                      <span>{title.length}/120</span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Description (Optional)</label>
                    <textarea
                      className={`${baseInput} resize-none h-24`}
                      value={description}
                      maxLength={400}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a helpful description to make your resource easier to find..."
                    />
                    <div className="flex justify-end text-xs text-gray-400 mt-2">
                      {description.length}/400
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT SECTION - Academic Details */}
              <div className="lg:col-span-7">
                <motion.div
                  className="bg-gray-50 rounded-2xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Branch</label>
                      <select
                        className={baseInput}
                        value={branch}
                        onChange={(e) => {
                          const b = e.target.value as typeof branch;
                          setBranch(b);
                          if (b === "FE") {
                            setYear("");
                            setSemester(1);
                          }
                        }}
                      >
                        {branches.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                      {errors.branch && (
                        <div className={errorCls}>
                          <FiAlertCircle size={16} /> {errors.branch}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Pattern</label>
                      <select
                        className={baseInput}
                        value={pattern}
                        onChange={(e) =>
                          setPattern(e.target.value as "2019" | "2024")
                        }
                      >
                        {patterns.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      {errors.pattern && (
                        <div className={errorCls}>
                          <FiAlertCircle size={16} /> {errors.pattern}
                        </div>
                      )}
                    </div>

                    {branch !== "FE" && (
                      <div>
                        <label className={labelCls}>Year</label>
                        <select
                          className={baseInput}
                          value={year}
                          onChange={(e) =>
                            setYear(e.target.value as typeof year)
                          }
                        >
                          <option value="">Select Year</option>
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                        {errors.year && (
                          <div className={errorCls}>
                            <FiAlertCircle size={16} /> {errors.year}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className={labelCls}>Semester</label>
                      <select
                        className={baseInput}
                        value={semester}
                        onChange={(e) => setSemester(parseInt(e.target.value))}
                      >
                        <option value="">Select Semester</option>
                        {semesterOptions.map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                      {errors.semester && (
                        <div className={errorCls}>
                          <FiAlertCircle size={16} /> {errors.semester}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelCls}>Subject</label>
                      <div className="flex gap-3">
                        <select
                          disabled={loadingSubjects || subjects.length === 0}
                          className={`${baseInput} flex-1 disabled:opacity-60`}
                          value={subjectCode}
                          onChange={(e) => onSubjectSelect(e.target.value)}
                        >
                          <option value="">
                            {loadingSubjects
                              ? "Loading subjects..."
                              : subjects.length
                              ? "Select subject"
                              : "No subjects available"}
                          </option>
                          {subjects.map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.name} ({s.code})
                            </option>
                          ))}
                        </select>
                        {subjectCode && (
                          <span className="hidden sm:inline-flex items-center px-3 py-2 rounded-xl bg-blue-100 text-blue-700 text-sm font-medium whitespace-nowrap">
                            {subjectCode}
                          </span>
                        )}
                      </div>
                      {errors.subject && (
                        <div className={errorCls}>
                          <FiAlertCircle size={16} /> {errors.subject}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Messages - Fixed positioning to avoid scroll jank */}
                  <AnimatePresence mode="wait">
                    {(errors.submit || successMsg || submitting) && (
                      <motion.div
                        className="mt-6 space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {errors.submit && (
                          <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                            <FiAlertCircle
                              size={18}
                              className="flex-shrink-0"
                            />
                            <span>{errors.submit}</span>
                          </div>
                        )}
                        {successMsg && (
                          <div className="flex items-center gap-3 text-sm text-green-600 bg-green-50 border border-green-100 px-4 py-3 rounded-xl">
                            <FiCheckCircle
                              size={18}
                              className="flex-shrink-0"
                            />
                            <span>{successMsg}</span>
                          </div>
                        )}
                        {submitting && (
                          <div>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Uploading resource...</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                style={progressStyle}
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons - Fixed */}
                  <motion.div
                    className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={onClose}
                      className="flex-1 py-3 px-6 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {submitting ? "Uploading..." : "Upload Resource"}
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadResourcePopup;
