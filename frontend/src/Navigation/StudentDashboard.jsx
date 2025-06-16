import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  Menu,
  Box,
  MenuItem,
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
  Badge,
  TextField,
  InputAdornment,
  ListItemIcon,
  CssBaseline,
  Collapse,
  CardHeader,
  CardActionArea,
  Tooltip,
  Fab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  FormHelperText,
  Alert,
  Snackbar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import {
  Menu as MenuIcon,
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
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Today as TodayIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  AlarmOn as AlarmOnIcon,
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  SupervisorAccount as SupervisorAccountIcon,
  LocalLibrary as LocalLibraryIcon,
  Timelapse as TimelapseIcon,
  PhotoCamera as PhotoCameraIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import RequestPageIcon from '@mui/icons-material/RequestPage';
import WarningIcon from '@mui/icons-material/Warning';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// import Dashboard from "../components/Student/DashboardComponents";
import LeaveApplicationForm from "../components/Student/LeaveApplication";
import LeaveApprovalStatus from "../components/Student/LeaveApprovalStatus";
import PersonalAttendance from "../components/Student/PersonalAttendance";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import Dashboard from "../components/Student/DashboardComponents";

// Logo component - Add this to your assets folder
import collegeLogoUrl from '../assets/logo.png'; // Replace with your actual logo path
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const StudentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { logout } = useAuth();
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState("dashboard");
  const navigate = useNavigate();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedYear, setSelectedYear] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
 
  // Add real data state for dashboard
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [requestSummary, setRequestSummary] = useState({ total: 0, approved: 0, rejected: 0, pending: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [newActivitiesCount, setNewActivitiesCount] = useState(0);

  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchorEl);
  const [academicData, setAcademicData] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [error, setError] = useState(null);
  const [classAdvisor, setClassAdvisor] = useState(null);
  const [mentor, setMentor] = useState(null);
  

  useEffect(() => {
    const fetchAdvisorDetails = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser); // Initialize user state
          setEditedUser(parsedUser);
          
          const response = await axios.get(`${API_BASE_URL}/staff-details`, {
            params: {
              class_advisor: parsedUser.class_advisor,
              mentor: parsedUser.mentor
            }
          });
          setClassAdvisor(response.data.class_advisor);
          setMentor(response.data.mentor);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisorDetails();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const sin_number = user?.sin_number;
        
        // Fetch attendance and monthly data
        const [attendanceRes, monthlyRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/overall-attendance?UserId=${sin_number}`),
          axios.get(`${API_BASE_URL}/monthly-attendance?UserId=${sin_number}&year=${new Date().getFullYear()}`)
        ]);

        // Set attendance summary
        setAttendanceSummary(attendanceRes.data.data);
        
        // Set monthly trend
        setMonthlyTrend(monthlyRes.data.data?.monthlyData || []);

        // Try to fetch leave requests, but handle 404 gracefully
        try {
          const leaveRes = await axios.post(`${API_BASE_URL}/stdleavests/leavests`, { sin_number });
          const leaveData = Array.isArray(leaveRes.data) ? leaveRes.data : [];
          
          // Compute request summary
          let total = leaveData.length;
          let approved = 0, rejected = 0, pending = 0;
          leaveData.forEach(req => {
            const status = getOverallStatus(req);
            if (status === 'Approved') approved++;
            else if (status === 'Rejected') rejected++;
            else pending++;
          });
          
          setRequestSummary({ total, approved, rejected, pending });
          
          // Recent requests (last 5, sorted by createdAt desc)
          const sortedRecent = [...leaveData]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setRecentRequests(sortedRecent);

          // Create notifications from recent requests
          const newNotifications = sortedRecent
            .filter(request => request.principal_approval?.toLowerCase() === "approved" || 
                             request.principal_approval?.toLowerCase() === "rejected")
            .map(request => ({
              id: request.request_id,
              text: `Your ${request.request_type} request has been ${request.principal_approval.toLowerCase()}`,
              status: request.principal_approval.toLowerCase(),
              createdAt: request.createdAt
            }));

          setNotifications(newNotifications);
          setNewActivitiesCount(newNotifications.length);
        } catch (error) {
          if (error.response?.status === 404) {
            // Handle no leave requests case
            setRequestSummary({ total: 0, approved: 0, rejected: 0, pending: 0 });
            setRecentRequests([]);
            setNotifications([]);
            setNewActivitiesCount(0);
          } else {
            throw error; // Re-throw other errors
          }
        }
      } catch (err) {
        setDashboardError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboardData();
  }, []);


  const handleAddNewRequest = (newRequest) => {
    setRecentRequests(prevRequests => [
      {
        id: `REQ${1000 + prevRequests.length + 1}`,
        type: newRequest.type,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: "Pending",
        reason: newRequest.reason
      },
      ...prevRequests
    ]);
    
    showSnackbar("Leave request submitted successfully", "success");
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileDialogOpen = () => {
    setEditedUser({...user});
    setEditMode(false);
    setProfileDialogOpen(true);
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handleToggleAttendance = () => {
    setAttendanceOpen(!attendanceOpen);
  };

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

  const handleMenuItemClick = (content) => {
    setSelectedContent(content);
    if (isMobile || isTablet) {
      setMobileOpen(false);
    }
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setSelectedPhoto(file);
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser(prev => ({
          ...prev,
          photo: reader.result.split(',')[1] // Remove the data:image/jpeg;base64, prefix
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append('email', editedUser.email);
      formData.append('phone', editedUser.phone);
      formData.append('parent_phone', editedUser.parent_phone);
      formData.append('address', editedUser.address);
      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }

      const response = await axios.put(
        `${API_BASE_URL}/student/update-profile/${user.sin_number}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.user) {
        setUser(response.data.user);
        setEditedUser(response.data.user);
        toast.success('Profile updated successfully');
        setEditMode(false);
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!oldPassword || !newPassword) {
        setPasswordError('Please fill in all fields');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/student/change-password/${user.sin_number}`,
        {
          oldPassword,
          newPassword
        }
      );

      if (response.data.message) {
        toast.success('Password changed successfully');
        handlePasswordDialogClose();
        setOldPassword('');
        setNewPassword('');
        setPasswordError('');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError(error.response?.data?.message || 'Failed to change password');
      toast.error(error.response?.data?.message || 'Failed to change password');
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

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    
  };

  const COLORS = ["#4CAF50", "#F44336", "#FFC107", "#2196F3", "#9C27B0"];

  const sidebarMenuItems = [
    { 
      icon: <DashboardIcon />, 
      text: "Dashboard", 
      onClick: () => handleMenuItemClick("dashboard") 
    },
    { 
      icon: <EventAvailableIcon />, 
      text: "Personal Attendance", 
      onClick: () => handleMenuItemClick("personalAttendance") 
    },
    { 
      icon: <AssignmentIcon />, 
      text: "Request Form", 
      onClick: () => handleMenuItemClick("leaveRequestForm") 
    },
    { 
      icon: <RequestPageIcon />, 
      text: "Request Status", 
      onClick: () => handleMenuItemClick("leaveApprovalStatus") 
    }
  ];

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      bgcolor: '#1a237e', // Dark blue background for sidebar
      color: 'white'
    }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '16px'
      }}>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {sidebarMenuItems.map((item, index) => (
          <ListItem 
            key={index}
            button 
            onClick={item.onClick}
            sx={{ 
              '&:hover': { 
                backgroundColor: 'rgba(63, 81, 181, 0.1)', 
                borderRadius: 2 
              },
              backgroundColor: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 'rgba(10, 17, 61, 0.1)' : 'inherit',
              borderLeft: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? `4px solid ${theme.palette.primary.main}` : 'none',
              px: 2
            }}
          >
            <ListItemIcon sx={{ 
              color: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? theme.palette.primary.main : 'inherit',
              minWidth: '40px'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                fontWeight: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 'bold' : 'medium',
                color: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? theme.palette.primary.main : 'inherit'
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
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

  const renderDashboardContent = () => {
    if (dashboardLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }
  
    if (dashboardError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Alert severity="error">{dashboardError}</Alert>
        </Box>
      );
    }
  
    if (!user) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Alert severity="warning">
            User data not available
          </Alert>
        </Box>
      );
    }
    return (
      <>
<Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        mt: -2,
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
          Welcome, {user?.name}
        </Typography>
        </Box>
<Grid container spacing={isMobile ? 2 : 3}>

          {/* Student Profile Card */}
          <Grid item xs={12} sm={4} md={4} lg={4}>
            <Card 
              elevation={4}
              sx={{ 
                borderRadius: 3, 
                height: '100%',
                width: '100%',
                mr:6,
                
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
                      width: 86, 
                      height: 86,
                      border: `2px solid white`,
                    }}
                  >
                    {!user?.photo && (user?.name?.charAt(0) || 'A')}
                  </Avatar>
                  <Box sx={{ ml: isMobile ? 0 : 3 }}>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: "bold" }}>
                      {user?.name}
                    </Typography>
                    <Typography variant={isMobile ? "body2" : "body1"}>
                      Student | {user?.department}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant={isMobile ? "caption" : "body2"}>{user?.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant={isMobile ? "caption" : "body2"}>{user?.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant={isMobile ? "caption" : "body2"}>Parent: {user?.parent_phone}</Typography>
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
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">Edit Profile</Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Class Advisor Card */}
          <Grid item xs={12} sm={4} md={4} lg={4}>
            <Card 
              elevation={4}
              sx={{ 
                borderRadius: 3, 
                width: '100%',
                mr:10,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
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
                    src={classAdvisor?.photo ? `data:image/jpeg;base64,${classAdvisor.photo}` : '/default-avatar.png'} 
                    alt={classAdvisor?.name || 'User'} 
                    sx={{ 
                      width: 86, 
                      height: 86,
                      border: `2px solid white`,
                    }}
                  >
                    {!classAdvisor?.photo && (user?.name?.charAt(0) || 'A')}
                  </Avatar>
                  <Box sx={{ ml: isMobile ? 0 : 3 }}>
                    <Typography variant={isMobile ? "caption" : "body2"} sx={{ opacity: 0.8 }}>
                      Class Advisor
                    </Typography>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: "bold" }}>
                      {classAdvisor.name}
                    </Typography>
                    <Typography variant={isMobile ? "body2" : "body1"}>
                      {classAdvisor.department}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant={isMobile ? "caption" : "body2"}>{classAdvisor.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant={isMobile ? "caption" : "body2"}>{classAdvisor.phone}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Mentor Card */}
          <Grid item xs={12} sm={4} md={4} lg={4}>
            <Card 
              elevation={4}
              sx={{ 
                borderRadius: 3,
                width: '100%',
                mr:10, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
                color: 'white',
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
                '&:hover': { 
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1}}>
                <Box sx={{ 
                  display: "flex", 
                  
                  alignItems: "center",
                  flexDirection: isMobile ? 'column' : 'row',
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  <Avatar 
                    src={mentor?.photo ? `data:image/jpeg;base64,${mentor.photo}` : '/default-avatar.png'} 
                    alt={mentor?.name || 'User'} 
                    sx={{ 
                      width: 86, 
                      height: 86,
                      border: `2px solid white`,
                    }}
                  >
                    {!mentor?.photo && (mentor?.name?.charAt(0) || 'A')}
                  </Avatar>
                  <Box sx={{ ml: isMobile ? 0 : 3 }}>
                    <Typography variant={isMobile ? "caption" : "body2"} sx={{ opacity: 0.8 }}>
                      Faculty Mentor
                    </Typography>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: "bold" }}>
                      {mentor.name}
                    </Typography>
                    <Typography variant={isMobile ? "body2" : "body1"}>
                      {mentor.department}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant={isMobile ? "caption" : "body2"}>{mentor.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant={isMobile ? "caption" : "body2"}>{mentor.phone}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>


      <Dashboard
        attendanceSummary={attendanceSummary}
        requestSummary={requestSummary}
        recentRequests={recentRequests}
        monthlyTrend={monthlyTrend}
        theme={theme}
        isMobile={isMobile}
        handleMenuItemClick={handleMenuItemClick}
      />
          </Grid>
     
        </>
    );
  };

  const getContent = () => {
    switch (selectedContent) {
      case "dashboard":
        return renderDashboardContent();
      case "personalAttendance":
        return <PersonalAttendance attendanceData={attendanceData} />;
      case "leaveRequestForm":
        return <LeaveApplicationForm onSubmitRequest={handleAddNewRequest} />;
      case "leaveApprovalStatus":
        return <LeaveApprovalStatus requests={recentRequests} />;
      default:
        return renderDashboardContent();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setEditedUser({...user});
    setEditMode(false);
  };

  const handlePasswordDialogOpen = () => {
    setOldPassword("");
    setNewPassword("");
    setPasswordError("");
    setPasswordDialogOpen(true);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setOldPassword("");
    setNewPassword("");
    setPasswordError("");
  };


  function getOverallStatus(request) {
    if (
      request.principal_approval === "rejected" ||
      request.hod_approval === "rejected" ||
      request.class_advisor_approval === "rejected" ||
      (request.placement_officer_approval && request.placement_officer_approval === "rejected")
    ) {
      return "Rejected";
    }
    const principalApproved = request.principal_approval === "approved";
    const hodApproved = request.hod_approval === "approved";
    const advisorApproved = request.class_advisor_approval === "approved";
    const placementApproved = !request.placement_officer_approval || request.placement_officer_approval === "approved";
    if (principalApproved && hodApproved && advisorApproved && placementApproved) {
      return "Approved";
    }
    return "Pending";
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
     <AppBar 
  position="fixed" 
  sx={{ 
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    bgcolor: '#1a237e',
    transition: 'all 0.3s ease' // Smooth transitions for responsive changes
  }}
>
  <Toolbar sx={{ 
    padding: { xs: '0 8px', sm: '0 16px' }, // Adjust padding for different screens
    minHeight: { xs: 56, sm: 64 } // Adjust toolbar height
  }}>
    {/* Mobile menu button - only shows on small screens */}
    <IconButton
      color="inherit"
      aria-label="open drawer"
      edge="start"
      onClick={handleDrawerToggle}
      sx={{ 
        mr: 2, 
        display: { xs: 'flex', sm: 'none' }, // Only show on mobile
        alignItems: 'center'
      }}
    >
      <MenuIcon />
    </IconButton>

    {/* College Logo - responsive sizing */}
    <Box
      component="img"
      src={collegeLogoUrl}
      alt="College Logo"
      sx={{ 
        height: { xs: 50, sm: 60, md: 75 }, // Responsive height
        width: 'auto', // Maintain aspect ratio
        maxWidth: { xs: '140px', sm: '200px' }, // Limit width on small screens
        objectFit: 'contain',
        mr: { xs: 1, sm: 2 }, // Responsive margin
        display: { xs: 'none', sm: 'block' } // Hide on extra small, show on small+
      }}
    />

    {/* Mobile Logo - smaller version for mobile */}
    <Box
      component="img"
      src={collegeLogoUrl}
      alt="College Logo"
      sx={{ 
        height: 54,
        width: 'auto',
        maxWidth: '100px',
        objectFit: 'contain',
        mr: 1,
        display: { xs: 'block', sm: 'none' } // Only show on mobile
      }}
    />

    {/* Title - responsive text sizing and positioning */}
    <Typography 
      variant="h5" 
      noWrap // Prevent text wrapping
      sx={{ 
        flexGrow: 1,
        fontWeight: "bold", 
        letterSpacing: { xs: 0.5, sm: 1 }, 
        color: 'white',
        textAlign: 'center',
        fontSize: { 
          xs: '1.1rem', // Extra small screens
          sm: '1.3rem', // Small screens
          md: '1.5rem'  // Medium screens and up
        },
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        py: { xs: 0.5, sm: 1 },
        ml: { xs: 1, sm: 0 } // Adjust margin left
      }}
    >
      STUDENT DASHBOARD
    </Typography>

    {/* User Avatar - responsive sizing */}
    <IconButton
      color="inherit"
      onClick={handleNotificationClick}
      sx={{ mr: 1 }}
    >
      <Badge badgeContent={newActivitiesCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>

    <IconButton
      color="inherit"
      onClick={handleMenuClick}
      sx={{ 
        ml: 1,
        p: { xs: 0.5, sm: 1 } // Adjust padding
      }}
    >
      <Avatar 
        src={user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png'} 
        alt={user?.name || 'User'} 
        sx={{ 
          width: { xs: 36, sm: 42, md: 48 }, // Responsive sizing
          height: { xs: 36, sm: 42, md: 48 },
          border: `2px solid white`,
          fontSize: { xs: '1rem', sm: '1.2rem' } // Initials font size
        }}
      >
        {!user?.photo && (user?.name?.charAt(0) || 'A')}
      </Avatar>
    </IconButton>
  </Toolbar>
</AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: 300 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - 280px)` },
          maxWidth: '100%',
          overflow: 'auto',
          height: '100vh'
        }}
      >
        <Toolbar />
        {getContent()}
      </Box>
      
      {/* Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleProfileDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editMode ? "Edit Profile" : "Profile Information"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                src={editedUser?.photo ? `data:image/jpeg;base64,${editedUser.photo}` : '/default-avatar.png'} 
                alt={editedUser?.name || 'User'} 
                sx={{ 
                  width: 100, 
                  height: 100,
                  border: `2px solid white`,
                  mb: 2
                }}
              >
                {!editedUser?.photo && (editedUser?.name?.charAt(0) || 'A')}
              </Avatar>
              {editMode && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  disabled={isUpdating}
                >
                  Change Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </Button>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                fullWidth
                value={editedUser?.name || ""}
               
                disabled
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Register Number"
                fullWidth
                value={editedUser?.sin_number || ""}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                value={editedUser?.email || ""}
                name="email"
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={editedUser?.phone || ""}
                name="phone"
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Parent Phone"
                fullWidth
                value={editedUser?.parent_phone || ""}
                name="parent_phone"
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department"
                fullWidth
                value={editedUser?.department || ""}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={2}
                value={editedUser?.address || ""}
                name="address"
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            
            {!editMode && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordDialogOpen}
                  startIcon={<LockIcon />}
                  sx={{ mt: 1 }}
                >
                  Change Password
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {editMode ? (
            <>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSaveProfile}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleProfileDialogClose}>Close</Button>
              <Button variant="contained" onClick={handleEditProfile}>Edit</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handlePasswordDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter your current password and new password.
          </DialogContentText>
          
          <TextField
            margin="dense"
            label="Current Password"
            type={showOldPassword ? "text" : "password"}
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                  >
                    {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            margin="dense"
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          {passwordError && (
            <FormHelperText error>{passwordError}</FormHelperText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleChangePassword}
            disabled={isUpdating}
          >
            {isUpdating ? 'Changing...' : 'Change'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Logout Confirmation Dialog */}
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
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={notificationOpen}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 4,
          sx: {
            width: 320,
            maxHeight: 450,
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold' }}>
          Notifications
        </Typography>
        <Divider />
        <List sx={{ 
          p: 0,
          maxHeight: 400,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '3px'
          }
        }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem button>
                  <ListItemIcon>
                    {notification.status === 'approved' ? (
                      <CheckCircleIcon color="success" />
                    ) : notification.status === 'rejected' ? (
                      <CancelIcon color="error" />
                    ) : (
                      <PendingIcon color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={notification.text}
                    secondary={getTimeAgo(notification.createdAt)}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary="No new notifications" 
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          )}
        </List>
      </Menu>
      
      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 4,
          sx: {
            minWidth: 200,
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          handleProfileDialogOpen();
        }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleMenuClose();
          handlePasswordDialogOpen();
        }}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Change Password" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => {
          handleMenuClose();
          handleLogoutClick();
        }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: theme.palette.error.main }} />
        </MenuItem>
      </Menu>
      
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
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Box>
  );
};

export default StudentDashboard;