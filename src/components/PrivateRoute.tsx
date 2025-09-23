import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { pathname } = useLocation();
  const { user, profile } = useSelector((state: RootState) => state.auth);
  if (pathname === "/checkout" && profile && profile.role === "premium") {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
