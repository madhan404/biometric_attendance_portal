import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardHeader,
  Container,
  Chip,
  IconButton,
  Badge,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Fab,
  Skeleton,
  AppBar,
  Toolbar,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from "@mui/material";
import {
  WorkOutline as PresentIcon,
  CalendarToday as CalendarIcon,
  AssignmentTurnedIn as ActionIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  School as InternshipIcon,
  Assignment as ODIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Today as TodayIcon,
  BarChart as BarChartIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedIn from '@mui/icons-material/AssignmentTurnedIn';
import PieChartIcon from '@mui/icons-material/PieChart';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

// StatCard Component
const StatCard = ({ title, value, icon, color, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      elevation={4} 
      sx={{ 
        height: '100%',
        minHeight: isMobile ? 100 : 120,
        background: 'white',
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: isMobile ? 1.5 : 2 }}>
        <Box display="flex" alignItems="center">
          <Box sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            width: isMobile ? 40 : 50,
            height: isMobile ? 40 : 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            {React.cloneElement(icon, { 
              fontSize: isMobile ? 'medium' : 'large',
              color: color
            })}
          </Box>
          <Box>
            <Typography 
              variant={isMobile ? "caption" : "body1"} 
              color="textSecondary"
              sx={{ lineHeight: 1.2 }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} />
            ) : (
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 'bold', 
                  color: theme.palette.text.primary,
                  lineHeight: 1.2
                }}
              >
                {value}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Helper functions for status
const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return <ApprovedIcon color="success" fontSize="small" />;
    case "pending":
      return <PendingIcon color="warning" fontSize="small" />;
    case "rejected":
      return <RejectedIcon color="error" fontSize="small" />;
    default:
      return <PendingIcon color="warning" fontSize="small" />;
  }
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

// Determine overall status from request
const getOverallStatus = (request) => {
  if (request.principal_approval?.toLowerCase() === "rejected") {
    return "Rejected";
  }
  
  if (request.principal_approval?.toLowerCase() === "approved") {
    return "Approved";
  }
  
  return "Pending";
};

// Main Dashboard Component
const Dashboard = ({
  attendanceSummary,
  requestSummary,
  recentRequests,
  monthlyTrend,
  theme,
  isMobile,
  handleMenuItemClick
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [currentDate] = useState(new Date());
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const COLORS = ['#4CAF50', '#F44336', '#FFC107', '#2196F3'];

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Attendance Pie Data
  const attendancePieData = [
    { name: 'Present', value: attendanceSummary?.presentDays || 0 },
    { name: 'Absent', value: attendanceSummary?.absentDays || 0 },
    { name: 'Late', value: attendanceSummary?.lateArrivalDays || 0 },
    { name: 'OD', value: attendanceSummary?.odApproved || 0 },
    { name: 'Internship', value: attendanceSummary?.internshipDays || 0 },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: 'column' }}>
      {/* Header */}
      <Box component="main" sx={{ flexGrow: 0, p: isMobile ? 1 : 3, marginTop: isMobile ? '56px' : '64px' }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: isMobile ? 1 : 2 }}>
          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Attendance Summary Card */}
            <Grid item xs={12} md={8} sx={{ 
              mt: isMobile ? -13 : -19, 
              ml: isMobile ? 0 : -2, 
              mb: isMobile ? 2 : 10 
            }}>
              <Card elevation={4} sx={{ 
                borderRadius: 3, 
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", 
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)' 
                }, 
                height: '100%', 
                mt: -0.5,
                ml: -3,
                width: '100%',
                minHeight: isMobile ? 'auto' : 250 
              }}>
                <CardHeader 
                  title="Attendance Summary" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }} 
                  action={
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleMenuItemClick("personalAttendance")}>
                        <PieChartIcon />
                      </IconButton>
                    </Tooltip>
                  } 
                />
                <CardContent>
                  <Grid container spacing={isMobile ? 1 : 2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Total Attendance</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
                          <Box sx={{ position: 'relative', width: '100%' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={attendanceSummary?.overallPercentage || 0} 
                              sx={{ 
                                height: isMobile ? 20 : 30, 
                                borderRadius: 5, 
                                backgroundColor: theme.palette.grey[300] 
                              }} 
                            />
                          </Box>
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            bottom: 0, 
                            right: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Typography variant="caption" color="text.secondary">
                              {`${Math.round(attendanceSummary?.overallPercentage || 0)}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ mt: isMobile ? 1 : 2 }}>
                        <Grid container spacing={isMobile ? 1 : 1}>
                          <Grid item xs={6}>
                            <Paper sx={{ p: isMobile ? 0.5 : 1, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary">Present Days</Typography>
                              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                                {attendanceSummary?.presentDays || 0}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6}>
                            <Paper sx={{ p: isMobile ? 0.5 : 1, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary">Absent Days</Typography>
                              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                                {attendanceSummary?.absentDays || 0}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ResponsiveContainer width="100%" height={isMobile ? 150 : 150}>
                        <PieChart>
                          <Pie 
                            data={attendancePieData} 
                            cx="50%" 
                            cy="50%" 
                            labelLine={false} 
                            outerRadius={isMobile ? 50 : 60} 
                            fill="#8884d8" 
                            dataKey="value"
                          >
                            {attendancePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend 
                            layout={isMobile ? 'horizontal' : 'vertical'} 
                            verticalAlign={isMobile ? 'bottom' : 'middle'} 
                            align={isMobile ? 'center' : 'right'} 
                            wrapperStyle={{ fontSize: '12px' }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Grid>
                    {/* Request Statistics Section */}
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Request Summary</Typography>
                      <Paper sx={{ p: isMobile ? 1 : 1.5, bgcolor: theme.palette.background.default }}>
                        <Grid container spacing={isMobile ? 1 : 2}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: isMobile ? 0.5 : 1, borderRadius: 1, bgcolor: theme.palette.grey[100] }}>
                              <Typography variant="caption" color="text.secondary">Total Requests</Typography>
                              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                {requestSummary?.total || 0}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: isMobile ? 0.5 : 1, borderRadius: 1, bgcolor: theme.palette.grey[100] }}>
                              <Typography variant="caption" color="text.secondary">Approved</Typography>
                              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                                {requestSummary?.approved || 0}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: isMobile ? 0.5 : 1, borderRadius: 1, bgcolor: theme.palette.grey[100] }}>
                              <Typography variant="caption" color="text.secondary">Rejected</Typography>
                              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                                {requestSummary?.rejected || 0}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: isMobile ? 0.5 : 1, borderRadius: 1, bgcolor: theme.palette.grey[100] }}>
                              <Typography variant="caption" color="text.secondary">Pending</Typography>
                              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                                {requestSummary?.pending || 0}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: isMobile ? 0.5 : 1, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={<AssignmentTurnedIn fontSize="small" />} 
                          label={`OD: ${attendanceSummary?.odApproved || 0}`} 
                          color="primary" 
                          size={isMobile ? "small" : "medium"} 
                        />
                        <Chip 
                          icon={<RejectedIcon fontSize="small" />} 
                          label={`Absent: ${attendanceSummary?.absentDays || 0}`} 
                          color="error" 
                          size={isMobile ? "small" : "medium"} 
                        />
                        <Chip 
                          icon={<ApprovedIcon fontSize="small" />} 
                          label={`Present: ${attendanceSummary?.presentDays || 0}`} 
                          color="success" 
                          size={isMobile ? "small" : "medium"} 
                        />
                        <Chip 
                          icon={<PendingIcon fontSize="small" />} 
                          label={`Late: ${attendanceSummary?.lateArrivalDays || 0}`} 
                          color="warning" 
                          size={isMobile ? "small" : "medium"} 
                        />
                        <Chip 
                          icon={<InternshipIcon fontSize="small" />} 
                          label={`Internship: ${attendanceSummary?.internshipDays || 0}`} 
                          color="secondary" 
                          size={isMobile ? "small" : "medium"} 
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Recent Requests Card */}
            <Grid item xs={12} md={4} sx={{ 
              mt: isMobile ? 0 : -10, 
              ml: isMobile ? 0 : -2, 
              mb: isMobile ? 2 : 10 
            }}>
              <Card elevation={4} sx={{ 
                borderRadius: 3, 
                height: '100%',  
                mt: -1,
                ml: -3,
                mr: 5,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", 
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)' 
                } 
              }}>
                <CardHeader 
                  title="Recent Requests" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }} 
                  action={
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Add New Request">
                        <IconButton onClick={() => handleMenuItemClick("leaveRequestForm")}>
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View All">
                        <IconButton onClick={() => handleMenuItemClick("leaveApprovalStatus")}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  } 
                />
                <CardContent sx={{ 
                  pt: 0,
                  flex: 1,
                  overflow: 'hidden',
                  '&.MuiCardContent-root': {
                    paddingBottom: 0
                  }
                }}>
                  <TableContainer sx={{ 
                    height: '100%',
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
                    <Table size={isMobile ? "small" : "medium"} stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ px: isMobile ? 1 : 2 }}>S.No</TableCell>
                          <TableCell sx={{ px: isMobile ? 1 : 2 }}>Type</TableCell>
                          <TableCell sx={{ px: isMobile ? 1 : 2 }}>Date</TableCell>
                          <TableCell sx={{ px: isMobile ? 1 : 2 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(recentRequests || []).slice(0, isMobile ? 3 : 4).map((request, idx) => (
                          <TableRow key={request.request_id || idx}>
                            <TableCell sx={{ px: isMobile ? 1 : 2 }}>{idx + 1}</TableCell>
                            <TableCell sx={{ px: isMobile ? 1 : 2 }}>{request.request_type || '-'}</TableCell>
                            <TableCell sx={{ px: isMobile ? 1 : 2 }}>
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell sx={{ px: isMobile ? 1 : 2 }}>
                              <Chip
                                size={isMobile ? "small" : "medium"}
                                label={getOverallStatus(request)}
                                color={getStatusColor(getOverallStatus(request))}
                                icon={getStatusIcon(getOverallStatus(request))}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Holidays Card */}
            <Grid item xs={12} md={4} sx={{ 
              mt: isMobile ? 0 : -10, 
              ml: isMobile ? 0 : -2, 
              mb: isMobile ? 2 : 10 
            }}>
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
                        onClick={fetchHolidays}
                        sx={{ color: 'white' }}
                      >
                        <RefreshIcon />
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
            
            {/* Monthly Attendance Trend */}
            <Grid item xs={12} sx={{ 
              mt: isMobile ? 0 : -10, 
              ml: isMobile ? 0 : -2, 
              mb: isMobile ? 2 : 10
            }}>
              <Card elevation={4} sx={{ 
                borderRadius: 3, 
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", 
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)' 
                }, 
                height: '100%', 
                minHeight: isMobile ? 300 : 350, 
                width: '100%',
                mr: 10, 
                mt: -1,
                ml: -3
              }}>
                <CardHeader 
                  title="Monthly Attendance Trend" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }} 
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={isMobile ? 250 : 250}>
                    <BarChart data={monthlyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar 
                        dataKey={data => (data.statistics.presentDays / data.statistics.workingDays * 100) || 0} 
                        name="Present %" 
                        fill="#4CAF50" 
                      />
                      <Bar 
                        dataKey={data => (data.statistics.absentDays / data.statistics.workingDays * 100) || 0} 
                        name="Absent %" 
                        fill="#F44336" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Logout Dialog */}
      <Dialog 
        open={logoutDialogOpen} 
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          color: theme.palette.primary.main,
          py: isMobile ? 1 : 2
        }}>
          <Typography variant={isMobile ? "h6" : "h5"}>
            Confirm Logout
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: isMobile ? 1 : 2,
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <Avatar
              src={user.photo}
              alt="Student Photo"
              sx={{ 
                width: isMobile ? 60 : 60, 
                height: isMobile ? 60 : 60, 
                mr: isMobile ? 0 : 2,
                mb: isMobile ? 1 : 0
              }}
            />
            <Typography variant={isMobile ? "body1" : "body1"}>
              Are you sure you want to logout, <strong>{user.student_name?.split(' ')[0] || 'Student'}</strong>?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 1 : 2 }}>
          <Button 
            onClick={() => setLogoutDialogOpen(false)} 
            color="primary" 
            variant="outlined"
            sx={{ mr: 1 }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              sessionStorage.removeItem("user");
              navigate("/");
            }} 
            color="primary" 
            variant="contained"
            startIcon={<LogoutIcon />}
            size={isMobile ? "small" : "medium"}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;