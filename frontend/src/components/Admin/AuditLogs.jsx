import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Box,
  Tooltip,
  CircularProgress,
  Alert
} from "@mui/material";
import { 
  Search as SearchIcon,
  RestoreFromTrash as RestoreIcon,
  DeleteForever as DeleteForeverIcon
} from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const AuditLogs = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const fetchDeletedUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/deleted-users`);
      const sortedUsers = response.data.sort((a, b) => 
        new Date(b.deleted_at) - new Date(a.deleted_at)
      );
      setDeletedUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching deleted users:', error);
      setError('Failed to load deleted users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreUser = async (sinNumber, name) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/restore-user`, { sin_number: sinNumber });
      setSuccessMessage(`User ${name} restored successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchDeletedUsers();
    } catch (error) {
      console.error('Error restoring user:', error);
      setError(`Failed to restore user ${name}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentlyDeleteUser = async (sinNumber, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/permanently-delete-user`, { sin_number: sinNumber });
      setSuccessMessage(`User ${name} permanently deleted`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchDeletedUsers();
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      setError(`Failed to delete user ${name}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = deletedUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.sin_number.toString().includes(searchTerm) ||
    user.phone.includes(searchTerm)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Deleted Users List
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          variant="outlined"
          placeholder="Search deleted users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '400px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body2" color="textSecondary">
          {filteredUsers.length} records found
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }} aria-label="deleted users table">
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'common.white', fontWeight: 600 }}>SIN Number</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 600 }}>Deleted At</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <TableRow 
                    key={user.sin_number}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{user.sin_number}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Box 
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: user.role === 'admin' ? 'secondary.light' : 'grey.200',
                          color: user.role === 'admin' ? 'secondary.dark' : 'grey.800',
                          fontWeight: 500
                        }}
                      >
                        {user.role}
                      </Box>
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(user.deleted_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(user.deleted_at).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Restore user">
                          <IconButton
                            color="primary"
                            onClick={() => handleRestoreUser(user.sin_number, user.name)}
                            aria-label="restore"
                            disabled={loading}
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Permanently delete">
                          <IconButton
                            color="error"
                            onClick={() => handlePermanentlyDeleteUser(user.sin_number, user.name)}
                            aria-label="delete permanently"
                            disabled={loading}
                          >
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      {searchTerm ? 'No matching users found' : 'No deleted users available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default AuditLogs;