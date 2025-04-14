import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Paper {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  year: string;
  semester: 'Summer' | 'Winter';
  fileUrl: string;
  uploadedAt: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  papers: Paper[];
}

const PYQs = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const papersRef = collection(db, 'papers');
        const q = query(papersRef, orderBy('uploadedAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const papersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Paper[];

        // Group papers by subject
        const subjectsMap = new Map<string, Subject>();
        
        papersData.forEach(paper => {
          if (!subjectsMap.has(paper.subjectId)) {
            subjectsMap.set(paper.subjectId, {
              id: paper.subjectId,
              name: paper.subjectName,
              code: paper.subjectCode,
              papers: []
            });
          }
          subjectsMap.get(paper.subjectId)?.papers.push(paper);
        });

        setSubjects(Array.from(subjectsMap.values()));
      } catch (error) {
        console.error('Error fetching papers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading papers...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Previous Year Question Papers</h1>
      
      {selectedSubject ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              {selectedSubject.name} ({selectedSubject.code})
            </h2>
            <button
              onClick={() => setSelectedSubject(null)}
              className="btn btn-secondary"
            >
              Back to Subjects
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedSubject.papers.length > 0 ? (
              selectedSubject.papers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {paper.semester} Semester {paper.year}
                  </h3>
                  <a
                    href={paper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary mt-4"
                  >
                    View Paper
                  </a>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No papers available for this subject.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <h3 className="text-xl font-semibold mb-2">{subject.name}</h3>
                <p className="text-gray-600 mb-4">Course Code: {subject.code}</p>
                <p className="text-sm text-gray-500">
                  {subject.papers.length} papers available
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No papers available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PYQs; 