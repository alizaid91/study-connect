import { useNavigate } from "react-router-dom";
import {
  Books,
  Notes,
  Decodes,
  Videos,
  Other,
  uploadResource,
} from "../assets/resources-svg";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { resourcesService } from "../services/resourcesService";
import { RootState } from "../store";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import ResourceFilter from "../components/Study-Resources/ResourceFilter";
import { FcFilledFilter } from "react-icons/fc";
import {
  resetResourceFilters,
  updateResourceFilterField,
} from "../store/slices/filtersSlice";
import {
  addBookmark,
  fetchBookmarks,
  removeBookmark,
} from "../store/slices/bookmarkSlice";
import { Bookmark, Resource } from "../types/content";
import { IoArrowBackSharp } from "react-icons/io5";
import { setLoading, setResources } from "../store/slices/resourceSlice";
import Loader1 from "../components/Loaders/Loader1";
import NoStudyResources from "../components/Study-Resources/NoStudyResource";
import SearchBar from "../components/Study-Resources/SearchBar";
import { FiBookmark } from "react-icons/fi";
import { setShowPdf } from "../store/slices/globalPopups";
import UploadResourcePopup from "../components/Study-Resources/UploadResourcePopup";
import UploaderInfo from "../components/Study-Resources/UploaderInfo";
import { getSubjects } from "../types/Subjects";
import ViewCollectionPopup from "../components/Study-Resources/ViewCollectionPopup";

const resourcesCards = [
  {
    title: "Books",
    description: "Find textbooks, reference books, and suggested readings.",
    icon: Books,
    backgroundImage: "/images/resources/books.jpg",
    link: "/resources/books",
  },
  {
    title: "Notes",
    description: "Access student and teacher handwritten notes.",
    icon: Notes,
    backgroundImage: "/images/resources/notes.jpg",
    link: "/resources/notes",
  },
  {
    title: "Decodes",
    description: "Get decode resources with simplified concepts.",
    icon: Decodes,
    link: "/resources/decodes",
  },
  {
    title: "Videos",
    description: "Watch curated lectures and concept explanation videos.",
    icon: Videos,
    link: "/resources/videos",
  },
  {
    title: "Other",
    description: "Explore assignments, journals, and additional materials.",
    icon: Other,
    link: "/resources/other",
  },
];

const ResourcesMain = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, profile } = useSelector((state: RootState) => state.auth);
  const { resourceFilters } = useSelector((state: RootState) => state.filters);
  const { resources, loading } = useSelector(
    (state: RootState) => state.resources
  );
  const { bookmarks } = useSelector((state: RootState) => state.bookmarks);

  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [changingBookmarkState, setChangingBookmarkState] = useState(false);
  const [itemToChangeBookmarkState, setItemToChangeBookmarkState] =
    useState<string>("");
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState<{
    open: boolean;
    resource: Resource | null;
  }>({
    open: false,
    resource: null,
  });

  useEffect(() => {
    if (showUploadPopup || showCollectionModal.open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showUploadPopup, showCollectionModal.open]);

  // refetch logic extracted for reuse
  const fetchResourcesList = useCallback(async () => {
    if (!user?.uid) return;
    dispatch(setLoading(true));
    try {
      const resources = await resourcesService.getResources();
      dispatch(setResources(resources));
      dispatch(fetchBookmarks(user.uid));
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user?.uid]);

  useEffect(() => {
    fetchResourcesList();
  }, [fetchResourcesList]);

  useEffect(() => {
    if (!resources || resources.length === 0) return;
    const filterResources = async () => {
      const filteredResources = resourcesService.filterResources(
        resources,
        resourceFilters
      );
      setFilteredResources(filteredResources);
    };

    filterResources();
  }, [resources, resourceFilters]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [resourceFilters.type]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
    }),
  };

  const getType = (item: (typeof resourcesCards)[number]) => {
    const title = item.title.toLowerCase();
    if (title.includes("book")) return "book";
    if (title.includes("note")) return "notes";
    if (title.includes("decode")) return "decodes";
    if (title.includes("video")) return "video";
    return "other";
  };

  const getTitle = (item: (typeof resourceFilters)["type"]) => {
    if (item === "book") return "Books";
    if (item === "notes") return "Notes";
    if (item === "decodes") return "Decodes";
    if (item === "video") return "Videos";
    return "Other";
  };

  const getResourceTypeIcon = (type: (typeof resourceFilters)["type"]) => {
    const typeLC = type.toLowerCase();
    if (typeLC === "book") return Books;
    if (typeLC === "notes") return Notes;
    if (typeLC === "video") return Videos;
    if (typeLC === "decodes") return Decodes;
    return Other;
  };

  const handleBookmark = async (resource: Resource) => {
    if (!user) return;
    console.log(bookmarks);

    const existingBookmark = bookmarks.find(
      (bookmark: Bookmark) =>
        bookmark.contentId === resource.id && bookmark.type === "Resource"
    );

    setItemToChangeBookmarkState(resource.id);
    setChangingBookmarkState(true);

    if (existingBookmark) {
      // Remove bookmark if it already exists
      await dispatch(removeBookmark(existingBookmark.id));
    } else {
      // Add new bookmark
      await dispatch(
        addBookmark({
          userId: user.uid,
          contentId: resource.id,
          type: "Resource",
          paperType: null,
          resourceType: resource.type,
          subType: resource.subtype,

          title: resource.title,
          name: resource.title,
          description: `${resource.branch} - ${resource.year} ${resource.pattern}`,

          // For collections
          ...(resource.files && { files: resource.files }),
          ...(resource.videos && { videos: resource.videos }),

          createdAt: new Date().toISOString(),
        })
      );
    }

    setChangingBookmarkState(false);
  };

  const isBookmarked = (resourceId: string) => {
    return bookmarks.some(
      (bookmark: Bookmark) =>
        bookmark.contentId === resourceId && bookmark.type === "Resource"
    );
  };

  if (loading && !resources.length) {
    return <Loader1 />;
  }

  return (
    <>
      {showUploadPopup && (
        <UploadResourcePopup
          onClose={() => setShowUploadPopup(false)}
          onUploaded={() => {
            fetchResourcesList();
          }}
        />
      )}
      {showCollectionModal.open && showCollectionModal.resource && (
        <ViewCollectionPopup
          onClose={() =>
            setShowCollectionModal({ open: false, resource: null })
          }
          resource={showCollectionModal.resource}
        />
      )}
      {!resourceFilters.type ? (
        <div className="min-h-screen bg-background p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Explore Study Resources
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {resourcesCards.map((item, index) => {
              return (
                <motion.div
                  key={index}
                  onClick={() => {
                    dispatch(
                      updateResourceFilterField({
                        field: "type",
                        value: getType(item),
                      })
                    );
                  }}
                  className="cursor-pointer bg-card rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center border hover:border-primary transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-20 h-20 mb-4 flex items-center justify-center border border-gray-300/40 rounded-full bg-gray-200/60">
                    <img
                      src={item.icon}
                      className="h-full w-full text-primary object-cover p-3"
                    />
                  </div>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-muted-foreground text-sm mt-2">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
            {profile?.accountType === "educator" && (
              <motion.div
                onClick={() => setShowUploadPopup(true)}
                className="cursor-pointer bg-card rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center border hover:border-primary transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-24 h-24 mb-4 flex items-center justify-center border border-gray-300/40 rounded-full bg-gray-200/60">
                  <img
                    src={uploadResource}
                    className="h-full w-full text-primary object-cover scale-150"
                  />
                </div>
                <h2 className="text-xl font-semibold">Upload Resource</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Upload your study materials here.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative w-full px-2">
          <div className="border border-gray-300/90 flex items-center justify-between px-6 py-2 gap-3 w-full bg-gray-100 mt-4 mb-2 rounded-3xl">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <div className="group relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      dispatch(
                        updateResourceFilterField({ field: "type", value: "" })
                      );
                      dispatch(resetResourceFilters());
                      navigate("/resources");
                    }}
                    className="flex items-center justify-center bg-gray-200/60 hover:bg-gray-200 p-2 rounded-md text-gray-800 hover:text-blue-600 transition-colors duration-200"
                    aria-label="Back to boards overview"
                  >
                    <IoArrowBackSharp size={20} />
                  </motion.button>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center lg:mb-0.5">
                {getTitle(resourceFilters.type)}
              </h1>
            </div>
            <div
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="flex lg:hidden items-center gap-2 bg-gray-200/60 text-blue-700 font-semibold px-3 py-1.5 rounded-xl transition-colors duration-300"
            >
              <span className="text-lg">Filters</span>
              <div className="flex items-center justify-center w-8 h-8 text-blue-500 bg-blue-200/70 rounded-full p-1">
                <FcFilledFilter size={20} />
              </div>
            </div>
            <SearchBar classes="hidden lg:block w-[300px]" />
          </div>
          <SearchBar classes="lg:hidden px-2 pb-2" />
          <div className="flex lg:flex-row gap-3 min-h-[600px]">
            <ResourceFilter
              isFilterExpanded={isFilterExpanded}
              setIsFilterExpanded={setIsFilterExpanded}
            />
            <div
              className={`relative w-full max-h-screen border border-gray-300/90 ${
                filteredResources.length !== 0
                  ? "overflow-y-scroll scroll-smooth will-change-transform"
                  : "overflow-y-hidden"
              } rounded-3xl`}
            >
              {/* Sticky Filter Bar */}
              <div className="rounded-t-3xl backdrop-blur-md sticky top-0 left-0 w-full py-3 bg-black/10 flex flex-nowrap overflow-x-auto gap-3 px-4 shadow-sm z-10">
                {/* Active Branch Chip */}
                <AnimatePresence>
                  {resourceFilters.branch !== "" && (
                    <motion.div
                      key={resourceFilters.branch}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        dispatch(
                          updateResourceFilterField({
                            field: "year",
                            value: "",
                          })
                        );
                        dispatch(
                          updateResourceFilterField({
                            field: "branch",
                            value: "",
                          })
                        );
                        dispatch(
                          updateResourceFilterField({
                            field: "semester",
                            value: "",
                          })
                        );
                        dispatch(
                          updateResourceFilterField({
                            field: "subjectName",
                            value: "",
                          })
                        );
                      }}
                      className="cursor-pointer bg-blue-500 text-white shadow-md rounded-3xl px-6 py-2 font-medium"
                    >
                      {resourceFilters.branch}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Branch/Year Chips */}
                {resourceFilters.branch !== "FE" && (
                  <div className="flex gap-3 pl-4 flex-nowrap flex-shrink-0">
                    {!resourceFilters.branch
                      ? ["FE", "CS", "IT"].map((branch) => (
                          <motion.div
                            key={branch}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 1 }}
                            onClick={() => {
                              dispatch(
                                updateResourceFilterField({
                                  field: "branch",
                                  value: branch,
                                })
                              );
                            }}
                            className="cursor-pointer bg-white shadow-md rounded-3xl px-6 py-2 font-medium"
                          >
                            {branch}
                          </motion.div>
                        ))
                      : resourceFilters.branch !== "FE"
                      ? ["SE", "TE", "BE"].map((year) => (
                          <motion.div
                            key={year}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 1 }}
                            onClick={() => {
                              dispatch(
                                updateResourceFilterField({
                                  field: "year",
                                  value:
                                    resourceFilters.year === year ? "" : year,
                                })
                              );
                              dispatch(
                                updateResourceFilterField({
                                  field: "semester",
                                  value: "",
                                })
                              );
                              dispatch(
                                updateResourceFilterField({
                                  field: "subjectName",
                                  value: "",
                                })
                              );
                            }}
                            className={`cursor-pointer ${
                              resourceFilters.year === year
                                ? "bg-blue-500 text-white"
                                : "bg-white"
                            } shadow-md rounded-3xl px-6 py-2 font-medium`}
                          >
                            {year}
                          </motion.div>
                        ))
                      : null}
                  </div>
                )}

                {/* Semester Chips */}
                {resourceFilters.branch !== "FE" && resourceFilters.year && (
                  <div className="flex gap-3 pl-4 flex-nowrap flex-shrink-0">
                    {(resourceFilters.year === "SE"
                      ? ["3", "4"]
                      : resourceFilters.year === "TE"
                      ? ["5", "6"]
                      : resourceFilters.year === "BE"
                      ? ["7", "8"]
                      : []
                    ).map((sem) => (
                      <motion.div
                        key={sem}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        onClick={() => {
                          dispatch(
                            updateResourceFilterField({
                              field: "semester",
                              value:
                                resourceFilters.semester === sem ? "" : sem,
                            })
                          );
                          dispatch(
                            updateResourceFilterField({
                              field: "subjectName",
                              value: "",
                            })
                          );
                        }}
                        className={`cursor-pointer ${
                          resourceFilters.semester === sem
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        } shadow-md rounded-3xl px-6 py-2 font-medium`}
                      >
                        Sem {sem}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Subject Chips */}
                {resourceFilters.branch &&
                  (resourceFilters.branch === "FE" ||
                    (resourceFilters.year && resourceFilters.semester)) && (
                    <div className="flex gap-3 pl-4 flex-nowrap flex-shrink-0">
                      {getSubjects(
                        resourceFilters.branch,
                        resourceFilters.branch === "FE"
                          ? 0
                          : Number(resourceFilters.semester),
                        resourceFilters.branch === "FE"
                          ? "2024Pattern"
                          : "2019Pattern",
                        resourceFilters.branch === "FE"
                          ? undefined
                          : resourceFilters.year
                      ).map((subject) => (
                        <motion.div
                          key={subject.code}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 1 }}
                          onClick={() =>
                            dispatch(
                              updateResourceFilterField({
                                field: "subjectName",
                                value:
                                  resourceFilters.subjectName === subject.name
                                    ? ""
                                    : subject.name,
                              })
                            )
                          }
                          className={`cursor-pointer ${
                            resourceFilters.subjectName === subject.name
                              ? "bg-blue-500 text-white"
                              : "bg-white"
                          } shadow-md rounded-3xl px-6 py-2 font-medium`}
                        >
                          {subject.code}
                        </motion.div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Resource Cards */}
              {filteredResources.length > 0 ? (
                <div className="px-4 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-4 pb-6">
                  {filteredResources
                    .filter((r) => r && r.type === resourceFilters.type)
                    .map((resource, i) => {
                      const isCollection = resource.subtype === "collection";
                      const firstFile = resource.files?.[0];
                      const sizeMB = firstFile
                        ? (firstFile.metadata.size / (1024 * 1024)).toFixed(2)
                        : 0;
                      const pages = firstFile?.metadata.pages || 0;

                      // Action button text
                      let actionText = "View";
                      if (
                        resource.type === "video" &&
                        resource.subtype === "single"
                      )
                        actionText = "Play";
                      else if (
                        resource.type === "video" &&
                        resource.subtype === "collection"
                      )
                        actionText = "View All";
                      else if (
                        ["book", "notes", "decodes", "other"].includes(
                          resource.type
                        ) &&
                        resource.subtype === "collection"
                      )
                        actionText = "View All";

                      return (
                        <motion.div
                          key={resource.id}
                          initial="hidden"
                          animate="visible"
                          custom={i}
                          variants={cardVariants}
                          className="bg-white/90 shadow-lg rounded-3xl border border-gray-300 group relative mt-4"
                        >
                          {/* Deck-style strips at top */}
                          {isCollection && (
                            <div className="absolute -top-4 left-0 right-0 flex flex-col items-center -z-10">
                              <div className="w-[85%] h-2 bg-gray-200 rounded-t-3xl mb-[1px]"></div>
                              <div className="w-[90%] h-2 bg-gray-300 rounded-t-3xl mb-[1px]"></div>
                            </div>
                          )}

                          <div className="p-5 flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-gray-300/40 rounded-full bg-gray-200/60">
                                <img
                                  src={getResourceTypeIcon(resource.type)}
                                  className="h-full w-full text-primary object-cover p-1"
                                />
                              </div>
                              <h2 className="text-lg font-bold">
                                {resource.title}
                              </h2>
                            </div>

                            {/* Meta */}
                            <div className="text-sm text-gray-900 space-y-1 flex-1">
                              <p>
                                <strong>Subject:</strong> {resource.subjectName}{" "}
                                ({resource.subjectCode})
                              </p>
                              <div className="grid gap-1 grid-cols-2">
                                <p>
                                  <strong>Branch:</strong> {resource.branch}
                                </p>
                                <p>
                                  <strong>Year:</strong> {resource.year}
                                </p>
                                <p>
                                  <strong>Semester:</strong> {resource.semester}
                                </p>
                                <p>
                                  <strong>Pattern:</strong> {resource.pattern}
                                </p>
                                {resource.type !== "video" && !isCollection && (
                                  <>
                                    <p>
                                      <strong>Size:</strong> {sizeMB} MB
                                    </p>
                                    <p>
                                      <strong>Pages:</strong> {pages}
                                    </p>
                                  </>
                                )}
                                {isCollection &&
                                  (resource.type === "video" ? (
                                    <p>
                                      <strong>Videos:</strong>{" "}
                                      {resource.videos?.length || 0}
                                    </p>
                                  ) : (
                                    <p>
                                      <strong>Files:</strong>{" "}
                                      {resource.files?.length || 0}
                                    </p>
                                  ))}
                              </div>
                              <div className="flex items-center gap-1">
                                <strong>Uploaded By:</strong>
                                <UploaderInfo username={resource.uploadedBy} />
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex items-center justify-between">
                              <button
                                onClick={() => {
                                  if (resource.subtype === "single") {
                                    if (resource.type === "video") {
                                      // Play single video
                                      window.open(
                                        resource.videos?.[0]?.url,
                                        "_blank"
                                      );
                                    } else {
                                      // View single file
                                      dispatch(
                                        setShowPdf({
                                          pdfId:
                                            firstFile?.resourceDOKey as string,
                                          title: resource.title,
                                          totalPages: pages,
                                        })
                                      );
                                    }
                                  } else {
                                    setShowCollectionModal({
                                      open: true,
                                      resource,
                                    });
                                  }
                                }}
                                className="px-6 py-1 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
                              >
                                {actionText}
                              </button>

                              {changingBookmarkState &&
                              resource.id === itemToChangeBookmarkState ? (
                                <div
                                  role="status"
                                  className="inline-flex items-center justify-center p-2"
                                >
                                  <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                                  <span className="sr-only">Changing...</span>
                                </div>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.8 }}
                                  onClick={
                                    !user
                                      ? () => navigate("/auth#login")
                                      : () => handleBookmark(resource)
                                  }
                                  className={`rounded-full p-2 ${
                                    isBookmarked(resource.id)
                                      ? "text-yellow-500 bg-yellow-100"
                                      : "text-gray-400 bg-gray-100"
                                  } transition-all duration-200 mb-1 md:mb-0`}
                                >
                                  <FiBookmark
                                    className={`w-5 h-5 ${
                                      isBookmarked(resource.id)
                                        ? "fill-current"
                                        : ""
                                    }`}
                                  />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              ) : (
                <div className="px-4 flex items-center justify-center w-full h-full">
                  <NoStudyResources />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResourcesMain;
