import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RootState, AppDispatch } from '../store';
import { Paper, Bookmark } from '../types/content';
import { addBookmark, removeBookmark, fetchBookmarks } from '../store/slices/bookmarkSlice';
import { Link } from 'react-router-dom';

interface Subject {
  name: string;
  code: string;
}

const PYQs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookmarks } = useSelector((state: RootState) => state.bookmarks);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    pattern: '',
    subjectName: ''
  });

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const papersRef = collection(db, 'papers');
        const q = query(papersRef, orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const papersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Paper[];
        setPapers(papersData);
        setFilteredPapers(papersData);
      } catch (err) {
        setError('Failed to fetch papers');
        console.error('Error fetching papers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchBookmarks(user.uid));
    }
  }, [dispatch, user]);

  useEffect(() => {
    let filtered = [...papers];

    if (filters.branch) {
      filtered = filtered.filter(paper => paper.branch === filters.branch);
    }

    if (filters.year) {
      filtered = filtered.filter(paper => paper.year === filters.year);
    }

    if (filters.pattern) {
      filtered = filtered.filter(paper => paper.pattern === filters.pattern);
    }

    if (filters.subjectName) {
      filtered = filtered.filter(paper => paper.subjectName === filters.subjectName);
    }

    setFilteredPapers(filtered);
  }, [filters, papers]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'branch' || name === 'year' ? { subjectName: '' } : {})
    }));
  };

  const clearFilters = () => {
    setFilters({
      branch: '',
      year: '',
      pattern: '',
      subjectName: ''
    });
  };

  const handleBookmark = async (paper: Paper) => {
    if (!user) return;

    const existingBookmark = bookmarks.find(
      (bookmark: Bookmark) => bookmark.contentId === paper.id && bookmark.type === 'Paper'
    );

    if (existingBookmark) {
      await dispatch(removeBookmark(existingBookmark.id));
    } else {
      await dispatch(addBookmark({
        userId: user.uid,
        contentId: paper.id,
        type: 'Paper',
        paperType: paper.paperType,
        resourceType: null,
        title: paper.subjectName,
        name: paper.paperName,
        description: `${paper.branch} - ${paper.year} ${paper.pattern}`,
        link: paper.driveLink,
        createdAt: new Date().toISOString()
      }));
    }
  };

  const isBookmarked = (paperId: string) => {
    return bookmarks.some((bookmark: Bookmark) => bookmark.contentId === paperId && bookmark.type === 'Paper');
  };

  const getAvailableSubjects = (): Subject[] => {
    const subjects = papers
      .filter(paper =>
        (!filters.branch || paper.branch === filters.branch) &&
        (!filters.year || paper.year === filters.year)
      )
      .map(paper => ({
        name: paper.subjectName,
        code: paper.subjectId
      }));

    return Array.from(new Set(subjects.map(s => JSON.stringify(s))))
      .map(s => JSON.parse(s));
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
      <h1 className="text-3xl font-bold mb-6">Previous Year Question Papers</h1>
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
                    {subject.name} ({subject.code.toUpperCase()})
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

      {filteredPapers.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No papers found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{paper.subjectName}</h3>
                <p className="text-gray-600 mb-2">
                  {paper.branch} - {paper.year !== 'FE' ? paper.year : ''} {paper.pattern}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Name: </span> {paper.paperName}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Type:</span> {paper.paperType}
                </p>
                <div className="flex justify-between items-center">
                  <a
                    href={paper.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
                  >
                    View Paper
                  </a>
                  <button
                    onClick={() => handleBookmark(paper)}
                    className={`p-2 rounded-full ${isBookmarked(paper.id)
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-gray-400 hover:text-gray-500'
                      }`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill={isBookmarked(paper.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PYQs; 