import { useNavigate } from "react-router-dom";
import { Books, Notes, Decodes, Videos, Other } from "../assets/resources-svg";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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

  const { user } = useSelector((state: RootState) => state.auth);
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

  useEffect(() => {
    const fetchResources = async () => {
      dispatch(setLoading(true));
      try {
        const resources = await resourcesService.getResources();
        dispatch(setResources(resources));
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchResources();
    if (!user?.uid) return;
    dispatch(fetchBookmarks(user?.uid));
  }, []);

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
      transition: { delay: i * 0.1 },
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

    const existingBookmark = bookmarks.find(
      (bookmark: Bookmark) =>
        bookmark.contentId === resource.id && bookmark.type === "Resource"
    );
    setItemToChangeBookmarkState(resource.id);
    setChangingBookmarkState(true);
    if (existingBookmark) {
      await dispatch(removeBookmark(existingBookmark.id));
    } else {
      await dispatch(
        addBookmark({
          userId: user.uid,
          contentId: resource.id,
          type: "Resource",
          title: resource.title,
          name: resource.title,
          paperType: null,
          resourceType: resource.type,
          description: `${resource.branch} - ${resource.year} ${resource.pattern}`,
          resourceId: resource.resourceId,
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

  return !resourceFilters.type ? (
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
        <div className="w-full max-h-screen border border-gray-300/90 overflow-y-auto rounded-3xl px-2">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-4 pb-6">
              {filteredResources
                .filter((resource) => resource.type === resourceFilters.type)
                .map((resource, i) => (
                  <motion.div
                    key={resource.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="bg-white/90 shadow-sm rounded-3xl overflow-hidden border border-gray-300 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4 ">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-gray-300/40 rounded-full bg-gray-200/60">
                          <img
                            src={getResourceTypeIcon(resource.type)}
                            className="h-full w-full text-primary object-cover p-1"
                          />
                        </div>
                        <h2 className="text-lg font-bold">{resource.title}</h2>
                      </div>

                      <div className="text-sm text-gray-900 space-y-1 flex-1">
                        <p>
                          <strong>Subject:</strong> {resource.subjectName} (
                          {resource.subjectCode})
                        </p>
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
                        <p>
                          <strong>Uploaded By:</strong> {resource.uploadedBy}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <button
                          onClick={() =>
                            dispatch(
                              setShowPdf({
                                pdfId: resource.resourceId,
                                title: resource.title,
                              })
                            )
                          }
                          className="px-6 py-1 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
                        >
                          View
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
                                isBookmarked(resource.id) ? "fill-current" : ""
                              }`}
                            />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <NoStudyResources />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesMain;
