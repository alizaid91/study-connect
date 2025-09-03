import { Viewer, Worker } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import type {
  ToolbarSlot,
  TransformToolbarSlot,
} from "@react-pdf-viewer/toolbar";
import { CgCloseO } from "react-icons/cg";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

import { motion } from "framer-motion";
import { clearShowPdf } from "../../store/slices/globalPopups";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { auth } from "../../config/firebase";
import { useEffect, useState } from "react";

const AI_URL = import.meta.env.VITE_AI_SERVICE_URL;

const SecurePdfViewer = () => {
  const { showPdf } = useSelector((state: RootState) => state.globalPopups);
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dispatch = useDispatch();

  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    DownloadMenuItem: () => <></>,
    Print: () => <></>,
    PrintMenuItem: () => <></>,
    Open: () => <></>,
    OpenMenuItem: () => <></>,
    FullScreen: () => <></>, // remove default fullscreen button
  });

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  useEffect(() => {
    const fetchHeaders = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      setHeaders({
        Authorization: `Bearer ${token}`,
        Range: "bytes=0-",
      });
    };
    fetchHeaders();
  }, []);

  if (!showPdf || !headers) return null;

  return (
    <motion.div
      className="fixed inset-0 w-full h-full flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          dispatch(clearShowPdf());
        }
      }}
    >
      <motion.div
        style={{
          height: isFullscreen ? "100%" : `${window.innerHeight - 26}px`,
          width: isFullscreen ? "100%" : "95%",
          borderRadius: isFullscreen ? 0 : "1.5rem",
        }}
        className={`pt-4 flex flex-col bg-white relative overflow-hidden`}
        variants={modalVariants}
      >
        {/* Top right actions */}
        <div className="absolute top-4 right-5 flex items-center gap-2 z-20">
          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="px-2 py-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? "🗗" : "⛶"}
          </button>

          {/* Close button */}
          <CgCloseO
            size={26}
            className="cursor-pointer"
            onClick={() => dispatch(clearShowPdf())}
          />
        </div>

        {showPdf.pdfId && headers && (
          <>
            {!isFullscreen && (
              <div className="pl-4 max-w-[230px] sm:max-w-[400px] md:max-w-[600px] flex justify-between items-center mb-4">
                <h2
                  className="text-lg font-semibold px-3 py-1 bg-gray-200/40 rounded-xl max-w-full truncate"
                  title={showPdf.title || "PDF Document"}
                >
                  {showPdf.title || "PDF Document"}
                </h2>
              </div>
            )}
            <div className="rpv-core__viewer flex flex-col flex-1 overflow-hidden">
              {!isFullscreen && (
                <div className="items-center flex border-b border-gray-300 bg-[#eeeeee]">
                  <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <Viewer
                    fileUrl={`${AI_URL}/view-pdf?key=${encodeURIComponent(
                      showPdf.pdfId
                    )}`}
                    httpHeaders={headers}
                    plugins={[toolbarPluginInstance]}
                    defaultScale={window.innerWidth < 768 ? 0.6 : 1.5}
                  />
                </Worker>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SecurePdfViewer;