import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RootState } from '../store';
import { Resource } from '../types/content';
import { Link } from 'react-router-dom';

const FE_SUBJECTS = [
  { name: 'Engineering Mathematics I', code: 'EM1' },
  { name: 'Engineering Physics', code: 'EP' },
  { name: 'Engineering Chemistry', code: 'EC' },
  { name: 'Basic Electrical Engineering', code: 'BEE' },
  { name: 'Basic Electronics Engineering', code: 'BEC' },
  { name: 'Engineering Mechanics', code: 'EM' },
  { name: 'Engineering Drawing', code: 'ED' },
  { name: 'Communication Skills', code: 'CS' },
  { name: 'Environmental Studies', code: 'ES' },
  { name: 'Workshop Practice', code: 'WP' }
];

const IT_SUBJECTS = {
  SE: [
    { name: 'Discrete Mathematics', code: 'DM' },
    { name: 'Logic Design & Computer Organization', code: 'LDCO' },
    { name: 'Data Structures & Algorithms', code: 'DSA' },
    { name: 'Objects Oriented Programming', code: 'OOP' },
    { name: 'Basics of Computer Network', code: 'BCN' },
    { name: 'Engineering Mathematics-III', code: 'EM3' },
    { name: 'Processor Architecture', code: 'PA' },
    { name: 'Database Management System', code: 'DBMS' },
    { name: 'Computer Graphics', code: 'CG' },
    { name: 'Software Engineering', code: 'SE' }
  ],
  TE: [
    { name: 'Theory of Computation', code: 'TOC' },
    { name: 'Operating Systems', code: 'OS' },
    { name: 'Machine Learning', code: 'ML' },
    { name: 'Human Computer Interaction', code: 'HCI' },
    { name: 'Elective-I', code: 'E1' },
    { name: 'Computer Networks & Security', code: 'CNS' },
    { name: 'Data Science and Big Data Analytics', code: 'DSBDA' },
    { name: 'Web Application Development', code: 'WAD' },
    { name: 'Elective-II', code: 'E2' },
    { name: 'Internship', code: 'INT' }
  ],
  BE: [
    { name: 'Information Storage and Retrieval', code: 'ISR' },
    { name: 'Software Project Management', code: 'SPM' },
    { name: 'Deep Learning', code: 'DL' },
    { name: 'Elective III', code: 'E3' },
    { name: 'Elective IV', code: 'E4' },
    { name: 'Distributed Systems', code: 'DS' },
    { name: 'Elective V', code: 'E5' },
    { name: 'Elective VI', code: 'E6' },
    { name: 'Startup and Entrepreneurship', code: 'SE' }
  ]
};

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    pattern: '',
    type: '',
    subjectName: ''
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const resourcesRef = collection(db, 'resources');
        const q = query(resourcesRef, orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const resourcesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Resource[];
        setResources(resourcesData);
        setFilteredResources(resourcesData);
      } catch (err) {
        setError('Failed to fetch resources');
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    let filtered = [...resources];

    if (filters.branch) {
      filtered = filtered.filter(resource => resource.branch === filters.branch);
    }

    if (filters.year) {
      filtered = filtered.filter(resource => resource.year === filters.year);
    }

    if (filters.pattern) {
      filtered = filtered.filter(resource => resource.pattern === filters.pattern);
    }

    if (filters.type) {
      filtered = filtered.filter(resource => resource.type === filters.type);
    }

    if (filters.subjectName) {
      filtered = filtered.filter(resource => resource.subjectName === filters.subjectName);
    }

    setFilteredResources(filtered);
  }, [filters, resources]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: value,
      // Reset subject when branch or year changes
      ...(name === 'branch' || name === 'year' ? { subjectName: '' } : {})
    }));
  };

  const clearFilters = () => {
    setFilters({
      branch: '',
      year: '',
      pattern: '',
      type: '',
      subjectName: ''
    });
  };

  const getAvailableSubjects = () => {
    if (filters.branch === 'FE') {
      return FE_SUBJECTS;
    }
    if (filters.branch === 'IT' && filters.year && filters.year !== 'FE') {
      return IT_SUBJECTS[filters.year as 'SE' | 'TE' | 'BE'];
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resources</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                name="branch"
                value={filters.branch}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                <option value="FE">First Year</option>
                <option value="CS">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="Civil">Civil</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={filters.branch === 'FE'}
              >
                <option value="">All Years</option>
                <option value="SE">Second Year</option>
                <option value="TE">Third Year</option>
                <option value="BE">Final Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
              <select
                name="pattern"
                value={filters.pattern}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Patterns</option>
                <option value="2019">2019</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="book">Book</option>
                <option value="notes">Notes</option>
                <option value="video">Video</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                name="subjectName"
                value={filters.subjectName}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!filters.branch || (filters.branch !== 'FE' && !filters.year)}
              >
                <option value="">All Subjects</option>
                {getAvailableSubjects().map((subject) => (
                  <option key={subject.code} value={subject.name}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {filteredResources.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No resources found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-2">
                  {resource.branch} - {resource.year !== 'FE' ? resource.year : ''} {resource.pattern}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Subject:</span> {resource.subjectName}
                </p>
                <p className="text-gray-700 mb-4">
                  <span className="font-medium">Type:</span> {resource.type}
                </p>
                <a
                  href={resource.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
                >
                  View Resource
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources; 