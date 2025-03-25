import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, Typography, Box, Grid } from "@mui/material";
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
import { format, differenceInMinutes } from "date-fns";
import axios from "axios"; // Import Axios

const WeeklyAttendance = () => {
  const { UserId } = useParams();
  const [weeklyData, setWeeklyData] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    totalHoursWorked: 0,
    dailyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // if (!UserId) return; // Ensure UserId is available

    setLoading(true); // Start loading

    // Using Axios to make a POST request
    const data = axios
      .post("http://localhost:3001/api/attendance/attendance-week", {
        UserId: 1011, // Use the UserId from params
      })
      .then((response) => {
        console.log("The respone is", response);
        if (response.data.status === 200) {
          const processedData = processAttendanceData(response.data.data);
          setWeeklyData(processedData);
        } else {
          setError("Failed to fetch attendance data.");
        }
      })
      .catch((error) => {
        console.error("Error fetching attendance data:", error);
        setError("An error occurred while fetching data.");
      })
      .finally(() => {
        setLoading(false); // End loading
      });
    console.log(data);
  }, [UserId]);

  // Process API response to calculate hours worked and group by date
  const processAttendanceData = (data) => {
    const dailyDataMap = {};

    data.forEach((entry) => {
      const date = format(new Date(entry.LogDate), "yyyy-MM-dd");
      const time = new Date(entry.LogDate);

      if (!dailyDataMap[date]) {
        dailyDataMap[date] = { date, in: null, out: null, hoursWorked: 0 };
      }

      if (entry.C1 === "in") {
        dailyDataMap[date].in = time;
      } else if (entry.C1 === "out") {
        dailyDataMap[date].out = time;
      }
    });

    const dailyData = Object.values(dailyDataMap).map((day) => {
      if (day.in && day.out) {
        const workedMinutes = differenceInMinutes(day.out, day.in);
        day.hoursWorked = (workedMinutes / 60).toFixed(2);
      }
      return {
        date: day.date,
        status: day.in && day.out ? "Present" : "Absent",
        hoursWorked: parseFloat(day.hoursWorked),
      };
    });

    const totalHoursWorked = dailyData.reduce(
      (sum, day) => sum + day.hoursWorked,
      0
    );
    const presentDays = dailyData.filter(
      (day) => day.status === "Present"
    ).length;
    const totalDays = dailyData.length;
    const absentDays = totalDays - presentDays;

    return {
      totalDays,
      presentDays,
      absentDays,
      totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
      dailyData,
    };
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 0 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Weekly Attendance</Typography>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
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
      )}
    </Box>
  );
};

export default WeeklyAttendance;
