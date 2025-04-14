import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AddPaperForm from '../components/AddPaperForm';
import AddResourceForm from '../components/AddResourceForm';

const AdminDashboard = () => {
  const { isAdmin } = useSelector((state: RootState) => state.admin);
  const [activeTab, setActiveTab] = useState<'papers' | 'resources'>('papers');
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'papers'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Manage Papers
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'resources'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Manage Resources
          </button>
        </div>
      </div>

      {activeTab === 'papers' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Previous Year Papers</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
            >
              {showAddForm ? 'Cancel' : 'Add New Paper'}
            </button>
          </div>

          {showAddForm ? (
            <AddPaperForm />
          ) : (
            <div className="space-y-4">
              {/* List of existing papers will go here */}
              <p className="text-gray-500">No papers added yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Study Resources</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
            >
              {showAddForm ? 'Cancel' : 'Add New Resource'}
            </button>
          </div>

          {showAddForm ? (
            <AddResourceForm />
          ) : (
            <div className="space-y-4">
              {/* List of existing resources will go here */}
              <p className="text-gray-500">No resources added yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 