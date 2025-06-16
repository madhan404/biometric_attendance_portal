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
  DialogTitle,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  MenuItem,
  Select,
  Badge,
  Menu,
  TextField,
  InputAdornment,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Skeleton,
  Fab,
  Tooltip,
  CardHeader,
  CardActionArea,
  DialogContentText,
  CircularProgress,
  ListItemIcon,
  Collapse,
  FormHelperText,
  Snackbar,
  Alert
} from "@mui/material";
import { 
  Person as PersonIcon, 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  EventNote as EventNoteIcon,
  RequestQuote as RequestQuoteIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ExpandMore,
  ExpandLess,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as TransgenderIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  PhotoCamera
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import dayjs from "dayjs";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from "axios";
import { format } from 'date-fns';

// Import your components
import RequestTable from "../components/principal/RequestTable";
import HodRequestTable from "../components/principal/HodRequestTable";
import StaffRequestTable from "../components/principal/StaffRequestTable";
import StudentAttendance from "../components/principal/StudentAttendance";
import StaffAttendance from "../components/principal/StaffAttendance";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

// Custom components
import CollegeLogo from "../assets/logo.png"; // Replace with your actual logo path

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();
  const { logout, currentUser, updateUserProfile, updatePassword } = useAuth();

  // State management
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState("dashboard");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [error, setError] = useState(null);
  const [userDatas, setUserDatas] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  const [notifications, setNotifications] = useState([]);
  const [studentRequests, setStudentRequests] = useState({
    leave: { pending: 0, approved: 0, rejected: 0 },
    od: { pending: 0, approved: 0, rejected: 0 },
    internship: { pending: 0, approved: 0, rejected: 0 }
  });
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // Password reset states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Profile states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    address: "",
    employeeId: "",
    photo: ""
  });

  // Form data for editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    address: "",
    gender: "",
    employeeId: "",
    photo: ""
  });

  // Filter states
  const departments = ["All Departments", "Computer Science", "Information Technology", "AIDS", "Agri", "Bio-Medical", "ECE", "Mechanical", "Cyber Security"];
  const years = ["All Years", "I", "II", "III", "IV"];
  const semesters = ["All Semesters", "1", "2", "3", "4", "5", "6", "7", "8"];
  
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");

  // Replace the mock holidays state with:
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  // Base data for requests and attendance
  const baseStudentRequestCounts = {
    "Computer Science": {
      leave: { pending: 15, approved: 120, rejected: 5 },
      od: { pending: 8, approved: 80, rejected: 2 },
      internship: { pending: 5, approved: 30, rejected: 1 }
    },
    "Information Technology": {
      leave: { pending: 12, approved: 110, rejected: 4 },
      od: { pending: 6, approved: 75, rejected: 1 },
      internship: { pending: 4, approved: 25, rejected: 1 }
    },
    "AIDS": {
      leave: { pending: 8, approved: 90, rejected: 3 },
      od: { pending: 5, approved: 60, rejected: 1 },
      internship: { pending: 3, approved: 20, rejected: 0 }
    },
    "Agri": {
      leave: { pending: 6, approved: 80, rejected: 2 },
      od: { pending: 4, approved: 50, rejected: 1 },
      internship: { pending: 2, approved: 15, rejected: 0 }
    },
    "Bio-Medical": {
      leave: { pending: 5, approved: 70, rejected: 1 },
      od: { pending: 3, approved: 40, rejected: 1 },
      internship: { pending: 1, approved: 10, rejected: 0 }
    }
  };

  const baseStaffRequestCounts = {
    "Computer Science": {
      leave: { pending: 5, approved: 18, rejected: 2 },
      od: { pending: 3, approved: 15, rejected: 1 },
      permission: { pending: 7, approved: 12, rejected: 1 }
    },
    "Information Technology": {
      leave: { pending: 4, approved: 15, rejected: 1 },
      od: { pending: 2, approved: 12, rejected: 1 },
      permission: { pending: 5, approved: 10, rejected: 1 }
    },
    "AIDS": {
      leave: { pending: 3, approved: 12, rejected: 1 },
      od: { pending: 2, approved: 10, rejected: 1 },
      permission: { pending: 4, approved: 8, rejected: 1 }
    },
    "Agri": {
      leave: { pending: 2, approved: 10, rejected: 1 },
      od: { pending: 1, approved: 8, rejected: 1 },
      permission: { pending: 3, approved: 6, rejected: 1 }
    },
    "Bio-Medical": {
      leave: { pending: 1, approved: 8, rejected: 1 },
      od: { pending: 1, approved: 6, rejected: 1 },
      permission: { pending: 2, approved: 5, rejected: 1 }
    }
  };

  const baseHodRequestCounts = {
    "Computer Science": {
      leave: { pending: 2, approved: 8, rejected: 1 },
      od: { pending: 3, approved: 10, rejected: 2 },
      permission: { pending: 5, approved: 12, rejected: 3 }
    },
    "Information Technology": {
      leave: { pending: 1, approved: 6, rejected: 1 },
      od: { pending: 2, approved: 8, rejected: 1 },
      permission: { pending: 4, approved: 10, rejected: 2 }
    },
    "AIDS": {
      leave: { pending: 1, approved: 5, rejected: 1 },
      od: { pending: 1, approved: 6, rejected: 1 },
      permission: { pending: 3, approved: 8, rejected: 1 }
    },
    "Agri": {
      leave: { pending: 1, approved: 4, rejected: 1 },
      od: { pending: 1, approved: 5, rejected: 1 },
      permission: { pending: 2, approved: 6, rejected: 1 }
    },
    "Bio-Medical": {
      leave: { pending: 0, approved: 3, rejected: 1 },
      od: { pending: 1, approved: 4, rejected: 1 },
      permission: { pending: 1, approved: 5, rejected: 1 }
    }
  };

  // Base attendance data
  const baseStudentAttendanceData = [
    { name: "Computer Science", I: 85, II: 78, III: 82, IV: 80 },
    { name: "Information Technology", I: 78, II: 75, III: 80, IV: 82 },
    { name: "AIDS", I: 82, II: 80, III: 85, IV: 78 },
    { name: "Agri", I: 80, II: 82, III: 78, IV: 85 },
    { name: "Bio-Medical", I: 75, II: 78, III: 82, IV: 80 }
  ];

  const baseStaffAttendanceData = [
    { name: "Computer Science", present: 85, leave: 5, od: 10 },
    { name: "Information Technology", present: 78, leave: 8, od: 14 },
    { name: "AIDS", present: 82, leave: 6, od: 12 },
    { name: "Agri", present: 80, leave: 7, od: 13 },
    { name: "Bio-Medical", present: 75, leave: 10, od: 15 }
  ];

  // Filter data based on selected filters
  const getFilteredData = () => {
    // Filter student requests
    let studentRequests = {};
    if (selectedDepartment === "All Departments") {
      // Sum all departments
      Object.values(baseStudentRequestCounts).forEach(deptData => {
        Object.entries(deptData).forEach(([type, counts]) => {
          if (!studentRequests[type]) {
            studentRequests[type] = { pending: 0, approved: 0, rejected: 0 };
          }
          studentRequests[type].pending += counts.pending;
          studentRequests[type].approved += counts.approved;
          studentRequests[type].rejected += counts.rejected;
        });
      });
    } else {
      studentRequests = baseStudentRequestCounts[selectedDepartment] || {};
    }

    // Filter staff requests
    let staffRequests = {};
    if (selectedDepartment === "All Departments") {
      // Sum all departments
      Object.values(baseStaffRequestCounts).forEach(deptData => {
        Object.entries(deptData).forEach(([type, counts]) => {
          if (!staffRequests[type]) {
            staffRequests[type] = { pending: 0, approved: 0, rejected: 0 };
          }
          staffRequests[type].pending += counts.pending;
          staffRequests[type].approved += counts.approved;
          staffRequests[type].rejected += counts.rejected;
        });
      });
    } else {
      staffRequests = baseStaffRequestCounts[selectedDepartment] || {};
    }

    // Filter HOD requests
    let hodRequests = {};
    if (selectedDepartment === "All Departments") {
      // Sum all departments
      Object.values(baseHodRequestCounts).forEach(deptData => {
        Object.entries(deptData).forEach(([type, counts]) => {
          if (!hodRequests[type]) {
            hodRequests[type] = { pending: 0, approved: 0, rejected: 0 };
          }
          hodRequests[type].pending += counts.pending;
          hodRequests[type].approved += counts.approved;
          hodRequests[type].rejected += counts.rejected;
        });
      });
    } else {
      hodRequests = baseHodRequestCounts[selectedDepartment] || {};
    }

    // Filter student attendance
    let studentAttendance = baseStudentAttendanceData;
    if (selectedDepartment !== "All Departments") {
      studentAttendance = baseStudentAttendanceData.filter(item => item.name === selectedDepartment);
    }

    // Filter staff attendance
    let staffAttendance = baseStaffAttendanceData;
    if (selectedDepartment !== "All Departments") {
      staffAttendance = baseStaffAttendanceData.filter(item => item.name === selectedDepartment);
    }

    return {
      studentRequests,
      staffRequests,
      hodRequests,
      studentAttendance,
      staffAttendance
    };
  };

  const filteredData = getFilteredData();

  // Sidebar menu items
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
      text: "Student Requests", 
      onClick: () => handleMenuItemClick("requestTable") 
    },
    { 
      icon: <RequestQuoteIcon />, 
      text: "Staff Requests", 
      onClick: () => handleMenuItemClick("staffRequestTable") 
    }, 
    { 
      icon: <RequestQuoteIcon />, 
      text: "HOD Requests", 
      onClick: () => handleMenuItemClick("hodRequestTable") 
    }
  ];

  // Load user data on component mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserDatas(parsedUser);
      } catch (e) {
        setError("Failed to parse user data");
      }
    } else {
      setError("No user data found");
    }
    setLoading(false);
  }, []);

  // Fetch student requests when userData is available
  useEffect(() => {
    if (userDatas?.sin_number) {
      fetchStudentRequests();
    }
  }, [userDatas]);

  // Add this with other state declarations at the top
  const [staffRequests, setStaffRequests] = useState({
    leave: { pending: 0, approved: 0, rejected: 0 },
    od: { pending: 0, approved: 0, rejected: 0 },
    permission: { pending: 0, approved: 0, rejected: 0 }
  });
  const [loadingStaffRequests, setLoadingStaffRequests] = useState(false);

  // Add this function after fetchStudentRequests
  const fetchStaffRequests = async () => {
    setLoadingStaffRequests(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/principal-staff-leavests`, {
        sin_number: userDatas?.sin_number
      });

      if (response.data.status === "success") {
        // Count requests by type and status
        const counts = {
          leave: { pending: 0, approved: 0, rejected: 0 },
          od: { pending: 0, approved: 0, rejected: 0 },
          permission: { pending: 0, approved: 0, rejected: 0 }
        };

        const newNotifications = [];

        response.data.staff_leave_requests.forEach(request => {
          const type = request.leave_details.type.toLowerCase();
          if (counts[type]) {
            if (request.approval_status.overall_status === 'Pending Approval') {
              counts[type].pending++;
              const staffName = request.staff_info.name || 'Staff';
              newNotifications.push({
                id: request.request_id,
                text: `New ${type} request from ${staffName}`,
                time: new Date(request.created_at || request.createdAt || new Date()).toLocaleString(),
                unread: true,
                type: type,
                requestId: request.request_id
              });
            } else if (request.approval_status.overall_status.includes('Approved')) {
              counts[type].approved++;
            } else if (request.approval_status.overall_status === 'Rejected') {
              counts[type].rejected++;
            }
          }
        });

        setStaffRequests(counts);
        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev]);
        }
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

  // Add this useEffect after the student requests useEffect
  useEffect(() => {
    if (userDatas?.sin_number) {
      fetchStaffRequests();
    }
  }, [userDatas]);

  // Add this with other state declarations at the top
  const [hodRequests, setHodRequests] = useState({
    leave: { pending: 0, approved: 0, rejected: 0 },
    od: { pending: 0, approved: 0, rejected: 0 },
    permission: { pending: 0, approved: 0, rejected: 0 }
  });
  const [loadingHodRequests, setLoadingHodRequests] = useState(false);

  // Add this function after fetchStaffRequests
  const fetchHodRequests = async () => {
    setLoadingHodRequests(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/principal-hod-leavests`, {
        sin_number: userDatas?.sin_number
      });

      if (response.data.status === "success") {
        // Count requests by type and status
        const counts = {
          leave: { pending: 0, approved: 0, rejected: 0 },
          od: { pending: 0, approved: 0, rejected: 0 },
          permission: { pending: 0, approved: 0, rejected: 0 }
        };

        const newNotifications = [];

        response.data.staff_leave_requests.forEach(request => {
          const type = request.leave_details.type.toLowerCase();
          if (counts[type]) {
            if (request.approval_status.overall_status === 'Pending Approval') {
              counts[type].pending++;
              const hodName = request.staff_info.name || 'HOD';
              newNotifications.push({
                id: request.request_id,
                text: `New ${type} request from ${hodName}`,
                time: new Date(request.leave_details.applied_on || new Date()).toLocaleString(),
                unread: true,
                type: type,
                requestId: request.request_id
              });
            } else if (request.approval_status.overall_status.includes('Approved')) {
              counts[type].approved++;
            } else if (request.approval_status.overall_status === 'Rejected') {
              counts[type].rejected++;
            }
          }
        });

        setHodRequests(counts);
        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error fetching HOD requests:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to fetch HOD requests",
        severity: "error"
      });
    } finally {
      setLoadingHodRequests(false);
    }
  };

  // Add this useEffect after the staff requests useEffect
  useEffect(() => {
    if (userDatas?.sin_number) {
      fetchHodRequests();
    }
  }, [userDatas]);

  // Event handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleProfileDialogOpen = () => {
    setProfileDialogOpen(true);
    setEditMode(false);
    setPasswordResetOpen(false);
    handleProfileMenuClose();
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
    setEditMode(false);
    setPasswordResetOpen(false);
    setPasswordError("");
    setEditedData(null);
  };

  const handlePasswordDialogOpen = () => {
    setPasswordResetOpen(true);
    setProfileDialogOpen(false);
    handleProfileMenuClose();
  };

  const handlePasswordDialogClose = () => {
    setPasswordResetOpen(false);
    setOldPassword("");
    setNewPassword("");
    setPasswordError("");
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

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData(profileData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editMode) {
      setEditedData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!userDatas) {
      setError("User data not available");
      return;
    }

    try {
      const formDataToSend = new FormData();
      const dataToSend = editMode ? editedData : formData;
      formDataToSend.append("email", dataToSend.email);
      formDataToSend.append("phone", dataToSend.phone);
      formDataToSend.append("address", dataToSend.address);
      if (photoFile) {
        formDataToSend.append("photo", photoFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/principal/update-profile/${userDatas.sin_number}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.status === "success") {
        setUserDatas(prev => ({
          ...prev,
          ...response.data.principal
        }));
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
    if (!userDatas) {
      setError("User data not available");
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/principal/change-password/${userDatas.sin_number}`,
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

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  // Update the handleRefreshHolidays function:
  const handleRefreshHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/principal/holidays`);
      if (response.data.status === "success") {
        setHolidays(response.data.holidays);
        // setNotification({
        //   open: true,
        //   message: "Holidays refreshed successfully",
        //   severity: "success"
        // });
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

  // Add useEffect to load holidays when component mounts
  useEffect(() => {
    handleRefreshHolidays();
  }, []);

  // Add this function to fetch student requests
  const fetchStudentRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/staffs-std-leavests`, {
        sin_number: userDatas?.sin_number
      });

      if (response.data.status === "success") {
        // Initialize counts object
        const counts = {
          leave: { pending: 0, approved: 0, rejected: 0 },
          od: { pending: 0, approved: 0, rejected: 0 },
          internship: { pending: 0, approved: 0, rejected: 0 }
        };

        const newNotifications = [];

        // Process each request
        response.data.requests.forEach(request => {
          const type = request.request_type.toLowerCase();
          if (counts[type]) {
            // Check if the request is pending principal approval
            if (request.approvals.principal_approval === 'pending' && 
                request.approvals.hod_approval === 'approved') {
              counts[type].pending++;
              const studentName = request.student_name || 'Student';
              newNotifications.push({
                id: request.request_id,
                text: `New ${type} request from ${studentName}`,
                time: new Date(request.dates.applied || new Date()).toLocaleString(),
                unread: true,
                type: type,
                requestId: request.request_id
              });
            } else if (request.approvals.principal_approval === 'approved') {
              counts[type].approved++;
            } else if (request.approvals.principal_approval === 'rejected') {
              counts[type].rejected++;
            }
          }
        });

        setStudentRequests(counts);
        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev]);
        }
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

  // Render a pending requests card
  const renderPendingRequestsCard = (title, data, colors) => (
    <Card 
      elevation={3} 
      sx={{ 
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
      }}
    >
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
          variant: isMobile ? 'body1' : 'subtitle1',
          fontWeight: 'bold'
        }}
      />
      <CardContent sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        p: isMobile ? 0.5 : 1.5,
        gap: 1
      }}>
        {Object.entries(data).map(([key, value], index) => (
          <Box 
            key={key}
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: isMobile ? 0.5 : 1.5,
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
              <PendingIcon sx={{ 
                color: colors[index % colors.length], 
                mr: 1,
                fontSize: isMobile ? '1rem' : '1.25rem'
              }} />
              <Typography variant={isMobile ? "caption" : "body2"}>
                {key === 'leave' ? 'Leave' : key === 'od' ? 'On Duty' : key.charAt(0).toUpperCase() + key.slice(1)}:
              </Typography>
            </Box>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 'bold' }}>{value.pending}</Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  // Convert hex to rgba
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  // Render dashboard content
  const renderDashboardContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 1 : 3 }}>
      {/* Header and Filters */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0,
        mt: isMobile ? -7 : -7
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h4"}
          sx={{ 
            fontWeight: "bold", 
            color: theme.palette.primary.main,
            textAlign: isMobile ? 'center' : 'left',
            width: isMobile ? '100%' : 'auto',
            fontSize: isMobile ? '1.25rem' : '2rem',
            mb: isMobile ? 1 : 0
          }}
        >
          Welcome, {profileData.name?.split(' ')[0] || 'Principal'}!
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* <Select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            size="small"
            sx={{ 
              minWidth: isMobile ? '100%' : 180,
              backgroundColor: 'white',
              fontSize: isMobile ? '0.875rem' : '1rem'
            }}
            IconComponent={ArrowDropDownIcon}
          >
            {departments.map((dept) => (
              <MenuItem 
                key={dept} 
                value={dept}
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                {dept}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            size="small"
            sx={{ 
              minWidth: isMobile ? '100%' : 120,
              backgroundColor: 'white',
              fontSize: isMobile ? '0.875rem' : '1rem'
            }}
            IconComponent={ArrowDropDownIcon}
          >
            {years.map((year) => (
              <MenuItem 
                key={year} 
                value={year}
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                {year}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={selectedSemester}
            onChange={handleSemesterChange}
            size="small"
            sx={{ 
              minWidth: isMobile ? '100%' : 140,
              backgroundColor: 'white',
              fontSize: isMobile ? '0.875rem' : '1rem'
            }}
            IconComponent={ArrowDropDownIcon}
          >
            {semesters.map((sem) => (
              <MenuItem 
                key={sem} 
                value={sem}
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                {sem}
              </MenuItem>
            ))}
          </Select> */}
        </Box>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 1 : 3}>
        {/* Profile Card */}
        <Grid item xs={12} sm={6} md={6} width={500} lg={3} height={isMobile ? 275 : 275}>
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
                  src={photoPreview || (userDatas?.photo ? `data:image/jpeg;base64,${userDatas.photo}` : '/default-avatar.png')} 
                  alt={userDatas?.name || 'User'} 
                  sx={{ 
                    width: isMobile ? 64 : 86, 
                    height: isMobile ? 64 : 86,
                    border: `2px solid white`,
                  }}
                >
                  {!userDatas?.photo && !photoPreview && (userDatas?.name?.charAt(0) || 'A')}
                </Avatar>
                <Box sx={{ ml: isMobile ? 0 : 3, mt: isMobile ? 1 : 0 }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: "bold" }}>
                    {userDatas.name}
                  </Typography>
                 
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <EmailIcon fontSize={isMobile ? "small" : "medium"} sx={{ mr: 1 }} />
                    <Typography variant={isMobile ? "caption" : "body2"}>{userDatas.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PhoneIcon fontSize={isMobile ? "small" : "medium"} sx={{ mr: 1 }} />
                    <Typography variant={isMobile ? "caption" : "body2"}>{userDatas.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <BadgeIcon fontSize={isMobile ? "small" : "medium"} sx={{ mr: 1 }} />
                    <Typography variant={isMobile ? "caption" : "body2"}>Employee ID: {userDatas.sin_number}</Typography>
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
              <Box sx={{ 
                p: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <EditIcon fontSize={isMobile ? "small" : "medium"} sx={{ mr: 1 }} />
                <Typography variant={isMobile ? "caption" : "body2"}>View Profile</Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>

      {/* Student Pending Requests Card */}
<Grid item xs={12} sm={6} md={4} width={225} lg={3} height={isMobile ? 275 : 275} >
  <Box sx={{
    height: '100%',  // Changed from '95%' to fill grid cell
    width: '100%',   // Changed from '80%' to fill grid cell
    // Reduced height values:
   
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden' // Ensures content stays within bounds
  }}>
    {loadingRequests ? (
      <Card elevation={3} sx={{
        flex: 1,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 1.5,  // Reduced padding from 2 to 1.5
        height: '100%',
        overflow: 'auto' // Allows scrolling if content is too long
      }}>
        <CircularProgress size={isMobile ? 18 : 22} /> {/* Slightly smaller */}
        <Typography variant="body2" sx={{ mt: 1.5, fontSize: '0.8rem' }}> {/* Smaller text */}
          Loading requests...
        </Typography>
      </Card>
    ) : (
      <Box sx={{ 
        flex: 1,
        height: '100%',
        p: 0.3,  // Reduced padding from 0.5
        overflow: 'hidden' // Contains content
      }}>
        {renderPendingRequestsCard(
          "Student Pending Requests",
          studentRequests,
          ["#2196F3", "#4CAF50", "#9C27B0"]
        )}
      </Box>
    )}
  </Box>
</Grid>

        {/* Staff Pending Requests Card */}
        <Grid item xs={12} sm={6} md={6} width={225} lg={3} height={isMobile ? 275 : 275}>
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
              <CircularProgress size={isMobile ? 20 : 24} />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading staff requests...
              </Typography>
            </Card>
          ) : (
            renderPendingRequestsCard(
              "Staff Pending Requests",
              staffRequests,
              ["#FF9800", "#673AB7", "#F44336"]
            )
          )}
        </Grid>

        {/* HOD Pending Requests Card */}
        <Grid item xs={12} sm={6} md={6} width={225} lg={3} height={isMobile ? 275 : 275}>
          {loadingHodRequests ? (
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
              <CircularProgress size={isMobile ? 20 : 24} />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading HOD requests...
              </Typography>
            </Card>
          ) : (
            renderPendingRequestsCard(
              "HOD Pending Requests",
              hodRequests,
              ["#00BCD4", "#FF5722", "#607D8B"]
            )
          )}
        </Grid>

       {/* Holidays Card */}
<Grid item xs={12} lg={6} width={290}>
  <Card 
    elevation={4}
    sx={{
      borderRadius: 3,
      height: isMobile ? 220 : 276, // Reduced from 250/460
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
      }
    }}
  >
    <CardHeader 
      title={`Holiday Calendar ${new Date().getFullYear()}`}
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        textAlign: 'center',
        py: isMobile ? 0.8 : 1.2, // Reduced padding
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
      }}
      titleTypographyProps={{
        variant: isMobile ? 'body2' : 'subtitle1', // Smaller variant for mobile
        fontWeight: 'bold',
        component: 'div',
        fontSize: isMobile ? '0.9rem' : '1rem' // Smaller font
      }}
      action={
        <Tooltip title="Refresh Holidays">
          <IconButton
            onClick={handleRefreshHolidays}
            sx={{ color: 'white' }}
            size={isMobile ? "small" : "medium"}
          >
            <RefreshIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      }
    />
    
    <CardContent sx={{ 
      flex: 1, 
      p: isMobile ? 0.5 : 1, // Reduced padding
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {loadingHolidays ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress size={isMobile ? 18 : 22} /> {/* Smaller spinner */}
        </Box>
      ) : holidays.length === 0 ? (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          No holidays found for this year
        </Typography>
      ) : (
        <List 
          sx={{ 
            flex: 1,
            overflow: 'auto',
            py: 0, // Remove default padding
            '&::-webkit-scrollbar': {
              width: '4px' // Thinner scrollbar
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.light,
            }
          }}
        >
          {holidays.map((holiday) => (
            <ListItem 
              key={holiday.id} 
              sx={{ 
                py: isMobile ? 0.3 : 0.8, // Reduced padding
                px: isMobile ? 0.8 : 1.5, // Reduced padding
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.05)'
                }
              }}
              dense // More compact list items
            >
              <ListItemIcon sx={{ minWidth: isMobile ? 28 : 32 }}> {/* Smaller icon container */}
                <Avatar sx={{ 
                  bgcolor: theme.palette.primary.light,
                  width: isMobile ? 24 : 28, // Smaller avatar
                  height: isMobile ? 24 : 28
                }}>
                  <CalendarIcon fontSize={isMobile ? "small" : "medium"} sx={{ color: 'white' }} />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={500} fontSize={isMobile ? '0.8rem' : '0.9rem'}>
                    {holiday.holiday_reason}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" fontSize={isMobile ? '0.7rem' : '0.8rem'}>
                    {new Date(holiday.date).toLocaleDateString('en-US', {
                      weekday: 'short', // Changed from 'long' to save space
                      year: 'numeric',
                      month: 'short', // Changed from 'long'
                      day: 'numeric'
                    })}
                  </Typography>
                }
                sx={{ my: 0 }} // Remove default margins
              />
            </ListItem>
          ))}
        </List>
      )}
    </CardContent>
  </Card>
</Grid>
        
        {/* Student Attendance Chart */}
        <Grid item xs={12} lg={6} width={1600} height={isMobile ? 300 : 400}>
          <Card 
            elevation={4} 
            sx={{ 
              height: '100%',
              width: '100%',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
              }
            }}
          >
            <CardHeader 
              title="Student Attendance Overview" 
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                textAlign: 'center', 
                py: isMobile ? 1 : 2,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
              }}
              titleTypographyProps={{
                variant: isMobile ? 'body1' : 'h5',
                fontWeight: 'bold',
                component: 'div'
              }}
            />
            <CardContent sx={{ 
              flex: 1, 
              p: isMobile ? 1 : 3, 
              bgcolor: '#fafafa',
              height: '100%'
            }}>
              {loadingStudentAttendance ? (
                <Box sx={{ 
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <CircularProgress size={isMobile ? 40 : 60} thickness={4} />
                </Box>
              ) : (
                <Box sx={{ 
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? 1 : 2
                }}>
                  {/* Chart Area */}
                  <Box sx={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={studentAttendanceData}
                        margin={{ 
                          top: isMobile ? 10 : 20, 
                          right: isMobile ? 10 : 30, 
                          left: isMobile ? 30 : 60, 
                          bottom: isMobile ? 30 : 60 
                        }}
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="rgba(0,0,0,0.1)" 
                        />
                        <XAxis 
                          dataKey="name"
                          tick={{ 
                            fill: '#333', 
                            fontSize: isMobile ? 10 : 12 
                          }}
                          axisLine={{ stroke: '#666' }}
                          label={{ 
                            value: "Departments", 
                            position: "bottom", 
                            offset: isMobile ? 15 : 30,
                            fontSize: isMobile ? 10 : 12
                          }}
                          height={isMobile ? 40 : 60}
                        />
                        <YAxis 
                          type="number"
                          tick={{ 
                            fill: '#333', 
                            fontSize: isMobile ? 10 : 12 
                          }}
                          axisLine={{ stroke: '#666' }}
                          label={{ 
                            value: "Number of Students", 
                            angle: -90, 
                            position: "left", 
                            offset: isMobile ? 10 : 15,
                            fontSize: isMobile ? 10 : 12
                          }}
                          width={isMobile ? 50 : 80}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            border: 'none',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            padding: isMobile ? '6px 8px' : '10px 14px',
                            fontSize: isMobile ? 12 : 14
                          }}
                          formatter={(value, name, props) => [
                            `${value} students`,
                            name
                          ]}
                        />
                        <Legend 
                          wrapperStyle={{
                            paddingTop: isMobile ? 5 : 10,
                            fontSize: isMobile ? 10 : 12
                          }}
                          layout="horizontal"
                          verticalAlign="bottom"
                        />
                        <Bar 
                          dataKey="I" 
                          fill="#3f51b5" 
                          name="I Year"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                        <Bar 
                          dataKey="II" 
                          fill="#00bcd4" 
                          name="II Year"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                        <Bar 
                          dataKey="III" 
                          fill="#4caf50" 
                          name="III Year"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                        <Bar 
                          dataKey="IV" 
                          fill="#f44336" 
                          name="IV Year"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Staff Attendance Chart */}
        <Grid item xs={12} width={1600} height={isMobile ? 300 : 400}>
          <Card 
            elevation={4} 
            sx={{ 
              height: '100%', 
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
              }
            }}
          >
            <CardHeader 
              title="Staff Attendance Overview" 
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                textAlign: 'center',
                py: isMobile ? 1 : 2,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
              }}
              titleTypographyProps={{
                variant: isMobile ? 'body1' : 'h5',
                fontWeight: 'bold',
                component: 'div'
              }}
            />
            <CardContent sx={{ 
              flex: 1, 
              p: isMobile ? 1 : 3,
              height: '100%'
            }}>
              {loadingStaffAttendance ? (
                <Box sx={{ 
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <CircularProgress size={isMobile ? 40 : 60} thickness={4} />
                </Box>
              ) : (
                <Box sx={{ 
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={staffAttendanceData}
                      margin={{ 
                        top: isMobile ? 10 : 20, 
                        right: isMobile ? 10 : 30, 
                        left: isMobile ? 10 : 20, 
                        bottom: isMobile ? 15 : 30 
                      }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="rgba(0,0,0,0.1)" 
                      />
                      <XAxis 
                        dataKey="name" 
                        tick={{ 
                          fill: '#333', 
                          fontSize: isMobile ? 10 : 14 
                        }}
                        axisLine={{ stroke: '#666' }}
                      />
                      <YAxis 
                        tick={{ 
                          fill: '#333', 
                          fontSize: isMobile ? 10 : 14 
                        }}
                        axisLine={{ stroke: '#666' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{
                          background: 'rgba(255,255,255,0.98)',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          padding: isMobile ? '8px 12px' : '12px 16px',
                          fontSize: isMobile ? 12 : 14
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          paddingTop: isMobile ? 10 : 24,
                          fontSize: isMobile ? 12 : 16
                        }}
                      />
                      <Bar 
                        dataKey="present" 
                        fill="#2E7D32"
                        name="Present"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="leave" 
                        fill="#C62828"
                        name="Leave"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="od" 
                        fill="#EF6C00"
                        name="OD"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Drawer component
  const drawer = (
    <Box sx={{ 
      overflow: "auto", 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      maxWidth: 280,
      backgroundColor: '#1a237e', // Dark blue background
      color: 'white' // White text
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 2,
        borderBottom: `1px solid rgba(255,255,255,0.1)`
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
          Principal Dashboard
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, pl: 2 }}>
        {sidebarMenuItems.map((item, index) => (
          <ListItem 
            key={index}
            button 
            onClick={item.onClick}
            sx={{ 
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 2 
              },
              backgroundColor: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 
                'rgba(255,255,255,0.2)' : 'inherit',
              borderLeft: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 
                `4px solid ${theme.palette.secondary.main}` : 'none',
              px: 2,
              my: 0.5,
              color: 'white'
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}
              sx={{ 
                fontWeight: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 
                  'bold' : 'medium'
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2 }}>
        <Button 
          fullWidth 
          variant="outlined"
          color="inherit" // This makes the button inherit the white color
          startIcon={<LogoutIcon />}
          onClick={handleLogoutClick}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'white'
            },
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const notificationOpen = Boolean(notificationAnchorEl);
  const profileMenuOpen = Boolean(profileAnchorEl);

  const handleEditClick = () => {
    if (!userDatas) {
      setError("User data not available");
      return;
    }
    setEditedData({
      email: userDatas.email || "",
      phone: userDatas.phone || "",
      address: userDatas.address || ""
    });
    setEditMode(true);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setNotification({
          open: true,
          message: "File size should be less than 5MB",
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

  const [staffAttendanceData, setStaffAttendanceData] = useState([]);
  const [loadingStaffAttendance, setLoadingStaffAttendance] = useState(false);

  // Add this function after other fetch functions
  const fetchStaffAttendance = async () => {
    setLoadingStaffAttendance(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/principal/staff-attendance/staff-daily-attendance`, {
        params: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          college: userDatas?.college
        }
      });

      if (response.data.success) {
        // Transform departmentStats object into array format for the chart
        const transformedData = Object.entries(response.data.departmentStats).map(([department, stats]) => ({
          name: department,
          present: stats.present || 0,
          leave: stats.absent || 0,
          od: stats.od || 0
        }));
        setStaffAttendanceData(transformedData);
      } else {
        console.error('Unexpected API response structure:', response.data);
        setNotification({
          open: true,
          message: "Invalid data format received from server",
          severity: "error"
        });
        setStaffAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching staff attendance:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || "Failed to fetch staff attendance",
        severity: "error"
      });
      setStaffAttendanceData([]);
    } finally {
      setLoadingStaffAttendance(false);
    }
  };

  // Add this useEffect after other useEffects
  useEffect(() => {
    if (userDatas?.college) {
      fetchStaffAttendance();
    }
  }, [userDatas, selectedDepartment]);

  // Add these state declarations with other state declarations
  const [studentAttendanceData, setStudentAttendanceData] = useState([]);
  const [loadingStudentAttendance, setLoadingStudentAttendance] = useState(false);

  // Add this function after fetchStaffAttendance
  const fetchStudentAttendance = async () => {
    setLoadingStudentAttendance(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/principal/attendance/department-daily-attendance`, {
        params: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          college: userDatas?.college
        }
      });

      if (response.data.success && response.data.data) {
        // Transform departmentStats array into the format needed for the chart
        const transformedData = response.data.data.departmentStats.map(dept => ({
          name: dept.name,
          I: dept.present || 0,
          II: dept.od || 0,
          III: dept.internship || 0,
          IV: dept.absent || 0
        }));
        setStudentAttendanceData(transformedData);
      }
      else {
        console.error('Unexpected API response structure:', response.data);
        setNotification({
          open: true,
          message: "Invalid data format received from server",
          severity: "error"
        });
        setStudentAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || "Failed to fetch student attendance",
        severity: "error"
      });
      setStudentAttendanceData([]);
    } finally {
      setLoadingStudentAttendance(false);
    }
  };

  // Add this useEffect after the staff attendance useEffect
  useEffect(() => {
    if (userDatas?.college) {
      fetchStudentAttendance();
    }
  }, [userDatas, selectedDepartment]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ 
        display: "flex", 
        background: "#f5f7fa", 
        minHeight: "100vh",
        flexDirection: isMobile ? 'column' : 'row'
      }}>
      <AppBar 
  position="fixed" 
  sx={{ 
    zIndex: (theme) => theme.zIndex.drawer + 1,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    background: '#1a237e',
    height: { 
      xs: 56,    // Mobile
      sm: 64,    // Tablet
      md: 70     // Desktop
    }
  }}
>
  <Toolbar 
    disableGutters // Remove default padding for more control
    sx={{ 
      height: '100%', // Take full height of AppBar
      px: { 
        xs: 1.5,  // Mobile
        sm: 2.5,  // Tablet
        md: 3     // Desktop
      },
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: {
        xs: 1,    // Mobile
        sm: 1.5,  // Tablet
        md: 2     // Desktop
      }
    }}
  >
    {/* Left Section - Menu Button and Logo */}
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      gap: {
        xs: 1,
        sm: 1.5
      },
      minWidth: 0 // Allows text truncation
    }}>
      <IconButton
        color="inherit"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ 
          display: { md: 'none' }, // Only show on mobile/tablet
          mr: { xs: 0.5, sm: 1 },
          p: {
            xs: 0.5,
            sm: 1
          }
        }}
      >
        <MenuIcon fontSize="small" />
      </IconButton>
      
      <Box 
        component="img"
        src={CollegeLogo} 
        alt="College Logo" 
        sx={{
          height: { 
            xs: 32,  // Mobile
            sm: 38,  // Tablet
            md: 44   // Desktop
          },
          width: 'auto',
          objectFit: 'contain'
        }}
      />
    </Box>

    {/* Center Section - Title with responsive scaling */}
    <Typography 
      variant="h6"
      component="div"
      sx={{
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        px: 1,
        fontSize: {
          xs: '1.575rem',  // 14px - Mobile
          sm: '2rem',      // 16px - Tablet
          md: '0.725rem',  // 18px - Small desktop
          lg: '1.65rem'   // 20px - Large desktop
        },
        maxWidth: {
          xs: '160px',     // Mobile
          sm: '240px',    // Tablet
          md: '360px',     // Small desktop
          lg: '480px',     // Large desktop
          xl: 'none'       // Extra large - no limit
        }
      }}
    >
      Principal Dashboard
    </Typography>

    {/* Right Section - Icons with responsive spacing */}
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      gap: { 
        xs: 0.75,  // Mobile
        sm: 1.25,  // Tablet
        md: 1.5    // Desktop
      }
    }}>
      <Tooltip title="Notifications">
        <IconButton 
          color="inherit" 
          onClick={handleNotificationClick}
          size="small"
          sx={{ 
            p: { 
              xs: 0.5, 
              sm: 0.75 
            } 
          }}
        >
          <Badge 
            badgeContent={notifications.filter(n => !n.read).length} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.6rem',
                height: 16,
                minWidth: 16
              }
            }}
          >
            <NotificationsIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Profile">
        <IconButton 
          onClick={handleProfileMenuOpen} 
          color="inherit"
          size="small"
          sx={{ 
            p: { 
              xs: 0.5, 
              sm: 0.75 
            } 
          }}
        >
          <Avatar 
            src={userDatas?.photo ? `data:image/jpeg;base64,${userDatas.photo}` : '/default-avatar.png'} 
            alt={userDatas?.name || 'User'} 
            sx={{ 
              width: { 
                xs: 28, 
                sm: 32,
                md: 36
              },
              height: { 
                xs: 28, 
                sm: 32,
                md: 36
              },
              border: (theme) => `2px solid ${theme.palette.secondary.main}`
            }} 
          />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileDialogOpen}>Profile</MenuItem>
        <MenuItem onClick={handlePasswordDialogOpen}>Change Password</MenuItem>
        <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
      </Menu>
    </Box>
  </Toolbar>
</AppBar>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              width: 280,
              boxShadow: theme.shadows[4],
              backgroundColor: '#0d47a1', // Dark blue background
              color: 'white' // White text
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
              boxShadow: theme.shadows[4],
              backgroundColor: '#0d47a1', // Dark blue background
              color: 'white' // White text
            },
          }}
          open
        >
          {drawer}
        </Drawer>

        {/* Profile Dialog */}
        <Dialog 
          open={profileDialogOpen} 
          onClose={handleProfileDialogClose} 
          fullWidth 
          maxWidth="md"
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: isMobile ? 1 : 2
          }}>
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
                    onClick={handleEditClick}
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
          <DialogContent sx={{ p: isMobile ? 1 : 3 }}>
            <Box sx={{ 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row", 
              gap: isMobile ? 1 : 3, 
              mt: isMobile ? 0 : 2 
            }}>
              <Box sx={{ 
                flex: 1, 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center" 
              }}>
                <Avatar
                  src={photoPreview || (userDatas?.photo ? `data:image/jpeg;base64,${userDatas.photo}` : '/default-avatar.png')} 
                  alt={userDatas?.name || 'User'} 
                  sx={{ 
                    width: isMobile ? 100 : 150, 
                    height: isMobile ? 100 : 150,
                    border: `2px solid white`,
                  }}
                  onClick={() => setProfileDialogOpen(true)}
                >
                  {!userDatas?.photo && !photoPreview && (userDatas?.name?.charAt(0) || 'A')}
                </Avatar>
                {editMode && (
                  <Button 
                    variant="contained" 
                    component="label" 
                    sx={{ mt: 2 }}
                    startIcon={<PhotoCamera />}
                    size={isMobile ? "small" : "medium"}
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
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {userDatas?.name || 'Principal'}
                </Typography>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Grid container spacing={isMobile ? 1 : 2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={userDatas?.name || ''}
                      margin="normal"
                      disabled
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      name="employeeId"
                      value={userDatas?.sin_number || ''}
                      margin="normal"
                      disabled
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={editMode ? editedData?.email : userDatas?.email || ''}
                      onChange={handleInputChange}
                      margin="normal"
                      disabled={!editMode}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={editMode ? editedData?.phone : userDatas?.phone || ''}
                      onChange={handleInputChange}
                      margin="normal"
                      disabled={!editMode}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={editMode ? editedData?.address : userDatas?.address || ''}
                      onChange={handleInputChange}
                      margin="normal"
                      multiline
                      rows={isMobile ? 2 : 3}
                      disabled={!editMode}
                      size={isMobile ? "small" : "medium"}
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
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ p: isMobile ? 1 : 2 }}>Change Password</DialogTitle>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleChangePassword();
          }}>
            <DialogContent sx={{ p: isMobile ? 1 : 2 }}>
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
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        edge="end"
                        size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        size={isMobile ? "small" : "medium"}
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
            <DialogActions sx={{ p: isMobile ? 1 : 2 }}>
              <Button 
                onClick={handlePasswordDialogClose} 
                size={isMobile ? "small" : "medium"}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                size={isMobile ? "small" : "medium"}
              >
                Change Password
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: isMobile ? 1 : 3,
            width: { md: `calc(100% - 280px)` },
            marginTop: isMobile ? '56px' : '64px',
            backgroundColor: '#f5f7fa',
            marginLeft: { md: '280px' }
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
              {selectedContent === "studentAttendance" && <StudentAttendance />}
              {selectedContent === "staffAttendance" && <StaffAttendance />}
              {selectedContent === "requestTable" && <RequestTable />}
              {selectedContent === "staffRequestTable" && <StaffRequestTable />}
              {selectedContent === "hodRequestTable" && <HodRequestTable />}
            </>
          )}
        </Box>
      </Box>

      {/* Logout Dialog */}
      <Dialog 
        open={logoutDialogOpen} 
        onClose={handleLogoutCancel}
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          color: theme.palette.primary.main,
          p: isMobile ? 1 : 2
        }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 1 : 2 }}>
          <DialogContentText>Are you sure you want to logout?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 1 : 2 }}>
          <Button 
            onClick={handleLogoutCancel} 
            color="primary" 
            variant="outlined"
            sx={{ mr: 1 }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            color="primary" 
            variant="contained"
            size={isMobile ? "small" : "medium"}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog 
        open={changePasswordDialog} 
        onClose={() => setChangePasswordDialog(false)}
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ p: isMobile ? 1 : 2 }}>Change Password</DialogTitle>
        <DialogContent sx={{ p: isMobile ? 1 : 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            type="password"
            value={passwordData.oldPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
            size={isMobile ? "small" : "medium"}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            size={isMobile ? "small" : "medium"}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            size={isMobile ? "small" : "medium"}
          />
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 1 : 2 }}>
          <Button 
            onClick={() => setChangePasswordDialog(false)} 
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            color="primary"
            size={isMobile ? "small" : "medium"}
          >
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

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            mt: 1.5
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Notifications</Typography>
          <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <ListItem 
                  key={notification.id} 
                  sx={{ 
                    py: 1, 
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: notification.unread ? 'bold' : 'normal',
                            color: notification.unread ? 'text.primary' : 'text.secondary'
                          }}
                        >
                          {notification.text}
                        </Typography>
                        {notification.unread && (
                          <Chip
                            size="small"
                            label="New"
                            color="primary"
                            sx={{ height: 20, fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={notification.time}
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
      </Menu>
    </>
  );
};

export default Dashboard;
