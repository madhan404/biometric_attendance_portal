import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import store from "../redux/store";
import { AuthProvider } from "../context/AuthContext";
import LoginPage from "../components/LoginPage/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";

import MentorDashboard from "./MentorDashboard";
import StaffDashboard from "./StaffDashboard";
import Non_ClassAdvisorDashboard from "./Non_ClassAdvisorDashboard";
import HodDashboard from "./HodDashboard";
import Hod_PersonalDashboard from "./Hod_PersonalDashboard";
import PlacementDashboard from "./PlacementDashboard";
import PrincipalDashboard from "./PrincipalDashboard";
// import StaffDashboardLayout from '../components/StaffDashboardLayout';

export const MainNavigator = () => {
  const [userRole, setUserRole] = useState(() => {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user).role : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("authToken") !== null;
  });

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) setUserRole(JSON.parse(user).role);
    const authToken = sessionStorage.getItem("authToken");
    setIsAuthenticated(authToken !== null);
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
  };

  // const getDashboardRoute = () => {
  //   switch (userRole) {
  //     case "admin":
  //       return "/admin-dashboard";
  //     case "student":
  //       return "/student-dashboard";
  //     case "mentor":
  //       return "/mentor-dashboard";
  //     case "staff":
  //       return "/staff-dashboard";
  //     case "non_classadvisor":
  //       return "/non_classadvisordashboard";
  //     case "hod":
  //       return "/hod-dashboard";
  //     case "hodstaff":
  //       return "/hod_personal-dashboard";
  //     case "principal":
  //       return "/principal-dashboard";
  //     case "placement-officer":
  //       return "/placement-dashboard";
  //     default:
  //       return "/";
  //   }
  // };

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor-dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated && userRole === "mentor"}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated && userRole === "staff"}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/non_classadvisordashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="staff">
                  <Non_ClassAdvisorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod-dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="hod">
                  <HodDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod_personal-dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="hodstaff">
                  <Hod_PersonalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal-dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="principal">
                  <PrincipalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="placement_officer">
                  <PlacementDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
};

export default MainNavigator;
