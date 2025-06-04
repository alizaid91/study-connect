import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Resource } from '../types/content';
import { useNavigate } from 'react-router-dom';
import { IT_SUBJECTS, FE_SUBJECTS } from '../types/Subjects';

interface AddResourceFormProps {
  onSuccess?: () => void;
}

const AddResourceForm = ({ onSuccess }: AddResourceFormProps) => {
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
      ? IT_SUBJECTS['2019Pattern'][formData.year as 'SE' | 'TE' | 'BE'].find(subject => subject.name === e.target.value)
      : FE_SUBJECTS['2019Pattern'].find(subject => subject.name === e.target.value);
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
      onSuccess?.();
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
            ? IT_SUBJECTS['2019Pattern'][formData.year as 'SE' | 'TE' | 'BE']
            : FE_SUBJECTS['2019Pattern']
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
          <option value="decodes">Decodes</option>
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