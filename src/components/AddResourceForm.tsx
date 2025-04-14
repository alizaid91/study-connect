import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { db, storage } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Resource } from '../types/content';

const AddResourceForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'book' as 'book' | 'notes' | 'video' | 'other',
    subjectCode: '',
    subjectName: '',
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !user) return;

    setUploading(true);
    setError(null);

    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `resources/${formData.type}/${formData.subjectCode}/${formData.title}`);
      const snapshot = await uploadBytes(storageRef, formData.file);
      const fileUrl = await getDownloadURL(snapshot.ref);

      // Add resource data to Firestore
      const resourceData: Omit<Resource, 'id'> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        subjectCode: formData.subjectCode,
        subjectName: formData.subjectName,
        fileUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.uid,
      };

      await addDoc(collection(db, 'resources'), resourceData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'book',
        subjectCode: '',
        subjectName: '',
        file: null,
      });
    } catch (err) {
      setError('Error uploading resource. Please try again.');
      console.error('Error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'book' | 'notes' | 'video' | 'other' })}
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
        <label className="block text-sm font-medium text-gray-700">Resource File</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.mp4"
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
        {uploading ? 'Uploading...' : 'Add Resource'}
      </button>
    </form>
  );
};

export default AddResourceForm; 