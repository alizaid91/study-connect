import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DEFAULT_AVATAR, UserProfile } from '../types/user';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { FiUser, FiEdit, FiSave, FiX, FiCheck, FiLock } from 'react-icons/fi';
import { MdDataUsage } from "react-icons/md";
import { authService } from '../services/authService';
import UsageTracker from '../components/profile/UsageTracker';
import Loader1 from '../components/Loaders/Loader1';

// Function to create image from canvas for cropping
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // important for CORS and canvas
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

// Function to get cropped image
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};


// Profile page
const Profile = () => {
  const { user, profile, loading } = useSelector((state: RootState) => state.auth);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(profile);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'usage'>('general');

  // Security tab state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Image cropping state
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isProfileChanged, setIsProfileChanged] = useState(false);

  useEffect(() => {
    setTempProfile(profile);
  }, [profile]);

  useEffect(() => {
    const handelProfileChange = () => {
      if (!tempProfile) return false;
      return JSON.stringify(tempProfile) !== JSON.stringify(profile);
    };
    setIsProfileChanged(handelProfileChange());
  }, [tempProfile, profile])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'branch') {
      if (value === "") {
        setTempProfile({ ...tempProfile, [name]: value, year: "", semester: 0 } as UserProfile);
      } else if (value === "FE") {
        setTempProfile({ ...tempProfile, [name]: value, year: "", semester: 1 } as UserProfile);
      } else {
        setTempProfile({ ...tempProfile, [name]: value } as UserProfile);
      }
      return
    }
    setTempProfile({ ...tempProfile, [name]: value } as UserProfile);
  };

  // Handle crop complete
  const onCropComplete = useCallback(
    (_: any, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle crop complete
  const handleCropComplete = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return;

    try {
      setUploading(true);
      setError('');

      // Get the cropped image blob
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels as { x: number; y: number; width: number; height: number }
      );

      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', croppedImage);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      // Update profile with new avatar URL
      await authService.updateUserProfile(user.uid, { ...tempProfile, avatarUrl: imageUrl } as UserProfile);
      setSuccess('Avatar updated successfully');
      setShowCropper(false);
      setImageSrc(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;
    setUpdating(true);
    try {
      await authService.updateUserProfile(user.uid, tempProfile as UserProfile);
      setSuccess('Profile updated successfully');
    } catch (error: any) {
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');
    if (!user) return;
    if (!oldPassword || !newPassword || !confirmPassword) {
      setSecurityError('Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }
    setSecurityLoading(true);
    try {
      await authService.updateUserPassword(profile?.email || '', oldPassword, newPassword);
      setSecuritySuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to update password.');
    } finally {
      setSecurityLoading(false);
    }
  };

  // Handle forgot password in security tab
  const handleForgotPassword = async () => {
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);
    try {
      await authService.sendPasswordResetEmail(profile?.email || '');
      setResetSuccess('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      setResetError(err.message || 'Failed to send password reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading || !profile) {
    return <Loader1 />
  }

  // Profile page
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-600"></div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-gray-900 mb-6"
        >
          Profile Settings
        </motion.h2>
        <div className="flex mb-8 border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold transition-colors ${activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            onClick={() => setActiveTab('general')}
          >
            <FiUser className="inline mr-1" /> General
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold transition-colors ${activeTab === 'security' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            onClick={() => setActiveTab('security')}
          >
            <FiLock className="inline mr-1" /> Security
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold transition-colors ${activeTab === 'usage' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            onClick={() => setActiveTab('usage')}
          >
            <MdDataUsage className="inline mr-1" /> Usage
          </button>
        </div>

        {/* Tab Content */}
        <>
          {activeTab === 'general' && (
            <>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center"
                  >
                    <FiX className="mr-2" /> {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center"
                  >
                    <FiCheck className="mr-2" /> {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image Cropper Modal */}
              <AnimatePresence>
                {showCropper && imageSrc && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      className="bg-white rounded-lg p-6 w-full max-w-md"
                    >
                      <h3 className="text-xl font-semibold mb-4">Crop Your Avatar</h3>
                      <div className="relative h-60 w-full mb-4">
                        <Cropper
                          image={imageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.1"
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCropCancel}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                          disabled={uploading}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCropComplete}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </>
                          ) : (
                            <>Save</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-8 flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                    <img
                      src={tempProfile?.avatarUrl || DEFAULT_AVATAR[tempProfile?.gender || 'prefer not to say']}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-blue-50 transition-all duration-200 text-blue-500"
                  >
                    {uploading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <FiEdit size={18} />
                    )}
                  </motion.button>
                </motion.div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      value={tempProfile?.fullName || ''}
                      onChange={handleInputChange}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      value={tempProfile?.username || ''}
                      onChange={handleInputChange}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <select
                      id="branch"
                      name="branch"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      value={tempProfile?.branch || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Branch</option>
                      <option value="FE">First Year Engineering</option>
                      <option value="CS">Computer Science</option>
                      <option value="IT">Information Technology</option>
                      <option value="Civil">Civil Engineering</option>
                      <option value="Mechanical">Mechanical Engineering</option>
                    </select>
                  </motion.div>

                  {
                    tempProfile?.branch !== '' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label htmlFor="pattern" className="block text-sm font-medium text-gray-700">
                          Pattern
                        </label>
                        <select
                          id="pattern"
                          name="pattern"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                          value={tempProfile?.pattern || ""}
                          onChange={handleInputChange}
                        >
                          <option value={undefined}>Select Pattern</option>
                          <option value="2019">2019</option>
                          <option value="2024">2024</option>
                        </select>
                      </motion.div>
                    )
                  }

                  {(tempProfile?.branch !== 'FE' && tempProfile?.branch !== '') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        Year
                      </label>
                      <select
                        id="year"
                        name="year"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        value={tempProfile?.year || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Year</option>
                        <option value="SE">Second Year</option>
                        <option value="TE">Third Year</option>
                        <option value="BE">Final Year</option>
                      </select>
                    </motion.div>
                  )}

                  {
                    tempProfile?.branch !== '' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                          Semester
                        </label>
                        <select
                          id="semester"
                          name="semester"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                          value={tempProfile?.semester || ""}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Semester</option>
                          {
                            tempProfile?.branch === 'FE' ? (
                              <>
                                <option value="1">1</option>
                                <option value="2">2</option>
                              </>
                            ) : tempProfile?.year === 'SE' ? (
                              <>
                                <option value="3">3</option>
                                <option value="4">4</option>
                              </>
                            ) : tempProfile?.year === 'TE' ? (
                              <>
                                <option value="5">5</option>
                                <option value="6">6</option>
                              </>
                            ) : (
                              <>
                                <option value="7">7</option>
                                <option value="8">8</option>
                              </>
                            )
                          }
                        </select>
                      </motion.div>
                    )
                  }

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700">
                      College Name
                    </label>
                    <input
                      id="collegeName"
                      name="collegeName"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      value={tempProfile?.collegeName || ''}
                      onChange={handleInputChange}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      value={tempProfile?.gender || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer not to say">Prefer not to say</option>
                    </select>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8"
                >
                  {updating ? (
                    <button
                      disabled
                      type="button"
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600"
                    >
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Profile...
                    </button>
                  ) : (
                    isProfileChanged && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <FiSave className="mr-2" /> Update Profile
                      </motion.button>
                    )
                  )}
                </motion.div>
              </form>
            </>
          )}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <AnimatePresence>
                {securityError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center"
                  >
                    <FiX className="mr-2" /> {securityError}
                  </motion.div>
                )}
                {securitySuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center"
                  >
                    <FiCheck className="mr-2" /> {securitySuccess}
                  </motion.div>
                )}
              </AnimatePresence>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-not-allowed"
                />
              </div>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">Old Password</label>
                  <input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  {securityLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>Update Password</>
                  )}
                </button>
              </form>
              {/* Forgot Password button and feedback */}
              <div className="flex flex-col items-end mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-sm text-blue-600 hover:underline focus:outline-none"
                >
                  {resetLoading ? 'Sending reset email...' : 'Forgot Password?'}
                </button>
                {resetError && <div className="text-red-500 text-xs mt-1">{resetError}</div>}
                {resetSuccess && <div className="text-green-600 text-xs mt-1">{resetSuccess}</div>}
              </div>
            </motion.div>
          )}
          {activeTab === 'usage' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <UsageTracker />
            </motion.div>
          )}
        </>
      </motion.div>
    </div>
  );
};

export default Profile; 