
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
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const CSEAttendanceDashboard = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // API Data states
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

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

  // View mode state
  const [viewMode, setViewMode] = useState('daily');
  const [selectedSemesters, setSelectedSemesters] = useState({
    '1st Year': 'Semester 1',
    '2nd Year': 'Semester 3',
    '3rd Year': 'Semester 5',
    '4th Year': 'Semester 7',
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showTableView, setShowTableView] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [expandedYear, setExpandedYear] = useState(null);

  // Add new state for student table data
  const [studentTableData, setStudentTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tableDate, setTableDate] = useState(new Date(Date.now() - 86400000)); // Yesterday's date
  const [isSearching, setIsSearching] = useState(false);
  const [tableYear, setTableYear] = useState('');

  // Color Scheme
  const COLORS = {
    present: teal[500],
    absent: red[500],
    late: orange[500],
    od: deepPurple[500],
    internship: pink[500],
    firstYear: indigo[500],
    secondYear: teal[800],
    thirdYear: orange[800],
    fourthYear: grey[600],
    chartBackground: '#f5f7fa',
    chartGrid: '#e0e0e0',
    earlyDeparture: blue[500],
    totalStudents: grey[700],
    holiday: grey[400]
  };

  // Dummy data
  const departmentData = {
    totalStudents: 480,
    attendancePercentage: 87.5
  };

  const attendanceStats = {
    daily: {
      present: 420,
      absent: 45,
      late: 10,
      od: 5,
      internship: 15,
      earlyDeparture: 8
    },
    weekly: {
      present: 2100,
      absent: 225,
      late: 50,
      od: 25,
      internship: 75,
      earlyDeparture: 40
    },
    monthly: {
      present: 8400,
      absent: 900,
      late: 200,
      od: 100,
      internship: 300,
      earlyDeparture: 160
    },
    yearly: {
      present: 100800,
      absent: 10800,
      late: 2400,
      od: 1200,
      internship: 3600,
      earlyDeparture: 1920
    },
  };

  // Fetch attendance data
  const fetchAttendanceData = async (date) => {
    if (!user?.department) return;
    
    setLoading(true);
    setError(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(
        `${API_BASE_URL}/hod/department-daily-attendance?date=${formattedDate}&department=${encodeURIComponent(user.department)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const result = await response.json();
      if (result.success) {
        setAttendanceData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch attendance data');
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly attendance data
  const fetchWeeklyAttendanceData = async (month, weekNumber) => {
    if (!user?.department) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/hod/department-weekly-attendance?month=${month}&weekNumber=${weekNumber}&department=${encodeURIComponent(user.department)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weekly attendance data');
      }

      const result = await response.json();
      if (result.success) {
        setAttendanceData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch weekly attendance data');
      }
    } catch (err) {
      console.error('Error fetching weekly attendance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly attendance data
  const fetchMonthlyAttendanceData = async (month, year) => {
    if (!user?.department) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/hod/department-monthly-attendance?month=${month}&year=${year}&department=${encodeURIComponent(user.department)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch monthly attendance data');
      }

      const result = await response.json();
      if (result.success) {
        setAttendanceData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch monthly attendance data');
      }
    } catch (err) {
      console.error('Error fetching monthly attendance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when date changes
  useEffect(() => {
    if (viewMode === 'daily' && user?.department) {
      fetchAttendanceData(dateRange.startDate);
    }
  }, [dateRange.startDate, user?.department, viewMode]);

  // Fetch weekly data when week changes
  useEffect(() => {
    if (viewMode === 'weekly' && user?.department) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = months[selectedMonth];
      fetchWeeklyAttendanceData(monthName, selectedWeek);
    }
  }, [selectedMonth, selectedWeek, user?.department, viewMode]);

  // Fetch monthly data when month or year changes
  useEffect(() => {
    if (viewMode === 'monthly' && user?.department) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = months[selectedMonth];
      fetchMonthlyAttendanceData(monthName, selectedYear);
    }
  }, [selectedMonth, selectedYear, user?.department, viewMode]);

  // Generate time series data based on view mode
  const generateTimeSeriesData = () => {
    const { startDate, endDate } = dateRange;
    
    switch(viewMode) {
      case 'daily':
        return eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
          date: format(date, 'yyyy-MM-dd'),
          name: format(date, 'MMM dd'),
          present: Math.floor(Math.random() * 50) + 400,
          absent: Math.floor(Math.random() * 10) + 5,
          late: Math.floor(Math.random() * 5),
          od: Math.floor(Math.random() * 3),
          internship: Math.floor(Math.random() * 5)
        }));
      case 'weekly':
        return eachWeekOfInterval({ start: startDate, end: endDate }).map((date, index) => ({
          date: format(date, 'yyyy-MM-dd'),
          name: `Week ${index + 1}`,
          present: Math.floor(Math.random() * 200) + 1900,
          absent: Math.floor(Math.random() * 50) + 25,
          late: Math.floor(Math.random() * 15),
          od: Math.floor(Math.random() * 10),
          internship: Math.floor(Math.random() * 20)
        }));
      case 'monthly':
        return eachMonthOfInterval({ start: startDate, end: endDate }).map(date => ({
          date: format(date, 'yyyy-MM-dd'),
          name: format(date, 'MMM yyyy'),
          present: Math.floor(Math.random() * 800) + 7600,
          absent: Math.floor(Math.random() * 200) + 100,
          late: Math.floor(Math.random() * 50),
          od: Math.floor(Math.random() * 30),
          internship: Math.floor(Math.random() * 80)
        }));
      case 'yearly':
        return Array.from({ length: endDate.getFullYear() - startDate.getFullYear() + 1 }, (_, i) => ({
          date: `${startDate.getFullYear() + i}-01-01`,
          name: `${startDate.getFullYear() + i}`,
          present: Math.floor(Math.random() * 10000) + 90000,
          absent: Math.floor(Math.random() * 2000) + 1000,
          late: Math.floor(Math.random() * 500),
          od: Math.floor(Math.random() * 300),
          internship: Math.floor(Math.random() * 800)
        }));
      default:
        return [];
    }
  };

  const timeSeriesData = generateTimeSeriesData();

  // Student data for table view
  const studentData = [
    { id: 1, name: 'John Doe', rollNo: 'CSE001', year: '1st Year', semester: 'Semester 1', status: 'present', attendancePercentage: 95 },
    { id: 2, name: 'Jane Smith', rollNo: 'CSE002', year: '1st Year', semester: 'Semester 1', status: 'present', attendancePercentage: 92 },
    { id: 3, name: 'Robert Johnson', rollNo: 'CSE003', year: '1st Year', semester: 'Semester 1', status: 'absent', attendancePercentage: 78 },
    { id: 4, name: 'Emily Davis', rollNo: 'CSE004', year: '1st Year', semester: 'Semester 1', status: 'late', attendancePercentage: 85 },
    { id: 5, name: 'Michael Brown', rollNo: 'CSE005', year: '1st Year', semester: 'Semester 1', status: 'od', attendancePercentage: 90 },
    { id: 6, name: 'Sarah Wilson', rollNo: 'CSE006', year: '1st Year', semester: 'Semester 1', status: 'internship', attendancePercentage: 88 },
    { id: 7, name: 'David Taylor', rollNo: 'CSE007', year: '2nd Year', semester: 'Semester 3', status: 'present', attendancePercentage: 91 },
    { id: 8, name: 'Jessica Anderson', rollNo: 'CSE008', year: '2nd Year', semester: 'Semester 3', status: 'absent', attendancePercentage: 75 },
    { id: 9, name: 'Thomas Martinez', rollNo: 'CSE009', year: '2nd Year', semester: 'Semester 3', status: 'late', attendancePercentage: 82 },
    { id: 10, name: 'Lisa Robinson', rollNo: 'CSE010', year: '2nd Year', semester: 'Semester 3', status: 'od', attendancePercentage: 89 },
    { id: 11, name: 'Daniel White', rollNo: 'CSE011', year: '3rd Year', semester: 'Semester 5', status: 'present', attendancePercentage: 93 },
    { id: 12, name: 'Karen Lee', rollNo: 'CSE012', year: '3rd Year', semester: 'Semester 5', status: 'absent', attendancePercentage: 70 },
    { id: 13, name: 'James Harris', rollNo: 'CSE013', year: '3rd Year', semester: 'Semester 5', status: 'internship', attendancePercentage: 87 },
    { id: 14, name: 'Nancy Clark', rollNo: 'CSE014', year: '4th Year', semester: 'Semester 7', status: 'present', attendancePercentage: 94 },
    { id: 15, name: 'Paul Lewis', rollNo: 'CSE015', year: '4th Year', semester: 'Semester 7', status: 'absent', attendancePercentage: 68 },
  ];

  // Year-wise data
  const yearData = [
    {
      year: '1st Year',
      present: 218,
      absent: 18,
      late: 3,
      od: 1,
      internship: 0,
      earlyDeparture: 3,
      attendancePercentage: 90.83
    },
    {
      year: '2nd Year',
      present: 207,
      absent: 27,
      late: 4,
      od: 2,
      internship: 0,
      earlyDeparture: 7,
      attendancePercentage: 86.25
    },
    {
      year: '3rd Year',
      present: 193,
      absent: 38,
      late: 6,
      od: 3,
      internship: 10,
      earlyDeparture: 11,
      attendancePercentage: 80.42
    },
    {
      year: '4th Year',
      present: 182,
      absent: 42,
      late: 10,
      od: 6,
      internship: 25,
      earlyDeparture: 15,
      attendancePercentage: 75.83
    }
  ];

  const handleTabChange = (event, newValue) => {
    setViewMode(newValue);
    // Set default date range based on view mode
    const today = new Date();
    switch(newValue) {
      case 'daily':
        setDateRange({
          startDate: today,
          endDate: today
        });
        break;
      case 'weekly':
        setDateRange({
          startDate: startOfWeek(today),
          endDate: endOfWeek(today)
        });
        break;
      case 'monthly':
        setDateRange({
          startDate: startOfMonth(today),
          endDate: endOfMonth(today)
        });
        setSelectedYear(today.getFullYear());
        break;
      default:
        break;
    }
  };

  const handleSemesterChange = (year, semester) => {
    setSelectedSemesters(prev => ({ ...prev, [year]: semester }));
  };

  const getYearColor = (year) => {
    switch(year) {
      case '1st Year': return COLORS.firstYear;
      case '2nd Year': return COLORS.secondYear;
      case '3rd Year': return COLORS.thirdYear;
      case '4th Year': return COLORS.fourthYear;
      default: return theme.palette.primary.main;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return COLORS.present;
      case 'absent': return COLORS.absent;
      case 'late': return COLORS.late;
      case 'od': return COLORS.od;
      case 'internship': return COLORS.internship;
      case 'earlyDeparture': return COLORS.earlyDeparture;
      case 'holiday': return COLORS.holiday;
      default: return theme.palette.primary.main;
    }
  };

  const currentStats = attendanceStats[viewMode];
  const totalStudents = departmentData.totalStudents;

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
      let fileName = 'cse_department_attendance';
      
      switch(viewMode) {
        case 'daily':
          dataToExport = [{
            Date: format(dateRange.startDate, 'yyyy-MM-dd'),
            Present: currentStats.present,
            Absent: currentStats.absent,
            Late: currentStats.late,
            OD: currentStats.od,
            Internship: currentStats.internship,
            'Early Departure': currentStats.earlyDeparture,
            'Total Students': totalStudents,
            Percentage: departmentData.attendancePercentage
          }];
          fileName = `daily_attendance_${format(dateRange.startDate, 'yyyyMMdd')}`;
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
            'Early Departure': currentStats.earlyDeparture,
            'Total Students': totalStudents,
            Percentage: departmentData.attendancePercentage
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
            'Early Departure': currentStats.earlyDeparture,
            'Total Students': totalStudents,
            Percentage: departmentData.attendancePercentage
          }];
          fileName = `monthly_attendance_${format(dateRange.startDate, 'yyyyMM')}`;
          break;
          
        case 'yearly':
          dataToExport = [{
            Year: format(dateRange.startDate, 'yyyy'),
            Present: currentStats.present,
            Absent: currentStats.absent,
            Late: currentStats.late,
            OD: currentStats.od,
            Internship: currentStats.internship,
            'Early Departure': currentStats.earlyDeparture,
            'Total Students': totalStudents,
            Percentage: departmentData.attendancePercentage
          }];
          fileName = `yearly_attendance_${format(dateRange.startDate, 'yyyy')}`;
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

  const fetchStudentTableData = async () => {
    if (!user?.department) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        department: user.department,
        ...(tableYear && { year: tableYear }),
        ...(searchQuery && { search: searchQuery }),
        date: format(tableDate, 'yyyy-MM-dd')
      });

      const response = await fetch(
        `${API_BASE_URL}/hod/department-student-attendance?${params}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch student attendance data');
      }

      const result = await response.json();
      if (result.success) {
        setStudentTableData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch student attendance data');
      }
    } catch (err) {
      console.error('Error fetching student attendance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (showTableView && !isSearching) {
      fetchStudentTableData();
    }
  }, [showTableView, tableYear, tableDate, user?.department]);

  const handleSearch = () => {
    setIsSearching(true);
    fetchStudentTableData();
  };

  const downloadStudentData = () => {
    try {
      const dataToExport = studentTableData
        .filter(student => attendanceFilter === 'all' || student.status === attendanceFilter)
        .map(student => ({
          'SIN Number': student.sin_number,
          'Name': student.name,
          'Year': `${student.year}${getOrdinalSuffix(parseInt(student.year))} Year`,
          'Status': student.status.charAt(0).toUpperCase() + student.status.slice(1),
          'Attendance Percentage': student.attendancePercentage
        }));
      
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");
      XLSX.writeFile(workbook, `student_attendance_${format(tableDate, 'yyyy-MM-dd')}.xlsx`);
      
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

  const filteredStudents = attendanceFilter === 'all' 
    ? studentData 
    : studentData.filter(student => student.status === attendanceFilter);

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };

  const StudentTableView = () => {
    const [filteredData, setFilteredData] = useState([]);
    const [localSearchQuery, setLocalSearchQuery] = useState('');

    useEffect(() => {
      setFilteredData(studentTableData);
    }, [studentTableData]);

    const handleSearchChange = (e) => {
      const value = e.target.value;
      setLocalSearchQuery(value);
      
      if (!value) {
        setFilteredData(studentTableData);
      } else {
        const filtered = studentTableData.filter(student => 
          student.sin_number.toLowerCase().includes(value.toLowerCase()) ||
          student.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
      }
    };

    return (
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Student Attendance Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={tableDate}
                  onChange={(newValue) => setTableDate(newValue)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                  inputFormat="MM/dd/yyyy"
                />
              </LocalizationProvider>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={tableYear}
                  label="Year"
                  onChange={(e) => setTableYear(e.target.value)}
                >
                  <MenuItem value="">All Years</MenuItem>
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  <MenuItem value="3">3rd Year</MenuItem>
                  <MenuItem value="4">4th Year</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={attendanceFilter}
                  label="Filter by Status"
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                >
                  <MenuItem value="all">All Students</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late Comers</MenuItem>
                  <MenuItem value="od">OD Approved</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                  <MenuItem value="holiday">Holiday</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                placeholder="Search by SIN number or name"
                value={localSearchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={downloadStudentData}
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
                  <TableCell sx={{ color: 'white' }}>SIN Number</TableCell>
                  <TableCell sx={{ color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white' }}>Year</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white' }}>Attendance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .filter(student => attendanceFilter === 'all' || student.status === attendanceFilter)
                  .map((student) => (
                  <TableRow key={student.sin_number} hover>
                    <TableCell>{student.sin_number}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.year}{getOrdinalSuffix(parseInt(student.year))} Year</TableCell>
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
        </CardContent>
      </Card>
    );
  };

  const SummaryCards = () => {
    if (!attendanceData) return null;

    const { departmentData, attendanceStats } = attendanceData;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Overall Attendance Card - Always shown */}
        <Grid item xs={12} md={viewMode === 'daily' ? 6 : 12} lg={viewMode === 'daily' ? 3 : 6}>
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
                  {departmentData.attendancePercentage}%
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={departmentData.attendancePercentage} 
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
                {attendanceStats.present} of {departmentData.totalStudents} students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Only show detailed cards in daily view */}
        {viewMode === 'daily' && (
          <>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${teal[300]} 0%, ${teal[500]} 100%)`,
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
                    {attendanceStats.present}
                  </Typography>
                  <Typography variant="body2">
                    {((attendanceStats.present / departmentData.totalStudents) * 100).toFixed(1)}% of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
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
                    {attendanceStats.absent}
                  </Typography>
                  <Typography variant="body2">
                    {((attendanceStats.absent / departmentData.totalStudents) * 100).toFixed(1)}% of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
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
                    {attendanceStats.late}
                  </Typography>
                  <Typography variant="body2">
                    {((attendanceStats.late / departmentData.totalStudents) * 100).toFixed(1)}% of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
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
                    {attendanceStats.earlyDeparture}
                  </Typography>
                  <Typography variant="body2">
                    {((attendanceStats.earlyDeparture / departmentData.totalStudents) * 100).toFixed(1)}% of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
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
                    OD Approved
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {attendanceStats.od}
                  </Typography>
                  <Typography variant="body2">
                    Official duty students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
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
                    Internship
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {attendanceStats.internship}
                  </Typography>
                  <Typography variant="body2">
                    Industry training students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
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
                    {departmentData.totalStudents}
                  </Typography>
                  <Typography variant="body2">
                    Department strength
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  const YearCards = () => {
    if (!attendanceData?.yearStats) return null;
        
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {attendanceData.yearStats.map((year, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              width: '90%',
              mr: 10.2,
              borderRadius: 3,
              transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
              '&:hover': { 
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar sx={{ 
                    bgcolor: `${getYearColor(year.year)}20`, 
                    color: getYearColor(year.year),
                    mr: 2
                  }}>
                    <ClassIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {year.year}
                  </Typography>
                </Box>

                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Present
                    </Typography>
                    <Typography color={COLORS.present} fontWeight="bold">
                      {year.present}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Absent
                    </Typography>
                    <Typography color={COLORS.absent} fontWeight="bold">
                      {year.absent}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Late
                    </Typography>
                    <Typography color={COLORS.late} fontWeight="bold">
                      {year.late}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Early Departure
                    </Typography>
                    <Typography color={COLORS.earlyDeparture} fontWeight="bold">
                      {year.earlyDeparture}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      OD
                    </Typography>
                    <Typography color={COLORS.od} fontWeight="bold">
                      {year.od}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Internship
                    </Typography>
                    <Typography color={COLORS.internship} fontWeight="bold">
                      {year.internship}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Attendance %
                    </Typography>
                    <Typography fontWeight="bold">
                      {year.attendancePercentage}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography fontWeight="bold">
                      {year.totalStudents}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: year.present },
                          { name: 'Absent', value: year.absent },
                          { name: 'Late', value: year.late },
                          { name: 'OD', value: year.od },
                          { name: 'Internship', value: year.internship },
                          { name: 'Early Departure', value: year.earlyDeparture },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[COLORS.present, COLORS.absent, COLORS.late, COLORS.od, COLORS.internship, COLORS.earlyDeparture].map(
                          (color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          )
                        )}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const YearComparisonChart = () => {
    if (!attendanceData?.yearStats) return null;

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
            Year-wise Attendance Comparison
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceData.yearStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} />
                <XAxis dataKey="year" tick={{ fill: theme.palette.text.primary }} />
                <YAxis tick={{ fill: theme.palette.text.primary }} />
                <RechartsTooltip 
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
                <Bar dataKey="present" fill={COLORS.present} name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill={COLORS.absent} name="Absent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill={COLORS.late} name="Late" radius={[4, 4, 0, 0]} />
                <Bar dataKey="od" fill={COLORS.od} name="OD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="internship" fill={COLORS.internship} name="Internship" radius={[4, 4, 0, 0]} />
                <Bar dataKey="earlyDeparture" fill={COLORS.earlyDeparture} name="Early Departure" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const TimeSeriesChart = () => {
    if (!attendanceData?.timeSeries) return null;

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
            {viewMode === 'daily' ? 'Daily Attendance Trend' : 
             viewMode === 'weekly' ? 'Weekly Attendance Trend' : 
             'Monthly Attendance Trend'}
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendanceData.timeSeries}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: theme.palette.text.primary }} 
                />
                <YAxis tick={{ fill: theme.palette.text.primary }} />
                <RechartsTooltip 
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
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke={COLORS.present} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Present" 
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke={COLORS.absent} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Absent" 
                />
                <Line 
                  type="monotone" 
                  dataKey="late" 
                  stroke={COLORS.late} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Late" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const DateRangeSelector = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const totalWeeks = 5;

    return (
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {viewMode === 'daily' && (
              <DatePicker
                label="Select Date"
                value={dateRange.startDate}
                onChange={(newValue) => {
                  setDateRange({
                    startDate: newValue,
                    endDate: newValue
                  });
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
                inputFormat="MM/dd/yyyy"
              />
            )}

            {viewMode === 'weekly' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Month"
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setSelectedWeek(1);
                      }}
                    >
                      {months.map((month, index) => (
                        <MenuItem key={index} value={index}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Week</InputLabel>
                    <Select
                      value={selectedWeek}
                      label="Week"
                      onChange={(e) => {
                        setSelectedWeek(e.target.value);
                      }}
                    >
                      {Array.from({ length: totalWeeks }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          Week {i + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {viewMode === 'monthly' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Month"
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        const newDate = new Date(selectedYear, e.target.value, 1);
                        setDateRange({
                          startDate: startOfMonth(newDate),
                          endDate: endOfMonth(newDate)
                        });
                      }}
                    >
                      {months.map((month, index) => (
                        <MenuItem key={index} value={index}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={selectedYear}
                      label="Year"
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        const newDate = new Date(e.target.value, selectedMonth, 1);
                        setDateRange({
                          startDate: startOfMonth(newDate),
                          endDate: endOfMonth(newDate)
                        });
                      }}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </LocalizationProvider>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              mt: -3,
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
                {user?.department} Department Attendance Dashboard
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2
              }}>
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
                  Export Data
                </Button>
              </Box>
            </Box>

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
                <DateRangeSelector />
                <TimeSeriesChart />
                <YearComparisonChart />
                <YearCards />
              </>
            )}

            {showTableView && <StudentTableView />}
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

export default CSEAttendanceDashboard;