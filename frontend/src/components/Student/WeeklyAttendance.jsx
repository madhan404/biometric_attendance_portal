import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
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
import axios from "axios";

const WeeklyAttendance = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch weekly attendance data
  useEffect(() => {
    const fetchWeeklyAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post("http://localhost:3001/api/attendance/attendance-week", {
          UserId: user.sin_number,
          startDate: "2024-08-15", // Replace with dynamic start date
          endDate: "2024-08-21",   // Replace with dynamic end date
        });
        console.log("Weekly Attendance Data:", response.data.data);
        setWeeklyData(response.data.data);
      } catch (err) {
        setError("Failed to fetch weekly attendance data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.sin_number) {
      fetchWeeklyAttendance();
    }
  }, [user?.sin_number]);

  useEffect(() => {
    // Fetch user data from session storage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!weeklyData) {
    return <Typography>No data available.</Typography>;
  }

  // Calculate total working days, present days, and absent days
  const totalWorkingDays = weeklyData.length; // Total days in the date range
  const presentDays = weeklyData.filter((day) => day.AttendanceStatus === "Present").length;
  const absentDays = totalWorkingDays - presentDays;

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
          Weekly Attendance for {user?.student_name} (SIN: {user?.sin_number})
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Working Days</Typography>
              <Typography>{totalWorkingDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Present Days</Typography>
              <Typography>{presentDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Absent Days</Typography>
              <Typography>{absentDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Hours Worked</Typography>
              <Typography>
                {weeklyData
                  .map((day) => {
                    const [hours, minutes, seconds] = day.HoursWorked.split(":");
                    return parseFloat(hours) + parseFloat(minutes) / 60;
                  })
                  .reduce((sum, hours) => sum + hours, 0)
                  .toFixed(2)} hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Weekly Hours Worked</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={weeklyData.map((day) => ({
                    date: day.AttendanceDate,
                    hoursWorked: parseFloat(day.HoursWorked.split(":")[0]) + parseFloat(day.HoursWorked.split(":")[1]) / 60,
                  }))}
                >
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
            {weeklyData.map((day) => {
              let bgColor = day.AttendanceStatus === "Present" ? "#d4edda" : "#f8d7da"; // Green for present, red for absent

              return (
                <Grid item xs={6} md={3} key={day.AttendanceDate}>
                  <Card sx={{ backgroundColor: bgColor }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Date: {format(new Date(day.AttendanceDate), "dd-MMM-yyyy")}
                      </Typography>
                      <Typography>
                        Status: {day.AttendanceStatus}
                      </Typography>
                      <Typography>Hours Worked: {day.HoursWorked}</Typography>
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