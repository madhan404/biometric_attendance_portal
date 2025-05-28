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
  TextField,
  CardHeader,
  ListItemIcon,
  CardActionArea,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Menu,
  FormHelperText,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from "@mui/material";
import { 
  Person as PersonIcon, 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  BusinessCenter as InternshipIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Save as SaveIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, Cell } from "recharts";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import RequestTable from "../components/Placement/RequestTable";
import logo from '../assets/logo.png';
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { logout } = useAuth();
  const [selectedContent, setSelectedContent] = useState("dashboard");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  
  const [user, setUser] = useState({
    student_name: "",
    role: "",
    department: "",
    email: "",
    phone: "",
    sin_number: "",
    gender: "",
    year: "",
    address: "",
    photo: "",
    pendingRequests: 0,
    approvedInternships: 0,
    rejectedInternships: 0
  });
  
  const [formData, setFormData] = useState({ ...user });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [studentSummary, setStudentSummary] = useState({
    total_students: 0,
    department_wise: {}
  });
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [internshipCounts, setInternshipCounts] = useState({
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [trendData, setTrendData] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentListType, setCurrentListType] = useState('');
  const [currentList, setCurrentList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const departments = [
    'Computer Science',
    'Information Technology',
    'Mechanical',
    'Electrical',
    'Electronics',
    'Civil',
    'Biotechnology'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(prev => ({
        ...prev,
        ...parsedUser,
      }));
      setFormData(parsedUser);
    }
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoadingHolidays(true);
      const response = await axios.get(`${API_BASE_URL}/hodstaff/holidays`);
      if (response.data.status === "success") {
        setHolidays(response.data.holidays);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to fetch holidays",
        severity: "error"
      });
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchStudentSummary = async () => {
    try {
      setLoadingStudents(true);
      const response = await axios.post(`${API_BASE_URL}/placement/student-summary`, {
        college: user.college
      });

      if (response.data.status === "success") {
        setStudentSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching student summary:', error);
      setNotification({
        open: true,
        message: "Failed to fetch student summary",
        severity: "error"
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (user?.college) {
      fetchStudentSummary();
    }
  }, [user?.college]);

  const fetchRecentActivities = async () => {
    try {
      if (!user?.sin_number) return;

      const response = await axios.post(`${API_BASE_URL}/staffs-std-leavests`, {
        sin_number: user.sin_number
      });

      if (response.data && response.data.status === "success") {
        const activities = response.data.requests.map(request => ({
          id: request.request_id,
          message: `${request.student_name} (${request.department}) requested ${request.request_type} leave`,
          createdAt: request.dates.applied,
          status: request.status,
          type: request.request_type
        }));

        const recentActivities = activities
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentActivities(recentActivities);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setNotification({
        open: true,
        message: "Failed to fetch recent activities",
        severity: "error"
      });
    }
  };

  useEffect(() => {
    if (user?.sin_number) {
      fetchRecentActivities();
    }
  }, [user?.sin_number]);

  const fetchInternshipCounts = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/staffs-std-leavests`, {
        sin_number: user.sin_number
      });

      if (response.data && response.data.status === "success") {
        const internships = response.data.requests.filter(request => request.request_type === "internship");
        
        const counts = internships.reduce((acc, request) => {
          if (request.status === "Approved by Placement Officer") {
            acc.approved++;
          } else if (request.status === "Rejected") {
            acc.rejected++;
          } else {
            acc.pending++;
          }
          return acc;
        }, { approved: 0, pending: 0, rejected: 0 });

        setInternshipCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching internship counts:', error);
      setNotification({
        open: true,
        message: "Failed to fetch internship counts",
        severity: "error"
      });
    }
  };

  useEffect(() => {
    if (user?.sin_number) {
      fetchInternshipCounts();
    }
  }, [user?.sin_number]);

  const fetchTrendData = async () => {
    try {
      setLoadingTrend(true);
      const response = await axios.post(`${API_BASE_URL}/staffs-std-leavests`, {
        sin_number: user.sin_number
      });

      if (response.data && response.data.status === "success") {
        const internships = response.data.requests.filter(request => request.request_type === "internship");
        
        const monthlyData = internships.reduce((acc, request) => {
          const date = new Date(request.dates.applied);
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          
          if (!acc[monthYear]) {
            acc[monthYear] = {
              month: monthYear,
              approved: 0,
              pending: 0,
              rejected: 0
            };
          }
          
          if (request.status === "Approved by Placement Officer") {
            acc[monthYear].approved++;
          } else if (request.status === "Rejected") {
            acc[monthYear].rejected++;
          } else {
            acc[monthYear].pending++;
          }
          
          return acc;
        }, {});

        const sortedData = Object.values(monthlyData)
          .sort((a, b) => {
            const dateA = new Date(a.month);
            const dateB = new Date(b.month);
            return dateA - dateB;
          });

        setTrendData(sortedData);
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

  useEffect(() => {
    if (user?.sin_number) {
      fetchTrendData();
    }
  }, [user?.sin_number]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleOpenStudentList = (type) => {
    setCurrentListType(type);
    let students = [];
    
    switch (type) {
      case 'total':
        students = Object.values(studentSummary.department_wise).flatMap(dept => 
          Object.values(dept.year_wise).flatMap(year => year.students)
        );
        break;
      case 'present':
        students = Object.values(studentSummary.department_wise).flatMap(dept => 
          Object.values(dept.year_wise).flatMap(year => year.students)
        );
        break;
      case 'absent':
        students = [];
        break;
      case 'internship':
        students = [];
        break;
      default:
        students = [];
    }
    
    setCurrentList(students);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    setDepartmentDialogOpen(true);
  };

  const handleDepartmentDialogClose = () => {
    setDepartmentDialogOpen(false);
    setSelectedDepartment(null);
  };

  const handleExport = (type, department = null) => {
    let data = [];
    let fileName = '';
    
    if (department) {
      const deptData = studentSummary.department_wise[department];
      data = Object.values(deptData.year_wise).flatMap(year => year.students);
      fileName = `${department}_Students_List`;
    } else {
      data = Object.values(studentSummary.department_wise).flatMap(dept => 
        Object.values(dept.year_wise).flatMap(year => year.students)
      );
      fileName = 'All_Students_List';
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(fileData, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getDialogTitle = () => {
    switch (currentListType) {
      case 'total': return 'Total Students';
      case 'present': return 'Present Students';
      case 'absent': return 'Absent Students';
      case 'internship': return 'Internship Students';
      default: return 'Students List';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const dataToSend = editMode ? formData : formData;
      
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
        `${API_BASE_URL}/placement/update-profile/${user.sin_number}`,
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
          ...response.data.placement,
          photo: user.photo
        };
        setUser(updatedUser);
        setFormData(updatedUser);
        setEditMode(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        setNotification({
          open: true,
          message: "Profile updated successfully",
          severity: "success"
        });
        
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handlePasswordDialogClose = () => {
    setPasswordResetOpen(false);
    setOldPassword("");
    setNewPassword("");
    setPasswordError("");
  };

  const handleEditProfile = () => {
    setEditMode(true);
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

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileDialogOpen = () => {
    setProfileDialogOpen(true);
    setEditMode(false);
    setFormData(user);
    handleProfileMenuClose();
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
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

  const handleCancelEdit = () => {
    setFormData(user);
    setEditMode(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setPasswordError("Both fields are required");
      return;
    }
    
    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }
    
    try {
      const response = await axios.put(`${API_BASE_URL}/placement/change-password/${user.sin_number}`, {
        oldPassword,
        newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === "success") {
        setOldPassword("");
        setNewPassword("");
        setPasswordError("");
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

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) {
      const years = Math.floor(interval);
      return years === 1 ? "1 year ago" : `${years} years ago`;
    }
    
    interval = seconds / 2592000;
    if (interval > 1) {
      const months = Math.floor(interval);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    }
    
    interval = seconds / 86400;
    if (interval > 1) {
      const days = Math.floor(interval);
      return days === 1 ? "1 day ago" : `${days} days ago`;
    }
    
    interval = seconds / 3600;
    if (interval > 1) {
      const hours = Math.floor(interval);
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }
    
    interval = seconds / 60;
    if (interval > 1) {
      const minutes = Math.floor(interval);
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    }
    
    return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`;
  };

  const sidebarMenuItems = [
    { 
      icon: <DashboardIcon />, 
      text: "Dashboard", 
      onClick: () => {
        setSelectedContent("dashboard");
        if (isMobile) setMobileOpen(false);
      } 
    },
    { 
      icon: <InternshipIcon />, 
      text: "Internship Requests", 
      onClick: () => {
        setSelectedContent("requestTable");
        if (isMobile) setMobileOpen(false);
      } 
    }
  ];

  const internshipStatusData = [
    { name: 'Approved', value: internshipCounts.approved, color: '#4CAF50' },
    { name: 'Pending', value: internshipCounts.pending, color: '#FF9800' },
    { name: 'Rejected', value: internshipCounts.rejected, color: '#F44336' }
  ];

  const drawer = (
    <Box sx={{ 
      overflow: "auto", 
      height: "100%", 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#1a237e',
      width: isMobile ? 280 : 240
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <img 
          src={logo} 
          alt="College Logo" 
          style={{ 
            height: '60px',  
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List sx={{ flex: 1 }}>
        {sidebarMenuItems.map((item, index) => (
          <ListItem 
            key={index} 
            onClick={item.onClick}
            sx={{ 
              '&:hover': { 
                backgroundColor: 'rgba(246, 248, 249, 0.1)', 
                borderRadius: 2 
              },
              backgroundColor: selectedContent === item.text.toLowerCase().replace(' ', '') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              cursor: 'pointer'
            }}
          >
            <ListItemIcon sx={{ 
              color: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 'white' : 'rgba(255, 255, 255, 0.7)' 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 'bold' : 'medium',
                color: 'white'
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={handleLogoutClick}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'white'
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const fetchNotifications = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/staffs-std-leavests`, {
        sin_number: user.sin_number
      });

      if (response.data.status === "success") {
        const newNotifications = [];
        
        response.data.requests.forEach(request => {
          if (request.request_type.toLowerCase() === 'internship' && 
              request.approvals.placement_officer_approval === 'pending') {
            const studentName = request.student_name || 'Student';
            newNotifications.push({
              id: request.request_id,
              text: `New internship request from ${studentName}`,
              time: new Date(request.dates.applied || new Date()).toLocaleString(),
              unread: true,
              type: 'internship',
              requestId: request.request_id
            });
          }
        });

        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to fetch notifications",
        severity: "error"
      });
    }
  };

  useEffect(() => {
    if (user?.sin_number) {
      fetchNotifications();
    }
  }, [user?.sin_number]);

  const handleNotificationItemClick = (notification) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, unread: false } : n
      )
    );
    
    setSelectedContent("requestTable");
    setNotificationAnchorEl(null);
  };

  return (
    <Box sx={{ 
      display: "flex", 
      background: "#f5f5f5", 
      minHeight: "100vh",
      width: '100vw',
      overflowX: 'hidden'
    }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1, 
          background: "#1a237e",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          width: isMobile ? '100vw' : `calc(100vw - 240px)`,
          ml: isMobile ? 0 : '240px'
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
          <Typography variant="h6" noWrap component="div" sx={{ 
            flexGrow: 1, 
            fontWeight: "bold", 
            textAlign: isMobile ? 'left' : 'center',
            color: 'white',
            fontSize: isSmallScreen ? '1rem' : '1.25rem'
          }}>
            Placement Officer Dashboard
          </Typography>
          
          <IconButton 
            color="inherit" 
            onClick={handleNotificationClick}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={notifications.filter(n => n.unread).length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            color="inherit" 
            onClick={handleProfileMenuOpen}
          >
            <PersonIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
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
            width: isSmallScreen ? '100%' : '350px',
            overflow: 'hidden'
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Notifications</Typography>
          <Divider />
          <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
            <List>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <ListItem 
                    key={notification.id}
                    onClick={() => handleNotificationItemClick(notification)}
                    sx={{
                      py: 1,
                      px: 2,
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.05)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <NotificationsIcon 
                        color={notification.unread ? "primary" : "disabled"} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body2"
                          fontWeight={notification.unread ? 600 : 400}
                        >
                          {notification.text}
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          {notification.time}
                        </Typography>
                      }
                    />
                    {notification.unread && (
                      <Box 
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          ml: 1
                        }}
                      />
                    )}
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No new notifications" />
                </ListItem>
              )}
            </List>
          </Box>
        </Box>
      </Menu>

      {/* Profile Menu */}
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
        <MenuItem onClick={() => { setPasswordResetOpen(true); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Password</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: "border-box",
            background: "#1976d2",
            borderRight: "none",
            boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
            width: isMobile ? 280 : 240
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
          p: isMobile ? 2 : 3,
          width: '100%',
          backgroundColor: '#f5f5f5',
          marginLeft: isMobile ? 0 : '240px',
          marginTop: '64px',
          mt: 5,
          overflowX: 'hidden'
        }}
      >
        {selectedContent === "dashboard" && (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2
            }}>
              <Typography variant="h4" sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 'bold', 
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                fontSize: isSmallScreen ? '1.5rem' : '2rem'
              }}>
                Welcome, {user.name}!
              </Typography>
            </Box>
            
            {/* Top Cards Section */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Profile Card */}
              <Grid item xs={12} md={4} width={550} height={275} lg={3}>
                <Card 
                  elevation={4}
                  sx={{ 
                    borderRadius: 3, 
                    height: '100%',
                    width: '100%',
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
                        alt={user?.name || 'User'}
                        sx={{ 
                          width: isSmallScreen ? 100 : 150, 
                          height: isSmallScreen ? 100 : 150,
                          border: '2px solid white'
                        }}
                      />
                      <Box sx={{ ml: isMobile ? 0 : 3, mt: isMobile ? 2 : 0 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                          {user.name || 'User'}
                        </Typography>
                        <Typography variant={isMobile ? "body2" : "body1"}>
                          {user?.role} | {user?.department}
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
                          <BadgeIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant={isMobile ? "caption" : "body2"}>Employee ID: {user?.sin_number}</Typography>
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

              {/* Internship Stats Card */}
              <Grid item xs={12} md={4} width={300} height={275} lg={3}>
                <Card elevation={3} sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <CardHeader 
                    title="Internship Summary" 
                    avatar={<WorkIcon sx={{ color: 'white' }} />}
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
                    action={
                      <Tooltip title="Refresh">
                        <IconButton
                          onClick={fetchInternshipCounts}
                          sx={{ color: 'white' }}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    p: 1.5,
                    gap: 1
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      borderRadius: 2,
                      height: '30%'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                        <Typography variant="body2">Approved Internships:</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{internshipCounts.approved}</Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      backgroundColor: 'rgba(255, 165, 0, 0.1)',
                      borderRadius: 2,
                      height: '30%'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PendingIcon sx={{ color: '#FFA500', mr: 1 }} />
                        <Typography variant="body2">Pending Requests:</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{internshipCounts.pending}</Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      borderRadius: 2,
                      height: '30%'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CancelIcon sx={{ color: '#F44336', mr: 1 }} />
                        <Typography variant="body2">Rejected Requests:</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{internshipCounts.rejected}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Holiday Card */}
              <Grid item xs={12} md={6} width={280} height={275} >
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
                    title={`Holidays ${new Date().getFullYear()}`}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      textAlign: 'center',
                      py: 1,
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
                          onClick={fetchHolidays}
                          sx={{ color: 'white' }}
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent sx={{ 
                    flex: 1, 
                    p: 0,
                    maxHeight: { xs: 250, sm: 300 },
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {loadingHolidays ? (
                      <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : !holidays || holidays.length === 0 ? (
                      <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                        <Typography variant="body2" color="textSecondary">
                          No holidays found for this year
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{
                        flex: 1,
                        overflow: 'auto',
                        py: 0,
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
                        {holidays.map((holiday) => (
                          <ListItem
                            key={holiday.id}
                            sx={{
                              py: 1,
                              px: 2,
                              borderBottom: '1px solid rgba(0,0,0,0.08)',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.05)'
                              }
                            }}
                            dense
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Avatar sx={{
                                bgcolor: theme.palette.primary.light,
                                width: 28,
                                height: 28
                              }}>
                                <CalendarIcon fontSize="small" sx={{ color: 'white' }} />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight={500}>
                                  {holiday.holiday_reason}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(holiday.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </Typography>
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

              {/* Recent Activities Card */}
              <Grid item xs={12} md={6} width={395} height={275} >
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
                    title="Recent Activities"
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      textAlign: 'center',
                      py: 1,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12
                    }}
                    titleTypographyProps={{
                      variant: 'subtitle1',
                      fontWeight: 'bold',
                      component: 'div'
                    }}
                    action={
                      <Tooltip title="Refresh Activities">
                        <IconButton
                          onClick={fetchRecentActivities}
                          sx={{ color: 'white' }}
                          size="small"
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent sx={{ 
                    flex: 1, 
                    p: 0,
                    maxHeight: { xs: 250, md: 300 },
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {recentActivities.length > 0 ? (
                      <List sx={{
                        flex: 1,
                        overflow: 'auto',
                        py: 0,
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
                        {recentActivities.map((activity) => (
                          <ListItem
                            key={activity.id}
                            dense
                            sx={{
                              py: 1,
                              px: 1.5,
                              borderBottom: '1px solid rgba(0,0,0,0.08)',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.05)'
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Avatar sx={{
                                bgcolor: activity.status === 'Approved by Principal' ? '#4CAF50' : 
                                        activity.status === 'Rejected' ? '#F44336' : 
                                        theme.palette.primary.light,
                                width: 28,
                                height: 28
                              }}>
                                <NotificationsIcon fontSize="small" sx={{ color: 'white' }} />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                                  {activity.message}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                                    {getTimeAgo(new Date(activity.createdAt))}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                                    {new Date(activity.createdAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: activity.status === 'Approved by Principal' ? '#4CAF50' : 
                                            activity.status === 'Rejected' ? '#F44336' : 
                                            theme.palette.primary.main,
                                      fontWeight: 500,
                                      display: 'block',
                                      mt: 0.5
                                    }}
                                  >
                                    {activity.status}
                                  </Typography>
                                </Box>
                              }
                              sx={{ my: 0 }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box display="flex" justifyContent="center" alignItems="center" flex={1} minHeight={150}>
                        <Typography variant="body2" color="textSecondary">
                          No recent activities
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              {/* Performance Trend Chart */}
              <Grid item xs={12} md={6} width={790} >
                <Card elevation={4} sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  width: '100%',
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
                    title="Internship Request Trends" 
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
                          onClick={fetchTrendData}
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
                    ) : trendData.length === 0 ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                        <Typography variant="body2" color="textSecondary">
                          No trend data available
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trendData}
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
                            <RechartsTooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="approved" 
                              stroke="#4CAF50" 
                              activeDot={{ r: 8 }} 
                              name="Approved"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="pending" 
                              stroke="#FF9800" 
                              name="Pending"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="rejected" 
                              stroke="#F44336" 
                              name="Rejected"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Internship Status Chart */}
              <Grid item xs={12} md={6} width={790} >
                <Card elevation={4} sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  width: '100%',
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
                    title="Internship Status" 
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
                          onClick={fetchInternshipCounts}
                          sx={{ color: 'white' }}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent sx={{ flex: 1, p: 2 }}>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={internshipStatusData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip 
                            formatter={(value) => [`${value} requests`, 'Count']}
                          />
                          <Legend />
                          <Bar dataKey="value" name="Count">
                            {internshipStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Student Summary Section */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12}>
                <Card elevation={4} sx={{
                  borderRadius: 3,
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
                    title="Student Summary"
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      textAlign: 'center',
                      py: 1.5,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12
                    }}
                    titleTypographyProps={{
                      variant: 'h6',
                      fontWeight: 'bold',
                      component: 'div'
                    }}
                    action={
                      <Tooltip title="Refresh">
                        <IconButton
                          onClick={fetchStudentSummary}
                          sx={{ color: 'white' }}
                          disabled={loadingStudents}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent>
                    {loadingStudents ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <>
                        {/* Total Students Card */}
                        <Card 
                          elevation={2}
                          sx={{
                            mb: 3,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.05)'
                            }
                          }}
                          onClick={() => handleOpenStudentList('total')}
                        >
                          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <GroupIcon sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 40 }} />
                              <Box>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                  Total Students
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                  {studentSummary.total_students}
                                </Typography>
                              </Box>
                            </Box>
                            <Tooltip title="Export to Excel">
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport('total');
                                }}
                                color="primary"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </CardContent>
                        </Card>

                        {/* Department Cards Grid */}
                        <Grid container spacing={3}>
                          {Object.entries(studentSummary.department_wise).map(([dept, data]) => (
                            <Grid item xs={12} sm={6} md={4} key={dept}>
                              <Card 
                                elevation={2}
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.05)'
                                  }
                                }}
                                onClick={() => handleDepartmentClick(dept)}
                              >
                                <CardContent>
                                  <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                                    {dept}
                                  </Typography>
                                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    {data.total} Students
                                  </Typography>
                                  <Grid container spacing={1}>
                                    {Object.entries(data.year_wise).map(([year, yearData]) => (
                                      <Grid item xs={3} key={year}>
                                        <Box sx={{ textAlign: 'center' }}>
                                          <Typography variant="caption" color="text.secondary">
                                            Year {year}
                                          </Typography>
                                          <Typography variant="body1" fontWeight="bold">
                                            {yearData.count}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
        
        {selectedContent === "requestTable" && <RequestTable />}
      </Box>

      {/* Profile Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={handleProfileDialogClose} 
        fullWidth 
        maxWidth="md"
        fullScreen={isSmallScreen}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Profile Information</Typography>
          <Box>
            {!editMode ? (
              <>
                <Button 
                  onClick={handleProfileDialogClose}
                  color="inherit"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, color: 'white', borderColor: 'white' }}
                >
                  Close
                </Button>
                <Button 
                  onClick={handleEditProfile}
                  startIcon={<EditIcon />}
                  color="inherit"
                  variant="outlined"
                  size="small"
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleCancelEdit}
                  color="inherit"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, color: 'white', borderColor: 'white' }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  color="inherit"
                  variant="contained"
                  size="small"
                  sx={{ mr: 1, backgroundColor: 'white', color: theme.palette.primary.main }}
                >
                  Save
                </Button>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: "flex", 
            flexDirection: isSmallScreen ? "column" : "row", 
            gap: 3, 
            mt: 2 
          }}>
            <Box sx={{ 
              flex: 1, 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center" 
            }}>
              <Avatar
                src={photoPreview || (user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png')}
                alt={user?.name || 'User'}
                sx={{ 
                  width: isSmallScreen ? 100 : 150, 
                  height: isSmallScreen ? 100 : 150,
                  border: '2px solid white'
                }}
              />
              {editMode && (
                <Button 
                  variant="contained" 
                  component="label" 
                  sx={{ 
                    mt: 2,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark
                    }
                  }}
                >
                  Upload Photo
                  <input type="file" hidden onChange={handlePhotoChange} />
                </Button>
              )}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>{user.name || 'Student'}</Typography>
              <Typography variant="body1" color="textSecondary">{user.role} | {user.department}</Typography>
            </Box>
            <Box sx={{ flex: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="student_name"
                    value={formData.name}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ID Number"
                    name="sin_number"
                    value={formData.sin_number || user.sin_number}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
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
                    value={formData.department}
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
                    value={formData.address}
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

      {/* Student List Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="lg"
        scroll="paper"
        fullScreen={isSmallScreen}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}>
          <Typography variant="h6" fontWeight="bold">
            {getDialogTitle()}
          </Typography>
          <Box>
            <Tooltip title="Export to Excel">
              <IconButton
                onClick={() => handleExport(currentListType)}
                sx={{ color: 'white', mr: 1 }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                  <TableCell>Name</TableCell>
                  <TableCell>SIN Number</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentList.map((student) => (
                  <TableRow 
                    key={student.sin_number}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.05)' }
                    }}
                  >
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.sin_number}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* Department Students Dialog */}
      <Dialog
        open={departmentDialogOpen}
        onClose={handleDepartmentDialogClose}
        fullWidth
        maxWidth="lg"
        scroll="paper"
        fullScreen={isSmallScreen}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}>
          <Typography variant="h6" fontWeight="bold">
            {selectedDepartment} - Student Details
          </Typography>
          <Box>
            <Tooltip title="Export to Excel">
              <IconButton
                onClick={() => handleExport('department', selectedDepartment)}
                sx={{ color: 'white', mr: 1 }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleDepartmentDialogClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDepartment && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                    <TableCell>Name</TableCell>
                    <TableCell>SIN Number</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(studentSummary.department_wise[selectedDepartment].year_wise)
                    .flatMap(year => year.students)
                    .map((student, index) => (
                      <TableRow 
                        key={student.sin_number}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                          '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.05)' }
                        }}
                      >
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.sin_number}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
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

      {/* Snackbar */}
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
    </Box>
  );
};

export default Dashboard;