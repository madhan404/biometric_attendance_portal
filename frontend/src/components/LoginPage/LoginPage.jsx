import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  Container, 
  CssBaseline, 
  Paper, 
  TextField, 
  Typography, 
  InputAdornment, 
  IconButton,
  Link
} from "@mui/material";
import { 
  EmailRounded as EmailIcon, 
  LockRounded as LockIcon, 
  VisibilityRounded as VisibilityIcon,
  VisibilityOffRounded as VisibilityOffIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setError("");
  
    if (!validateEmail(email)) {
      setEmailError("Invalid email format.");
      isValid = false;
    }

    if (isValid) {
      try { 
        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
  
        if (response.ok && data.user) {
          // Clear any existing data first
          sessionStorage.clear();
          localStorage.clear();
          
          // Store the JWT token and user data
          const token = data.user.token; // Get token from the response
          sessionStorage.setItem("authToken", token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
          
          // Set default authorization header for all future requests
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
          
          // Store headers in session storage for reuse
          sessionStorage.setItem("authHeaders", JSON.stringify(headers));
          
          onLogin(); 
  
          // Get role directly from user data since it's stored as a string
          const role = data.user.role;
          if (!role || typeof role !== "string") {
            console.error("Invalid role format");
            setError("Invalid role format. Please contact support.");
            return;
          }

          // Role-based routing with replace to prevent back navigation
          if (role) {
            const dashboardPath = getDashboardPath(role);
            navigate(dashboardPath, { replace: true });
          } else {
            setError("Invalid role data. Please contact support.");
          }
        } else {
          setError(data.message || "Invalid email, password, or role");
        }
      } catch(err) {
        setError(`${err} : Please fix the above errors`);
      }
    }
  };

  // Helper function to get the correct dashboard path
  const getDashboardPath = (role) => {
    switch(role) {
      case "admin":
        return "/admin-dashboard";
      case "student":
        return "/student-dashboard";
      case "staff":
        return "/non_classadvisordashboard";
      case "hodstaff":
        return "/hod_personal-dashboard";
      case "hod":
        return "/hod-dashboard";
      case "principal":
        return "/principal-dashboard";
      case "placement_officer":
        return "/placement-dashboard";
      default:
        return "/error";
    }
  };

  const handleForgotPassword = () => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email to reset password.");
      return;
    }
    setShowForgotPassword(true);
  };

  const handleResetPassword = () => {
    alert(`Password reset link sent to ${email}. Please check your email.`);
    setShowForgotPassword(false);
  };

  return (
    <Box 
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Sri_Shanmugha_College_of_Engineering_and_Technology_entrance.jpg/1200px-Sri_Shanmugha_College_of_Engineering_and_Technology_entrance.jpg")', // Replace with your actual image URL
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
       // Semi-transparent white overlay
          zIndex: 0,
        }
      }}
    >
      <Box sx={{ 
        width: '100%', 
        textAlign: 'center',
        py: 3,
        mb: 2,
        position: 'relative',
        zIndex: 1
      }}>
        <Typography 
          variant="h2" 
          component="div" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            mb: 1
          }}
        >
          Sri Shanmugha Educational Institution
        </Typography>
        <Typography 
          variant="h3" 
          component="div" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 'medium',
            mb: 3
          }}
        >
          Attendance Portal
        </Typography>
      </Box>

      <Container 
        component="main" 
        maxWidth="xs" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flex: 1,
          position: 'relative',
          zIndex: 1
        }}
      >
        <CssBaseline />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={6} 
            sx={{ 
              padding: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.93)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '-30px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 5px 15px rgba(225, 234, 241, 0.4)',
              }}
            >
              <LockIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>

            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                mt: 3,
                mb: 2, 
                fontWeight: 'bold', 
                color: 'primary.main',
                textAlign: 'center'
              }}
            >
              {showForgotPassword ? "Reset Password" : "Sign In"}
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 3, 
                color: 'text.secondary',
                textAlign: 'center'
              }}
            >
              {showForgotPassword 
                ? "Enter your email to reset your password" 
                : "Enter your credentials to access your account"}
            </Typography>
            <Box component="form" noValidate sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {!showForgotPassword && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!passwordError}
                  helperText={passwordError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              {error && (
                <Typography 
                  color="error" 
                  variant="body2" 
                  sx={{ 
                    mt: 2, 
                    textAlign: 'center',
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                    padding: 1,
                    borderRadius: 1
                  }}
                >
                  {error}
                </Typography>
              )}
              
              {!showForgotPassword ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 1 
                }}>
                  <Link 
                    component="button"
                    variant="body2"
                    onClick={() => setShowForgotPassword(true)}
                    sx={{ 
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { 
                        textDecoration: 'underline' 
                      }
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
              ) : null}

              <Button
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2196F3 40%, #21CBF3 100%)',
                  }
                }}
                onClick={showForgotPassword ? handleResetPassword : handleLogin}
              >
                {showForgotPassword ? "Send Reset Link" : "Sign In"}
              </Button>

              {showForgotPassword && (
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;