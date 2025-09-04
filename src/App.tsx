import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppRouter from "./Routes/AppRouter.tsx";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { authService } from "./services/authService.ts";
import { apiService } from "./services/apiService.ts";
import { auth } from "./config/firebase.ts";

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
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user || !auth.currentUser) return;
    const unsubscribeProfile = authService.listenUserProfile(user.uid);

    apiService.checkUsage().then(() => {
      console.log("Usage checked and updated");
    });

    return () => {
      unsubscribeProfile();
    };
  }, [user]);

  return (
    <Router>
      <ScrollToTop />
      <AppRouter />
    </Router>
  );
}

export default App;
