import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Chip,
  Avatar,
  useTheme,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  CardHeader,
  useMediaQuery,
  Fab,
  InputAdornment,
  Skeleton
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  LineChart,
  Line
} from "recharts";
import {
  Person as UserIcon,
  Check as CheckIcon,
  Close as XIcon,
  CalendarToday as CalendarIcon,
  FileDownload as DownloadIcon,
  FilterAlt as FilterIcon,
  Today as TodayIcon,
  School as SchoolIcon,
  Summarize as SummarizeIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import * as XLSX from "xlsx";
import { green, red, orange, blue, purple, pink, grey, teal, indigo, deepPurple } from "@mui/material/colors";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';
 
// Color Scheme
const COLORS = {
  present: green[700],
  absent: red[500],
  od: deepPurple[500],
  permission: orange[500],
  chartBackground: '#f5f7fa',
  chartGrid: '#e0e0e0',
  firstYear: indigo[500],
  secondYear: teal[800],
  thirdYear: orange[800],
  fourthYear: grey[600],
  totalStaff: grey[700]
};

const getChartData = (period, selectedDate) => {
  const date = new Date(selectedDate);
  const month = date.getMonth();
  const year = date.getFullYear();
  
  switch (period) {
    case "daily":
      return [
        { label: "Mon", Present: 35, Absent: 8, OD: 4, Permission: 3 },
        { label: "Tue", Present: 37, Absent: 6, OD: 4, Permission: 3 },
        { label: "Wed", Present: 36, Absent: 7, OD: 4, Permission: 3 },
        { label: "Thu", Present: 38, Absent: 5, OD: 4, Permission: 3 },
        { label: "Fri", Present: 39, Absent: 4, OD: 4, Permission: 3 },
      ];
    case "weekly":
      return [
        { label: `W1 ${month+1}/${year}`, Present: 33, Absent: 10, OD: 4, Permission: 3 },
        { label: `W2 ${month+1}/${year}`, Present: 35, Absent: 8, OD: 4, Permission: 3 },
        { label: `W3 ${month+1}/${year}`, Present: 34, Absent: 9, OD: 4, Permission: 3 },
        { label: `W4 ${month+1}/${year}`, Present: 36, Absent: 7, OD: 4, Permission: 3 },
      ];
    case "monthly":
      return [
        { label: "Jan", Present: 38, Absent: 7, OD: 3, Permission: 2 },
        { label: "Feb", Present: 35, Absent: 10, OD: 3, Permission: 2 },
        { label: "Mar", Present: 37, Absent: 8, OD: 3, Permission: 2 },
        { label: "Apr", Present: 36, Absent: 9, OD: 3, Permission: 2 },
        { label: "May", Present: 39, Absent: 6, OD: 3, Permission: 2 },
        { label: "Jun", Present: 38, Absent: 7, OD: 3, Permission: 2 },
      ].map(item => ({
        ...item,
        label: `${item.label} ${year}`
      }));
 
    default:
      return [];
  }
};

const statusColors = {
  Present: COLORS.present,
  Absent: COLORS.absent,
  OD: COLORS.od,
  Permission: COLORS.permission
};

const statusLightColors = {
  Present: teal[100],
  Absent: red[100],
  OD: deepPurple[100],
  Permission: orange[100]
};

const statusIcons = {
  Present: <CheckIcon fontSize="small" sx={{ color: teal[500] }} />,
  Absent: <XIcon fontSize="small" sx={{ color: red[500] }} />,
  OD: <CalendarIcon fontSize="small" sx={{ color: deepPurple[500] }} />,
  Permission: <UserIcon fontSize="small" sx={{ color: orange[500] }} />,
};

const periodLabels = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",

};

const StaffAttendanceDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM'));
  const [selectedWeek, setSelectedWeek] = useState(Math.ceil(new Date().getDate() / 7));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showTableView, setShowTableView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    od: 0,
    permission: 0,
    total: 0
  });
  const [staffList, setStaffList] = useState([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [department, setDepartment] = useState("");
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Get department from session storage
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.department) {
      setDepartment(user.department);
    } else {
      setError("Department information not found");
    }
  }, []);

  // Fetch total staff count
  const fetchTotalStaff = async () => {
    if (!department) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/hod/total-staff?department=${department}`);
      if (response.data.success) {
        setTotalStaff(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching total staff:', error);
      showSnackbar('Failed to fetch total staff count', 'error');
    }
  };

  // Fetch daily attendance
  const fetchDailyAttendance = async () => {
    if (!department) return;
    try {
      setLoading(true);
      const date = format(selectedDate, 'yyyy-MM-dd');
      const response = await axios.get(`${API_BASE_URL}/hod/staff-daily-attendance?date=${date}&department=${department}`);
      if (response.data.success) {
        setStats(response.data.data);
        // Update chart data for daily view
        setChartData([{
          label: format(selectedDate, 'EEE'),
          Present: response.data.data.present,
          Absent: response.data.data.absent,
          OD: response.data.data.od,
          Permission: response.data.data.permission
        }]);
      }
    } catch (error) {
      console.error('Error fetching daily attendance:', error);
      showSnackbar('Failed to fetch daily attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly attendance
  const fetchWeeklyAttendance = async () => {
    if (!department) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/hod/staff-weekly-attendance?month=${selectedMonth}&weekNumber=${selectedWeek}&department=${department}`);
      if (response.data.success) {
        // Calculate percentages based on 100% for the week
        const totalDays = 5; // Assuming 5 working days in a week
        const totalPossible = response.data.data.total * totalDays;
        const presentPercentage = totalPossible > 0 ? 
          (response.data.data.present / totalPossible * 100).toFixed(1) : 0;
        const absentPercentage = totalPossible > 0 ? 
          (response.data.data.absent / totalPossible * 100).toFixed(1) : 0;
        const odPercentage = totalPossible > 0 ? 
          (response.data.data.od / totalPossible * 100).toFixed(1) : 0;
        const permissionPercentage = totalPossible > 0 ? 
          (response.data.data.permission / totalPossible * 100).toFixed(1) : 0;
        
        setStats({
          ...response.data.data,
          presentPercentage,
          absentPercentage,
          odPercentage,
          permissionPercentage
        });
        
        // Update chart data for weekly view
        setChartData([{
          label: `Week ${selectedWeek}`,
          Present: presentPercentage,
          Absent: absentPercentage,
          OD: odPercentage,
          Permission: permissionPercentage
        }]);
      }
    } catch (error) {
      console.error('Error fetching weekly attendance:', error);
      showSnackbar('Failed to fetch weekly attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly attendance
  const fetchMonthlyAttendance = async () => {
    if (!department) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/hod/staff-monthly-attendance?year=${selectedYear}&month=${selectedMonth}&department=${department}`);
      if (response.data.success) {
        // Calculate percentages based on 100% for the month
        const daysInMonth = new Date(selectedYear, new Date(`${selectedMonth} 1, ${selectedYear}`).getMonth() + 1, 0).getDate();
        const workingDays = daysInMonth * 0.7; // Assuming 70% of days are working days (adjust as needed)
        const totalPossible = response.data.data.total * workingDays;
        
        const presentPercentage = totalPossible > 0 ? 
          (response.data.data.present / totalPossible * 100).toFixed(1) : 0;
        const absentPercentage = totalPossible > 0 ? 
          (response.data.data.absent / totalPossible * 100).toFixed(1) : 0;
        const odPercentage = totalPossible > 0 ? 
          (response.data.data.od / totalPossible * 100).toFixed(1) : 0;
        const permissionPercentage = totalPossible > 0 ? 
          (response.data.data.permission / totalPossible * 100).toFixed(1) : 0;
        
        setStats({
          ...response.data.data,
          presentPercentage,
          absentPercentage,
          odPercentage,
          permissionPercentage
        });
        
        // Update chart data for monthly view
        setChartData([{
          label: selectedMonth,
          Present: presentPercentage,
          Absent: absentPercentage,
          OD: odPercentage,
          Permission: permissionPercentage
        }]);
      }
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
      showSnackbar('Failed to fetch monthly attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update data when view mode or date changes
  useEffect(() => {
    if (!department) return;
    
    fetchTotalStaff();

    switch (viewMode) {
      case 'daily':
        fetchDailyAttendance();
        if (showTableView) {
          fetchStaffTable();
        }
        break;
      case 'weekly':
        fetchWeeklyAttendance();
        break;
      case 'monthly':
        fetchMonthlyAttendance();
        break;
    }
  }, [viewMode, selectedDate, selectedMonth, selectedWeek, selectedYear, department, showTableView]);

  // Separate effect for status changes
  useEffect(() => {
    if (showTableView && viewMode === 'daily') {
      fetchStaffTable();
    }
  }, [selectedStatus]);

  // Update staff table fetch to remove search parameter
  const fetchStaffTable = async () => {
    if (!department || viewMode !== 'daily') return;
    try {
      setLoading(true);
      const date = format(selectedDate, 'yyyy-MM-dd');
      const response = await axios.get(
        `${API_BASE_URL}/hod/staff-table?department=${department}&date=${date}${
          selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''
        }`
      );
      if (response.data.success) {
        setStaffList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching staff table:', error);
      showSnackbar('Failed to fetch staff table', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setViewMode(newValue);
    setSelectedStatus('all');
    setShowTableView(false); // Reset table view when changing tabs
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const getPercent = (num) =>
    stats && stats.total ? ((num / stats.total) * 100).toFixed(1) : 0;

  const overallAttendancePercentage = useMemo(() => {
    if (viewMode === 'weekly' || viewMode === 'monthly') {
      // For weekly and monthly views, we already have the percentage calculated
      return stats.presentPercentage || 0;
    }
    
    // For daily view, calculate normally
    const totalPresent = stats.present;
    const totalPossible = stats.total;
    return totalPossible > 0 ? ((totalPresent / totalPossible) * 100).toFixed(1) : 0;
  }, [stats, viewMode]);

  // Loading skeleton for summary cards
  const LoadingSkeleton = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Grid item xs={12} md={6} lg={3} key={item}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="80%" height={20} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Error state component
  const ErrorState = () => (
    <Card sx={{ 
      mb: 3, 
      p: 3, 
      textAlign: 'center',
      borderLeft: `4px solid ${theme.palette.error.main}`
    }}>
      <XIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h6" color="error" gutterBottom>
        Error Loading Data
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {error}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<RefreshIcon />}
        onClick={() => {
          setError(null);
          fetchTotalStaff();
          switch (viewMode) {
            case 'daily':
              fetchDailyAttendance();
              fetchStaffTable();
              break;
            case 'weekly':
              fetchWeeklyAttendance();
              break;
            case 'monthly':
              fetchMonthlyAttendance();
              break;
          }
        }}
      >
        Retry
      </Button>
    </Card>
  );

  // Date selection component based on view mode
  const DateSelectionComponent = () => {
    switch (viewMode) {
      case 'daily':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        );
      case 'weekly':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  label="Month"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                    <MenuItem key={month} value={month}>{month}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Week</InputLabel>
                <Select
                  value={selectedWeek}
                  onChange={handleWeekChange}
                  label="Week"
                >
                  {[1, 2, 3, 4, 5].map((week) => (
                    <MenuItem key={week} value={week}>Week {week}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 'monthly':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  label="Month"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                    <MenuItem key={month} value={month}>{month}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  label="Year"
                >
                  {[2023, 2024, 2025].map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  const SummaryCards = () => {
    if (viewMode !== 'daily') {
      // For weekly and monthly views, show only the overall attendance card
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${grey[600]} 0%, ${grey[500]} 100%)`,
              color: 'white',
              transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
              '&:hover': { 
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Attendance ({periodLabels[viewMode]})
                </Typography>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight={700}>
                  {overallAttendancePercentage}%
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={overallAttendancePercentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: `${blue[100]}50`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: overallAttendancePercentage > 85 ? 
                            green[700] : overallAttendancePercentage > 70 ? 
                            orange[500] : red[500],
                          borderRadius: 4
                        }
                      }} 
                    />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Based on {stats.total} staff members over {viewMode === 'weekly' ? '5 working days' : 'the entire month'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    // For daily view, show all cards
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Staff
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} fontWeight={700}>
                {totalStaff}
              </Typography>
              <Typography variant="body2">
                Department: Computer Science
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {["present", "absent", "od", "permission"].map((key) => (
          <Grid item xs={12} md={6} lg={3} key={key}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${statusLightColors[key.charAt(0).toUpperCase() + key.slice(1)]} 0%, ${statusColors[key.charAt(0).toUpperCase() + key.slice(1)]} 100%)`,
              transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
              '&:hover': { 
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {statusIcons[key.charAt(0).toUpperCase() + key.slice(1)]}
                  <Typography
                    fontWeight="600"
                    fontSize={isMobile ? '0.9rem' : '1rem'}
                    ml={1}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                </Box>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  fontWeight="bold"
                >
                  {stats[key]}
                </Typography>
                <Typography fontSize={isMobile ? '0.8rem' : '0.95rem'}>
                  {getPercent(stats[key])}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${grey[600]} 0%, ${grey[500]} 100%)`,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Attendance
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} fontWeight={700}>
                {overallAttendancePercentage}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={overallAttendancePercentage} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: `${blue[100]}50`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: overallAttendancePercentage > 85 ? 
                          green[700] : overallAttendancePercentage > 70 ? 
                          orange[500] : red[500],
                        borderRadius: 4
                      }
                    }} 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const TimeSeriesChart = () => {
    // Prepare data for pie chart
    const pieData = [
      { 
        name: 'Present', 
        value: viewMode === 'daily' ? stats.present : parseFloat(stats.presentPercentage || 0), 
        color: COLORS.present 
      },
      { 
        name: 'Absent', 
        value: viewMode === 'daily' ? stats.absent : parseFloat(stats.absentPercentage || 0), 
        color: COLORS.absent 
      },
      { 
        name: 'OD', 
        value: viewMode === 'daily' ? stats.od : parseFloat(stats.odPercentage || 0), 
        color: COLORS.od 
      },
      { 
        name: 'Permission', 
        value: viewMode === 'daily' ? stats.permission : parseFloat(stats.permissionPercentage || 0), 
        color: COLORS.permission 
      }
    ];

    // Custom label for pie chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <Card sx={{ 
        mb: 3,
        borderRadius: 3,
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
        '&:hover': { 
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        }
      }}>
        <CardHeader
          title={`Staff Attendance Distribution (${periodLabels[viewMode]})`}
          titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
          action={
            <Box>
              <Tooltip title="Export Chart Data">
                <IconButton onClick={() => exportToExcel("chart")}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => viewMode === 'daily' ? 
                    [`${value} staff`, name] : 
                    [`${value}%`, name]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e3e3e3",
                    boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontWeight: 'bold' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Additional Stats Display */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {pieData.map((item) => (
              <Grid item xs={12} sm={4} key={item.name}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: `${item.color}10`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" color={item.color} fontWeight="bold">
                    {viewMode === 'daily' ? item.value : `${item.value}%`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.name}
                  </Typography>
                  {viewMode === 'daily' && (
                    <Typography variant="caption" color="text.secondary">
                      {((item.value / stats.total) * 100).toFixed(1)}% of total
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Update header buttons
  const HeaderButtons = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 2
    }}>
      {viewMode === 'daily' && (
        <Button
          variant="contained"
          color={showTableView ? "secondary" : "primary"}
          startIcon={showTableView ? <BarChartIcon /> : <TableChartIcon />}
          onClick={() => setShowTableView(!showTableView)}
          size={isMobile ? "small" : "medium"}
        >
          {showTableView ? "Show Charts" : "Show Staff List"}
        </Button>
      )}
      <Button
        variant="contained"
        color="primary"
        startIcon={<DownloadIcon />}
        onClick={() => exportToExcel("stats")}
        size={isMobile ? "small" : "medium"}
      >
        Export Data
      </Button>
    </Box>
  );

  // Filter staff list based on status only - remove search filtering
  const filteredStaffList = useMemo(() => {
    return staffList
      .filter(staff => selectedStatus === 'all' || staff.status === selectedStatus);
  }, [staffList, selectedStatus]);

  // Update StaffTableView component
  const StaffTableView = () => {
    const [tableDate, setTableDate] = useState(selectedDate);

    // Update table date handler
    const handleTableDateChange = (newDate) => {
      setTableDate(newDate);
      setSelectedDate(newDate);
    };

    return (
      <Card sx={{ 
        mb: 3,
        borderRadius: 3,
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
        '&:hover': { 
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Staff Attendance Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={tableDate}
                  onChange={handleTableDateChange}
                  renderInput={(params) => <TextField {...params} size="small" />}
                  inputFormat="MM/dd/yyyy"
                />
              </LocalizationProvider>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Filter by Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="all">All Staff</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="od">OD</MenuItem>
                  <MenuItem value="permission">Permission</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => exportToExcel("staff")}
                size="small"
              >
                Export
              </Button>
            </Box>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : filteredStaffList.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No staff found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No staff data available for the selected date
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableCell sx={{ color: 'white' }}>ID</TableCell>
                    <TableCell sx={{ color: 'white' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white' }}>Department</TableCell>
                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white' }}>Attendance %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStaffList.map((staff) => (
                    <TableRow key={staff.sin_number} hover>
                      <TableCell>{staff.sin_number}</TableCell>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>
                        <Chip 
                          label={staff.status}
                          size="small"
                          sx={{ 
                            backgroundColor: `${statusColors[staff.status]}20`,
                            color: statusColors[staff.status],
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={staff.attendancePercentage} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: `${theme.palette.primary.main}20`,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: staff.attendancePercentage > 85 ? 
                                    green[600] : staff.attendancePercentage > 70 ? 
                                    orange[500] : red[500],
                                  borderRadius: 4
                                }
                              }} 
                            />
                          </Box>
                          <Typography variant="body2">
                            {staff.attendancePercentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  const exportToExcel = (dataType) => {
    try {
      let dataToExport = [];
      let fileName = "";
      
      if (dataType === "stats") {
        const statsData = Object.entries(stats).map(([key, value]) => ({
          Category: key.charAt(0).toUpperCase() + key.slice(1),
          Count: value,
          Percentage: viewMode === 'daily' ? `${getPercent(value)}%` : `${value}%`
        }));
        dataToExport = statsData;
        fileName = `Staff_Attendance_Statistics_${viewMode}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      } else if (dataType === "staff") {
        dataToExport = staffList.map(staff => ({
          ID: staff.sin_number,
          Name: staff.name,
          Status: staff.status,
          Department: staff.department,
          'Attendance Percentage': staff.attendancePercentage
        }));
        fileName = `Staff_List_${selectedStatus === 'all' ? 'All' : selectedStatus}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      } else if (dataType === "chart") {
        dataToExport = chartData.map(item => ({
          ...item,
          Permission: item.Permission || 0
        }));
        fileName = `Staff_Attendance_Trend_${viewMode}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      }

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, fileName);
      
      showSnackbar('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showSnackbar('Failed to export data', 'error');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Box sx={{ flexGrow: 1, mt: -2, p: isMobile ? 1 : 3, overflow: 'auto' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0
          }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"}
              sx={{ 
                fontWeight: "bold", 
                color: theme.palette.primary.main,
                textAlign: isMobile ? 'center' : 'left',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Staff Attendance Dashboard
            </Typography>
            
            <HeaderButtons />
          </Box>

          {error ? (
            <ErrorState />
          ) : loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {!showTableView && (
                <>
                  <SummaryCards />

                  <Paper sx={{ 
                    mb: 3, 
                    borderRadius: 3,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <Tabs
                      value={viewMode}
                      onChange={handleTabChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      indicatorColor="primary"
                      textColor="primary"
                      sx={{
                        '& .MuiTab-root': {
                          minHeight: 64,
                          fontWeight: 'bold'
                        }
                      }}
                    >
                      <Tab label="Daily" icon={<TodayIcon />} value="daily" />
                      <Tab label="Weekly" icon={<CalendarIcon />} value="weekly" />
                      <Tab label="Monthly" icon={<SummarizeIcon />} value="monthly" />
                    </Tabs>
                  </Paper>

                  <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Select {periodLabels[viewMode]} Period
                      </Typography>
                      <DateSelectionComponent />
                    </CardContent>
                  </Card>

                  <TimeSeriesChart />
                </>
              )}

              {showTableView && <StaffTableView />}
            </>
          )}
        </Box>
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default StaffAttendanceDashboard;