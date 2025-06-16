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
  IconButton,
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
  LocalHospital,
  Groups,
  EmojiEvents,
  CastForEducation,
  Build,
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

const RequestTypeBadge = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  textTransform: "capitalize",
  padding: theme.spacing(0.5, 1),
  ...(type === "od" && {
    backgroundColor: theme.palette.secondary.lighter,
    color: theme.palette.secondary.dark,
    border: `1px solid ${theme.palette.secondary.main}`,
  }),
  ...(type === "leave" && {
    backgroundColor: theme.palette.info.lighter,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}`,
  }),
  ...(type === "permission" && {
    backgroundColor: theme.palette.warning.lighter,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}`,
  }),
}));

const StaffRequestCard = styled(Paper)(({ theme, status }) => ({
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

const HodRequestTable = () => {
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
    { value: "leave", label: "Leave", icon: <Event /> },
    { value: "od", label: "On Duty", icon: <School /> },
    { value: "permission", label: "Permission", icon: <AccessTime /> },
  ];

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

  const fetchLeaveRequests = async () => {
    if (!user || !user.sin_number) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/principal-hod-leavests`,
        {
          sin_number: user.sin_number
        }
      );

      if (response.data?.staff_leave_requests) {
        const formattedRequests = response.data.staff_leave_requests.map((request) => {
          const stages = [
            {
              stage: "Principal",
              status: request.approval_status.principal || "pending",
            }
          ];
          
          let daysUntilLeave = 0;
          try {
            const startDate = new Date(request.leave_details.start_date);
            const currentDate = new Date();
            daysUntilLeave = Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24));
          } catch (e) {
            console.error("Error calculating days until leave", e);
          }
          
          return { 
            ...request, 
            stages,
            daysUntilLeave,
            days: Math.abs(daysUntilLeave)
          };
        });

        formattedRequests.sort(
          (a, b) => new Date(b.leave_details.applied_on) - new Date(a.leave_details.applied_on)
        );

        setRequests(formattedRequests);
        if (formattedRequests.length > 0) {
          setExpanded(formattedRequests[0].request_id);
        }
      } else {
        setError("Failed to fetch requests.");
      }
    } catch (err) {
      setError(err.message || "Error fetching requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.sin_number) {
      fetchLeaveRequests();
    }
  }, [user]);

  const handleRequestAction = async (requestId, action) => {
    try {
      setApproving(true);
      const response = await axios.post(
        `${API_BASE_URL}/principal-hod-approve-request`,
        {
          request_id: requestId,
          approval_status: action === "Completed" ? "approved" : "rejected",
          approver_sin: user.sin_number,
          approver_name: user.name,
        }
      );

      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.request_id === requestId
            ? {
                ...request,
                approval_status: {
                  ...request.approval_status,
                  principal: action === "Completed" ? "approved" : "rejected",
                  principal_approver: {
                    name: user.name,
                    sin: user.sin_number,
                    timestamp: new Date().toISOString()
                  }
                },
                stages: request.stages.map(stage => 
                  stage.stage === "Principal" 
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
    if (reason === "clickaway") return;
    setNotification({ ...notification, open: false });
  };

  const handleFilePreview = (file) => {
    setFilePreview({
      name: `request.pdf`,
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
      case "principal":
        return <School fontSize="small" />;
      default:
        return null;
    }
  };

  const getApprovalStatus = (request) => {
    if (request.approval_status.principal === "approved") return "approved";
    if (request.approval_status.principal === "rejected") return "rejected";
    return "pending";
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = request.staff_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          request.leave_details?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.leave_details?.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "approved" && getApprovalStatus(request) === "approved") ||
                          (filterStatus === "pending" && getApprovalStatus(request) === "pending") ||
                          (filterStatus === "rejected" && getApprovalStatus(request) === "rejected");
      
      const matchesType = filterType === "all" || 
                         request.leave_details?.type?.toLowerCase() === filterType.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, searchTerm, filterStatus, filterType]);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * requestsPerPage;
    return filteredRequests.slice(startIndex, startIndex + requestsPerPage);
  }, [filteredRequests, currentPage]);

  const renderLoadingSkeleton = () => (
    <Box sx={{ maxWidth: 1200, margin: "auto", p: isMobile ? 2 : 3 }}>
      <Skeleton 
        variant="rounded" 
        width={300} 
        height={40} 
        sx={{ mx: "auto", mb: 4 }} 
      />
      {[...Array(3)].map((_, index) => (
        <StaffRequestCard key={index} elevation={2} sx={{ p: 2, mb: 2 }}>
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
        </StaffRequestCard>
      ))}
    </Box>
  );

  const renderErrorState = () => (
    <StaffRequestCard sx={{ 
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
    </StaffRequestCard>
  );

  const renderEmptyState = () => (
    <StaffRequestCard sx={{ 
      maxWidth: 600,
      margin: "auto",
      p: 3,
      textAlign: "center",
      borderLeft: `4px solid ${theme.palette.primary.main}`
    }}>
      <EventAvailable color="primary" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h6" gutterBottom>
        No HOD Requests Found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filterStatus !== "all" || filterType !== "all" || searchTerm
          ? "No requests match your current filters."
          : "There are currently no pending requests for your approval."}
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
    </StaffRequestCard>
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
              src={`data:image/jpeg;base64,${selectedRequest.staff_info.photo}`}
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedRequest.staff_info.name}
              </Typography>
              <Typography variant="subtitle2">
                {selectedRequest.staff_info.department} • {selectedRequest.staff_info.role}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: isMobile ? 1 : 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">
                  <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>Email: </Box>
                  <Box component="span" sx={{ color: 'text.primary' }}>{selectedRequest.staff_info.email}</Box>
                </Typography>
                <Typography variant="subtitle2">
                  <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>Phone: </Box>
                  <Box component="span" sx={{ color: 'text.primary' }}>{selectedRequest.staff_info.phone}</Box>
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                    Request Details
                  </Typography>
                  <Stack spacing={2}>
                    <CompactInfoItem
                      icon={<Description />}
                      label="Type"
                      value={
                        <RequestTypeBadge 
                          type={selectedRequest.leave_details.type}
                          label={selectedRequest.leave_details.type}
                        />
                      }
                    />
                    
                    {selectedRequest.leave_details.type === 'permission' ? (
                      <CompactInfoItem
                        icon={<Event />}
                        label="Time Slot"
                        value={selectedRequest.leave_details.time_slot}
                      />
                    ) : (
                      <CompactInfoItem
                        icon={<CalendarToday />}
                        label="Dates"
                        value={`${new Date(selectedRequest.leave_details.start_date).toLocaleDateString()} - ${new Date(selectedRequest.leave_details.end_date).toLocaleDateString()}`}
                      />
                    )}
                    
                    <CompactInfoItem
                      icon={<AccessTime />}
                      label="Submitted On"
                      value={new Date(selectedRequest.leave_details.applied_on).toLocaleString("en-IN", {
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
                      <Typography>{selectedRequest.leave_details.reason}</Typography>
                    </Box>
                    
                    {selectedRequest.leave_details.details && (
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Details
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-line' }}>
                          {selectedRequest.leave_details.details}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {selectedRequest.attachments?.pdf_path && (
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                      Attachments
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdf />}
                      onClick={() => handleFilePreview(selectedRequest.attachments.pdf_path)}
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
            {selectedRequest.approval_status.principal === "pending" && (
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
      <StaffRequestCard sx={{ 
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
      </StaffRequestCard>
    );
  }

  // Loading state
  if (loading) return renderLoadingSkeleton();
  if (error) return renderErrorState();

  return (
    <Box sx={{ maxWidth: 1450, margin: "auto", p: isMobile ? 1 : 2 }}>
      <Box sx={{ textAlign: "center", mb: 4, mt: -8 }}>
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
          HOD Request Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve HOD leave/OD/permission requests
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
          
          <MenuItem onClick={() => handleTypeFilter("leave")} selected={filterType === "leave"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Event fontSize="small" />
              <span>Leave</span>
            </Stack>
          </MenuItem>
          
          <MenuItem onClick={() => handleTypeFilter("od")} selected={filterType === "od"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <School fontSize="small" />
              <span>On Duty</span>
            </Stack>
          </MenuItem>
          
          <MenuItem onClick={() => handleTypeFilter("permission")} selected={filterType === "permission"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime fontSize="small" />
              <span>Permission</span>
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
              const formattedDate = new Date(request.leave_details.applied_on).toLocaleString(
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

              const overallStatus = getApprovalStatus(request);
              const isUrgent = request.daysUntilLeave >= 0 && 
                             request.daysUntilLeave <= 3 && 
                             overallStatus === "pending";

              return (
                <StaffRequestCard key={request.request_id} status={overallStatus}>
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
                              src={`data:image/jpeg;base64,${request.staff_info.photo}`}
                              sx={{
                                width: 40,
                                height: 40,
                              }}
                            />
                          </Badge>
                          
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
                            <CompactInfoItem
                              icon={<Person />}
                              label="HOD"
                              value={request.staff_info.name}
                            />
                            <CompactInfoItem
                              icon={<Description />}
                              label="Type"
                              value={
                                <RequestTypeBadge 
                                  type={request.leave_details.type}
                                  label={request.leave_details.type}
                                  size="small"
                                />
                              }
                            />
                            {request.leave_details.type === 'permission' ? (
                              <CompactInfoItem
                                icon={<Event />}
                                label="Time Slot"
                                value={request.leave_details.time_slot}
                              />
                            ) : (
                              <CompactInfoItem
                                icon={<CalendarToday />}
                                label="Dates"
                                value={`${new Date(request.leave_details.start_date).toLocaleDateString()} - ${new Date(request.leave_details.end_date).toLocaleDateString()}`}
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
                              status={overallStatus}
                              label={overallStatus.toUpperCase()}
                              icon={getStatusIcon(overallStatus)}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </AccordionSummary>

                    <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={6}>
                          <CompactInfoItem
                            icon={<Work />}
                            label="Department"
                            value={request.staff_info.department}
                          />
                          <CompactInfoItem
                            icon={<Description />}
                            label="Reason"
                            value={request.leave_details.reason || "Not specified"}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CompactInfoItem
                            icon={<AccessTime />}
                            label="Submitted"
                            value={formattedDate}
                          />
                          {isSmallMobile && (
                            <StatusBadge 
                              status={overallStatus}
                              label={overallStatus.toUpperCase()}
                              icon={getStatusIcon(overallStatus)}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Grid>
                      </Grid>

                      {request.leave_details.details && (
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
                            {request.leave_details.details}
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
                </StaffRequestCard>
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

export default HodRequestTable;