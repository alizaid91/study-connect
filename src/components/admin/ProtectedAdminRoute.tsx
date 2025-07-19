import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { useEffect, useState } from "react";
import { setAdmin, logoutAdmin } from "../../store/slices/adminSlice";
import { useDispatch } from "react-redux";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // console.log("User is authenticated, Varifying admin status...", user);
        const token = await user.getIdTokenResult(true);
        if (token.claims.role === "admin") {
          setIsAdmin(true);
          dispatch(setAdmin(true));
        //   console.log("User is an admin.");
        }
        else {
        //   console.log("User is not an admin.");
          dispatch(logoutAdmin());
        }
      }
      dispatch(logoutAdmin());
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent animate-spin"></div>
          <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-blue-400 animate-spin animation-delay-150"></div>
          <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-blue-300 border-r-transparent border-b-blue-500 border-l-transparent animate-spin animation-delay-300"></div>
        </div>
      </div>
    );

  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

export default ProtectedAdminRoute;
