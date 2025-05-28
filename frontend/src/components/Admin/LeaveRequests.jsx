import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
  Alert,
  Snackbar,
  TablePagination,
  InputAdornment,
  Divider,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import axios from 'axios';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    startDate: '',
    endDate: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch leave requests
  const fetchRequests = async (params = {}) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/`, { params });
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching leave requests',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle edit request
  const handleEdit = async () => {
    try {
      // Create a copy of the request without the photo to reduce payload size
      const requestToUpdate = { ...selectedRequest };
      delete requestToUpdate.photo; // Remove photo from the update payload
      
      // Remove any undefined or null values
      Object.keys(requestToUpdate).forEach(key => {
        if (requestToUpdate[key] === undefined || requestToUpdate[key] === null) {
          delete requestToUpdate[key];
        }
      });

      const response = await axios.put(
        `${API_BASE_URL}/${encodeURIComponent(selectedRequest.request_id)}`, 
        requestToUpdate,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Leave request updated successfully',
          severity: 'success',
        });
        setEditDialogOpen(false);
        fetchRequests();
      } else {
        throw new Error(response.data.message || 'Failed to update leave request');
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating leave request',
        severity: 'error',
      });
    }
  };

  // Handle delete request
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/${encodeURIComponent(selectedRequest.request_id)}`
      );
      setSnackbar({
        open: true,
        message: 'Leave request deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      fetchRequests();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting leave request',
        severity: 'error',
      });
    }
  };

  // Handle filter apply
  const handleFilterApply = async () => {
    try {
      await fetchRequests({ search: searchQuery, ...filters });
      setFilterDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error applying filters',
        severity: 'error',
      });
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: '',
      department: '',
      startDate: '',
      endDate: '',
    });
    setSearchQuery('');
    fetchRequests();
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'submitted':
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <HelpIcon fontSize="small" />;
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'approved':
        return <CheckCircleIcon fontSize="small" />;
      case 'rejected':
        return <CancelIcon fontSize="small" />;
      case 'pending':
        return <HelpIcon fontSize="small" />;
      default:
        return <HelpIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'primary.main' }}>
          Leave Requests Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchRequests({ search: e.target.value, ...filters });
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { minWidth: 250 }
            }}
          />
          
          {/* <Button
            startIcon={<FilterIcon />}
            variant="outlined"
            onClick={() => setFilterDialogOpen(true)}
            sx={{ ml: 1 }}
          >
            Filters
          </Button> */}
        </Box>
      </Box>

      {/* Main Content */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Requester</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Dept</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mentor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Advisor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>HOD</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>PO</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Principal</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>Loading leave requests...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (rowsPerPage > 0
                  ? requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : requests
                ).map((request, index) => (
                  <TableRow key={request.request_id} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {page * rowsPerPage + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        #{request.request_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {request.photo ? (
                          <Avatar 
                            src={`data:image/jpeg;base64,${request.photo}`}
                            sx={{ width: 32, height: 32 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {request.student_name?.charAt(0) || request.staff_name?.charAt(0) || request.hod_name?.charAt(0) || 'U'}
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="subtitle2">
                            {request.student_name || request.staff_name || request.hod_name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.year ? `Year ${request.year}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.department || 'N/A'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.request_type || 'N/A'} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">
                          {formatDate(request.startDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          to {formatDate(request.endDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={request.reason_Details || request.reason || 'No reason provided'}>
                        <Typography 
                          variant="body2" 
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 150
                          }}
                        >
                          {request.reason || 'N/A'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    {['mentor', 'class_advisor', 'hod', 'placement_officer', 'principal'].map((approver) => (
                      <TableCell key={approver}>
                        <Chip
                          icon={getStatusIcon(request[`${approver}_approval`])}
                          label={request[`${approver}_approval`] || 'Pending'}
                          color={getStatusColor(request[`${approver}_approval`])}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            textTransform: 'capitalize',
                            minWidth: 80,
                            justifyContent: 'flex-start'
                          }}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit request">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedRequest(request);
                              setEditDialogOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete request">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedRequest(request);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={requests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EditIcon /> Edit Leave Request #{selectedRequest?.request_id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Requester Name"
                  value={selectedRequest.student_name || selectedRequest.staff_name || selectedRequest.hod_name || ''}
                  onChange={(e) => {
                    if (selectedRequest.student_name) {
                      setSelectedRequest({ ...selectedRequest, student_name: e.target.value });
                    } else if (selectedRequest.staff_name) {
                      setSelectedRequest({ ...selectedRequest, staff_name: e.target.value });
                    } else {
                      setSelectedRequest({ ...selectedRequest, hod_name: e.target.value });
                    }
                  }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={selectedRequest.department || ''}
                  onChange={(e) =>
                    setSelectedRequest({ ...selectedRequest, department: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Request Type"
                  value={selectedRequest.request_type || ''}
                  onChange={(e) =>
                    setSelectedRequest({ ...selectedRequest, request_type: e.target.value })
                  }
                  margin="normal"
                >
                  {['Casual', 'Medical', 'Academic', 'Personal', 'Internship', 'Other'].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Year"
                  value={selectedRequest.year || ''}
                  onChange={(e) =>
                    setSelectedRequest({ ...selectedRequest, year: e.target.value })
                  }
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 1, max: 4 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={selectedRequest.startDate ? selectedRequest.startDate.split('T')[0] : ''}
                  onChange={(e) =>
                    setSelectedRequest({ ...selectedRequest, startDate: e.target.value })
                  }
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={selectedRequest.endDate ? selectedRequest.endDate.split('T')[0] : ''}
                  onChange={(e) =>
                    setSelectedRequest({ ...selectedRequest, endDate: e.target.value })
                  }
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Reason"
                  value={selectedRequest.reason || ''}
                  onChange={(e) =>
                    setSelectedRequest({ ...selectedRequest, reason: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Detailed Explanation"
                  value={selectedRequest.reason_Details || ''}
                  onChange={(e) =>
                    setSelectedRequest({ ...selectedRequest, reason_Details: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Approval Status
                </Typography>
              </Grid>
              
              {['mentor', 'class_advisor', 'hod', 'placement_officer', 'principal'].map((approver) => (
                <Grid item xs={12} md={6} key={approver}>
                  <TextField
                    fullWidth
                    select
                    label={`${approver.replace('_', ' ').toUpperCase()} Approval`}
                    value={selectedRequest[`${approver}_approval`] || 'pending'}
                    onChange={(e) =>
                      setSelectedRequest({ 
                        ...selectedRequest, 
                        [`${approver}_approval`]: e.target.value 
                      })
                    }
                    margin="normal"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </TextField>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            startIcon={<ClearIcon />}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleEdit}
            startIcon={<CheckCircleIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
     {/* Delete Confirmation Dialog */}
<Dialog 
  open={deleteDialogOpen} 
  onClose={() => setDeleteDialogOpen(false)}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle sx={{ 
    bgcolor: 'background.paper',
    color: 'text.primary',
    borderBottom: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    py: 2
  }}>
    <Avatar sx={{ 
      bgcolor: 'error.light', 
      color: 'error.main',
      width: 40, 
      height: 40
    }}>
      <DeleteIcon />
    </Avatar>
    <Typography variant="h6" fontWeight="medium">
      Confirm Deletion
    </Typography>
  </DialogTitle>
  
  <DialogContent sx={{ py: 3 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <Box sx={{ 
        bgcolor: 'error.light', 
        color: 'error.main',
        width: 60, 
        height: 60,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2
      }}>
        <DeleteIcon fontSize="large" />
      </Box>
      
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
        Delete Leave Request #{selectedRequest?.request_id}?
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This action will permanently delete the leave request and cannot be undone.
      </Typography>
      
      {selectedRequest && (
        <Paper variant="outlined" sx={{ 
          p: 2, 
          width: '100%', 
          mt: 2,
          textAlign: 'left',
          backgroundColor: 'background.default'
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            {selectedRequest.student_name || selectedRequest.staff_name || selectedRequest.hod_name || 'Unknown'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Chip 
              label={selectedRequest.request_type} 
              size="small" 
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={formatDate(selectedRequest.startDate)} 
              size="small" 
              icon={<EventIcon fontSize="small" />}
            />
            <Chip 
              label={formatDate(selectedRequest.endDate)} 
              size="small" 
              icon={<EventIcon fontSize="small" />}
            />
          </Box>
        </Paper>
      )}
    </Box>
  </DialogContent>
  
  <DialogActions sx={{ 
    p: 2, 
    borderTop: '1px solid',
    borderColor: 'divider',
    justifyContent: 'space-between'
  }}>
    <Button 
      onClick={() => setDeleteDialogOpen(false)}
      variant="outlined"
      sx={{ minWidth: 120 }}
    >
      Cancel
    </Button>
    <Button 
      variant="contained" 
      color="error"
      onClick={handleDelete}
      startIcon={<DeleteIcon />}
      sx={{ minWidth: 140 }}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>

      {/* Filter Dialog */}
      {/* <Dialog 
        open={filterDialogOpen} 
        onClose={() => setFilterDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <FilterIcon /> Filter Leave Requests
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                margin="normal"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRangeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRangeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          justifyContent: 'space-between'
        }}>
          <Button 
            onClick={handleResetFilters}
            startIcon={<ClearIcon />}
            color="secondary"
          >
            Clear Filters
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={() => setFilterDialogOpen(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleFilterApply}
              startIcon={<FilterIcon />}
            >
              Apply Filters
            </Button>
          </Box>
        </DialogActions>
      </Dialog> */}

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveRequests;