import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AppRouter from './Routes/AppRouter.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { logout } from './store/slices/authSlice.ts';
import { authService } from './services/authService.ts';
import { setAdmin } from './store/slices/adminSlice.ts';
import { UserProfile } from './types/user.ts';

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
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const AI_URL = import.meta.env.VITE_AI_SERVICE_URL;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribeProfile = authService.listenUserProfile(user.uid);
    return () => {
      unsubscribeProfile();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user || !profile) return;

    const today = new Date().toLocaleDateString('en-GB');

    if (profile.aiPromptUsage?.date !== today) {
      authService.updateUserProfile(user.uid, {
        ...profile,
        aiPromptUsage: {
          date: today,
          count: 0,
        },
      } as UserProfile);
    }
  }, [user?.uid, profile?.aiPromptUsage?.date]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        const isAdmin = idTokenResult.claims.role === 'admin';
        dispatch(setAdmin(isAdmin));
      } else {
        dispatch(logout());
      }
    });
    fetch(`${AI_URL}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`AI service responded with status ${response.status}`);
        }
        response.text().then((text) => {
          console.log(text)
        })
      })
      .catch((error) => {
        console.error('Error connecting to AI service:', error);
      });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AppRouter />
    </Router>
  );
}

export default App;
