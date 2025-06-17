import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Paper } from '../../types/content';
import { useNavigate } from 'react-router-dom';
import { papersService } from '../../services/papersService';
import { IT_SUBJECTS, FE_SUBJECTS } from '../../types/Subjects';

interface AddPaperFormProps {
  onSuccess?: () => void;
}

const AddPaperForm = ({ onSuccess }: AddPaperFormProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useSelector((state: RootState) => state.admin);
  const [formData, setFormData] = useState({
    subjectId: '',
    subjectName: '',
    branch: 'FE' as Paper['branch'],
    year: 'FE' as Paper['year'],
    semester: 1,
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
      semester: newBranch === 'FE' ? 1 : 3,
      subjectId: '',
      subjectName: '',
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      year: e.target.value as Paper['year'],
      semester: formData.year === 'SE' ? 3 : formData.year === 'TE' ? 5 : 7,
      subjectId: '',
      subjectName: '',
    });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubject = (formData.year !== 'FE' ? IT_SUBJECTS['2019Pattern'][formData.year] : FE_SUBJECTS['2019Pattern'])
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
      // Add paper data using the service
      const paperData: Omit<Paper, 'id'> = {
        subjectId: formData.subjectId,
        subjectName: formData.subjectName,
        branch: formData.branch,
        year: formData.year,
        semester: formData.semester,
        pattern: formData.pattern,
        paperType: formData.paperType,
        paperName: formData.paperName,
        driveLink: formData.driveLink,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
      };

      await papersService.addPaper(paperData);
      onSuccess?.();
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
        <label className="block text-sm font-medium text-gray-700">Semester</label>
        <select
          value={formData.semester}
          onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        >
          {
            formData.branch === 'FE' ? (
              <>
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </>
            ) : formData.year === 'SE' ? (
              <>
                <option value={3}>Semester 3</option>
                <option value={4}>Semester 4</option>
              </>
            ) : formData.year === 'TE' ? (
              <>
                <option value={5}>Semester 5</option>
                <option value={6}>Semester 6</option>
              </>
            ) : formData.year === 'BE' ? (
              <>
                <option value={7}>Semester 7</option>
                <option value={8}>Semester 8</option>
              </>
            ) : null
          }
        </select>
      </div>

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
          {(formData.year !== 'FE' ? IT_SUBJECTS['2019Pattern'][formData.year].filter((sub) => sub.semester === formData.semester) : FE_SUBJECTS['2019Pattern']).map((subject) => (
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