import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";

import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Alert,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled
} from "@mui/material";

// Icons
import { 
  Save, 
  Restore, 
  Devices, 
  Schedule, 
  Percent,
  InfoOutlined,
  ExpandMore,
  Delete,
  Edit,
  Cancel,
  Upload,
  CheckCircle
} from "@mui/icons-material";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

// Styled Components
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '&:before': {
    display: 'none'
  }
}));

const StyledTable = styled(Table)({
  minWidth: 650,
  '& .MuiTableCell-root': {
    padding: '12px 16px',
    borderColor: '#e0e0e0'
  }
});

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  minWidth: 'auto'
}));

// Biometric Devices Options
const biometricDevices = [
  { value: "zkteco", label: "ZKTeco" },
  { value: "hfs", label: "HFS" },
  { value: "morpho", label: "Morpho" },
  { value: "suprema", label: "Suprema" },
];

// Default Configuration Values
const defaultConfig = {
  minAttendance: 75,
  gracePeriod: 10,
  biometricDevice: "zkteco",
  lateMarkThreshold: 5,
  autoLockoutAfter: 3,
  enableAutoApproval: true,
  notifyOnLateArrival: true,
};

// Default Semester Details
const defaultSemesterDetails = {
  semesterName: '',
  semesterStartDate: '',
  semesterEndDate: '',
  totalSemesterDays: ''
};

// Field descriptions
const fieldDescriptions = {
  minAttendance: "Minimum percentage of classes a student must attend to be eligible for exams",
  gracePeriod: "Allowed time (in minutes) after scheduled start time before being marked late",
  lateMarkThreshold: "Time (in minutes) after which a late arrival is recorded (must be ≤ grace period)",
  autoLockoutAfter: "Hours after which the system will automatically lock out latecomers",
  biometricDevice: "Type of biometric device connected to the system",
  enableAutoApproval: "Automatically approve attendance for students who arrive on time",
  notifyOnLateArrival: "Send email notifications when students arrive after the grace period"
};

// Validation Schema
const configSchema = yup.object().shape({
  minAttendance: yup
    .number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%")
    .required("Required"),
  gracePeriod: yup
    .number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .max(60, "Maximum 60 minutes")
    .required("Required"),
  biometricDevice: yup.string().required("Required"),
  lateMarkThreshold: yup
    .number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .max(yup.ref('gracePeriod'), "Must be ≤ grace period")
    .required("Required"),
  autoLockoutAfter: yup
    .number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .max(24, "Maximum 24 hours"),
});

const SystemConfig = () => {
  // State Management
  const [config, setConfig] = useState(defaultConfig);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [expanded, setExpanded] = useState({
    attendance: true,
    biometric: true,
    notifications: true,
    semester: true,
    holidays: false,
  });
  const [semesterDetails, setSemesterDetails] = useState(defaultSemesterDetails);
  const [semesterInitial, setSemesterInitial] = useState(defaultSemesterDetails);
  const [semesterIsDirty, setSemesterIsDirty] = useState(false);
  const [semesterErrors, setSemesterErrors] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState('');
  const [holidayUploadLoading, setHolidayUploadLoading] = useState(false);
  const [holidayEdits, setHolidayEdits] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [holidayTableDirty, setHolidayTableDirty] = useState(false);

  // Form Control
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: defaultConfig,
    resolver: yupResolver(configSchema),
  });

  const gracePeriod = watch("gracePeriod");

  // Fetch configuration on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/system-config`);
        if (response.data.success) {
          const dbConfig = response.data.data;
          // Convert the database time format to minutes for the frontend
          const configData = {
            minAttendance: dbConfig.min_attendance_percentage,
            gracePeriod: parseInt(dbConfig.grace_period.split(':')[1]) || 0,
            biometricDevice: config.biometricDevice,
            lateMarkThreshold: Math.min(parseInt(dbConfig.grace_period.split(':')[1]) || 0, config.lateMarkThreshold),
            autoLockoutAfter: parseInt(dbConfig.auto_lockout.split(':')[0]) || 0,
            enableAutoApproval: config.enableAutoApproval,
            notifyOnLateArrival: config.notifyOnLateArrival
          };
          setConfig(configData);
          reset(configData);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
        showSnackbar(error.response?.data?.message || "Error fetching configuration", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Effect for Dirty State Tracking
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name) setIsDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Fetch semester details on mount
  useEffect(() => {
    const fetchSemesterDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/semester-details`);
        if (response.data.success && response.data.data) {
          const sem = response.data.data;
          const semesterData = {
            semesterName: sem.semester_name || '',
            semesterStartDate: sem.semester_start_date || '',
            semesterEndDate: sem.semester_end_date || '',
            totalSemesterDays: sem.total_semester_days ? String(sem.total_semester_days) : ''
          };
          setSemesterDetails(semesterData);
          setSemesterInitial(semesterData);
        }
      } catch (error) {
        showSnackbar('Error fetching semester details', 'error');
      }
    };
    fetchSemesterDetails();
  }, []);

  // Fetch holidays on mount
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/holidays`);
        if (res.data.success) setHolidays(res.data.data);
      } catch (err) {
        showSnackbar('Error fetching holidays', 'error');
      }
    };
    fetchHolidays();
  }, []);

  // Semester details change handler
  const handleSemesterChange = (field, value) => {
    setSemesterDetails(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate total days if start/end change
      if (field === 'semesterStartDate' || field === 'semesterEndDate') {
        const start = new Date(field === 'semesterStartDate' ? value : prev.semesterStartDate);
        const end = new Date(field === 'semesterEndDate' ? value : prev.semesterEndDate);
        if (start && end && !isNaN(start) && !isNaN(end)) {
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          updated.totalSemesterDays = diffDays;
        }
      }
      setSemesterIsDirty(true);
      return updated;
    });
  };

  // Semester details save handler
  const handleSemesterSave = async () => {
    setSemesterErrors({});
    // Basic validation
    const errors = {};
    if (!semesterDetails.semesterName) errors.semesterName = 'Required';
    if (!semesterDetails.semesterStartDate) errors.semesterStartDate = 'Required';
    if (!semesterDetails.semesterEndDate) errors.semesterEndDate = 'Required';
    if (!semesterDetails.totalSemesterDays) errors.totalSemesterDays = 'Required';
    if (Object.keys(errors).length > 0) {
      setSemesterErrors(errors);
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/semester-details`, {
        semester_name: semesterDetails.semesterName,
        semester_start_date: semesterDetails.semesterStartDate,
        semester_end_date: semesterDetails.semesterEndDate,
        total_semester_days: semesterDetails.totalSemesterDays
      });
      setSemesterInitial(semesterDetails);
      setSemesterIsDirty(false);
      showSnackbar('Semester details saved successfully!', 'success');
    } catch (error) {
      showSnackbar('Error saving semester details', 'error');
    }
  };

  // Semester details reset handler
  const handleSemesterReset = () => {
    setSemesterDetails(semesterInitial);
    setSemesterIsDirty(false);
    setSemesterErrors({});
    showSnackbar('Semester changes discarded', 'info');
  };

  // Handler Functions
  const handleSave = async (data) => {
    try {
      // Convert minutes to HH:MM format for the backend
      const configData = {
        min_attendance_percentage: data.minAttendance,
        grace_period: `00:${String(data.gracePeriod).padStart(2, '0')}`,
        auto_lockout: `${String(data.autoLockoutAfter).padStart(2, '0')}:00`
      };

      const response = await axios.post(`${API_BASE_URL}/system-config`, configData);
      
      if (response.data.success) {
        setConfig(data);
        setIsDirty(false);
        showSnackbar("Settings saved successfully!", "success");
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showSnackbar(error.response?.data?.message || "Error saving configuration", "error");
    }
  };

  const handleReset = () => {
    reset(defaultConfig);
    setIsDirty(false);
    showSnackbar("Changes discarded", "info");
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded({ ...expanded, [panel]: isExpanded });
  };

  const handleHolidayEdit = (id, field, value) => {
    setHolidayEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
    setHolidayTableDirty(true);
  };

  const handleEditClick = (id) => {
    setEditingId(id);
    setHolidayEdits(prev => ({ ...prev, [id]: holidays.find(h => h.id === id) }));
  };

  const handleCancelEdit = (id) => {
    setEditingId(null);
    setHolidayEdits(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setHolidayTableDirty(false);
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/holidays/${id}`);
      setHolidays(holidays.filter(h => h.id !== id));
      showSnackbar('Holiday deleted', 'success');
    } catch (err) {
      showSnackbar('Failed to delete holiday', 'error');
    }
  };

  const handleDeleteAllHolidays = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/holidays`);
      setHolidays([]);
      showSnackbar('All holidays deleted', 'success');
    } catch (err) {
      showSnackbar('Failed to delete all holidays', 'error');
    }
  };

  const handleSaveHolidayEdits = async () => {
    try {
      for (const id of Object.keys(holidayEdits)) {
        const { date, day, holiday_reason } = holidayEdits[id];
        await axios.put(`${API_BASE_URL}/holidays/${id}`, { date, day, holiday_reason });
      }
      // Refresh holidays
      const holidaysRes = await axios.get(`${API_BASE_URL}/holidays`);
      if (holidaysRes.data.success) setHolidays(holidaysRes.data.data);
      setHolidayEdits({});
      setEditingId(null);
      setHolidayTableDirty(false);
      showSnackbar('Holiday changes saved', 'success');
    } catch (err) {
      showSnackbar('Failed to save changes', 'error');
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      margin: "0 auto", 
      p: { xs: 2, md: 3 },
      '& .MuiAccordion-root': {
        borderRadius: '8px !important',
        overflow: 'hidden',
        mb: 2
      }
    }}>
      {/* Header Section */}
      <Typography variant="h4" gutterBottom sx={{ 
        mb: 3, 
        display: 'flex', 
        alignItems: 'center',
        fontWeight: 600,
        color: 'text.primary'
      }}>
        <Devices sx={{ mr: 2, color: 'primary.main' }} fontSize="large" />
        System Configuration
      </Typography>
      
      {/* Main Form */}
      <Paper elevation={3} sx={{ 
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <form onSubmit={handleSubmit(handleSave)}>
          <CardContent>
            
            {/* ========== Attendance Rules Section ========== */}
            <StyledAccordion expanded={expanded.attendance} onChange={handleAccordionChange('attendance')}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  fontWeight: 600
                }}>
                  <Schedule color="primary" sx={{ mr: 2 }} />
                  Attendance Rules
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="minAttendance"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Minimum Attendance %"
                          type="number"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          error={!!errors.minAttendance}
                          helperText={errors.minAttendance?.message || fieldDescriptions.minAttendance}
                          InputProps={{ 
                            endAdornment: <Percent />,
                            inputProps: { min: 0, max: 100, step: 1 }
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="gracePeriod"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              Grace Period (minutes)
                              <Tooltip title="Time allowed after scheduled start before being marked late">
                                <IconButton size="small" sx={{ ml: 1 }}>
                                  <InfoOutlined fontSize="small" color="info" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          }
                          type="number"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          error={!!errors.gracePeriod}
                          helperText={errors.gracePeriod?.message || fieldDescriptions.gracePeriod}
                          InputProps={{ 
                            inputProps: { min: 0, max: 60, step: 1 }
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="autoLockoutAfter"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Auto Lockout After (hours)"
                          type="number"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          error={!!errors.autoLockoutAfter}
                          helperText={errors.autoLockoutAfter?.message || fieldDescriptions.autoLockoutAfter}
                          InputProps={{ 
                            inputProps: { min: 0, max: 24, step: 0.5 }
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                {/* Attendance Rules Action Buttons */}
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "flex-end", 
                  gap: 2, 
                  mt: 4,
                  flexWrap: 'wrap'
                }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                    disabled={!isDirty}
                    startIcon={<Restore />}
                    sx={{ minWidth: 150 }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={!isDirty}
                    startIcon={<Save />}
                    sx={{ minWidth: 180 }}
                  >
                    Save Settings
                  </Button>
                </Box>
              </AccordionDetails>
            </StyledAccordion>
            
            {/* ========== Semester Details Section ========== */}
            <StyledAccordion expanded={expanded.semester} onChange={handleAccordionChange('semester')}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  fontWeight: 600
                }}>
                  <Schedule color="primary" sx={{ mr: 2 }} />
                  Semester Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Semester Name"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      value={semesterDetails.semesterName}
                      onChange={e => handleSemesterChange('semesterName', e.target.value)}
                      error={!!semesterErrors.semesterName}
                      helperText={semesterErrors.semesterName}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Start Date"
                      type="date"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      value={semesterDetails.semesterStartDate}
                      onChange={e => handleSemesterChange('semesterStartDate', e.target.value)}
                      error={!!semesterErrors.semesterStartDate}
                      helperText={semesterErrors.semesterStartDate}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        inputProps: {
                          max: semesterDetails.semesterEndDate || undefined
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="End Date"
                      type="date"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      value={semesterDetails.semesterEndDate}
                      onChange={e => handleSemesterChange('semesterEndDate', e.target.value)}
                      error={!!semesterErrors.semesterEndDate}
                      helperText={semesterErrors.semesterEndDate}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        inputProps: {
                          min: semesterDetails.semesterStartDate || undefined
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Total Days"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      value={semesterDetails.totalSemesterDays}
                      onChange={e => handleSemesterChange('totalSemesterDays', e.target.value)}
                      error={!!semesterErrors.totalSemesterDays}
                      helperText={semesterErrors.totalSemesterDays}
                      InputProps={{ readOnly: true }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 2, 
                  mt: 4, 
                  flexWrap: 'wrap' 
                }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleSemesterReset}
                    disabled={!semesterIsDirty}
                    startIcon={<Restore />}
                    sx={{ minWidth: 150 }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSemesterSave}
                    disabled={!semesterIsDirty}
                    startIcon={<Save />}
                    sx={{ minWidth: 180 }}
                  >
                    Save Semester
                  </Button>
                </Box>
              </AccordionDetails>
            </StyledAccordion>
            
            {/* ========== Holiday Details Section ========== */}
            <StyledAccordion expanded={expanded.holidays} onChange={handleAccordionChange('holidays')}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  fontWeight: 600
                }}>
                  <Schedule color="primary" sx={{ mr: 2 }} />
                  Holiday Management
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteAllHolidays}
                    disabled={holidays.length === 0}
                    startIcon={<Delete />}
                    sx={{ minWidth: 200 }}
                  >
                    Delete All Holidays
                  </Button>
                  <Button
                    variant="contained"
                    component="label"
                    disabled={holidayUploadLoading}
                    startIcon={<Upload />}
                    sx={{ minWidth: 200 }}
                  >
                    Upload Holiday CSV
                    <input
                      type="file"
                      accept=".csv"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setHolidayUploadLoading(true);
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const res = await axios.post(`${API_BASE_URL}/upload-holidays`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          showSnackbar(res.data.message || 'Upload successful', 'success');
                          // Refresh holidays
                            const holidaysRes = await axios.get(`${API_BASE_URL}/holidays`);
                          if (holidaysRes.data.success) setHolidays(holidaysRes.data.data);
                        } catch (err) {
                          showSnackbar('Upload failed', 'error');
                        } finally {
                          setHolidayUploadLoading(false);
                        }
                      }}
                    />
                  </Button>
                </Box>
                
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <StyledTable>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.light' }}>
                        <TableCell>Date</TableCell>
                        <TableCell>Day</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {holidays.length > 0 ? (
                        holidays.map(h => (
                          <TableRow key={h.id} hover>
                            <TableCell>
                              {editingId === h.id ? (
                                <TextField
                                  type="date"
                                  value={holidayEdits[h.id]?.date || h.date}
                                  onChange={e => handleHolidayEdit(h.id, 'date', e.target.value)}
                                  size="small"
                                  fullWidth
                                />
                              ) : new Date(h.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {editingId === h.id ? (
                                <TextField
                                  value={holidayEdits[h.id]?.day || h.day}
                                  onChange={e => handleHolidayEdit(h.id, 'day', e.target.value)}
                                  size="small"
                                  fullWidth
                                />
                              ) : h.day}
                            </TableCell>
                            <TableCell>
                              {editingId === h.id ? (
                                <TextField
                                  value={holidayEdits[h.id]?.holiday_reason || h.holiday_reason}
                                  onChange={e => handleHolidayEdit(h.id, 'holiday_reason', e.target.value)}
                                  size="small"
                                  fullWidth
                                />
                              ) : h.holiday_reason}
                            </TableCell>
                            <TableCell align="center">
                              {editingId === h.id ? (
                                <>
                                  <ActionButton 
                                    variant="contained" 
                                    color="success" 
                                    size="small" 
                                    onClick={handleSaveHolidayEdits}
                                    startIcon={<CheckCircle />}
                                  >
                                    Save
                                  </ActionButton>
                                  <ActionButton 
                                    variant="outlined" 
                                    color="secondary" 
                                    size="small" 
                                    onClick={() => handleCancelEdit(h.id)}
                                    startIcon={<Cancel />}
                                  >
                                    Cancel
                                  </ActionButton>
                                </>
                              ) : (
                                <>
                                  <ActionButton 
                                    variant="outlined" 
                                    color="primary" 
                                    size="small" 
                                    onClick={() => handleEditClick(h.id)}
                                    startIcon={<Edit />}
                                  >
                                    Edit
                                  </ActionButton>
                                  <ActionButton 
                                    variant="outlined" 
                                    color="error" 
                                    size="small" 
                                    onClick={() => handleDeleteHoliday(h.id)}
                                    startIcon={<Delete />}
                                  >
                                    Delete
                                  </ActionButton>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="textSecondary">
                              No holidays found. Add holidays using the CSV upload.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </StyledTable>
                </TableContainer>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSaveHolidayEdits}
                    disabled={!holidayTableDirty}
                    startIcon={<Save />}
                    sx={{ minWidth: 200 }}
                  >
                    Save Holiday Changes
                  </Button>
                </Box>
              </AccordionDetails>
            </StyledAccordion>
          </CardContent>
        </form>
      </Paper>
      
      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemConfig;