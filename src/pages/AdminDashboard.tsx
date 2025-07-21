import { useState, useEffect } from "react";
import AddPaperForm from "../components/admin/AddPaperForm";
import AddResourceForm from "../components/admin/AddResourceForm";
import { papersService } from "../services/papersService";
import { resourcesService } from "../services/resourcesService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/index";
import { setPapers } from "../store/slices/papersSlice";
import { setResources } from "../store/slices/resourceSlice";
import { adminService } from "../services/adminService";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";
import Loader1 from "../components/Loaders/Loader1";

type AdminSection = "papers" | "resources" | "dashboard";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [showAddForm, setShowAddForm] = useState(false);
  const dispatch = useDispatch();
  const { papers } = useSelector((state: RootState) => state.papers);
  const { resources } = useSelector((state: RootState) => state.resources);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch papers
      const papers = await papersService.getPapers();
      dispatch(setPapers(papers));

      // Fetch resources
      const resources = await resourcesService.getResources();
      dispatch(setResources(resources));
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaper = async (paperId: string) => {
    if (!window.confirm("Are you sure you want to delete this paper?")) {
      return;
    }

    setDeletingId(paperId);
    await adminService.deletePapaper(paperId, papers);
    setDeletingId(null);
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    setDeletingId(resourceId);
    await adminService.deleteResource(resourceId, resources);
    setDeletingId(null);
  };

  if (loading) {
    return <Loader1 />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "papers":
        return (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Manage Previous Year Papers
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-primary w-full sm:w-auto"
              >
                {showAddForm ? "Cancel" : "Add New Paper"}
              </button>
            </div>

            {showAddForm ? (
              <AddPaperForm
                onSuccess={() => {
                  setShowAddForm(false);
                  fetchData();
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pattern
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {papers.length > 0 ? (
                      papers.map((paper) => (
                        <tr key={paper.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paper.subjectName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paper.branch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paper.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paper.pattern}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paper.paperType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <a
                              href={paper.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleDeletePaper(paper.id)}
                              disabled={deletingId === paper.id}
                              className={`text-red-600 hover:text-red-900 ${
                                deletingId === paper.id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {deletingId === paper.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No papers added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "resources":
        return (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Manage Study Resources
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-primary w-full sm:w-auto"
              >
                {showAddForm ? "Cancel" : "Add New Resource"}
              </button>
            </div>

            {showAddForm ? (
              <AddResourceForm
                onSuccess={() => {
                  setShowAddForm(false);
                  fetchData();
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resources.length > 0 ? (
                      resources.map((resource) => (
                        <tr key={resource.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {resource.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {resource.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {resource.subjectName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {resource.branch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <a
                              href={resource.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              disabled={deletingId === resource.id}
                              className={`text-red-600 hover:text-red-900 ${
                                deletingId === resource.id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {deletingId === resource.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No resources added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "dashboard":
      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome to Admin Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Papers</h3>
                <p className="text-3xl font-bold text-primary-600">
                  {papers.length}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Total papers in the system
                </p>
              </div>
              <div className="bg-primary-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Resources</h3>
                <p className="text-3xl font-bold text-primary-600">
                  {resources.length}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Total resources in the system
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative flex h-screen bg-gray-100">
      {!isSidebarOpen && (
        <div
          className="absolute top-1/2 -translate-y-1/2 left-3 cursor-pointer bg-white rounded-full p-1 shadow-md flex justify-center items-center"
          onClick={() => setIsSidebarOpen(true)}
        >
          <RiArrowRightSLine size={26} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-64 bg-white shadow-md transition-all duration-300 md:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        }`}
      >
        <div className="p-4 border-b flex w-full justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="flex justify-center items-centre cursor-pointer bg-white rounded-full p-1 shadow-md"
          >
            <RiArrowLeftSLine size={26} />
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  setActiveSection("dashboard");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeSection === "dashboard"
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveSection("papers");
                  setIsSidebarOpen(window.innerWidth > 768);
                }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeSection === "papers"
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Papers
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveSection("resources");
                  setIsSidebarOpen(window.innerWidth > 768);
                }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeSection === "resources"
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Resources
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
