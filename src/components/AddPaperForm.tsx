import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { db, storage } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Paper } from '../types/content';
import { useNavigate } from 'react-router-dom';

const AddPaperForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useSelector((state: RootState) => state.admin);
  const [formData, setFormData] = useState({
    subjectId: '',
    subjectName: '',
    subjectCode: '',
    year: '',
    semester: 'Summer' as 'Summer' | 'Winter',
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageEnabled, setStorageEnabled] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    // Check if Firebase Storage is available
    try {
      const testRef = ref(storage, 'test');
      setStorageEnabled(true);
    } catch (error) {
      setError('Firebase Storage is not enabled. Please enable it in your Firebase Console.');
      setStorageEnabled(false);
    }
  }, [isAdmin, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setError('You must be logged in as admin to add papers');
      return;
    }

    if (!storageEnabled) {
      setError('Firebase Storage is not enabled. Please contact the administrator.');
      return;
    }

    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `papers/${formData.subjectCode}/${formData.year}_${formData.semester}`);
      const snapshot = await uploadBytes(storageRef, formData.file);
      const fileUrl = await getDownloadURL(snapshot.ref);

      // Add paper data to Firestore
      const paperData: Omit<Paper, 'id'> = {
        subjectId: formData.subjectId,
        subjectName: formData.subjectName,
        subjectCode: formData.subjectCode,
        year: formData.year,
        semester: formData.semester,
        fileUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin', // Since we're using admin authentication
      };

      await addDoc(collection(db, 'papers'), paperData);

      // Reset form
      setFormData({
        subjectId: '',
        subjectName: '',
        subjectCode: '',
        year: '',
        semester: 'Summer',
        file: null,
      });
    } catch (err) {
      setError('Error uploading paper. Please try again.');
      console.error('Error:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!isAdmin) {
    return <div className="text-center py-8">Please log in as admin to add papers.</div>;
  }

  if (!storageEnabled) {
    return (
      <div className="text-center py-8 text-red-500">
        Firebase Storage is not enabled. Please contact the administrator.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Subject Name</label>
        <input
          type="text"
          value={formData.subjectName}
          onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Subject Code</label>
        <input
          type="text"
          value={formData.subjectCode}
          onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Year</label>
        <input
          type="text"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Semester</label>
        <select
          value={formData.semester}
          onChange={(e) => setFormData({ ...formData, semester: e.target.value as 'Summer' | 'Winter' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        >
          <option value="Summer">Summer</option>
          <option value="Winter">Winter</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Paper File</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full"
          required
        />
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="btn btn-primary w-full"
      >
        {uploading ? 'Uploading...' : 'Add Paper'}
      </button>
    </form>
  );
};

export default AddPaperForm; 