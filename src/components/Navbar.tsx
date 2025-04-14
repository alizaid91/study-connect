import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { setUser } from '../store/slices/authSlice';

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(null));
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            Student Guide
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/pyqs" className="text-gray-600 hover:text-primary-600">
                  PYQs
                </Link>
                <Link to="/tasks" className="text-gray-600 hover:text-primary-600">
                  Tasks
                </Link>
                <Link to="/resources" className="text-gray-600 hover:text-primary-600">
                  Resources
                </Link>
                <Link to="/ai-assistant" className="text-gray-600 hover:text-primary-600">
                  AI Assistant
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 