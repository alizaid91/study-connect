import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { auth, db } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { setUser, logout } from '../store/slices/authSlice';
import { RootState } from '../store';
import { UserProfile, DEFAULT_AVATAR } from '../types/user';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import bannerImage from '../assets/banner-image.avif';
import logo from '../assets/logo.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    gender: 'male' as UserProfile['gender'],
    branch: 'FE' as UserProfile['branch'],
    year: 'FE' as UserProfile['year'],
    collegeName: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser(user));
        navigate('/dashboard');
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset year to FE if branch is FE
      ...(name === 'branch' && value === 'FE' ? { year: 'FE' } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Create user profile in Firestore
        const userProfile: Omit<UserProfile, 'uid'> = {
          email: formData.email,
          fullName: formData.fullName,
          username: formData.username,
          avatarUrl: DEFAULT_AVATAR[formData.gender],
          gender: formData.gender,
          branch: formData.branch,
          year: formData.year,
          collegeName: formData.collegeName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = await doc(db, 'users', user.uid);
      const userData = await getDoc(userDoc);

      if (!userData.exists()) {
        // Create user profile for Google sign-in
        const userProfile: Omit<UserProfile, 'uid'> = {
          email: user.email || '',
          fullName: user.displayName || '',
          username: user.email?.split('@')[0] || '',
          avatarUrl: user.photoURL || DEFAULT_AVATAR.male,
          gender: 'male',
          branch: 'FE',
          year: 'FE',
          collegeName: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-primary-50">
        <img src={bannerImage} alt="Banner" className="object-cover w-full h-full rounded-l-xl" />
      </div>
      <div className="flex flex-1 items-center justify-center bg-gray-50 py-6 px-2 lg:p-12">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6 space-y-6">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-800">
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    placeholder="Full Name"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Username"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <select
                      id="branch"
                      name="branch"
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={formData.branch}
                      onChange={handleInputChange}
                    >
                      <option value="FE">First Year Engineering</option>
                      <option value="CS">Computer Science</option>
                      <option value="IT">Information Technology</option>
                      <option value="Civil">Civil Engineering</option>
                      <option value="Mechanical">Mechanical Engineering</option>
                    </select>
                  </div>
                </div>
                {formData.branch !== 'FE' && (
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                      id="year"
                      name="year"
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={formData.year}
                      onChange={handleInputChange}
                    >
                      <option value="SE">Second Year</option>
                      <option value="TE">Third Year</option>
                      <option value="BE">Final Year</option>
                    </select>
                  </div>
                )}
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="collegeName"
                    name="collegeName"
                    type="text"
                    required
                    placeholder="College Name"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email Address"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {!isLogin && (
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm Password"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            )}
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center">
            <div className="border-t border-gray-300 flex-grow mr-3"></div>
            <span className="text-sm text-gray-500">Or continue with</span>
            <div className="border-t border-gray-300 flex-grow ml-3"></div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FcGoogle className="mr-2" size={20} /> Continue with Google
            </button>
          </div>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 