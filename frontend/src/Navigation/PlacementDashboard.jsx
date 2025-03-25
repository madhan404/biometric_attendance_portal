import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Menu,
  MenuItem,
  Grid,
  Paper,
  Avatar,
  Box,
  Divider,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { ExpandLess, ExpandMore, Person as PersonIcon, Logout as LogoutIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import RequestTable from "../components/Placement/RequestTable";
import PersonalAttendance from "../components/principal/PersonalAttendance";

const userProfile = {
  name: "Arivalagan",
  role: "Placement Officer",
  businessHours: "9 am - 4 pm",
  currentDate: new Date().toLocaleDateString(),
};

const leaves = { atWork: 10, leaveTaken: 33, leaveBalance: 24 };
const utilization = { percentage: "98%", totalWorkingDays: 23, organizationWorkingDays: 23 };

const Dashboard = () => {
  const theme = useTheme();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { logout } = useAuth();
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [selectedContent, setSelectedContent] = useState("dashboard");
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  const handleToggleAttendance = () => {
    setAttendanceOpen((prev) => !prev);
  };
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };
  const handleLogoutConfirm = () => {
    logout();
    navigate("/logout");
  };
  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Placement Dashboard
            </Typography>
            <IconButton onClick={handleProfileMenuOpen} color="inherit">
              <PersonIcon />
            </IconButton>
            <Menu anchorEl={profileAnchorEl} open={Boolean(profileAnchorEl)} onClose={handleProfileMenuClose}>
              <MenuItem onClick={() => { setSelectedContent("profile"); handleProfileMenuClose(); }}>Profile</MenuItem>
              <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 240,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              <ListItem button onClick={() => setSelectedContent("dashboard")}>
                <ListItemText primary="Dashboard" />
              </ListItem>
            
                  <ListItem button sx={{ pl: 4 }} onClick={() => setSelectedContent("personalAttendance")}>
                    <ListItemText primary="Personal Attendance" />
                  </ListItem>
             
              <ListItem button onClick={() => setSelectedContent("requestTable")}>
                <ListItemText primary="Request Table" />
              </ListItem>
              
            </List>
            <Divider />
          </Box>
          <List sx={{ mt: "auto" }}>
            <ListItem button onClick={handleLogoutClick}>
              <LogoutIcon sx={{ mr: 1 }} />
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />

          {/* Show dashboard-specific content only when selectedContent is "dashboard" */}
          {selectedContent === "dashboard" && (
            <>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
                Welcome to the Placement Dashboard
              </Typography>
              <Grid container spacing={3}>
                {/* Profile Section */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ width: 64, height: 64, backgroundColor: theme.palette.primary.main, mr: 2 }}>
                        {userProfile.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {userProfile.name}
                        </Typography>
                        <Typography variant="body1">{userProfile.role}</Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="caption">Business Hours: {userProfile.businessHours}</Typography>
                        <Typography variant="caption">{userProfile.currentDate}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Leave Information */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                      Leave Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="body1">At Work</Typography>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {leaves.atWork}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="body1">Leave Taken</Typography>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {leaves.leaveTaken}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="body1">Leave Balance</Typography>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {leaves.leaveBalance}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Utilization Information */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                      Utilization
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          border: `4px solid ${theme.palette.primary.main}`,
                          mx: "auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                          {utilization.percentage}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        Total Working Days: {utilization.totalWorkingDays}
                      </Typography>
                      <Typography variant="body1">Organization Working Days: {utilization.organizationWorkingDays}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
          
          {selectedContent === "personalAttendance" && <PersonalAttendance />}
          {selectedContent === "requestTable" && <RequestTable />}
        </Box>
      </Box>

      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to logout?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="primary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;
