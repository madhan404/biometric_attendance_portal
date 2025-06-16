import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Grid,
  Avatar,
  Box,
  Divider,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  Badge,
  MenuItem,
  Select,
  TextField,
  CardHeader,
  CardMedia,
  ListItemIcon,
  CardActionArea,
  Tabs,
  Tab,
  Paper,
  Menu,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  FormHelperText,
  CircularProgress,
  Chip,
  Snackbar,
  Alert
} from "@mui/material";
import { 
  ExpandLess, 
  ExpandMore, 
  Person as PersonIcon, 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  EventNote as EventNoteIcon,
  RequestQuote as RequestQuoteIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as TransgenderIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, PieChart, Pie, Cell, Tooltip, LineChart, Line } from 'recharts';
import logo from '../assets/logo.png';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import MuiTooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

import LeaveApprovalStatus from "../components/Non_ClassAdvisor/Non_LeaveApprovalStatus";
import LeaveApplicationForm from "../components/Non_ClassAdvisor/Non_LeaveApplication";
import PersonalAttendance from "../components/Non_ClassAdvisor/Non_PersonalAttendance";
import MentorDashboard from "./MentorDashboard";
import ClassAdvisorDashboard from "./StaffDashboard";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';
 const Non_ClassAdvisorDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout } = useAuth();
  const [selectedContent, setSelectedContent] = useState("dashboard");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [formData, setFormData] = useState({});
  const [rolesOpen, setRolesOpen] = useState(false);

  // Add state for personal requests
  const [personalRequests, setPersonalRequests] = useState({
    leave: { pending: 0, approved: 0, rejected: 0 },
    od: { pending: 0, approved: 0, rejected: 0 },
    permission: { pending: 0, approved: 0, rejected: 0 }
  });
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // User data with role information
  const [user, setUser] = useState({
    name: "",
    role: "",
    position_1: "", // will store 'mentor' or empty
    position_2: "", // will store 'class_advisor' or empty
    department: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
    sin_number: "",
    gender: "",
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    pendingOD: 0,
    approvedOD: 0,
    rejectedOD: 0,
    pendingPermission: 0,
    approvedPermission: 0,
    rejectedPermission: 0,
    studentPendingLeaves: 0,
    studentApprovedLeaves: 0,
    studentRejectedLeaves: 0,
    studentPendingOD: 0,
    studentApprovedOD: 0,
    studentRejectedOD: 0
  });

  // Add state for academic calendar
  const [academicCalendar, setAcademicCalendar] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  // Add state for recent activities
  const [recentActivities, setRecentActivities] = useState([]);

  // Add notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add new state for trend data
  const [leaveTrendData, setLeaveTrendData] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [newActivitiesCount, setNewActivitiesCount] = useState(0);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(prev => ({
        ...prev,
        ...parsedUser,
        role: "Staff" // Default role
      }));
      setFormData(parsedUser);
    }
  }, []);

  // Add fetchAcademicCalendar function
  const fetchAcademicCalendar = async () => {
    setLoadingCalendar(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/holidays`);
      if (response.data.status === "success") {
        setAcademicCalendar(response.data.holidays);
        
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to fetch holidays",
        severity: "error"
      });
    } finally {
      setLoadingCalendar(false);
    }
  };

  // Add useEffect for fetching holidays
  useEffect(() => {
    fetchAcademicCalendar();
  }, []);

  // Add fetchRecentActivities function
  const fetchRecentActivities = async () => {
    try {
      if (!user?.sin_number) return;

      const response = await axios.post(`${API_BASE_URL}/staff/staff-leave-sts`, {
        sin_number: user.sin_number
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        maxContentLength: 2000,
        maxBodyLength: 2000
      });

      if (response.data && Array.isArray(response.data)) {
        // For Recent Activity - show all recent requests
        const activities = response.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(request => ({
            id: request.id,
            request_id: request.request_id || '-',
            type: request.request_type || 'leave',
            reason: request.reason,
            date: request.createdAt,
            status: getOverallStatus(request),
            text: `Your ${request.request_type || 'leave'} request for ${request.reason}`
          }));

        setRecentActivities(activities);

        // For Notifications - prioritize approved/rejected requests
        const notifications = response.data
          .filter(request => request.principal_approval)
          .sort((a, b) => {
            // First sort by status (approved/rejected first)
            const statusOrder = { 'approved': 0, 'rejected': 1, 'pending': 2 };
            const statusA = statusOrder[a.principal_approval] || 2;
            const statusB = statusOrder[b.principal_approval] || 2;
            
            if (statusA !== statusB) {
              return statusA - statusB;
            }
            
            // If status is same, sort by date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
          .slice(0, 5)
          .map(request => ({
            id: request.id,
            request_id: request.request_id || '-',
            type: request.request_type || 'leave',
            reason: request.reason,
            date: request.createdAt,
            status: request.principal_approval,
            text: `Your ${request.request_type || 'leave'} request for ${request.reason} has been ${request.principal_approval} by Principal`
          }));

        setNotifications(notifications);

        // Calculate new activities count (only approved/rejected)
        const newActivitiesCount = response.data.filter(
          request => request.principal_approval === 'approved' || request.principal_approval === 'rejected'
        ).length;

        setNewActivitiesCount(newActivitiesCount);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      if (error.response?.status === 431) {
        setNotification({
          open: true,
          message: "Error loading activities. Please try again.",
          severity: "error"
        });
      }
    }
  };

  // Add getOverallStatus function
  const getOverallStatus = (request) => {
    if (
      request.principal_approval === "rejected"
      // request.hod_approval === "rejected"
   
    ) {
      return "Rejected";
    }
    const principalApproved = request.principal_approval === "approved";
    // const hodApproved = request.hod_approval === "approved";
    if (principalApproved) {
      return "Approved";
    }
    return "Pending";
  };

  // Add useEffect for fetching recent activities
  useEffect(() => {
    if (user?.sin_number) {
      fetchRecentActivities();
    }
  }, [user?.sin_number]);

  // Add renderHolidaysList function
  const renderHolidaysList = () => {
    return (
      <Card elevation={4} sx={{
        borderRadius: 3,
        height: '100%',
        width: '100%',
        maxWidth: 550,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }
      }}>
        <CardHeader
          title={`Holidays ${new Date().getFullYear()}`}
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
          action={
            <Tooltip title="Refresh Holidays">
              <IconButton
                onClick={fetchAcademicCalendar}
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent sx={{ flex: 1, p: 0 }}>
          {loadingCalendar ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <CircularProgress size={24} />
            </Box>
          ) : !academicCalendar || academicCalendar.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <Typography variant="body2" color="textSecondary">
                No holidays found for this year
              </Typography>
            </Box>
          ) : (
            <List sx={{
              height: 300,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.primary.light,
                borderRadius: '10px',
                '&:hover': {
                  background: theme.palette.primary.main
                }
              }
            }}>
              {academicCalendar.map((holiday) => (
                <ListItem
                  key={holiday.id || holiday.date}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.05)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar sx={{
                      bgcolor: theme.palette.primary.light,
                      width: 32,
                      height: 32
                    }}>
                      <CalendarIcon fontSize="small" sx={{ color: 'white' }} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={500}>
                        {holiday.holiday_reason}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {new Date(holiday.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditProfile = () => {
    setFormData(user);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setFormData(user);
    setEditMode(false);
  };

  const handleRolesClick = () => {
    setRolesOpen(!rolesOpen);
  };

  // Sample data
  const attendanceData = {
    daily: [
      { name: 'Present', value: 85 },
      { name: 'Absent', value: 10 },
      { name: 'Late', value: 5 }
    ],
    weekly: [
      { name: 'Present', value: 80 },
      { name: 'Absent', value: 15 },
      { name: 'Late', value: 5 }
    ],
    monthly: [
      { name: 'Present', value: 75 },
      { name: 'Absent', value: 20 },
      { name: 'Late', value: 5 }
    ],
    yearly: [
      { name: 'Present', value: 70 },
      { name: 'Absent', value: 25 },
      { name: 'Late', value: 5 }
    ]
  };

  const requestData = [
    { name: 'Leave', pending: user.pendingLeaves, approved: user.approvedLeaves, rejected: user.rejectedLeaves },
    { name: 'OD', pending: user.pendingOD, approved: user.approvedOD, rejected: user.rejectedOD },
    { name: 'Permission', pending: user.pendingPermission, approved: user.approvedPermission, rejected: user.rejectedPermission }
  ];

  const studentRequestData = [
    { name: 'Leave', pending: user.studentPendingLeaves, approved: user.studentApprovedLeaves, rejected: user.studentRejectedLeaves },
    { name: 'OD', pending: user.studentPendingOD, approved: user.studentApprovedOD, rejected: user.studentRejectedOD }
  ];

  const COLORS = ['#FFA500', '#4CAF50', '#F44336'];

  const getMenuItems = () => {
    const baseItems = [
      { 
        icon: <DashboardIcon />, 
        text: "Dashboard", 
        onClick: () => {
          setSelectedContent("dashboard");
          if (isMobile) setMobileOpen(false);
        } 
      },
      { 
        icon: <EventNoteIcon />,
        text: "Personal Attendance", 
        onClick: () => {
          setSelectedContent("attendance");
          if (isMobile) setMobileOpen(false);
        } 
      },
      { 
        icon: <RequestQuoteIcon />, 
        text: "Request Application", 
        onClick: () => {
          setSelectedContent("application");
          if (isMobile) setMobileOpen(false);
        } 
      },
      { 
        icon: <AssignmentIcon />,
        text: "Request Status", 
        onClick: () => {
          setSelectedContent("status");
          if (isMobile) setMobileOpen(false);
        } 
      }
    ];

    const hasRoles = (user.position_1 === 'mentor' || user.position_2 === 'class_advisor');

    if (hasRoles) {
      baseItems.splice(1, 0, {
        icon: <GroupIcon />,
        text: "My Roles",
        onClick: handleRolesClick,
        isDropdown: true,
        open: rolesOpen,
        children: []
      });

      if (user.position_1 === 'mentor') {
        const rolesItem = baseItems.find(item => item.text === "My Roles");
        if (rolesItem) {
          rolesItem.children.push({
            icon: <PeopleIcon />,
            text: "Mentor Dashboard",
            onClick: () => {
              setSelectedContent("mentor");
              if (isMobile) setMobileOpen(false);
            }
          });
        }
      }

      if (user.position_2 === 'class_advisor') {
        const rolesItem = baseItems.find(item => item.text === "My Roles");
        if (rolesItem) {
          rolesItem.children.push({
            icon: <SchoolIcon />,
            text: "Class Advisor Dashboard",
            onClick: () => {
              setSelectedContent("advisor");
              if (isMobile) setMobileOpen(false);
            }
          });
        }
      }
    }

    return baseItems;
  };

  const sidebarMenuItems = getMenuItems();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const handleExportHolidays = () => {
    const worksheet = XLSX.utils.json_to_sheet(academicCalendar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Holidays");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(fileData, `Holiday_Calendar_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleProfileDialogOpen = () => {
    setProfileDialogOpen(true);
    setEditMode(false);
    handleProfileMenuClose();
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handlePasswordDialogOpen = () => {
    setPasswordResetOpen(true);
    setOldPassword('');
    setNewPassword('');
    setPasswordError('');
    handleProfileMenuClose();
  };

  const handlePasswordDialogClose = () => {
    setPasswordResetOpen(false);
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

  const handleSaveProfile = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/staff/update-profile/${user.sin_number}`, formData, {
          headers: {
          'Content-Type': 'application/json',
          }
      });
      if (response.data.status === "success") {
        setUser(formData);
        setEditMode(false);
        handleProfileDialogClose();
        setNotification({
          open: true,
          message: "Profile updated successfully",
          severity: "success"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to update profile",
        severity: "error"
      });
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setPasswordError('Both fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/staff/change-password/${user.sin_number}`, {
        oldPassword,
        newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === "success") {
        setOldPassword('');
        setNewPassword('');
        setPasswordError('');
        setPasswordResetOpen(false);
        setNotification({
          open: true,
          message: "Password changed successfully",
          severity: "success"
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.response?.data?.error || "Failed to change password");
    }
  };

  const handleBackToDashboard = () => {
    setSelectedContent("dashboard");
  };

  const renderRequestSummaryCard = (title, data, icon) => (
    <Card elevation={3} sx={{ 
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }
      }}>
        <CardHeader
        title={title} 
        avatar={React.cloneElement(icon, { sx: { color: 'white' } })}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
          py: 1,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
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
        p: 1.5
      }}>
        {data.map((item, index) => (
          <Box 
            key={index}
                  sx={{
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              backgroundColor: `rgba(${index === 0 ? '255, 165, 0' : index === 1 ? '76, 175, 80' : '244, 67, 54'}, 0.1)`,
              borderRadius: 2,
              height: '30%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {index === 0 ? <PendingIcon sx={{ color: '#FFA500', mr: 1 }} /> : 
               index === 1 ? <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} /> : 
               <CancelIcon sx={{ color: '#F44336', mr: 1 }} />}
              <Typography variant="body2">
                {index === 0 ? 'Pending:' : index === 1 ? 'Approved:' : 'Rejected:'}
                      </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item}</Typography>
          </Box>
        ))}
        </CardContent>
      </Card>
    );

  const drawer = (
    <Box sx={{ overflow: "auto", height: "100%", display: "flex", flexDirection: "column", backgroundColor: '#1a237e' }}>
      <Toolbar />
      <List sx={{ flex: 1 }}>
        {sidebarMenuItems.map((item, index) => {
          const isSelected = selectedContent === item.text.toLowerCase().replace(' ', '') || 
                           (item.children && item.children.some(child => 
                             selectedContent === child.text.toLowerCase().replace(' ', '')));

  return (
            <React.Fragment key={index}>
              <ListItem 
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
                {item.isDropdown && (item.open ? <ExpandLess /> : <ExpandMore />)}
              </ListItem>
              
              {item.isDropdown && item.children && (
                <Collapse in={item.open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    {item.children.map((child, childIndex) => {
                      const isChildSelected = selectedContent === child.text.toLowerCase().replace(' ', '');
                      return (
                        <ListItem 
                          key={childIndex}
                          button 
                          onClick={child.onClick}
          sx={{
                            pl: 4,
                            '&:hover': { 
                              backgroundColor: 'rgba(87, 13, 206, 0.1)', 
                              borderRadius: 2 
                            },
                            backgroundColor: isChildSelected ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                          }}
                        >
                          <ListItemIcon sx={{ color: isChildSelected ? 'white' : 'rgba(255, 255, 255, 0.7)' }}>
                            {React.cloneElement(child.icon, { color: isChildSelected ? 'inherit' : 'inherit' })}
                          </ListItemIcon>
                          <ListItemText 
                            primary={child.text} 
                            primaryTypographyProps={{ 
                              color: isChildSelected ? 'white' : 'rgba(255, 255, 255, 0.7)',
                              fontWeight: isChildSelected ? '600' : '400'
                            }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
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

  const renderDashboardContent = () => (
    <>
      <Typography 
        variant="h4" 
        sx={{ 
          color: '#1976d2', 
          fontWeight: 'bold', 
          mb: 3,
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
          fontSize: '2.2rem',
          letterSpacing: '0.5px'
        }}
      >
        Welcome, {user.name}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* First Row - Profile Card */}
        <Grid item xs={12} md={4} width={550} height={275}>
          <Card 
            elevation={4}
            sx={{ 
              borderRadius: 3, 
              height:'100%',
              width: '100%',
              mr: 11,
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
                  src={getImageSource(user?.photo)}
                  alt={user?.name || 'User'}
                  sx={{ 
                    width: 80, 
                    height: 80,
                    border: '2px solid white'
                  }}
                />
                <Box sx={{ ml: isMobile ? 0 : 3 }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: "bold" }}>
                    {user.name}
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "body1"}>
                    {user.role} | {user.department}
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "body1"}>
                    Position 1 : {user.position_1} | Position 2 : {user.position_2}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant={isMobile ? "caption" : "body2"}>{user.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant={isMobile ? "caption" : "body2"}>{user.phone}</Typography>
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
                <Typography variant="body2">View Profile</Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
                
       {/* My Requests Summary Card */}
<Grid item xs={12} md={8} sx={{ width: { xs: '100%', md: 500 }, height: 275 }}>
  <Card elevation={4} sx={{ 
    borderRadius: 3, 
    height: '100%',
    width: '100%',
    mr: 0,
    mb: 0,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
    }
  }}>
    <CardHeader 
      title="My Requests Summary" 
      avatar={<EventNoteIcon sx={{ color: 'white' }} />}
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        py: 1,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
      }}
      titleTypographyProps={{
        variant: 'subtitle1',
        fontWeight: 'bold',
        fontSize: '0.875rem'
      }}
      action={
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={fetchPersonalRequests}
            sx={{ color: 'white', p: 0.5 }}
            disabled={loadingRequests}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    />
    <CardContent sx={{ 
      flex: 1, 
      p: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {loadingRequests ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%'
        }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <Grid container spacing={1} sx={{ 
            flex: 1,
            overflow: 'hidden',
            minHeight: 0 // Allows grid to shrink properly
          }}>
            {/* Leave Requests */}
            <Grid item xs={4} sx={{ height: '100%' }}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  width: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(25, 118, 210, 0.2)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                  p: 1,
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(25, 118, 210, 0.1)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                    Leave Requests
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  p: 1
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.5
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PendingIcon sx={{ color: '#FFA500', mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Pending</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.leave.pending} 
                      color="warning" 
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.5
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Approved</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.leave.approved} 
                      color="success" 
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CancelIcon sx={{ color: '#F44336', mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Rejected</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.leave.rejected} 
                      color="error" 
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.05)', 
                  p: 0.5, 
                  textAlign: 'center',
                  borderTop: '1px solid rgba(25, 118, 210, 0.1)'
                }}>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem' }} color="textSecondary">
                    {personalRequests.leave.pending === 0 ? 
                      "No pending requests" : 
                      `${personalRequests.leave.pending} pending`}
                  </Typography>
                </Box>
              </Card>
            </Grid>
            
            {/* OD Requests */}
            <Grid item xs={4} sx={{ height: '100%' }}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  width: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(255, 152, 0, 0.2)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 152, 0, 0.1)', 
                  p: 1,
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(255, 152, 0, 0.1)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                    OD Requests
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  p: 1
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.5
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PendingIcon sx={{ color: '#FFA500', mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Pending</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.od.pending} 
                      color="warning" 
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.5
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Approved</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.od.approved} 
                      color="success" 
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CancelIcon sx={{ color: '#F44336', mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Rejected</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.od.rejected} 
                      color="error" 
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 152, 0, 0.05)', 
                  p: 0.5, 
                  textAlign: 'center',
                  borderTop: '1px solid rgba(255, 152, 0, 0.1)'
                }}>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem' }} color="textSecondary">
                    {personalRequests.od.pending === 0 ? 
                      "No pending requests" : 
                      `${personalRequests.od.pending} pending`}
                  </Typography>
                </Box>
              </Card>
            </Grid>
            
            {/* Permission Requests */}
            <Grid item xs={4} sx={{ height: '100%' }}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  width: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                  p: 1,
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(76, 175, 80, 0.1)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                    Permission Requests
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  p: 1
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.5
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PendingIcon sx={{ color: '#FFA500', mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Pending</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.permission.pending} 
                      color="warning" 
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.5
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Approved</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.permission.approved} 
                      color="success" 
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CancelIcon sx={{ color: '#F44336', mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Rejected</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.permission.rejected} 
                      color="error" 
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.05)', 
                  p: 0.5, 
                  textAlign: 'center',
                  borderTop: '1px solid rgba(76, 175, 80, 0.1)'
                }}>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem' }} color="textSecondary">
                    {personalRequests.permission.pending === 0 ? 
                      "No pending requests" : 
                      `${personalRequests.permission.pending} pending`}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<ArrowForwardIcon fontSize="small" />}
              onClick={() => setSelectedContent("status")}
              sx={{ 
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                fontSize: '0.75rem',
                py: 0.5,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              View Detailed Status
            </Button>
          </Box>
        </>
      )}
    </CardContent>
  </Card>
</Grid>

       {/* Second Row - Recent Activity */}
<Grid item xs={12} md={6} lg={4} height={275}>
  <Card 
    elevation={4} 
    sx={{ 
      borderRadius: 3, 
      height: '100%',
      maxHeight: 275,
      display: 'flex',
      flexDirection: 'column',
      transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
      '&:hover': { 
        transform: 'translateY(-5px)', 
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)' 
      }
    }}
  >
    <CardHeader 
      title="Recent Activity" 
      titleTypographyProps={{ variant: 'h6', fontWeight: 'bold', color: 'white' }} 
      action={
        <Tooltip title="View All">
          <IconButton onClick={() => setSelectedContent("status")} sx={{ color: 'white' }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      }
      sx={{ 
        pb: 1,
        backgroundColor: 'primary.main',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px'
      }}
    />
    <CardContent sx={{ pt: 0, flex: 1, overflow: 'auto' }}>
      <TableContainer sx={{ maxHeight: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width="15%">S.No</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <TableRow key={activity.id || idx} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {activity.type || '-'}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {activity.date ? new Date(activity.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={activity.status}
                      color={
                        activity.status.toLowerCase() === 'approved' ? 'success' : 
                        activity.status.toLowerCase() === 'rejected' ? 'error' : 
                        'warning'
                      }
                      icon={
                        activity.status.toLowerCase() === 'approved' ? <CheckCircleIcon fontSize="small" /> :
                        activity.status.toLowerCase() === 'rejected' ? <CancelIcon fontSize="small" /> : 
                        <PendingIcon fontSize="small" />
                      }
                      sx={{ 
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1,
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    No recent activities
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
</Grid>

     {/* Holidays Card */}
<Grid 
  item 
  xs={12} 
  md={8}
  sx={{
    width: '100%',
    
    mr: { xs: 0, md: 0 }
  }}
>
  {renderHolidaysList()}
</Grid>
        {/* Leave Request Trends */}
        <Grid item xs={12} md={8}>
          <Card elevation={4} sx={{ 
            borderRadius: 3, 
            height: '97%',
            width:'105%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
            }
          }}>
            <CardHeader 
              title="Leave Request Trends" 
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
              action={
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={fetchLeaveTrendData}
                    sx={{ color: 'white' }}
                    disabled={loadingTrend}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent sx={{ flex: 1, p: 2 }}>
              {loadingTrend ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                  <CircularProgress size={24} />
                </Box>
              ) : leaveTrendData.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                  <Typography variant="body2" color="textSecondary">
                    No trend data available
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ height: 400 }}>
                  <LineChart
                    width={isMobile ? window.innerWidth - 100 : (window.innerWidth / 2) - 100}
                    height={400}
                    data={leaveTrendData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="leave" 
                      stroke="#1976d2" 
                      activeDot={{ r: 8 }} 
                      name="Leave"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="od" 
                      stroke="#FF9800" 
                      name="OD"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="permission" 
                      stroke="#4CAF50" 
                      name="Permission"
                    />
                  </LineChart>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  const renderRoleDashboardHeader = (title) => (
    <Box sx={{ display: 'flex', mt: 3, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" sx={{ 
        color: '#1976d2', 
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
      }}>
        {title}
      </Typography>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={handleBackToDashboard}
        variant="outlined"
        sx={{ 
          backgroundColor: 'white',
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
            color: 'white'
          }
        }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );

  // Add fetchPersonalRequests function
  const fetchPersonalRequests = async () => {
    setLoadingRequests(true);
    try {
      if (!user?.sin_number) {
        console.log('No SIN number available');
        setLoadingRequests(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/staff/staff-leave-sts`, {
        sin_number: user.sin_number
      });

      if (response.data && Array.isArray(response.data)) {
        const counts = {
          leave: { pending: 0, approved: 0, rejected: 0 },
          od: { pending: 0, approved: 0, rejected: 0 },
          permission: { pending: 0, approved: 0, rejected: 0 }
        };

        response.data.forEach(request => {
          const type = request.request_type?.toLowerCase() || 'leave';
          if (counts[type]) {
            const status = getOverallStatus(request);
            if (status === 'Pending') {
              counts[type].pending++;
            } else if (status === 'Approved') {
              counts[type].approved++;
            } else if (status === 'Rejected') {
              counts[type].rejected++;
            }
          }
        });

        setPersonalRequests(counts);
      }
    } catch (error) {
      console.error('Error fetching personal requests:', error);
      if (error.response?.status !== 404) {
        setNotification({
          open: true,
          message: error.response?.data?.error || "Failed to fetch personal requests",
          severity: "error"
        });
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  // Add useEffect for fetching personal requests
  useEffect(() => {
    if (user?.sin_number) {
      fetchPersonalRequests();
    }
  }, [user?.sin_number]);

  // Add function to fetch trend data
  const fetchLeaveTrendData = async () => {
    try {
      setLoadingTrend(true);
      const response = await axios.post(`${API_BASE_URL}/staff/staff-leave-sts`, {
        sin_number: user.sin_number
      });

      if (response.data && Array.isArray(response.data)) {
        // Group by month and count request types
        const monthlyData = response.data.reduce((acc, request) => {
          const date = new Date(request.createdAt);
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          
          if (!acc[monthYear]) {
            acc[monthYear] = {
              month: monthYear,
              leave: 0,
              od: 0,
              permission: 0
            };
          }
          
          const type = request.request_type?.toLowerCase() || 'leave';
          if (acc[monthYear][type] !== undefined) {
            acc[monthYear][type]++;
          }
          
          return acc;
        }, {});

        // Convert to array and sort by date
        const sortedData = Object.values(monthlyData)
          .sort((a, b) => {
            const dateA = new Date(a.month);
            const dateB = new Date(b.month);
            return dateA - dateB;
          });

        setLeaveTrendData(sortedData);
      }
    } catch (error) {
      console.error('Error fetching trend data:', error);
      setNotification({
        open: true,
        message: "Failed to fetch trend data",
        severity: "error"
      });
    } finally {
      setLoadingTrend(false);
    }
  };

  // Add useEffect to fetch trend data
  useEffect(() => {
    if (user?.sin_number) {
      fetchLeaveTrendData();
    }
  }, [user?.sin_number]);

  const getImageSource = (photo) => {
    if (!photo) return '/default-avatar.png';
    
    // If it's already a URL, return it directly
    if (photo.startsWith('http')) {
      return photo;
    }
    
    // If it's base64 data, format it correctly
    if (photo.startsWith('data:image')) {
      return photo;
    }
    
    // If it's just base64 data without the prefix, add it
    if (photo.startsWith('JVBERi0') || photo.startsWith('iVBORw0')) {
      return `data:image/jpeg;base64,${photo}`;
    }
    
    return '/default-avatar.png';
  };

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
    <>
      <Box sx={{ display: "flex", background: "#f5f5f5", minHeight: "100vh" }}>
       <AppBar 
  position="fixed" 
  sx={{ 
    zIndex: theme.zIndex.drawer + 1, 
    background: "#1a237e",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  }}
>
  <Toolbar>
    <Box sx={{ 
      display: 'flex', 
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Left side - Menu button and logo */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        flexShrink: 0,
        minWidth: isMobile ? 'auto' : '240px' // Match drawer width
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
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <img 
              src={logo} 
              alt="College Logo" 
              style={{ 
                height: '40px',  
                width: 'auto',
                marginRight: '10px',
                objectFit: 'contain'
              }} 
            />
          </Box>
        )}
      </Box>

      {/* Center - Title */}
      <Typography 
        variant="h6" 
        noWrap
        sx={{ 
          fontWeight: "bold", 
          letterSpacing: 1, 
          color: 'white',
          textAlign: 'center',
          flexGrow: 1,
          mx: 1,
          fontSize: isMobile ? '1.1rem' : '1.5rem',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        Faculty Dashboard
      </Typography>

      {/* Right side - Icons */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexShrink: 0,
        minWidth: isMobile ? 'auto' : '240px' // Balance left side
      }}>
        <IconButton 
          color="inherit" 
          onClick={handleNotificationClick}
          sx={{ color: 'white' }}
          size={isMobile ? "small" : "medium"}
        >
          <Badge badgeContent={newActivitiesCount} color="error">
            <NotificationsIcon fontSize={isMobile ? "small" : "medium"} />
          </Badge>
        </IconButton>
        
        <IconButton 
          onClick={handleProfileMenuOpen} 
          sx={{ color: 'white', ml: 1 }}
          size={isMobile ? "small" : "medium"}
        >
          <Avatar
            src={user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png'}
            alt={user?.name || 'User'}
            sx={{ 
              width: isMobile ? 28 : 32, 
              height: isMobile ? 28 : 32,
              border: '2px solid white'
            }}
          />
        </IconButton>
      </Box>
    </Box>
  </Toolbar>
</AppBar>

        <Popover
          open={Boolean(notificationAnchorEl)}
          anchorEl={notificationAnchorEl}
          onClose={handleNotificationMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            style: {
              maxHeight: '400px',
              width: isMobile ? '90vw' : '350px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#4169E1',
                borderRadius: '10px'
              }
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Notifications</Typography>
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <ListItem key={notification.id} sx={{ py: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{notification.text}</Typography>
                          <Chip
                            size="small"
                            label={notification.status}
                            color={notification.status === 'approved' ? 'success' : 
                                  notification.status === 'rejected' ? 'error' : 'warning'}
                            icon={notification.status === 'approved' ? <CheckCircleIcon fontSize="small" /> :
                                  notification.status === 'rejected' ? <CancelIcon fontSize="small" /> : <PendingIcon fontSize="small" />}
                          />
                        </Box>
                      }
                      secondary={getTimeAgo(notification.date)}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No new notifications" />
                </ListItem>
              )}
            </List>
          </Box>
        </Popover>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleProfileDialogOpen}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handlePasswordDialogOpen}>
            <ListItemIcon>
              <LockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Change Password</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogoutClick} sx={{ color: '#f44336' }}>
            <ListItemIcon sx={{ color: '#f44336' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>

        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          sx={{
            width: isMobile ? 280 : 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': { 
              width: isMobile ? 280 : 240,
              boxSizing: "border-box",
              background: "#001F3F",
              borderRight: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "2px 0 5px rgba(0,0,0,0.05)"
            },
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </Drawer>

        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: isMobile ? 2 : 3,
            width: isMobile ? '100%' : `calc(100% - 240px)`,
            backgroundColor: '#f5f5f5'
          }}
        >
          <Toolbar />
          
          {selectedContent === "dashboard" && renderDashboardContent()}
          {selectedContent === "attendance" && (
            <Box sx={{ ml: isMobile ? 0 : 2 }}>
              <PersonalAttendance />
            </Box>
          )}
          {selectedContent === "application" && (
            <Box sx={{ ml: isMobile ? 0 : 2 }}>
              <LeaveApplicationForm />
            </Box>
          )}
          {selectedContent === "status" && (
            <Box sx={{ ml: isMobile ? 0 : 2 }}>
              <LeaveApprovalStatus />
            </Box>
          )}
          
          {selectedContent === "mentor" && (
            <Box sx={{ ml: isMobile ? 0 : 2 }}>
              {renderRoleDashboardHeader("")}
              <MentorDashboard />
            </Box>
          )}
          
          {selectedContent === "advisor" && (
            <Box sx={{ ml: isMobile ? 0 : 2 }}>
              {renderRoleDashboardHeader("")}
              <ClassAdvisorDashboard />
            </Box>
          )}
        </Box>
      </Box>

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
                     src={getImageSource(user?.photo)}
                     alt={user?.name || 'User'}
                     sx={{ 
                       width: 150, 
                       height: 150,
                       mb: 2, 
                       border: '2px solid #eee',
                       objectFit: 'cover'
                     }}
              />
              {editMode && (
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 2 }}
                  startIcon={<EditIcon />}
                >
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, photo: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </Button>
              )}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{formData.name || user.name}</Typography>
              <Typography variant="body1" color="textSecondary">{formData.role || user.role} | {formData.department || user.department}</Typography>
            </Box>
            <Box sx={{ flex: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name || user.name}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ID Number"
                    name="sin_number"
                    value={formData.sin_number || user.sin_number}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email || user.email}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone || user.phone}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department || user.department}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={formData.gender || user.gender}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address || user.address}
                    onChange={handleInputChange}
                    margin="normal"
                    multiline
                    rows={2}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordResetOpen}
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
          <Button variant="contained" onClick={handleChangePassword}>Change</Button>
          </DialogActions>
      </Dialog>

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

      {/* Add Snackbar for notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Non_ClassAdvisorDashboard;