import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Avatar,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Divider,
  Badge,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem
} from "@mui/material";
import {
  Visibility,
  Check,
  Close,
  PictureAsPdf,
  Image,
  Description,
  Event,
  School,
  Work,
  CalendarToday,
  AccessTime,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  HourglassTop as PendingIcon,
  Cancel as CancelIcon,
  Info,
  SupervisorAccount,
  Business,
  PriorityHigh,
  Refresh,
  FilterList,
  Person,
  EventAvailable,
  Search,
  Download,
  LocalHospital,
  Groups,
  EmojiEvents,
  CastForEducation,
  Build
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';
// Styled components
const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  textTransform: "uppercase",
  padding: theme.spacing(0.5, 1),
  ...(status === "approved" && {
    backgroundColor: theme.palette.success.lighter,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}`,
  }),
  ...(status === "pending" && {
    backgroundColor: theme.palette.warning.lighter,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}`,
  }),
  ...(status === "rejected" && {
    backgroundColor: theme.palette.error.lighter,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}`,
  }),
}));

const LeaveRequestCard = styled(Paper)(({ theme, status }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: theme.shadows[2],
  transition: 'all 0.2s ease',
  borderLeft: `4px solid ${status === 'approved' ? theme.palette.success.main : 
               status === 'rejected' ? theme.palette.error.main : 
               theme.palette.warning.main}`,
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}));

const CompactAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'transparent',
  boxShadow: 'none',
  '&:before': {
    display: 'none'
  },
  '&.Mui-expanded': {
    margin: 0
  }
}));

const CompactStepper = styled(Stepper)(({ theme }) => ({
  backgroundColor: "transparent",
  padding: theme.spacing(2, 0),
  "& .MuiStepLabel-label": {
    fontSize: theme.typography.pxToRem(12),
  },
  "& .MuiStepConnector-line": {
    borderColor: theme.palette.divider
  },
  [theme.breakpoints.down('sm')]: {
    "& .MuiStepLabel-label": {
      display: 'none'
    },
    "& .MuiStep-root": {
      padding: theme.spacing(0, 1)
    }
  }
}));

const CompactInfoItem = ({ icon, label, value, tooltip }) => (
  <Tooltip title={tooltip || value} arrow>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 2 }}>
      {React.cloneElement(icon, { fontSize: "small", color: "action" })}
      <Typography variant="body2" noWrap>
        <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>{label}: </Box>
        <Box component="span" sx={{ color: 'text.primary' }}>{value}</Box>
      </Typography>
    </Stack>
  </Tooltip>
);

const DaysBadge = ({ days }) => {
  const theme = useTheme();
  let color = 'default';
  let variant = 'outlined';
  
  if (days < 0) {
    color = 'default';
  } else if (days <= 1) {
    color = 'error';
    variant = 'filled';
  } else if (days <= 3) {
    color = 'warning';
  } else {
    color = 'success';
  }

  return (
    <Chip
      size="small"
      color={color}
      variant={variant}
      icon={<AccessTime fontSize="small" />}
      label={`${days < 0 ? 'Past' : days === 0 ? 'Today' : `${days} day${days !== 1 ? 's' : ''}`}`}
      sx={{ 
        fontWeight: 600,
        ml: 1 
      }}
    />
  );
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return <CheckCircleIcon color="success" fontSize="small" />;
    case "pending":
      return <PendingIcon color="warning" fontSize="small" />;
    case "rejected":
      return <CancelIcon color="error" fontSize="small" />;
    default:
      return null;
  }
};

const getStageIcon = (stage) => {
  switch (stage.toLowerCase()) {
    case "hod":
      return <Work fontSize="small" />;
    case "principal":
      return <School fontSize="small" />;
    default:
      return null;
  }
};

const HODRequestManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [approving, setApproving] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const requestsPerPage = 5;

  // Define all request types with their icons
  const requestTypes = [
    { value: "all", label: "All Types", icon: <EventAvailable /> },
    { 
      value: "leave", 
      label: "Leave", 
      icon: <Event />,
      subtypes: [
        { value: "medical leave", label: "Medical Leave", icon: <LocalHospital /> },
        { value: "casual leave", label: "Casual Leave", icon: <Event /> },
        { value: "personal leave", label: "Personal Leave", icon: <Person /> }
      ]
    },
    { 
      value: "od", 
      label: "On Duty", 
      icon: <School />,
      subtypes: [
        { value: "admission duty", label: "Admission Duty", icon: <Groups /> },
        { value: "exam duty", label: "Exam Duty", icon: <School /> },
        { value: "conference", label: "Conference", icon: <Groups /> }
      ]
    },
    { 
      value: "permission", 
      label: "Permission", 
      icon: <Info />,
      subtypes: [
        { value: "medical appointment", label: "Medical Appointment", icon: <LocalHospital /> },
        { value: "personal work", label: "Personal Work", icon: <Person /> },
        { value: "family emergency", label: "Family Emergency", icon: <Groups /> },
        { value: "official work", label: "Official Work", icon: <Work /> }
      ]
    },
    { value: "other", label: "Other", icon: <Info /> }
  ];

  const getRequestTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "leave":
        return "primary.main";
      case "od":
        return "secondary.main";
      case "permission":
        return "info.main";
      case "other":
        return "text.secondary";
      default:
        return "text.secondary";
    }
  };

  const getRequestTypeIcon = (type) => {
    const foundType = requestTypes.find(t => 
      t.value.toLowerCase() === type?.toLowerCase() ||
      t.subtypes?.some(st => st.value.toLowerCase() === type?.toLowerCase())
    );
    return foundType ? foundType.icon : <EventAvailable />;
  };

  // Get user from sessionStorage when component mounts
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.sin_number) {
          setUser(parsedUser);
        } else {
          setError("Invalid user data in session storage");
          setLoading(false);
        }
      } catch (e) {
        setError("Failed to parse user data");
        setLoading(false);
      }
    } else {
      setError("No user data found");
      setLoading(false);
    }
  }, []);

  // Fetch leave requests when user is available
  const fetchLeaveRequests = async () => {
    if (!user || !user.sin_number) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/hod-staff-leavests`,
        {
          sin_number: user.sin_number,
          department: user.department
        }
      );

      if (response.data?.requests) {
        const formattedRequests = response.data.requests.map((request) => {
          const stages = [
            { 
              stage: "HoD", 
              status: request.approvals.hod_approval || "pending" 
            },
            {
              stage: "Principal",
              status: request.approvals.principal_approval || "pending",
            },
          ];
          
          let daysUntilLeave = 0;
          try {
            const startDate = new Date(request.dates.start);
            const currentDate = new Date();
            daysUntilLeave = Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24));
          } catch (e) {
            console.error("Error calculating days until leave", e);
          }
          
          return { 
            ...request, 
            stages,
            daysUntilLeave,
            days: request.days || Math.abs(daysUntilLeave)
          };
        });

        formattedRequests.sort(
          (a, b) => new Date(b.dates.applied) - new Date(a.dates.applied)
        );

        setRequests(formattedRequests);
        if (formattedRequests.length > 0) {
          setExpanded(formattedRequests[0].request_id);
        }
      } else {
        setError("Failed to fetch leave status.");
      }
    } catch (err) {
      setError(err.message || "Error fetching leave status.");
    } finally {
      setLoading(false);
    }
  };

  // Call fetchLeaveRequests when user changes
  useEffect(() => {
    if (user && user.sin_number) {
      fetchLeaveRequests();
    }
  }, [user]);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = request.class_advisor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          request.request_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "approved" && request.approvals.hod_approval === "approved") ||
                          (filterStatus === "pending" && request.approvals.hod_approval === "pending") ||
                          (filterStatus === "rejected" && request.approvals.hod_approval === "rejected");
      
      const matchesType = filterType === "all" || 
                         request.request_type?.toLowerCase() === filterType.toLowerCase() ||
                         requestTypes.some(
                           t => t.subtypes?.some(st => st.value === filterType && 
                                 request.request_type?.toLowerCase() === st.value.toLowerCase())
                         );
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, searchTerm, filterStatus, filterType]);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * requestsPerPage;
    return filteredRequests.slice(startIndex, startIndex + requestsPerPage);
  }, [filteredRequests, currentPage]);

  const handleRequestAction = async (requestId, action) => {
    try {
      setApproving(true);
      const response = await axios.post(
        `${API_BASE_URL}/hod-staff-approve-request`,
        {
          request_id: requestId,
          approval_status: action === "Completed" ? "approved" : "rejected",
          approver_sin: user.sin_number,
          approver_name: user.name,
        }
      );

      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.request_id === requestId
            ? {
                ...request,
                approvals: {
                  ...request.approvals,
                  hod_approval:
                    action === "Completed" ? "approved" : "rejected",
                  hod_approver: {
                    name: user.name,
                    sin: user.sin_number,
                    timestamp: new Date().toISOString(),
                  },
                },
                stages: request.stages.map(stage => 
                  stage.stage === "HoD" 
                    ? { ...stage, status: action === "Completed" ? "approved" : "rejected" }
                    : stage
                )
              }
            : request
        )
      );

      setNotification({
        open: true,
        message: `Request ${action === "Completed" ? "approved" : "rejected"} successfully`,
        severity: action === "Completed" ? "success" : "error",
      });

      setOpenModal(false);
    } catch (error) {
      console.error("Error approving request:", error);
      setNotification({
        open: true,
        message: `Failed to ${action === "Completed" ? "approve" : "reject"} request`,
        severity: "error",
      });
    } finally {
      setApproving(false);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const handleFilePreview = (file) => {
    setFilePreview({
      name: 'request.pdf',
      type: "application/pdf",
      url: file,
    });
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
    handleFilterClose();
  };

  const handleTypeFilter = (type) => {
    setFilterType(type);
    setCurrentPage(1);
    handleFilterClose();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterType("all");
    setCurrentPage(1);
  };

  const renderLoadingSkeleton = () => (
    <Box sx={{ maxWidth: 1200, margin: "auto", p: isMobile ? 2 : 3 }}>
      <Skeleton 
        variant="rounded" 
        width={300} 
        height={40} 
        sx={{ mx: "auto", mb: 4 }} 
      />
      {[...Array(3)].map((_, index) => (
        <LeaveRequestCard key={index} elevation={2} sx={{ p: 2, mb: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Skeleton variant="rounded" width="40%" height={24} />
              <Skeleton variant="circular" width={32} height={32} />
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="rounded" height={20} width="80%" />
                <Skeleton variant="rounded" height={20} width="60%" sx={{ mt: 1 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="rounded" height={20} width="80%" />
                <Skeleton variant="rounded" height={20} width="60%" sx={{ mt: 1 }} />
              </Grid>
            </Grid>
            <Skeleton variant="rounded" height={60} sx={{ mt: 1 }} />
          </Stack>
        </LeaveRequestCard>
      ))}
    </Box>
  );

  const renderErrorState = () => (
    <LeaveRequestCard sx={{ 
      maxWidth: 800,
      margin: "auto",
      p: 3,
      textAlign: "center",
      borderLeft: `4px solid ${theme.palette.error.main}`
    }}>
      <CancelIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h6" color="error" gutterBottom>
        Error Loading Requests
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {error}
      </Typography>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Refresh />}
        onClick={fetchLeaveRequests}
        sx={{ mr: 2 }}
      >
        Retry
      </Button>
      <Chip 
        label="Please try again later" 
        color="error" 
        variant="outlined"
      />
    </LeaveRequestCard>
  );

  const renderEmptyState = () => (
    <LeaveRequestCard sx={{ 
      maxWidth: 600,
      margin: "auto",
      p: 3,
      textAlign: "center",
      borderLeft: `4px solid ${theme.palette.primary.main}`
    }}>
      <EventAvailable color="primary" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h6" gutterBottom>
        No Requests Found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filterStatus !== "all" || filterType !== "all" || searchTerm
          ? "No requests match your current filters."
          : "There are currently no pending requests for your department."}
      </Typography>
      {(filterStatus !== "all" || filterType !== "all" || searchTerm) ? (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleResetFilters}
        >
          Clear Filters
        </Button>
      ) : (
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchLeaveRequests}
          startIcon={<Refresh />}
        >
          Refresh
        </Button>
      )}
    </LeaveRequestCard>
  );

  const renderRequestDetailsModal = () => (
    <Dialog
      open={openModal}
      onClose={() => setOpenModal(false)}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      {selectedRequest && (
        <>
          <DialogTitle sx={{ 
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Avatar 
              src={`data:image/jpeg;base64,${selectedRequest.photo}`}
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid white'
              }}
            />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedRequest.class_advisor_name}
              </Typography>
              <Typography variant="subtitle2">
                {selectedRequest.department} • {selectedRequest.role}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: isMobile ? 1 : 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                    Request Details
                  </Typography>
                  <Stack spacing={2}>
                    <CompactInfoItem
                      icon={<Description />}
                      label="Type"
                      value={selectedRequest.request_type.charAt(0).toUpperCase() + 
                           selectedRequest.request_type.slice(1)}
                    />
                    
                    {selectedRequest.request_type === 'permission' ? (
                      <>
                        <CompactInfoItem
                          icon={<CalendarToday />}
                          label="Date"
                          value={`${new Date(selectedRequest.dates.start).toLocaleDateString()}`}
                        />
                        <CompactInfoItem
                          icon={<AccessTime />}
                          label="Time Slot"
                          value={`${selectedRequest.time_slot}`}
                        />
                      </>
                    ) : (
                      <CompactInfoItem
                        icon={<CalendarToday />}
                        label="Dates"
                        value={`${new Date(selectedRequest.dates.start).toLocaleDateString()} - ${new Date(selectedRequest.dates.end).toLocaleDateString()}`}
                      />
                    )}
                    
                    <CompactInfoItem
                      icon={<AccessTime />}
                      label="Submitted On"
                      value={new Date(selectedRequest.dates.applied).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    />
                    
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Reason
                      </Typography>
                      <Typography>{selectedRequest.reason}</Typography>
                    </Box>
                    
                    {selectedRequest.reason_details && (
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Details
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-line' }}>
                          {selectedRequest.reason_details}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {selectedRequest.pdf_path && (
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                      Attachments
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdf />}
                      onClick={() => handleFilePreview(selectedRequest.pdf_path)}
                      size={isMobile ? "small" : "medium"}
                    >
                      View Document
                    </Button>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                    Approval Progress
                  </Typography>
                  <CompactStepper
                    alternativeLabel
                    activeStep={selectedRequest.stages.findIndex(
                      (stage) => stage.status.toLowerCase() === "pending"
                    )}
                  >
                    {selectedRequest.stages.map((stage, idx) => (
                      <Step key={idx}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Box sx={{ position: 'relative' }}>
                              {getStatusIcon(stage.status)}
                              <Box sx={{ 
                                position: 'absolute', 
                                bottom: -4, 
                                right: -4,
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: '50%',
                                padding: '2px',
                                border: `1px solid ${theme.palette.divider}`
                              }}>
                                {getStageIcon(stage.stage)}
                              </Box>
                            </Box>
                          )}
                        >
                          <Typography variant="caption" fontWeight="500">
                            {stage.stage}
                          </Typography>
                          <Box mt={0.5}>
                            <StatusBadge 
                              status={stage.status.toLowerCase()}
                              label={stage.status || "pending"}
                              size="small"
                            />
                          </Box>
                        </StepLabel>
                      </Step>
                    ))}
                  </CompactStepper>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            {selectedRequest.approvals.hod_approval === "pending" && (
              <>
                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<Close />}
                  onClick={() =>
                    handleRequestAction(selectedRequest.request_id, "Rejected")
                  }
                  disabled={approving}
                  size={isMobile ? "small" : "medium"}
                >
                  {approving ? <CircularProgress size={24} /> : "Reject"}
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  startIcon={<Check />}
                  onClick={() =>
                    handleRequestAction(selectedRequest.request_id, "Completed")
                  }
                  disabled={approving}
                  size={isMobile ? "small" : "medium"}
                >
                  {approving ? <CircularProgress size={24} /> : "Approve"}
                </Button>
              </>
            )}
            <Button 
              onClick={() => setOpenModal(false)}
              size={isMobile ? "small" : "medium"}
            >
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  const renderFilePreviewModal = () => (
    <Dialog
      open={!!filePreview}
      onClose={() => setFilePreview(null)}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>{filePreview?.name}</DialogTitle>
      <DialogContent>
        {filePreview?.type === "application/pdf" ? (
          <iframe
            src={`data:application/pdf;base64,${filePreview.url}`}
            width="100%"
            height={isMobile ? "300px" : "500px"}
            title="PDF Preview"
            style={{ border: "none" }}
          />
        ) : filePreview?.type.startsWith("image/") ? (
          <img
            src={`data:image/*;base64,${filePreview.url}`}
            alt="Attachment"
            style={{
              maxWidth: "100%",
              maxHeight: isMobile ? "300px" : "500px",
              objectFit: "contain",
            }}
          />
        ) : (
          <Typography>Unable to preview this file type</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          href={`data:application/pdf;base64,${filePreview?.url}`}
          target="_blank"
          download={filePreview?.name}
          size={isMobile ? "small" : "medium"}
          startIcon={<PictureAsPdf />}
        >
          Download
        </Button>
        <Button 
          onClick={() => setFilePreview(null)} 
          color="secondary"
          size={isMobile ? "small" : "medium"}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Early return if no user
  if (!user) {
    return (
      <LeaveRequestCard sx={{ 
        maxWidth: 800,
        margin: "auto",
        p: 3,
        textAlign: "center",
        borderLeft: `4px solid ${theme.palette.error.main}`
      }}>
        <CancelIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" color="error" gutterBottom>
          User Information Not Available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please log in again to access this page.
        </Typography>
      </LeaveRequestCard>
    );
  }

  // Loading state
  if (loading) return renderLoadingSkeleton();
  if (error) return renderErrorState();

  return (
    <Box sx={{ maxWidth: 1450, margin: "auto", p: isMobile ? 1 : 2 }}>
      <Box sx={{ textAlign: "center", mb: 4, mt: -2 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.dark,
            letterSpacing: 0.5,
            fontSize: isMobile ? '1.75rem' : '2.125rem'
          }}
        >
          Staff Request Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve staff leave/OD/permission requests
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', flexDirection: isSmallMobile ? 'column' : 'row', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            minWidth: isSmallMobile ? '100%' : 300,
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={handleFilterClick}
          sx={{ minWidth: 120 }}
        >
          Filters
        </Button>
        
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            style: {
              maxHeight: 400,
              width: 250,
            },
          }}
        >
          <MenuItem dense disabled>
            <Typography variant="subtitle2" color="text.secondary">
              Filter by Status
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => handleStatusFilter("all")} selected={filterStatus === "all"}>
            All Statuses
          </MenuItem>
          <MenuItem onClick={() => handleStatusFilter("approved")} selected={filterStatus === "approved"}>
            Approved
          </MenuItem>
          <MenuItem onClick={() => handleStatusFilter("pending")} selected={filterStatus === "pending"}>
            Pending
          </MenuItem>
          <MenuItem onClick={() => handleStatusFilter("rejected")} selected={filterStatus === "rejected"}>
            Rejected
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem dense disabled>
            <Typography variant="subtitle2" color="text.secondary">
              Filter by Request Type
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("all")} selected={filterType === "all"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <EventAvailable fontSize="small" />
              <span>All Types</span>
            </Stack>
          </MenuItem>
          
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 1, display: 'block' }}>
            Leave Types
          </Typography>
          <MenuItem onClick={() => handleTypeFilter("leave")} selected={filterType === "leave"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Event fontSize="small" />
              <span>Leave</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("medical leave")} selected={filterType === "medical leave"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocalHospital fontSize="small" />
              <span>Medical Leave</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("casual leave")} selected={filterType === "casual leave"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Event fontSize="small" />
              <span>Casual Leave</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("personal leave")} selected={filterType === "personal leave"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Person fontSize="small" />
              <span>Personal Leave</span>
            </Stack>
          </MenuItem>
          
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 1, display: 'block' }}>
            On Duty Types
          </Typography>
          <MenuItem onClick={() => handleTypeFilter("od")} selected={filterType === "od"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <School fontSize="small" />
              <span>On Duty</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("admission duty")} selected={filterType === "admission duty"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Groups fontSize="small" />
              <span>Admission Duty</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("exam duty")} selected={filterType === "exam duty"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <School fontSize="small" />
              <span>Exam Duty</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("conference")} selected={filterType === "conference"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Groups fontSize="small" />
              <span>Conference</span>
            </Stack>
          </MenuItem>
          
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 1, display: 'block' }}>
            Permission Types
          </Typography>
          <MenuItem onClick={() => handleTypeFilter("permission")} selected={filterType === "permission"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Info fontSize="small" />
              <span>Permission</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("medical appointment")} selected={filterType === "medical appointment"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocalHospital fontSize="small" />
              <span>Medical Appointment</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("personal work")} selected={filterType === "personal work"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Person fontSize="small" />
              <span>Personal Work</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("family emergency")} selected={filterType === "family emergency"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Groups fontSize="small" />
              <span>Family Emergency</span>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => handleTypeFilter("official work")} selected={filterType === "official work"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Work fontSize="small" />
              <span>Official Work</span>
            </Stack>
          </MenuItem>
          
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 1, display: 'block' }}>
            Other Types
          </Typography>
          <MenuItem onClick={() => handleTypeFilter("other")} selected={filterType === "other"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Info fontSize="small" />
              <span>Other</span>
            </Stack>
          </MenuItem>
        </Menu>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchLeaveRequests}
          sx={{ minWidth: 120 }}
        >
          Refresh
        </Button>
      </Box>

      {filteredRequests.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <Stack spacing={2}>
            {paginatedRequests.map((request) => {
              const formattedDate = new Date(request.dates.applied).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              const activeStep = request.stages.findIndex(
                (stage) => stage.status.toLowerCase() === "pending"
              );

              const hodStatus = request.approvals.hod_approval || "pending";

              const isUrgent = request.daysUntilLeave >= 0 && 
                             request.daysUntilLeave <= 3 && 
                             hodStatus === "pending";

              return (
                <LeaveRequestCard key={request.request_id} status={hodStatus}>
                  <CompactAccordion 
                    expanded={expanded === request.request_id}
                    onChange={handleAccordionChange(request.request_id)}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        minHeight: 56,
                        '&.Mui-expanded': {
                          minHeight: 56,
                        },
                        p: 2
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                        spacing={1}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ overflow: 'hidden' }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              isUrgent ? (
                                <PriorityHigh color="error" fontSize="small" />
                              ) : null
                            }
                          >
                            <Avatar
                              src={`data:image/jpeg;base64,${request.photo}`}
                              sx={{ width: 40, height: 40 }}
                            />
                          </Badge>
                          
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
                            <CompactInfoItem
                              icon={<Person />}
                              label="Staff"
                              value={request.class_advisor_name}
                            />
                            <CompactInfoItem
                              icon={<Event />}
                              label="Type"
                              value={request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1)}
                            />
                            {request.request_type === 'permission' ? (
                              <>
                                <CompactInfoItem
                                  icon={<CalendarToday />}
                                  label="Date"
                                  value={`${new Date(request.dates.start).toLocaleDateString()}`}
                                />
                                <CompactInfoItem
                                  icon={<AccessTime />}
                                  label="Time Slot"
                                  value={`${request.time_slot}`}
                                />
                              </>
                            ) : (
                              <CompactInfoItem
                                icon={<CalendarToday />}
                                label="Dates"
                                value={`${new Date(request.dates.start).toLocaleDateString()} - ${new Date(request.dates.end).toLocaleDateString()}`}
                              />
                            )}
                            <Stack direction="row" alignItems="center">
                              <DaysBadge days={request.daysUntilLeave} />
                            </Stack>
                          </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          {!isSmallMobile && (
                            <StatusBadge 
                              status={hodStatus}
                              label={hodStatus.toUpperCase()}
                              icon={getStatusIcon(hodStatus)}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </AccordionSummary>

                    <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={6}>
                          <CompactInfoItem
                            icon={<Description />}
                            label="Reason"
                            value={request.reason || "Not specified"}
                          />
                          {isSmallMobile && (
                            <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
                              {request.request_type === 'permission' ? (
                                <>
                                  <CompactInfoItem
                                    icon={<CalendarToday />}
                                    label="Date"
                                    value={`${new Date(request.dates.start).toLocaleDateString()}`}
                                  />
                                  <CompactInfoItem
                                    icon={<AccessTime />}
                                    label="Time Slot"
                                    value={`${request.time_slot}`}
                                  />
                                </>
                              ) : (
                                <CompactInfoItem
                                  icon={<CalendarToday />}
                                  label="Dates"
                                  value={`${new Date(request.dates.start).toLocaleDateString()} - ${new Date(request.dates.end).toLocaleDateString()}`}
                                />
                              )}
                              <DaysBadge days={request.daysUntilLeave} />
                            </Stack>
                          )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CompactInfoItem
                            icon={<CalendarToday />}
                            label="Submitted"
                            value={formattedDate}
                          />
                          {isSmallMobile && (
                            <StatusBadge 
                              status={hodStatus}
                              label={hodStatus.toUpperCase()}
                              icon={getStatusIcon(hodStatus)}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Grid>
                      </Grid>

                      {request.reason_details && (
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          backgroundColor: theme.palette.grey[50],
                          borderRadius: 1
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Additional Details:
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                            {request.reason_details}
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />

                      <Box>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                          Approval Progress
                        </Typography>
                        <CompactStepper
                          alternativeLabel
                          activeStep={activeStep >= 0 ? activeStep : request.stages.length}
                        >
                          {request.stages.map((stage, idx) => (
                            <Step key={idx}>
                              <StepLabel
                                StepIconComponent={() => (
                                  <Box sx={{ position: 'relative' }}>
                                    {getStatusIcon(stage.status)}
                                    <Box sx={{ 
                                      position: 'absolute', 
                                      bottom: -4, 
                                      right: -4,
                                      backgroundColor: theme.palette.background.paper,
                                      borderRadius: '50%',
                                      padding: '2px',
                                      border: `1px solid ${theme.palette.divider}`,
                                    }}>
                                      {getStageIcon(stage.stage)}
                                    </Box>
                                  </Box>
                                )}
                              >
                                <Typography variant="caption" fontWeight="500">
                                  {stage.stage}
                                </Typography>
                                <Box mt={0.5}>
                                  <StatusBadge 
                                    status={stage.status.toLowerCase()}
                                    label={stage.status || "pending"}
                                    size="small"
                                  />
                                </Box>
                              </StepLabel>
                            </Step>
                          ))}
                        </CompactStepper>
                      </Box>

                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          endIcon={<Visibility />}
                          onClick={() => {
                            setSelectedRequest(request);
                            setOpenModal(true);
                          }}
                        >
                          View Full Details
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </CompactAccordion>
                </LeaveRequestCard>
              );
            })}
          </Stack>

          {filteredRequests.length > requestsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  disabled={currentPage * requestsPerPage >= filteredRequests.length}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </Stack>
            </Box>
          )}
        </>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {renderRequestDetailsModal()}
      {renderFilePreviewModal()}
    </Box>
  );
};

export default HODRequestManagement;