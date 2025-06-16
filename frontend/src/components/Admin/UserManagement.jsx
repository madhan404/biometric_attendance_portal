import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  InputAdornment,
  useTheme,
  styled
} from '@mui/material';
import {
  Add,
  Upload,
  Edit,
  Delete,
  PhotoCamera,
  Search,
  Refresh,
  CloudUpload,
  CheckCircle,
  Cancel
} from "@mui/icons-material";
import { deepPurple, teal, indigo, orange } from "@mui/material/colors";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 'calc(100vh - 250px)',
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: deepPurple[500],
  width: 36,
  height: 36,
  marginRight: theme.spacing(2)
}));

const RoleChip = styled(Chip)(({ role, theme }) => ({
  fontWeight: 600,
  ...(role === 'admin' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText
  }),
  ...(role === 'hod' && {
    backgroundColor: indigo[200],
    color: indigo[900]
  }),
  ...(role === 'student' && {
    backgroundColor: teal[100],
    color: teal[900]
  }),
  ...(role === 'principal' && {
    backgroundColor: orange[100],
    color: orange[900]
  })
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2)
  }
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'flex-end'
  }
}));

// Helper function
const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('');
};

const UserManagement = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    sin_number: '',
    name: '',
    gender: '',
    email: '',
    password: '',
    address: '',
    class_advisor: '',
    mentor: '',
    year: '',
    department: '',
    college: '',
    dayScholar_or_hosteller: '',
    quota: '',
    role: 'student',
    position_1: '',
    position_2: '',
    phone: '',
    parent_phone: '',
    photo: null,
    batch: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.sin_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/get-users`);
      const users = response.data.users || [];
      
      const transformedUsers = users.map(user => ({
        id: user.id,
        sin_number: user.sin_number || '',
        name: user.name || '',
        gender: user.gender || '',
        email: user.email || '',
        address: user.address || '',
        class_advisor: user.class_advisor || '',
        mentor: user.mentor || '',
        year: user.year || '',
        department: user.department || '',
        college: user.college || '',
        dayScholar_or_hosteller: user.dayScholar_or_hosteller || '',
        quota: user.quota || '',
        role: user.role || 'student',
        position_1: user.position_1 || '',
        position_2: user.position_2 || '',
        phone: user.phone || '',
        parent_phone: user.parent_phone || '',
        photo: user.photo || null,
        batch: user.batch || ''
      }));

      setUsers(transformedUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Error fetching users');
      setUsers([]);
      showSnackbar('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleCreateUser = async (userData) => {
    setLoading(true);
    try {
      const requiredFields = ['sin_number', 'name', 'email', 'password', 'year', 'department', 'college', 'dayScholar_or_hosteller', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const formData = new FormData();
      formData.append('id', generateUUID());
      
      const fieldsWithDefaults = {
        sin_number: userData.sin_number || '',
        name: userData.name || '',
        gender: userData.gender || '',
        email: userData.email || '',
        password: userData.password || '',
        address: userData.address || '',
        class_advisor: userData.class_advisor || '',
        mentor: userData.mentor || '',
        year: userData.year || '1',
        department: userData.department || '',
        college: userData.college || '',
        dayScholar_or_hosteller: userData.dayScholar_or_hosteller || 'dayscholar',
        quota: userData.quota || '',
        role: userData.role || 'student',
        position_1: userData.position_1 || '',
        position_2: userData.position_2 || '',
        phone: userData.phone || '',
        parent_phone: userData.parent_phone || '',
        batch: userData.batch || ''
      };

      Object.entries(fieldsWithDefaults).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (userData.photo instanceof File) {
        formData.append('photo', userData.photo);
      }

      await axios.post(`${API_BASE_URL}/create-user`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchUsers();
      showSnackbar('User created successfully', 'success');
      handleCloseDialog();
    } catch (err) {
      console.error('Error creating user:', err);
      showSnackbar(
        err.response?.data?.error || 'Error creating user',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    setLoading(true);
    try {
      const requiredFields = ['sin_number', 'name', 'email', 'year', 'department', 'college', 'dayScholar_or_hosteller', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const formData = new FormData();
      
      const fieldsWithDefaults = {
        sin_number: userData.sin_number || '',
        name: userData.name || '',
        gender: userData.gender || '',
        email: userData.email || '',
        password: userData.password || '',
        address: userData.address || '',
        class_advisor: userData.class_advisor || '',
        mentor: userData.mentor || '',
        year: userData.year || '1',
        department: userData.department || '',
        college: userData.college || '',
        dayScholar_or_hosteller: userData.dayScholar_or_hosteller || 'dayscholar',
        quota: userData.quota || '',
        role: userData.role || 'student',
        position_1: userData.position_1 || '',
        position_2: userData.position_2 || '',
        phone: userData.phone || '',
        parent_phone: userData.parent_phone || '',
        batch: userData.batch || ''
      };

      Object.entries(fieldsWithDefaults).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (userData.photo instanceof File) {
        formData.append('photo', userData.photo);
      }

      await axios.put(
        `${API_BASE_URL}/update-user/${selectedUser.sin_number}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      await fetchUsers();
      showSnackbar('User updated successfully', 'success');
      handleCloseDialog();
    } catch (err) {
      console.error('Error updating user:', err);
      showSnackbar(
        err.response?.data?.error || 'Error updating user',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (sinNumber) => {
    setLoading(true);
    try {
      let deleted_by;
      try {
        const sessionUser = JSON.parse(sessionStorage.getItem('user'));
        deleted_by = sessionUser?.user?.sin_number || 'admin';
      } catch (err) {
        deleted_by = 'admin';
      }

      await axios.delete(`${API_BASE_URL}/delete-user/${sinNumber}`, {
        data: { deleted_by }
      });
      await fetchUsers();
      showSnackbar('User deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      showSnackbar(
        err.response?.data?.error || 'Error deleting user',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) {
      showSnackbar('Please select a CSV file', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('csv', csvFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchUsers();
      showSnackbar(
        `Successfully uploaded ${response.data.users?.length || 0} users`,
        'success'
      );
      setOpenUploadDialog(false);
    } catch (err) {
      console.error('Error in bulk upload:', err);
      showSnackbar(
        err.response?.data?.error || 'Error uploading users',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    if (user) {
      setFormData({
        sin_number: user.sin_number || '',
        name: user.name || '',
        gender: user.gender || '',
        email: user.email || '',
        password: '',
        address: user.address || '',
        class_advisor: user.class_advisor || '',
        mentor: user.mentor || '',
        year: user.year || '1',
        department: user.department || '',
        college: user.college || '',
        dayScholar_or_hosteller: user.dayScholar_or_hosteller || 'dayscholar',
        quota: user.quota || '',
        role: user.role || 'student',
        position_1: user.position_1 || '',
        position_2: user.position_2 || '',
        phone: user.phone || '',
        parent_phone: user.parent_phone || '',
        photo: user.photo || null,
        batch: user.batch || ''
      });
    } else {
      setFormData({
        sin_number: '',
        name: '',
        gender: '',
        email: '',
        password: '',
        address: '',
        class_advisor: '',
        mentor: '',
        year: '1',
        department: '',
        college: '',
        dayScholar_or_hosteller: 'dayscholar',
        quota: '',
        role: 'student',
        position_1: '',
        position_2: '',
        phone: '',
        parent_phone: '',
        photo: null,
        batch: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        photo: e.target.files[0]
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      handleUpdateUser(formData);
    } else {
      handleCreateUser(formData);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <SectionHeader>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          User Management
        </Typography>
        <ActionButtons>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            Add User
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setOpenUploadDialog(true)}
          >
            Bulk Upload
          </Button>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleRefresh}
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </ActionButtons>
      </SectionHeader>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search users by name, email or SIN number..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          sx: {
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.paper
          }
        }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Main Content */}
      {loading && !users.length ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '300px' 
        }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderLeft: `4px solid ${theme.palette.error.main}`
          }}
        >
          {error}
        </Alert>
      ) : (
        <Paper 
          elevation={2} 
          sx={{ 
            overflow: 'hidden',
            borderRadius: theme.shape.borderRadius
          }}
        >
          <StyledTableContainer>
            <Table stickyHeader aria-label="user management table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>SIN Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Accommodation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {user.photo ? (
                            <Avatar 
                              src={`data:image/jpeg;base64,${user.photo}`}
                              sx={{ mr: 2, width: 36, height: 36 }}
                            />
                          ) : (
                            <StyledAvatar>
                              {getInitials(user.name)}
                            </StyledAvatar>
                          )}
                          <Box>
                            <Typography sx={{ fontWeight: 500 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.year} Year • {user.batch}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.sin_number}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.dayScholar_or_hosteller === 'dayScholar' ? 'Day Scholar' : 'Hosteller'}
                          size="small"
                          sx={{
                            backgroundColor: user.dayScholar_or_hosteller === 'dayScholar' 
                              ? theme.palette.success.light 
                              : theme.palette.info.light,
                            color: user.dayScholar_or_hosteller === 'dayScholar' 
                              ? theme.palette.success.dark 
                              : theme.palette.info.dark
                          }}
                        />
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <RoleChip 
                          role={user.role}
                          label={user.role} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit user">
                          <IconButton 
                            onClick={() => handleOpenDialog(user)} 
                            color="primary"
                            sx={{ 
                              '&:hover': {
                                backgroundColor: theme.palette.primary.light
                              }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete user">
                          <IconButton 
                            onClick={() => handleDeleteUser(user.sin_number)} 
                            color="error"
                            sx={{ 
                              '&:hover': {
                                backgroundColor: theme.palette.error.light
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={8} 
                      align="center"
                      sx={{ py: 4, color: theme.palette.text.secondary }}
                    >
                      No users found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Paper>
      )}

      {/* User Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white,
          fontWeight: 600
        }}>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ py: 3 }}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ 
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}>
                  Personal Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="sin_number"
                  label="SIN Number"
                  fullWidth
                  required
                  value={formData.sin_number}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="name"
                  label="Full Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  required={!selectedUser}
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    label="Gender"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="phone"
                  label="Phone Number"
                  fullWidth
                  value={formData.phone}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="parent_phone"
                  label="Parent Phone"
                  fullWidth
                  value={formData.parent_phone}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              
              {/* Academic Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ 
                  mt: 2,
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}>
                  Academic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="principal">Principal</MenuItem>
                    <MenuItem value="placement_officer">Placement Officer</MenuItem>
                    <MenuItem value="hod">HOD</MenuItem>
                    <MenuItem value="hodstaff">HOD Staff</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Accommodation</InputLabel>
                  <Select
                    name="dayScholar_or_hosteller"
                    value={formData.dayScholar_or_hosteller}
                    label="Accommodation"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="dayScholar">Day Scholar</MenuItem>
                    <MenuItem value="hosteller">Hosteller</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="department"
                  label="Department"
                  fullWidth
                  value={formData.department}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="college"
                  label="College"
                  fullWidth
                  value={formData.college}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Year</InputLabel>
                  <Select
                    name="year"
                    value={formData.year}
                    label="Year"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="1">1st Year</MenuItem>
                    <MenuItem value="2">2nd Year</MenuItem>
                    <MenuItem value="3">3rd Year</MenuItem>
                    <MenuItem value="4">4th Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="batch"
                  label="Batch"
                  fullWidth
                  value={formData.batch}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              
              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ 
                  mt: 2,
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}>
                  Additional Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="class_advisor"
                  label="Class Advisor SIN"
                  fullWidth
                  value={formData.class_advisor}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="mentor"
                  label="Mentor SIN"
                  fullWidth
                  value={formData.mentor}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Address"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              
              {/* Photo Upload */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ 
                  mt: 2,
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}>
                  Profile Photo
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload-for-user"
                  type="file"
                  onChange={handlePhotoChange}
                />
                <label htmlFor="photo-upload-for-user">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{ mr: 2 }}
                  >
                    Upload Photo
                  </Button>
                </label>
                {formData.photo && (
                  <Typography variant="body2" sx={{ mt: 1, display: 'inline-block' }}>
                    {formData.photo instanceof File 
                      ? `Selected: ${formData.photo.name}`
                      : 'Photo already uploaded'}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              startIcon={<Cancel />}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? null : <CheckCircle />}
              sx={{
                backgroundColor: theme.palette.success.main,
                '&:hover': {
                  backgroundColor: theme.palette.success.dark
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white,
          fontWeight: 600
        }}>
          Bulk User Upload
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Upload a CSV file containing user data. The file should have columns for:
            </Typography>
            <Box component="ul" sx={{ 
              mb: 2, 
              pl: 2.5,
              '& li': {
                mb: 0.5
              }
            }}>
              <Typography component="li" variant="body2">
                <strong>sin_number</strong> (required)
              </Typography>
              <Typography component="li" variant="body2">
                <strong>name</strong> (required)
              </Typography>
              <Typography component="li" variant="body2">
                <strong>email</strong> (required)
              </Typography>
              <Typography component="li" variant="body2">
                <strong>password</strong> (required for new users)
              </Typography>
              <Typography component="li" variant="body2">
                <strong>gender</strong>
              </Typography>
              <Typography component="li" variant="body2">
                <strong>phone</strong>
              </Typography>
              <Typography component="li" variant="body2">
                <strong>department</strong>
              </Typography>
              <Typography component="li" variant="body2">
                <strong>role</strong>
              </Typography>
            </Box>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="csv-upload-input"
            />
            <label htmlFor="csv-upload-input">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Select CSV File
              </Button>
            </label>
            {csvFile && (
              <Box sx={{ 
                p: 2, 
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.background.default,
                mb: 2
              }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Description color="primary" sx={{ mr: 1 }} />
                  Selected file: {csvFile.name}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenUploadDialog(false)}
            variant="outlined"
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkUpload}
            variant="contained"
            disabled={!csvFile || loading}
            startIcon={loading ? null : <Upload />}
            sx={{
              backgroundColor: theme.palette.success.main,
              '&:hover': {
                backgroundColor: theme.palette.success.dark
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            boxShadow: theme.shadows[3]
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;