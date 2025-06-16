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
  
  // State for class advisor info
  const [classAdvisorInfo, setClassAdvisorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  
  // View mode state
  const [viewMode, setViewMode] = useState('daily');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [semester, setSemester] = useState('V');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [studentView, setStudentView] = useState(false);
  const [showTableView, setShowTableView] = useState(false);

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

  // Get class advisor info from session storage
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setClassAdvisorInfo(parsedUser);
    }
  }, []);

  // Fetch attendance data based on view mode
  const fetchAttendanceData = async () => {
    if (!classAdvisorInfo?.sin_number) return;

    try {
      setLoading(true);
      setError(null);
      let response;

      switch (viewMode) {
        case 'daily':
          response = await axios(`${API_BASE_URL}/mentor/daily-attendance`, {
            params: {
              date: format(selectedDate, 'yyyy-MM-dd'),
              sin_number: classAdvisorInfo.sin_number
            }
          });
          break;

        case 'weekly':
          response = await axios(`${API_BASE_URL}/mentor/weekly-attendance`, {
            params: {
              month: format(new Date(selectedYear, selectedMonth, 1), 'MMMM').toLowerCase(),
              weekNumber: selectedWeek,
              sin_number: classAdvisorInfo.sin_number
            }
          });
          break;

        case 'monthly':
          response = await axios(`${API_BASE_URL}/mentor/monthly-attendance`, {
            params: {
              year: selectedYear,
              month: format(new Date(selectedYear, selectedMonth, 1), 'MMMM').toLowerCase(),
              sin_number: classAdvisorInfo.sin_number
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
    if (!classAdvisorInfo?.sin_number) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios(`${API_BASE_URL}/mentor/student-attendance`, {
        params: {
          sin_number: classAdvisorInfo.sin_number,
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
    if (classAdvisorInfo?.sin_number) {
      fetchAttendanceData();
    }
  }, [viewMode, selectedDate, selectedMonth, selectedYear, selectedWeek, classAdvisorInfo?.sin_number]);

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

  // Calculate working days based on view mode
  const getWorkingDays = () => {
    if (viewMode === 'daily') return 1;
    if (viewMode === 'weekly') {
      const { startDate, endDate } = getWeekRangeInMonth(selectedYear, selectedMonth, selectedWeek);
      let days = 0;
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        days++;
      }
      return days;
    }
    if (viewMode === 'monthly') {
      return new Date(selectedYear, selectedMonth + 1, 0).getDate();
    }
    if (viewMode === 'yearly') return 365;
    if (viewMode === 'semester') return 120; // Approximate semester days
    return 1;
  };

  const getFilteredData = () => {
    if (!attendanceData) return [];
    
    let filtered = [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    if (viewMode === 'daily') {
      filtered = attendanceData.timeSeriesData || [];
    } else if (viewMode === 'weekly') {
      const { startDate, endDate } = getWeekRangeInMonth(selectedYear, selectedMonth, selectedWeek);
      filtered = attendanceData.timeSeriesData || [];
    } else if (viewMode === 'monthly') {
      filtered = attendanceData.timeSeriesData || [];
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    return filtered;
  };

  const calculateSummary = () => {
    if (!attendanceData) {
      return {
        total: 0,
        presentStudents: 0,
        absentStudents: 0,
        lateStudents: 0,
        odStudents: 0,
        internshipStudents: 0,
        earlyDepartureStudents: 0,
        workingDays: 0,
        attendancePercentage: 0
      };
    }

    const stats = attendanceData.attendanceStats || {
      present: 0,
      absent: 0,
      late: 0,
      od: 0,
      internship: 0,
      earlyDeparture: 0
    };

    const departmentData = attendanceData.departmentData || {
      totalStudents: 0,
      attendancePercentage: 0
    };

    // Calculate attendance percentage based on view mode
    let attendancePercentage = 0;
    const totalStudents = departmentData.totalStudents || 0;
    const presentCount = stats.present || 0;
    const odCount = stats.od || 0;
    const internshipCount = stats.internship || 0;

    if (viewMode === 'daily') {
      // For daily view, use the percentage from API (which is per day)
      attendancePercentage = departmentData.attendancePercentage || 0;
    } else if (viewMode === 'weekly' || viewMode === 'monthly') {
      // For weekly and monthly views, calculate percentage based on total possible attendance
      // Total possible attendance = total students * working days
      const totalPossibleAttendance = totalStudents * getWorkingDays();
      const actualAttendance = (presentCount + odCount + internshipCount);
      
      if (totalPossibleAttendance > 0) {
        attendancePercentage = Math.round((actualAttendance / totalPossibleAttendance) * 100);
      }
    }

    return {
      total: totalStudents,
      presentStudents: presentCount,
      absentStudents: stats.absent || 0,
      lateStudents: stats.late || 0,
      odStudents: odCount,
      internshipStudents: internshipCount,
      earlyDepartureStudents: stats.earlyDeparture || 0,
      workingDays: getWorkingDays(),
      attendancePercentage: attendancePercentage
    };
  };

  const getDisplayData = () => {
    const filtered = getFilteredData();
    
    return filtered.map(attendance => {
      const student = attendanceData[attendance.date]?.find(s => s.studentId === attendance.studentId);
      return {
        ...attendance,
        studentName: student?.name || 'Unknown',
        rollNo: student?.rollNo || 'N/A',
        department: student?.department || 'N/A',
        semester: student?.semester || 'N/A',
        gender: student?.gender || 'male',
        date: attendance.date || new Date().toISOString().split('T')[0]
      };
    });
  };

  const getStudentAttendanceStats = () => {
    if (!attendanceData) return [];
    
    const stats = {};
    const workingDays = getWorkingDays();
    
    // Process timeSeriesData from the API response
    if (attendanceData.timeSeriesData) {
      attendanceData.timeSeriesData.forEach(record => {
        if (!stats[record.studentId]) {
          stats[record.studentId] = {
            studentId: record.studentId,
            name: record.name,
            rollNo: record.rollNo,
            department: record.department,
            semester: record.semester,
            present: 0,
            absent: 0,
            late: 0,
            od: 0,
            internship: 0,
            earlyDeparture: 0,
            totalDays: workingDays
          };
        }
        
        if (record.status) {
          stats[record.studentId][record.status]++;
        }
      });
    }
    
    // Convert to array and calculate percentages
    return Object.values(stats).map(student => ({
      ...student,
      attendancePercentage: Math.round(
        ((student.present + student.od + student.internship) / student.totalDays) * 100
      )
    }));
  };

  const getFilteredStudents = () => {
    const stats = getStudentAttendanceStats();
    
    if (studentStatusFilter === 'all') return stats;
    
    return stats.filter(student => {
      if (studentStatusFilter === 'present') return student.present > 0;
      if (studentStatusFilter === 'absent') return student.absent > 0;
      if (studentStatusFilter === 'late') return student.late > 0;
      if (studentStatusFilter === 'od') return student.od > 0;
      if (studentStatusFilter === 'internship') return student.internship > 0;
      if (studentStatusFilter === 'earlyDeparture') return student.earlyDeparture > 0;
      return true;
    });
  };

  const getChartData = () => {
    const summary = calculateSummary();
    
    return [
      { name: 'Present', value: summary.presentStudents, color: COLORS.present },
      { name: 'Absent', value: summary.absentStudents, color: COLORS.absent },
      { name: 'Late', value: summary.lateStudents, color: COLORS.late },
      { name: 'On Duty', value: summary.odStudents, color: COLORS.od },
      { name: 'Internship', value: summary.internshipStudents, color: COLORS.internship },
      { name: 'Early Departure', value: summary.earlyDepartureStudents, color: COLORS.earlyDeparture }
    ];
  };

  const exportToExcel = (data, fileNamePrefix) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      
      let fileName = fileNamePrefix || 'Attendance_';
      if (viewMode === 'daily') {
        fileName += selectedDate.toISOString().split('T')[0];
      } else if (viewMode === 'weekly') {
        fileName += `${new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'short' })}_Week${selectedWeek}_${selectedYear}`;
      } else if (viewMode === 'monthly') {
        fileName += new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'long' }) + '_' + selectedYear;
      } else if (viewMode === 'yearly') {
        fileName += selectedYear;
      } else if (viewMode === 'semester') {
        fileName += 'Semester_' + semester;
      }
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
      
      showSnackbar('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showSnackbar('Failed to export data', 'error');
    }
  };

  const exportStudentAttendance = () => {
    const data = getFilteredStudents().map(student => ({
      'Roll No': student.rollNo,
      'Name': student.name,
      'Department': student.department,
      'Semester': student.semester,
      'Present Days': student.present,
      'Absent Days': student.absent,
      'Late Arrivals': student.late,
      'On Duty Days': student.od,
      'Internship Days': student.internship,
      'Early Departures': student.earlyDeparture,
      'Working Days': student.totalDays,
      'Attendance Percentage': student.attendancePercentage + '%'
    }));
    
    exportToExcel(data, 'Student_Attendance_');
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const summary = calculateSummary();
  const chartData = getChartData();
  const displayData = getDisplayData();
  
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

  const SummaryCards = () => {
    if (viewMode === 'daily') {
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
                    {summary.attendancePercentage}%
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={summary.attendancePercentage} 
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
                  {summary.presentStudents + summary.odStudents + summary.internshipStudents} of {summary.total} students
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
                  {summary.presentStudents}
                </Typography>
                <Typography variant="body2">
                  {Math.round((summary.presentStudents / summary.total) * 100)}% of total
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
                  {summary.absentStudents}
                </Typography>
                <Typography variant="body2">
                  {Math.round((summary.absentStudents / summary.total) * 100)}% of total
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
                  {summary.lateStudents}
                </Typography>
                <Typography variant="body2">
                  {Math.round((summary.lateStudents / summary.total) * 100)}% of total
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
                  {summary.earlyDepartureStudents}
                </Typography>
                <Typography variant="body2">
                  {Math.round((summary.earlyDepartureStudents / summary.total) * 100)}% of total
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
                  {summary.odStudents}
                </Typography>
                <Typography variant="body2">
                  {Math.round((summary.odStudents / summary.total) * 100)}% of total
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
                  {summary.internshipStudents}
                </Typography>
                <Typography variant="body2">
                  {Math.round((summary.internshipStudents / summary.total) * 100)}% of total
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
                  {summary.total}
                </Typography>
                <Typography variant="body2">
                  Current period total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else {
      // For weekly and monthly views, show only the overall attendance card
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
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
                  Overall Attendance ({viewMode === 'weekly' ? 'Weekly' : 'Monthly'})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>
                    {summary.attendancePercentage}%
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={summary.attendancePercentage} 
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
                  {summary.presentStudents + summary.odStudents + summary.internshipStudents} of {summary.total * summary.workingDays} possible attendances
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {viewMode === 'weekly' ? 
                    `Week ${selectedWeek} of ${new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'long' })} ${selectedYear}` : 
                    `${new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
  };

  const AttendancePieChart = () => (
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
          Attendance Distribution
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
                formatter={(value, name, props) => [`${value} students`, name]}
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

  const AttendanceBarChart = () => {
    const data = [
      {
        name: 'Present',
        value: summary.presentStudents,
        fill: COLORS.present
      },
      {
        name: 'Absent',
        value: summary.absentStudents,
        fill: COLORS.absent
      },
      {
        name: 'Late',
        value: summary.lateStudents,
        fill: COLORS.late
      },
      {
        name: 'On Duty',
        value: summary.odStudents,
        fill: COLORS.od
      },
      {
        name: 'Internship',
        value: summary.internshipStudents,
        fill: COLORS.internship
      },
      {
        name: 'Early Departure',
        value: summary.earlyDepartureStudents,
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
            Attendance Statistics
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
                <Bar dataKey="value" name="Students">
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
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchStudentData = async () => {
        if (!classAdvisorInfo?.sin_number) return;

        try {
          setLoading(true);
          const response = await axios.get(`${API_BASE_URL}/mentor/student-attendance`, {
            params: {
              sin_number: classAdvisorInfo.sin_number,
              date: format(selectedDate, 'yyyy-MM-dd')
            }
          });

          if (response.data.success) {
            setStudentData(response.data.data);
          } else {
            throw new Error(response.data.message || 'Failed to fetch student data');
          }
        } catch (err) {
          console.error('Error fetching student data:', err);
          showSnackbar(err.message || 'Failed to fetch student data', 'error');
        } finally {
          setLoading(false);
        }
      };

      fetchStudentData();
    }, [selectedDate, classAdvisorInfo?.sin_number]);

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
              Student Attendance Records
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
                onClick={() => exportToExcel(studentData, 'Student_Attendance_')}
                size="small"
              >
                Export
              </Button>
            </Box>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
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
                  {studentData.length > 0 ? (
                    studentData
                      .filter(student => statusFilter === 'all' || student.status === statusFilter)
                      .map((student, index) => (
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
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>{student.attendancePercentage}%</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={student.attendancePercentage} 
                                sx={{ 
                                  width: 60,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: student.attendancePercentage >= 75 ? green[500] : 
                                                   student.attendancePercentage >= 60 ? orange[500] : red[500]
                                  }
                                }} 
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No attendance records found for the selected date
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  const StudentTable = () => {
    const filteredStudents = getFilteredStudents();
    
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
              Student Attendance Summary
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={studentStatusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Students</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late Arrivals</MenuItem>
                  <MenuItem value="od">On Duty</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                  <MenuItem value="earlyDeparture">Early Departures</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={exportStudentAttendance}
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
                  <TableCell sx={{ color: 'white' }}>Semester</TableCell>
                  <TableCell sx={{ color: 'white' }}>Present Days</TableCell>
                  <TableCell sx={{ color: 'white' }}>Absent Days</TableCell>
                  <TableCell sx={{ color: 'white' }}>Late Arrivals</TableCell>
                  <TableCell sx={{ color: 'white' }}>On Duty</TableCell>
                  <TableCell sx={{ color: 'white' }}>Internship</TableCell>
                  <TableCell sx={{ color: 'white' }}>Early Departures</TableCell>
                  <TableCell sx={{ color: 'white' }}>Attendance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.semester}</TableCell>
                      <TableCell>{student.present}</TableCell>
                      <TableCell>{student.absent}</TableCell>
                      <TableCell>{student.late}</TableCell>
                      <TableCell>{student.od}</TableCell>
                      <TableCell>{student.internship}</TableCell>
                      <TableCell>{student.earlyDeparture}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>{student.attendancePercentage}%</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={student.attendancePercentage} 
                            sx={{ 
                              width: 60,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: student.attendancePercentage >= 75 ? green[500] : 
                                               student.attendancePercentage >= 60 ? orange[500] : red[500]
                              }
                            }} 
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      No student records found
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
          Select Date
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            {viewMode === 'weekly' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Week</InputLabel>
                  <Select
                    value={selectedWeek}
                    label="Week"
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
            )}
            {viewMode === 'monthly' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="Month"
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i} value={i}>
                        {new Date(selectedYear, i, 1).toLocaleString('default', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {(viewMode === 'monthly' || viewMode === 'yearly') && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <MenuItem key={i} value={new Date().getFullYear() - i}>
                        {new Date().getFullYear() - i}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {viewMode === 'semester' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={semester}
                    label="Semester"
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((sem) => (
                      <MenuItem key={sem} value={sem}>
                        Semester {sem}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
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
      overflow: 'auto',
      p: isMobile ? 1 : 3,
      ml: isMobile ? 0 : -38,
      mt: isMobile ? 0 : -28
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
          width: '100%',
          overflow: 'auto',
          p: isMobile ? 1 : 3
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
              Class Advisor Attendance Dashboard
            </Typography>
            
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
                  {showTableView ? "Show Charts" : "Show Student List"}
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={exportStudentAttendance}
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

          <DateSelector />

          {viewMode === 'daily' && showTableView ? (
            <AttendanceTableView />
          ) : (
            <>
              <AttendancePieChart />
              <AttendanceBarChart />
              {(viewMode === 'weekly' || viewMode === 'monthly') && <StudentTable />}
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