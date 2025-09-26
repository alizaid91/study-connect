import { setShowPdf } from "../../store/slices/globalPopups";
import { Bookmark, Resource } from "../../types/content";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Play } from "lucide-react";
import { FiCheckCircle, FiDownload } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import { useEffect, useState } from "react";
import { getDownloadedKeys } from "../../hooks/useDownloadedKeys";
import { RootState } from "../../store";

interface ViewCollectionPopupProps {
  onClose: () => void;
  resource?: Resource;
  bookmark?: Bookmark;
  downloadResource?: (resource: any, position?: number) => Promise<void>;
  downloading?: boolean;
  itemToDownload?: string;
}

const maxHeight = window.innerHeight - 26;

const ViewCollectionPopup = ({
  onClose,
  resource,
  bookmark,
  downloadResource,
  downloading,
  itemToDownload,
}: ViewCollectionPopupProps) => {
  const dispatch = useDispatch();
  const [downloadedKeys, setDownloadedKeys] = useState<Set<string>>(new Set());
  const {profile} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchDownloadedKeys = async () => {
      const keys = await getDownloadedKeys();
      setDownloadedKeys(keys);
    };
    fetchDownloadedKeys();
  }, []);

  const handleDownloadResource = async (
    resource: Resource,
    position: number
  ) => {
    if (downloadResource) {
      await downloadResource(resource, position);
      const keys = await getDownloadedKeys();
      setDownloadedKeys(keys);
    }
  };

  if (!downloadedKeys) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          style={{ maxHeight: `${maxHeight}px` }}
          initial={{ z: 40, opacity: 0, scale: 0.95 }}
          animate={{ z: 0, opacity: 1, scale: 1 }}
          exit={{ z: 40, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              {resource ? resource.title : bookmark?.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {(resource && resource.type === "video") ||
            bookmark?.resourceType === "video" ? (
              <div className="space-y-4">
                {(resource?.videos || bookmark?.videos)?.map((video, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Play className="text-blue-600 w-5 h-5" />
                      <span className="font-medium text-gray-800">
                        {video.title}
                      </span>
                    </div>
                    <button
                      onClick={() => window.open(video.url, "_blank")}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                    >
                      Play
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(resource?.files || bookmark?.files)?.map((file, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-600 w-5 h-5" />
                      <span className="font-medium text-gray-800">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex flex-row gap-3 text-center items-center">
                      <button
                        onClick={() =>
                          dispatch(
                            setShowPdf({
                              pdfId: file.resourceDOKey,
                              title: file.name,
                              totalPages: file.metadata.pages,
                            })
                          )
                        }
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                      >
                        View
                      </button>
                      {resource &&
                        (profile?.role === "premium" && downloadedKeys.has(file?.resourceDOKey as string) ? (
                          <button
                            disabled
                            className="flex items-center justify-center p-2 rounded-xl text-green-600 bg-green-50 cursor-default transition-all"
                            title="Downloaded"
                          >
                            <FiCheckCircle className="w-5 h-5" />
                          </button>
                        ) : downloading &&
                          itemToDownload === file?.resourceDOKey ? (
                          // Downloading Animation
                          <button
                            disabled
                            className="flex items-center justify-center p-2 rounded-xl text-blue-600 bg-blue-50"
                            title="Downloading..."
                          >
                            <ImSpinner2 className="w-5 h-5 animate-spin" />
                          </button>
                        ) : (
                          // Default Download Button
                          <button
                            onClick={() => {
                              !downloading && handleDownloadResource(resource, idx);
                            }}
                            disabled={downloading}
                            className="flex items-center justify-center p-2 rounded-xl text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 transition-colors"
                            title="Download"
                          >
                            <FiDownload className="w-5 h-5" />
                          </button>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewCollectionPopup;
