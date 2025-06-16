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
  Menu,
  MenuItem,
  InputAdornment,
  FormHelperText,
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
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, AreaChart, Area } from 'recharts';
import logo from '../assets/logo.png';
import axios from "axios";

// Import components
import StudentAttendance from "../components/Staff/StudentAttendance";
import RequestTable from "../components/Staff/RequestTable";
import StudentsList from "../components/Staff/StudentsList";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const Dashboard = () => {
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  const [user, setUser] = useState({
    student_name: "",
    role: "Class Advisor",
    department: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
    sin_number: "",
    gender: "",
    year: ""
  });
  
  const [formData, setFormData] = useState({ ...user });

  // Add new state for request counts
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

  // Add useEffect to fetch request counts
  useEffect(() => {
    const fetchRequestCounts = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const response = await axios.get(`${API_BASE_URL}/classadvisor/students/${parsedUser.sin_number}`);
          if (response.data.status === "success") {
            setRequestCounts(response.data.requestCounts);
          }
        }
      } catch (error) {
        console.error('Error fetching request counts:', error);
      }
    };

    fetchRequestCounts();
  }, []);

  // Student data states
  const [studentDetails] = useState({
    presentCount: 24,
    absentCount: 3,
    lateCount: 5,
    presentStudents: Array.from({length: 24}, (_, i) => ({ id: i+1, name: `Student ${i+1}`, rollNo: `2023CS${i+1}` })),
    absentStudents: Array.from({length: 3}, (_, i) => ({ id: i+25, name: `Student ${i+25}`, rollNo: `2023CS${i+25}` })),
    lateStudents: Array.from({length: 5}, (_, i) => ({ id: i+28, name: `Student ${i+28}`, rollNo: `2023CS${i+28}` }))
  });

  // Student Details Data
  const [Student_Details] = useState({
    TotalStudents: 40,
    ODStudents: 10,
    InternshipStudents: 3,
    totalStudents: Array.from({length: 40}, (_, i) => ({ id: i+1, name: `Student ${i+1}`, rollNo: `2023CS${i+1}` })),
    odStudents: Array.from({length: 10}, (_, i) => ({ id: i+41, name: `Student ${i+41}`, rollNo: `2023CS${i+41}` })),
    internshipStudents: Array.from({length: 3}, (_, i) => ({ id: i+51, name: `Student ${i+51}`, rollNo: `2023CS${i+51}` }))
  });

  // Add new state for holidays
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);

  // Add useEffect to fetch holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoadingHolidays(true);
        const response = await axios.get(`${API_BASE_URL}/staff/holidays`);
        if (response.data.status === "success") {
          setHolidays(response.data.holidays);
        }
      } catch (error) {
        console.error('Error fetching holidays:', error);
      } finally {
        setLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, []);

  // Add new state for notifications
  const [notifications, setNotifications] = useState([]);

  // Add useEffect to fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Fetching notifications for user:', parsedUser.sin_number);
          
          const response = await axios.get(`${API_BASE_URL}/classadvisor/students/${parsedUser.sin_number}`);
          console.log('API Response:', response.data);

          if (response.data.status === "success") {
            const newNotifications = [];
            
            // Process all students' leave requests
            response.data.students.forEach(student => {
              student.leave_requests.forEach(request => {
                console.log('Processing request:', request);
                const type = request.request_type.toLowerCase();
                if (request.approvals.class_advisor_approval === 'pending' && 
                    request.approvals.mentor_approval === 'approved') {
                  console.log('Found pending class advisor approval request:', request);
                  newNotifications.push({
                    id: request.request_id,
                    text: `New ${type} request from ${student.name}`,
                    time: new Date(request.dates.applied).toLocaleString(),
                    unread: true,
                    type: type,
                    requestId: request.request_id
                  });
                }
              });
            });

            console.log('New notifications created:', newNotifications);

            if (newNotifications.length > 0) {
              setNotifications(prev => {
                const updated = [...newNotifications, ...prev];
                console.log('Updated notifications state:', updated);
                return updated;
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Update filteredData to use requestCounts
  const filteredData = {
    studentRequests: [
      { label: "Leave", pending: requestCounts.pendingLeaveRequests, approved: requestCounts.approvedLeaves, rejected: requestCounts.rejectedLeaves },
      { label: "On Duty", pending: requestCounts.pendingODRequests, approved: requestCounts.approvedOD, rejected: requestCounts.rejectedOD },
      { label: "Internship", pending: requestCounts.pendingInternshipRequests, approved: requestCounts.approvedInternship, rejected: requestCounts.rejectedInternship }
    ]
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
      icon: <RequestQuoteIcon />, 
      text: "Student Request Table", 
      onClick: () => handleMenuItemClick("requestTable") 
    },
    {
      icon: <PersonIcon />,
      text: "Students List",
      onClick: () => handleMenuItemClick("studentsList")
    }
  ];

  const [openDialog, setOpenDialog] = useState(false);
  const [currentListType, setCurrentListType] = useState('');
  const [currentList, setCurrentList] = useState([]);

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = () => {
    setUser(formData);
    setEditMode(false);
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

  const handleCancelEdit = () => {
    setFormData(user);
    setEditMode(false);
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      setPasswordError("Both fields are required");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    setOldPassword("");
    setNewPassword("");
    setPasswordError("");
    setPasswordResetOpen(false);
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

  // Student Attendance Functions
  const handleOpenStudentList = (type) => {
    setCurrentListType(type);
    switch (type) {
      case 'present':
        setCurrentList(studentDetails.presentStudents);
        break;
      case 'absent':
        setCurrentList(studentDetails.absentStudents);
        break;
      case 'late':
        setCurrentList(studentDetails.lateStudents);
        break;
      case 'total':
        setCurrentList(Student_Details.totalStudents);
        break;
      case 'od':
        setCurrentList(Student_Details.odStudents);
        break;
      case 'internship':
        setCurrentList(Student_Details.internshipStudents);
        break;
      default:
        setCurrentList([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const renderPendingRequestsCard = (title, data, colors) => (
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
                {item.label}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.pending}</Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  const renderAttendanceChart = (title, data) => {
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
          title={title}
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
              data={data}
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
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  padding: '10px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Count"
                fill="#8884d8"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const getHolidayColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'national holiday': return theme.palette.error.main;
      case 'festival': return theme.palette.success.main;
      case 'religious holiday': return theme.palette.info.main;
      case 'academic break': return theme.palette.warning.main;
      default: return theme.palette.primary.main;
    }
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

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
          title="Holiday Calendar"
          avatar={<CalendarIcon sx={{ color: 'white' }} />}
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
        <CardContent sx={{ flex: 1, p: 0 }}>
          {loadingHolidays ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
              <CircularProgress />
            </Box>
          ) : (
          <List sx={{ 
            height: 260,
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
              {holidays.length > 0 ? (
                holidays.map((holiday, index) => (
              <ListItem 
                key={index} 
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
                    bgcolor: getHolidayColor(holiday.type),
                    width: 32, 
                    height: 32 
                  }}>
                    <CalendarIcon fontSize="small" sx={{ color: 'white' }} />
                  </Avatar>
                </ListItemIcon>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={500}>
                          {holiday.holiday_reason}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(holiday.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {holiday.type}
                  </Typography>
                </Box>
              </ListItem>
                ))
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    No holidays found
                  </Typography>
                </Box>
              )}
          </List>
          )}
        </CardContent>
      </Card>
    );
  };

  // Add new state for attendance data
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    absent: 0,
    late: 0,
    od: 0,
    internship: 0,
    earlyDeparture: 0
  });
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  // Add useEffect to fetch yesterday's attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoadingAttendance(true);
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Get yesterday's date
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const dateStr = yesterday.toISOString().split('T')[0];
          
          const response = await axios.get(`${API_BASE_URL}/classadvisor/daily-attendance?date=${dateStr}&sin_number=${parsedUser.sin_number}`);
          if (response.data.success) {
            setAttendanceData(response.data.data.attendanceStats);
          }
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Add new state for performance data
  const [performanceData, setPerformanceData] = useState({
    attendanceTrend: [],
    requestDistribution: [],
    studentMetrics: []
  });

  // Add useEffect to fetch performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Get last 7 days dates
          const dates = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
          });

          // Fetch attendance data for last 7 days
          const attendancePromises = dates.map(date => 
            axios.get(`${API_BASE_URL}/classadvisor/daily-attendance?date=${date}&sin_number=${parsedUser.sin_number}`)
          );
          
          const attendanceResponses = await Promise.all(attendancePromises);
          
          // Process attendance data
          const attendanceTrend = attendanceResponses.map((response, index) => {
            const data = response.data.success ? response.data.data.attendanceStats : {
              present: 0,
              absent: 0,
              late: 0,
              od: 0,
              internship: 0
            };
            return {
              date: new Date(dates[index]).toLocaleDateString('en-US', { weekday: 'short' }),
              present: data.present,
              absent: data.absent,
              late: data.late,
              od: data.od,
              internship: data.internship
            };
          });

          // Calculate request distribution
          const requestDistribution = [
            { name: 'Leave', value: requestCounts.pendingLeaveRequests + requestCounts.approvedLeaves + requestCounts.rejectedLeaves },
            { name: 'On Duty', value: requestCounts.pendingODRequests + requestCounts.approvedOD + requestCounts.rejectedOD },
            { name: 'Internship', value: requestCounts.pendingInternshipRequests + requestCounts.approvedInternship + requestCounts.rejectedInternship }
          ];

          // Calculate student metrics
          const studentMetrics = [
            { name: 'Attendance Rate', value: Math.round((attendanceData.present / (attendanceData.present + attendanceData.absent)) * 100) || 0 },
            { name: 'On Duty Rate', value: Math.round((attendanceData.od / (attendanceData.present + attendanceData.absent)) * 100) || 0 },
            { name: 'Internship Rate', value: Math.round((attendanceData.internship / (attendanceData.present + attendanceData.absent)) * 100) || 0 }
          ];

          setPerformanceData({
            attendanceTrend,
            requestDistribution,
            studentMetrics
          });
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
      }
    };

    fetchPerformanceData();
  }, [attendanceData, requestCounts]);

  const renderPerformanceOverview = () => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
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
          title="Student Performance Overview"
          avatar={<SchoolIcon sx={{ color: 'white' }} />}
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
          <Grid container spacing={2}>
            {/* Attendance Trend */}
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" gutterBottom>Weekly Attendance Trend</Typography>
              <ResponsiveContainer width="100%" height={250} minWidth={400}>
                <AreaChart data={performanceData.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="present" stackId="1" stroke="#66BB6A" fill="#66BB6A" />
                  <Area type="monotone" dataKey="absent" stackId="1" stroke="#EF5350" fill="#EF5350" />
                  <Area type="monotone" dataKey="late" stackId="1" stroke="#FFA726" fill="#FFA726" />
                  <Area type="monotone" dataKey="od" stackId="1" stroke="#42A5F5" fill="#42A5F5" />
                  <Area type="monotone" dataKey="internship" stackId="1" stroke="#AB47BC" fill="#AB47BC" />
                </AreaChart>
              </ResponsiveContainer>
            </Grid>

            {/* Request Distribution */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Request Distribution</Typography>
              <ResponsiveContainer width="100%" height={250} minWidth={400}>
                <PieChart>
                  <Pie
                    data={performanceData.requestDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceData.requestDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>

            {/* Student Metrics */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Student Metrics</Typography>
              <ResponsiveContainer width="100%" height={250} minWidth={400}>
                <BarChart data={performanceData.studentMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => [`${value}%`, 'Rate']} />
                  <Bar dataKey="value" fill="#8884d8">
                    {performanceData.studentMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

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

  const getDialogTitle = () => {
    switch (currentListType) {
      case 'present': return 'Present Students';
      case 'absent': return 'Absent Students';
      case 'late': return 'Late Comers';
      case 'total': return 'Total Students';
      case 'od': return 'OD Students';
      case 'internship': return 'Internship Students';
      default: return 'Students List';
    }
  };

  // Add useEffect to fetch user data from session storage
  useEffect(() => {
    const fetchUserData = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(prevUser => ({
          ...prevUser,
          student_name: parsedUser.name || "",
          department: parsedUser.department || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          address: parsedUser.address || "",
          photo: parsedUser.photo ? `data:image/jpeg;base64,${parsedUser.photo}` : "",
          sin_number: parsedUser.sin_number || "",
          gender: parsedUser.gender || "",
          year: parsedUser.year || ""
        }));
      }
    };

    fetchUserData();
  }, []);

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, unread: false } : n
      )
    );
    
    // Close notification menu
    handleNotificationMenuClose();
    
    // Navigate to request table
    setSelectedContent("requestTable");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: '#f5f5f5' }}>
   <AppBar 
  position="fixed" 
  sx={{ 
    zIndex: theme.zIndex.drawer + 1, 
    background: "#1a237e",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  }}
>
  <Toolbar sx={{ 
    minHeight: { xs: 56, md: 64 },
    px: { xs: 1, md: 2 },
    justifyContent: "space-between",
    gap: 1
  }}>
    {/* Left side - Menu button and logo */}
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      minWidth: { xs: 'auto', md: 240 },
      flexShrink: 0
    }}>
      <IconButton
        color="inherit"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ 
          mr: { xs: 1, md: 2 },
          display: { xs: 'flex', md: 'none' } // Only show on mobile
        }}
      >
        <MenuIcon />
      </IconButton>
      
      <Box sx={{ 
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center'
      }}>
        <img 
          src={logo} 
          alt="College Logo" 
          style={{ 
            height: '50px',
            width: 'auto',
            marginRight: '10px',
            objectFit: 'contain'
          }} 
        />
      </Box>
    </Box>

    {/* Center - Dashboard title */}
    <Typography 
      variant="h6"
      noWrap
      component="div"
      sx={{
        flexGrow: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: { 
          xs: '1rem', 
          sm: '1.1rem',
          md: '1.25rem'
        },
        px: 1,
        whiteSpace: 'normal',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        color: 'white',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      CLASS ADVISOR DASHBOARD
    </Typography>

    {/* Right side - Icons */}
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      minWidth: { xs: 'auto', md: 120 },
      justifyContent: 'flex-end',
      gap: { xs: 0.5, md: 1 }
    }}>
      <IconButton 
        color="inherit" 
        onClick={handleNotificationMenuOpen}
        size="small"
        sx={{ 
          p: { xs: '6px', md: '8px' },
          '& .MuiSvgIcon-root': {
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }
        }}
      >
        <Badge 
          badgeContent={notifications.filter(n => n.unread).length} 
          color="error"
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: { xs: '0.6rem', md: '0.7rem' },
              height: { xs: 16, md: 18 },
              minWidth: { xs: 16, md: 18 }
            }
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <IconButton 
        onClick={handleProfileMenuOpen} 
        color="inherit"
        size="small"
        sx={{ p: { xs: '4px', md: '6px' } }}
      >
        <Avatar 
          src={user.photo} 
          alt={user.student_name} 
          sx={{ 
            width: { xs: 30, md: 36 },
            height: { xs: 30, md: 36 },
            border: '2px solid rgba(255,255,255,0.8)'
          }}
        />
      </IconButton>
    </Box>
  </Toolbar>
</AppBar>
      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 350,
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
                backgroundColor: notification.unread ? 'rgba(25, 118, 210, 0.05)' : 'inherit'
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
          width: isMobile ? 320 : 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: isMobile ? 320 : 280,
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
          p: isMobile ? 2 : 3,
          width: isMobile ? '100%' : `calc(100% - 280px)`,
          mt: isMobile ? 0 : 2
        }}
      >
        <Toolbar />
        
        {selectedContent === "dashboard" && (
          <>
            <Typography variant="h4" sx={{ 
              color: theme.palette.primary.main, 
              fontWeight: 'bold', 
              mb: 3,
              mt: isMobile ? 0 : -23,
              ml: isMobile ? 0 : -33,
              textAlign: isMobile ? 'center' : 'left',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}>
              Welcome, {user.student_name}!
            </Typography>
            
            <Grid container spacing={3} sx={{ ml: isMobile ? 0 : -33 }}>
              {/* First Row */}
              <Grid container item spacing={3} xs={12}>
                {/* Profile Card */}
                <Grid item xs={12} md={6} lg={4} width={600}>
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
                          src={user?.photo}
                          alt="Profile Photo"
                          sx={{ 
                            width: isMobile ? 80 : 100, 
                            height: isMobile ? 80 : 100, 
                            mb: isMobile ? 2 : 0,
                            border: '3px solid white'
                          }}
                        />
                        <Box sx={{ ml: isMobile ? 0 : 3 }}>
                          <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: "bold" }}>
                            {user?.student_name}
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

                {/* Student Pending Requests Card */}
                <Grid item xs={12} md={6} lg={4}>
                  {renderPendingRequestsCard(
                    "Student Pending Requests",
                    [
                      { label: "Leave", pending: requestCounts.pendingLeaveRequests, approved: requestCounts.approvedLeaves, rejected: requestCounts.rejectedLeaves },
                      { label: "On Duty", pending: requestCounts.pendingODRequests, approved: requestCounts.approvedOD, rejected: requestCounts.rejectedOD },
                      { label: "Internship", pending: requestCounts.pendingInternshipRequests, approved: requestCounts.approvedInternship, rejected: requestCounts.rejectedInternship }
                    ],
                    ["#2196F3", "#4CAF50", "#9C27B0"]
                  )}
                </Grid>

                {/* Student Approved Requests Card */}
                <Grid item xs={12} md={6} lg={4}>
                  {renderPendingRequestsCard(
                    "Student Approved Requests",
                    [
                      { label: "Leave", pending: requestCounts.approvedLeaves, approved: requestCounts.approvedLeaves, rejected: requestCounts.rejectedLeaves },
                      { label: "On Duty", pending: requestCounts.approvedOD, approved: requestCounts.approvedOD, rejected: requestCounts.rejectedOD },
                      { label: "Internship", pending: requestCounts.approvedInternship, approved: requestCounts.approvedInternship, rejected: requestCounts.rejectedInternship }
                    ],
                    ["#66BB6A", "#66BB6A", "#66BB6A"]  // All green for approved
                  )}
                </Grid>

                {/* Student Rejected Requests Card */}
                <Grid item xs={12} md={6} lg={4}>
                  {renderPendingRequestsCard(
                    "Student Rejected Requests",
                    [
                      { label: "Leave", pending: requestCounts.rejectedLeaves, approved: requestCounts.approvedLeaves, rejected: requestCounts.rejectedLeaves },
                      { label: "On Duty", pending: requestCounts.rejectedOD, approved: requestCounts.approvedOD, rejected: requestCounts.rejectedOD },
                      { label: "Internship", pending: requestCounts.rejectedInternship, approved: requestCounts.approvedInternship, rejected: requestCounts.rejectedInternship }
                    ],
                    ["#EF5350", "#EF5350", "#EF5350"]  // All red for rejected
                  )}
                </Grid>

                {/* Student Request Summary Chart */}
                <Grid item xs={12} width={600} md={8}>
                  {renderAttendanceChart(
                    "Student Request Summary",
                    [
                      { 
                        name: 'Pending', 
                        value: requestCounts.pendingLeaveRequests + requestCounts.pendingODRequests + requestCounts.pendingInternshipRequests,
                        color: '#FFA726'
                      },
                      { 
                        name: 'Approved', 
                        value: requestCounts.approvedLeaves + requestCounts.approvedOD + requestCounts.approvedInternship,
                        color: '#66BB6A'
                      },
                      { 
                        name: 'Rejected', 
                        value: requestCounts.rejectedLeaves + requestCounts.rejectedOD + requestCounts.rejectedInternship,
                        color: '#EF5350'
                      }
                    ]
                  )}
                </Grid>

                {/* Holiday Calendar */}
                <Grid item xs={12} width={270} md={4}>
                  {renderHolidaysList()}
                </Grid>
              </Grid>

              {/* Second Row */}
              <Grid container item spacing={3} xs={12}>
                {/* Student Performance Overview */}
                <Grid item xs={12} width={1500}>
                  {renderPerformanceOverview()}
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
        
        {/* Content Sections */}
        {selectedContent === "studentAttendance" && <StudentAttendance />}
        {selectedContent === "requestTable" && <RequestTable />}
        {selectedContent === "studentsList" && <StudentsList />}
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
                {/* <Button 
                  onClick={handleEditProfile}
                  startIcon={<EditIcon />}
                  color="primary"
                  variant="outlined"
                  size="small"
                >
                  Edit
                </Button> */}
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
                src={user.photo}
                alt="Profile Photo"
                sx={{ width: 150, height: 150, mb: 2, border: '2px solid #eee' }}
              />
              {editMode && (
                <Button variant="contained" component="label" sx={{ mb: 2 }}>
                  Upload Photo
                  <input type="file" hidden />
                </Button>
              )}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{user.student_name}</Typography>
              <Typography variant="body1" color="textSecondary">Class Advisor | {user.department}</Typography>
            </Box>
            <Box sx={{ flex: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="student_name"
                    value={user.student_name}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ID Number"
                    name="sin_number"
                    value={  user.sin_number}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={user.email}
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
                    value={user.phone}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={user.gender}
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
                    value={user.department}
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
                    value={user.address}
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

    
      {/* Student List Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {getDialogTitle()}
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {currentList.length > 0 ? (
              currentList.map((student) => (
                <ListItem key={student.id}>
                  <ListItemText 
                    primary={student.name} 
                    secondary={`Roll No: ${student.rollNo}`} 
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                No students found
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleExport(currentListType)}
            startIcon={<DownloadIcon />}
            variant="contained"
            color="primary"
          >
            Export to Excel
          </Button>
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
    </Box>
  );
};

export default Dashboard;