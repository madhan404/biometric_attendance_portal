// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { Card, CardContent, Typography, Box, Grid } from "@mui/material";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { format, getDay, differenceInHours, eachDayOfInterval } from "date-fns";

// const MonthlyAttendance = () => {
//   const { UserId } = useParams();
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.post(
//           `http://localhost:3001/api/attendance/attendance-month`,
//           { UserId: user.sin_number,
            
//            }
//         );

//         if (response.data.status === 200) {
//           setAttendanceData(response.data.data.user);
//         } else {
//           setError("Failed to fetch data");
//         }
//       } catch (err) {
//         setError("Error fetching data");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [UserId]);

//   // Calculate total hours worked and daily attendance
//   const calculateAttendance = (data) => {
//     let totalHours = 0;
//     let presentDaysCount = 0;
//     let absentDaysCount = 0;
//     const dailyData = {};
//     const logsByDate = {};

//     // Group logs by date
//     data.forEach((entry) => {
//       const date = format(new Date(entry.LogDate), "yyyy-MM-dd");
//       if (!logsByDate[date]) logsByDate[date] = [];
//       logsByDate[date].push(entry);
//     });

//     // Calculate hours worked and prepare daily data
//     Object.keys(logsByDate).forEach((date) => {
//       const logs = logsByDate[date];
//       let inTime = null;
//       let dayTotalHours = 0;

//       logs.forEach((log) => {
//         if (log.C1 === "in") {
//           inTime = new Date(log.LogDate);
//         } else if (log.C1 === "out" && inTime) {
//           const outTime = new Date(log.LogDate);
//           // Calculate hours worked for this session
//           dayTotalHours += differenceInHours(outTime, inTime);
//           inTime = null; // Reset inTime after pairing
//         }
//       });

//       // Store the total hours worked for that day
//       dailyData[date] = {
//         date,
//         status: logs.length > 0 ? "Present" : "Absent",
//         hoursWorked: dayTotalHours.toFixed(2),
//       };

//       // Count present and absent days
//       if (logs.length > 0) {
//         presentDaysCount += 1;
//       } else {
//         absentDaysCount += 1;
//       }

//       totalHours += dayTotalHours; // Accumulate total hours
//     });

//     return {
//       totalHours: totalHours.toFixed(2),
//       dailyData,
//       presentDaysCount,
//       absentDaysCount,
//     };
//   };

//   // Generate all dates in the month and mark absent days
//   const generateMonthlyAttendance = (dailyData) => {
//     const startDate = new Date("2024-08-01"); // Adjust this to your required month/year
//     const endDate = new Date("2024-08-31");
//     const allDays = eachDayOfInterval({ start: startDate, end: endDate });

//     return allDays
//       .map((day) => {
//         const dateString = format(day, "yyyy-MM-dd");
//         const dayOfWeek = getDay(day);

//         if (dayOfWeek === 0) return null; // Skip Sundays

//         return {
//           date: dateString,
//           status: dailyData[dateString]?.status || "Absent",
//           hoursWorked: dailyData[dateString]?.hoursWorked || "0.00",
//         };
//       })
//       .filter(Boolean); // Remove Sundays
//   };

//   const { totalHours, dailyData, presentDaysCount, absentDaysCount } =
//     calculateAttendance(attendanceData);
//   const monthlyData = generateMonthlyAttendance(dailyData);

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 3 }}>
//       <Typography variant="h5">Monthly Attendance</Typography>

//       {loading && <Typography>Loading...</Typography>}
//       {error && <Typography color="error">{error}</Typography>}

//       <Grid container spacing={2}>
//         {/* Metrics Cards */}
//         <Grid item xs={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Total Working Days</Typography>
//               <Typography>{monthlyData.length}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Present Days</Typography>
//               <Typography>{presentDaysCount}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Absent Days</Typography>
//               <Typography>{absentDaysCount}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Total Hours Worked Card */}
//         <Grid item xs={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Total Hours Worked</Typography>
//               <Typography>{totalHours}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Monthly Hours Worked Chart */}
//         <Grid item xs={12}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Monthly Hours Worked</Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={monthlyData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis
//                     dataKey="date"
//                     tickFormatter={(tick) => format(new Date(tick), "dd-MMM")}
//                   />
//                   <YAxis />
//                   <Tooltip
//                     labelFormatter={(label) =>
//                       format(new Date(label), "dd-MMM-yyyy")
//                     }
//                   />
//                   <Legend />
//                   <Bar
//                     dataKey="hoursWorked"
//                     fill="#8884d8"
//                     name="Hours Worked"
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Daily Breakdown */}
//           <Typography variant="h6" sx={{ marginTop: 2 }}>
//             Daily Breakdown
//           </Typography>
//           <Grid container spacing={2}>
//             {monthlyData.map((day) => (
//               <Grid item xs={6} md={3} key={day.date}>
//                 <Card
//                   sx={{
//                     backgroundColor:
//                       day.status === "Present" ? "#d4edda" : "#f8d7da",
//                   }}
//                 >
//                   <CardContent>
//                     <Typography variant="subtitle1">
//                       Date: {format(new Date(day.date), "dd-MMM-yyyy")}
//                     </Typography>
//                     <Typography>Status: {day.status}</Typography>
//                     <Typography>Hours Worked: {day.hoursWorked}</Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default MonthlyAttendance;



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

const MonthlyAttendance = () => {
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
        const response = await axios.post("http://localhost:3001/api/attendance/attendance-month", {
          UserId: user.sin_number,
          // startDate: "2024-08-01", // Replace with dynamic start date
          // endDate: "2024-08-07",   // Replace with dynamic end date
        });
        console.log("Monthly Attendance Data:", response.data.data);
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

export default MonthlyAttendance;