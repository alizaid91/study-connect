import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Paper } from '../types/content';
import { Link } from 'react-router-dom';

const PYQs = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedPattern, setSelectedPattern] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'Insem' | 'Endsem'>('all');

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const papersQuery = query(
          collection(db, 'papers'),
          orderBy('year', 'desc')
        );
        const querySnapshot = await getDocs(papersQuery);
        const papersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Paper[];
        setPapers(papersData);
      } catch (err) {
        setError('Error fetching papers. Please try again later.');
        console.error('Error fetching papers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  // Get unique values for filters
  const branches = Array.from(new Set(papers.map(paper => paper.branch))).sort();
  const years = Array.from(new Set(papers.map(paper => paper.year)))
    .filter(year => year !== 'FE') // Remove FE from years
    .sort((a, b) => b.localeCompare(a));
  const patterns = Array.from(new Set(papers.map(paper => paper.pattern))).sort();
  
  // Get subjects based on selected branch and year
  const subjects = Array.from(new Set(
    papers
      .filter(paper => 
        (selectedBranch === 'all' || paper.branch === selectedBranch) &&
        (selectedYear === 'all' || paper.year === selectedYear)
      )
      .map(paper => paper.subjectName)
  )).sort();

  // Filter papers based on selected filters
  const filteredPapers = papers.filter(paper => {
    const branchMatch = selectedBranch === 'all' || paper.branch === selectedBranch;
    const yearMatch = selectedYear === 'all' || paper.year === selectedYear;
    const patternMatch = selectedPattern === 'all' || paper.pattern === selectedPattern;
    const subjectMatch = selectedSubject === 'all' || paper.subjectName === selectedSubject;
    const typeMatch = selectedType === 'all' || paper.paperType === selectedType;
    return branchMatch && yearMatch && patternMatch && subjectMatch && typeMatch;
  });

  const clearFilters = () => {
    setSelectedBranch('all');
    setSelectedYear('all');
    setSelectedPattern('all');
    setSelectedSubject('all');
    setSelectedType('all');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Previous Year Question Papers</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setSelectedYear('all');
                setSelectedSubject('all');
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          {selectedBranch !== 'all' && selectedBranch !== 'FE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedSubject('all');
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Patterns</option>
              {patterns.map(pattern => (
                <option key={pattern} value={pattern}>{pattern} Pattern</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paper Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | 'Insem' | 'Endsem')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="Insem">Insem</option>
              <option value="Endsem">Endsem</option>
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
      </div>

      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No papers found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {paper.subjectName}
                  </h3>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                    {paper.paperType}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Branch:</span> {paper.branch}
                  </p>
                  {paper.branch !== 'FE' && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Year:</span> {paper.year}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Pattern:</span> {paper.pattern}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Paper:</span> {paper.paperName}
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to={paper.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full"
                  >
                    View Paper
                  </Link>
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