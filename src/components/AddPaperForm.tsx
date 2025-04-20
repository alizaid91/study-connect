import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Paper } from '../types/content';
import { useNavigate } from 'react-router-dom';

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
    { name: 'Data Structures and Algorithms', code: 'DSA' },
    { name: 'Database Management Systems', code: 'DBMS' },
    { name: 'Computer Networks', code: 'CN' },
    { name: 'Operating Systems', code: 'OS' },
    { name: 'Object Oriented Programming', code: 'OOP' },
    { name: 'Discrete Mathematics', code: 'DM' },
    { name: 'Engineering Mathematics III', code: 'EM3' },
    { name: 'Digital Electronics', code: 'DE' },
    { name: 'Computer Organization', code: 'CO' },
    { name: 'Software Engineering', code: 'SE' }
  ],
  TE: [
    { name: 'Advanced Database Management Systems', code: 'ADBMS' },
    { name: 'Web Technologies', code: 'WT' },
    { name: 'Artificial Intelligence', code: 'AI' },
    { name: 'Machine Learning', code: 'ML' },
    { name: 'Cloud Computing', code: 'CC' },
    { name: 'Information Security', code: 'IS' },
    { name: 'Mobile Computing', code: 'MC' },
    { name: 'Data Analytics', code: 'DA' },
    { name: 'Software Testing', code: 'ST' },
    { name: 'Project Management', code: 'PM' }
  ],
  BE: [
    { name: 'Big Data Analytics', code: 'BDA' },
    { name: 'Internet of Things', code: 'IoT' },
    { name: 'Blockchain Technology', code: 'BT' },
    { name: 'Cyber Security', code: 'CS' },
    { name: 'Natural Language Processing', code: 'NLP' },
    { name: 'Computer Vision', code: 'CV' },
    { name: 'Advanced Web Development', code: 'AWD' },
    { name: 'Advanced Cloud Computing', code: 'ACC' },
    { name: 'Advanced Machine Learning', code: 'AML' },
    { name: 'Advanced Artificial Intelligence', code: 'AAI' }
  ]
};

const AddPaperForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useSelector((state: RootState) => state.admin);
  const [formData, setFormData] = useState({
    subjectId: '',
    subjectName: '',
    branch: 'FE' as Paper['branch'],
    year: 'FE' as Paper['year'],
    pattern: '2019' as Paper['pattern'],
    paperType: 'Insem' as 'Insem' | 'Endsem',
    paperName: '',
    driveLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if admin is authenticated
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
  }, [isAdmin, navigate]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranch = e.target.value as Paper['branch'];
    setFormData({
      ...formData,
      branch: newBranch,
      year: newBranch === 'FE' ? 'FE' : 'SE',
      subjectId: '',
      subjectName: '',
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      year: e.target.value as Paper['year'],
      subjectId: '',
      subjectName: '',
    });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubject = (formData.branch === 'IT' ? IT_SUBJECTS[formData.year] : FE_SUBJECTS)
      .find(subject => subject.name === e.target.value);
    if (selectedSubject) {
      setFormData({
        ...formData,
        subjectName: selectedSubject.name,
        subjectId: selectedSubject.code.toLowerCase(),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setError('You must be logged in as admin to add papers');
      return;
    }

    if (!formData.driveLink) {
      setError('Please provide a Google Drive link');
      return;
    }

    if (!formData.paperName) {
      setError('Please provide a paper name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add paper data to Firestore
      const paperData: Omit<Paper, 'id'> = {
        subjectId: formData.subjectId,
        subjectName: formData.subjectName,
        branch: formData.branch,
        year: formData.year,
        pattern: formData.pattern,
        paperType: formData.paperType,
        paperName: formData.paperName,
        driveLink: formData.driveLink,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
      };

      await addDoc(collection(db, 'papers'), paperData);

      // Reset form
      setFormData({
        subjectId: '',
        subjectName: '',
        branch: 'FE',
        year: 'FE',
        pattern: '2019',
        paperType: 'Insem',
        paperName: '',
        driveLink: '',
      });
    } catch (err) {
      setError('Error adding paper. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div className="text-center py-8">Please log in as admin to add papers.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Branch</label>
        <select
          value={formData.branch}
          onChange={handleBranchChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        >
          <option value="FE">First Year Engineering (FE)</option>
          <option value="CS">Computer Science (CS)</option>
          <option value="IT">Information Technology (IT)</option>
          <option value="Civil">Civil Engineering</option>
          <option value="Mechanical">Mechanical Engineering</option>
        </select>
      </div>

      {formData.branch !== 'FE' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <select
            value={formData.year}
            onChange={handleYearChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            <option value="SE">Second Year (SE)</option>
            <option value="TE">Third Year (TE)</option>
            <option value="BE">Fourth Year (BE)</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Pattern</label>
        <select
          value={formData.pattern}
          onChange={(e) => setFormData({ ...formData, pattern: e.target.value as Paper['pattern'] })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        >
          <option value="2019">2019 Pattern</option>
          <option value="2024">2024 Pattern</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Subject</label>
        <select
          value={formData.subjectName}
          onChange={handleSubjectChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        >
          <option value="">Select a subject</option>
          {(formData.branch === 'IT' ? IT_SUBJECTS[formData.year] : FE_SUBJECTS).map((subject) => (
            <option key={subject.code} value={subject.name}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Paper Type</label>
        <select
          value={formData.paperType}
          onChange={(e) => setFormData({ ...formData, paperType: e.target.value as 'Insem' | 'Endsem' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        >
          <option value="Insem">Insem</option>
          <option value="Endsem">Endsem</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Paper Name</label>
        <input
          type="text"
          value={formData.paperName}
          onChange={(e) => setFormData({ ...formData, paperName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="e.g., May_June_2023 or Nov_Dec_2023"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter the paper name (e.g., May_June_2023 or Nov_Dec_2023)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Google Drive Link</label>
        <input
          type="url"
          value={formData.driveLink}
          onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="https://drive.google.com/file/d/..."
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Paste the Google Drive link to the paper here
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Adding...' : 'Add Paper'}
      </button>
    </form>
  );
};

export default AddPaperForm; 