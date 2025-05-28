import React, { useState, useEffect, useMemo } from "react";
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
  CalendarToday,
  AccessTime,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  HourglassTop as PendingIcon,
  Cancel as CancelIcon,
  SupervisorAccount,
  School,
  Work,
  Business,
  PriorityHigh,
  Refresh,
  FilterList,
  Person,
  Event,
  Search,
  LocalHospital,
  Groups,
  SportsSoccer,
  School as TrainingIcon,
  MoreHoriz,
  Description,
  EventAvailable
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";

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

const MenteesRequestManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [approving, setApproving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [requestFilter, setRequestFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;

  // Define all request types with their icons
  const requestTypes = [
    { value: "all", label: "All Types", icon: <EventAvailable /> },
    { value: "sick", label: "Sick Leave", icon: <LocalHospital /> },
    { value: "symposium", label: "Symposium", icon: <Groups /> },
    { value: "conference", label: "Conference", icon: <Groups /> },
    { value: "cultural", label: "Cultural Fest", icon: <Groups /> },
    { value: "sports", label: "Sports", icon: <SportsSoccer /> },
    { value: "internship", label: "Internship", icon: <Work /> },
    { value: "training", label: "Training", icon: <TrainingIcon /> },
    { value: "other", label: "Other", icon: <MoreHoriz /> },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses", icon: <EventAvailable /> },
    { value: "approved", label: "Approved", icon: <CheckCircleIcon /> },
    { value: "pending", label: "Pending", icon: <PendingIcon /> },
    { value: "rejected", label: "Rejected", icon: <CancelIcon /> },
  ];

  const getRequestTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "sick":
        return "error.main";
      case "internship":
        return "success.main";
      case "training":
        return "secondary.main";
      case "symposium":
      case "conference":
        return "warning.main";
      case "cultural":
      case "sports":
        return "info.dark";
      default:
        return "primary.main";
    }
  };

  const getRequestTypeIcon = (type) => {
    const foundType = requestTypes.find(t => t.value.toLowerCase() === type?.toLowerCase());
    return foundType ? foundType.icon : <Event />;
  };

  useEffect(() => {
    // Get mentor's sin_number from session storage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.sin_number) {
        throw new Error('Mentor information not available');
      }

      // Fetch mentees list with their leave requests
      const menteesResponse = await axios.get(`${API_BASE_URL}/mentor/mentees/${user.sin_number}`);
      
      if (menteesResponse.data.status === "success") {
        // Process all leave requests from mentees
        const allRequests = menteesResponse.data.mentees.flatMap(mentee => 
          (mentee.leave_requests || []).map(request => ({
            request_id: request.request_id,
            student_name: mentee.name,
            year: mentee.year,
            department: mentee.department,
            request_type: request.request_type,
            reason: request.reason,
            reason_details: request.reason_details,
            dates: {
              start: request.dates.start,
              end: request.dates.end,
              applied: request.dates.applied
            },
            approvals: request.approvals,
            stages: [
              { stage: "Mentor", status: request.approvals.mentor_approval || "pending" },
              { stage: "Class Advisor", status: request.approvals.class_advisor_approval || "pending" },
              { stage: "HoD", status: request.approvals.hod_approval || "pending" },
              ...(request.request_type === "internship" ? [
                { stage: "Placement Officer", status: request.approvals.placement_officer_approval || "pending" }
              ] : []),
              { stage: "Principal", status: request.approvals.principal_approval || "pending" }
            ],
            daysUntilLeave: (() => {
              try {
                const startDate = new Date(request.dates.start);
                const currentDate = new Date();
                return Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24));
              } catch (e) {
                console.error("Error calculating days until leave", e);
                return 0;
              }
            })(),
            pdf_path: request.pdf_path,
            has_attachment: request.has_attachment,
            student_photo: mentee.photo ? `data:image/jpeg;base64,${mentee.photo}` : null,
            current_leave_status: mentee.current_leave_status
          }))
        );

        setRequests(allRequests);
      } else {
        throw new Error(menteesResponse.data.message || 'Failed to fetch mentees');
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.message || "Failed to load requests data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.sin_number) {
      fetchRequests();
    }
  }, [user?.sin_number]);

  const handleRequestAction = async (requestId, action) => {
    try {
      setApproving(true);
      const response = await axios.post(
        `${API_BASE_URL}/mentor/approve-request`,
        {
          request_id: requestId,
          approval_status: action === "Completed" ? "approved" : "rejected",
          approver_sin: user.sin_number,
          approver_name: user.name,
        }
      );

      if (response.data.status === 200) {
        // Update local state with the new approval information
        setRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.request_id === requestId
              ? {
                ...request,
                approvals: {
                  ...request.approvals,
                  mentor_approval: action === "Completed" ? "approved" : "rejected"
                },
                stages: request.stages.map(stage => 
                  stage.stage === "Mentor" 
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
      } else {
        throw new Error(response.data.message || 'Failed to update request');
      }

      setOpenModal(false);
    } catch (error) {
      console.error("Error approving request:", error);
      setNotification({
        open: true,
        message: error.response?.data?.error || `Failed to ${action === "Completed" ? "approve" : "reject"} request`,
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
    if (!file) return;
    
    setFilePreview({
      name: `request.pdf`,
      type: "application/pdf",
      url: file
    });
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
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

  const getOverallStatus = (request) => {
    // Get the mentor approval status
    const mentorStatus = request.approvals.mentor_approval;
    
    if (mentorStatus === 'rejected') {
      return 'rejected';
    }
    
    if (mentorStatus === 'approved') {
      return 'approved';
    }
    
    // Default to pending
    return 'pending';
  };

  const getStageIcon = (stage) => {
    switch (stage.toLowerCase()) {
      case "mentor":
        return <SupervisorAccount fontSize="small" />;
      case "class advisor":
        return <School fontSize="small" />;
      case "hod":
        return <Work fontSize="small" />;
      case "placement officer":
        return <Business fontSize="small" />;
      case "principal":
        return <School fontSize="small" />;
      default:
        return null;
    }
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTypeFilter = (type) => {
    setRequestFilter(type);
    setCurrentPage(1);
    handleFilterClose();
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    handleFilterClose();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRequestFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = request.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          request.request_type?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          request.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = requestFilter === "all" || 
                         request.request_type?.toLowerCase() === requestFilter.toLowerCase();
      
      const status = getOverallStatus(request);

      const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "approved" && status === "approved") ||
                          (statusFilter === "pending" && status === "pending") ||
                          (statusFilter === "rejected" && status === "rejected");
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [requests, searchTerm, requestFilter, statusFilter]);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * requestsPerPage;
    return filteredRequests.slice(startIndex, startIndex + requestsPerPage);
  }, [filteredRequests, currentPage]);

  const renderLoadingSkeleton = () => (
    <Box sx={{ width: '100%', p: isMobile ? 1 : 2 }}>
      <Skeleton variant="rounded" width={300} height={40} sx={{ mx: "auto", mb: 4 }} />
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
    <Box sx={{ width: '100%', p: isMobile ? 1 : 2 }}>
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
          {error || "Failed to load requests"}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchRequests}
          startIcon={<Refresh />}
        >
          Retry
        </Button>
      </LeaveRequestCard>
    </Box>
  );

  const renderEmptyState = () => (
    <Box sx={{ width: '100%', p: isMobile ? 1 : 2 }}>
      <LeaveRequestCard sx={{ 
        maxWidth: 600,
        margin: "auto",
        p: 3,
        textAlign: "center",
        borderLeft: `4px solid ${theme.palette.primary.main}`
      }}>
        <Event color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          No Requests Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {searchTerm || requestFilter !== "all" || statusFilter !== "all"
            ? "No requests match your current filters." 
            : "There are currently no pending requests for your mentees."}
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleResetFilters}
          startIcon={<Refresh />}
        >
          Reset Filters
        </Button>
      </LeaveRequestCard>
    </Box>
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
              sx={{
                width: 40,
                height: 40,
                bgcolor: getRequestTypeColor(selectedRequest.request_type),
                backgroundImage: `url(${selectedRequest.student_photo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {selectedRequest.student_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedRequest.student_name}
              </Typography>
              <Typography variant="subtitle2">
                {selectedRequest.year} Year • {selectedRequest.department}
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
                      icon={<Event />}
                      label="Type"
                      value={selectedRequest.request_type.charAt(0).toUpperCase() + 
                           selectedRequest.request_type.slice(1).replace(/-/g, ' ')}
                    />
                    
                    <CompactInfoItem
                      icon={<CalendarToday />}
                      label="Dates"
                      value={`${new Date(selectedRequest.dates.start).toLocaleDateString()} - ${new Date(selectedRequest.dates.end).toLocaleDateString()}`}
                    />
                    
                    <CompactInfoItem
                      icon={<AccessTime />}
                      label="Submitted On"
                      value={new Date(selectedRequest.dates.applied).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
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
            {selectedRequest.approvals.mentor_approval === "pending" && (
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
      <DialogTitle>Request Document</DialogTitle>
      <DialogContent>
        {filePreview?.type === "application/pdf" ? (
          <iframe
            src={`data:application/pdf;base64,${filePreview.url}`}
            width="100%"
            height={isMobile ? "300px" : "500px"}
            title="PDF Preview"
            style={{ border: "none" }}
          />
        ) : (
          <Box sx={{ 
            height: isMobile ? 300 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            textAlign: 'center'
          }}>
            <PictureAsPdf sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Document Preview
            </Typography>
            <Typography color="text.secondary">
              Unable to preview this file type
            </Typography>
          </Box>
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        p: 3
      }}>
        <Typography variant="h6" color="error">
          User information not available. Please log in.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return renderLoadingSkeleton();
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      mt: isMobile ? -2 : -30,
      ml: isMobile ? -2 : -25,
      p: isMobile ? 1 : 3,
      overflowX: 'hidden'
    }}>
      <Box sx={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        p: isMobile ? 1 : 2
      }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.dark,
              letterSpacing: 0.5
            }}
          >
            Mentees Request Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve student leave/OD/internship requests
          </Typography>
        </Box>

        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 2,
          alignItems: 'center'
        }}>
          <TextField
            size="small"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1,
              minWidth: isMobile ? '100%' : 300,
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
            {statusOptions.map((status) => (
              <MenuItem 
                key={status.value}
                onClick={() => handleStatusFilter(status.value)} 
                selected={statusFilter === status.value}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  {React.cloneElement(status.icon, { fontSize: "small" })}
                  <span>{status.label}</span>
                </Stack>
              </MenuItem>
            ))}
            
            <Divider sx={{ my: 1 }} />
            
            <MenuItem dense disabled>
              <Typography variant="subtitle2" color="text.secondary">
                Filter by Request Type
              </Typography>
            </MenuItem>
            {requestTypes.map((type) => (
              <MenuItem 
                key={type.value}
                onClick={() => handleTypeFilter(type.value)} 
                selected={requestFilter === type.value}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  {React.cloneElement(type.icon, { fontSize: "small" })}
                  <span>{type.label}</span>
                </Stack>
              </MenuItem>
            ))}
          </Menu>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchRequests}
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

                const status = getOverallStatus(request);

                const isUrgent = request.daysUntilLeave >= 0 && 
                               request.daysUntilLeave <= 3 && 
                               status === "pending";

                return (
                  <LeaveRequestCard key={request.request_id} status={status}>
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
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: getRequestTypeColor(request.request_type),
                                  backgroundImage: `url(${request.student_photo})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }}
                              >
                                {request.student_name.charAt(0)}
                              </Avatar>
                            </Badge>
                            
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
                              <CompactInfoItem
                                icon={<Person />}
                                label="Student"
                                value={request.student_name}
                              />
                              <CompactInfoItem
                                icon={<Event />}
                                label="Type"
                                value={request.request_type.charAt(0).toUpperCase() + 
                                     request.request_type.slice(1).replace(/-/g, ' ')}
                              />
                              <CompactInfoItem
                                icon={<CalendarToday />}
                                label="Dates"
                                value={`${new Date(request.dates.start).toLocaleDateString()} - ${new Date(request.dates.end).toLocaleDateString()}`}
                              />
                              <Stack direction="row" alignItems="center">
                                <DaysBadge days={request.daysUntilLeave} />
                              </Stack>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <StatusBadge 
                              status={status}
                              label={status.toUpperCase()}
                              icon={getStatusIcon(status)}
                            />
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
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <CompactInfoItem
                              icon={<CalendarToday />}
                              label="Submitted"
                              value={formattedDate}
                            />
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
    </Box>
  );
};

export default MenteesRequestManagement;