// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Box, Typography, Paper, Grid, useTheme, LinearProgress,
//   Table, TableBody, TableCell, TableContainer, TableHead,
//   TableRow, Chip, Avatar, TextField, Stack, Button, InputLabel,
//   FormControl, Select, MenuItem
// } from '@mui/material';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
//   LineChart, Line, CartesianGrid, Legend, Label
// } from 'recharts';
// import axios from 'axios';
// import { green, red, orange, blue, deepPurple } from '@mui/material/colors';

// const formatHours = (decimalHours) => {
//   if (!decimalHours) return '0h 0m';
//   if (typeof decimalHours === 'string') {
//     const [hours, minutes] = decimalHours.split(':').map(Number);
//     return `${hours}h ${minutes}m`;
//   }
//   const hours = Math.floor(decimalHours);
//   const minutes = Math.round((decimalHours - hours) * 60);
//   return `${hours}h ${minutes}m`;
// };

// const AttendanceDashboard = () => {
//   const [viewMode, setViewMode] = useState('dateRange');
//   const [weeklyData, setWeeklyData] = useState([]);
//   const [monthlyData, setMonthlyData] = useState([]);
//   const [weeklySummaryData, setWeeklySummaryData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const theme = useTheme();

//   const [weeklyDateRange, setWeeklyDateRange] = useState({
//     start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//     end: new Date()
//   });
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedWeek, setSelectedWeek] = useState({
//     year: new Date().getFullYear(),
//     week: Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
//   });

//   const statusColors = {
//     present: green[500],
//     absent: red[500],
//     average: orange[500],
//     total: blue[500],
//     rate: deepPurple[500]
//   };

//   const formatDateForAPI = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   const formatDateForDisplay = (dateStr, formatType = 'short') => {
//     const date = new Date(dateStr);
//     if (formatType === 'weekday') {
//       return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
//     }
//     return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
//   };

//   useEffect(() => {
//     const storedUser = sessionStorage.getItem("user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const fetchWeeklySummaryData = async (year, month) => {
//     try {
//       const response = await axios.post("http://localhost:3001/api/attendance/attendance-weekly", {
//         UserId: user.sin_number,
//         year,
//         month
//       });
//       setWeeklySummaryData(response.data.data);
//     } catch (err) {
//       setError("Failed to fetch weekly summary data.");
//       console.error(err);
//     }
//   };

//   const fetchAttendanceData = async () => {
//     if (!user?.sin_number) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const weeklyResponse = await axios.post("http://localhost:3001/api/attendance/attendance-week", {
//         UserId: user.sin_number,
//         startDate: formatDateForAPI(weeklyDateRange.start),
//         endDate: formatDateForAPI(weeklyDateRange.end),
//       });
//       setWeeklyData(weeklyResponse.data.data);

//       const monthlyResponse = await axios.post("http://localhost:3001/api/attendance/attendance-year", {
//         UserId: user.sin_number,
//         year: selectedYear
//       });
//       setMonthlyData(monthlyResponse.data.data);

//       await fetchWeeklySummaryData(selectedYear, selectedMonth);
//     } catch (err) {
//       setError("Failed to fetch attendance data.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendanceData();
//   }, [user?.sin_number]);

//   const weeklyStats = useMemo(() => {
//     const totalDays = weeklyData.length;
//     const presentDays = weeklyData.filter(day => day.AttendanceStatus === 'Present').length;
//     const attendancePercentage = totalDays ? (presentDays / totalDays * 100).toFixed(2) : 0;

//     const totalHours = weeklyData.reduce((sum, day) => {
//       if (day.HoursWorked) {
//         const [hours, minutes] = day.HoursWorked.split(':').map(Number);
//         return sum + hours + (minutes / 60);
//       }
//       return sum;
//     }, 0);

//     return {
//       presentDays,
//       totalDays,
//       attendancePercentage,
//       averageHoursPerDay: (totalHours / presentDays || 0).toFixed(2),
//       totalHours: totalHours.toFixed(2),
//       totalHoursFormatted: formatHours(totalHours)
//     };
//   }, [weeklyData]);

//   const monthlyStats = useMemo(() => {
//     if (!monthlyData.length) return null;

//     const presentDays = monthlyData.reduce((sum, month) => sum + month.presentDays, 0);
//     const totalDays = monthlyData.reduce((sum, month) => sum + month.totalDays, 0);
//     const attendancePercentage = totalDays ? (presentDays / totalDays * 100).toFixed(2) : 0;

//     const totalHours = monthlyData.reduce((sum, month) => {
//       if (month.hoursWorked) {
//         const [hours, minutes] = month.hoursWorked.split(':').map(Number);
//         return sum + hours + (minutes / 60);
//       }
//       return sum;
//     }, 0);

//     return {
//       presentDays,
//       totalDays,
//       attendancePercentage,
//       averageHoursPerDay: (totalHours / presentDays || 0).toFixed(2),
//       totalHours: totalHours.toFixed(2),
//       totalHoursFormatted: formatHours(totalHours)
//     };
//   }, [monthlyData]);

//   const weeklySummaryStats = useMemo(() => {
//     if (!weeklySummaryData.length) return null;

//     const presentWeeks = weeklySummaryData.filter(week => week.status === 'Present').length;
//     const totalWeeks = weeklySummaryData.length;

//     const totalHours = weeklySummaryData.reduce((sum, week) => {
//       if (week.hoursWorked) {
//         const [hours, minutes] = week.hoursWorked.split(':').map(Number);
//         return sum + hours + (minutes / 60);
//       }
//       return sum;
//     }, 0);

//     return {
//       presentWeeks,
//       totalWeeks,
//       attendancePercentage: totalWeeks ? (presentWeeks / totalWeeks * 100).toFixed(2) : 0,
//       averageHoursPerWeek: (totalHours / totalWeeks || 0).toFixed(2),
//       totalHours: totalHours.toFixed(2),
//       totalHoursFormatted: formatHours(totalHours)
//     };
//   }, [weeklySummaryData]);

//   const monthlyChartData = useMemo(() => {
//     if (!monthlyData.length) return [];

//     return monthlyData.map(month => ({
//       month: new Date(selectedYear, month.month - 1, 1).toLocaleString('default', { month: 'short' }),
//       attendancePercentage: parseFloat(month.attendancePercentage),
//       presentDays: month.presentDays,
//       totalDays: month.totalDays,
//       hoursWorked: month.hoursWorked,
//       totalHours: month.hoursWorked ? parseFloat(month.hoursWorked.split(':')[0]) +
//         parseFloat(month.hoursWorked.split(':')[1]) / 60 : 0
//     }));
//   }, [monthlyData, selectedYear]);

//   const weeklyChartData = useMemo(() => {
//     return weeklyData.map(day => ({
//       date: formatDateForDisplay(day.AttendanceDate, 'weekday'),
//       hours: day.HoursWorked ? parseFloat(day.HoursWorked.split(':')[0]) +
//         parseFloat(day.HoursWorked.split(':')[1]) / 60 : 0,
//       status: day.AttendanceStatus === 'Present' ? 'Present' : 'Absent',
//       hoursFormatted: day.HoursWorked ? formatHours(day.HoursWorked) : '0h 0m',
//       rawDate: day.AttendanceDate,
//       AttendanceDate: day.AttendanceDate,
//       InTime12: day.InTime12,
//       OutTime12: day.OutTime12,
//       AttendanceStatus: day.AttendanceStatus,
//       HoursWorked: day.HoursWorked,
//       CheckIns: day.CheckIns,
//       CheckOuts: day.CheckOuts
//     }));
//   }, [weeklyData]);

//   const yearOptions = [];
//   const currentYear = new Date().getFullYear();
//   for (let year = currentYear; year >= currentYear - 5; year--) {
//     yearOptions.push(year);
//   }

//   const DateInput = ({ label, value, onChange, minDate }) => {
//     return (
//       <TextField
//         label={label}
//         type="date"
//         value={value.toISOString().split('T')[0]}
//         onChange={(e) => onChange(new Date(e.target.value))}
//         InputLabelProps={{ shrink: true }}
//         inputProps={{
//           min: minDate ? minDate.toISOString().split('T')[0] : undefined
//         }}
//         size="small"
//       />
//     );
//   };

//   const WeekSelector = () => {
//     const weeksInYear = (year) => {
//       const lastDay = new Date(year, 11, 31);
//       return Math.ceil((lastDay - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
//     };
//     return null;
//   };

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <Paper sx={{ p: 2, minWidth: 200 }} elevation={3}>
//           <Typography variant="subtitle2" gutterBottom>
//             Week {data.week_number}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Date Range:</strong> {formatDateForDisplay(data.week_start_date)} - {formatDateForDisplay(data.week_end_date)}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Days Present:</strong> {data.presentDays}/{data.totalDays}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Hours Worked:</strong> {data.hoursWorked}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Status:</strong> <span style={{ 
//               color: data.status === 'Present' ? statusColors.present : statusColors.absent
//             }}>
//               {data.status}
//             </span>
//           </Typography>
//         </Paper>
//       );
//     }
//     return null;
//   };

//   const CustomDailyTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <Paper sx={{ 
//           p: 2, 
//           minWidth: 200,
//           backgroundColor: '#fff',
//           border: `1px solid ${theme.palette.divider}`
//         }} elevation={3}>
//           <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
//             {data.date} ({data.rawDate})
//           </Typography>
//           <Typography variant="body2" sx={{ 
//             color: data.AttendanceStatus === 'Present' ? statusColors.present : statusColors.absent,
//             fontWeight: 'bold',
//             mb: 1
//           }}>
//             Status: {data.AttendanceStatus}
//           </Typography>
//           <Typography variant="body2">
//             <strong>In Time:</strong> {data.InTime12 || 'N/A'}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Out Time:</strong> {data.OutTime12 || 'N/A'}
//           </Typography>
//           <Typography variant="body2" sx={{ color: theme.palette.primary.main, mt: 1 }}>
//             <strong>Hours Worked:</strong> {data.HoursWorked || '00:00:00'} ({data.hoursFormatted})
//           </Typography>
//           <Typography variant="body2">
//             <strong>Check-ins:</strong> {data.CheckIns || 0}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Check-outs:</strong> {data.CheckOuts || 0}
//           </Typography>
//         </Paper>
//       );
//     }
//     return null;
//   };

//   return (
//     <Box sx={{ p: 3, background: '#f4f4f4', minHeight: '100vh' }}>
//       {loading && <LinearProgress />}
//       {error && (
//         <Typography color="error" sx={{ mb: 2 }}>
//           {error}
//         </Typography>
//       )}

//       <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
//         Attendance Dashboard for {user?.student_name || 'User'}
//       </Typography>

//       {/* Weekly Summary Section */}
//       <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
//         <Typography variant="h5" sx={{ mb: 2, color: theme.palette.primary.main }}>
//           Weekly Summary Overview
//         </Typography>
        
//         <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
//           <FormControl sx={{ minWidth: 120 }}>
//             <InputLabel id="month-select-label">Month</InputLabel>
//             <Select
//               labelId="month-select-label"
//               value={selectedMonth}
//               label="Month"
//               onChange={(e) => setSelectedMonth(e.target.value)}
//             >
//               {Array.from({ length: 12 }, (_, i) => (
//                 <MenuItem key={i + 1} value={i + 1}>
//                   {new Date(0, i).toLocaleString('default', { month: 'long' })}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <FormControl sx={{ minWidth: 120 }}>
//             <InputLabel id="year-select-label">Year</InputLabel>
//             <Select
//               labelId="year-select-label"
//               value={selectedYear}
//               label="Year"
//               onChange={(e) => setSelectedYear(e.target.value)}
//             >
//               {yearOptions.map(year => (
//                 <MenuItem key={year} value={year}>{year}</MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <Button
//             variant="contained"
//             onClick={fetchAttendanceData}
//             disabled={loading}
//           >
//             Apply
//           </Button>
//         </Stack>
        
//         <WeekSelector />
        
//         {weeklySummaryStats && (
//           <Grid container spacing={3} sx={{ mb: 3 }}>
//             <Grid item xs={12} md={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
//                 <Typography variant="subtitle1">Weeks Present</Typography>
//                 <Chip
//                   label={`${weeklySummaryStats.presentWeeks}/${weeklySummaryStats.totalWeeks}`}
//                   color="success"
//                   sx={{ fontSize: '1.5rem', p: 2, mt: 1 }}
//                 />
//               </Paper>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
//                 <Typography variant="subtitle1">Attendance Rate</Typography>
//                 <Chip
//                   label={`${weeklySummaryStats.attendancePercentage}%`}
//                   sx={{
//                     backgroundColor: statusColors.rate,
//                     color: 'white',
//                     fontSize: '1.5rem',
//                     p: 2,
//                     mt: 1
//                   }}
//                 />
//               </Paper>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
//                 <Typography variant="subtitle1">Avg Hours/Week</Typography>
//                 <Chip
//                   label={`${weeklySummaryStats.averageHoursPerWeek}h`}
//                   sx={{
//                     backgroundColor: statusColors.average,
//                     color: 'white',
//                     fontSize: '1.5rem',
//                     p: 2,
//                     mt: 1
//                   }}
//                 />
//               </Paper>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
//                 <Typography variant="subtitle1">Total Hours</Typography>
//                 <Chip
//                   label={weeklySummaryStats.totalHoursFormatted}
//                   sx={{
//                     backgroundColor: statusColors.total,
//                     color: 'white',
//                     fontSize: '1.5rem',
//                     p: 2,
//                     mt: 1
//                   }}
//                 />
//               </Paper>
//             </Grid>
//           </Grid>
//         )}

//         <Box sx={{ height: 300, mt: 2 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={weeklySummaryData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis
//                 dataKey="week_number"
//                 label={{ value: 'Week Number', position: 'insideBottom' }}
//               />
//               <YAxis>
//                 <Label value="Hours" angle={-90} position="insideLeft" />
//               </YAxis>
//               <Tooltip content={<CustomTooltip />} />
//               <Bar
//                 dataKey="hoursWorked"
//                 name="Hours Worked"
//                 fill={theme.palette.primary.main}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>

//       {/* Daily Attendance Section */}
//       <Paper sx={{ p: 7, mb: 3, borderRadius: 2, boxShadow: 3 }}>
//         <Typography variant="h5" sx={{ mb: 2, color: theme.palette.primary.main }}>
//           Daily Attendance
//         </Typography>

//         <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
//           <DateInput
//             label="Start Date"
//             value={weeklyDateRange.start}
//             onChange={(date) => setWeeklyDateRange({ ...weeklyDateRange, start: date })}
//           />
//           <DateInput
//             label="End Date"
//             value={weeklyDateRange.end}
//             onChange={(date) => setWeeklyDateRange({ ...weeklyDateRange, end: date })}
//             minDate={weeklyDateRange.start}
//           />
//           <Button
//             variant="contained"
//             onClick={fetchAttendanceData}
//             disabled={loading}
//           >
//             Apply
//           </Button>
//         </Stack>

//         <Grid container spacing={3}>
//           <Grid item xs={12} md={8}>
//             <Paper sx={{ p: 2, height: '100%' }}>
//               <Typography variant="h6" sx={{ mb: 2 }}>Daily Hours Worked</Typography>
//               <Box sx={{ height: 300 }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={weeklyChartData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="date" />
//                     <YAxis>
//                       <Label value="Hours" angle={-90} position="insideLeft" />
//                     </YAxis>
//                     <Tooltip content={<CustomDailyTooltip />} />
//                     <Bar dataKey="hours" name="Hours">
//                       {weeklyChartData.map((entry, index) => (
//                         <Cell
//                           key={`cell-${index}`}
//                           fill={entry.status === 'Present' ? statusColors.present : statusColors.absent}
//                         />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </Box>
//             </Paper>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <Paper sx={{ p: 4, height: '92%' }}>
//               <Typography variant="h6" sx={{ mb: 2 }}>Weekly Summary</Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <Chip
//                   avatar={<Avatar>{weeklyStats.presentDays}</Avatar>}
//                   label={`Present out of ${weeklyStats.totalDays} days`}
//                   color="success"
//                   variant="outlined"
//                   sx={{ fontSize: '1rem' }}
//                 />
//                 <Chip
//                   avatar={<Avatar>{weeklyStats.attendancePercentage}%</Avatar>}
//                   label="Attendance Rate"
//                   sx={{
//                     backgroundColor: statusColors.rate,
//                     color: 'white',
//                     fontSize: '1rem'
//                   }}
//                 />
//                 <Chip
//                   avatar={<Avatar>{weeklyStats.averageHoursPerDay}h</Avatar>}
//                   label="Average Hours/Day"
//                   sx={{
//                     backgroundColor: statusColors.average,
//                     color: 'white',
//                     fontSize: '1rem'
//                   }}
//                 />
//                 <Chip
//                   avatar={<Avatar>{weeklyStats.totalHoursFormatted}</Avatar>}
//                   label="Total Hours"
//                   sx={{
//                     backgroundColor: statusColors.total,
//                     color: 'white',
//                     fontSize: '1rem'
//                   }}
//                 />
//               </Box>
//             </Paper>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Monthly Overview Section */}
//       <Paper sx={{ p: 7, borderRadius: 2, boxShadow: 3 }}>
//         <Typography variant="h5" sx={{ mb: 2, color: theme.palette.primary.main }}>
//           Monthly Overview
//         </Typography>

//         <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
//           <FormControl sx={{ minWidth: 120 }}>
//             <InputLabel id="year-select-label">Year</InputLabel>
//             <Select
//               labelId="year-select-label"
//               value={selectedYear}
//               label="Year"
//               onChange={(e) => setSelectedYear(e.target.value)}
//             >
//               {yearOptions.map(year => (
//                 <MenuItem key={year} value={year}>{year}</MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <Button
//             variant="contained"
//             onClick={fetchAttendanceData}
//             disabled={loading}
//           >
//             Apply
//           </Button>
//         </Stack>

//         {monthlyStats && (
//           <Grid container spacing={3} sx={{ mb: 3 }}>
//             <Grid item xs={12} md={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
//                 <Typography variant="subtitle1">Days Present</Typography>
//                 <Chip
//                   label={`${monthlyStats.presentDays}/${monthlyStats.totalDays}`}
//                   color="success"
//                   sx={{ fontSize: '1.5rem', p: 2, mt: 1 }}
//                 />
//               </Paper>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
//                 <Typography variant="subtitle1">Attendance Rate</Typography>
//                 <Chip
//                   label={`${monthlyStats.attendancePercentage}%`}
//                   sx={{
//                     backgroundColor: statusColors.rate,
//                     color: 'white',
//                     fontSize: '1.5rem',
//                     p: 2,
//                     mt: 1
//                   }}
//                 />
//               </Paper>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
//                 <Typography variant="subtitle1">Avg Hours/Day</Typography>
//                 <Chip
//                   label={`${monthlyStats.averageHoursPerDay}h`}
//                   sx={{
//                     backgroundColor: statusColors.average,
//                     color: 'white',
//                     fontSize: '1.5rem',
//                     p: 2,
//                     mt: 1
//                   }}
//                 />
//               </Paper>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
//                 <Typography variant="subtitle1">Total Hours</Typography>
//                 <Chip
//                   label={monthlyStats.totalHoursFormatted}
//                   sx={{
//                     backgroundColor: statusColors.total,
//                     color: 'white',
//                     fontSize: '1.5rem',
//                     p: 2,
//                     mt: 1
//                   }}
//                 />
//               </Paper>
//             </Grid>
//           </Grid>
//         )}

//         <Grid container spacing={3}>
//           <Grid item xs={12} md={8}>
//             <Paper sx={{ p: 2, height: '100%' }}>
//               <Typography variant="h6" sx={{ mb: 2 }}>Monthly Attendance Percentage</Typography>
//               <Box sx={{ height: 400 }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={monthlyChartData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis domain={[0, 100]}>
//                       <Label value="Percentage (%)" angle={-90} position="insideLeft" />
//                     </YAxis>
//                     <Tooltip
//                       formatter={(value, name) => {
//                         if (name === 'Attendance') return [`${value}%`, name];
//                         return [value, name];
//                       }}
//                       labelFormatter={(label) => {
//                         const monthData = monthlyChartData.find(m => m.month === label);
//                         return `Month: ${label} | Hours: ${monthData?.hoursWorked || '00:00'}`;
//                       }}
//                     />
//                     <Bar
//                       dataKey="attendancePercentage"
//                       name="Attendance"
//                       fill={theme.palette.primary.main}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </Box>
//             </Paper>
//           </Grid>

//           <Grid item xs={12} md={4}>
//             <Paper sx={{ p: 2, height: '100%' }}>
//               <Typography variant="h6" sx={{ mb: 2 }}>Monthly Breakdown</Typography>
//               <TableContainer sx={{ maxHeight: 400 }}>
//                 <Table size="small" stickyHeader>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Month</TableCell>
//                       <TableCell>Attendance</TableCell>
//                       <TableCell>Days</TableCell>
//                       <TableCell>Hours Worked</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {monthlyChartData.map((month, index) => (
//                       <TableRow key={index} hover>
//                         <TableCell>{month.month}</TableCell>
//                         <TableCell>
//                           <Chip
//                             label={`${month.attendancePercentage}%`}
//                             size="small"
//                             sx={{
//                               backgroundColor:
//                                 month.attendancePercentage >= 90 ? green[500] :
//                                   month.attendancePercentage >= 75 ? orange[500] : red[500],
//                               color: 'white'
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           {`${month.presentDays}/${month.totalDays}`}
//                         </TableCell>
//                         <TableCell>
//                           {month.hoursWorked || '00:00'}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             </Paper>
//           </Grid>
//         </Grid>
//       </Paper>
//     </Box>
//   );
// };

// export default AttendanceDashboard;