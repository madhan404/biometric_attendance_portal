import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Divider,
  useTheme,
} from "@mui/material";

const utilization = {
  percentage: "75%",
  totalWorkingDays: 20,
  organizationWorkingDays: 25,
};

const actions = [
  { date: "2024-09-10", message: "Completed project X" },
  { date: "2024-09-12", message: "Participated in team meeting" },
];

const DashboardComponents = () => {
  const theme = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState(new Date().toLocaleString());
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentDateTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
        {user.role} Dashboard
      </Typography>

      <Grid container spacing={2}>
        {/* Profile Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ width: 64, height: 64, backgroundColor: theme.palette.primary.main, mr: 2 }}>
                {user.student_name ? user.student_name.charAt(0).toUpperCase() : "U"}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {user.student_name || "maari"}
                </Typography>
                <Typography variant="body1">{user.role}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.department || "Department Not Available"}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" display="block">
                  Email: {user.email}
                </Typography>
                <Typography variant="caption" display="block">
                  {currentDateTime}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Leave Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Leave Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="body1">At Work</Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {user.atWork || 10}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="body1">Leave Taken</Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {user.leaveTaken || 5}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="body1">Leave Balance</Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {user.leaveBalance || 15}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>


                {/* Utilization */}
                <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 1.8, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Utilization
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: "center" }}>
                  <Typography
                  variant="body1"
                  sx={{ mt: 2, color: theme.palette.text.secondary }}
                >
                    Total Present Hours 
                </Typography>
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

                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  {user.presenthours ||utilization.percentage}
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{ mt: 2, color: theme.palette.text.secondary }}
              >
                Total Working Days: {user.totalWorkingDays || utilization.totalWorkingDays}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary }}
              >
                Organization Working Days: { user.organizationWorkingDays ||  utilization.organizationWorkingDays}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Actions */}
        <Grid item xs={6}>
          <Paper elevation={4} sx={{ p: 8.5, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Recent Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {actions.map((action, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{user.actiondate || action.date}:</strong> {user.actionmessage || action.message}
                </Typography>
                {index !== actions.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </Paper>
        </Grid>


      </Grid>
    </Box>
  );
};

export default DashboardComponents;
