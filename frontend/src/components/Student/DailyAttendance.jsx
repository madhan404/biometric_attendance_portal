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

const DailyAttendance = () => {
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
      presentDays: 25,
      absentDays: 5,
      totalHoursWorked: 180,
      dailyData: [
        {
          date: "2024-08-01",
          hourlyData: [
            { hour: "09:00", status: "Present", hoursWorked: 1 },
            { hour: "10:00", status: "Present", hoursWorked: 1 },
            { hour: "11:00", status: "Absent", hoursWorked: 0 },
            { hour: "12:00", status: "Present", hoursWorked: 1 },
            { hour: "13:00", status: "Present", hoursWorked: 1 },
            { hour: "14:00", status: "Absent", hoursWorked: 0 },
            { hour: "15:00", status: "Present", hoursWorked: 1 },
            { hour: "16:00", status: "Present", hoursWorked: 1 },
            { hour: "17:00", status: "Absent", hoursWorked: 0 },
          ],
        },
      ],
    },
    "67890": {
      name: "Jane Smith",
      sin: "67890",
      totalDays: 30,
      presentDays: 28,
      absentDays: 2,
      totalHoursWorked: 190,
      dailyData: [
        {
          date: "2024-08-01",
          hourlyData: [
            { hour: "09:00", status: "Present", hoursWorked: 1 },
            { hour: "10:00", status: "Present", hoursWorked: 1 },
            { hour: "11:00", status: "Present", hoursWorked: 1 },
            { hour: "12:00", status: "Absent", hoursWorked: 0 },
            { hour: "13:00", status: "Present", hoursWorked: 1 },
            { hour: "14:00", status: "Present", hoursWorked: 1 },
            { hour: "15:00", status: "Present", hoursWorked: 1 },
            { hour: "16:00", status: "Absent", hoursWorked: 0 },
            { hour: "17:00", status: "Absent", hoursWorked: 0 },
          ],
        },
      ],
    },
  };

  const defaultData = users[initialSin] || users["12345"];
  const [selectedDate] = defaultData.dailyData;

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

  const handleWeeklyAttendance = () => {
    navigate(`/WeeklyAttendance/${userDetails.sin}`);
  };

  const handleMonthlyAttendance = () => {
    navigate(`/MonthlyAttendance/${userDetails.sin}`);
  };

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  const hourlyData = selectedDate ? selectedDate.hourlyData : [];

  // Get the current date
  const currentDate = format(new Date(), "dd-MMM-yyyy");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 3 }}>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Current Date: {currentDate}</Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">
          Daily Attendance for {defaultData.name} (SIN: {defaultData.sin}) 
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
            onClick={handleWeeklyAttendance}
          >
            Weekly Attendance
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleMonthlyAttendance}
          >
            Monthly Attendance
          </Button>
        </Box>

        <IconButton
          onClick={handleCancel}
          color="primary"
          aria-label="cancel"
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
              <Typography>{defaultData.totalDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Present Days</Typography>
              <Typography>{defaultData.presentDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Absent Days</Typography>
              <Typography>{defaultData.absentDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Hours Worked</Typography>
              <Typography>{defaultData.totalHoursWorked}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Hourly Breakdown</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hoursWorked" fill="#8884d8" name="Hours Worked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Detailed Hourly Attendance
          </Typography>
          <Grid container spacing={2}>
            {hourlyData.map((hour) => {
              let bgColor = hour.status === "Present" ? "#d4edda" : "#f8d7da";
              return (
                <Grid item xs={6} md={3} key={hour.hour}>
                  <Card sx={{ backgroundColor: bgColor }}>
                    <CardContent>
                      <Typography>Hour: {hour.hour}</Typography>
                      <Typography>Status: {hour.status}</Typography>
                      <Typography>Hours Worked: {hour.hoursWorked}</Typography>
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

export default DailyAttendance;
