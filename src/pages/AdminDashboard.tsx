import { useState, useEffect } from 'react';
import AddPaperForm from '../components/admin/AddPaperForm';
import AddResourceForm from '../components/admin/AddResourceForm';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Paper, Resource } from '../types/content';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'papers' | 'resources'>('papers');
  const [showAddForm, setShowAddForm] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch papers
      const papersRef = collection(db, 'papers');
      const papersQuery = query(papersRef, orderBy('uploadedAt', 'desc'));
      const papersSnapshot = await getDocs(papersQuery);
      const papersData = papersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Paper[];
      setPapers(papersData);

      // Fetch resources
      const resourcesRef = collection(db, 'resources');
      const resourcesQuery = query(resourcesRef, orderBy('uploadedAt', 'desc'));
      const resourcesSnapshot = await getDocs(resourcesQuery);
      const resourcesData = resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];
      setResources(resourcesData);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaper = async (paperId: string) => {
    if (!window.confirm('Are you sure you want to delete this paper?')) {
      return;
    }

    try {
      setDeletingId(paperId);
      await deleteDoc(doc(db, 'papers', paperId));
      setPapers(papers.filter(paper => paper.id !== paperId));
    } catch (err) {
      setError('Failed to delete paper');
      console.error('Error deleting paper:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      setDeletingId(resourceId);
      await deleteDoc(doc(db, 'resources', resourceId));
      setResources(resources.filter(resource => resource.id !== resourceId));
    } catch (err) {
      setError('Failed to delete resource');
      console.error('Error deleting resource:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // useEffect(() => {
  //   const colRef = collection(db, 'papers');

  //   const updateAllDocs = async () => {
  //     const snapshot = await getDocs(colRef);

  //     snapshot.forEach(async (docSnap) => {
  //       await updateDoc(doc(db, "papers", docSnap.id), {
  //         semester: 4,
  //       });
  //     });
  //   };
  //   updateAllDocs()
  // }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
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

  return (
    <div className="container px-4 py-8 mx-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('papers')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm sm:text-base ${activeTab === 'papers'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          >
            Manage Papers
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm sm:text-base ${activeTab === 'resources'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          >
            Manage Resources
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">
            {activeTab === 'papers' ? 'Manage Previous Year Papers' : 'Manage Study Resources'}
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary w-full sm:w-auto"
          >
            {showAddForm ? 'Cancel' : `Add New ${activeTab === 'papers' ? 'Paper' : 'Resource'}`}
          </button>
        </div>

        {showAddForm ? (
          activeTab === 'papers' ? (
            <AddPaperForm onSuccess={() => {
              setShowAddForm(false);
              fetchData();
            }} />
          ) : (
            <AddResourceForm onSuccess={() => {
              setShowAddForm(false);
              fetchData();
            }} />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'papers' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pattern</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'papers' ? (
                  papers.length > 0 ? (
                    papers.map((paper) => (
                      <tr key={paper.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paper.subjectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paper.branch}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paper.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paper.pattern}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paper.paperType}</td>
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
                            className={`text-red-600 hover:text-red-900 ${deletingId === paper.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {deletingId === paper.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No papers added yet.
                      </td>
                    </tr>
                  )
                ) : (
                  resources.length > 0 ? (
                    resources.map((resource) => (
                      <tr key={resource.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.subjectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.branch}</td>
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
                            className={`text-red-600 hover:text-red-900 ${deletingId === resource.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {deletingId === resource.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No resources added yet.
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 