import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Resource } from '../types/content';

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'book' | 'notes' | 'video' | 'other'>('all');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const resourcesRef = collection(db, 'resources');
        const q = query(resourcesRef, orderBy('uploadedAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const resourcesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Resource[];

        setResources(resourcesData);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = filter === 'all' 
    ? resources 
    : resources.filter(resource => resource.type === filter);

  if (loading) {
    return <div className="text-center py-8">Loading resources...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Study Resources</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'book' | 'notes' | 'video' | 'other')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All Types</option>
          <option value="book">Books</option>
          <option value="notes">Notes</option>
          <option value="video">Videos</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                resource.type === 'book' ? 'bg-blue-100 text-blue-800' :
                resource.type === 'notes' ? 'bg-green-100 text-green-800' :
                resource.type === 'video' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(resource.uploadedAt).toLocaleDateString()}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
            <p className="text-gray-600 mb-4">{resource.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {resource.subjectName} ({resource.subjectCode})
              </span>
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No resources found.
        </div>
      )}
    </div>
  );
};

export default Resources; 