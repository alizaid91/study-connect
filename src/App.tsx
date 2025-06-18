import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Tasks from './pages/Tasks.tsx';
import Resources from './pages/Resources.tsx';
import Auth from './pages/Auth.tsx';
import PYQs from './pages/PYQs.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import Footer from './components/Footer';
import NotFound from './pages/NotFound.tsx';
// import AiAssistant from './pages/AiAssitant.tsx';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Separate component for scroll to top functionality
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

function App() {
  const { isAdmin } = useSelector((state: RootState) => state.admin);
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="w-full flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            {
              isAdmin && (

                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminDashboard />
                  }
                />
              )
            }
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <Tasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <Resources />
              }
            />
            <Route
              path="/pyqs"
              element={
                <PYQs />
              }
            />
            <Route
              path="/bookmarks"
              element={
                <PrivateRoute>
                  <Bookmarks />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            {/* <Route path="/ai-assistant" element={
              <PrivateRoute>
                <AiAssistant />
              </PrivateRoute>
            } /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
