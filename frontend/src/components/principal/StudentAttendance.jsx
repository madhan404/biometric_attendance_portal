import React, { useState, useEffect, useRef } from 'react';
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
import CssBaseline from '@mui/material/CssBaseline';
import { green, red, orange, blue, purple, pink, grey, deepPurple, teal, indigo } from '@mui/material/colors';
import * as XLSX from 'xlsx';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, subDays, getMonth, getYear } from 'date-fns';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const StudentAttendanceDashboard = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // View mode state
  const [viewMode, setViewMode] = useState('daily');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showTableView, setShowTableView] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [expandedYear, setExpandedYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [studentTableData, setStudentTableData] = useState([]);
  const [studentTableLoading, setStudentTableLoading] = useState(false);
  const [studentTableError, setStudentTableError] = useState(null);
  const [studentTableSearch, setStudentTableSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  });
  const [studentTableDate, setStudentTableDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  });
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date()
  });

  // Get user data from session storage
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user data", e);
        setError("Failed to load user data");
      }
    }
  }, []);

  // Fetch attendance data based on view mode
  const fetchAttendanceData = async () => {
    if (!user?.college) return;
    setLoading(true);
    setError(null);
    try {
      let response;
      switch(viewMode) {
        case 'daily':
          response = await axios.get(`${API_BASE_URL}/principal/attendance/department-daily-attendance`, {
            params: {
              date: format(selectedDate, 'yyyy-MM-dd'),
              college: user.college
            }
          });
          break;
        case 'weekly': {
          const month = format(dateRange.startDate, 'MMMM');
          const weekNumber = Math.ceil(dateRange.startDate.getDate() / 7);
          response = await axios.get(`${API_BASE_URL}/principal/attendance/department-weekly-attendance`, {
            params: {
              month,
              weekNumber,
              college: user.college
            }
          });
          break;
        }
        case 'monthly':
          response = await axios.get(`${API_BASE_URL}/principal/attendance/department-monthly-attendance`, {
            params: {
              year: dateRange.startDate.getFullYear(),
              month: format(dateRange.startDate, 'MMMM'),
              college: user.college
            }
          });
          break;
      }
      if (response.data.success) {
        setAttendanceData(response.data.data);
        if (response.data.data.departmentStats) {
          setDepartments(response.data.data.departmentStats.map(d => d.name));
        }
      } else {
        setAttendanceData(null);
        setDepartments([]);
        setError(response.data.message || 'Failed to fetch attendance data');
      }
    } catch (err) {
      setAttendanceData(null);
      setDepartments([]);
      setError(err.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when view mode or date range changes
  useEffect(() => {
    if (viewMode === 'daily') {
      fetchAttendanceData();
    } else {
      fetchAttendanceData();
    }
  }, [viewMode, selectedDate, dateRange, user]);

  // Fetch total students count for the principal's college
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const fetchTotalStudentsCount = async () => {
    if (!user?.college) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/principal/attendance/department-student-attendance`, {
        params: { college: user.college }
      });
      if (response.data.success) {
        setTotalStudentsCount(response.data.data.length);
      } else {
        setTotalStudentsCount(0);
      }
    } catch {
      setTotalStudentsCount(0);
    }
  };
  useEffect(() => { fetchTotalStudentsCount(); }, [user]);

  // Debounce for SIN number search
  const debounceTimeout = useRef();
  const handleStudentTableSearch = (e) => {
    const value = e.target.value;
    setStudentTableSearch(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchStudentTableData(value, studentTableDate);
    }, 400);
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setStudentTableDate(newDate);
    fetchStudentTableData(studentTableSearch, newDate);
  };

  // Fetch student table data from API (default: all students, selected date)
  const fetchStudentTableData = async (searchValue = studentTableSearch, dateValue = studentTableDate) => {
    if (!user?.college) return;
    setStudentTableLoading(true);
    setStudentTableError(null);
    try {
      const params = {
        college: user.college,
        date: format(dateValue, 'yyyy-MM-dd'),
      };
      // Only add department/year if not 'All'
      if (selectedDepartment !== 'All') params.department = selectedDepartment;
      if (selectedYear !== 'All') params.year = selectedYear;
      if (attendanceFilter !== 'all') params.status = attendanceFilter.toLowerCase();
      if (searchValue) params.search = searchValue;
      const response = await axios.get(`${API_BASE_URL}/principal/attendance/department-student-attendance`, { params });
      if (response.data.success) {
        setStudentTableData(response.data.data);
      } else {
        setStudentTableData([]);
        setStudentTableError(response.data.message || 'Failed to fetch student table data');
      }
    } catch (err) {
      setStudentTableData([]);
      setStudentTableError(err.message || 'Failed to fetch student table data');
    } finally {
      setStudentTableLoading(false);
    }
  };

  // Fetch student table data when table view is shown or filters change
  useEffect(() => {
    if (showTableView) {
      fetchStudentTableData();
    }
  }, [showTableView, studentTableDate, selectedDepartment, selectedYear, attendanceFilter, user]);

  // Color Scheme
  const COLORS = {
    present: teal[500],
    absent: red[500],
    late: orange[500],
    od: deepPurple[500],
    internship: pink[500],
    totalStudents: grey[700],
    cse: indigo[500],
    it: teal[800],
    ece: orange[800],
    mech: grey[600],
    civil: green[600],
    aids: purple[500],
    eee: pink[600],
    bme: blue[800],
    chartBackground: '#f5f7fa',
    chartGrid: '#e0e0e0'
  };

  const handleTabChange = (event, newValue) => {
    setViewMode(newValue);
    const today = new Date();
    if (newValue === 'daily') {
      setSelectedDate(subDays(today, 1));
    } else if (newValue === 'weekly') {
      setDateRange({
        startDate: startOfWeek(today),
        endDate: endOfWeek(today)
      });
    } else if (newValue === 'monthly') {
      setDateRange({
        startDate: startOfMonth(today),
        endDate: endOfMonth(today)
      });
    }
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const getDepartmentColor = (dept) => {
    switch(dept) {
      case 'CSE': return COLORS.cse;
      case 'IT': return COLORS.it;
      case 'ECE': return COLORS.ece;
      case 'MECH': return COLORS.mech;
      case 'cybersecurity': return COLORS.civil;
      case 'AIDS': return COLORS.aids;
      case 'EEE': return COLORS.eee;
      case 'BME': return COLORS.bme;
      default: return theme.palette.primary.main;
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'present': return COLORS.present;
      case 'absent': return COLORS.absent;
      case 'late': return COLORS.late;
      case 'od': return COLORS.od;
      case 'internship': return COLORS.internship;
      default: return theme.palette.primary.main;
    }
  };

  const currentStats = selectedDepartment === 'All' ? 
    (attendanceData?.attendanceStats || {}) : 
    (attendanceData?.departmentStats?.find(d => d.name === selectedDepartment) || {});

  const totalStudents = selectedDepartment === 'All' ? 
    (attendanceData?.departmentData?.totalStudents || 0) : 
    (currentStats?.total || 0);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/");
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const downloadAttendance = () => {
    try {
      let dataToExport = [];
      let fileName = 'college_attendance';
      
      switch(viewMode) {
        case 'daily':
          dataToExport = [{
            Date: format(selectedDate, 'yyyy-MM-dd'),
            Present: currentStats.present,
            Absent: currentStats.absent,
            Late: currentStats.late,
            OD: currentStats.od,
            Internship: currentStats.internship,
            'Total Students': totalStudents,
            Percentage: selectedDepartment === 'All' ? 
              (attendanceData?.departmentData?.attendancePercentage || 0) : 
              (currentStats?.attendancePercentage || 0)
          }];
          fileName = `daily_attendance_${format(selectedDate, 'yyyyMMdd')}`;
          break;
          
        case 'weekly':
          dataToExport = [{
            'Week Start': format(dateRange.startDate, 'yyyy-MM-dd'),
            'Week End': format(dateRange.endDate, 'yyyy-MM-dd'),
            Present: currentStats.present,
            Absent: currentStats.absent,
            Late: currentStats.late,
            OD: currentStats.od,
            Internship: currentStats.internship,
            'Total Students': totalStudents,
            Percentage: selectedDepartment === 'All' ? 
              (attendanceData?.departmentData?.attendancePercentage || 0) : 
              (currentStats?.attendancePercentage || 0)
          }];
          fileName = `weekly_attendance_${format(dateRange.startDate, 'yyyyMMdd')}_to_${format(dateRange.endDate, 'yyyyMMdd')}`;
          break;
          
        case 'monthly':
          dataToExport = [{
            Month: format(dateRange.startDate, 'yyyy-MM'),
            Present: currentStats.present,
            Absent: currentStats.absent,
            Late: currentStats.late,
            OD: currentStats.od,
            Internship: currentStats.internship,
            'Total Students': totalStudents,
            Percentage: selectedDepartment === 'All' ? 
              (attendanceData?.departmentData?.attendancePercentage || 0) : 
              (currentStats?.attendancePercentage || 0)
          }];
          fileName = `monthly_attendance_${format(dateRange.startDate, 'yyyyMM')}`;
          break;
          
        default:
          break;
      }
      
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Data");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      
      showSnackbar('Attendance data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showSnackbar('Failed to export attendance data', 'error');
    }
  };

  const downloadStudentData = () => {
    try {
      let filteredStudents = studentTableData;
      
      if (selectedDepartment !== 'All') {
        filteredStudents = filteredStudents.filter(student => student.department === selectedDepartment);
      }
      
      if (selectedYear !== 'All') {
        filteredStudents = filteredStudents.filter(student => student.year === selectedYear);
      }

      if (attendanceFilter !== 'all') {
        filteredStudents = filteredStudents.filter(student => student.status === attendanceFilter);
      }
      
      const dataToExport = filteredStudents.map(student => ({
        'ID': student.id,
        'Name': student.name,
        'Department': student.department,
        'Year': student.year,
        'Status': student.status.charAt(0).toUpperCase() + student.status.slice(1),
        'Attendance Percentage': student.attendancePercentage
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");
      XLSX.writeFile(workbook, `student_attendance_${selectedDepartment || 'all'}.xlsx`);
      
      showSnackbar('Student data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting student data:', error);
      showSnackbar('Failed to export student data', 'error');
    }
  };

  const handleYearExpand = (year) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };

  // SummaryCards using real API data - Different views for daily, weekly, monthly
  const SummaryCards = () => {
    if (!attendanceData) return null;
    
    const {
      departmentData = {},
      attendanceStats = {}
    } = attendanceData;
    
    const {
      totalStudents = 0,
      attendancePercentage = 0
    } = departmentData;
    
    const {
      present = 0,
      absent = 0,
      late = 0,
      internship = 0,
      od = 0,
    } = attendanceStats;
    
    const safePercent = n => isFinite(n) && !isNaN(n) ? n : 0;
    const totalPresent = present + late;

    if (viewMode === 'daily') {
      return (
        <Grid container spacing={3} sx={{ mb: 3}}>
          <Grid item xs={12} md={6} lg={3} >
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`, color: 'white', transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Overall Attendance</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>{safePercent(attendancePercentage)}%</Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress variant="determinate" value={safePercent(attendancePercentage)} sx={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { backgroundColor: 'white' } }} />
                  </Box>
                </Box>
                <Typography variant="body2">{totalPresent} of {totalStudents} students</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${teal[300]} 0%, ${teal[500]} 100%)`, color: 'white', transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Present Students</Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>{totalPresent}</Typography>
                <Typography variant="body2">{safePercent((totalPresent / totalStudents) * 100).toFixed(1)}% of total</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${red[300]} 0%, ${red[500]} 100%)`, color: 'white', transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Absent Students</Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>{absent}</Typography>
                <Typography variant="body2">{safePercent((absent / totalStudents) * 100).toFixed(1)}% of total</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${orange[300]} 0%, ${orange[500]} 100%)`, color: 'white', transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Late Arrivals</Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>{late}</Typography>
                <Typography variant="body2">{safePercent((late / totalStudents) * 100).toFixed(1)}% of total</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${pink[300]} 0%, ${pink[500]} 100%)`, color: 'white', transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Internship</Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>{internship}</Typography>
                <Typography variant="body2">Industry training students</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${deepPurple[300]} 0%, ${deepPurple[500]} 100%)`, color: 'white', transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>On Duty</Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>{od}</Typography>
                <Typography variant="body2">Students on official duty</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else { // Weekly and Monthly views
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`, color: 'white', transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Overall Attendance</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>{safePercent(attendancePercentage)}%</Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress variant="determinate" value={safePercent(attendancePercentage)} sx={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { backgroundColor: 'white' } }} />
                  </Box>
                </Box>
                <Typography variant="body2">{totalPresent} of {totalStudents} students</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
  };

  // DepartmentCards using real API data - Same for all views
  const DepartmentCards = () => {
    if (!attendanceData || !attendanceData.departmentStats) return null;
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {attendanceData.departmentStats.map((dept, index) => {
          const totalPresent = dept.present + dept.late;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', borderRadius: 3, transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar sx={{ bgcolor: `${getDepartmentColor(dept.name)}20`, color: getDepartmentColor(dept.name), mr: 2 }}>
                      <SchoolIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{dept.name} Department</Typography>
                  </Box>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Present</Typography><Typography color={COLORS.present} fontWeight="bold">{totalPresent}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Absent</Typography><Typography color={COLORS.absent} fontWeight="bold">{dept.absent}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Late</Typography><Typography color={COLORS.late} fontWeight="bold">{dept.late}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">OD</Typography><Typography color={COLORS.od} fontWeight="bold">{dept.od}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Internship</Typography><Typography color={COLORS.internship} fontWeight="bold">{dept.internship}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Attendance %</Typography><Typography fontWeight="bold">{dept.attendancePercentage}%</Typography></Grid>
                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Total</Typography><Typography fontWeight="bold">{dept.total}</Typography></Grid>
                  </Grid>
                  <Box sx={{ height: 120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ name: 'Present', value: totalPresent }, { name: 'Absent', value: dept.absent }, { name: 'Late', value: dept.late }, { name: 'OD', value: dept.od }, { name: 'Internship', value: dept.internship }]} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">
                          {[COLORS.present, COLORS.absent, COLORS.late, COLORS.od, COLORS.internship].map((color, idx) => (<Cell key={`cell-${idx}`} fill={color} />))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // DepartmentComparisonChart using real API data - Same for all views
  const DepartmentComparisonChart = () => {
    if (!attendanceData || !attendanceData.departmentStats) return null;
    return (
      <Card sx={{ mb: 3, borderRadius: 3, transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Department-wise Attendance Comparison</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData.departmentStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} />
                <XAxis dataKey="name" tick={{ fill: theme.palette.text.primary }} />
                <YAxis tick={{ fill: theme.palette.text.primary }} />
                <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[2] }} itemStyle={{ color: theme.palette.text.primary }} labelStyle={{ color: theme.palette.text.primary, fontWeight: 'bold' }} />
                <Legend />
                <Bar dataKey="present" fill={COLORS.present} name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill={COLORS.absent} name="Absent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill={COLORS.late} name="Late" radius={[4, 4, 0, 0]} />
                <Bar dataKey="od" fill={COLORS.od} name="OD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="internship" fill={COLORS.internship} name="Internship" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // TimeSeriesChart using real API data - Different for weekly/monthly
  const TimeSeriesChart = () => {
    if (!attendanceData || !attendanceData.timeSeriesData) return null;
    
    if (viewMode === 'weekly') {
      return (
        <Card sx={{ mb: 3, borderRadius: 3, transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Weekly Attendance Trend</Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData.timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} />
                  <XAxis dataKey="name" tick={{ fill: theme.palette.text.primary }} />
                  <YAxis tick={{ fill: theme.palette.text.primary }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[2] }} itemStyle={{ color: theme.palette.text.primary }} labelStyle={{ color: theme.palette.text.primary, fontWeight: 'bold' }} />
                  <Legend />
                  <Line type="monotone" dataKey="present" name="Present" stroke={COLORS.present} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="absent" name="Absent" stroke={COLORS.absent} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="late" name="Late" stroke={COLORS.late} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      );
    } else if (viewMode === 'monthly') {
      return (
        <Card sx={{ mb: 3, borderRadius: 3, transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Monthly Attendance Trend</Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData.timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} />
                  <XAxis dataKey="name" tick={{ fill: theme.palette.text.primary }} />
                  <YAxis tick={{ fill: theme.palette.text.primary }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[2] }} itemStyle={{ color: theme.palette.text.primary }} labelStyle={{ color: theme.palette.text.primary, fontWeight: 'bold' }} />
                  <Legend />
                  <Bar dataKey="present" fill={COLORS.present} name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill={COLORS.absent} name="Absent" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill={COLORS.late} name="Late" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  // DateRangeSelector: allow user to change date in all views
  const DateRangeSelector = () => (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {viewMode === 'daily' ? 'Select Date' : 'Select Date Range'}
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
                      value={format(dateRange.startDate, 'MMMM')}
                      onChange={(e) => {
                        const month = e.target.value;
                        const year = dateRange.startDate.getFullYear();
                        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
                        setDateRange({
                          startDate: new Date(year, monthIndex, 1),
                          endDate: new Date(year, monthIndex + 1, 0)
                        });
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = new Date(0, i).toLocaleString('default', { month: 'long' });
                        return (
                          <MenuItem key={month} value={month}>
                            {month}
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
                      value={Math.ceil(dateRange.startDate.getDate() / 7)}
                      onChange={(e) => {
                        const weekNumber = e.target.value;
                        const monthStart = startOfMonth(dateRange.startDate);
                        const weekStart = new Date(monthStart);
                        weekStart.setDate((weekNumber - 1) * 7 + 1);
                        setDateRange({
                          startDate: weekStart,
                          endDate: endOfWeek(weekStart)
                        });
                      }}
                    >
                      {[1, 2, 3, 4, 5].map(week => (
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
                      value={dateRange.startDate.getFullYear()}
                      onChange={(e) => {
                        const year = e.target.value;
                        const month = format(dateRange.startDate, 'MMMM');
                        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
                        setDateRange({
                          startDate: new Date(year, monthIndex, 1),
                          endDate: new Date(year, monthIndex + 1, 0)
                        });
                      }}
                    >
                      {Array.from({ length: new Date().getFullYear() - 2010 + 1 }, (_, i) => {
                        const year = 2010 + i;
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
                      value={format(dateRange.startDate, 'MMMM')}
                      onChange={(e) => {
                        const month = e.target.value;
                        const year = dateRange.startDate.getFullYear();
                        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
                        setDateRange({
                          startDate: new Date(year, monthIndex, 1),
                          endDate: new Date(year, monthIndex + 1, 0)
                        });
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = new Date(0, i).toLocaleString('default', { month: 'long' });
                        return (
                          <MenuItem key={month} value={month}>
                            {month}
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

  // StudentTableView using real API data
  const StudentTableView = () => (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Student Attendance Details</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                label="Department"
                onChange={handleDepartmentChange}
              >
                <MenuItem value="All">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={e => setSelectedYear(e.target.value)}
              >
                <MenuItem value="All">All Years</MenuItem>
                {[1,2,3,4].map(y => (
                  <MenuItem key={y} value={y.toString()}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={attendanceFilter}
                label="Status"
                onChange={e => setAttendanceFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="late">Late</MenuItem>
                <MenuItem value="od">OD</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search by SIN Number"
              value={studentTableSearch}
              onChange={handleStudentTableSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 200 }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={studentTableDate}
                onChange={setStudentTableDate}
                renderInput={params => <TextField {...params} size="small" sx={{ minWidth: 140 }} />}
                maxDate={new Date()}
                disabled={false}
              />
            </LocalizationProvider>
          </Box>
        </Box>
        {studentTableLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : studentTableError ? (
          <Alert severity="error">{studentTableError}</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white' }}>SIN Number</TableCell>
                  <TableCell sx={{ color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white' }}>Department</TableCell>
                  <TableCell sx={{ color: 'white' }}>Year</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white' }}>Attendance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentTableData.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No data available</TableCell></TableRow>
                ) : studentTableData
                  .filter(student => attendanceFilter === 'all' || student.status.toLowerCase() === attendanceFilter.toLowerCase())
                  .map((student) => (
                  <TableRow key={student.sin_number} hover>
                    <TableCell>{student.sin_number}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={student.department}
                        size="small"
                        sx={{ 
                          backgroundColor: `${getDepartmentColor(student.department)}20`,
                          color: getDepartmentColor(student.department),
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      <Chip 
                        label={student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        size="small"
                        sx={{ 
                          backgroundColor: `${getStatusColor(student.status)}20`,
                          color: getStatusColor(student.status),
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={student.attendancePercentage} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: `${theme.palette.primary.main}20`,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: student.attendancePercentage > 75 ? 
                                  green[500] : student.attendancePercentage > 50 ? 
                                  orange[500] : red[500],
                                borderRadius: 4
                              }
                            }} 
                          />
                        </Box>
                        <Typography variant="body2">
                          {student.attendancePercentage}%
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

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, mt:-10, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : !attendanceData ? (
          <Alert severity="info" sx={{ mb: 2 }}>No data available for the selected range.</Alert>
        ) : (
          <>
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
                College Attendance Dashboard
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2
              }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={selectedDepartment}
                    label="Department"
                    onChange={handleDepartmentChange}
                  >
                    <MenuItem value="All">All Departments</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color={showTableView ? "secondary" : "primary"}
                  startIcon={showTableView ? <BarChartIcon /> : <TableChartIcon />}
                  onClick={() => setShowTableView(!showTableView)}
                  size={isMobile ? "small" : "medium"}
                >
                  {showTableView ? "Show Charts" : "Show Student List"}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={downloadAttendance}
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

            <DateRangeSelector />

            {showTableView ? (
              <StudentTableView />
            ) : (
              <>
                {selectedDepartment === 'All' ? (
                  <>
                    <DepartmentComparisonChart />
                    <DepartmentCards />
                  </>
                ) : (
                  <TimeSeriesChart />
                )}
              </>
            )}
          </>
        )}
      </Box>
      
      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Logout"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to logout from your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
      
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