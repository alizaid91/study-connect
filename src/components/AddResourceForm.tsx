import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Resource } from '../types/content';
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

const AddResourceForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useSelector((state: RootState) => state.admin);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'book' as Resource['type'],
    subjectCode: '',
    subjectName: '',
    branch: 'FE' as Resource['branch'],
    year: 'FE' as Resource['year'],
    pattern: '2019' as Resource['pattern'],
    driveLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
  }, [isAdmin, navigate]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranch = e.target.value as Resource['branch'];
    setFormData({
      ...formData,
      branch: newBranch,
      year: newBranch === 'FE' ? 'FE' : 'SE',
      subjectCode: '',
      subjectName: '',
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      year: e.target.value as Resource['year'],
      subjectCode: '',
      subjectName: '',
    });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubject = formData.branch === 'IT' && formData.year !== 'FE' 
      ? IT_SUBJECTS[formData.year as 'SE' | 'TE' | 'BE'].find(subject => subject.name === e.target.value)
      : FE_SUBJECTS.find(subject => subject.name === e.target.value);
    if (selectedSubject) {
      setFormData({
        ...formData,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setError('You must be logged in as admin to add resources');
      return;
    }

    if (!formData.driveLink) {
      setError('Please provide a Google Drive link');
      return;
    }

    if (!formData.title) {
      setError('Please provide a title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resourceData: Omit<Resource, 'id'> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        subjectCode: formData.subjectCode,
        subjectName: formData.subjectName,
        branch: formData.branch,
        year: formData.year,
        pattern: formData.pattern,
        driveLink: formData.driveLink,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
      };

      await addDoc(collection(db, 'resources'), resourceData);

      setFormData({
        title: '',
        description: '',
        type: 'book',
        subjectCode: '',
        subjectName: '',
        branch: 'FE',
        year: 'FE',
        pattern: '2019',
        driveLink: '',
      });
    } catch (err) {
      setError('Error adding resource. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div className="text-center py-8">Please log in as admin to add resources.</div>;
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
          onChange={(e) => setFormData({ ...formData, pattern: e.target.value as Resource['pattern'] })}
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
          {(formData.branch === 'IT' && formData.year !== 'FE' 
            ? IT_SUBJECTS[formData.year as 'SE' | 'TE' | 'BE']
            : FE_SUBJECTS
          ).map((subject: { name: string; code: string }) => (
            <option key={subject.code} value={subject.name}>
              {subject.name} ({subject.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Resource Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        >
          <option value="book">Book</option>
          <option value="notes">Notes</option>
          <option value="video">Video</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Resource Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter resource title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter resource description"
          rows={3}
        />
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
          Paste the Google Drive link to the resource here
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Adding...' : 'Add Resource'}
      </button>
    </form>
  );
};

export default AddResourceForm; 