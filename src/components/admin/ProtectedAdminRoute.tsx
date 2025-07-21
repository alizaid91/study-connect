import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { useEffect, useState } from "react";
import { setAdmin, logoutAdmin } from "../../store/slices/adminSlice";
import { useDispatch } from "react-redux";
import Loader1 from "../Loaders/Loader1";

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
        } else {
          //   console.log("User is not an admin.");
          dispatch(logoutAdmin());
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <Loader1 />;

  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

export default ProtectedAdminRoute;
