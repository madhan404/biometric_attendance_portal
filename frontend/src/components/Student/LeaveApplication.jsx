import { useState,useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  IconButton,
  Box,
  Grid,
  Card,
  CardContent,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

const initialLeaveBalance = {
  casualLeave: 50000000,
  sickLeave: 3000000,
  festivalLeave: 2000000000,
  od: 59080000000,
  internship: Infinity,
};

const alreadyTakenLeave = {
  casualLeave: 2,
  sickLeave: 1,
  festivalLeave: 0,
  od: 1,
  internship: 2,
};

const leaveTypes = [
  { value: "Leave", label: "Leave" },
  { value: "OD", label: "OD" },
  { value: "Internship", label: "Internship" },
];

const leaveReasons = [
  { value: "Casual Leave", label: "Casual Leave" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Festival Leave", label: "Festival Leave" },
  { value: "Other", label: "Other" },
];

const  LeaveApplicationForm = ()=> {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    sinNumber: "",
    department:"",
    year:"",
    email: "",
    reason: "",
    otherReason: "",
    odReason: "",
    startDate: "",
    endDate: "",
    duration: "",
    uploadedFile: null,
  });

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
      setFormData((prevData) => ({
        ...prevData,
        name: user.student_name || "",
        sinNumber: user.sin_number || "",
        email: user.email || "",
        department : user.department,
        year:user.year,

      }));
    }
  }, []);

  const [leaveType, setLeaveType] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [leaveBalance, setLeaveBalance] = useState({
    casualLeave: initialLeaveBalance.casualLeave - alreadyTakenLeave.casualLeave,
    sickLeave: initialLeaveBalance.sickLeave - alreadyTakenLeave.sickLeave,
    festivalLeave: initialLeaveBalance.festivalLeave - alreadyTakenLeave.festivalLeave,
    od: initialLeaveBalance.od - alreadyTakenLeave.od,
    internship: initialLeaveBalance.internship,
  });
  const [isFormSubmittedToday, setIsFormSubmittedToday] = useState(false);

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInTime = end - start;
    return Math.ceil(diffInTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "leaveType") {
      setLeaveType(value);
    }

    if (name === "reason") {
      setFormData((prevData) => ({
        ...prevData,
        reason: value,
        otherReason: value === "Other" ? prevData.otherReason : "",
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

  const validateForm = () => {
    const duration = formData.duration;

    if (
      !formData.name ||
      !formData.sinNumber ||
      !formData.department ||
      !formData.year ||
      !formData.email ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setSnackbarMessage("Please fill all required fields.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (leaveType === "Leave" && !formData.reason) {
      setSnackbarMessage("Please select a reason.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (formData.reason === "Other" && !formData.otherReason) {
      setSnackbarMessage("Please provide the other reason.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (
      (formData.reason === "Casual Leave" ||
        formData.reason === "Sick Leave" ||
        formData.reason === "Festival Leave") &&
      !formData.otherReason
    ) {
      setSnackbarMessage("Please provide the reason for the leave.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSnackbarMessage("Invalid email format.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (formData.reason === "Casual Leave" && duration > leaveBalance.casualLeave) {
      setSnackbarMessage("Insufficient Casual Leave balance.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (formData.reason === "Sick Leave" && duration > leaveBalance.sickLeave) {
      setSnackbarMessage("Insufficient Sick Leave balance.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    if (formData.reason === "Festival Leave" && duration > leaveBalance.festivalLeave) {
      setSnackbarMessage("Insufficient Festival Leave balance.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    return true;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      console.log("PDF File Uploaded:", file.name);
      // Store file in state (optional)
      setFormData((prevData) => ({ ...prevData, uploadedFile: file }));
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (isFormSubmittedToday) {
    setSnackbarMessage("You have already submitted the form today.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    return;
  }

  if (!user) {
    setSnackbarMessage("User data not found. Please log in again.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    return;
  }

  if (!validateForm()) {
    return;
  }

  if (leaveType === "Internship" && !formData.uploadedFile) {
    setSnackbarMessage("PDF upload is required for internship requests.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    return;
  }

  const duration = formData.duration;

  // Prepare the form data for the API request
  const requestData = new FormData();
  requestData.append("sin_number", formData.sinNumber);
  requestData.append("student_name", formData.name);
  requestData.append("department", formData.department); // Replace with actual department if available
  requestData.append("year", formData.year); // Replace with actual year if available
  requestData.append("startDate", formData.startDate);
  requestData.append("endDate", formData.endDate);
  requestData.append("request_type", leaveType);
  requestData.append("reason", formData.reason);

  // Append the PDF file if it's an internship request
  if (leaveType === "Internship" && formData.uploadedFile) {
    requestData.append("pdf", formData.uploadedFile);
  }

  try {
    // Make the API call to the backend
    const response = await axios.post("http://localhost:3001/api/leavereq/std-request", requestData, {
      headers: {
        "Content-Type": "multipart/form-data", // Required for file uploads
      },
    });

    // Handle the backend response
    if (response.data.message) {
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setIsFormSubmittedToday(true);

      // Update leave balance (if applicable)
      if (formData.reason === "Casual Leave") {
        setLeaveBalance((prev) => ({ ...prev, casualLeave: prev.casualLeave - duration }));
      } else if (formData.reason === "Sick Leave") {
        setLeaveBalance((prev) => ({ ...prev, sickLeave: prev.sickLeave - duration }));
      } else if (formData.reason === "Festival Leave") {
        setLeaveBalance((prev) => ({ ...prev, festivalLeave: prev.festivalLeave - duration }));
      }
    }
  } catch (err) {
    console.error(err);
    setSnackbarMessage(err.response?.data?.error || "An error occurred while submitting the form.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};
  const PDFUploader = () => {
    const [applicationType, setApplicationType] = useState(''); // To track the selected application type
    const [uploadedFile, setUploadedFile] = useState(null); // To track the uploaded file

    // Handle file upload
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file && file.type === 'application/pdf') {
        setUploadedFile(file);
        console.log('PDF File Uploaded:', file.name);
      } else {
        alert('Please upload a valid PDF file.');
      }
    };

    const handleApplicationTypeChange = (event) => {
      setApplicationType(event.target.value);
    };

    return (
      <div>
        
        <select onChange={handleApplicationTypeChange} value={applicationType}>
          <option value="">Select Application Type</option>
          <option value="Internship">Internship</option>
          <option value="Leave">Leave</option>
          <option value="OD">OD</option>
        </select>

        {/* PDF Uploader Input Field */}
        {applicationType === 'Internship' && (
          <div style={{ marginTop: '15px' }}>
            <label
              htmlFor="pdf-upload"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#333',
              }}
            >
              Upload PDF
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf"
                onChange={handleFileUpload}
                style={{
                  display: 'none', // Hide default file input
                }}
              />
              <button
                onClick={() => document.getElementById('pdf-upload').click()}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  fontSize: '14px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  marginRight: '10px',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Choose PDF
              </button>
              {uploadedFile && (
                <p
                  style={{
                    marginTop: '0',
                    color: '#333',
                    fontSize: '12px',
                    marginLeft: '10px',
                    fontStyle: 'italic',
                  }}
                >
                  Uploaded: <strong>{uploadedFile.name}</strong>
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <Box>
      <AppBar color="primary">
        <Toolbar className="head">
          <div className="icon" color="inherit">
            <IconButton color="inherit">
              <CancelIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <Container maxWidth sx={{ mb: 2, mt: 3, p: 0 }}>
        <Box sx={{ mb: 3, mt: 2 }}>
          <FormControl fullWidth>
            <Typography variant="h6">Select Form Type</Typography>
            <TextField
              select
              name="leaveType"
              label="Form Type"
              value={leaveType}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            >
              {leaveTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>

          <Box
            sx={{
              mb: 2,
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* Render leave balance on the right side */}
            <Box sx={{ flex: 1, textAlign: "right" }}>
              {leaveType === "Leave" && formData.reason && (
                <Typography variant="body1">
                  Leave Balance for {formData.reason}:{" "}
                  {formData.reason === "Casual Leave" && leaveBalance.casualLeave}
                  {formData.reason === "Sick Leave" && leaveBalance.sickLeave}
                  {formData.reason === "Festival Leave" && leaveBalance.festivalLeave}
                </Typography>
              )}
              {leaveType === "OD" && (
                <Typography variant="body1">
                  OD Balance: {leaveBalance.od}
                </Typography>
              )}
              {leaveType === "Internship" && (
                <Typography variant="body1">
                  Internship Balance: {leaveBalance.internship}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ mb: 2, mt: 2 }}>
            <Grid container spacing={2}>
              {/* Left side - Form */}
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    display: "inline-block",
                    width: "100%",
                    mb: 2,
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Sin Number"
                          name="sinNumber"
                          value={formData.sinNumber}
                          onChange={handleChange}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          fullWidth
                          required
                        />
                      </Grid>

                      {leaveType === "Leave" && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              select
                              label="Leave Type"
                              name="reason"
                              value={formData.reason}
                              onChange={handleChange}
                              fullWidth
                              required
                           >
                              {leaveReasons.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>

                          {(formData.reason === "Casual Leave" ||
                            formData.reason === "Sick Leave" ||
                            formData.reason === "Festival Leave" ||
                            formData.reason === "Other") && (
                              
                              <Grid item xs={12}>
                                <TextField
                                  label=" Leave Reason"
                                  name="otherReason"
                                  value={formData.otherReason}
                                  onChange={handleChange}
                                  fullWidth
                                  required
                               />
                              </Grid>
                            )}
                        </>
                      )}

                      {leaveType === "OD" && (
                        <Grid item xs={12}>
                          <TextField
                            label="OD Reason"
                            name="odReason"
                            value={formData.odReason}
                            onChange={handleChange}
                            fullWidth
                            required
                          />
                        </Grid>
                      )}

                      {leaveType === "Internship" && (
                        <>
                          <Grid item xs={12}>
                            <TextField
                              label="Internship Reason"
                              name="internshipReason"
                              value={formData.internshipReason}
                              onChange={handleChange}
                              fullWidth
                              required
                            />
                          </Grid>

                            {/* pdf upload  */}
                          <Grid item xs={12}>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleFileUpload}
                              style={{ display: "block", marginTop: "10px" }}
                            />
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Start Date"
                          name="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleChange}
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                          required
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="End Date"
                          name="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={handleChange}
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                          required
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Total Duration (Days)"
                          name="duration"
                          value={formData.duration}
                          fullWidth
                          disabled
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right side - Leave Balance */}
              <Grid item xs={6} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px solid #ccc",
                    borderRadius: "8px", // Increased border-radius for better aesthetics
                    width: "200px", // Reduced width
                    height: "200px", // Reduced height
                    backgroundColor: "#f4f4f9",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Adds a slight shadow for depth
                    position: "relative", // Allows manual positioning
                    left: "200px", // Adjust for manual horizontal positioning
                    top: "60px", // Adjust for manual vertical positioning
                  }}

                >
                  <Typography variant="h6" sx={{ textAlign: "center" }}>
                    Current Leave Balance
                  </Typography>
                  {formData.reason === "Casual Leave" && (
                    <Typography>Casual Leave: {leaveBalance.casualLeave}</Typography>
                  )}
                  {formData.reason === "Sick Leave" && (
                    <Typography>Sick Leave: {leaveBalance.sickLeave}</Typography>
                  )}
                  {formData.reason === "Festival Leave" && (
                    <Typography>Festival Leave: {leaveBalance.festivalLeave}</Typography>
                  )}
                  {leaveType === "OD" && (
                    <Typography>OD: {leaveBalance.od}</Typography>
                  )}
                  {leaveType === "Internship" && (
                    <Typography>Internship: {leaveBalance.internship}</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
            {/* Submit Button */}
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                fullWidth
                sx={{ mt: 7 }}
              >
                Submit
              </Button>
            </Box>
          </Box>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarSeverity}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </Box>
  );
}

export default LeaveApplicationForm;
