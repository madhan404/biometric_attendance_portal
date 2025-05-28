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
    <Card sx={{ mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <IconButton onClick={onClose} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box flexGrow={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" component="div">
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
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                border: `3px solid ${
                  student.attendancePercentage < 75 ? '#f44336' :
                  student.attendancePercentage < 85 ? '#ff9800' : '#4caf50'
                }`
              }} 
              src={student.avatar} 
              alt={student.name} 
            />
            <Typography variant="h6" align="center">{student.name}</Typography>
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
          
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
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
                        <strong>Year:</strong> {student.year}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon fontSize="small" /> Academic Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2">
                        <strong>Attendance:</strong> {student.attendancePercentage}%
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> {student.status}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>

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

const StudentsList = () => {
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
  const [classAdvisorSinNumber, setClassAdvisorSinNumber] = useState(null);
  
  useEffect(() => {
    // Get class advisor's sin_number from session storage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setClassAdvisorSinNumber(parsedUser.sin_number);
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!classAdvisorSinNumber) {
          showSnackbar('Class Advisor information not available', 'error');
          return;
        }

        // Fetch students list
        const response = await axios.get(`${API_BASE_URL}/classadvisor/students/${classAdvisorSinNumber}`);
        
        if (response.data.status === "success") {
          // Process students data and fetch attendance for each student
          const processedStudents = await Promise.all(
            response.data.students.map(async (student) => {
              try {
                // Fetch attendance data for each student using the same endpoint structure as mentor
                const attendanceResponse = await axios.get(
                  `${API_BASE_URL}/classadvisor/student-attendance?sin_number=${classAdvisorSinNumber}&search=${student.sin_number}`
                );

                // Find the specific student's attendance data from the response
                const studentAttendanceData = attendanceResponse.data.data.find(
                  data => data.sin_number === student.sin_number
                );

                return {
                  id: student.id,
                  rollNumber: student.sin_number,
                  name: student.name,
                  email: student.email,
                  phone: student.phone,
                  department: student.department,
                  batch: student.batch,
                  year: student.year,
                  attendancePercentage: studentAttendanceData?.attendancePercentage || 0,
                  status: studentAttendanceData?.status || 'absent',
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
          
          setStudents(processedStudents);
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
    
    if (classAdvisorSinNumber) {
      fetchStudents();
    }
  }, [classAdvisorSinNumber]);
  
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
      // Prepare data for export
      const exportData = filteredStudents.map(student => ({
        'Roll Number': student.rollNumber,
        'Name': student.name,
        'Email': student.email,
        'Phone': student.phone,
        'Department': student.department,
        'Batch': student.batch,
        'Year': student.year,
        'Attendance (%)': student.attendancePercentage,
        'Status': student.attendancePercentage < 75 ? 'Critical' : 
                 student.attendancePercentage < 85 ? 'Warning' : 'Good'
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      
      // Generate file and download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `students_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
      
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
    
    if (type === 'excel') {
      exportToCSV();
    }
  };

  // Calculate responsive margins
  const getContainerMargins = () => {
    if (isMobile) return { ml: -2, mt: -2 };
    if (isTablet) return { ml: -4, mt: -4 };
    return { ml: -35, mt: -25 };
  };

  const containerMargins = getContainerMargins();

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 3,
      ...containerMargins,
      width: 'calc(100% + 48px)',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      {selectedStudent ? (
        <StudentDetailCard student={selectedStudent} onClose={handleCloseDetail} />
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
            <Box mb={isMobile ? 2 : 0}>
              <Typography variant="h4" component="h1">
                My Students
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {students.length} students under your guidance
              </Typography>
            </Box>
            
            <Box display="flex" gap={1} mt={10}> 
              <Tooltip title="Export to Excel">
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('excel')}
                  color="secondary"
                  disabled={exporting || filteredStudents.length === 0}
                  size={isMobile ? 'small' : 'medium'}
                >
                  {exporting ? 'Exporting...' : 'Export'}
                </Button>
              </Tooltip>
            </Box>
          </Box>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
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
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={8}>
                  <Box display="flex" gap={1} justifyContent={isMobile ? 'flex-start' : 'flex-end'} flexWrap="wrap">
                    <Button
                      variant={filter === 'all' ? 'contained' : 'outlined'}
                      onClick={() => setFilter('all')}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === 'critical' ? 'contained' : 'outlined'}
                      color="error"
                      onClick={() => setFilter('critical')}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Critical
                    </Button>
                    <Button
                      variant={filter === 'warning' ? 'contained' : 'outlined'}
                      color="warning"
                      onClick={() => setFilter('warning')}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Warning
                    </Button>
                    <Button
                      variant={filter === 'good' ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => setFilter('good')}
                      size={isMobile ? 'small' : 'medium'}
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
            <Card variant="outlined">
              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Roll No.</TableCell>
                      {!isMobile && (
                        <>
                          <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Year</TableCell>
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
                          <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={student.avatar} alt={student.name} />
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
                              <TableCell>{student.year}</TableCell>
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
                              size={isMobile ? 'small' : 'medium'}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isMobile ? 4 : 7} align="center" sx={{ py: 4 }}>
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
              Click on any student row to view detailed information
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

export default StudentsList;