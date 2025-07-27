import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from ".././components/Navbar.tsx";
import Home from ".././pages/Home.tsx";
import Dashboard from ".././pages/Dashboard.tsx";
import Tasks from ".././pages/Tasks.tsx";
import Resources from ".././pages/Resources.tsx";
import Auth from ".././pages/Auth.tsx";
import PYQs from ".././pages/PYQs.tsx";
import AdminDashboard from ".././pages/AdminDashboard.tsx";
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
import { logoutAdmin, setAdmin } from "../store/slices/adminSlice.ts";
import { logout, setUser } from "../store/slices/authSlice.ts";
import ProtectedAdminRoute from "../components/admin/ProtectedAdminRoute.tsx";
import ProfileCompletionPopup from "../components/AI-Assistant/ProfileCompletionPopup.tsx";
import { openProfileComplete } from "../store/slices/globalPopups.ts";
import PoliciesPage from "../pages/Policies.tsx";

const AppRouter = () => {
  const { pathname } = useLocation();
  const { profile } = useSelector((state: RootState) => state.auth);
  const { isProfileCompleteOpen } = useSelector(
    (state: RootState) => state.globalPopups
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(
    (state: RootState) => state.globalPopups.isPremiumComingSoonOpen
  );
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const lastScrollY = useRef(0);
  const visibleHeight = window.innerHeight - 64;

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
        const idTokenResult = await user.getIdTokenResult();
        const isAdmin = idTokenResult.claims.role === "admin";
        dispatch(setAdmin(isAdmin)); // ✅ update admin state
        dispatch(setUser(user)); // ✅ your auth slice
        navigate("/");
      } else {
        dispatch(logoutAdmin()); // ✅ clear admin state
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
    // Lock scroll
    if (isProfileCompleteOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      // Unlock scroll when component unmounts
      document.body.classList.remove("overflow-hidden");
    };
  }, [isProfileCompleteOpen]);

  return (
    <div
      style={{
        maxHeight: `${pathname === "/ai-assistant" ? visibleHeight : "auto"}`,
      }}
      className="bg-gray-50 flex flex-col"
    >
      <Navbar isHidden={isNavbarHidden} />
      <main className={`w-full flex-grow ${isNavbarHidden ? "pt-8" : "pt-16"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/pricing" element={<Pricing />} />
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
          <Route path="/resources" element={<Resources />} />
          <Route path="/pyqs" element={<PYQs />} />
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
      {isProfileCompleteOpen && <ProfileCompletionPopup />}
    </div>
  );
};

export default AppRouter;
