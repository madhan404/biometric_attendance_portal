import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Chip,
  Avatar,
  useTheme,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  CardHeader,
  useMediaQuery,
  Fab,
  InputAdornment
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  LineChart,
  Line
} from "recharts";
import {
  Person as UserIcon,
  Check as CheckIcon,
  Close as XIcon,
  CalendarToday as CalendarIcon,
  FileDownload as DownloadIcon,
  FilterAlt as FilterIcon,
  Today as TodayIcon,
  School as SchoolIcon,
  Summarize as SummarizeIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Groups as DepartmentsIcon
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import * as XLSX from "xlsx";
import { green, red, orange, blue, purple, pink, grey, teal, indigo, deepPurple } from "@mui/material/colors";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

// Constants
const departments = ["All","Agricultural Engineering", "Computer Science and Engineering","Biomedical Engineering","Electrical and Communication Engineering", "Artificial Intelligence and Data Science", "Mechanical Engineering", "Cybersecurity", "Information Technology"];

// Color Scheme
const COLORS = {
  present: green[700],
  absent: red[500],
  od: deepPurple[500],
  permission: orange[500],
  chartBackground: '#f5f7fa',
  chartGrid: '#e0e0e0',
  firstYear: indigo[500],
  secondYear: teal[800],
  thirdYear: orange[800],
  fourthYear: grey[600],
  totalStaff: grey[700]
};

const statusColors = {
  present: COLORS.present,
  absent: COLORS.absent,
  od: COLORS.od,
  permission: COLORS.permission
};

const statusLightColors = {
  present: teal[100],
  absent: red[100],
  od: deepPurple[100],
  permission: orange[100]
};

const statusIcons = {
  present: <CheckIcon fontSize="small" sx={{ color: teal[500] }} />,
  absent: <XIcon fontSize="small" sx={{ color: red[500] }} />,
  od: <CalendarIcon fontSize="small" sx={{ color: deepPurple[500] }} />,
  permission: <UserIcon fontSize="small" sx={{ color: orange[500] }} />,
};

const periodLabels = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const weekNumbers = [1, 2, 3, 4, 5];

const getCurrentMonth = () => months[new Date().getMonth()];
const getCurrentYear = () => new Date().getFullYear();

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, od: 0, permission: 0 });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [overallAttendancePercentage, setOverallAttendancePercentage] = useState("0.0");
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [staffTableData, setStaffTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showTableView, setShowTableView] = useState(false);
  const [totalStaff, setTotalStaff] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Get college from session storage
  const getCollege = () => {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    return userData?.college || 'Engineering';
  };

  // Fetch total staff count
  const fetchTotalStaff = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/principal/staff-attendance/total-staff`, {
        params: { college: getCollege() }
      });
      if (response.data.success) {
        setTotalStaff(response.data.total);
      }
    } catch (err) {
      console.error('Error fetching total staff:', err);
    }
  };

  // Fetch attendance data for summary and chart
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "";
      let params = { college: getCollege() };
      if (selectedDepartment !== "All") params.department = selectedDepartment;
      if (viewMode === "daily") {
        url = `${API_BASE_URL}/principal/staff-attendance/staff-daily-attendance`;
        params.date = format(selectedDate, 'yyyy-MM-dd');
      } else if (viewMode === "weekly") {
        url = `${API_BASE_URL}/principal/staff-attendance/staff-weekly-attendance`;
        params.month = selectedMonth;
        params.weekNumber = selectedWeek;
      } else if (viewMode === "monthly") {
        url = `${API_BASE_URL}/principal/staff-attendance/staff-monthly-attendance`;
        params.year = selectedYear;
        params.month = selectedMonth;
      }
      const response = await axios.get(url, { params });
      if (response.data.success) {
        setAttendanceStats(response.data.overallStats);
        setDepartmentStats(response.data.departmentStats);
        setTimeSeriesData(
          Object.entries(response.data.departmentStats || {}).map(([name, stats]) => ({
            name,
            present: stats.present,
            absent: stats.absent,
            od: stats.od,
            permission: stats.permission
          }))
        );
        
        // Calculate overall attendance percentage correctly
        const totalPresent = response.data.overallStats.present || 0;
        const totalOD = response.data.overallStats.od || 0;
        const totalAbsent = response.data.overallStats.absent || 0;
        const totalPermission = response.data.overallStats.permission || 0;
        const totalStaff = totalPresent + totalAbsent + totalOD + totalPermission;
        
        setOverallAttendancePercentage(
          totalStaff > 0 ? ((totalPresent + totalOD) / totalStaff * 100).toFixed(1) : "0.0"
        );
      } else {
        setAttendanceStats({ present: 0, absent: 0, od: 0, permission: 0 });
        setDepartmentStats([]);
        setTimeSeriesData([]);
        setOverallAttendancePercentage("0.0");
      }
    } catch (err) {
      setAttendanceStats({ present: 0, absent: 0, od: 0, permission: 0 });
      setDepartmentStats([]);
      setTimeSeriesData([]);
      setOverallAttendancePercentage("0.0");
      setError("Failed to fetch staff attendance data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff table data
  const fetchStaffTableData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        college: getCollege(),
        date: format(selectedDate, 'yyyy-MM-dd'),
      };
      if (selectedDepartment !== "All") params.department = selectedDepartment;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (searchValue) params.search = searchValue;
      const response = await axios.get(`${API_BASE_URL}/principal/staff-attendance/staff-table`, { params });
      if (response.data.success) {
        setStaffTableData(response.data.data);
      } else {
        setStaffTableData([]);
      }
    } catch (err) {
      setStaffTableData([]);
      setError("Failed to fetch staff table data");
    } finally {
      setLoading(false);
    }
  };

  // Always fetch summary/chart data for all views
  useEffect(() => {
    fetchTotalStaff();
    fetchAttendanceData();
  }, [viewMode, selectedDate, selectedDepartment, selectedStatus, selectedMonth, selectedYear, selectedWeek]);

  // Always fetch staff table data in daily view when table is visible or when relevant filters change
  useEffect(() => {
    if (viewMode === 'daily' && showTableView) {
      fetchStaffTableData();
    }
    // Optionally, clear table data when not in daily view or table is hidden
    if (viewMode !== 'daily' || !showTableView) {
      setStaffTableData([]);
    }
  }, [viewMode, selectedDate, selectedDepartment, selectedStatus, searchValue, showTableView]);

  // Filter staff list by status and department
  const staffList = useMemo(
    () => selectedStatus === "all" 
      ? staffTableData
      : staffTableData.filter(s => s.status === selectedStatus),
    [staffTableData, selectedStatus]
  );

  // Calculate total staff for the selected range (week/month)
  const totalStaffForRange = useMemo(() => {
    if (!departmentStats || typeof departmentStats !== 'object') return 0;
    return Object.values(departmentStats).reduce((sum, dept) => sum + (dept.total || 0), 0);
  }, [departmentStats]);

  const present = attendanceStats.present || 0;
  const absent = attendanceStats.absent || 0;
  const od = attendanceStats.od || 0;
  const permission = attendanceStats.permission || 0;

  const getPercent = (num) => totalStaffForRange > 0 ? ((num / totalStaffForRange) * 100).toFixed(1) : 0;
  const overallAttendance = parseFloat(overallAttendancePercentage);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleTabChange = (event, newValue) => {
    setViewMode(newValue);
    if (newValue === 'weekly') {
      setSelectedMonth(getCurrentMonth());
      setSelectedWeek(1);
    } else if (newValue === 'monthly') {
      setSelectedMonth(getCurrentMonth());
      setSelectedYear(getCurrentYear());
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const exportToExcel = (dataType) => {
    try {
      let dataToExport = [];
      let fileName = "";
      
      if (dataType === "stats") {
        const statsData = Object.entries(attendanceStats).map(([key, value]) => ({
          Category: key,
          Count: value,
          Percentage: `${getPercent(value)}%`
        }));
        dataToExport = statsData;
        fileName = `Staff_Attendance_Statistics_${selectedDepartment}_${viewMode}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      } else if (dataType === "staff") {
        dataToExport = staffList.map(staff => ({
          ID: staff.sin_number,
          Name: staff.name,
          Status: staff.status,
          Department: staff.department,
          'Attendance Percentage': staff.attendancePercentage
        }));
        fileName = `Staff_List_${selectedDepartment}_${selectedStatus === 'all' ? 'All' : selectedStatus}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      } else if (dataType === "chart") {
        dataToExport = timeSeriesData;
        fileName = `Staff_Attendance_Trend_${selectedDepartment}_${viewMode}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      }

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, fileName);
      
      showSnackbar('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showSnackbar('Failed to export data', 'error');
    }
  };

  const renderDatePicker = () => {
    const commonProps = {
      value: selectedDate,
      onChange: handleDateChange,
      renderInput: (params) => (
        <TextField
          {...params}
          size="small"
          fullWidth
        />
      ),
    };

    switch (viewMode) {
      case "daily":
        return <DatePicker label="Select Date" {...commonProps} />;
      case "weekly":
        return <DatePicker label="Select Week" views={["year", "month"]} {...commonProps} />;
      case "monthly":
        return <DatePicker label="Select Month" views={["year", "month"]} openTo="month" {...commonProps} />;
      default:
        return null;
    }
  };

  const DailySummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
          '&:hover': { 
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Staff
            </Typography>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={700}>
              {totalStaffForRange}
            </Typography>
            <Typography variant="body2">
              {selectedDepartment === "All" ? "All Departments" : `Department: ${selectedDepartment}`}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {['present', 'absent', 'od', 'permission'].map((key) => (
        <Grid item xs={12} md={6} lg={3} key={key}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${statusLightColors[key]} 0%, ${statusColors[key]} 100%)`,
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                {statusIcons[key]}
                <Typography
                  fontWeight="600"
                  fontSize={isMobile ? '0.9rem' : '1rem'}
                  ml={1}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Typography>
              </Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                fontWeight="bold"
              >
                {key === 'present' ? present : key === 'absent' ? absent : key === 'od' ? od : attendanceStats.permission}
              </Typography>
              <Typography fontSize={isMobile ? '0.8rem' : '0.95rem'}>
                {getPercent(key === 'present' ? present : key === 'absent' ? absent : key === 'od' ? od : attendanceStats.permission)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${grey[600]} 0%, ${grey[500]} 100%)`,
          color: 'white',
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
          '&:hover': { 
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Overall Attendance
            </Typography>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={700}>
              {overallAttendance}%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={overallAttendance} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: `${blue[100]}50`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: overallAttendance > 85 ? 
                        green[700] : overallAttendance > 70 ? 
                        orange[500] : red[500],
                      borderRadius: 4
                    }
                  }} 
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const WeeklyMonthlySummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
          '&:hover': { 
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Staff
            </Typography>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={700}>
              {totalStaffForRange}
            </Typography>
            <Typography variant="body2">
              {selectedDepartment === "All" ? "All Departments" : `Department: ${selectedDepartment}`}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${grey[600]} 0%, ${grey[500]} 100%)`,
          color: 'white',
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
          '&:hover': { 
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Overall Attendance
            </Typography>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={700}>
              {overallAttendance}%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={overallAttendance} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: `${blue[100]}50`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: overallAttendance > 85 ? 
                        green[700] : overallAttendance > 70 ? 
                        orange[500] : red[500],
                      borderRadius: 4
                    }
                  }} 
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const TimeSeriesChart = () => (
    <Card sx={{ 
      mb: 3,
      borderRadius: 3,
      transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
      '&:hover': { 
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }
    }}>
      <CardHeader
        title={`${selectedDepartment === "All" ? "Overall" : selectedDepartment} Staff Attendance Trend (${periodLabels[viewMode]})`}
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        action={
          <Box>
            <Tooltip title="Export Chart Data">
              <IconButton onClick={() => exportToExcel("chart")}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            {viewMode === 'daily' && (
              <Tooltip title="Toggle View">
                <IconButton onClick={() => setShowTableView(!showTableView)}>
                  {showTableView ? <BarChartIcon /> : <TableChartIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeSeriesData}
              margin={{ top: 16, right: 24, left: -8, bottom: 4 }}
              barSize={isMobile ? 20 : 30}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} />
              <XAxis 
                dataKey="name" 
                fontSize={isMobile ? 12 : 14} 
                stroke="#5f6368" 
                tick={{ fill: '#5f6368' }}
              />
              <YAxis 
                fontSize={isMobile ? 12 : 13} 
                stroke="#5f6368" 
                tick={{ fill: '#5f6368' }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e3e3e3",
                  boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: "#3f51b5", fontWeight: 'bold' }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '10px'
                }}
              />
              <Bar 
                dataKey="present" 
                name="Present" 
                fill={COLORS.present}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="absent" 
                name="Absent" 
                fill={COLORS.absent}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="od" 
                name="OD" 
                fill={COLORS.od}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="permission" 
                name="Permission" 
                fill={COLORS.permission}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const StaffTableView = () => (
    <Card sx={{ 
      mb: 3,
      borderRadius: 3,
      transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
      '&:hover': { 
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Staff Attendance Details
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by SIN Number"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') fetchStaffTableData(); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                label="Department"
                onChange={(e) => setSelectedDepartment(e.target.value)}
                startAdornment={<DepartmentsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />}
              >
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Filter by Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="all">All Staff</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="od">OD</MenuItem>
                <MenuItem value="permission">Permission</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => exportToExcel("staff")}
              size="small"
            >
              Export
            </Button>
          </Box>
        </Box>
        
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: 'white' }}>SIN Number</TableCell>
                <TableCell sx={{ color: 'white' }}>Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Department</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Attendance %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No staff found for this filter combination
                  </TableCell>
                </TableRow>
              ) : (
                staffList.map((staff) => (
                  <TableRow key={staff.sin_number} hover>
                    <TableCell>{staff.sin_number}</TableCell>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>
                      <Chip 
                        label={staff.status}
                        size="small"
                        sx={{ 
                          backgroundColor: `${statusColors[staff.status]}20`,
                          color: statusColors[staff.status],
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={staff.attendancePercentage || 0} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: `${theme.palette.primary.main}20`,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: staff.attendancePercentage > 85 ? 
                                  green[600] : staff.attendancePercentage > 70 ? 
                                  orange[500] : red[500],
                                borderRadius: 4
                              }
                            }} 
                          />
                        </Box>
                        <Typography variant="body2">
                          {typeof staff.attendancePercentage === 'number' ? `${staff.attendancePercentage}%` : '0%'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const DateSelector = () => (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {viewMode === 'daily' && 'Select Date'}
          {viewMode === 'weekly' && 'Select Month and Week'}
          {viewMode === 'monthly' && 'Select Year and Month'}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            {viewMode === 'daily' && (
              <Grid item xs={12}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            )}
            {viewMode === 'weekly' && (
              <>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Month"
                      onChange={e => setSelectedMonth(e.target.value)}
                    >
                      {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Week Number</InputLabel>
                    <Select
                      value={selectedWeek}
                      label="Week Number"
                      onChange={e => setSelectedWeek(e.target.value)}
                    >
                      {weekNumbers.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            {viewMode === 'monthly' && (
              <>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={selectedYear}
                      label="Year"
                      onChange={e => setSelectedYear(e.target.value)}
                    >
                      {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Month"
                      onChange={e => setSelectedMonth(e.target.value)}
                    >
                      {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Box sx={{ flexGrow: 1, p: isMobile ? 1 : 3, mt: -8, overflow: 'auto' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0
          }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"}
              sx={{ 
                fontWeight: "bold", 
                color: theme.palette.primary.main,
                textAlign: isMobile ? 'center' : 'left',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Staff Attendance Dashboard
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2
            }}>
              {viewMode === 'daily' && (
                <Button
                  variant="contained"
                  color={showTableView ? "secondary" : "primary"}
                  startIcon={showTableView ? <BarChartIcon /> : <TableChartIcon />}
                  onClick={() => setShowTableView(!showTableView)}
                  size={isMobile ? "small" : "medium"}
                >
                  {showTableView ? "Show Charts" : "Show Staff List"}
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => exportToExcel("stats")}
                size={isMobile ? "small" : "medium"}
              >
                Export 
              </Button>
            </Box>
          </Box>

          {viewMode === 'daily' ? <DailySummaryCards /> : <WeeklyMonthlySummaryCards />}

          <Paper sx={{ 
            mb: 3, 
            borderRadius: 3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <Tabs
              value={viewMode}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontWeight: 'bold'
                }
              }}
            >
              <Tab label="Daily" icon={<TodayIcon />} value="daily" />
              <Tab label="Weekly" icon={<CalendarIcon />} value="weekly" />
              <Tab label="Monthly" icon={<SummarizeIcon />} value="monthly" />
            </Tabs>
          </Paper>

          <DateSelector />

          {/* Always show the chart for all views */}
          <TimeSeriesChart />

          {/* Only show the table for daily view and when showTableView is true */}
          {viewMode === 'daily' && showTableView && <StaffTableView />}
        </Box>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;