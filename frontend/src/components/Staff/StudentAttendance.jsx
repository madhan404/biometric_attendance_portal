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

// const StudentAttendance = () => {
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
//           { UserId: 1011 }
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

// export default StudentAttendance;



import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
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
import { format, getDay, differenceInHours, eachDayOfInterval } from "date-fns";

const StudentAttendance = () => {
  const { UserId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState(UserId || ""); // State for search input

  useEffect(() => {
    if (searchId) {
      fetchData(searchId);
    }
  }, [searchId]);

  const fetchData = async (id) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:3001/api/attendance/attendance-month`,
        { UserId: id }
      );

      if (response.data.status === 200) {
        setAttendanceData(response.data.data.user);
        setError();
      } else {
        setError("Failed to fetch data");
      }
    } catch (err) {
      setError("Error fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total hours worked and daily attendance
  const calculateAttendance = (data) => {
    let totalHours = 0;
    let presentDaysCount = 0;
    let absentDaysCount = 0;
    const dailyData = {};
    const logsByDate = {};

    // Group logs by date
    data.forEach((entry) => {
      const date = format(new Date(entry.LogDate), "yyyy-MM-dd");
      if (!logsByDate[date]) logsByDate[date] = [];
      logsByDate[date].push(entry);
    });

    // Calculate hours worked and prepare daily data
    Object.keys(logsByDate).forEach((date) => {
      const logs = logsByDate[date];
      let inTime = null;
      let dayTotalHours = 0;

      logs.forEach((log) => {
        if (log.C1 === "in") {
          inTime = new Date(log.LogDate);
        } else if (log.C1 === "out" && inTime) {
          const outTime = new Date(log.LogDate);
          // Calculate hours worked for this session
          dayTotalHours += differenceInHours(outTime, inTime);
          inTime = null; // Reset inTime after pairing
        }
      });

      // Store the total hours worked for that day
      dailyData[date] = {
        date,
        status: logs.length > 0 ? "Present" : "Absent",
        hoursWorked: dayTotalHours.toFixed(2),
      };

      // Count present and absent days
      if (logs.length > 0) {
        presentDaysCount += 1;
      } else {
        absentDaysCount += 1;
      }

      totalHours += dayTotalHours; // Accumulate total hours
    });

    return {
      totalHours: totalHours.toFixed(2),
      dailyData,
      presentDaysCount,
      absentDaysCount,
    };
  };

  // Generate all dates in the month and mark absent days
  const generateMonthlyAttendance = (dailyData) => {
    const startDate = new Date("2024-08-01"); // Adjust this to your required month/year
    const endDate = new Date("2024-08-31");
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return allDays
      .map((day) => {
        const dateString = format(day, "yyyy-MM-dd");
        const dayOfWeek = getDay(day);

        if (dayOfWeek === 0) return null; // Skip Sundays

        return {
          date: dateString,
          status: dailyData[dateString]?.status || "Absent",
          hoursWorked: dailyData[dateString]?.hoursWorked || "0.00",
        };
      })
      .filter(Boolean); // Remove Sundays
  };

  const { totalHours, dailyData, presentDaysCount, absentDaysCount } =
    calculateAttendance(attendanceData);
  const monthlyData = generateMonthlyAttendance(dailyData);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 3 }}>
      <Typography variant="h5">Monthly Attendance</Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="Enter User ID"
          variant="outlined"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <Button variant="contained" onClick={() => fetchData(searchId)}>
          Search
        </Button>
      </Box>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={2}>
        {/* Metrics Cards */}
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Working Days</Typography>
              <Typography>{monthlyData.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Present Days</Typography>
              <Typography>{presentDaysCount}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Absent Days</Typography>
              <Typography>{absentDaysCount}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Hours Worked Card */}
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Hours Worked</Typography>
              <Typography>{totalHours}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Hours Worked Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Monthly Hours Worked</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
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

          {/* Daily Breakdown */}
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Daily Breakdown
          </Typography>
          <Grid container spacing={2}>
            {monthlyData.map((day) => (
              <Grid item xs={6} md={3} key={day.date}>
                <Card
                  sx={{
                    backgroundColor:
                      day.status === "Present" ? "#d4edda" : "#f8d7da",
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1">
                      Date: {format(new Date(day.date), "dd-MMM-yyyy")}
                    </Typography>
                    <Typography>Status: {day.status}</Typography>
                    <Typography>Hours Worked: {day.hoursWorked}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentAttendance;