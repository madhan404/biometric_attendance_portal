import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  Menu,
  Box,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Avatar,
  Grid,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Balcony,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Dashboard from "../components/Student/DashboardComponents";
import LeaveApprovalStatus from "../components/Student/LeaveApprovalStatus";
import LeaveApplicationForm from "../components/Student/LeaveApplication";
import WeeklyAttendance from "../components/Student/WeeklyAttendance";
import MonthlyAttendance from "../components/Student/MonthlyAttendance";
// import Profile from "../components/Student/Profile";

import axios from "axios";

const StudentDashboard = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Dashboard");
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profileAnchorEl, setProfileAnchorEl] = React.useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  // **Step 1: Initialize User Data State**
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Fetch user data from session storage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <Typography>Loading...</Typography>;
  }
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const response = await axios.post("http://localhost:3001/api/users/login"); // Adjust URL if needed
  //       setUser(response.data);
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //       navigate("/"); // Redirect to login if the data fetch fails
  //     }
  //   };

  //   document.title = "SSCEI - Student Dashboard";
  //   fetchUserData();
  // }, [navigate]);


  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleTabClick = (tab) => () => {
    setActiveTab(tab);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
    setActiveTab("Profile");
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/");
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const emailPrefix = user?.email ? user.email.split("@")[0] : "";

  // Mock student profile data
  const studentProfile = {
    photo: "https://imgcdn.stablediffusionweb.com/2024/3/16/38c3fa8a-c7c1-46ef-86a9-cbf4680fc9c3.jpg", // Replace with actual photo URL
    studentName: "Mr.Kakashi Hatake",
    sinNumber: "E21CS028",
    gender: "Male",
    email: user?.email || "Kakashi@gmail.com",
    phoneNumber: "9834567890",
    address: "123, kakashi Lane, Taiwan Town, china",
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: "#00796b",
          color: "white",
          height: "64px",
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer(true)}
              sx={{ marginRight: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {/* <Typography variant="h6" style={{ color: "black", paddingRight: 15 }}>
            {emailPrefix}
          </Typography> */}
          <Box sx={{ flexGrow: 1 }} /> 
          <IconButton
            edge="end"
            color="inherit"
            aria-label="profile"
            onClick={handleProfileClick}
          >
            <PersonIcon />
          </IconButton>
        </Toolbar>
      </AppBar>


      
      {!isDesktop && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          sx={{
            width: 240,
            flexShrink: 0,
            zIndex: theme.zIndex.drawer,
            "& .MuiDrawer-paper": {
              width: 240,
              boxSizing: "border-box",
              backgroundColor: "#e0f2f1",
            },
          }}
        >
          <List sx={{ pt: 8 }}>
            <ListItem
              button
              selected={activeTab === "Dashboard"}
              onClick={handleTabClick("Dashboard")}
              sx={{
                bgcolor:
                  activeTab === "Dashboard"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem
              button
              selected={activeTab === "WeeklyAttendance"}
              onClick={handleTabClick("WeeklyAttendance")}
              sx={{
                bgcolor:
                  activeTab === "WeeklyAttendance"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="WeeklyAttendance" />
            </ListItem>
            <ListItem
              button
              selected={activeTab === "MonthlyAttendance"}
              onClick={handleTabClick("MonthlyAttendance")}
              sx={{
                bgcolor:
                  activeTab === "MonthlyAttendance"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="MonthlyAttendance" />
            </ListItem>
            <ListItem
              button
              selected={activeTab === "LeaveStatus"}
              onClick={handleTabClick("LeaveStatus")}
              sx={{
                bgcolor:
                  activeTab === "LeaveStatus"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="LeaveStatus" />
            </ListItem>
            <ListItem
              button
              selected={activeTab === "LeaveRequestForm"}
              onClick={handleTabClick("LeaveRequestForm")}
              sx={{
                bgcolor:
                  activeTab === "LeaveRequestForm"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="LeaveRequestForm" />
            </ListItem>
          </List>
          <Divider />
          <List sx={{ mt: "auto" }}>
            <ListItem button onClick={handleLogoutClick}>
              <LogoutIcon sx={{ mr: 1 }} />
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          variant="persistent"
          anchor="left"
          open={true}
          sx={{
            width: 240,
            flexShrink: 0,
            zIndex: theme.zIndex.drawer,
            "& .MuiDrawer-paper": {
              width: 240,
              boxSizing: "border-box",
              backgroundColor: "#e0f2f1",
            },
          }}
        >
          <List sx={{ pt: 8 }}>
            <ListItem
              button
              selected={activeTab === "Dashboard"}
              onClick={handleTabClick("Dashboard")}
              sx={{
                bgcolor:
                  activeTab === "Dashboard"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem
              button
              selected={activeTab === "WeeklyAttendance"}
              onClick={handleTabClick("WeeklyAttendance")}
              sx={{
                bgcolor:
                  activeTab === "WeeklyAttendance"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="WeeklyAttendance" />
            </ListItem>
            <ListItem
              button
              selected={activeTab === "MonthlyAttendance"}
              onClick={handleTabClick("MonthlyAttendance")}
              sx={{
                bgcolor:
                  activeTab === "MonthlyAttendance"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="MonthlyAttendance" />
            </ListItem>
            <ListItem
              button
              selected={activeTab === "LeaveStatus"}
              onClick={handleTabClick("LeaveStatus")}
              sx={{
                bgcolor:
                  activeTab === "LeaveStatus"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="LeaveStatus" />
            </ListItem>
            <ListItem
              button
              selected={activeTab === "LeaveRequestForm"}
              onClick={handleTabClick("LeaveRequestForm")}
              sx={{
                bgcolor:
                  activeTab === "LeaveRequestForm"
                    ? theme.palette.action.selected
                    : "transparent",
              }}
            >
              <ListItemText primary="LeaveRequestForm" />
            </ListItem>
          </List>
          <Divider />
          <List sx={{ mt: "auto" }}>
            <ListItem button onClick={handleLogoutClick}>
              <LogoutIcon sx={{ mr: 1 }} />
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: "64px", // Ensure content starts below the AppBar
          marginLeft: { xs: 0, md: "240px" }, // Shift content based on Drawer width
          // backgroundColor: "#fafafa", // Light background for content area
        }}
      >
        {activeTab === "Dashboard" && <Dashboard />}
        {activeTab === "WeeklyAttendance" && <WeeklyAttendance />}
        {activeTab === "MonthlyAttendance" && <MonthlyAttendance />}
        {activeTab === "LeaveStatus" && <LeaveApprovalStatus />}
        {activeTab === "LeaveRequestForm" && <LeaveApplicationForm />}
        {/* {activeTab === "Profile" && <Profile user={user} />} */}
      </Box>

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={handleProfileDialogClose}>
        <DialogTitle>Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
            <Avatar
              src={user.photo}
              alt="Student Photo"
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Typography variant="h6">{user.student_name }</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>SIN Number:</strong> {user.sin_number}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Gender:</strong> {user.gender}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Department:</strong> {user.department}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Year:</strong> {user.year}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Email:</strong> {user.email}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Phone:</strong> {user.phone}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Address:</strong> {user.address}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProfileDialogClose} color="primary">
            Close
          </Button>
          <Button onClick={handleLogoutClick} color="primary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">{"Logout"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentDashboard;