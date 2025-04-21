import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logoutAdmin } from '../store/slices/adminSlice';
import { logout } from '../store/slices/authSlice';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAdmin } = useSelector((state: RootState) => state.admin);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleAdminLogout = () => {
    dispatch(logoutAdmin());
    navigate('/');
  };

  const handleUserLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                Study Connect
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Home
              </Link>
              <Link
                to="/pyqs"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/pyqs')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                PYQs
              </Link>
              <Link
                to="/resources"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/resources')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Resources
              </Link>
              <Link
                to="/tasks"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/tasks')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Tasks
              </Link>
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/bookmarks"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/bookmarks')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Bookmarks
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/admin/dashboard')
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  Admin Dashboard
                </Link>
              )}
              {user && (
                <Link
                  to="/profile"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/profile')
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user && (
              <button
                onClick={handleUserLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                User Logout
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleAdminLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Admin Logout
              </button>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}
      >
        <div className="relative">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu content */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Home
              </Link>
              <Link
                to="/pyqs"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/pyqs')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                PYQs
              </Link>
              <Link
                to="/resources"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/resources')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Resources
              </Link>
              <Link
                to="/tasks"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/tasks')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Tasks
              </Link>
              <Link
                to="/dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/dashboard')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/bookmarks"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/bookmarks')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Bookmarks
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/admin/dashboard')
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  Admin Dashboard
                </Link>
              )}
              {user && (
                <Link
                  to="/profile"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/profile')
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-4 space-y-2">
                  {user && (
                    <button
                      onClick={handleUserLogout}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      User Logout
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={handleAdminLogout}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Admin Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 