import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
} from "@mui/material";
import { motion } from "framer-motion";
// import { set } from "../../../../backend/routes/Leavereq";


const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  // const validateEmail =(setEmail)=>{
  //   // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  //   return emailRegex.test(setEmail);
  // }


  // Dummy data for login
  const dummyUsers = [
    {
      email: "student@gmail.com",
      password: "student123",
      role: "student",
    },
    {
      email: "staff@gmail.com",
      password: "staff123",
      role: "staff",
    },
    {
      email: "hod@gmail.com",
      password: "hod123",
      role: "hod",
    },
    {
      email: "principal@gmail.com",
      password: "principal123",
      role: "principal",
    },
    {
      email: "placement@gmail.com",
      password: "placement123",
      role: "placement",
    },
  ];

  const handleLogin = async() => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setError("");

    if (!validateEmail(email)) {
      setEmailError("Invalid email format.");
      isValid = false;
    }

    // if(!validateEmail(setEmail)){
    //   setEmailError("invalid email format");
    //   isValid = false;
    // }

    if (isValid) {
      // const trimmedEmail = email.trim();
      // const trimmedPassword = password.trim();

      // // Check if user exists in dummy data
      // const user = dummyUsers.find(
      //   (user) =>
      //     user.email === trimmedEmail &&
      //     user.password === trimmedPassword
      //     // user.role === role
      // );

      //http://localhost:3001/api/users/login 
      //http://localhost:3002/api
      try{ 
        const response =await fetch("http://localhost:3001/api/users/login",{
          //const response = await fetch("http://localhost:3001/api/users/login", { 
          // const response =await fetch("http://localhost:3001/api",{
          method:"POST",
          headers: {"Content-Type": "application/json"},
          body:JSON.stringify({email,password})
        })
      const data = await response.json();
      // console.log("Login Response:", data);


      // if (user) {
      if(response.ok && data.user){
        sessionStorage.setItem("authToken", "dummyToken123"); // Set a dummy auth token
        sessionStorage.setItem("user", JSON.stringify(data.user));
        onLogin(); // Trigger authentication state change


        let role = data.user.role;
        if (Array.isArray(role)) {
          role = role[0];  // ✅ If role is an array, extract the first role
        } else if (typeof role === "string") {
          try {
            role = JSON.parse(role).roles[0];  // ✅ Handle case where role is a JSON string
          } catch (err) {
            console.error("Error parsing role:", err);
            setError("Invalid role format. Please contact support.");
            return;
          }
        }

        // Role-based routing
        // switch (user.role) {
          if (role) {
        switch(role){
          case "student":
            navigate("/student-dashboard");
            console.log(data.user.student_name);
            console.log(user);

            
            break;
          case "class_advisor":
            navigate("/staff-dashboard");
            break;
          case "hod":
            navigate("/hod-dashboard");
            break;

            // {"roles": ["principal"]}
          case "principal":
            navigate("/principal-dashboard");
            break;

            // {"roles": ["placement_officer"]}
          case "placement_officer":
            navigate("/placement-dashboard");
            break;
          default:
            navigate("/error");
            break;
        }
      }
       else {
        setError(data.message || " Invalid email, password, or role ");
        setError("Invalid role data. Please contact support.");
      }
    }
    } catch(err) {
      setError(`${err} : Please fix the above errors`);
    }
  }
  };

  return (
    // <Box sx={{ flexGrow: 1 }}>
    <Box sx={{ flexGrow: 1,  color: "white", minHeight: "100vh" }}>

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 ,display: "flex", justifyContent: "center" ,font:"bold",fontFamily:"ui-monospace"}}>
            {/* App Title */}
            Biometric Attendance Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(90vh - 64px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ p: 3, borderRadius: 5, width: 400 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ mb: 3 }}
            >
              Login
            </Typography>
            <Box
              component="form"
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                fullWidth
                required
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                fullWidth
                required
              />
              {error && (
                <Typography variant="body2" color="error" align="center">
                  {error}
                </Typography>
              )}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
};

export default LoginPage;