import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, useTheme, LinearProgress,
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Card, CardContent,
  Divider, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Snackbar, Alert,
  CircularProgress, useMediaQuery
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Label, AreaChart, Area
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Download as DownloadIcon,
  Today as TodayIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Summarize as SummarizeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
  Check as CheckIcon,
  Close as XIcon,
  Person as UserIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import { green, red, orange, blue, purple, pink, grey, yellow, deepPurple, teal, indigo } from '@mui/material/colors';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

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

// Status color utility function
const getStatusColor = (percentage) => {
  return percentage >= 90 ? green[500] :
    percentage >= 75 ? blue[500] : 
    percentage >= 60 ? orange[500] : red[500];
};

// Summary cards component - only for Daily view
const DailySummaryCards = ({ overallData, theme }) => {
  const cards = [
    {
      title: 'Overall Attendance',
      value: `${overallData?.overallPercentage}%`,
      subtitle: `${overallData?.presentDays} of ${overallData?.totalWorkingDays} days`,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
      progress: overallData?.overallPercentage,
      extraContent: (
        <LinearProgress 
          variant="determinate" 
          value={overallData?.overallPercentage} 
          sx={{ 
            height: 10, 
            borderRadius: 5,
            backgroundColor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'white'
            }
          }} 
        />
      )
    },
    {
      title: 'Present Days',
      value: overallData?.presentDays,
      subtitle: `${Math.round((overallData?.presentDays / overallData?.totalWorkingDays) * 100)}% of total`,
      gradient: `linear-gradient(135deg, ${green[300]} 0%, ${green[500]} 100%)`
    },
    {
      title: 'Absent Days',
      value: overallData?.absentDays,
      subtitle: `${Math.round((overallData?.absentDays / overallData?.totalWorkingDays) * 100)}% of total`,
      gradient: `linear-gradient(135deg, ${red[300]} 0%, ${red[500]} 100%)`
    },
    {
      title: 'Late Arrivals',
      value: overallData?.lateArrivalDays,
      subtitle: `${Math.round((overallData?.lateArrivalDays / overallData?.totalWorkingDays) * 100)}% of total`,
      gradient: `linear-gradient(135deg, ${orange[300]} 0%, ${orange[500]} 100%)`
    },
    {
      title: 'Early Departures',
      value: overallData?.earlyDepartureDays,
      subtitle: `${Math.round((overallData?.earlyDepartureDays / overallData?.totalWorkingDays) * 100)}% of total`,
      gradient: `linear-gradient(135deg, ${blue[300]} 0%, ${blue[500]} 100%)`
    },
    {
      title: 'OD Approved',
      value: overallData?.odApproved,
      subtitle: 'Official duty days',
      gradient: `linear-gradient(135deg, ${purple[300]} 0%, ${purple[500]} 100%)`
    },
    {
      title: 'Permission Days',
      value: overallData?.permissionDays || 0,
      subtitle: 'Permission granted days',
      gradient: `linear-gradient(135deg, ${orange[300]} 0%, ${orange[500]} 100%)`
    },
    {
      title: 'Total Working Days',
      value: overallData?.totalWorkingDays,
      subtitle: 'Current semester total',
      gradient: `linear-gradient(135deg, ${grey[500]} 0%, ${grey[600]} 100%)`
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            background: card.gradient,
            color: 'white',
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {card.value}
              </Typography>
              {card.extraContent && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    {card.extraContent}
                  </Box>
                </Box>
              )}
              <Typography variant="body2">
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Overall percentage card - for Weekly and Monthly views
const OverallPercentageCard = ({ percentage, theme }) => {
  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card sx={{ 
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
        boxShadow: 3
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Attendance
          </Typography>
          <Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
            {percentage}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white'
              }
            }} 
          />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Attendance percentage
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

const DailyView = ({ 
  dailyData, 
  startDate, 
  endDate, 
  selectedDate, 
  setStartDate, 
  setEndDate, 
  fetchDailyAttendance, 
  downloadAttendance,
  theme,
  overallData 
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const dayData = useMemo(() => {
    return dailyData.find(d => {
      const dayDate = new Date(d.date);
      return dayDate.getDate() === selectedDate.getDate() && 
             dayDate.getMonth() === selectedDate.getMonth() && 
             dayDate.getFullYear() === selectedDate.getFullYear();
    }) || { status: 'No data', workingHours: '0' };
  }, [dailyData, selectedDate]);

  const pieData = useMemo(() => [
    { 
      name: 'Present', 
      value: dailyData.filter(d => d.status === 'Present').length,
      color: green[500]
    },
    { 
      name: 'Absent', 
      value: dailyData.filter(d => d.status === 'Absent').length,
      color: red[500]
    },
    { 
      name: 'Late', 
      value: dailyData.filter(d => d.status === 'Late').length,
      color: orange[500]
    },
    { 
      name: 'Holiday', 
      value: dailyData.filter(d => d.status === 'Holiday').length,
      color: grey[500]
    },
    { 
      name: 'OD', 
      value: dailyData.filter(d => d.odStatus).length,
      color: purple[500]
    },
    { 
      name: 'Permission', 
      value: dailyData.filter(d => d.permissionStatus).length,
      color: orange[500]
    }
  ], [dailyData]);

  return (
    <Box>
      {/* Show the detailed summary cards only in Daily view */}
      <DailySummaryCards overallData={overallData} theme={theme} />

      {/* Date Range Selector */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              width: isMobile ? '100%' : 'auto',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth={isMobile} />}
                maxDate={endDate}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth={isMobile} />}
                minDate={startDate}
              />
            </Box>
          </LocalizationProvider>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            width: isMobile ? '100%' : 'auto'
          }}>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={fetchDailyAttendance}
              fullWidth={isMobile}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<DownloadIcon />}
              onClick={downloadAttendance}
              fullWidth={isMobile}
            >
              Export Data
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Daily Attendance Trend */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Daily Attendance Trend ({format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')})
        </Typography>
        <Box sx={{ height: 400, width: '100%', minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                        <Typography variant="body2">
                          Date: {format(new Date(label), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          Working Hours: {payload[0].value}
                        </Typography>
                      </Paper>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="workingHours"
                name="Working Hours"
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.light}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Attendance Distribution */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Attendance Distribution
        </Typography>
        <Box sx={{ height: 400, width: '100%', minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={isMobile ? 100 : 150}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Enhanced Daily Attendance Details */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
            Daily Attendance Details
          </Typography>
          <Chip 
            label={`${dailyData.length} Records`} 
            color="primary" 
            variant="outlined"
            size="small"
          />
        </Box>
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: isMobile ? 650 : 850 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>Time Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>Working Hours</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>Flags</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>Special Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyData.map((day, index) => (
                <TableRow 
                  key={index} 
                  hover
                  sx={{ 
                    '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {format(new Date(day.date), 'EEE, MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={day.status}
                      color={
                        day.status === 'Present' ? 'success' :
                        day.status === 'Absent' ? 'error' :
                        day.status === 'Late' ? 'warning' :
                        day.status === 'Holiday' ? 'default' :
                        day.odStatus ? 'secondary' :
                        day.permissionStatus ? 'warning' :
                        'default'
                      }
                      sx={{ 
                        minWidth: 90,
                        fontWeight: 'bold',
                        boxShadow: 1
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          In: {day.inTime || '--:--'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          Out: {day.outTime || '--:--'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      backgroundColor: day.workingHours >= 8 ? green[50] : orange[50],
                      p: 1,
                      borderRadius: 1,
                      borderLeft: `4px solid ${day.workingHours >= 8 ? green[500] : orange[500]}`
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {day.workingHours || '0.00'} hrs
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {day.lateArrival && (
                        <Tooltip title="Late Arrival">
                          <Chip
                            icon={<WarningIcon />}
                            label="Late"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                      {day.earlyDeparture && (
                        <Tooltip title="Early Departure">
                          <Chip
                            icon={<WarningIcon />}
                            label="Early"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                      {!day.lateArrival && !day.earlyDeparture && '-'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {day.odStatus ? (
                        <Chip
                          label="On Duty"
                          color="secondary"
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      ) : day.permissionStatus ? (
                        <Chip
                          label="Permission"
                          color="warning"
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      ) : (
                        '-'
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

const WeeklyView = ({ 
  weeklyData, 
  selectedYear, 
  selectedMonth, 
  selectedWeek, 
  setSelectedYear, 
  setSelectedMonth, 
  setSelectedWeek, 
  fetchWeeklyAttendance, 
  downloadAttendance,
  theme,
  overallData 
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Default data structure to prevent undefined errors
  const weeklyDisplayData = weeklyData || {
    week: selectedWeek,
    startDate: new Date(),
    endDate: new Date(),
    statistics: {
      presentDays: 0,
      absentDays: 0,
      lateArrivalDays: 0,
      earlyDepartureDays: 0,
      odDays: 0,
      permissionDays: 0,
      holidayDays: 0,
      totalDays: 0,
      workingDays: 0,
      averageWorkingHours: 0,
      percentage: 0
    },
    dailyData: []
  };

  const percentage = weeklyDisplayData.statistics.percentage || 0;

  // Calculate week days for the calendar view
  const weekDays = useMemo(() => {
    if (!weeklyDisplayData.startDate || !weeklyDisplayData.endDate) return [];
    const start = new Date(weeklyDisplayData.startDate);
    const end = new Date(weeklyDisplayData.endDate);
    return eachDayOfInterval({ start, end });
  }, [weeklyDisplayData.startDate, weeklyDisplayData.endDate]);

  // Enhanced weekly chart data
  const weeklyChartData = useMemo(() => {
    if (!weeklyDisplayData.dailyData || weeklyDisplayData.dailyData.length === 0) return [];
    
    return weeklyDisplayData.dailyData.map(day => ({
      date: format(new Date(day.date), 'EEE'),
      workingHours: parseFloat(day.workingHours) || 0,
      status: day.status,
      isWorkingDay: day.isWorkingDay
    }));
  }, [weeklyDisplayData.dailyData]);

  // Weekly summary data for the bar chart
  const weeklySummaryData = [
    {
      name: 'Attendance',
      Present: weeklyDisplayData.statistics.presentDays,
      Absent: weeklyDisplayData.statistics.absentDays,
      Late: weeklyDisplayData.statistics.lateArrivalDays,
      OD: weeklyDisplayData.statistics.odDays,
      Permission: weeklyDisplayData.statistics.permissionDays,
      Holiday: weeklyDisplayData.statistics.holidayDays
    }
  ];

  return (
    <Box>
      {/* Week Selector */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            width: isMobile ? '100%' : 'auto',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <FormControl sx={{ minWidth: 120 }} fullWidth={isMobile}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {[new Date().getFullYear() - 1, new Date().getFullYear()].map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }} fullWidth={isMobile}>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }} fullWidth={isMobile}>
              <InputLabel>Week</InputLabel>
              <Select
                value={selectedWeek}
                label="Week"
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                {Array.from({ length: 5 }, (_, i) => i + 1).map((week) => (
                  <MenuItem key={week} value={week}>Week {week}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            width: isMobile ? '100%' : 'auto'
          }}>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={fetchWeeklyAttendance}
              fullWidth={isMobile}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<DownloadIcon />}
              onClick={downloadAttendance}
              fullWidth={isMobile}
            >
              Export Data
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Overall percentage card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <OverallPercentageCard percentage={overallData?.overallPercentage || 0} theme={theme} />
      </Grid>

      {/* Enhanced Weekly Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3, width: '100%', mr: 5}}>
            <Typography variant="h6" gutterBottom>
              Attendance Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Present', value: weeklyDisplayData.statistics.presentDays, color: green[500] },
                      { name: 'Absent', value: weeklyDisplayData.statistics.absentDays, color: red[500] },
                      { name: 'Late', value: weeklyDisplayData.statistics.lateArrivalDays, color: orange[500] },
                      { name: 'OD', value: weeklyDisplayData.statistics.odDays, color: purple[500] },
                      { name: 'Permission', value: weeklyDisplayData.statistics.permissionDays, color: orange[500] },
                      { name: 'Holiday', value: weeklyDisplayData.statistics.holidayDays, color: grey[500] }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill={green[500]} />
                    <Cell fill={red[500]} />
                    <Cell fill={orange[500]} />
                    <Cell fill={purple[500]} />
                    <Cell fill={orange[500]} />
                    <Cell fill={grey[500]} />
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Weekly Attendance Breakdown */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Weekly Attendance Breakdown
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklySummaryData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Present" name="Present" fill={green[500]} />
              <Bar dataKey="Absent" name="Absent" fill={red[500]} />
              <Bar dataKey="Late" name="Late" fill={orange[500]} />
              <Bar dataKey="OD" name="OD" fill={purple[500]} />
              <Bar dataKey="Permission" name="Permission" fill={orange[500]} />
              <Bar dataKey="Holiday" name="Holiday" fill={grey[500]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Daily Breakdown Table */}
      {weeklyDisplayData.dailyData && weeklyDisplayData.dailyData.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Daily Breakdown
          </Typography>
          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>In Time</TableCell>
                  <TableCell>Out Time</TableCell>
                  <TableCell>Working Hours</TableCell>
                  <TableCell>Special Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weeklyDisplayData.dailyData.map((day, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(day.date), 'EEE, MMM dd')}</TableCell>
                    <TableCell>
                      <Chip
                        label={day.status}
                        color={
                          day.status === 'Present' ? 'success' :
                          day.status === 'Absent' ? 'error' :
                          day.status === 'Late' ? 'warning' :
                          day.status === 'Holiday' ? 'default' :
                          day.odStatus ? 'secondary' :
                          day.permissionStatus ? 'warning' :
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{day.inTime || '--:--'}</TableCell>
                    <TableCell>{day.outTime || '--:--'}</TableCell>
                    <TableCell>{day.workingHours || '0.00'} hrs</TableCell>
                    <TableCell>
                      {day.odStatus ? (
                        <Chip label="On Duty" color="secondary" size="small" />
                      ) : day.permissionStatus ? (
                        <Chip label="Permission" color="warning" size="small" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

const MonthlyView = ({ 
  monthlyData, 
  selectedYear, 
  setSelectedYear, 
  fetchMonthlyAttendance, 
  downloadAttendance,
  theme,
  overallData 
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Default data structure to prevent undefined errors
  const monthlyDisplayData = monthlyData || {
    year: selectedYear,
    monthlyData: [],
    overallStatistics: {
      totalPresentDays: 0,
      totalAbsentDays: 0,
      totalLateArrivalDays: 0,
      totalEarlyDepartureDays: 0,
      totalODDays: 0,
      totalPermissionDays: 0,
      totalHolidayDays: 0,
      totalWorkingDays: 0,
      overallPercentage: 0
    }
  };

  // Prepare chart data for monthly view
  const monthlyChartData = useMemo(() => {
    if (!monthlyDisplayData.monthlyData) return [];
    return monthlyDisplayData.monthlyData.map(month => ({
      ...month,
      presentPercentage: (month.statistics.presentDays / month.statistics.workingDays * 100) || 0,
      absentPercentage: (month.statistics.absentDays / month.statistics.workingDays * 100) || 0
    }));
  }, [monthlyDisplayData.monthlyData]);

  return (
    <Box>
      {/* Year Selector */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <FormControl sx={{ minWidth: 120 }} fullWidth={isMobile}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {[new Date().getFullYear() - 1, new Date().getFullYear()].map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            width: isMobile ? '100%' : 'auto'
          }}>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={fetchMonthlyAttendance}
              fullWidth={isMobile}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<DownloadIcon />}
              onClick={downloadAttendance}
              fullWidth={isMobile}
            >
              Export Data
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Overall percentage card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <OverallPercentageCard percentage={overallData?.overallPercentage || 0} theme={theme} />
      </Grid>

      {/* Monthly Attendance Trend */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Attendance Trend ({selectedYear})
        </Typography>
        <Box sx={{ height: 400, width: '100%', minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip
                formatter={(value, name) => {
                  if (name === 'presentPercentage') return [`${value.toFixed(1)}%`, 'Present %'];
                  if (name === 'absentPercentage') return [`${value.toFixed(1)}%`, 'Absent %'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                dataKey="presentPercentage"
                name="Present %"
                fill={green[500]}
              />
              <Bar
                dataKey="absentPercentage"
                name="Absent %"
                fill={red[500]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Enhanced Monthly Attendance Details */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
            Monthly Attendance Details
          </Typography>
          <Chip 
            label={`${monthlyDisplayData.monthlyData?.length || 0} Months`} 
            color="primary" 
            variant="outlined"
            size="small"
          />
        </Box>
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: isMobile ? 650 : 750 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>Month</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }} align="center">Working Days</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }} align="center">Present</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }} align="center">Absent</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }} align="center">OD</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }} align="center">Permission</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }} align="center">Attendance %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyDisplayData.monthlyData?.map((month) => (
                <TableRow 
                  key={month.month} 
                  hover
                  sx={{ 
                    '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {month.monthName}
                  </TableCell>
                  <TableCell align="center">
                    {month.statistics.workingDays}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      backgroundColor: green[50],
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      border: `1px solid ${green[100]}`
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: green[800] }}>
                        {month.statistics.presentDays}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      backgroundColor: red[50],
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      border: `1px solid ${red[100]}`
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: red[800] }}>
                        {month.statistics.absentDays}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      backgroundColor: purple[50],
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      border: `1px solid ${purple[100]}`
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: purple[800] }}>
                        {month.statistics.odDays}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      backgroundColor: orange[50],
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      border: `1px solid ${orange[100]}`
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: orange[800] }}>
                        {month.statistics.permissionDays}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{ 
                        width: '100%', 
                        maxWidth: 100,
                        mr: 1 
                      }}>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(month.statistics.percentage) || 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getStatusColor(parseFloat(month.statistics.percentage) || 0)
                            }
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          minWidth: 40,
                          color: getStatusColor(parseFloat(month.statistics.percentage) || 0)
                        }}
                      >
                        {month.statistics.percentage || '0.00'}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

const AttendanceDashboard = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // View mode state
  const [viewMode, setViewMode] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Date selection states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Data states
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [overallData, setOverallData] = useState(null);

  // Fetch overall attendance data
  const fetchOverallAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user) {
        throw new Error('User data not found');
      }
      const response = await axios.get(`${API_BASE_URL}/overall-attendance?UserId=${user.sin_number}`);
      if (response.data.success) {
        setOverallData(response.data.data);
        showSnackbar('Overall attendance data refreshed successfully', 'success');
      } else {
        throw new Error('Failed to fetch overall attendance data');
      }
    } catch (error) {
      console.error('Error fetching overall attendance:', error);
      setError(error.message);
      showSnackbar(error.message || 'Failed to fetch overall attendance data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch daily attendance data
  const fetchDailyAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user) {
        throw new Error('User data not found');
      }
      const response = await axios.get(`${API_BASE_URL}/daily-attendance?UserId=${user.sin_number}&startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`);
      if (response.data.success) {
        setDailyData(response.data.data);
        showSnackbar('Daily attendance data refreshed successfully', 'success');
      } else {
        throw new Error('Failed to fetch daily attendance data');
      }
    } catch (error) {
      console.error('Error fetching daily attendance:', error);
      setError(error.message);
      showSnackbar(error.message || 'Failed to fetch daily attendance data', 'error');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Fetch weekly attendance data
  const fetchWeeklyAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user) {
        throw new Error('User data not found');
      }
      const response = await axios.get(`${API_BASE_URL}/weekly-attendance?UserId=${user.sin_number}&year=${selectedYear}&month=${selectedMonth}&week=${selectedWeek}`);
      if (response.data.success) {
        setWeeklyData(response.data.data);
        showSnackbar('Weekly attendance data refreshed successfully', 'success');
      } else {
        throw new Error('Failed to fetch weekly attendance data');
      }
    } catch (error) {
      console.error('Error fetching weekly attendance:', error);
      setError(error.message);
      showSnackbar(error.message || 'Failed to fetch weekly attendance data', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, selectedWeek]);

  // Fetch monthly attendance data
  const fetchMonthlyAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user) {
        throw new Error('User data not found');
      }
      const response = await axios.get(`${API_BASE_URL}/monthly-attendance?UserId=${user.sin_number}&year=${selectedYear}`);
      if (response.data.success) {
        setMonthlyData(response.data.data);
        showSnackbar('Monthly attendance data refreshed successfully', 'success');
      } else {
        throw new Error('Failed to fetch monthly attendance data');
      }
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
      setError(error.message);
      showSnackbar(error.message || 'Failed to fetch monthly attendance data', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        setUser(userData);
        
        await Promise.all([
          fetchOverallAttendance(),
          fetchDailyAttendance(),
          fetchWeeklyAttendance(),
          fetchMonthlyAttendance()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchOverallAttendance, fetchDailyAttendance, fetchWeeklyAttendance, fetchMonthlyAttendance]);

  const handleTabChange = (event, newValue) => {
    setViewMode(newValue);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleWeekChange = (week) => {
    setSelectedWeek(week);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
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

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const downloadAttendance = useCallback(() => {
    try {
      let dataToExport = [];
      let fileName = 'attendance';
      
      switch(viewMode) {
        case 'daily':
          dataToExport = dailyData.map(day => ({
            Date: format(new Date(day.date), 'yyyy-MM-dd'),
            Status: day.status,
            'In Time': day.inTime || '-',
            'Out Time': day.outTime || '-',
            'Working Hours': day.workingHours || '0',
            'Late Arrival': day.lateArrival ? 'Yes' : 'No',
            'Early Departure': day.earlyDeparture ? 'Yes' : 'No',
            'OD Status': day.odStatus ? 'Yes' : 'No',
            'Internship Status': day.internshipStatus ? 'Yes' : 'No',
            'Working Day': day.isWorkingDay ? 'Yes' : 'No'
          }));
          fileName = `daily_attendance_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`;
          break;
          
        case 'weekly':
          dataToExport = [{
            'Week Number': weeklyData.week,
            'Start Date': format(new Date(weeklyData.startDate), 'yyyy-MM-dd'),
            'End Date': format(new Date(weeklyData.endDate), 'yyyy-MM-dd'),
            'Present Days': weeklyData.statistics.presentDays,
            'Absent Days': weeklyData.statistics.absentDays,
            'Late Arrival Days': weeklyData.statistics.lateArrivalDays,
            'Early Departure Days': weeklyData.statistics.earlyDepartureDays,
            'OD Days': weeklyData.statistics.odDays,
            'Internship Days': weeklyData.statistics.internshipDays,
            'Holiday Days': weeklyData.statistics.holidayDays,
            'Total Days': weeklyData.statistics.totalDays,
            'Working Days': weeklyData.statistics.workingDays,
            'Average Working Hours': weeklyData.statistics.averageWorkingHours,
            'Attendance Percentage': `${weeklyData.statistics.percentage || 0}%`
          }];
          fileName = `weekly_attendance_${selectedYear}_week_${selectedWeek}`;
          break;
          
        case 'monthly':
          dataToExport = monthlyData.monthlyData?.map(month => ({
            Month: month.monthName,
            'Present Days': month.statistics.presentDays,
            'Absent Days': month.statistics.absentDays,
            'Late Arrival Days': month.statistics.lateArrivalDays,
            'Early Departure Days': month.statistics.earlyDepartureDays,
            'OD Days': month.statistics.odDays,
            'Internship Days': month.statistics.internshipDays,
            'Holiday Days': month.statistics.holidayDays,
            'Working Days': month.statistics.workingDays,
            'Total Working Hours': month.statistics.totalWorkingHours,
            'Attendance Percentage': `${month.statistics.percentage || 0}%`
          })) || [];
          fileName = `monthly_attendance_${selectedYear}`;
          break;
          
        default:
          break;
      }
      
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Data");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      
      showSnackbar('Attendance data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showSnackbar('Failed to export attendance data', 'error');
    }
  }, [viewMode, dailyData, weeklyData, monthlyData, startDate, endDate, selectedYear, selectedWeek]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          mt: -2,
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
            Attendance Dashboard
          </Typography>
          
          {user && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2
            }}>
              <Chip
                avatar={<Avatar src={user.photo} />}
                label={`${user.name} | ${user.department}`}
                variant="outlined"
                sx={{ 
                  backgroundColor: 'rgba(63, 81, 181, 0.1)',
                  borderColor: theme.palette.primary.main
                }}
              />
            </Box>
          )}
        </Box>

        {overallData && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {overallData.semesterName} ({format(new Date(overallData.semesterStartDate), 'MMM d, yyyy')} - {format(new Date(overallData.semesterEndDate), 'MMM d, yyyy')})
          </Typography>
        )}

        <Paper sx={{ 
          mb: 3, 
          borderRadius: 3,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <Tabs
            value={viewMode}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
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

        {viewMode === 'daily' && (
          <DailyView 
            dailyData={dailyData}
            startDate={startDate}
            endDate={endDate}
            selectedDate={selectedDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            fetchDailyAttendance={fetchDailyAttendance}
            downloadAttendance={downloadAttendance}
            theme={theme}
            overallData={overallData}
          />
        )}
        {viewMode === 'weekly' && (
          <WeeklyView 
            weeklyData={weeklyData}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedWeek={selectedWeek}
            setSelectedYear={setSelectedYear}
            setSelectedMonth={setSelectedMonth}
            setSelectedWeek={setSelectedWeek}
            fetchWeeklyAttendance={fetchWeeklyAttendance}
            downloadAttendance={downloadAttendance}
            theme={theme}
            overallData={overallData}
          />
        )}
        {viewMode === 'monthly' && (
          <MonthlyView 
            monthlyData={monthlyData}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            fetchMonthlyAttendance={fetchMonthlyAttendance}
            downloadAttendance={downloadAttendance}
            theme={theme}
            overallData={overallData}
          />
        )}
      </Box>
      
      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Logout"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to logout from your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
      
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
  );
};

export default AttendanceDashboard;