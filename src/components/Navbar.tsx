import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_AVATAR } from '../types/user';
import { authService } from '../services/authService';
import logo from '../assets/logo.png';
import proBadge from '../assets/Pro_logo.png'
import clsx from 'clsx';
import {
  FiBook,
  FiBookmark,
  FiClipboard,
  FiGrid,
  FiHome,
  FiLogOut,
  FiSettings,
  FiShield,
  FiFileText,
  FiMessageSquare,
  FiCreditCard
} from 'react-icons/fi';
import { logoutAdmin } from '../store/slices/adminSlice';

interface NavbarProps {
  isHidden?: boolean;
}


const Navbar: React.FC<NavbarProps> = ({ isHidden = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAdmin } = useSelector((state: RootState) => state.admin);
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAvatarMenuOpen(false);
  }, [location]);

  const handleUserLogout = async () => {
    try {
      await authService.signOut();
      dispatch(logout());
      dispatch(logoutAdmin());
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className={clsx(
        "transition-transform duration-300 px-4 sm:px-6 lg:px-8 bg-white shadow-md fixed top-0 left-0 right-0 z-40",
        isHidden ? "-translate-y-full" : "translate-y-0"
      )}>
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 relative">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-800 mt-[2px]">Study Connect</span>
              {
                profile?.role === 'premium' && (
                  <img src={proBadge} alt="Pro Badge" className="absolute left-[95%] top-1/2 -translate-y-1/2 w-12 object-cover mt-[2px]" />
                )
              }
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            <Link
              to="/dashboard"
              className={`text-sm font-medium flex items-center space-x-1 ${isActive('/dashboard') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <FiGrid className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/pyqs"
              className={`text-sm font-medium flex items-center space-x-1 ${isActive('/pyqs') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <FiFileText className="h-4 w-4" />
              <span>PYQs</span>
            </Link>
            <Link
              to="/resources"
              className={`text-sm font-medium flex items-center space-x-1 ${isActive('/resources') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <FiBook className="h-4 w-4" />
              <span>Resources</span>
            </Link>
            <Link
              to="/tasks"
              className={`text-sm font-medium flex items-center space-x-1 ${isActive('/tasks') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <FiClipboard className="h-4 w-4" />
              <span>Tasks</span>
            </Link>
            <Link
              to="/ai-assistant"
              className={`text-sm font-medium flex items-center space-x-1 ${isActive('/ai-assistant') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-800'}`}
              title="AI Assistant"
            >
              <FiMessageSquare className="h-4 w-4" />
              <span>AI Assistant</span>
            </Link>
            <Link
              to="/bookmarks"
              className={`text-sm font-medium flex items-center space-x-1 ${isActive('/bookmarks') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <FiBookmark className="h-4 w-4" />
              <span>Bookmarks</span>
            </Link>
            <Link
              to="/pricing"
              className={`text-sm font-medium flex items-center space-x-1 ${isActive('/pricing') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <FiCreditCard className="h-4 w-4" />
              <span>Pricing</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`text-sm font-medium flex items-center space-x-1 ${isActive('/admin/dashboard') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <FiShield className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
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

            {/* Avatar Menu */}
            {user && (
              <div className="relative" ref={avatarMenuRef}>
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <div className={`w-9 h-9 p-[2px] rounded-full ${profile?.role === 'premium' ? 'bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-400 shadow-md shadow-yellow-500/40 animate-border-spin' : 'bg-blue-700'}`}>
                    <img
                      src={profile?.avatarUrl || DEFAULT_AVATAR.male}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isAvatarMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-400/60 rounded-md shadow-lg py-1 z-50"
                      style={{ top: '100%' }}
                    >
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsAvatarMenuOpen(false)}
                      >
                        <FiSettings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      {user && (
                        <button
                          onClick={() => {
                            handleUserLogout();
                            setIsAvatarMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <FiLogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:hidden`}>
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <FiHome className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/dashboard')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <FiGrid className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/pyqs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/pyqs')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <FiFileText className="h-5 w-5" />
                  <span>PYQs</span>
                </Link>
                <Link
                  to="/resources"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/resources')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <FiBook className="h-5 w-5" />
                  <span>Resources</span>
                </Link>
                <Link
                  to="/tasks"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/tasks')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <FiClipboard className="h-5 w-5" />
                  <span>Tasks</span>
                </Link>
                <Link
                  to="/ai-assistant"
                  className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/ai-assistant')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiMessageSquare className="h-5 w-5" />
                  <span>AI Assistant</span>
                </Link>
                <Link
                  to="/bookmarks"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/bookmarks')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <FiBookmark className="h-5 w-5" />
                  <span>Bookmarks</span>
                </Link>
                <Link
                  to="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/pricing')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <FiCreditCard className="h-5 w-5" />
                  <span>Pricing</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/admin/dashboard')
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    <FiShield className="h-5 w-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                {user && (
                  <Link
                    to="/profile"
                    className={`flex items-center space-x-2 pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/profile')
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiSettings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>

  );
};

export default Navbar; 