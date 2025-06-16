import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const authToken = sessionStorage.getItem("authToken");

  // If not authenticated, redirect to login
  if (!isAuthenticated && !authToken) {
    // Clear any existing data
    sessionStorage.clear();
    localStorage.clear();
    
    // Redirect to login with replace to prevent back navigation
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated but role doesn't match, redirect to appropriate dashboard
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    let redirectPath = "/";
    
    switch (user.role) {
      case "admin":
        redirectPath = "/admin-dashboard";
        break;
      case "student":
        redirectPath = "/student-dashboard";
        break;
      case "staff":
        redirectPath = "/non_classadvisordashboard";
        break;
      case "hodstaff":
        redirectPath = "/hod_personal-dashboard";
        break;
      case "hod":
        redirectPath = "/hod-dashboard";
        break;
      case "principal":
        redirectPath = "/principal-dashboard";
        break;
      case "placement_officer":
        redirectPath = "/placement-dashboard";
        break;
      default:
        redirectPath = "/";
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and role matches, render the protected component
  return children;
};

export default ProtectedRoute;




