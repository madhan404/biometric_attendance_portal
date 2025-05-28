import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  IconButton,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Container,
  useTheme,
  useMediaQuery,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate } from "react-router-dom";


const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';
const requestTypes = [
  { value: "Leave", label: "Leave Form" },
  { value: "OD", label: "On Duty (OD) Form" },
  { value: "Permission", label: "Permission Form" }
];

const leaveReasons = [
  { value: "Medical Leave", label: "Medical Leave" },
  { value: "Casual Leave", label: "Casual Leave" },
  { value: "Personal Leave", label: "Personal Leave" },
  { value: "Other", label: "Other" },
];

const odReasons = [
  { value: "Admission Duty", label: "Admission Duty" },
  { value: "Exam Duty", label: "Exam Duty" },
  { value: "Faculty Development Program", label: "Faculty Development Program" },
  { value: "Conference", label: "Conference" },
  { value: "Other", label: "Other" },
];

const permissionReasons = [
  { value: "Medical Appointment", label: "Medical Appointment" },
  { value: "Personal Work", label: "Personal Work" },
  { value: "Family Emergency", label: "Family Emergency" },
  { value: "Official Work", label: "Official Work" },
  { value: "Other", label: "Other" },
];

const permissionTimeSlots = [
  { value: "9-10 AM", label: "Morning (9:00 AM - 10:00 AM)" },
  { value: "4-5 PM", label: "Evening (4:00 PM - 5:00 PM)" },
];

const LeaveApplicationForm = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sin_number: "",
    staff_name: "",
    department: "",
    request_type: "",
    reason: "",
    reason_Details: "",
    startDate: "",
    endDate: "",
    hours: "",
    permissionTime: "",
    duration: "",
  });

  const [files, setFiles] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
      setFormData(prev => ({
        ...prev,
        sin_number: user.sin_number || "",
        staff_name: user.name || "",
        department: user.department || "",
      }));
    }
  }, []);

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInTime = end - start;
    return Math.ceil(diffInTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "request_type") {
      setFormData(prev => ({
        ...prev,
        request_type: value,
        reason: "",
        reason_Details: "",
        hours: "",
        startDate: value === "Permission" ? new Date().toISOString().split('T')[0] : "",
        endDate: value === "Permission" ? new Date().toISOString().split('T')[0] : "",
        permissionTime: "",
        duration: "",
      }));
      setFiles([]);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "startDate" || name === "endDate") {
      const duration = calculateDuration(
        name === "startDate" ? value : formData.startDate,
        name === "endDate" ? value : formData.endDate
      );
      setFormData(prev => ({
        ...prev,
        duration: duration,
      }));
    }
  };

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    
    // Validate file types and size
    const validFiles = newFiles.filter(file => {
      if (file.type !== "application/pdf") {
        setSnackbarMessage("Only PDF files are allowed");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSnackbarMessage("File size should be less than 5MB");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Check if dates are in the past
    if (formData.request_type !== "Permission") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (new Date(formData.startDate) < today) {
        setSnackbarMessage("Start date cannot be in the past");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }
      
      if (new Date(formData.endDate) < today) {
        setSnackbarMessage("End date cannot be in the past");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }
    }

    if (!formData.request_type) {
      setSnackbarMessage("Please select a request type");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (!formData.reason) {
      setSnackbarMessage("Please select a reason");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (!formData.reason_Details) {
      setSnackbarMessage("Please provide reason details");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (formData.request_type !== "Permission") {
      if (!formData.startDate || !formData.endDate) {
        setSnackbarMessage("Please select start and end dates");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        setSnackbarMessage("End date must be after start date");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }
    } else {
      if (!formData.permissionTime) {
        setSnackbarMessage("Please select permission time slot");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }
    }

    // Document requirement for all types
    if (files.length === 0 && formData.request_type !== "Permission") {
      setSnackbarMessage("Please upload supporting documents");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Append regular form data
      formDataToSend.append('sin_number', formData.sin_number);
      formDataToSend.append('staff_name', formData.staff_name);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('request_type', formData.request_type);
      formDataToSend.append('reason', formData.reason === "Other" ? formData.reason_Details : formData.reason);
      formDataToSend.append('reason_Details', formData.reason_Details);
      // formDataToSend.append('status', 'submitted');
      
      if (formData.request_type === "Permission") {
        // For permission, use today's date and only append time slot
        const today = new Date().toISOString().split('T')[0];
        formDataToSend.append('startDate', today);
        formDataToSend.append('time_slot', formData.permissionTime);
      } else {
        // For leave/OD, append dates and PDF
        formDataToSend.append('startDate', formData.startDate);
        formDataToSend.append('endDate', formData.endDate);
        if (files.length > 0) {
          formDataToSend.append('pdf', files[0]);
        }
      }

      const response = await axios.post(
        `${API_BASE_URL}/leavereq/staff-leave-req`, 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSnackbarMessage("Application submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setSubmissionSuccess(true);

      // Reset form
      setFormData(prev => ({
        ...prev,
        request_type: "",
        reason: "",
        reason_Details: "",
        startDate: "",
        endDate: "",
        hours: "",
        permissionTime: "",
        duration: ""
      }));
      setFiles([]);

      // Redirect to status page after 3 seconds
      // setTimeout(() => {
      //   navigate("/leave-approval-status");
      // }, 3000);

    } catch (error) {
      console.error("Submission error:", error);
      setSnackbarMessage(error.response?.data?.error || "Failed to submit request");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileUpload = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Supporting Documents *
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ py: 1.5, mb: 1 }}
        >
          Upload Documents (PDF only)
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            hidden
          />
        </Button>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
          Max file size: 5MB per file. Required for all request types.
        </Typography>
        {files.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {files.map((file, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mt: 1,
                  p: 1,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  backgroundColor: '#f5f5f5'
                }}
              >
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
                <IconButton size="small" onClick={() => removeFile(index)}>
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 3,
        mt:1,
      }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              Staff Request Form
            </Typography>
            
            <Grid container spacing={3}>
              {/* Request Type Selection - Improved visibility */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField
                    select
                    name="request_type"
                    label="Request Type *"
                    value={formData.request_type}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) => {
                        return selected ? selected : "Select Request Type";
                      }
                    }}
                    sx={{
                      width: "300px",
                      height: "50px",
                      '& .MuiInputBase-input': {
                        height: '20px',
                        padding: '12px 14px',
                      },
                      '& .MuiOutlinedInput-root': {
                        height: '50px',
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select Request Type</em>
                    </MenuItem>
                    {requestTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              </Grid>

              {/* Staff Information */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Staff Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="SIN Number"
                          name="sin_number"
                          value={formData.sin_number}
                          fullWidth
                          size="small"
                          InputProps={{ 
                            readOnly: true,
                            sx: { height: '45px' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Name"
                          name="staff_name"
                          value={formData.staff_name}
                          fullWidth
                          size="small"
                          InputProps={{ 
                            readOnly: true,
                            sx: { height: '45px' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Department"
                          name="department"
                          value={formData.department}
                          fullWidth
                          size="small"
                          InputProps={{ 
                            readOnly: true,
                            sx: { height: '45px' }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Request Details */}
              {formData.request_type && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        {formData.request_type} Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        {/* Reason Selection - Improved visibility */}
                        <Grid item xs={12}>
                          <TextField
                            select
                            label={`${formData.request_type} Reason *`}
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{
                              shrink: true,
                            }}
                            SelectProps={{
                              displayEmpty: true,
                              renderValue: (selected) => {
                                return selected ? selected : `Select ${formData.request_type} Reason`;
                              }
                            }}
                            sx={{
                              width: "300px",
                              height: "50px",
                              '& .MuiInputBase-input': {
                                height: '20px',
                                padding: '12px 14px',
                              },
                              '& .MuiOutlinedInput-root': {
                                height: '50px',
                              }
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Select {formData.request_type} Reason</em>
                            </MenuItem>
                            {(formData.request_type === "Leave" 
                              ? leaveReasons 
                              : formData.request_type === "OD" 
                                ? odReasons 
                                : formData.request_type === "Permission"
                                ? permissionReasons
                                : []).map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        
                        {/* Reason Details */}
                        <Grid item xs={12}>
                          <TextField
                            label="Reason Details *"
                            name="reason_Details"
                            value={formData.reason_Details}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder={
                              formData.request_type === "Leave" ? "Please explain the reason for your leave" :
                              formData.request_type === "OD" ? "Please provide details about your on duty request" :
                              "Please provide details about your permission request"
                            }
                          />
                        </Grid>

                        {/* Document Upload - Now placed right after reason details */}
                        <Grid item xs={12}>
                          {renderFileUpload()}
                        </Grid>

                        {/* Permission Time Slot */}
                        {formData.request_type === "Permission" && (
                          <Grid item xs={12}>
                            <FormControl component="fieldset">
                              <FormLabel component="legend">Time Slot *</FormLabel>
                              <RadioGroup
                                row
                                name="permissionTime"
                                value={formData.permissionTime}
                                onChange={handleChange}
                              >
                                {permissionTimeSlots.map((slot) => (
                                  <FormControlLabel
                                    key={slot.value}
                                    value={slot.value}
                                    control={<Radio />}
                                    label={slot.label}
                                  />
                                ))}
                              </RadioGroup>
                            </FormControl>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Date Selection - Hidden for Permission */}
              {formData.request_type && formData.request_type !== "Permission" && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Date Selection
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="Start Date *"
                            value={formData.startDate}
                            onChange={(newValue) => {
                              handleChange({
                                target: {
                                  name: "startDate",
                                  value: newValue,
                                },
                              });
                            }}
                            minDate={new Date()}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth 
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                sx={{
                                  '& .MuiInputBase-input': {
                                    height: '20px',
                                    padding: '12px 14px',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: '45px',
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="End Date *"
                            value={formData.endDate}
                            onChange={(newValue) => {
                              handleChange({
                                target: {
                                  name: "endDate",
                                  value: newValue,
                                },
                              });
                            }}
                            minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                sx={{
                                  '& .MuiInputBase-input': {
                                    height: '20px',
                                    padding: '12px 14px',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: '45px',
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Total Duration"
                            name="duration"
                            value={formData.duration ? `${formData.duration} day(s)` : ""}
                            fullWidth
                            size="small"
                            InputProps={{ 
                              readOnly: true,
                              sx: { height: '45px' }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  fullWidth
                  size="large"
                  disabled={isSubmitting || submissionSuccess}
                  sx={{ py: 1.5 }}
                >
                  {isSubmitting ? "Submitting..." : submissionSuccess ? "Submitted Successfully" : "Submit Application"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>

        {/* Success/Error Notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
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

export default LeaveApplicationForm;