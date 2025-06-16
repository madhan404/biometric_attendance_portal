import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  MoreVert as MoreIcon,
  ArrowBack as BackIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

// Custom styled components
const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  backgroundColor: 
    status === 'critical' ? theme.palette.error.light :
    status === 'warning' ? theme.palette.warning.light :
    theme.palette.success.light,
  color: 
    status === 'critical' ? theme.palette.error.contrastText :
    status === 'warning' ? theme.palette.warning.contrastText :
    theme.palette.success.contrastText,
}));

const AttendanceProgress = ({ value }) => {
  let color;
  if (value < 75) color = 'error';
  else if (value < 85) color = 'warning';
  else color = 'success';

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{ width: '100%', height: 8, borderRadius: 5 }}
      />
      <Typography variant="body2" color="text.secondary">
        {Math.round(value)}%
      </Typography>
    </Box>
  );
};

const StudentDetailCard = ({ student, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleAction = (action) => {
    let message = '';
    let severity = 'success';
    
    switch(action) {
      case 'Send Message':
        message = `Message sent to ${student.name}`;
        break;
      case 'View Performance':
        message = `Opening performance details for ${student.name}`;
        break;
      default:
        message = `${action} action performed for ${student.name}`;
    }
    
    if (action.includes('Flag') || action.includes('Critical')) {
      severity = 'warning';
    }
    
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    handleMenuClose();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 3, width: '100%', maxWidth: '100%', overflow: 'visible' }}>
      <CardContent sx={{ padding: isMobile ? 1 : 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <IconButton onClick={onClose} sx={{ mr: 1 }}>
            <BackIcon />
          </IconButton>
          <Box flexGrow={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant={isMobile ? "h6" : "h5"} component="div">
                Student Details
              </Typography>
              <div>
                <Tooltip title="More actions">
                  <IconButton onClick={handleMenuOpen}>
                    <MoreIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={isMobile ? 1 : 3}>
          <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: isMobile ? 80 : 120, 
                height: isMobile ? 80 : 120, 
                mb: 2,
                border: `3px solid ${
                  student.attendancePercentage < 75 ? '#f44336' :
                  student.attendancePercentage < 85 ? '#ff9800' : '#4caf50'
                }`
              }} 
              src={student.avatar} 
              alt={student.name} 
            />
            <Typography variant={isMobile ? "h6" : "h5"} align="center">{student.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">{student.rollNumber}</Typography>
            <Chip
              label={student.department}
              size="medium"
              sx={{ mt: 1, px: 1 }}
              color="primary"
              variant="outlined"
            />
            <StatusBadge
              label={
                student.attendancePercentage < 75 ? 'Critical' : 
                student.attendancePercentage < 85 ? 'Warning' : 'Good'
              }
              status={
                student.attendancePercentage < 75 ? 'critical' : 
                student.attendancePercentage < 85 ? 'warning' : 'good'
              }
              sx={{ mt: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={8} md={9}>
            <Grid container spacing={isMobile ? 1 : 2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" /> Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2">
                        <strong>Email:</strong> {student.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {student.phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Batch:</strong> {student.batch}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Semester:</strong> {student.semester}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Attendance:</strong> {student.attendancePercentage}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon fontSize="small" /> Academic Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2">
                        <strong>CGPA:</strong> {student.cgpa}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Backlogs:</strong> {student.backlogs}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Last Meeting:</strong> {student.lastMeeting}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>

      {/* <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('Send Message')}>
          <EmailIcon sx={{ mr: 1 }} /> Send Message
        </MenuItem>
        <MenuItem onClick={() => handleAction('View Performance')}>
          <AssignmentIcon sx={{ mr: 1 }} /> View Performance
        </MenuItem>
        <MenuItem onClick={() => handleAction('Schedule Meeting')}>
          <CalendarIcon sx={{ mr: 1 }} /> Schedule Meeting
        </MenuItem>
        <MenuItem onClick={() => handleAction('Flag for Review')}>
          <WarningIcon sx={{ mr: 1 }} /> Flag for Review
        </MenuItem>
      </Menu> */}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            warning: <WarningIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
          }}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

const MenteesList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [mentorSinNumber, setMentorSinNumber] = useState(null);
  
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setMentorSinNumber(parsedUser.sin_number);
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!mentorSinNumber) {
          showSnackbar('Mentor information not available', 'error');
          return;
        }

        const menteesResponse = await axios.get(`${API_BASE_URL}/mentor/mentees/${mentorSinNumber}`);
        
        if (menteesResponse.data.status === "success") {
          const menteesWithAttendance = await Promise.all(
            menteesResponse.data.mentees.map(async (student) => {
              try {
                const attendanceResponse = await axios.get(
                  `${API_BASE_URL}/mentor/student-attendance?sin_number=${mentorSinNumber}&search=${student.sin_number}`
                );
                
                const attendanceData = attendanceResponse.data.data.find(
                  s => s.sin_number === student.sin_number
                );

                return {
                  id: student.id,
                  rollNumber: student.sin_number,
                  name: student.name,
                  email: student.email,
                  phone: student.phone,
                  department: student.department,
                  batch: student.batch,
                  semester: student.year,
                  cgpa: '0',
                  backlogs: '0',
                  attendancePercentage: attendanceData?.attendancePercentage || 0,
                  status: attendanceData?.status || 'absent',
                  lastMeeting: 'Not recorded',
                  avatar: student.photo ? `data:image/jpeg;base64,${student.photo}` : '/default-avatar.png'
                };
              } catch (error) {
                console.error(`Error fetching attendance for ${student.sin_number}:`, error);
                return {
                  ...student,
                  attendancePercentage: 0,
                  status: 'absent'
                };
              }
            })
          );
          
          setStudents(menteesWithAttendance);
        } else {
          showSnackbar('Failed to load student data', 'error');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        showSnackbar(error.response?.data?.message || 'Failed to load student data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (mentorSinNumber) {
      fetchStudents();
    }
  }, [mentorSinNumber]);
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'critical' && student.attendancePercentage < 75) ||
                         (filter === 'warning' && student.attendancePercentage >= 75 && student.attendancePercentage < 85) ||
                         (filter === 'good' && student.attendancePercentage >= 85);
    
    return matchesSearch && matchesFilter;
  });
  
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };
  
  const handleCloseDetail = () => {
    setSelectedStudent(null);
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const exportToCSV = () => {
    setExporting(true);
    
    try {
      const exportData = filteredStudents.map(student => ({
        'Roll Number': student.rollNumber,
        'Name': student.name,
        'Email': student.email,
        'Phone': student.phone,
        'Department': student.department,
        'Batch': student.batch,
        'Semester': student.semester,
        'CGPA': student.cgpa,
        'Backlogs': student.backlogs,
        'Attendance (%)': student.attendancePercentage,
        'Status': student.attendancePercentage < 75 ? 'Critical' : 
                 student.attendancePercentage < 85 ? 'Warning' : 'Good',
        'Last Meeting': student.lastMeeting
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Mentees');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `mentees_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
      
      saveAs(data, fileName);
      showSnackbar('Export completed successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      showSnackbar('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };
  
  const handleExport = (type = 'excel') => {
    if (filteredStudents.length === 0) {
      showSnackbar('No data to export', 'warning');
      return;
    }
    
    exportToCSV();
  };

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3, 
      width: '100%',
      mt: isMobile ? 2 : -25,
      ml: isMobile ? 0 : -30,
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      {selectedStudent ? (
        <StudentDetailCard student={selectedStudent} onClose={handleCloseDetail} />
      ) : (
        <>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems={isMobile ? 'flex-start' : 'center'} 
            mb={3} 
            
            flexDirection={isMobile ? 'column' : 'row'}
            gap={isMobile ? 2 : 0}
          >
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
                My Mentees
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {students.length} students under your guidance
              </Typography>
            </Box>
            
            <Box display="flex" gap={1} mt={isMobile ? 1 : 0}>
              <Tooltip title="Export to Excel">
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('excel')}
                  color="secondary"
                  disabled={exporting || filteredStudents.length === 0}
                  size={isMobile ? "small" : "medium"}
                >
                  {exporting ? 'Exporting...' : 'Export'}
                </Button>
              </Tooltip>
            </Box>
          </Box>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by name or roll number..."
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={8}>
                  <Box 
                    display="flex" 
                    gap={1} 
                    justifyContent={isMobile ? 'flex-start' : 'flex-end'} 
                    flexWrap="wrap"
                  >
                    <Button
                      variant={filter === 'all' ? 'contained' : 'outlined'}
                      onClick={() => setFilter('all')}
                      size={isMobile ? "small" : "medium"}
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === 'critical' ? 'contained' : 'outlined'}
                      color="error"
                      onClick={() => setFilter('critical')}
                      size={isMobile ? "small" : "medium"}
                    >
                      Critical
                    </Button>
                    <Button
                      variant={filter === 'warning' ? 'contained' : 'outlined'}
                      color="warning"
                      onClick={() => setFilter('warning')}
                      size={isMobile ? "small" : "medium"}
                    >
                      Warning
                    </Button>
                    <Button
                      variant={filter === 'good' ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => setFilter('good')}
                      size={isMobile ? "small" : "medium"}
                    >
                      Good
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress />
            </Box>
          ) : (
            <Card variant="outlined" sx={{ width: '100%', overflowX: 'auto' }}>
              <TableContainer>
                <Table sx={{ minWidth: isMobile ? 600 : '100%' }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Roll No.</TableCell>
                      {!isMobile && (
                        <>
                          <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Semester</TableCell>
                        </>
                      )}
                      <TableCell sx={{ fontWeight: 'bold' }}>Attendance</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow 
                          key={student.id} 
                          onClick={() => handleStudentClick(student)}
                          hover
                          sx={{ 
                            height: '100%',
                            '&:last-child td, &:last-child th': { border: 0 },
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover
                            }
                          }}
                        >
                          <TableCell sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
                            <Avatar 
                              src={student.avatar} 
                              alt={student.name} 
                              sx={{ width: isMobile ? 40 : 56, height: isMobile ? 40 : 56 }}
                            />
                            <Box>
                              <Typography fontWeight="medium">{student.name}</Typography>
                              {!isMobile && (
                                <Typography variant="body2" color="text.secondary">
                                  {student.email}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          {!isMobile && (
                            <>
                              <TableCell>{student.department}</TableCell>
                              <TableCell>{student.semester}</TableCell>
                            </>
                          )}
                          <TableCell>
                            <AttendanceProgress value={student.attendancePercentage} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              label={
                                student.attendancePercentage < 75 ? 'Critical' : 
                                student.attendancePercentage < 85 ? 'Warning' : 'Good'
                              }
                              status={
                                student.attendancePercentage < 75 ? 'critical' : 
                                student.attendancePercentage < 85 ? 'warning' : 'good'
                              }
                              size={isMobile ? "small" : "medium"}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isMobile ? 4 : 6} align="center" sx={{ py: 4 }}>
                          <Box display="flex" flexDirection="column" alignItems="center">
                            <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">
                              No students found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Try adjusting your search or filter criteria
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
          
          {!isMobile && filteredStudents.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Click on any student row to view detailed information and take actions
            </Typography>
          )}
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            warning: <WarningIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
          }}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MenteesList;