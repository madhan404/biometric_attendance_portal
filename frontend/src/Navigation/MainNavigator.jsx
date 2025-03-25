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
import StudentDashboard from "./StudentDashboard";
import StaffDashboard from "./StaffDashboard";
import HodDashboard from "./HodDashboard";
import PlacementDashboard from "./PlacementDashboard";
import PrincipalDashboard from "./PrincipalDashboard";

// MainNavigator with Role-Based Routing
export const MainNavigator = () => {
  const [userRole, setUserRole] = useState(() => {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user).role : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("authToken") !== null;
  });

  // Update authentication and role on component mount
  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) setUserRole(user.role);
    const authToken = sessionStorage.getItem("authToken");
    setIsAuthenticated(authToken !== null);
  }, []);

  // Callback function to handle successful login
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    // setUserRole(userData.role);
  };

  // Determine initial route based on user role
  const getDashboardRoute = () => {
    switch (userRole) {
      case "student":
        return "/student-dashboard";
      case "staff":
        return "/staff-dashboard";
      case "hod":
        return "/hod-dashboard";
      case "principal":
        return "/principal-dashboard";
      case "placement-officer":
        return "/placement-officer-dashboard";
      default:
        return "/";
    }
  };

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Login Route */}
            <Route path="/" element={<LoginPage onLogin={handleLogin} />} />

            {/* Role-Based Dashboards */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated && userRole === "student"}
                >
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-dashboard"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated && userRole === "staff"}
                >
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod-dashboard"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated && userRole === "hod"}
                >
                  <HodDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal-dashboard"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated && userRole === "principal"}
                >
                  <PrincipalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-dashboard"
              element={
                <ProtectedRoute
                  isAuthenticated={
                    isAuthenticated && userRole === "placement-officer"
                  }
                >
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
