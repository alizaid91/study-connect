import { BrowserRouter as Router, useLocation} from "react-router-dom";
import { useEffect } from "react";
import AppRouter from "./Routes/AppRouter.tsx";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { authService } from "./services/authService.ts";
import { UserProfile } from "./types/user.ts";

// Separate component for scroll to top functionality
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

function App() {
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const AI_URL = import.meta.env.VITE_AI_SERVICE_URL;

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribeProfile = authService.listenUserProfile(user.uid);
    return () => {
      unsubscribeProfile();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user || !profile) return;

    const today = new Date().toLocaleDateString("en-GB");

    if (profile.usage.aiPromptUsage?.date !== today) {
      authService.updateUserProfile(user.uid, {
        ...profile,
        usage: {
          aiPromptUsage: {
            date: today,
            count: 0,
          },
        },
      } as UserProfile);
    }
  }, [user?.uid, profile?.usage.aiPromptUsage?.date]);

  useEffect(() => {
    fetch(`${AI_URL}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `AI service responded with status ${response.status}`
          );
        }
        response.text().then((text) => {
          console.log(text);
        });
      })
      .catch((error) => {
        console.error("Error connecting to AI service:", error);
      });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AppRouter />
    </Router>
  );
}

export default App;
