import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, useTheme, LinearProgress,
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Card, CardContent,
  Divider, IconButton, Badge, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, InputAdornment, List, ListItem, ListItemText,
  ListItemIcon, Collapse, CardHeader, CardActionArea, Fab, Snackbar, Alert,
  CircularProgress, Skeleton, ToggleButtonGroup, ToggleButton, Stack
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Label
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Download as DownloadIcon,
  Today as TodayIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Summarize as SummarizeIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  ExpandLess,
  ExpandMore,
  FilterList as FilterIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  AccessTime as TimeIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Check as CheckIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  AlarmOn as AlarmOnIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  SupervisorAccount as SupervisorAccountIcon,
  LocalLibrary as LocalLibraryIcon,
  Timelapse as TimelapseIcon,
  Warning as WarningIcon,
  Percent as PercentIcon,
  DateRange as DateRangeIcon,
  Timeline as TimelineIcon,
  CalendarMonth as CalendarMonthIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import { green, red, orange, blue, purple, pink, grey, deepPurple, teal, indigo } from '@mui/material/colors';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const StudentAttendanceDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // State for mentor info
  const [mentorInfo, setMentorInfo] = useState(null);
  
  // View mode state
  const [viewMode, setViewMode] = useState('daily');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [studentView, setStudentView] = useState(false);
  const [showTableView, setShowTableView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [error, setError] = useState(null);

  // Color Scheme
  const COLORS = {
    present: green[500],
    absent: red[500],
    late: orange[500],
    od: deepPurple[500],
    internship: pink[500],
    earlyDeparture: blue[500],
    totalStudents: grey[700],
    chartBackground: '#f5f7fa',
    chartGrid: '#e0e0e0'
  };

  // Get mentor info from session storage
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setMentorInfo(parsedUser);
    }
  }, []);

  // Fetch attendance data based on view mode
  const fetchAttendanceData = async () => {
    if (!mentorInfo?.sin_number) return;

    try {
      setLoading(true);
      setError(null);
      let response;

      switch (viewMode) {
        case 'daily':
          response = await axios.get(`${API_BASE_URL}/mentor/daily-attendance`, {
            params: {
              date: selectedDate.toISOString().split('T')[0],
              sin_number: mentorInfo.sin_number
            }
          });
          break;

        case 'weekly':
          response = await axios.get(`${API_BASE_URL}/mentor/weekly-attendance`, {
            params: {
              month: new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'long' }).toLowerCase(),
              weekNumber: selectedWeek,
              sin_number: mentorInfo.sin_number
            }
          });
          break;

        case 'monthly':
          response = await axios.get(`${API_BASE_URL}/mentor/monthly-attendance`, {
            params: {
              year: selectedYear,
              month: new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'long' }).toLowerCase(),
              sin_number: mentorInfo.sin_number
            }
          });
          break;

        default:
          throw new Error('Invalid view mode');
      }

      if (response.data.success) {
        setAttendanceData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch attendance data');
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err.message || 'Failed to fetch attendance data');
      showSnackbar(err.message || 'Failed to fetch attendance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student-level attendance data
  const fetchStudentAttendance = async () => {
    if (!mentorInfo?.sin_number) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/mentor/student-attendance`, {
        params: {
          sin_number: mentorInfo.sin_number,
          date: selectedDate.toISOString().split('T')[0]
        }
      });

      if (response.data.success) {
        setAttendanceData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch student attendance data');
      }
    } catch (err) {
      console.error('Error fetching student attendance:', err);
      setError(err.message || 'Failed to fetch student attendance data');
      showSnackbar(err.message || 'Failed to fetch student attendance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when view mode or date changes
  useEffect(() => {
    if (mentorInfo?.sin_number) {
      if (showTableView) {
        fetchStudentAttendance();
      } else {
        fetchAttendanceData();
      }
    }
  }, [viewMode, selectedDate, selectedMonth, selectedYear, selectedWeek, showTableView, mentorInfo?.sin_number]);

  // Helper function to get week number within month
  const getWeekNumberInMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayWeekDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    const offset = ((7 - firstDayWeekDay) % 7) - 1; // Days until first Saturday
    const firstSaturday = new Date(firstDay);
    firstSaturday.setDate(1 + offset);
    
    if (date < firstSaturday) {
      return 1;
    }
    
    const diffInDays = Math.floor((date - firstSaturday) / (24 * 60 * 60 * 1000));
    return Math.floor(diffInDays / 7) + 2;
  };

  // Helper function to get start and end date of a week in month
  const getWeekRangeInMonth = (year, month, weekNum) => {
    const firstDay = new Date(year, month, 1);
    const firstDayWeekDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    const offset = ((7 - firstDayWeekDay) % 7) - 1; // Days until first Saturday
    const firstSaturday = new Date(firstDay);
    firstSaturday.setDate(1 + offset);
    
    if (weekNum === 1) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(firstSaturday);
      return { startDate, endDate };
    }
    
    const startDate = new Date(firstSaturday);
    startDate.setDate(startDate.getDate() + (weekNum - 2) * 7);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    // Make sure we don't go into next month
    if (endDate.getMonth() !== month) {
      endDate.setDate(new Date(year, month + 1, 0).getDate());
    }
    
    return { startDate, endDate };
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (viewMode === 'weekly') {
      setSelectedWeek(getWeekNumberInMonth(selectedDate));
    }
  }, [selectedMonth, selectedYear, viewMode, selectedDate]);

  useEffect(() => {
    if (viewMode === 'daily' || viewMode === 'weekly') {
      setSelectedMonth(selectedDate.getMonth());
      setSelectedYear(selectedDate.getFullYear());
    }
  }, [selectedDate, viewMode]);

  // Calculate normalized percentages for weekly and monthly views
  const calculateNormalizedPercentages = (stats) => {
    if (!stats) return {};

    const total = stats.present + stats.absent + stats.late + stats.od + stats.internship + stats.earlyDeparture;
    if (total === 0) return stats;

    return {
      present: Math.round((stats.present / total) * 100),
      absent: Math.round((stats.absent / total) * 100),
      late: Math.round((stats.late / total) * 100),
      od: Math.round((stats.od / total) * 100),
      internship: Math.round((stats.internship / total) * 100),
      earlyDeparture: Math.round((stats.earlyDeparture / total) * 100),
      totalStudents: stats.totalStudents
    };
  };

  const SummaryCards = () => {
    if (!attendanceData) return null;

    let { departmentData, attendanceStats } = attendanceData;
    let totalStudents = departmentData?.totalStudents || 0;
    let attendancePercentage = departmentData?.attendancePercentage || 0;
    let stats = attendanceStats || {};

    // For weekly and monthly views, normalize the percentages to add up to 100%
    if (viewMode !== 'daily') {
      stats = calculateNormalizedPercentages(stats);
      attendancePercentage = stats.present + stats.late; // Present + Late as attendance percentage
    }

    // For weekly and monthly views, show simplified percentage cards
    if (viewMode !== 'daily') {
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
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
                  Overall Attendance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>
                    {attendancePercentage}%
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={attendancePercentage} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white'
                        }
                      }} 
                    />
                  </Box>
                </Box>
                <Typography variant="body2">
                  {stats.present + stats.late}% of students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    // For daily view, show all detailed cards
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
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
                Overall Attendance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" sx={{ mr: 2 }}>
                  {attendancePercentage}%
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={attendancePercentage} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white'
                      }
                    }} 
                  />
                </Box>
              </Box>
              <Typography variant="body2">
                {stats.present + stats.late} of {totalStudents} students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${green[300]} 0%, ${green[500]} 100%)`,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Present Students
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {stats.present || 0}
              </Typography>
              <Typography variant="body2">
                {totalStudents ? Math.round((stats.present / totalStudents) * 100) : 0}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${red[300]} 0%, ${red[500]} 100%)`,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Absent Students
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {stats.absent || 0}
              </Typography>
              <Typography variant="body2">
                {totalStudents ? Math.round((stats.absent / totalStudents) * 100) : 0}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${orange[300]} 0%, ${orange[500]} 100%)`,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Late Arrivals
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {stats.late || 0}
              </Typography>
              <Typography variant="body2">
                {totalStudents ? Math.round((stats.late / totalStudents) * 100) : 0}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${deepPurple[300]} 0%, ${deepPurple[500]} 100%)`,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                On Duty Students
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {stats.od || 0}
              </Typography>
              <Typography variant="body2">
                {totalStudents ? Math.round((stats.od / totalStudents) * 100) : 0}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${pink[300]} 0%, ${pink[500]} 100%)`,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Internship Students
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {stats.internship || 0}
              </Typography>
              <Typography variant="body2">
                {totalStudents ? Math.round((stats.internship / totalStudents) * 100) : 0}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${blue[300]} 0%, ${blue[500]} 100%)`,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Early Departures
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {stats.earlyDeparture || 0}
              </Typography>
              <Typography variant="body2">
                {totalStudents ? Math.round((stats.earlyDeparture / totalStudents) * 100) : 0}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${grey[500]} 0%, ${grey[600]} 100%)`,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {totalStudents}
              </Typography>
              <Typography variant="body2">
                Current period total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const AttendancePieChart = () => {
    if (!attendanceData?.attendanceStats) return null;

    let stats = attendanceData.attendanceStats;
    
    // For weekly and monthly views, normalize the percentages to add up to 100%
    if (viewMode !== 'daily') {
      stats = calculateNormalizedPercentages(stats);
    }

    const chartData = [
      { name: 'Present', value: stats.present || 0, color: COLORS.present },
      { name: 'Absent', value: stats.absent || 0, color: COLORS.absent },
      { name: 'Late', value: stats.late || 0, color: COLORS.late },
      { name: 'On Duty', value: stats.od || 0, color: COLORS.od },
      { name: 'Internship', value: stats.internship || 0, color: COLORS.internship },
      { name: 'Early Departure', value: stats.earlyDeparture || 0, color: COLORS.earlyDeparture }
    ];

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
          <Typography variant="h6" gutterBottom>
            Attendance Distribution {viewMode !== 'daily' ? '(Percentage)' : ''}
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value, name, props) => [`${value}${viewMode !== 'daily' ? '%' : ' students'}`, name]}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[2]
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                  labelStyle={{ color: theme.palette.text.primary, fontWeight: 'bold' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const AttendanceBarChart = () => {
    if (!attendanceData?.attendanceStats) return null;

    let stats = attendanceData.attendanceStats;
    
    // For weekly and monthly views, normalize the percentages to add up to 100%
    if (viewMode !== 'daily') {
      stats = calculateNormalizedPercentages(stats);
    }

    const data = [
      {
        name: 'Present',
        value: stats.present || 0,
        fill: COLORS.present
      },
      {
        name: 'Absent',
        value: stats.absent || 0,
        fill: COLORS.absent
      },
      {
        name: 'Late',
        value: stats.late || 0,
        fill: COLORS.late
      },
      {
        name: 'On Duty',
        value: stats.od || 0,
        fill: COLORS.od
      },
      {
        name: 'Internship',
        value: stats.internship || 0,
        fill: COLORS.internship
      },
      {
        name: 'Early Departure',
        value: stats.earlyDeparture || 0,
        fill: COLORS.earlyDeparture
      }
    ];

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
          <Typography variant="h6" gutterBottom>
            Attendance Statistics {viewMode !== 'daily' ? '(Percentage)' : ''}
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} />
                <XAxis dataKey="name" tick={{ fill: theme.palette.text.primary }} />
                <YAxis 
                  tick={{ fill: theme.palette.text.primary }} 
                  domain={[0, viewMode !== 'daily' ? 100 : 'dataMax']}
                />
                <RechartsTooltip 
                  formatter={(value, name, props) => [`${value}${viewMode !== 'daily' ? '%' : ' students'}`, name]}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[2]
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                  labelStyle={{ color: theme.palette.text.primary, fontWeight: 'bold' }}
                />
                <Bar dataKey="value" name={viewMode !== 'daily' ? 'Percentage' : 'Students'}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const AttendanceTableView = () => {
    if (!attendanceData) return null;

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
              Attendance Records
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="od">On Duty</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                  <MenuItem value="earlyDeparture">Early Departure</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => exportToExcel(attendanceData, 'Attendance_Records_')}
                size="small"
              >
                Export
              </Button>
            </Box>
          </Box>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white' }}>Roll No</TableCell>
                  <TableCell sx={{ color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white' }}>Department</TableCell>
                  <TableCell sx={{ color: 'white' }}>Year</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white' }}>Attendance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((student, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{student.sin_number}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>
                        <Chip 
                          label={student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Unknown'}
                          size="small"
                          sx={{ 
                            backgroundColor: `${COLORS[student.status] || grey[500]}20`,
                            color: COLORS[student.status] || grey[500],
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>{student.attendancePercentage}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No attendance records found for the selected period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const DateSelector = () => (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {viewMode === 'daily' ? 'Select Date' : viewMode === 'weekly' ? 'Select Week' : 'Select Month'}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            {viewMode === 'daily' ? (
              <Grid item xs={12}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            ) : viewMode === 'weekly' ? (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Month</InputLabel>
                    <Select
                      value={new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'long' }).toLowerCase()}
                      label="Select Month"
                      onChange={(e) => {
                        const month = e.target.value;
                        const monthIndex = new Date(`${month} 1, ${selectedYear}`).getMonth();
                        setSelectedMonth(monthIndex);
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = new Date(0, i).toLocaleString('default', { month: 'long' }).toLowerCase();
                        return (
                          <MenuItem key={month} value={month}>
                            {month.charAt(0).toUpperCase() + month.slice(1)}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Week</InputLabel>
                    <Select
                      value={selectedWeek}
                      label="Select Week"
                      onChange={(e) => setSelectedWeek(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map((week) => (
                        <MenuItem key={week} value={week}>
                          Week {week}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Year</InputLabel>
                    <Select
                      value={selectedYear}
                      label="Select Year"
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Month</InputLabel>
                    <Select
                      value={new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'long' }).toLowerCase()}
                      label="Select Month"
                      onChange={(e) => {
                        const month = e.target.value;
                        const monthIndex = new Date(`${month} 1, ${selectedYear}`).getMonth();
                        setSelectedMonth(monthIndex);
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = new Date(0, i).toLocaleString('default', { month: 'long' }).toLowerCase();
                        return (
                          <MenuItem key={month} value={month}>
                            {month.charAt(0).toUpperCase() + month.slice(1)}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      mt: isMobile ? 0 : -31,
      ml: isMobile ? 0 : -38,
      p: isMobile ? 1 : 3
    }}>
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%', 
          height: '100vh' 
        }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%', 
          height: '100vh' 
        }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Box sx={{ 
          flexGrow: 1, 
          p: isMobile ? 1 : 3, 
          overflow: 'auto',
          width: '100%'
        }}>
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
              Mentees Attendance Dashboard
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mt: 3,
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
                  {showTableView ? "Show Charts" : "Show Mentees List"}
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => exportToExcel(attendanceData, 'Attendance_Records_')}
                size={isMobile ? "small" : "medium"}
              >
                Export 
              </Button>
            </Box>
          </Box>

          <SummaryCards />

          <Paper sx={{ 
            mb: 3, 
            borderRadius: 3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <Tabs
              value={viewMode}
              onChange={(e, newValue) => {
                setViewMode(newValue);
                setShowTableView(false);
              }}
              variant={isMobile ? "scrollable" : "standard"}
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

          <DateSelector />

          {viewMode === 'daily' && showTableView ? (
            <AttendanceTableView />
          ) : (
            <>
              <AttendancePieChart />
              <AttendanceBarChart />
            </>
          )}
        </Box>
      )}
      
      {/* Snackbar for notifications */}
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
  );
};

export default StudentAttendanceDashboard;