import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Paper } from '../types/content';
import { Link } from 'react-router-dom';

const PYQs = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
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

  // Get unique subjects and years for filters
  const subjects = Array.from(new Set(papers.map(paper => paper.subjectName))).sort();
  const years = Array.from(new Set(papers.map(paper => paper.year))).sort((a, b) => b.localeCompare(a));

  // Filter papers based on selected filters
  const filteredPapers = papers.filter(paper => {
    const subjectMatch = selectedSubject === 'all' || paper.subjectName === selectedSubject;
    const yearMatch = selectedYear === 'all' || paper.year === selectedYear;
    const typeMatch = selectedType === 'all' || paper.paperType === selectedType;
    return subjectMatch && yearMatch && typeMatch;
  });

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
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
                <h3 className="text-xl font-semibold text-gray-800">
                  {paper.subjectName}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {paper.year}
                  </span>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                    {paper.paperType}
                  </span>
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