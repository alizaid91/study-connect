import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, logout } from '../store/slices/authSlice';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import logo from '../assets/logo.png';
import { authService, AuthFormData } from '../services/authService';
import { setAdmin } from '../store/slices/adminSlice';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const hash = location.hash.replace('#', '');

    if (hash === 'login') {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [location.hash]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims.role === 'admin') {
          dispatch(setAdmin(true));
        }
        dispatch(setUser(user));
        navigate('/');
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
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await authService.signInWithEmail(formData.email, formData.password);
      } else {
        await authService.signUpWithEmail(formData);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="mx-4">
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-4 px-2 lg:p-12">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6 space-y-6">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 ${isLogin ? 'border-b-2 border-primary-600 text-primary-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
            >Sign In</button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 ${!isLogin ? 'border-b-2 border-primary-600 text-primary-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
            >Sign Up</button>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-800">
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {
              !isLogin && (
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
              )
            }
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
            {/* {!isLogin && (
              <>
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
            )} */}
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
            {
              isLoading ? <button disabled type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex items-center w-full justify-center font-medium">
                <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                </svg>
                Loading...
              </button> :
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </button>
            }
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
        </div>
      </div>
    </div>
  );
};

export default Auth; 