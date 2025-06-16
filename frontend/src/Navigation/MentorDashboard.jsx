import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Badge,
  LinearProgress,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Collapse,
  CardHeader,
  CardActionArea,
  Tooltip,
  Fab,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Skeleton,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Snackbar,
  Alert,
  styled,
  FormHelperText,
  CircularProgress
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Groups as GroupsIcon,
  RequestPage as RequestPageIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  AccessTime as TimeIcon,
  Today as TodayIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  Event as EventIcon,
  DateRange as DateRangeIcon,
  ListAlt as ListAltIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
   RequestQuote as RequestQuoteIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import { format, subMonths, addDays, isWithinInterval } from 'date-fns';
import { DataGrid } from '@mui/x-data-grid';
import logo from '../assets/logo.png';

// Import your components
import MenteesList from "../components/Mentor/MenteesList";
import MenteesRequestTable from "../components/Mentor/MenteesRequestTable";
import MenteesAttendance from "../components/Mentor/MenteesAttendance";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';
// Styled components for sidebar
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 280,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#1a237e',
  color: theme.palette.primary.contrastText,
}));

const SidebarContent = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const SidebarFooter = styled(Box)({
  padding: '16px',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
});
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : null;
};

const getHolidayColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'academic':
      return '#2196F3'; // Blue
    case 'events':
      return '#4CAF50'; // Green
    case 'holidays':
      return '#F44336'; // Red
    case 'meetings':
      return '#FF9800'; // Orange
    default:
      return '#9E9E9E'; // Grey
  }
};

const MentorDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { logout, changePassword } = useAuth();
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [mentorData, setMentorData] = useState({
    notifications: [],
    mentees: [],
    requests: []
  });
  const [filteredData, setFilteredData] = useState(null);
  const [currentView, setCurrentView] = useState("mentees");
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('monthly');
  const [exportLoading, setExportLoading] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [selectedCalendarType, setSelectedCalendarType] = useState('academic');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [user, setUser] = useState('');
  const [formData, setFormData] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchorEl);
  const [requestCounts, setRequestCounts] = useState({
    pendingLeaveRequests: 0,
    pendingODRequests: 0,
    pendingInternshipRequests: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    approvedOD: 0,
    rejectedOD: 0,
    approvedInternship: 0,
    rejectedInternship: 0
  });

  // Departments, years and semesters data
  const departments = ['All Departments', 'Computer Science', 'Information Technology', 'ECE', 'Mechanical', 'BME', 'Agri'];
  const years = ['All Years', '2020', '2021', '2022', '2023', '2024'];
  // const semesters = ['All Semesters', '1', '2', '3', '4', '5', '6', '7', '8'];
  const timeFrames = ['daily', 'weekly', 'monthly'];
  const calendarTypes = ['academic', 'events', 'holidays', 'meetings'];

  // Academic calendar data
  const academicCalendar = [
    { id: 1, title: 'Semester 1 Begins', date: '2023-06-01', type: 'academic' },
    { id: 2, title: 'Mid-Term Exams', date: '2023-08-15', type: 'academic' },
    { id: 3, title: 'Semester 1 Ends', date: '2023-11-30', type: 'academic' },
    { id: 4, title: 'Semester 2 Begins', date: '2023-12-01', type: 'academic' },
    { id: 5, title: 'Annual Day', date: '2023-09-20', type: 'events' },
    { id: 6, title: 'Tech Fest', date: '2023-10-15', type: 'events' },
    { id: 7, title: 'Independence Day', date: '2023-08-15', type: 'holidays' },
    { id: 8, title: 'Diwali Holidays', date: '2023-11-12', type: 'holidays' },
    { id: 9, title: 'Mentor Meeting', date: '2023-07-10', type: 'meetings' },
    { id: 10, title: 'Parent-Teacher Meeting', date: '2023-09-25', type: 'meetings' },
  ];

  // Add new state for attendance data
  const [attendanceData, setAttendanceData] = useState({
    departmentData: { totalStudents: 0, attendancePercentage: 0 },
    attendanceStats: {
      present: 0,
      absent: 0,
      late: 0,
      od: 0,
      internship: 0,
      earlyDeparture: 0
    },
    timeSeriesData: []
  });

  // Add new state for performance data
  const [performanceData, setPerformanceData] = useState({
    attendanceTrend: [],
    requestDistribution: [],
    studentMetrics: []
  });

  // Add new state for yesterday's attendance data
  const [yesterdayAttendance, setYesterdayAttendance] = useState({
    present: 0,
    absent: 0,
    late: 0,
    od: 0,
    internship: 0,
    earlyDeparture: 0
  });
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(prev => ({
        ...prev,
        ...parsedUser,
        ...(parsedUser.position_1 === 1 && { role: "Mentor" }),
        ...(parsedUser.position_2 === 2 && { role: "Class Advisor" }),
        ...(Array.isArray(parsedUser.position_1) && parsedUser.position_1.includes(1) && parsedUser.position_2.includes(2) && { role: "Mentor & Class Advisor" })
      }));
      setFormData(parsedUser);
    }
  }, []);
  // Prevent navigation away from the page
  useEffect(() => {
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);

  // Filter data based on selections
  useEffect(() => {
    if (mentorData) {
      let filteredMentees = [...(mentorData.mentees || [])];
      let filteredRequests = [...(mentorData.requests || [])];

      // Filter by department
      if (selectedDepartment !== 'All Departments') {
        filteredMentees = filteredMentees.filter(mentee => mentee.department === selectedDepartment);
        filteredRequests = filteredRequests.filter(request => request.department === selectedDepartment);
      }

      // Filter by year
      if (selectedYear !== 'All Years') {
        filteredMentees = filteredMentees.filter(mentee => mentee.year === selectedYear);
        filteredRequests = filteredRequests.filter(request => request.year === selectedYear);
      }

      // Filter by search text
      if (searchText) {
        filteredMentees = filteredMentees.filter(mentee => 
          mentee.name?.toLowerCase().includes(searchText.toLowerCase()) || 
          mentee.id?.toLowerCase().includes(searchText.toLowerCase())
        );
        
        filteredRequests = filteredRequests.filter(request => 
          request.studentName?.toLowerCase().includes(searchText.toLowerCase()) || 
          request.studentId?.toLowerCase().includes(searchText.toLowerCase()) ||
          request.type?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // Calculate statistics for filtered data
      const menteesStatusCounts = filteredMentees.reduce((acc, mentee) => {
        acc[mentee.statusType] = (acc[mentee.statusType] || 0) + 1;
        return acc;
      }, {});

      const requestTypeCounts = filteredRequests.reduce((acc, request) => {
        acc[request.type] = (acc[request.type] || 0) + 1;
        return acc;
      }, {});

      const attendanceStats = {
        present: Math.round(filteredMentees.reduce((sum, mentee) => sum + (mentee.attendance || 0), 0) / (filteredMentees.length || 1)) || 0,
        absent: Math.round(filteredMentees.reduce((sum, mentee) => sum + (100 - (mentee.attendance || 0)), 0) / (filteredMentees.length || 1)) || 0,
        leave: filteredRequests.filter(req => req.type === 'Leave' && req.status === 'Approved').length,
        od: filteredRequests.filter(req => req.type === 'OD' && req.status === 'Approved').length,
        monthlyTrend: Array.from({ length: 6 }, (_, i) => {
          const monthDate = subMonths(new Date(), 5 - i);
          const monthName = format(monthDate, 'MMM');
          const monthMentees = filteredMentees.filter(mentee => {
            const menteeDate = new Date(mentee.lastMeeting);
            return menteeDate.getMonth() === monthDate.getMonth() && 
                   menteeDate.getFullYear() === monthDate.getFullYear();
          });
          
          const presentCount = monthMentees.filter(m => m.statusType === 'Present').length;
          const absentCount = monthMentees.filter(m => m.statusType === 'Absent').length;
          
          return {
            name: monthName,
            present: Math.round((presentCount / (monthMentees.length || 1)) * 100) || 0,
            absent: Math.round((absentCount / (monthMentees.length || 1)) * 100) || 0,
          };
        }),
        attendanceByType: [
          { name: "Present", value: menteesStatusCounts.Present || 0 },
          { name: "Absent", value: menteesStatusCounts.Absent || 0 },
          { name: "Leave", value: filteredRequests.filter(req => req.type === 'Leave' && req.status === 'Approved').length },
          { name: "OD", value: filteredRequests.filter(req => req.type === 'OD' && req.status === 'Approved').length },
        ],
        performanceTrend: Array.from({ length: 6 }, (_, i) => {
          const monthDate = subMonths(new Date(), 5 - i);
          const monthName = format(monthDate, 'MMM');
          const monthMentees = filteredMentees.filter(mentee => {
            const menteeDate = new Date(mentee.lastMeeting);
            return menteeDate.getMonth() === monthDate.getMonth() && 
                   menteeDate.getFullYear() === monthDate.getFullYear();
          });
          
          const avgPerformance = monthMentees.length > 0 
            ? Math.round(monthMentees.reduce((sum, mentee) => sum + (mentee.performance || 0), 0) / monthMentees.length)
            : 0;
            
          return {
            name: monthName,
            performance: avgPerformance
          };
        })
      };

      setFilteredData({
        ...mentorData,
        mentees: filteredMentees,
        requests: filteredRequests,
        menteesCount: filteredMentees.length,
        pendingRequests: filteredRequests.filter(req => req.status === 'Pending').length,
        approvedRequests: filteredRequests.filter(req => req.status === 'Approved').length,
        rejectedRequests: filteredRequests.filter(req => req.status === 'Rejected').length,
        attendanceStats,
        menteesStatusCounts,
        requestTypeCounts
      });
    }
  }, [mentorData, selectedDepartment, selectedYear, searchText]);

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true);
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const response = await axios.get(`${API_BASE_URL}/mentor/mentees/${parsedUser.sin_number}`);
          if (response.data.status === "success") {
            setMentorData(response.data);
            setRequestCounts(response.data.requestCounts);
          }
        }
      } catch (error) {
        console.error("Error fetching mentor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, []);

  // Add useEffect to fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const currentDate = new Date();
          const response = await axios.get(`${API_BASE_URL}/mentor/monthly-attendance`, {
            params: {
              year: currentDate.getFullYear(),
              month: currentDate.toLocaleString('default', { month: 'long' }),
              sin_number: parsedUser.sin_number
            }
          });
          if (response.data.success) {
            setAttendanceData(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendanceData();
  }, []);

  // Add useEffect to process performance data
  useEffect(() => {
    if (attendanceData && mentorData) {
      // Process attendance trend data
      const attendanceTrend = attendanceData.timeSeriesData.map(data => ({
        name: data.name,
        present: data.present,
        absent: data.absent,
        late: data.late,
        od: data.od,
        internship: data.internship
      }));

      // Process request distribution data
      const requestDistribution = [
        { name: 'Leave', value: requestCounts.approvedLeaves + requestCounts.rejectedLeaves },
        { name: 'On Duty', value: requestCounts.approvedOD + requestCounts.rejectedOD },
        { name: 'Internship', value: requestCounts.approvedInternship + requestCounts.rejectedInternship }
      ];

      // Process student metrics
      const studentMetrics = [
        { name: 'Attendance Rate', value: attendanceData.departmentData.attendancePercentage },
        { name: 'On Duty Rate', value: Math.round((requestCounts.approvedOD / (requestCounts.approvedOD + requestCounts.rejectedOD)) * 100) || 0 },
        { name: 'Internship Rate', value: Math.round((requestCounts.approvedInternship / (requestCounts.approvedInternship + requestCounts.rejectedInternship)) * 100) || 0 }
      ];

      setPerformanceData({
        attendanceTrend,
        requestDistribution,
        studentMetrics
      });
    }
  }, [attendanceData, mentorData, requestCounts]);

  // Add useEffect to fetch yesterday's attendance
  useEffect(() => {
    const fetchYesterdayAttendance = async () => {
      try {
        setLoadingAttendance(true);
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Get yesterday's date
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const dateStr = yesterday.toISOString().split('T')[0];
          
          const response = await axios.get(`${API_BASE_URL}/mentor/daily-attendance?date=${dateStr}&sin_number=${parsedUser.sin_number}`);
          if (response.data.success) {
            setYesterdayAttendance(response.data.data.attendanceStats);
          }
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchYesterdayAttendance();
  }, []);

  // Add fetchStudentRequests function
  const fetchStudentRequests = async () => {
    try {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Fetching requests for user:", parsedUser.sin_number);
        
        // First fetch the mentor data to get the request counts
        const mentorResponse = await axios.get(`${API_BASE_URL}/mentor/mentees/${parsedUser.sin_number}`);
        console.log("Mentor Data Response:", mentorResponse.data);

        // Then fetch the actual requests
        const response = await axios.post(`${API_BASE_URL}/staffs-std-leavests`, {
          sin_number: parsedUser.sin_number
        });

        console.log("Requests Response:", response.data);

        if (mentorResponse.data.status === "success") {
          // Initialize counts from mentor data
          const counts = {
            leave: { 
              pending: mentorResponse.data.requestCounts.pendingLeaveRequests || 0,
              approved: mentorResponse.data.requestCounts.approvedLeaves || 0,
              rejected: mentorResponse.data.requestCounts.rejectedLeaves || 0
            },
            od: { 
              pending: mentorResponse.data.requestCounts.pendingODRequests || 0,
              approved: mentorResponse.data.requestCounts.approvedOD || 0,
              rejected: mentorResponse.data.requestCounts.rejectedOD || 0
            },
            internship: { 
              pending: mentorResponse.data.requestCounts.pendingInternshipRequests || 0,
              approved: mentorResponse.data.requestCounts.approvedInternship || 0,
              rejected: mentorResponse.data.requestCounts.rejectedInternship || 0
            }
          };

          const newNotifications = [];

          // Create notifications based on pending counts
          if (counts.leave.pending > 0) {
            newNotifications.push({
              id: `leave-${Date.now()}`,
              text: `${counts.leave.pending} leave request${counts.leave.pending > 1 ? 's' : ''} pending your approval`,
              time: new Date().toLocaleString(),
              unread: true,
              type: 'leave'
            });
          }
          if (counts.od.pending > 0) {
            newNotifications.push({
              id: `od-${Date.now()}`,
              text: `${counts.od.pending} OD request${counts.od.pending > 1 ? 's' : ''} pending your approval`,
              time: new Date().toLocaleString(),
              unread: true,
              type: 'od'
            });
          }
          if (counts.internship.pending > 0) {
            newNotifications.push({
              id: `internship-${Date.now()}`,
              text: `${counts.internship.pending} internship request${counts.internship.pending > 1 ? 's' : ''} pending your approval`,
              time: new Date().toLocaleString(),
              unread: true,
              type: 'internship'
            });
          }

          console.log("New notifications created:", newNotifications);

          // Update request counts
          setRequestCounts({
            pendingLeaveRequests: counts.leave.pending,
            pendingODRequests: counts.od.pending,
            pendingInternshipRequests: counts.internship.pending,
            approvedLeaves: counts.leave.approved,
            rejectedLeaves: counts.leave.rejected,
            approvedOD: counts.od.approved,
            rejectedOD: counts.od.rejected,
            approvedInternship: counts.internship.approved,
            rejectedInternship: counts.internship.rejected
          });

          // Update mentorData with new notifications
          setMentorData(prev => {
            const updatedData = {
              ...prev,
              ...mentorResponse.data,
              notifications: newNotifications.length > 0 ? [...newNotifications, ...(prev.notifications || [])] : (prev.notifications || [])
            };
            console.log("Updated mentorData:", updatedData);
            return updatedData;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching student requests:', error);
      showSnackbar('Failed to fetch student requests', 'error');
    }
  };

  // Add useEffect to fetch student requests
  useEffect(() => {
    fetchStudentRequests();
  }, []);

  const sidebarMenuItems = [
    { 
      icon: <DashboardIcon sx={{ color: 'white' }} />, 
      text: "Dashboard", 
      onClick: () => handleMenuItemClick("dashboard") 
    },
    { 
      icon: <AssignmentIcon sx={{ color: 'white' }} />, 
      text: "Mentees List", 
      onClick: () => handleMenuItemClick("menteeslist") 
    },
    { 
      icon: <RequestPageIcon sx={{ color: 'white' }} />, 
      text: "Mentees Requests", 
      onClick: () => handleMenuItemClick("menteesrequesttable") 
    },
    { 
      icon: <PersonIcon sx={{ color: 'white' }} />, 
      text: "Mentees Attendance", 
      onClick: () => handleMenuItemClick("menteesattendance") 
    }
  ];

  const handleProfileMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileDialogOpen = () => {
    setProfileDialogOpen(true);
    setEditMode(false);
    handleProfileMenuClose();
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handleChangePasswordDialogOpen = () => {
    setPasswordResetOpen(true);
    handleProfileMenuClose();
  };

  const handlePasswordDialogClose = () => {
    setPasswordResetOpen(false);
    setPasswordError('');
    setOldPassword('');
    setNewPassword('');
  };

  const handleToggleAttendance = () => {
    setAttendanceOpen(!attendanceOpen);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    handleProfileMenuClose();
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/");
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleMenuItemClick = (content) => {
    setSelectedContent(content);
    if (isMobile || isTablet) {
      setMobileOpen(false);
    }
  };

  const handleViewChange = (event, newValue) => {
    setCurrentView(newValue);
  };

  const handleApproveRequest = (requestId) => {
    setMentorData(prev => ({
      ...prev,
      requests: prev.requests.map(req => 
        req.id === requestId ? { ...req, status: "Approved" } : req
      )
    }));
    showSnackbar('Request approved successfully', 'success');
  };

  const handleRejectRequest = (requestId) => {
    setMentorData(prev => ({
      ...prev,
      requests: prev.requests.map(req => 
        req.id === requestId ? { ...req, status: "Rejected" } : req
      )
    }));
    showSnackbar('Request rejected successfully', 'success');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    setMentorData(prev => ({
      ...prev,
      name: editData.name,
      email: editData.email,
      phone: editData.phone,
      department: editData.department
    }));
    setEditMode(false);
    showSnackbar('Profile updated successfully', 'success');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would call changePassword here
      // await changePassword(oldPassword, newPassword);
      
      setOldPassword('');
      setNewPassword('');
      setPasswordError('');
      setPasswordResetOpen(false);
      showSnackbar('Password changed successfully', 'success');
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
    }
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleTimeFrameChange = (event) => {
    setSelectedTimeFrame(event.target.value);
  };

  const handleCalendarTypeChange = (event) => {
    setSelectedCalendarType(event.target.value);
  };

  const handleOpenCalendar = () => {
    setCalendarDialogOpen(true);
  };

  const handleCloseCalendar = () => {
    setCalendarDialogOpen(false);
  };

  const handleExportData = () => {
    setExportLoading(true);
    // Simulate export process
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Name,Department,Year,Semester,Attendance,Status,Last Meeting,Performance\n" 
        + filteredData.mentees.map(mentee => 
            `${mentee.id},${mentee.name},${mentee.department},${mentee.year},${mentee.semester},${mentee.attendance}%,${mentee.status},${mentee.lastMeeting},${mentee.performance}%`
          ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `mentees_${selectedDepartment}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportLoading(false);
      showSnackbar('Data exported successfully', 'success');
    }, 1500);
  };

  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/holidays`);
      if (response.data.status === "success") {
        setHolidays(response.data.holidays);
        // showSnackbar("Holidays refreshed successfully", "success");
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      showSnackbar(error.response?.data?.error || "Failed to fetch holidays", "error");
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const renderPendingRequestsCard = (title, data, colors) => (
    <Card elevation={3} sx={{ 
      borderRadius: 3, 
      height: 220,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
      }
    }}>
      <CardHeader 
        title={title} 
        avatar={<RequestQuoteIcon sx={{ color: 'white' }} />}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          py: 1,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          textAlign: 'center'
        }}
        titleTypographyProps={{
          variant: 'subtitle1',
          fontWeight: 'bold'
        }}
      />
      <CardContent sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        p: 1.5,
        gap: 1
      }}>
        {data.map((item, index) => (
          <Box 
            key={item.label}
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              backgroundColor: `rgba(${hexToRgb(colors[index % colors.length])}, 0.1)`,
              borderRadius: 2,
              height: 36,
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: `rgba(${hexToRgb(colors[index % colors.length])}, 0.2)`
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PendingIcon sx={{ color: colors[index % colors.length], mr: 1 }} />
              <Typography variant="body2">
                {item.label}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.pending}</Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const COLORS = ["#4CAF50", "#F44336", "#FFC107", "#2196F3", "#9C27B0"];

  const drawer = (
    <Box sx={{ overflow: "auto", height: "100%", display: "flex", flexDirection: "column", backgroundColor: '#1a237e' }}>
      <Toolbar />
      <List sx={{ flex: 1 }}>
        {sidebarMenuItems.map((item, index) => {
          const isSelected = selectedContent === item.text.toLowerCase().replace(' ', '');
          return (
            <ListItem 
              key={index} 
              button 
              onClick={item.onClick}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(87, 13, 206, 0.1)', 
                  borderRadius: 2 
                },
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: 'white'
              }}
            >
              <ListItemIcon sx={{ color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.7)' }}>
                {React.cloneElement(item.icon, { color: isSelected ? 'inherit' : 'inherit' })}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ ml: 1, fontWeight: 'medium' }} 
                primaryTypographyProps={{ 
                  color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: isSelected ? '600' : '400'
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
      <Box sx={{ p: 2 }}>
        <Button 
          fullWidth 
          variant="outlined" 
          sx={{ 
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'white'
            }
          }}
          startIcon={<LogoutIcon sx={{ color: 'white' }} />}
          onClick={handleLogoutClick}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
  const pendingRequestsData = [
    { label: 'Leave Requests', pending: requestCounts.pendingLeaveRequests },
    { label: 'OD Requests', pending: requestCounts.pendingODRequests },
    { label: 'Internship Requests', pending: requestCounts.pendingInternshipRequests }
  ];

  const requestColors = ['#FFA000', '#4CAF50', '#2196F3']; 

  // Add new data arrays for approved and rejected requests
  const approvedRequestsData = [
    { label: 'Leave Requests', approved: requestCounts.approvedLeaves },
    { label: 'OD Requests', approved: requestCounts.approvedOD },
    { label: 'Internship Requests', approved: requestCounts.approvedInternship }
  ];

  const rejectedRequestsData = [
    { label: 'Leave Requests', rejected: requestCounts.rejectedLeaves },
    { label: 'OD Requests', rejected: requestCounts.rejectedOD },
    { label: 'Internship Requests', rejected: requestCounts.rejectedInternship }
  ];

  const renderPerformanceOverview = () => (
    <Grid container spacing={3} sx={{ 
      mt: 3, 
      ml: isMobile ? 0 : -3,
      pr: isMobile ? 0 : 3,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <Grid item xs={12}>
        <Card 
          elevation={4}
          sx={{ 
            borderRadius: 3,
            width: '100%',
            maxWidth: '100%',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            },
            overflow: 'visible'
          }}
        >
          <CardHeader
            title="Performance Overview"
            titleTypographyProps={{ 
              variant: isMobile ? "subtitle1" : "h6", 
              fontWeight: 'bold',
              px: 2
            }}
          />
          <CardContent sx={{ 
            p: isMobile ? 1 : 3,
            width: '100%',
            maxWidth: '100%'
          }}>
            <Grid container spacing={isMobile ? 1 : 4} sx={{ width: '100%' }}>
              {/* Weekly Attendance Trend */}
              <Grid item xs={12} lg={8} sx={{ width: '100%' }}>
                <Typography 
                  variant="subtitle2" 
                  color="textSecondary" 
                  gutterBottom 
                  sx={{ mb: 2, px: 1 }}
                >
                  Weekly Attendance Trend
                </Typography>
                <Box sx={{ 
                  height: isMobile ? 250 : 350,
                  width: '100%',
                  minWidth: 0
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performanceData.attendanceTrend}
                      margin={{ 
                        top: 10, 
                        right: isMobile ? 5 : 20, 
                        left: isMobile ? -15 : 0, 
                        bottom: 0 
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        domain={[0, 100]}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{
                          borderRadius: 8,
                          boxShadow: theme.shadows[3],
                          fontSize: isMobile ? 11 : 13
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          paddingTop: isMobile ? 5 : 15,
                          fontSize: isMobile ? 11 : 13
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="present" 
                        stackId="1" 
                        stroke="#4CAF50" 
                        fill="#4CAF50" 
                        name="Present"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="absent" 
                        stackId="1" 
                        stroke="#F44336" 
                        fill="#F44336" 
                        name="Absent"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="late" 
                        stackId="1" 
                        stroke="#FFA726" 
                        fill="#FFA726" 
                        name="Late"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="od" 
                        stackId="1" 
                        stroke="#42A5F5" 
                        fill="#42A5F5" 
                        name="On Duty"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="internship" 
                        stackId="1" 
                        stroke="#AB47BC" 
                        fill="#AB47BC" 
                        name="Internship"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>

              {/* Request Distribution */}
              <Grid item xs={12} lg={4} sx={{ width: '100%' }}>
                <Typography 
                  variant="subtitle2" 
                  color="textSecondary" 
                  gutterBottom 
                  sx={{ mb: 2, px: 1 }}
                >
                  Request Distribution
                </Typography>
                <Box sx={{ 
                  height: isMobile ? 250 : 350,
                  width: '100%',
                  minWidth: 0
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceData.requestDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={isMobile ? 70 : 100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {performanceData.requestDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={['#4CAF50', '#2196F3', '#9C27B0', '#FFA726', '#F44336'][index % 5]} 
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name) => [`${value}`, name]}
                        contentStyle={{
                          borderRadius: 8,
                          boxShadow: theme.shadows[3],
                          fontSize: isMobile ? 11 : 13
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          paddingTop: isMobile ? 5 : 15,
                          fontSize: isMobile ? 11 : 13
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>

              {/* Student Metrics */}
              <Grid item xs={12} sx={{ width: '100%' }}>
                <Typography 
                  variant="subtitle2" 
                  color="textSecondary" 
                  gutterBottom 
                  sx={{ mb: 2, px: 1 }}
                >
                  Student Metrics
                </Typography>
                <Box sx={{ 
                  height: isMobile ? 250 : 350,
                  width: '100%',
                  minWidth: 0
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData.studentMetrics}
                      margin={{ 
                        top: 10, 
                        right: isMobile ? 5 : 20, 
                        left: isMobile ? -15 : 0, 
                        bottom: 0 
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        domain={[0, 100]}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{
                          borderRadius: 8,
                          boxShadow: theme.shadows[3],
                          fontSize: isMobile ? 11 : 13
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          paddingTop: isMobile ? 5 : 15,
                          fontSize: isMobile ? 11 : 13
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Percentage"
                      >
                        {performanceData.studentMetrics.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.value >= 80 ? '#4CAF50' : 
                              entry.value >= 60 ? '#FFA726' : 
                              '#F44336'
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderYesterdayAttendance = () => (
    <Grid item xs={12} md={6} lg={4}>
      <Card 
        elevation={4}
        sx={{ 
          borderRadius: 3,
          height: '100%',
          width: '100%',
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
          '&:hover': { 
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }
        }}
      >
        <CardHeader
          title="Student Attendance Summary (Yesterday)"
          titleTypographyProps={{ variant: isMobile ? "subtitle1" : "h6", fontWeight: 'bold' }}
        />
        <CardContent>
          {loadingAttendance ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Present', value: yesterdayAttendance.present, color: '#66BB6A' },
                    { name: 'Absent', value: yesterdayAttendance.absent, color: '#EF5350' },
                    { name: 'Late', value: yesterdayAttendance.late, color: '#FFA726' },
                    { name: 'On Duty', value: yesterdayAttendance.od, color: '#42A5F5' },
                    { name: 'Internship', value: yesterdayAttendance.internship, color: '#AB47BC' },
                    { name: 'Early Departure', value: yesterdayAttendance.earlyDeparture, color: '#FF7043' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    { name: 'Present', value: yesterdayAttendance.present, color: '#66BB6A' },
                    { name: 'Absent', value: yesterdayAttendance.absent, color: '#EF5350' },
                    { name: 'Late', value: yesterdayAttendance.late, color: '#FFA726' },
                    { name: 'On Duty', value: yesterdayAttendance.od, color: '#42A5F5' },
                    { name: 'Internship', value: yesterdayAttendance.internship, color: '#AB47BC' },
                    { name: 'Early Departure', value: yesterdayAttendance.earlyDeparture, color: '#FF7043' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  const renderAttendanceSummary = () => {
    const attendanceData = [
      { name: 'Present', value: yesterdayAttendance.present, color: '#4CAF50' },
      { name: 'Absent', value: yesterdayAttendance.absent, color: '#F44336' },
      { name: 'Late', value: yesterdayAttendance.late, color: '#FFA726' },
      { name: 'On Duty', value: yesterdayAttendance.od, color: '#42A5F5' },
      { name: 'Internship', value: yesterdayAttendance.internship, color: '#AB47BC' },
      { name: 'Early Departure', value: yesterdayAttendance.earlyDeparture, color: '#FF7043' }
    ];
  
    return (
      <Card elevation={4} sx={{ 
        borderRadius: 3, 
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }
      }}>
        <CardHeader 
          title="Student Attendance Summary (Yesterday)"
          avatar={<PeopleIcon sx={{ color: 'white' }} />}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            textAlign: 'center',
            py: 1.5,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}
          titleTypographyProps={{
            variant: 'subtitle1',
            fontWeight: 'bold',
            component: 'div'
          }}
        />
        <CardContent sx={{ flex: 1, p: 2 }}>
          {loadingAttendance ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value, name) => [`${value} students`, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    padding: '10px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDashboardContent = () => (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        mt: isMobile ? 2 : -25,
        ml: isMobile ? 2 : -33,
        flexDirection: isMobile ? 'column' : 'row',
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
          Welcome, {user?.name.split(' ')[0]}!
        </Typography>
      </Box>
      
      {/* First Row - Profile and Request Cards */}
      <Grid container spacing={3} sx={{ 
        mb: 3,
        ml: isMobile ? 2 : -33,
        width: isMobile ? '100%' : 'auto'
      }}>
        {/* Profile Card */}
        <Grid item xs={12} md={3}>
          <Card 
            elevation={4}
            sx={{ 
              borderRadius: 3, 
              width: '100%',
              mr: 2,
              height: isMobile ? 'auto' : '63%',
              display: 'flex',
              flexDirection: 'column',
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              color: 'white',
              transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
              '&:hover': { 
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ 
                display: "flex", 
                alignItems: "center",
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <Avatar 
                  src={user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png'}
                  alt={user?.name || 'User'}
                  sx={{ 
                    width: 80, 
                    height: 80,
                    border: '2px solid white'
                  }} 
                />
                <Box sx={{ ml: isMobile ? 0 : 3, mt: isMobile ? 2 : 0 }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: "bold" }}>
                    {user?.name}
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "body1"}>
                    Mentor | {user?.department}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant={isMobile ? "caption" : "body2"}>{user?.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant={isMobile ? "caption" : "body2"}>{user?.phone}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
            <CardActionArea 
              onClick={handleProfileDialogOpen}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">View Full Profile</Typography>
                <PersonIcon fontSize="small" />
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
        
        {/* Pending Requests Card */}
        <Grid item xs={12} md={5} width={260} >
          {renderPendingRequestsCard(
            "Pending Requests", 
            pendingRequestsData, 
            ['#FFA000', '#4CAF50', '#2196F3']
          )}
        </Grid>
        
        {/* Approved Requests Card */}
        <Grid item xs={12} md={3} width={260} >
          <Card elevation={3} sx={{ 
            borderRadius: 3, 
            height: 220,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
            }
          }}>
            <CardHeader 
              title="Approved Requests" 
              avatar={<CheckCircleIcon sx={{ color: 'white' }} />}
              sx={{
                backgroundColor: '#4CAF50',
                color: 'white',
                py: 1,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                textAlign: 'center'
              }}
              titleTypographyProps={{
                variant: 'subtitle1',
                fontWeight: 'bold'
              }}
            />
            <CardContent sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              p: 1.5,
              gap: 1
            }}>
              {approvedRequestsData.map((item, index) => (
                <Box 
                  key={item.label}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: 2,
                    height: 36,
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.2)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography variant="body2">
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.approved}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Rejected Requests Card */}
        <Grid item xs={12} md={3} width={260} >
          <Card elevation={3} sx={{ 
            borderRadius: 3, 
            height: 220,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
            }
          }}>
            <CardHeader 
              title="Rejected Requests" 
              avatar={<CancelIcon sx={{ color: 'white' }} />}
              sx={{
                backgroundColor: '#F44336',
                color: 'white',
                py: 1,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                textAlign: 'center'
              }}
              titleTypographyProps={{
                variant: 'subtitle1',
                fontWeight: 'bold'
              }}
            />
            <CardContent sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              p: 1.5,
              gap: 1
            }}>
              {rejectedRequestsData.map((item, index) => (
                <Box 
                  key={item.label}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderRadius: 2,
                    height: 36,
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.2)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CancelIcon sx={{ color: '#F44336', mr: 1 }} />
                    <Typography variant="body2">
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.rejected}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
       {/* Academic Calendar Card */}
<Grid item xs={12} md={4} ml={-1} width={270}>
  <Card 
    elevation={4}
    sx={{ 
      borderRadius: 3,
      height: isMobile ? 'auto' : '63%',
      maxHeight: 350,
      width: '110%',
      mr: isMobile ? 5 : -15,
      transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
      '&:hover': { 
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      },
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <CardHeader
      title={`Holidays Calendar ${new Date().getFullYear()}`}
      titleTypographyProps={{ 
        variant: isMobile ? "subtitle1" : "h6", 
        fontWeight: 'bold',
        color: 'white' // White text for better contrast
      }}
      action={
        <Tooltip title="Refresh Holidays">
          <IconButton 
            size={isMobile ? "small" : "medium"} 
            onClick={fetchHolidays}
            disabled={loadingHolidays}
            sx={{ color: 'white' }} // White icon for better contrast
          >
            <RefreshIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      }
      sx={{
        pb: 1,
        pt: 1.5,
        backgroundColor: theme.palette.primary.main, // Blue background
        '& .MuiCardHeader-action': {
          marginTop: 0,
          marginRight: 0
        }
      }}
    />
    <CardContent 
      sx={{ 
        flex: 1,
        overflow: 'auto',
        p: 1,
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.grey[400],
          borderRadius: '3px'
        }
      }}
    >
      {loadingHolidays ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress size={24} />
        </Box>
      ) : holidays.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body2" color="textSecondary">
            No holidays found for this year
          </Typography>
        </Box>
      ) : (
        <List dense sx={{ py: 0 }}>
          {holidays.map((holiday) => (
            <ListItem 
              key={holiday.id} 
              sx={{ 
                px: 1,
                py: 0.5,
                alignItems: 'flex-start',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, mt: '4px' }}>
                <Avatar sx={{ 
                  bgcolor: getHolidayColor(holiday.type),
                  width: 28,
                  height: 28 
                }}>
                  <CalendarIcon fontSize="small" sx={{ color: 'white' }} />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography 
                    variant="body2" 
                    fontWeight="medium"
                    sx={{ wordBreak: 'break-word' }} // Ensure text breaks properly
                  >
                    {holiday.holiday_reason}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="body2" 
                      component="span"
                      sx={{
                        fontSize: '0.75rem',
                        lineHeight: 1.3,
                        color: theme.palette.text.secondary
                      }}
                    >
                      {new Date(holiday.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{
                        lineHeight: 1.3,
                        color: theme.palette.text.secondary
                      }}
                    >
                      {holiday.type}
                    </Typography>
                  </Box>
                }
                sx={{ my: 0 }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </CardContent>
  </Card>
</Grid>
      </Grid>

      {/* Second Row - Attendance Overview */}
      <Grid container spacing={3} sx={{ 
        mt: isMobile ? 3 : -15,
        ml: isMobile ? 0 : -33,
        width: isMobile ? '100%' : 'auto'
      }}>

        {/* Attendance Overview */}
        <Grid item xs={12} md={8}>
          <Card 
            elevation={4}
            sx={{ 
              borderRadius: 3,
              width: '97%',
              mr: isMobile ? 0 : 7,
              height: '100%',
              transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
              '&:hover': { 
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }
            }}
          >
            <CardHeader
              title="Attendance Overview"
              titleTypographyProps={{ variant: isMobile ? "subtitle1" : "h6", fontWeight: 'bold' }}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Students: {attendanceData.departmentData.totalStudents}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    | Attendance: {attendanceData.departmentData.attendancePercentage}%
                  </Typography>
                </Box>
              }
            />
            <CardContent sx={{ height: isMobile ? 200 : 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={attendanceData.timeSeriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="present" 
                    fill="#4CAF50" 
                    stroke="#4CAF50" 
                    name="Present" 
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="absent" 
                    fill="#F44336" 
                    stroke="#F44336" 
                    name="Absent" 
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="late" 
                    fill="#FFA726" 
                    stroke="#FFA726" 
                    name="Late" 
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="od" 
                    fill="#42A5F5" 
                    stroke="#42A5F5" 
                    name="On Duty" 
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="internship" 
                    fill="#AB47BC" 
                    stroke="#AB47BC" 
                    name="Internship" 
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earlyDeparture" 
                    fill="#FF7043" 
                    stroke="#FF7043" 
                    name="Early Departure" 
                    stackId="1"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Yesterday's Attendance Summary */}
        <Grid item xs={12} md={4} width={1600}>
          {renderAttendanceSummary()}
        </Grid>
      </Grid>

      {/* Performance Overview */}
      {/* <Grid item xs={12} md={4} ml={-2}>
      {renderPerformanceOverview()}
      </Grid> */}
    </>
  );

  return (
    <>
      <CssBaseline />

    <AppBar
  position="fixed"
  sx={{
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: '#1a237e',
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: '100%',
    left: 0
  }}
>
  <Toolbar sx={{ 
    minHeight: isMobile ? 56 : 64,
    justifyContent: 'space-between',
    px: isMobile ? 1 : 3
  }}>
    {/* Left side - Menu and Logo */}
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      flex: isMobile ? 1 : 'none'
    }}>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 1 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      {!isMobile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mr: 2,
            '& img': {
              height: 55,
              width: 'auto',
              objectFit: 'contain'
            }
          }}
        >
          <img src={logo} alt="College Logo" />
        </Box>
      )}
    </Box>

    {/* Center - Title */}
    <Typography
      variant="h5"
      noWrap
      sx={{
        fontWeight: "bold",
        letterSpacing: 1,
        color: 'white',
        textAlign: 'center',
        fontSize: isMobile ? '1.1rem' : '1.5rem',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        position: isMobile ? 'absolute' : 'static',
        left: '50%',
        transform: isMobile ? 'translateX(-50%)' : 'none',
        width: isMobile ? 'calc(100% - 96px)' : 'auto',
        px: isMobile ? 1 : 0
      }}
    >
      MENTOR DASHBOARD
    </Typography>

    {/* Right side - Icons */}
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      flex: isMobile ? 1 : 'none',
      justifyContent: 'flex-end'
    }}>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleNotificationClick}
          sx={{ mr: isMobile ? 0.5 : 1 }}
          size={isMobile ? "small" : "medium"}
        >
          <Badge badgeContent={mentorData?.notifications?.filter(n => !n.read)?.length || 0} color="error">
            <NotificationsIcon fontSize={isMobile ? "small" : "medium"} />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Profile">
        <IconButton
          onClick={handleProfileMenuClick}
          color="inherit"
          size={isMobile ? "small" : "medium"}
        >
          <Avatar
            src={user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png'}
            alt="Profile"
            sx={{
              width: isMobile ? 32 : 36,
              height: isMobile ? 32 : 36
            }}
          />
        </IconButton>
      </Tooltip>
    </Box>
  </Toolbar>
</AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: 280,
            boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            width: 280,
            boxSizing: "border-box",
            position: 'fixed',
            height: '100vh',
            borderRight: 'none'
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={handleProfileDialogClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Profile Information</Typography>
          <Box>
            {!editMode ? (
              <>
                <Button 
                  onClick={handleProfileDialogClose}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Close
                </Button>
                <Button 
                  onClick={handleEditProfile}
                  startIcon={<EditIcon />}
                  color="primary"
                  variant="outlined"
                  size="small"
                >
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleCancelEdit}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  color="primary"
                  variant="contained"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 3, mt: 2 }}>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar
                src={user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png'}
                alt="Profile Photo"
                sx={{ width: 150, height: 150, mb: 2, border: '2px solid #eee' }}
              />
              {editMode && (
                <Button variant="contained" component="label" sx={{ mb: 2 }}>
                  Upload Photo
                  <input type="file" hidden />
                </Button>
              )}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{user?.name || 'Mentor'}</Typography>
              <Typography variant="body1" color="textSecondary">Mentor | {user?.department}</Typography>
            </Box>
            <Box sx={{ flex: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={user?.name}
                    onChange={handleEditChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={user?.department}
                    onChange={handleEditChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={user?.email}
                    onChange={handleEditChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={user?.phone}
                    onChange={handleEditChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      
     
      {/* Calendar Dialog */}
      <Dialog
        open={calendarDialogOpen}
        onClose={handleCloseCalendar}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          color: theme.palette.primary.main,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: isMobile ? 1 : 2
        }}>
          <Typography variant={isMobile ? "h6" : "h5"}>
            Academic Calendar
          </Typography>
          <Box>
            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <Select
                value={selectedCalendarType}
                onChange={handleCalendarTypeChange}
                sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              >
                {calendarTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={handleCloseCalendar} size={isMobile ? "small" : "medium"}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ 
            height: isMobile ? 'calc(100vh - 120px)' : '500px',
            overflow: 'auto'
          }}>
            {loadingHolidays ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={24} />
              </Box>
            ) : holidays.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body2" color="textSecondary">
                  No holidays found for this year
                </Typography>
              </Box>
            ) : (
              <List>
                {holidays.map((holiday) => (
                  <ListItem key={holiday.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Avatar sx={{ 
                        bgcolor: getHolidayColor(holiday.type),
                        width: 32, 
                        height: 32 
                      }}>
                        <CalendarIcon fontSize="small" sx={{ color: 'white' }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={holiday.holiday_reason}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {new Date(holiday.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            {holiday.type}
                          </Typography>
                        </>
                      }
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 1 : 2 }}>
          <Button 
            onClick={handleCloseCalendar} 
            color="primary"
            variant="outlined"
            sx={{ mr: 1 }}
            size={isMobile ? "small" : "medium"}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: isMobile ? 2 : 3,
          width: { md: `calc(100% - 280px)` },
          marginTop: isMobile ? '56px' : '64px',
          backgroundColor: '#f5f7fa',
          marginLeft: isMobile ? 0 : '280px'
        }}
      >
        <Toolbar />
        
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 1 : 3 }}>
            <Skeleton variant="rectangular" width="100%" height={isMobile ? 48 : 56} />
            <Grid container spacing={isMobile ? 1 : 3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={item}>
                  <Skeleton variant="rectangular" width="100%" height={isMobile ? 120 : 150} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rectangular" width="100%" height={isMobile ? 300 : 400} />
          </Box>
        ) : (
          <>
            {selectedContent === "dashboard" && renderDashboardContent()}
            {selectedContent === "menteeslist" && (
              <MenteesList 
                mentees={filteredData?.mentees || []} 
                isMobile={isMobile} 
                searchText={searchText}
                setSearchText={setSearchText}
              />
            )}
            {selectedContent === "menteesrequesttable" && (
              <MenteesRequestTable 
                requests={filteredData?.requests || []} 
                onApprove={handleApproveRequest} 
                onReject={handleRejectRequest}
                isMobile={isMobile}
                searchText={searchText}
                setSearchText={setSearchText}
              />
            )}
            {selectedContent === "menteesattendance" && (
              <MenteesAttendance 
                mentees={filteredData?.mentees || []} 
                isMobile={isMobile}
                searchText={searchText}
                setSearchText={setSearchText}
              />
            )}
          </>
        )}
      </Box>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to logout?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleLogoutCancel} 
            color="primary" 
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            color="primary" 
            variant="contained"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MentorDashboard;