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
import { format, getDay } from "date-fns"; 
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";

const MonthlyAttendance = () => {
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
      totalDays: 30,
      presentDays: 24,
      absentDays: 6,
      totalHoursWorked: 180,
      dailyData: Array.from({ length: 30 }, (_, index) => ({
        date: `2024-09-${String(index + 1).padStart(2, "0")}`,
        status: index % 2 === 0 ? "Present" : "Absent",
        hoursWorked: index % 2 === 0 ? (8 + Math.random() * 2).toFixed(2) : 0,
      })),
    },
    "67890": {
      name: "Jane Smith",
      sin: "67890",
      totalDays: 30,
      presentDays: 27,
      absentDays: 3,
      totalHoursWorked: 220,
      dailyData: Array.from({ length: 30 }, (_, index) => ({
        date: `2024-09-${String(index + 1).padStart(2, "0")}`,
        status: index % 2 === 0 ? "Present" : "Absent",
        hoursWorked: index % 2 === 0 ? (8 + Math.random() * 2).toFixed(2) : 0,
      })),
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
  const handleWeeklyAttendance = () => {
    navigate(`/WeeklyAttendance/${userDetails.sin}`);
  };

  const handleCancel = () => {
    navigate(-1); 
  };

  const monthlyData = users[userDetails.sin] || defaultData;

  // Update dailyData to ensure an alternating pattern of present and absent
  const alternatingData = monthlyData.dailyData.map((day, index) => ({
    ...day,
    status: index % 2 === 0 ? "Present" : "Absent",
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">
          Monthly Attendance for {monthlyData.name} (SIN: {monthlyData.sin})
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Search by SIN or Name"
            variant="outlined"
            size="small"
            value={searchSin}
            onChange={(e) => setSearchSin(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Search
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            onClick={handleWeeklyAttendance}
          >
            Weekly Attendance
          </Button>
        </Box>

        <IconButton
          onClick={handleCancel}
          color="primary"
          aria-label="reset page"
          sx={{ padding: 1 }}
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
              <Typography>{monthlyData.totalDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Present Days</Typography>
              <Typography>{monthlyData.presentDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Absent Days</Typography>
              <Typography>{monthlyData.absentDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Hours Worked</Typography>
              <Typography>{monthlyData.totalHoursWorked}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Monthly Hours Worked</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData.dailyData}>
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
            {alternatingData.map((day) => {
              const dayOfWeek = getDay(new Date(day.date)); // Get the day of the week
              const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              let bgColor = "";
              switch (day.status) {
                case "Present":
                  bgColor = "#d4edda"; // Light green for present
                  break;
                case "Absent":
                  bgColor = "#f8d7da"; // Light red for absent
                  break;
                default:
                  bgColor = "#fff3cd"; // Default yellow
              }

              return (
                <Grid item xs={6} md={3} key={day.date}>
                  <Card sx={{ backgroundColor: bgColor }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Date: {format(new Date(day.date), "dd-MMM-yyyy")} ({dayNames[dayOfWeek]})
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

export default MonthlyAttendance;
