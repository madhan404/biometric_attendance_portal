import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Typography,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Stack,
  Skeleton,
  Avatar,
  useTheme,
  useMediaQuery,
  Grid,
  Chip,
  Paper,
  Tooltip,
  Badge,
  Button,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  HourglassTop as PendingIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday,
  Description,
  EventAvailable,
  SupervisorAccount,
  School,
  Work,
  Business,
  AccessTime,
  PriorityHigh,
  FilterList,
  Search,
  Download,
  Refresh,
  Healing, // Medical leave
  EmojiPeople, // Casual leave
  Person, // Personal leave
  AssignmentInd, // Admission duty
  Assignment, // Exam duty
  MeetingRoom, // Conference
  MedicalServices, // Medical appointment
  HomeWork, // Personal work
  FamilyRestroom, // Family emergency
  WorkOutline, // Official work
  HelpOutline, // Other
  Info, // Permission type
  Event, // Leave type
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

const formatDateRange = (startDate, endDate, timeSlot) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString("en-US", {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}${timeSlot ? ` (${timeSlot})` : ''}`;
    }
    
    return `${start.toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric'
    })} - ${end.toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}`;
  } catch (e) {
    console.error("Error formatting date range", e);
    return "Invalid date";
  }
};

const LeaveApprovalStatus = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;

  // Define all leave types with their icons
  const leaveTypes = [
    { value: "all", label: "All Types", icon: <EventAvailable /> },
    // Leave types
    { 
      value: "leave", 
      label: "Leave", 
      icon: <Event />,
      subtypes: [
        { value: "medical leave", label: "Medical Leave", icon: <Healing /> },
        { value: "casual leave", label: "Casual Leave", icon: <EmojiPeople /> },
        { value: "personal leave", label: "Personal Leave", icon: <Person /> }
      ]
    },
    // On Duty types
    { 
      value: "od", 
      label: "On Duty", 
      icon: <School />,
      subtypes: [
        { value: "admission duty", label: "Admission Duty", icon: <AssignmentInd /> },
        { value: "exam duty", label: "Exam Duty", icon: <Assignment /> },
        { value: "conference", label: "Conference", icon: <MeetingRoom /> }
      ]
    },
    // Permission types
    { 
      value: "permission", 
      label: "Permission", 
      icon: <Info />,
      subtypes: [
        { value: "medical appointment", label: "Medical Appointment", icon: <MedicalServices /> },
        { value: "personal work", label: "Personal Work", icon: <HomeWork /> },
        { value: "family emergency", label: "Family Emergency", icon: <FamilyRestroom /> },
        { value: "official work", label: "Official Work", icon: <WorkOutline /> }
      ]
    },
    { value: "other", label: "Other", icon: <HelpOutline /> }
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

  const getLeaveTypeIcon = (type) => {
    const foundType = leaveTypes.find(t => 
      t.value.toLowerCase() === type?.toLowerCase() ||
      t.subtypes?.some(st => st.value.toLowerCase() === type?.toLowerCase())
    );
    return foundType ? foundType.icon : <EventAvailable />;
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const fetchApprovalStatus = async () => {
    if (!user?.sin_number) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/stdleavests/leavests`,
        { sin_number: user.sin_number }
      );

      const { data } = response;
      if (Array.isArray(data)) {
        const formattedRequests = data.map((request) => {
          const stages = [
          
            { 
              stage: "HoD", 
              status: request.hod_approval || "pending" 
            },
       
            {
              stage: "Principal",
              status: request.principal_approval || "pending",
            },
          ];
          
          let daysUntilLeave = 0;
          try {
            const startDate = new Date(request.startDate);
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
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setLeaveRequests(formattedRequests);
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

  useEffect(() => {
    fetchApprovalStatus();
  }, [user?.sin_number]);

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(request => {
      const matchesSearch = request.request_type?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          request.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "approved" && request.stages.every(s => s.status === "approved")) ||
                          (filterStatus === "pending" && request.stages.some(s => s.status === "pending")) ||
                          (filterStatus === "rejected" && request.stages.some(s => s.status === "rejected"));
      
      const matchesType = filterType === "all" || 
                         request.request_type?.toLowerCase() === filterType.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaveRequests, searchTerm, filterStatus, filterType]);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * requestsPerPage;
    return filteredRequests.slice(startIndex, startIndex + requestsPerPage);
  }, [filteredRequests, currentPage]);

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
        Error Loading Leave Status
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {error}
      </Typography>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Refresh />}
        onClick={fetchApprovalStatus}
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
          : "You haven't submitted any requests yet."}
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
        <Chip 
          label="Submit a request to get started" 
          color="primary" 
          variant="outlined"
        />
      )}
    </LeaveRequestCard>
  );

  if (loading) return renderLoadingSkeleton();
  if (error) return renderErrorState();

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", p: isMobile ? 1 : 2 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
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
          Request Approval Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track the progress of your leave requests
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
              Filter by Leave Type
            </Typography>
          </MenuItem>
          {leaveTypes.map((type) => (
            <MenuItem 
              key={type.value}
              onClick={() => handleTypeFilter(type.value)} 
              selected={filterType === type.value}
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
          onClick={fetchApprovalStatus}
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
            {paginatedRequests.map((leaveData) => {
              let formattedDate = "Date unavailable";
              try {
                formattedDate = new Date(leaveData.createdAt).toLocaleString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
              } catch (e) {
                console.error("Error formatting date", e);
              }

              const activeStep = leaveData.stages ? leaveData.stages.findIndex(
                (stage) => stage.status?.toLowerCase() === "pending"
              ) : -1;

              let overallStatus = "pending";
              try {
                if (leaveData.stages && leaveData.stages.some(
                  (stage) => stage.status?.toLowerCase() === "rejected"
                )) {
                  overallStatus = "rejected";
                } else if (leaveData.stages && leaveData.stages.every(
                  (stage) => stage.status?.toLowerCase() === "approved"
                )) {
                  overallStatus = "approved";
                } else {
                  overallStatus = "pending";
                }
              } catch (e) {
                console.error("Error determining status", e);
              }

              const isUrgent = leaveData.daysUntilLeave >= 0 && 
                              leaveData.daysUntilLeave <= 3 && 
                              overallStatus === "pending";

              return (
                <LeaveRequestCard key={leaveData.request_id} status={overallStatus}>
                  <CompactAccordion 
                    expanded={expanded === leaveData.request_id}
                    onChange={handleAccordionChange(leaveData.request_id)}
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
                                bgcolor: getRequestTypeColor(leaveData.request_type),
                                color: '#fff',
                                width: 40,
                                height: 40,
                              }}
                            >
                              {React.cloneElement(getLeaveTypeIcon(leaveData.request_type), { 
                                sx: { 
                                  fontSize: '1.2rem',
                                  color: '#fff'
                                } 
                              })}
                            </Avatar>
                          </Badge>
                          
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
                            <CompactInfoItem
                              icon={<EventAvailable />}
                              label="Type"
                              value={leaveData.request_type || "Unknown"}
                              tooltip={`${leaveData.request_type || "Request"} Type`}
                            />
                            {leaveData.request_type === 'permission' ? (
                              <>
                                <CompactInfoItem
                                  icon={<CalendarToday />}
                                  label="Date"
                                  value={formatDateRange(leaveData.startDate, leaveData.startDate, leaveData.time_slot)}
                                />
                                <CompactInfoItem
                                  icon={<AccessTime />}
                                  label="Time Slot"
                                  value={leaveData.time_slot || "Not specified"}
                                />
                              </>
                            ) : (
                              <CompactInfoItem
                                icon={<CalendarToday />}
                                label="Dates"
                                value={formatDateRange(leaveData.startDate, leaveData.endDate)}
                              />
                            )}
                            {!isSmallMobile && (
                              <Stack direction="row" alignItems="center">
                                <CompactInfoItem
                                  icon={<Description />}
                                  label="Deadline"
                                  value={`${leaveData.days || 0} day${leaveData.days !== 1 ? "s" : ""}`}
                                />
                                <DaysBadge days={leaveData.daysUntilLeave} />
                              </Stack>
                            )}
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
                            icon={<Description />}
                            label="Reason"
                            value={leaveData.reason || "Not specified"}
                          />
                          {isSmallMobile && (
                            <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
                              <CompactInfoItem
                                icon={<Description />}
                                label="Deadline"
                                value={`${leaveData.days || 0} day${leaveData.days !== 1 ? "s" : ""}`}
                              />
                              <DaysBadge days={leaveData.daysUntilLeave} />
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
                              status={overallStatus}
                              label={overallStatus.toUpperCase()}
                              icon={getStatusIcon(overallStatus)}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Grid>
                      </Grid>

                      {leaveData.reason_Details && (
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
                            {leaveData.reason_Details}
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
                          activeStep={activeStep >= 0 ? activeStep : leaveData.stages?.length || 0}
                        >
                          {(leaveData.stages || []).map((stage, idx) => (
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
                                    status={stage.status?.toLowerCase()}
                                    label={stage.status || "pending"}
                                    size="small"
                                  />
                                </Box>
                              </StepLabel>
                            </Step>
                          ))}
                        </CompactStepper>
                      </Box>

                      {leaveData.pdf_data && (
                        <Box mt={3}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Attached Document
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Download />}
                              component="a"
                              href={`data:application/pdf;base64,${leaveData.pdf_data}`}
                              download={`request_${leaveData.request_id}.pdf`}
                            >
                              Download
                            </Button>
                          </Stack>
                          <Box
                            sx={{
                              borderRadius: 1,
                              overflow: "hidden",
                              border: `1px solid ${theme.palette.divider}`,
                              height: 300,
                              width: '100%'
                            }}
                          >
                            <iframe
                              src={`data:application/pdf;base64,${leaveData.pdf_data}`}
                              width="100%"
                              height="100%"
                              title="Request Document"
                              style={{ border: "none" }}
                            />
                          </Box>
                        </Box>
                      )}
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
    </Box>
  );
};

export default LeaveApprovalStatus;