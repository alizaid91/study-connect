import { Viewer, Worker } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import type { ToolbarSlot, TransformToolbarSlot } from "@react-pdf-viewer/toolbar";
import { CgCloseO } from "react-icons/cg";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

import { motion } from "framer-motion";
import { clearShowPdf } from "../../store/slices/globalPopups";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { auth } from "../../config/firebase";
import { useEffect, useState } from "react";
import { downloadService } from "../../services/downloadService";
import { getDownloadedKeys } from "../../hooks/useDownloadedKeys";

const AI_URL = import.meta.env.VITE_AI_SERVICE_URL;

const SecurePdfViewer = () => {
  const { profile } = useSelector((state: RootState) => state.auth);
  const { showPdf } = useSelector((state: RootState) => state.globalPopups);
  const [url, setUrl] = useState<string>("");
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const dispatch = useDispatch();

  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  // Remove unwanted default toolbar buttons
  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    DownloadMenuItem: () => <></>,
    Print: () => <></>,
    PrintMenuItem: () => <></>,
    Open: () => <></>,
    OpenMenuItem: () => <></>,
  });

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0.9, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 25 },
    },
  };

  useEffect(() => {
    if (!showPdf?.pdfId) return;

    const fetchHeaders = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      setHeaders({
        Authorization: `Bearer ${token}`,
        Range: "bytes=0-",
      });
    };

    const getUrl = async () => {
      const downloadedKeys = await getDownloadedKeys();
      if (profile?.role === "premium" && downloadedKeys.has(showPdf.pdfId as string)) {
        const resp = await downloadService.openDownloadedPdf(showPdf.pdfId as string);
        setUrl(resp.url);
      } else {
        await fetchHeaders();
        setUrl(`${AI_URL}/view-pdf?key=${encodeURIComponent(showPdf.pdfId as string)}`);
      }
    };

    getUrl();
  }, [showPdf]);

  if (!showPdf || !url) return null;

  return (
    <motion.div
      className="fixed inset-0 w-full h-full flex items-center justify-center bg-black/70 z-50 backdrop-blur-md"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="relative w-full h-full bg-white flex flex-col overflow-hidden"
        variants={modalVariants}
      >
        {/* 🔹 Top Toolbar */}
        <div className="absolute top-0 left-0 w-full flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-20 shadow-sm">
          <div className="flex items-center space-x-3 overflow-hidden">
            <button
              onClick={() => dispatch(clearShowPdf())}
              className="p-1.5 rounded-full hover:bg-gray-100 transition"
              title="Close"
            >
              <CgCloseO size={24} />
            </button>

            <h2
              className="text-base sm:text-lg font-medium text-gray-800 truncate max-w-[200px] sm:max-w-[300px]"
              title={showPdf.title || "PDF Document"}
            >
              {showPdf.title || "PDF Document"}
            </h2>
          </div>
        </div>

        {/* 🔹 PDF Content */}
        <div className="flex flex-col flex-1 mt-[62px] overflow-hidden">
          <div className="items-center flex border-b border-gray-200 bg-[#f8f8f8] px-2 sm:px-4">
            <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
          </div>

          <div className="flex-1 overflow-auto">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={url}
                httpHeaders={headers}
                plugins={[toolbarPluginInstance]}
                defaultScale={window.innerWidth < 768 ? 0.7 : 1.2}
              />
            </Worker>
          </div>
        </div>

        {/* 🔹 Bottom Shadow Overlay for Mobile */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};

export default SecurePdfViewer;