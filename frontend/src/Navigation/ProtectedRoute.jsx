import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, children }) => {
  const isUserAuthenticated = isAuthenticated || sessionStorage.getItem("authToken");

  return isUserAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;




