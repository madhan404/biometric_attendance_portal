import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Container,
  Stack,
  LinearProgress
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Description as ReportIcon
} from "@mui/icons-material";
import DescriptionIcon from '@mui/icons-material/Description';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const Analytics = () => {
  const [devicelogs, setDevicelogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" 
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchDevicelogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/devicelogs`);
      if (res.data.success) {
        setDevicelogs(res.data.data);
      }
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: "Failed to fetch devicelogs. Please try again.", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevicelogs();
  }, []);

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all device logs? This action cannot be undone.")) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/devicelogs`);
      setDevicelogs([]);
      setSnackbar({ 
        open: true, 
        message: "All devicelogs deleted successfully", 
        severity: "success" 
      });
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: "Failed to delete devicelogs. Please try again.", 
        severity: "error" 
      });
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/upload-devicelogs`, 
        formData, 
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );
      
      setSnackbar({ 
        open: true, 
        message: res.data.message || "File uploaded and processed successfully", 
        severity: "success" 
      });
      fetchDevicelogs();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || "Upload failed. Please check the file format and try again.", 
        severity: "error" 
      });
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = null;
    }
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ 
        p: 4, 
        borderRadius: 2,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Header Section */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
        >
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <ReportIcon fontSize="large" />
            Device Logs Analytics
          </Typography>
          
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={fetchDevicelogs} 
              color="primary"
              size="large"
              sx={{ 
                backgroundColor: 'primary.light', 
                '&:hover': { backgroundColor: 'primary.main', color: 'white' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Action Buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="space-between" 
          mb={4}
        >
          <Stack direction="row" spacing={2}>
            <Tooltip title="Delete all device logs">
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteAll}
                disabled={devicelogs.length === 0 || loading}
                startIcon={<DeleteIcon />}
                sx={{ 
                  minWidth: 200,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' }
                }}
              >
                Clear All Logs
              </Button>
            </Tooltip>
          </Stack>

          <Button
            variant="contained"
            component="label"
            disabled={uploading}
            startIcon={<UploadIcon />}
            sx={{ 
              minWidth: 200,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' }
            }}
          >
            {uploading ? 'Uploading...' : 'Upload CSV'}
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleUpload}
            />
          </Button>
        </Stack>

        {uploading && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Upload progress: {progress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color="primary"
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Data Display Section */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300,
            backgroundColor: 'action.hover',
            borderRadius: 2
          }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">
                Loading device logs...
              </Typography>
            </Stack>
          </Box>
        ) : devicelogs.length === 0 ? (
          <Paper elevation={0} sx={{ 
            p: 6, 
            textAlign: 'center', 
            backgroundColor: 'action.hover',
            borderRadius: 2
          }}>
            <Box sx={{ maxWidth: 500, margin: '0 auto' }}>
              <DescriptionIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Device Logs Available
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Upload a CSV file containing device logs to begin analysis
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
              >
                Upload CSV File
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleUpload}
                />
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            <Typography variant="subtitle1" color="text.secondary" mb={2}>
              Showing {devicelogs.length} records
            </Typography>
            
            <Paper elevation={0} sx={{ 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <TableContainer sx={{ maxHeight: '60vh' }}>
                <Table stickyHeader aria-label="device logs table" size="medium">
                  <TableHead>
                    <TableRow>
                      {devicelogs[0] && Object.keys(devicelogs[0]).map((col) => (
                        <TableCell 
                          key={col} 
                          sx={{ 
                            fontWeight: 700, 
                            backgroundColor: 'primary.main', 
                            color: 'primary.contrastText',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devicelogs.map((log, idx) => (
                      <TableRow 
                        key={idx} 
                        hover 
                        sx={{ 
                          '&:nth-of-type(even)': { 
                            backgroundColor: 'action.hover' 
                          },
                          '&:hover': {
                            backgroundColor: 'action.selected'
                          }
                        }}
                      >
                        {Object.values(log).map((val, i) => (
                          <TableCell 
                            key={i} 
                            sx={{ 
                              maxWidth: 250, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {String(val)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Paper>

      {/* Notification System */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ maxWidth: 400 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: "100%", 
            boxShadow: 3,
            alignItems: 'center',
            fontSize: '0.875rem'
          }}
          variant="filled"
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Analytics;