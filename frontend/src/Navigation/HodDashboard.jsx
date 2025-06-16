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
  TextField,
  CardHeader,
  ListItemIcon,
  CardActionArea,
  Menu,
  MenuItem,
  FormHelperText,
  Snackbar,
  InputAdornment,
  Alert, Tooltip,
  CircularProgress
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  EventNote as EventNoteIcon,
  RequestQuote as RequestQuoteIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  Badge as BadgeIcon,
  VisibilityOff as VisibilityOffIcon,
  Logout as LogoutIcon,
  HourglassEmpty as PendingIcon,
  PhotoCamera,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import logo from '../assets/logo.png';
import axios from "axios";
import RequestTable from "../components/Hod/RequestTable";
import StaffRequestTable from "../components/Hod/StaffRequestTable";
import StudentAttendance from "../components/Hod/StudentAttendance";
import StaffAttendance from "../components/Hod/StaffAttendance";
import { format } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { logout } = useAuth();
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState("dashboard");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [editedData, setEditedData] = useState({
    email: '',
    phone: '',
    address: '',
    name: '',
    department: '',
    sin_number: ''
  });
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Academic Calendar states
  const [academicCalendar, setAcademicCalendar] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Request data
  const [studentRequests, setStudentRequests] = useState({
    leave: { pending: 0, approved: 0, rejected: 0 },
    od: { pending: 0, approved: 0, rejected: 0 },
    internship: { pending: 0, approved: 0, rejected: 0 }
  });
  const [staffRequests, setStaffRequests] = useState({
    leave: { pending: 0, approved: 0, rejected: 0 },
    od: { pending: 0, approved: 0, rejected: 0 },
    permission: { pending: 0, approved: 0, rejected: 0 }
  });
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingStaffRequests, setLoadingStaffRequests] = useState(false);

  // Student Attendance states
  const [studentAttendanceData, setStudentAttendanceData] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  // Staff Attendance states for Dashboard Summary
  const [staffAttendanceDashboardData, setStaffAttendanceDashboardData] = useState(null);
  const [loadingStaffDashboardAttendance, setLoadingStaffDashboardAttendance] = useState(false);
  const [staffDashboardAttendanceError, setStaffDashboardAttendanceError] = useState(null);

  // Helper function for color conversion
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  // Function to fetch academic calendar
  const fetchAcademicCalendar = async () => {
    setLoadingCalendar(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/hod/holidays`);
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

  useEffect(() => {
    const fetchYesterdayStudentAttendance = async () => {
      if (!user?.department) return;
      
      setLoadingAttendance(true);
      setAttendanceError(null);
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedDate = format(yesterday, 'yyyy-MM-dd');
        
        const response = await fetch(
          `${API_BASE_URL}/hod/department-daily-attendance?date=${formattedDate}&department=${encodeURIComponent(user.department)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch student attendance data');
        }

        const result = await response.json();
        if (result.success) {
          setStudentAttendanceData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch student attendance data');
        }
      } catch (err) {
        console.error('Error fetching student attendance:', err);
        setAttendanceError(err.message);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchYesterdayStudentAttendance();
  }, [user?.department]);

  useEffect(() => {
    const fetchYesterdayStaffDashboardAttendance = async () => {
      if (!user?.department) return;
      
      setLoadingStaffDashboardAttendance(true);
      setStaffDashboardAttendanceError(null);
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedDate = format(yesterday, 'yyyy-MM-dd');
        
        const response = await fetch(
          `${API_BASE_URL}/hod/staff-daily-attendance?date=${formattedDate}&department=${encodeURIComponent(user.department)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch staff attendance data for dashboard');
        }

        const result = await response.json();
        if (result.success) {
          setStaffAttendanceDashboardData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch staff attendance data for dashboard');
        }
      } catch (err) {
        console.error('Error fetching staff dashboard attendance:', err);
        setStaffDashboardAttendanceError(err.message);
      } finally {
        setLoadingStaffDashboardAttendance(false);
      }
    };

    fetchYesterdayStaffDashboardAttendance();
  }, [user?.department]);

  const handleEditClick = () => {
    if (!user) {
      setError("User data not available");
      return;
    }
    setEditedData({
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || ""
    });
    setEditMode(true);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleEditProfile = () => {
    setEditedData({
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      name: user?.name || '',
      department: user?.department || '',
      sin_number: user?.sin_number || ''
    });
    setEditMode(true);
  };

  const handlePasswordDialogClose = () => {
    setPasswordResetOpen(false);
    setOldPassword("");
    setNewPassword("");
    setPasswordError("");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileDialogOpen = () => {
    setProfileDialogOpen(true);
    setEditMode(false);
    setAnchorEl(null);
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handleToggleAttendance = () => {
    setAttendanceOpen((prev) => !prev);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    setAnchorEl(null);
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
    if (isMobile) setMobileOpen(false);
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

  const handleCancelEdit = () => {
    setEditedData({
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      name: user?.name || '',
      department: user?.department || '',
      sin_number: user?.sin_number || ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditMode(false);
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
        `${API_BASE_URL}/hod/update-profile/${user.sin_number}`,
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
      setError("User data not available");
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/hod/change-password/${user.sin_number}`,
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

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const fetchStudentRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/staffs-std-leavests`, {
        sin_number: user?.sin_number
      });

      if (response.data.status === "success") {
        const counts = {
          leave: { pending: 0, approved: 0, rejected: 0 },
          od: { pending: 0, approved: 0, rejected: 0 },
          internship: { pending: 0, approved: 0, rejected: 0 }
        };

        const newNotifications = [];

        response.data.requests.forEach(request => {
          const type = request.request_type.toLowerCase();
          if (counts[type]) {
            if (request.approvals.hod_approval === 'pending' && 
                request.approvals.mentor_approval === 'approved' && 
                request.approvals.class_advisor_approval === 'approved') {
              counts[type].pending++;
              newNotifications.push({
                id: request.request_id,
                text: `New ${type} request from ${request.student_name}`,
                time: new Date(request.dates.applied).toLocaleString(),
                unread: true,
                type: type,
                requestId: request.request_id
              });
            } else if (request.status.includes('Approved')) {
              counts[type].approved++;
            } else if (request.status === 'Rejected') {
              counts[type].rejected++;
            }
          }
        });

        setStudentRequests(counts);
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    } catch (error) {
      console.error('Error fetching student requests:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to fetch student requests",
        severity: "error"
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchStaffRequests = async () => {
    setLoadingStaffRequests(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/hod-staff-leavests`, {
        sin_number: user?.sin_number
      });

      if (response.data.status === "success") {
        const counts = {
          leave: { pending: 0, approved: 0, rejected: 0 },
          od: { pending: 0, approved: 0, rejected: 0 },
          permission: { pending: 0, approved: 0, rejected: 0 }
        };

        const newNotifications = [];

        if (response.data.requests && Array.isArray(response.data.requests)) {
          response.data.requests.forEach(request => {
            const type = request.request_type?.toLowerCase() || 'leave';
            if (counts[type]) {
              if (request.approvals.hod_approval === 'pending') {
                counts[type].pending++;
                const staffName = request.class_advisor_name || 
                                request.staff_name || 
                                request.name || 
                                request.staff?.name || 
                                'Staff';
                
                newNotifications.push({
                  id: request.request_id,
                  text: `New ${type} request from ${staffName}`,
                  time: new Date(request.dates.applied).toLocaleString(),
                  unread: true,
                  type: type,
                  requestId: request.request_id
                });
              } else if (request.status.includes('Approved')) {
                counts[type].approved++;
              } else if (request.status === 'Rejected') {
                counts[type].rejected++;
              }
            }
          });
        }

        setStaffRequests(counts);
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    } catch (error) {
      console.error('Error fetching staff requests:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to fetch staff requests",
        severity: "error"
      });
    } finally {
      setLoadingStaffRequests(false);
    }
  };

  useEffect(() => {
    if (user?.sin_number) {
      fetchStudentRequests();
      fetchStaffRequests();
    }
  }, [user]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const completeUserData = {
        ...userData,
        address: userData.address || "123 College Street, Department of Computer Science",
        gender: userData.gender || "Female",
        photo: userData.photo || "",
        email: userData.email || "",
        phone: userData.phone || "",
        name: userData.name || "",
        department: userData.department || "",
        sin_number: userData.sin_number || ""
      };
      setUser(completeUserData);
      setFormData(completeUserData);
      setEditedData(completeUserData);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editMode) {
      setEditedData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Helper: Map keys to display names
  const staffRequestLabels = {
    leave: 'Leave',
    od: 'On Duty',
    permission: 'Permission'
  };
  const studentRequestLabels = {
    leave: 'Leave',
    od: 'On Duty',
    internship: 'Internship'
  };

  const renderPendingRequestsCard = (title, data, colors, labelsMap) => (
    <Card elevation={3} sx={{
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
        {data && Object.entries(data).map(([key, value], index) => (
          <Box
            key={key}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              backgroundColor: `rgba(${hexToRgb(colors[index % colors.length])}, 0.1)`,
              borderRadius: 2,
              height: '100%',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: `rgba(${hexToRgb(colors[index % colors.length])}, 0.2)`
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PendingIcon sx={{ color: colors[index % colors.length], mr: 1 }} />
              <Typography variant="body2">
                {labelsMap[key] || key}:
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{value?.pending || 0}</Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  const renderHolidaysList = () => {
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

  const StudentAttendanceSummary = () => {
    if (loadingAttendance) {
      return (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      );
    }

    if (attendanceError) {
      return (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Alert severity="error">{attendanceError}</Alert>
          </CardContent>
        </Card>
      );
    }

    if (!studentAttendanceData) {
      return (
        <Card elevation={4} sx={{
          borderRadius: 3,
          height: '100%',
          width: '100%',
          mr: 2,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
          }
        }}>
          <CardHeader
            title="Student Attendance Summary"
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
          <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No attendance data available for this date
            </Typography>
          </CardContent>
        </Card>
      );
    }

    const { attendanceStats } = studentAttendanceData;

    const chartData = [
      { name: 'Present', value: attendanceStats?.present || 0 },
      { name: 'Absent', value: attendanceStats?.absent || 0 },
      { name: 'Late', value: attendanceStats?.late || 0 },
      { name: 'OD', value: attendanceStats?.od || 0 },
      { name: 'Internship', value: attendanceStats?.internship || 0 }
    ];

    return (
      <Card elevation={4} sx={{
        borderRadius: 3,
        height: '100%',
        width: '100%',
        mr: 2,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }
      }}>
        <CardHeader
          title="Student Attendance Summary"
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
        <CardContent sx={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false}/>
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const StaffAttendanceSummary = () => {
    if (loadingStaffDashboardAttendance) {
      return (
        <Card sx={{ mb: 3, borderRadius: 3, height: '100%' }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </CardContent>
        </Card>
      );
    }

    if (staffDashboardAttendanceError) {
      return (
        <Card sx={{ mb: 3, borderRadius: 3, height: '100%' }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Alert severity="error">{staffDashboardAttendanceError}</Alert>
          </CardContent>
        </Card>
      );
    }

    if (!staffAttendanceDashboardData) {
      return (
        <Card elevation={4} sx={{
          borderRadius: 3,
          height: '100%',
          width: '100%',
          mr: 2,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
          }
        }}>
          <CardHeader
            title="Staff Attendance Summary"
            sx={{
              backgroundColor: theme.palette.secondary.main,
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
          <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No attendance data available for this date
            </Typography>
          </CardContent>
        </Card>
      );
    }

    const { attendanceStats } = staffAttendanceDashboardData;

    const chartData = [
      { name: 'Present', value: attendanceStats?.present || 0 },
      { name: 'Absent', value: attendanceStats?.absent || 0 },
      { name: 'Permission', value: attendanceStats?.permission || 0 },
      { name: 'OD', value: attendanceStats?.od || 0 }
    ];

    return (
      <Card elevation={4} sx={{
        borderRadius: 3,
        height: '100%',
        width: '100%',
        mr: 2,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }
      }}>
        <CardHeader
          title="Staff Attendance Summary"
          sx={{
            backgroundColor: theme.palette.secondary.main,
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
        <CardContent sx={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="value" fill={theme.palette.secondary.light} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Sidebar menu configuration
  const sidebarMenuItems = [
    {
      icon: <DashboardIcon />,
      text: "Dashboard",
      onClick: () => handleMenuItemClick("dashboard")
    },
    {
      icon: <EventNoteIcon />,
      text: "Student Attendance",
      onClick: () => handleMenuItemClick("studentAttendance")
    },
    {
      icon: <EventNoteIcon />,
      text: "Staff Attendance",
      onClick: () => handleMenuItemClick("staffAttendance")
    },
    {
      icon: <RequestQuoteIcon />,
      text: "Student Request",
      onClick: () => handleMenuItemClick("requestTable")
    },
    {
      icon: <RequestQuoteIcon />,
      text: "Staff Request",
      onClick: () => handleMenuItemClick("StaffRequestTable")
    },
  ];

  // Add function to handle notification click
  const handleNotificationClick = (notification) => {
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
    );

    // Navigate to appropriate request table
    if (notification.type === 'internship' || notification.type === 'leave' || notification.type === 'od') {
      handleMenuItemClick('requestTable');
    } else {
      handleMenuItemClick('StaffRequestTable');
    }
  };

  // Update the notification menu to use the new click handler
  const renderNotificationMenu = () => (
    <Menu
      anchorEl={notificationAnchorEl}
      open={Boolean(notificationAnchorEl)}
      onClose={handleNotificationMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          width: isSmallScreen ? '90vw' : 350,
          maxHeight: 400,
          overflow: 'auto',
          mt: 1,
          '& .MuiMenu-list': {
            padding: 0
          }
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
      </Box>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            sx={{
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              backgroundColor: notification.unread ? 'rgba(25, 118, 210, 0.05)' : 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            <ListItemText
              primary={notification.text}
              secondary={notification.time}
              primaryTypographyProps={{
                fontWeight: notification.unread ? 600 : 400
              }}
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
          </MenuItem>
        ))
      ) : (
        <MenuItem>
          <ListItemText primary="No new notifications" />
        </MenuItem>
      )}
    </Menu>
  );

  const drawer = (
    <Box sx={{
      overflow: "auto",
      height: "100%",
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1a237e',
      color: 'white',
      px: 2,
    }}>
      <Toolbar />
      <List sx={{ flex: 1 }}>
        {sidebarMenuItems.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={item.onClick}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2
              },
              backgroundColor: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 'rgba(255, 255, 255, 0.2)' : 'inherit'
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{ ml: 1, fontWeight: 'medium' }}
              primaryTypographyProps={{
                color: 'white',
                fontWeight: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 'bold' : 'normal'
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
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

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading User Data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: '#FFFFF' }}>
     <AppBar
  position="fixed"
  sx={{
    zIndex: theme.zIndex.drawer + 1,
    background: "#1a237e",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    py: isSmallScreen ? 0.5 : 1 // Adjust padding based on screen size
  }}
>
  <Toolbar sx={{
    px: isSmallScreen ? 1 : 2, // Adjust horizontal padding
    minHeight: isSmallScreen ? '56px' : '64px' // Adjust toolbar height
  }}>
    {/* Mobile Menu Button */}
    {isMobile && (
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ 
          mr: 2,
          display: { xs: 'flex', md: 'none' } // Only show on mobile
        }}
      >
        <MenuIcon fontSize={isSmallScreen ? 'medium' : 'large'} />
      </IconButton>
    )}

    {/* Logo */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mr: { xs: 1, sm: 2 }, // Responsive margin
      flexShrink: 0 // Prevent logo from shrinking
    }}>
      <img
        src={logo}
        alt="College Logo"
        style={{
          height: isSmallScreen ? '36px' : isMobile ? '48px' : '60px',
          width: 'auto',
          maxHeight: '60px',
          objectFit: 'contain'
        }}
      />
    </Box>

    {/* Title */}
    <Typography
      variant="h4"
      noWrap // Prevent text wrapping
      sx={{
        flexGrow: 1,
        fontWeight: "bold",
        letterSpacing: 1,
        color: 'white',
        textAlign: 'center',
        fontSize: {
          xs: '1.1rem',   // Extra small screens
          sm: '1.3rem',   // Small screens
          md: '1.5rem',   // Medium screens
          lg: '1.75rem',  // Large screens
          xl: '2rem'      // Extra large screens
        },
        ml: { xs: 1, sm: 2 }, // Responsive margin
        lineHeight: 1.2 // Better text alignment
      }}
    >
      HOD Dashboard
    </Typography>

    {/* Notification Icon */}
    <IconButton
      color="inherit"
      onClick={handleNotificationMenuOpen}
      sx={{ 
        mr: { xs: 0.5, sm: 1 }, // Responsive margin
        p: { xs: 0.5, sm: 1 }   // Responsive padding
      }}
    >
      <Badge 
        badgeContent={notifications.filter(n => n.unread).length} 
        color="error"
        max={99} // Limit badge number display
      >
        <NotificationsIcon fontSize={isSmallScreen ? 'small' : 'medium'} />
      </Badge>
    </IconButton>

    {/* Profile Avatar */}
    <IconButton 
      onClick={handleProfileMenuOpen} 
      color="inherit"
      sx={{ 
        p: { xs: 0.5, sm: 1 }, // Responsive padding
        ml: { xs: 0.5, sm: 1 } // Responsive margin
      }}
    >
      <Avatar
        src={photoPreview || (user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png')}
        alt={user?.name || 'User'}
        sx={{ 
          width: {
            xs: 32,  // Extra small
            sm: 36,  // Small
            md: 40   // Medium and up
          },
          height: {
            xs: 32,
            sm: 36,
            md: 40
          }
        }}
      />
    </IconButton>
  </Toolbar>
</AppBar>

      {/* Notification Menu */}
      {renderNotificationMenu()}

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
          width: isMobile ? '80vw' : 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? '80vw' : 280,
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

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isSmallScreen ? 1 : isMobile ? 2 : 3,
          width: isMobile ? '100%' : `calc(100% - ${isMobile ? 0 : 280}px)`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />

        {selectedContent === "dashboard" && (
          <>
            <Typography variant="h4" sx={{
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              mb: 3,
              mt: -1,
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: isSmallScreen ? '1.5rem' : '2rem'
            }}>
              Welcome, {user.name || 'HOD'}!
            </Typography>

            <Grid container spacing={isSmallScreen ? 1 : 3}>
              {/* Profile Card */}
              <Grid item xs={12} md={6} height={275} lg={3}>
                <Card
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    height: '100%',
                    width: '100%',
                    mr: 14,
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
                      flexDirection: isSmallScreen ? 'column' : 'row',
                      textAlign: isSmallScreen ? 'center' : 'left'
                    }}>
                      <Avatar
                        src={photoPreview || (user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/default-avatar.png')}
                        alt="Profile Photo"
                        sx={{
                          width: isSmallScreen ? 80 : 100,
                          height: isSmallScreen ? 80 : 100,
                          mb: isSmallScreen ? 2 : 0,
                          border: '3px solid white'
                        }}
                      />
                      <Box sx={{ ml: isSmallScreen ? 0 : 3 }}>
                        <Typography variant={isSmallScreen ? "subtitle1" : "h6"} sx={{ fontWeight: "bold" }}>
                          {user?.name || 'HOD'}
                        </Typography>
                        <Typography variant={isSmallScreen ? "body2" : "body1"}>
                          {user?.role || 'Head of Department'} | {user?.department || 'Computer Science'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant={isSmallScreen ? "caption" : "body2"}>{user?.email || 'hod@college.edu'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant={isSmallScreen ? "caption" : "body2"}>{user?.phone || '+91 9876543210'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <BadgeIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant={isSmallScreen ? "caption" : "body2"}>Employee ID: {user?.sin_number || 'HOD123'}</Typography>
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

              {/* Student Pending Requests Card */}
              <Grid item xs={12} sm={6} md={6} height={275} width={250} lg={3}>
                {loadingRequests ? (
                  <Card elevation={3} sx={{
                    borderRadius: 3,
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3
                  }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Loading requests...
                    </Typography>
                  </Card>
                ) : (
                  renderPendingRequestsCard(
                    "Student Pending Requests",
                    studentRequests,
                    ["#2196F3", "#4CAF50", "#9C27B0"],
                    studentRequestLabels
                  )
                )}
              </Grid>

              {/* Staff Pending Requests Card */}
              <Grid item xs={12} sm={6} md={6} height={275} width={240} lg={3}>
                {loadingStaffRequests ? (
                  <Card elevation={3} sx={{
                    borderRadius: 3,
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3
                  }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Loading staff requests...
                    </Typography>
                  </Card>
                ) : (
                  renderPendingRequestsCard(
                    "Staff Pending Requests",
                    staffRequests,
                    ["#FF9800", "#673AB7", "#F44336"],
                    staffRequestLabels
                  )
                )}
              </Grid>

           {/* Holidays Card */}
<Grid item xs={12} sm={6} md={4} lg={3} sx={{ 
  height: 275,
  minHeight: 275,
  maxWidth: 350,
  width: '100%',
  overflow: 'hidden',
  '& .MuiCard-root': {
    height: '100%',
    display: 'flex',
    
  },
  '& .MuiCardContent-root': {
    flex: 1,
    overflow: 'auto',
    p: 0
  }
}}>
  {renderHolidaysList()}
</Grid>

              {/* Student Attendance Summary Chart */}
              <Grid item xs={12} md={6}>
                <StudentAttendanceSummary />
              </Grid>

              {/* Staff Attendance Summary */}
              <Grid item xs={12} md={6}>
                <StaffAttendanceSummary />
              </Grid>
            </Grid>
          </>
        )}

        {/* Content Sections */}
        {selectedContent === "studentAttendance" && <StudentAttendance />}
        {selectedContent === "staffAttendance" && <StaffAttendance />}
        {selectedContent === "requestTable" && <RequestTable />}
        {selectedContent === "StaffRequestTable" && <StaffRequestTable />}
      </Box>

      {/* Profile Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={handleProfileDialogClose} 
        fullWidth 
        maxWidth="md"
        fullScreen={isSmallScreen}
      >
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
                alt="Profile Photo"
                sx={{ 
                  width: isSmallScreen ? 100 : 150, 
                  height: isSmallScreen ? 100 : 150, 
                  mb: 2, 
                  border: '2px solid #eee' 
                }}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{user.name || 'Student'}</Typography>
              <Typography variant="body1" color="textSecondary">{user.role} | {user.department}</Typography>
            </Box>
            <Box sx={{ flex: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    name="employee_id"
                    value={formData?.sin_number || user?.sin_number}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editMode ? editedData?.email : formData?.email || ''}
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
                    value={editMode ? editedData?.phone : formData?.phone || ''}
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
                    value={editMode ? editedData?.department : formData?.department || ''}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={editMode ? editedData?.address : formData?.address || ''}
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
        fullScreen={isSmallScreen}
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

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel} fullScreen={isSmallScreen}>
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

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} fullScreen={isSmallScreen}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            type="password"
            value={passwordData.oldPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" color="primary">
            Change Password
          </Button>
        </DialogActions>
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
    </Box>
  );
};

export default Dashboard;