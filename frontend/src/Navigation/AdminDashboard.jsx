
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  DialogContentText,
  useTheme,
  Paper,
  Divider,
  CssBaseline,
  Container,
  Badge,
  CircularProgress
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  History as HistoryIcon,
  Backup as BackupIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  ChevronLeft,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import axios from 'axios';
import Group from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Import your components
import Analytics from "../components/Admin/Analytics";
import AuditLogs from "../components/Admin/AuditLogs";
import BackupRecovery from "../components/Admin/BackupRecovery";
import SystemConfig from "../components/Admin/SystemConfig";
import UserManagement from "../components/Admin/UserManagement";
import LeaveRequests from "../components/Admin/LeaveRequests";

// Import college logo (replace with your actual logo path)
import collegeLogo from '../assets/logo.png';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const AdminDashboard = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Helper function to safely format role for display
  const getDisplayRole = (role) => {
    if (!role) return 'Administrator';
    if (typeof role !== 'string') return 'Administrator';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // State management
  const [drawerOpen, setDrawerOpen] = useState(isDesktop);
  const [selectedContent, setSelectedContent] = useState("dashboard");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user data from session storage
  const userDatas = JSON.parse(sessionStorage.getItem('user'));

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };
  const handleLogoutConfirm = () => {
    logout();
    navigate("/");
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    handleProfileMenuClose();
  };
  // Close drawer when switching to mobile
  useEffect(() => {
    if (!isDesktop) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isDesktop]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin-dashboard`);
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare monthly activity data
  const prepareMonthlyData = () => {
    if (!dashboardData?.monthlyActivity) return [];
    
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // Initialize all months with 0 counts
    const monthlyData = months.map((name, index) => ({
      name,
      students: 0,
      staff: 0,
      month: index + 1 // Months are 1-indexed in the API
    }));
    
    // Update with actual data from API
    dashboardData.monthlyActivity.forEach(item => {
      const monthIndex = item.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        if (item.role === 'student') {
          monthlyData[monthIndex].students = item.count;
        } else if (item.role === 'staff') {
          monthlyData[monthIndex].staff = item.count;
        }
      }
    });
    
    return monthlyData;
  };

  const monthlyTrendData = prepareMonthlyData();

  const statsData = {
    students: dashboardData?.totalStudents || 0,
    staff: dashboardData?.totalStaff || 0,
    admins: dashboardData?.totalAdmins || 0,
    activeToday: dashboardData?.activeToday || 0,
    monthlyTrend: monthlyTrendData,
    userDistribution: dashboardData?.userDistribution || { students: "0", staff: "0" }
  };

  const handleMenuItemClick = (content) => {
    setSelectedContent(content);
    if (!isDesktop) setDrawerOpen(false);
  };

  // Handle logout function
  const handleLogout = () => {
    logout();
    navigate("/");
    setLogoutDialogOpen(false);
  };

  const sidebarMenuItems = [
    { 
      icon: <DashboardIcon />, 
      text: "Dashboard", 
      onClick: () => handleMenuItemClick("dashboard") 
    },
    { 
      icon: <PeopleIcon />, 
      text: "User Management", 
      onClick: () => handleMenuItemClick("users") 
    },
    { 
      icon: <SettingsIcon />, 
      text: "System Configuration", 
      onClick: () => handleMenuItemClick("config") 
    },
    { 
      icon: <AssignmentIcon />, 
      text: "Leave Requests", 
      onClick: () => handleMenuItemClick("leave-requests") 
    },
    { 
      icon: <AnalyticsIcon />, 
      text: "Device Logs", 
      onClick: () => handleMenuItemClick("analytics") 
    },
    { 
      icon: <HistoryIcon />, 
      text: "Deleted Users", 
      onClick: () => handleMenuItemClick("audit") 
    },
    { 
      icon: <BackupIcon />, 
      text: "Backup & Recovery", 
      onClick: () => handleMenuItemClick("backup") 
    },
  ];

  const renderDashboard = () => (
    <Container maxWidth="xl" sx={{ p: isSmallScreen ? 1 : 3 }}>
      <Typography variant="h5" gutterBottom sx={{ 
        mb: 3, 
        fontWeight: 600, 
        color: 'primary.main',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        Admin Dashboard Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={isSmallScreen ? 2 : 3} sx={{ mb: 4 }}>
        {/* Students Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
              borderRadius: '12px'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon
                  sx={{ 
                    fontSize: 40, 
                    mr: 2, 
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
                    borderRadius: '50%',
                    p: 1
                  }} 
                />
                
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Total Users</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {dashboardData?.totalUserscount || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {statsData.userDistribution.students}% of users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
              borderRadius: '12px'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <SchoolIcon 
                  sx={{ 
                    fontSize: 40, 
                    mr: 2, 
                    color: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: '50%',
                    p: 1
                  }} 
                />
                
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Total Students</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsData.students}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {statsData.userDistribution.students}% of users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Staff Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              borderLeft: `4px solid ${theme.palette.secondary.main}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
              borderRadius: '12px'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <GroupsIcon 
                  sx={{ 
                    fontSize: 40, 
                    mr: 2, 
                    color: theme.palette.secondary.main,
                    backgroundColor: theme.palette.secondary.light,
                    borderRadius: '50%',
                    p: 1
                  }} 
                />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Staff Members</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsData.staff}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {statsData.userDistribution.staff}% of users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Active Today Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              borderLeft: `4px solid ${theme.palette.success.main}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
              borderRadius: '12px'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: 40, 
                    mr: 2, 
                    color: theme.palette.success.main,
                    backgroundColor: theme.palette.success.light,
                    borderRadius: '50%',
                    p: 1
                  }} 
                />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Active Today</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsData.activeToday}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {dashboardData?.totalUserscount ? Math.round((statsData.activeToday / dashboardData.totalUserscount) * 100) : 0}% of total users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Admins Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              borderLeft: `4px solid ${theme.palette.warning.main}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
              borderRadius: '12px'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <SecurityIcon 
                  sx={{ 
                    fontSize: 40, 
                    mr: 2, 
                    color: theme.palette.warning.main,
                    backgroundColor: theme.palette.warning.light,
                    borderRadius: '50%',
                    p: 1
                  }} 
                />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Administrators</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsData.admins}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    System access
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={isSmallScreen ? 2 : 3}>
        <Grid item xs={12} md={8}>
          <Card 
            elevation={4} 
            sx={{ 
              height: '100%',
              width: '100%',
              mr: 5,
              borderRadius: '12px',
              boxShadow: theme.shadows[3],
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                Monthly User Activity
              </Typography>
              <Box sx={{ height: isSmallScreen ? 300 : 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={statsData.monthlyTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: 4,
                        boxShadow: theme.shadows[2]
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="students" 
                      fill={theme.palette.primary.main} 
                      name="Students" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="staff" 
                      fill={theme.palette.secondary.main} 
                      name="Staff" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              width: '100%',
              mr: 10,
              borderRadius: '12px',
              boxShadow: theme.shadows[3],
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                User Distribution
              </Typography>
              <Box sx={{ height: isSmallScreen ? 300 : 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Students", value: statsData.students },
                        { name: "Staff", value: statsData.staff },
                        { name: "Admins", value: statsData.admins },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={theme.palette.primary.main} />
                      <Cell fill={theme.palette.secondary.main} />
                      <Cell fill={theme.palette.warning.main} />
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value, 
                        `${props.payload.name}: ${(props.payload.percent * 100).toFixed(1)}%`
                      ]}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: 4,
                        boxShadow: theme.shadows[2]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  const renderActiveContent = () => {
    switch (selectedContent) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return <UserManagement />;
      case "analytics":
        return <Analytics />;
      case "audit":
        return <AuditLogs />;
      case "backup":
        return <BackupRecovery />;
      case "config":
        return <SystemConfig />;
      case "leave-requests":
        return <LeaveRequests />;
      default:
        return renderDashboard();
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
{/* App Bar */}
<AppBar 
  position="fixed" 
  sx={{ 
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    backgroundColor: '#1a237e',
  }}
>
  <Toolbar sx={{ 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: { xs: '0 8px', sm: '0 16px' }
  }}>
    {/* Left Section - Menu Button and Logo */}
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      minWidth: 0 // Allows text truncation
    }}>
      {/* Always show menu button on mobile, conditionally on desktop */}
      <IconButton
        edge="start"
        color="inherit"
        onClick={handleDrawerToggle}
        sx={{ 
          mr: { xs: 1, sm: 2 },
          display: { xs: 'flex', md: isDesktop ? 'none' : 'flex' }
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Logo - Hidden on extra small screens */}
      <Box
        component="img"
        src={collegeLogo}
        alt="College Logo"
        sx={{ 
          height: { xs: 40, md: 50 },
          mr: { xs: 1, sm: 2 },
          display: { xs: 'none', sm: 'block' }
        }}
      />
    </Box>

    {/* Center Section - Title */}
    <Typography 
      variant="h6"
      noWrap
      sx={{ 
        fontWeight: "bold", 
        letterSpacing: 1, 
        color: 'white',
        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        textAlign: 'center',
        flexGrow: 1,
        px: 1,
        mx: { xs: 0, sm: 2 },
        maxWidth: 'calc(100vw - 200px)', // Prevents overflow
        textOverflow: 'ellipsis',
        overflow: 'hidden'
      }}
    >
      ADMIN DASHBOARD
    </Typography>

    {/* Right Section - Profile */}
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      ml: { xs: 1, sm: 2 }
    }}>
      <IconButton 
        color="inherit" 
        onClick={() => setProfileDialogOpen(true)}
        sx={{ p: 0.5 }}
      >
       <Avatar 
  src={userDatas?.photo ? `data:image/jpeg;base64,${userDatas.photo}` : '/default-avatar.png'} 
  alt={userDatas?.name || 'User'} 
  sx={{ 
    width: { xs: 36, sm: 40, md: 44 }, 
    height: { xs: 36, sm: 40, md: 44 },
    border: `2px solid white`,
  }}
>
  {!userDatas?.photo && (userDatas?.name?.charAt(0) || 'A')}
</Avatar>
      </IconButton>
    </Box>
  </Toolbar>
</AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: 240, 
            boxSizing: "border-box",
            backgroundColor: '#1a237e',
            color: 'white',
            borderRight: 'none',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {isDesktop && (
          <Toolbar>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                pl: 2, 
                fontWeight: 600,
                color: 'white',
              }}
            >
              Admin Console
            </Typography>
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <ChevronLeft />
            </IconButton>
          </Toolbar>
        )}
        {!isDesktop && (
          <Toolbar>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                pl: 2, 
                fontWeight: 600,
                color: 'white',
              }}
            >
              Menu
            </Typography>
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <ChevronLeft />
            </IconButton>
          </Toolbar>
        )}
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
        
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <List>
            {sidebarMenuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={item.onClick}
                selected={selectedContent === item.text.toLowerCase().replace(/\s+/g, '')}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: selectedContent === item.text.toLowerCase().replace(/\s+/g, '') ? 600 : 500,
                    color: 'white'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* Logout Button - Fixed at the bottom */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
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
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: isDesktop ? `calc(100% - ${drawerOpen ? 240 : 0}px)` : '100%',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: '#f5f7fa',
        }}
      >
        <Toolbar />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
            <Box textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>Loading Dashboard Data...</Typography>
            </Box>
          </Box>
        ) : (
          renderActiveContent()
        )}
      </Box>

      {/* Profile Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={() => setProfileDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}>
          Admin Profile
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            mb: 2,
            p: 2,
          }}>
            <Avatar 
              src={userDatas?.photo ? `data:image/jpeg;base64,${userDatas.photo}` : '/default-avatar.png'} 
              alt={userDatas?.name || 'User'} 
              sx={{ 
                width: 120, 
                height: 120,
                border: `3px solid white`,
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'scale(1.08)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
            >
              {!userDatas?.photo && (userDatas?.name?.charAt(0) || 'A')}
            </Avatar>

            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {userDatas?.name || 'Admin User'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {userDatas?.email || 'admin@institute.edu'}
            </Typography>
          </Box>
          
          <Grid container spacing={2} sx={{ p: 2 }}>
            {/* <Grid item xs={12} sm={6}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  borderColor: theme.palette.divider,
                }}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  Last Login
                </Typography>
                <Typography variant="body1">
                  {userDatas?.loginLog?.date} {userDatas?.loginLog?.time}
                </Typography>
              </Paper>
            </Grid> */}

            <Grid item xs={12} sm={6}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  borderColor: theme.palette.divider,
                }}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  Role
                </Typography>
                <Typography variant="body1">
                  {getDisplayRole(userDatas?.role)}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  borderColor: theme.palette.divider,
                }}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  Total Users
                </Typography>
                <Typography variant="body1">
                  {dashboardData?.totalUserscount || 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setProfileDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
            }}
          >
            Close
          </Button>
          <Button 
            onClick={handleLogout} 
            color="error"
            variant="contained"
            startIcon={<LogoutIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Logout
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
    </Box>
  );
};

export default AdminDashboard;