import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from ".././components/Navbar.tsx";
import Home from ".././pages/Home.tsx";
import Dashboard from ".././pages/Dashboard.tsx";
import Tasks from ".././pages/Tasks.tsx";
import Auth from ".././pages/Auth.tsx";
import PYQs from ".././pages/PYQs.tsx";
import PrivateRoute from ".././components/PrivateRoute.tsx";
import Profile from ".././pages/Profile";
import Bookmarks from ".././pages/Bookmarks";
import Footer from ".././components/Footer";
import NotFound from ".././pages/NotFound.tsx";
import AiAssistant from ".././pages/AiAssitant.tsx";
import Pricing from ".././pages/Pricing.tsx";
import { RootState } from ".././store";
import PremiumComingSoonModal from ".././components/PremiumComingSoon.tsx";
import { useDispatch, useSelector } from "react-redux";
import { authService } from "../services/authService.ts";
import { logout, setUser } from "../store/slices/authSlice.ts";
import ProfileCompletionPopup from "../components/AI-Assistant/ProfileCompletionPopup.tsx";
import { openProfileComplete } from "../store/slices/globalPopups.ts";
import ResourcesMain from "../pages/ReourcesMain.tsx";
import PoliciesPage from "../pages/Policies.tsx";
import SecurePdfViewer from "../components/utils/SecurePdfViewer.tsx";
import { Checkout } from "../pages/Checkout.tsx";

const AppRouter = () => {
  const { pathname } = useLocation();
  const { profile } = useSelector((state: RootState) => state.auth);
  const { isProfileCompleteOpen, showPdf } = useSelector(
    (state: RootState) => state.globalPopups
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(
    (state: RootState) => state.globalPopups.isPremiumComingSoonOpen
  );
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 0) {
        // Scrolling down
        setIsNavbarHidden(true);
      } else {
        // Scrolling up
        setIsNavbarHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        dispatch(setUser(user)); // ✅ your auth slice
        navigate("/");
      } else {
        dispatch(logout()); // ✅ clear auth state
      }
    });

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (!profile.branch) {
      dispatch(openProfileComplete());
    }
  }, [profile]);

  useEffect(() => {
    if (isProfileCompleteOpen || showPdf) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isProfileCompleteOpen, showPdf]);

  return (
    <div className="bg-gray-50 flex flex-col">
      <Navbar isHidden={isNavbarHidden} />
      <main
        className={`w-full flex-1 ${
          pathname !== "/ai-assistant" ? "min-h-screen" : "min-h-full"
        } ${isNavbarHidden ? "pt-8" : "pt-16"}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />
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
              <PrivateRoute>
                <ResourcesMain />
              </PrivateRoute>
            }
          />
          <Route
            path="/pyqs"
            element={
              <PrivateRoute>
                <PYQs />
              </PrivateRoute>
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
          <Route
            path="/ai-assistant"
            element={
              <PrivateRoute>
                <AiAssistant />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {pathname !== "/ai-assistant" && <Footer />}

      <PremiumComingSoonModal isOpen={isOpen} />
      {showPdf && <SecurePdfViewer />}
      {isProfileCompleteOpen && <ProfileCompletionPopup />}
    </div>
  );
};

export default AppRouter;
