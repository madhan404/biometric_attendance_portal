

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  IconButton,
  Button,
  TextField,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";

const WeeklyAttendance = () => {
  const { sin: initialSin } = useParams();
  const [searchSin, setSearchSin] = useState("");
  const [userDetails, setUserDetails] = useState({ sin: initialSin, name: "" });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  

  const users = {
    "12345": {
      name: "John Doe",
      sin: "12345",
      totalDays: 7,
      presentDays: 5,
      absentDays: 2,
      totalHoursWorked: 38.5,
      dailyData: [
        { date: "2024-09-02", status: "Present", hoursWorked: 8 },
        { date: "2024-09-03", status: "Present", hoursWorked: 7.5 },
        { date: "2024-09-04", status: "Absent", hoursWorked: 0 },
        { date: "2024-09-05", status: "Present", hoursWorked: 8 },
        { date: "2024-09-06", status: "Present", hoursWorked: 8 },
        { date: "2024-09-07", status: "Absent", hoursWorked: 0 },
        { date: "2024-09-08", status: "Present", hoursWorked: 7 },
      ],
    },
    "67890": {
      name: "Jane Smith",
      sin: "67890",
      totalDays: 7,
      presentDays: 6,
      absentDays: 1,
      totalHoursWorked: 42,
      dailyData: [
        { date: "2024-09-02", status: "Present", hoursWorked: 9 },
        { date: "2024-09-03", status: "Present", hoursWorked: 8 },
        { date: "2024-09-04", status: "Absent", hoursWorked: 0 },
        { date: "2024-09-05", status: "Present", hoursWorked: 8 },
        { date: "2024-09-06", status: "Present", hoursWorked: 9 },
        { date: "2024-09-07", status: "Present", hoursWorked: 8 },
        { date: "2024-09-08", status: "Present", hoursWorked: 8 },
      ],
    },
  };

  const defaultData = users[initialSin] || users["12345"];

  const handleSearch = () => {
    const foundUser = Object.values(users).find(
      (user) =>
        user.sin === searchSin || user.name.toLowerCase() === searchSin.toLowerCase()
    );
    if (foundUser) {
      setUserDetails({ sin: foundUser.sin, name: foundUser.name });
    } else {
      alert("User not found!");
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDailyAttendance = () => {
    navigate(`/DailyAttendance/${userDetails.sin}`);
  };
  const handleMonthlyAttendance = () => {
    navigate(`/MonthlyAttendance/${userDetails.sin}`);
  };

  const handleCancel = () => {
    window.location.reload();
  };

  const weeklyData = users[userDetails.sin] || defaultData;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 0 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">
          Weekly Attendance for {weeklyData.name} (SIN: {weeklyData.sin})
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
          <TextField
            label="Enter SIN or Name"
            variant="outlined"
            size="small"
            value={searchSin}
            onChange={(e) => setSearchSin(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Search
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3, width: '500px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDailyAttendance}
          >
            Daily Attendance
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleMonthlyAttendance}
          >
            Monthly Attendance
          </Button>
        </Box>

    {/* Cancel button that resets all form fields */}
    <IconButton
        onClick={handleCancel}
        color="primary"
        aria-label="reset input fields"
        sx={{ padding: 1, marginTop: 0 }}
      >
        <CancelIcon fontSize="large" />
      </IconButton>

        <IconButton onClick={handleMenuOpen} color="primary">
          <Avatar>
            <PersonIcon />
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>Attendance Dashboard</MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Days</Typography>
              <Typography>{weeklyData.totalDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Present Days</Typography>
              <Typography>{weeklyData.presentDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Absent Days</Typography>
              <Typography>{weeklyData.absentDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Hours Worked</Typography>
              <Typography>{weeklyData.totalHoursWorked}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Weekly Hours Worked</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => format(new Date(tick), "dd-MMM")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      format(new Date(label), "dd-MMM-yyyy")
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="hoursWorked"
                    fill="#8884d8"
                    name="Hours Worked"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Daily Breakdown
          </Typography>
          <Grid container spacing={2}>
            {weeklyData.dailyData.map((day) => {
              let bgColor = "";
              switch (day.status) {
                case "Present":
                  bgColor = "#d4edda";
                  break;
                case "Absent":
                  bgColor = "#f8d7da";
                  break;
                default:
                  bgColor = "#fff3cd";
              }

              return (
                <Grid item xs={6} md={3} key={day.date}>
                  <Card sx={{ backgroundColor: bgColor }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Date: {format(new Date(day.date), "dd-MMM-yyyy")}
                      </Typography>
                      <Typography>Status: {day.status}</Typography>
                      <Typography>Hours Worked: {day.hoursWorked}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WeeklyAttendance;