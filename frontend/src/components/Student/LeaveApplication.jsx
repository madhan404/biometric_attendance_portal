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
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate } from "react-router-dom";
import LeaveApprovalStatus from "./LeaveApprovalStatus";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';
const leaveTypes = [
  { value: "Leave", label: "Leave Form" },
  { value: "OD", label: "On Duty (OD) Form" },
  { value: "Internship", label: "Internship Form" },
];

const leaveReasons = [
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Other", label: "Other" },
];

const odReasons = [
  { value: "Symposium", label: "Symposium" },
  { value: "Conference", label: "Conference" },
  { value: "Cultural Fest", label: "Cultural Fest" },
  { value: "Sports", label: "Sports" },
  { value: "Other", label: "Other" },
];

const internshipReasons = [
  { value: "Internship", label: "Internship" },
  { value: "Training", label: "Training" },
];

const LeaveApplicationForm = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    sinNumber: "",
    department: "",
    year: "",
    email: "",
    reason: "",
    otherReason: "",
    reason_Details: "",
    odReason: "",
    odOtherReason: "",
    internshipReason: "",
    internshipOtherReason: "",
    startDate: "",
    endDate: "",
    duration: "",
    leaveUploadedFile: null,
    odUploadedFile: null,
    internshipUploadedFile: null,
  });

  const [fileUploadError, setFileUploadError] = useState({
    leave: false,
    od: false,
    internship: false,
  });

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
      setFormData((prevData) => ({
        ...prevData,
        name: user.name || "",
        sinNumber: user.sin_number || "",
        email: user.email || "",
        department: user.department || "",
        year: user.year || "",
      }));
    }
  }, []);

  const [leaveType, setLeaveType] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInTime = end - start;
    return Math.ceil(diffInTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "leaveType") {
      setLeaveType(value);
      setFormData((prev) => ({
        ...prev,
        reason: "",
        otherReason: "",
        odReason: "",
        odOtherReason: "",
        internshipReason: "",
        internshipOtherReason: "",
        leaveUploadedFile: null,
        odUploadedFile: null,
        internshipUploadedFile: null,
      }));
      setFileUploadError({
        leave: false,
        od: false,
        internship: false,
      });
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "reason") {
      setFormData((prevData) => ({
        ...prevData,
        reason: value,
      }));
    }

    if (name === "startDate" || name === "endDate") {
      const duration = calculateDuration(
        name === "startDate" ? value : formData.startDate,
        name === "endDate" ? value : formData.endDate
      );
      setFormData((prevData) => ({
        ...prevData,
        duration: duration,
      }));
    }
  };

  const handleFileUpload = (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset error state
    setFileUploadError(prev => ({
      ...prev,
      [fileType]: false
    }));

    // Validate file type
    if (file.type !== "application/pdf") {
      setSnackbarMessage("Please upload a valid PDF file.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setFileUploadError(prev => ({
        ...prev,
        [fileType]: true
      }));
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setSnackbarMessage("File size must be less than 10MB");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setFileUploadError(prev => ({
        ...prev,
        [fileType]: true
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [`${fileType}UploadedFile`]: file
    }));
  };

  const removeFile = (fileType) => {
    setFormData(prev => ({
      ...prev,
      [`${fileType}UploadedFile`]: null
    }));
    setFileUploadError(prev => ({
      ...prev,
      [fileType]: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setSnackbarMessage("User data not found. Please log in again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    const requestData = new FormData();

    // Add common fields
    requestData.append("sin_number", formData.sinNumber);
    requestData.append("student_name", formData.name);
    requestData.append("department", formData.department);
    requestData.append("year", formData.year);
    requestData.append("startDate", formData.startDate);
    requestData.append("endDate", formData.endDate);
    requestData.append("request_type", leaveType.toLowerCase());

    // Add type-specific fields
    switch (leaveType) {
      case "Leave":
        requestData.append("reason", formData.reason);
        requestData.append("reason_Details", formData.otherReason || "");
        if (formData.leaveUploadedFile) {
          requestData.append("pdf", formData.leaveUploadedFile);
        }
        break;
      case "OD":
        requestData.append("reason", formData.odReason);
        requestData.append("reason_Details", formData.odOtherReason || "");
        if (formData.odUploadedFile) {
          requestData.append("pdf", formData.odUploadedFile);
        }
        break;
      case "Internship":
        requestData.append("reason", formData.internshipReason);
        requestData.append("reason_Details", formData.internshipOtherReason || "");
        if (formData.internshipUploadedFile) {
          requestData.append("pdf", formData.internshipUploadedFile);
        }
        break;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/leavereq/std-request`,
        requestData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSnackbarMessage("Application submitted successfully to your mentor!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setSubmissionSuccess(true);
      resetForm();
      
      // // Redirect to status page after 3 seconds
      // setTimeout(() => {
      //   navigate("/LeaveApprovalStatus");
      // }, 3000);
    } catch (err) {
      console.error("Submission error:", err);
      setSnackbarMessage(
        err.response?.data?.error || "An error occurred while submitting the form."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      reason: "",
      otherReason: "",
      odReason: "",
      odOtherReason: "",
      internshipReason: "",
      internshipOtherReason: "",
      startDate: "",
      endDate: "",
      duration: "",
      leaveUploadedFile: null,
      odUploadedFile: null,
      internshipUploadedFile: null,
    }));
    setLeaveType("");
    setFileUploadError({
      leave: false,
      od: false,
      internship: false,
    });
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.startDate || !formData.endDate) {
      setSnackbarMessage("Please select start and end dates.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setSnackbarMessage("End date must be after start date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    // Type-specific validation
    switch (leaveType) {
      case "Leave":
        if (!formData.reason) {
          setSnackbarMessage("Please select a leave reason.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return false;
        }
        if (!formData.otherReason) {
          setSnackbarMessage("Please provide details for your leave.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return false;
        }
        if (formData.reason === "Sick Leave" && !formData.leaveUploadedFile) {
          setSnackbarMessage("Medical certificate is required for sick leave.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setFileUploadError(prev => ({
            ...prev,
            leave: true
          }));
          return false;
        }
        break;

      case "OD":
        if (!formData.odReason) {
          setSnackbarMessage("Please select an OD reason.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return false;
        }
        if (!formData.odOtherReason) {
          setSnackbarMessage("Please provide the location.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return false;
        }
        if (["Symposium", "Conference"].includes(formData.odReason) && !formData.odUploadedFile) {
          setSnackbarMessage("Supporting document is required.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setFileUploadError(prev => ({
            ...prev,
            od: true
          }));
          return false;
        }
        break;

      case "Internship":
        if (!formData.internshipReason) {
          setSnackbarMessage("Please select an internship type.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return false;
        }
        if (!formData.internshipOtherReason) {
          setSnackbarMessage("Please provide company details.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return false;
        }
        if (!formData.internshipUploadedFile) {
          setSnackbarMessage("Internship letter is required.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setFileUploadError(prev => ({
            ...prev,
            internship: true
          }));
          return false;
        }
        break;

      default:
        setSnackbarMessage("Please select a form type.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
    }

    return true;
  };

  const renderFileUpload = (fileType, label, required = false) => {
    const file = formData[`${fileType}UploadedFile`];
    const error = fileUploadError[fileType];
    
    return (
      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ 
            py: 1.5,
            borderColor: error ? theme.palette.error.main : undefined,
            '&:hover': {
              borderColor: error ? theme.palette.error.main : undefined,
            }
          }}
          color={error ? "error" : "primary"}
        >
          {label} {required && "*"}
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e, fileType)}
            hidden
          />
        </Button>
        {file && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 1,
            p: 1,
            border: '1px solid #ddd',
            borderRadius: 1,
            backgroundColor: '#f5f5f5'
          }}>
            <DescriptionIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </Typography>
            <IconButton size="small" onClick={() => removeFile(fileType)}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {fileType === "leave" 
              ? "Medical certificate is required for sick leave" 
              : fileType === "internship" 
                ? "Internship letter is required" 
                : "Supporting document is required"}
          </Typography>
        )}
        {!error && required && !file && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            {fileType === "leave" 
              ? "Please upload medical certificate (PDF, max 10MB)" 
              : fileType === "internship" 
                ? "Please upload internship letter (PDF, max 10MB)" 
                : "Please upload supporting document (PDF, max 10MB)"}
          </Typography>
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
        mt:-2
      }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              Application Form
            </Typography>
            
            <Grid container spacing={3}>
              {/* Form Type Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    select
                    name="leaveType"
                    label="Form Type *"
                    value={leaveType}
                    onChange={(e) => handleChange({target: {name: 'leaveType', value: e.target.value}})}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) => {
                        if (!selected) {
                          return <Typography sx={{ color: 'text.secondary' }}>Select Form Type</Typography>;
                        }
                        return selected;
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
                      Select Form Type
                    </MenuItem>
                    {leaveTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              </Grid>

              {/* Student Information */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Student Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Name"
                          name="name"
                          value={formData.name}
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
                          label="SIN Number"
                          name="sinNumber"
                          value={formData.sinNumber}
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
                          label="Email"
                          name="email"
                          value={formData.email}
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Year of Study"
                          name="year"
                          value={formData.year}
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

              {/* Leave Type Specific Fields */}
              {leaveType && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        {leaveType} Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      {/* Leave Type Fields */}
                      {leaveType === "Leave" && (
                        <>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                select
                                label="Leave Reason *"
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
                                    if (!selected) {
                                      return <Typography sx={{ color: 'text.secondary' }}>Select Leave Reason</Typography>;
                                    }
                                    return selected;
                                  },
                                  MenuProps: {
                                    PaperProps: {
                                      style: {
                                        maxHeight: 300
                                      }
                                    }
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
                                  Select Leave Reason
                                </MenuItem>
                                {leaveReasons.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <TextField
                                label={formData.reason === "Sick Leave" ? "Medical Details *" : "Leave Details *"}
                                name="otherReason"
                                value={formData.otherReason}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                                placeholder={
                                  formData.reason === "Sick Leave" 
                                    ? "Please describe your illness and symptoms..." 
                                    : "Please provide details about your leave reason..."
                                }
                              />
                            </Grid>
                            
                            {formData.reason === "Sick Leave" && (
                              <Grid item xs={12}>
                                {renderFileUpload(
                                  "leave",
                                  "Upload Medical Certificate (PDF) *",
                                  true
                                )}
                              </Grid>
                            )}
                            {formData.reason === "Other" && (
                              <Grid item xs={12}>
                                {renderFileUpload(
                                  "leave",
                                  "Upload Supporting Document (PDF)",
                                  false
                                )}
                                <Typography variant="caption" color="textSecondary">
                                  Optional: Upload any supporting documents for your leave request
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </>
                      )}

                      {/* OD Type Fields */}
                      {leaveType === "OD" && (
                        <>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                select
                                label="OD Reason *"
                                name="odReason"
                                value={formData.odReason}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                SelectProps={{
                                  displayEmpty: true,
                                  renderValue: (selected) => {
                                    if (!selected) {
                                      return <Typography sx={{ color: 'text.secondary' }}>Select OD Reason</Typography>;
                                    }
                                    return selected;
                                  }
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
                              >
                                <MenuItem value="" disabled>
                                  Select OD Reason
                                </MenuItem>
                                {odReasons.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <TextField
                                label="Location/Details *"
                                name="odOtherReason"
                                value={formData.odOtherReason}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Enter event location, organizer name, and other relevant details"
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              {renderFileUpload(
                                "od",
                                formData.odReason === "Symposium" || formData.odReason === "Conference" 
                                  ? "Upload Supporting Document (PDF) *" 
                                  : "Upload Supporting Document (PDF)",
                                formData.odReason === "Symposium" || formData.odReason === "Conference"
                              )}
                            </Grid>
                          </Grid>
                        </>
                      )}

                      {/* Internship Type Fields */}
                      {leaveType === "Internship" && (
                        <>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                select
                                label="Internship Type *"
                                name="internshipReason"
                                value={formData.internshipReason}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                SelectProps={{
                                  displayEmpty: true,
                                  renderValue: (selected) => {
                                    if (!selected) {
                                      return <Typography sx={{ color: 'text.secondary' }}>Select Internship Type</Typography>;
                                    }
                                    return selected;
                                  }
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
                              >
                                <MenuItem value="" disabled>
                                  Select Internship Type
                                </MenuItem>
                                {internshipReasons.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <TextField
                                label="Company Details *"
                                name="internshipOtherReason"
                                value={formData.internshipOtherReason}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Enter company name, address, your role, and supervisor details"
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              {renderFileUpload(
                                "internship",
                                "Upload Internship Letter (PDF) *",
                                true
                              )}
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Date Selection */}
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
                          minDate={new Date(formData.startDate)}
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

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  fullWidth
                  size="large"
                  disabled={isSubmitting || !leaveType || submissionSuccess}
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