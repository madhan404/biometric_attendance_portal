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
  Snackbar,
  Alert,
  Menu,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Popover,
  FormHelperText
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
  PhotoCamera,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import logo from '../assets/logo.png';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { InputAdornment } from '@mui/material';
import { CircularProgress } from '@mui/material';

import LeaveApprovalStatus from "../components/Hod_Personal/Hod_LeaveApprovalStatus";
import LeaveApplicationForm from "../components/Hod_Personal/Hod_LeaveApplication";
import PersonalAttendance from "../components/Hod_Personal/Hod_PersonalAttendance";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const Hod_PersonalDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
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
  const [personalRequests, setPersonalRequests] = useState({
    leave: { pending: 0, approved: 0, rejected: 0 },
    od: { pending: 0, approved: 0, rejected: 0 },
    permission: { pending: 0, approved: 0, rejected: 0 }
  });
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [user, setUser] = useState({
    name: "",
    role: "",
    position: null,
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
    rejectedPermission: 0
  });

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    name: '',
    department: '',
    sin_number: ''
  });
  const [editedData, setEditedData] = useState({
    email: '',
    phone: '',
    address: '',
    name: '',
    department: '',
    sin_number: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [academicCalendar, setAcademicCalendar] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [newActivitiesCount, setNewActivitiesCount] = useState(0);

  const getOverallStatus = (request) => {
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
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(prev => ({
        ...prev,
        ...parsedUser,
        ...(parsedUser.position === 1 && { role: "Mentor" }),
        ...(parsedUser.position === 2 && { role: "Class Advisor" })
      }));
      setFormData(parsedUser);
      setEditedData(parsedUser);
    }
  }, []);

  const fetchRecentActivities = async () => {
    try {
      if (!user?.sin_number) return;

      const response = await axios.post(`${API_BASE_URL}/stdleavests/leavests`, {
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
            status: request.principal_approval || 'pending',
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

  useEffect(() => {
    const fetchData = async () => {
      await fetchRecentActivities();
      await fetchAcademicCalendar();
    };

    if (user?.sin_number) {
      fetchData();
    }
  }, [user?.sin_number]);

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

  const fetchPersonalRequests = async () => {
    setLoadingRequests(true);
    try {
      if (!user?.sin_number) {
        console.log('No SIN number available');
        setLoadingRequests(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/stdleavests/leavests`, {
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
            const status = getOverallStatus(request).toLowerCase();
            
            if (status === 'pending') {
              counts[type].pending++;
            } else if (status === 'approved') {
              counts[type].approved++;
            } else if (status === 'rejected') {
              counts[type].rejected++;
            }
          }
        });

        setUser(prev => ({
          ...prev,
          pendingLeaves: counts.leave.pending,
          approvedLeaves: counts.leave.approved,
          rejectedLeaves: counts.leave.rejected,
          pendingOD: counts.od.pending,
          approvedOD: counts.od.approved,
          rejectedOD: counts.od.rejected,
          pendingPermission: counts.permission.pending,
          approvedPermission: counts.permission.approved,
          rejectedPermission: counts.permission.rejected
        }));

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

  useEffect(() => {
    if (user?.sin_number) {
      fetchPersonalRequests();
    }
  }, [user?.sin_number]);

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
        icon: <AssignmentIcon />, 
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
        icon: <EventNoteIcon />, 
        text: "Request Status", 
        onClick: () => {
          setSelectedContent("status");
          if (isMobile) setMobileOpen(false);
        } 
      }
    ];

    if (user.position === 1) {
      baseItems.splice(1, 0, {
        icon: <PeopleIcon />,
        text: "Mentor Dashboard",
        onClick: () => {
          setSelectedContent("mentor");
          if (isMobile) setMobileOpen(false);
        }
      });
    }

    if (user.position === 2) {
      baseItems.splice(1, 0, {
        icon: <SchoolIcon />,
        text: "Class Advisor",
        onClick: () => {
          setSelectedContent("advisor");
          if (isMobile) setMobileOpen(false);
        }
      });
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleExportAttendance = () => {
    const data = attendanceData[dateRange];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(fileData, `Attendance_${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileDialogOpen = () => {
    setProfileDialogOpen(true);
    setEditMode(false);
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
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

  const handleEditProfile = () => {
    setEditMode(true);
    setEditedData({
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      name: user.name || '',
      department: user.department || '',
      sin_number: user.sin_number || ''
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedData({
      email: '',
      phone: '',
      address: '',
      name: '',
      department: '',
      sin_number: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          open: true,
          message: "File size should be less than 5MB",
          severity: "error"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setNotification({
          open: true,
          message: "Please upload an image file",
          severity: "error"
        });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editMode) {
      setEditedData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      setNotification({
        open: true,
        message: "User data not available",
        severity: "error"
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      const dataToSend = editMode ? editedData : formData;

      if (!dataToSend.email || !dataToSend.phone) {
        setNotification({
          open: true,
          message: "Email and phone are required fields",
          severity: "error"
        });
        return;
      }

      formDataToSend.append("email", dataToSend.email);
      formDataToSend.append("phone", dataToSend.phone);
      formDataToSend.append("address", dataToSend.address || "");

      if (photoFile) {
        formDataToSend.append("photo", photoFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/hodstaff/update-profile/${user.sin_number}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.status === "success") {
        const updatedUser = {
          ...user,
          ...response.data.hod,
          photo: user.photo
        };
        setUser(updatedUser);
        setFormData(updatedUser);
        setEditedData(updatedUser);
        setEditMode(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        setNotification({
          open: true,
          message: "Profile updated successfully",
          severity: "success"
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to update profile",
        severity: "error"
      });
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      setPasswordError("User data not available");
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/hodstaff/change-password/${user.sin_number}`,
        {
          oldPassword: oldPassword,
          newPassword: newPassword
        }
      );

      if (response.data.status === "success") {
        setPasswordResetOpen(false);
        setOldPassword("");
        setNewPassword("");
        setPasswordError("");
        setNotification({
          open: true,
          message: "Password changed successfully",
          severity: "success"
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(error.response?.data?.error || "Failed to change password");
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to change password",
        severity: "error"
      });
    }
  };

  const handlePasswordDialogClose = () => {
    setPasswordResetOpen(false);
    setOldPassword("");
    setNewPassword("");
    setPasswordError("");
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchAcademicCalendar = async () => {
    setLoadingCalendar(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/hodstaff/holidays`);
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

  useEffect(() => {
    fetchAcademicCalendar();
  }, []);

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const requestData = [
    { name: 'Leave', pending: user.pendingLeaves, approved: user.approvedLeaves, rejected: user.rejectedLeaves },
    { name: 'OD', pending: user.pendingOD, approved: user.approvedOD, rejected: user.rejectedOD },
    { name: 'Permission', pending: user.pendingPermission, approved: user.approvedPermission, rejected: user.rejectedPermission }
  ];

  const COLORS = ['#FFA500', '#4CAF50', '#F44336'];

  const renderHolidaysList = () => {
    return (
      <Card elevation={4} sx={{
        borderRadius: 3,
        height: '100%',
        width: '100%',
        minWidth: isMobile ? '100%' : 450,
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
                  key={holiday.id}
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

  const drawer = (
    <Box sx={{ 
      overflow: "auto", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "space-between" 
    }}>
      <div>
        <Toolbar />
        <List>
          {sidebarMenuItems.map((item, index) => (
            <ListItem 
              key={index} 
              onClick={item.onClick}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                  borderRadius: 2 
                },
                backgroundColor: selectedContent === item.text.toLowerCase().replace(' ', '') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ ml: 1, fontWeight: 'medium' }} 
                primaryTypographyProps={{ color: "#fff" }}
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
      </div>
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
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt="College Logo" style={{ height: isMobile ? '50px' : '65px', marginRight: '10px' }} />
            </Box>
            <Box sx={{ flex: 1 }} />
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                fontWeight: "bold", 
                letterSpacing: 1, 
                textAlign: "center",
                display: isMobile ? 'none' : 'block'
              }}
            >
              Faculty Dashboard
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
              <IconButton 
                color="inherit" 
                onClick={handleNotificationClick}
                sx={{ mr: 1, color: 'white' }}
              >
                <Badge badgeContent={newActivitiesCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton onClick={handleProfileMenuOpen} sx={{ color: 'white' }}>
                <Avatar
                  src={user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png'}
                  alt={user?.name || 'User'}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: '2px solid white'
                  }}
                />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              width: 200,
              mt: 1,
              '& .MuiMenu-list': {
                padding: 0
              }
            }
          }}
        >
          <MenuItem onClick={() => { handleProfileDialogOpen(); handleProfileMenuClose(); }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { setPasswordResetOpen(true); handleProfileMenuClose(); }}>
            <ListItemIcon>
              <LockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Change Password</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogoutClick}
            sx={{ color: theme.palette.error.main }}
          >
            <ListItemIcon sx={{ color: theme.palette.error.main }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>

        {/* Sidebar Drawer */}
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
              background: "#1a237e",
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

        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: isMobile ? 1 : 3,
            width: isMobile ? '100%' : `calc(100% - 240px)`,
            backgroundColor: '#f5f5f5',
            mt: -1
          }}
        >
          <Toolbar />
          
          {selectedContent === "dashboard" && (
            <>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
                color: '#1976d2', 
                fontWeight: 'bold', 
                mb: 3,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}>
                Welcome, {user.name}!
              </Typography>
              
              <Grid container spacing={isMobile ? 1 : 3}>
                {/* Profile Summary Card */}
                <Grid item xs={12} md={6} lg={3} width={550} height={260}>
                  <Card 
                    elevation={4}
                    sx={{ 
                      borderRadius: 3, 
                      height: '97%',
                      width: '100%',
                      mr: isMobile ? 0 : 5,
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
                          src={photoPreview || (user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png')}
                          alt="Profile Photo"
                          sx={{ width: isMobile ? 100 : 150, height: isMobile ? 100 : 150, mb: 2, border: '2px solid #eee' }}
                        />
                        <Box sx={{ ml: isMobile ? 0 : 3 }}>
                          <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: "bold" }}>
                            {user.name}
                          </Typography>
                          <Typography variant={isMobile ? "body2" : "body1"}>
                            {user.role} | {user.department}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant={isMobile ? "caption" : "body2"}>{user.email}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant={isMobile ? "caption" : "body2"}>{user.phone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <BadgeIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant={isMobile ? "caption" : "body2"}>ID: {user.sin_number}</Typography>
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

               {/* Recent Activity */}
<Grid item xs={12} md={6} lg={4} height={260}>
  <Card 
    elevation={4} 
    sx={{ 
      borderRadius: 3, 
      height: '100%',
      maxHeight: 260,
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
        backgroundColor: 'primary.main', // Blue background
        borderTopLeftRadius: '12px', // Match card borderRadius - 3 * 4 = 12
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
                      color={activity.status === 'approved' ? 'success' : 
                            activity.status === 'rejected' ? 'error' : 'warning'}
                      icon={activity.status === 'approved' ? <CheckCircleIcon fontSize="small" /> :
                            activity.status === 'rejected' ? <CancelIcon fontSize="small" /> : <PendingIcon fontSize="small" />}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
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

               {/* Personal Requests - Responsive Layout */}
<Grid item xs={12} md={8} height={260} width={540}>
  <Card elevation={4} sx={{ 
    borderRadius: 3,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 260,
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
        py: 1.5,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
      }}
      titleTypographyProps={{
        variant: 'subtitle1',
        fontWeight: 'bold'
      }}
      action={
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={fetchPersonalRequests}
            sx={{ color: 'white' }}
            disabled={loadingRequests}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    />
    <CardContent sx={{ flex: 1, p: 1, overflow: 'hidden' }}>
      {loadingRequests ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 200
        }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <Grid container spacing={1} sx={{ height: '100%' }}>
            {/* Leave Requests */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Leave Requests
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 1
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PendingIcon sx={{ color: '#FFA500', mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Pending</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.leave.pending} 
                      color="warning" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Approved</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.leave.approved} 
                      color="success" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CancelIcon sx={{ color: '#F44336', mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Rejected</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.leave.rejected} 
                      color="error" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.05)', 
                  p: 0.5, 
                  textAlign: 'center',
                  borderTop: '1px solid rgba(25, 118, 210, 0.1)'
                }}>
                  <Typography variant="caption" color="textSecondary">
                    {personalRequests.leave.pending === 0 ? 
                      "No pending leave requests" : 
                      `${personalRequests.leave.pending} pending approval`}
                  </Typography>
                </Box>
              </Card>
            </Grid>
            
            {/* OD Requests */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    OD Requests
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 1
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PendingIcon sx={{ color: '#FFA500', mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Pending</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.od.pending} 
                      color="warning" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Approved</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.od.approved} 
                      color="success" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CancelIcon sx={{ color: '#F44336', mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Rejected</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.od.rejected} 
                      color="error" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 152, 0, 0.05)', 
                  p: 0.5, 
                  textAlign: 'center',
                  borderTop: '1px solid rgba(255, 152, 0, 0.1)'
                }}>
                  <Typography variant="caption" color="textSecondary">
                    {personalRequests.od.pending === 0 ? 
                      "No pending OD requests" : 
                      `${personalRequests.od.pending} pending approval`}
                  </Typography>
                </Box>
              </Card>
            </Grid>
            
            {/* Permission Requests */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Permission Requests
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 1
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PendingIcon sx={{ color: '#FFA500', mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Pending</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.permission.pending} 
                      color="warning" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Approved</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.permission.approved} 
                      color="success" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CancelIcon sx={{ color: '#F44336', mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Rejected</Typography>
                    </Box>
                    <Chip 
                      label={personalRequests.permission.rejected} 
                      color="error" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.05)', 
                  p: 0.5, 
                  textAlign: 'center',
                  borderTop: '1px solid rgba(76, 175, 80, 0.1)'
                }}>
                  <Typography variant="caption" color="textSecondary">
                    {personalRequests.permission.pending === 0 ? 
                      "No pending permission requests" : 
                      `${personalRequests.permission.pending} pending approval`}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<ArrowForwardIcon />}
              onClick={() => setSelectedContent("status")}
              sx={{ 
                backgroundColor: theme.palette.primary.main,
                color: 'white',
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

                {/* Academic Calendar */}
                <Grid item xs={12} md={4} width={550}>
                  {renderHolidaysList()}
                </Grid>
              </Grid>
            </>
          )}

          {selectedContent === "attendance" && <PersonalAttendance />}
          {selectedContent === "application" && <LeaveApplicationForm />}
          {selectedContent === "status" && <LeaveApprovalStatus />}
          {selectedContent === "mentor" && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>Mentor Dashboard</Typography>
              <Typography>Mentor-specific content would go here</Typography>
            </Box>
          )}
          {selectedContent === "advisor" && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>Class Advisor Dashboard</Typography>
              <Typography>Class advisor-specific content would go here</Typography>
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
                src={photoPreview || (user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png')}
                alt="Profile Photo"
                sx={{ width: 150, height: 150, mb: 2, border: '2px solid #eee' }}
              />
              {editMode && (
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mt: 2 }}
                  startIcon={<PhotoCamera />}
                >
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </Button>
              )}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{user.name || 'User'}</Typography>
              <Typography variant="body1" color="textSecondary">{user.role} | {user.department}</Typography>
            </Box>
            <Box sx={{ flex: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                    label="Full Name"
                      name="name"
                      value={user.name}
                      margin="normal"
                    disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                    name="employee_id"
                    value={user?.sin_number}
                      margin="normal"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                    value={editMode ? editedData?.email : user?.email}
                    onChange={handleInputChange}
                      margin="normal"
                    disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                    value={editMode ? editedData?.phone : user?.phone}
                    onChange={handleInputChange}
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
                      margin="normal"
                    disabled
                    />
                  </Grid>
                <Grid item xs={12}>
                    <TextField
                      fullWidth
                    label="Address"
                    name="address"
                    value={editMode ? editedData?.address : user?.address}
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
        <form onSubmit={(e) => {
          e.preventDefault();
          handleChangePassword();
        }}>
        <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please enter your current password and new password.
            </DialogContentText>

          <TextField
              margin="dense"
              label="Current Password"
              type={showOldPassword ? "text" : "password"}
            fullWidth
              required
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
              required
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
            <Button type="submit" variant="contained">Change Password</Button>
        </DialogActions>
        </form>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>Confirm Logout</DialogTitle>
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

      {/* Notification Popover */}
      <Popover
        open={Boolean(notificationAnchorEl)}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
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
    </>
  );
};

export default Hod_PersonalDashboard;