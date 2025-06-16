import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  CloudDownload as DownloadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { saveAs } from "file-saver";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const BackupRecovery = () => {
  const theme = useTheme();
  
  // Sample backup data
  const [backups, setBackups] = useState([
    { 
      id: 1, 
      date: new Date("2023-10-01"), 
      size: "45 MB", 
      type: "Full", 
      description: "System backup before major update",
      status: "completed"
    },
    { 
      id: 2, 
      date: new Date("2023-09-28"), 
      size: "42 MB", 
      type: "Incremental", 
      description: "Daily incremental backup",
      status: "completed"
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupType, setBackupType] = useState("full");
  const [backupDescription, setBackupDescription] = useState("");
  const [scheduledBackup, setScheduledBackup] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState("daily");
  const [scheduleTime, setScheduleTime] = useState("02:00");

  // const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

  const handleBackup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/backup/create-backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Backup_${new Date().toISOString()}`,
          type: backupType,
          description: backupDescription
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backup creation failed');
      }

      const data = await response.json();
      setBackups([{
        id: data.backupId,
        date: new Date(),
        size: 'Calculating...',
        type: backupType === "full" ? "Full" : "Incremental",
        description: backupDescription || `System ${backupType} backup`,
        status: "completed"
      }, ...backups]);
      
      setSuccess(`Backup created successfully! (${backupType})`);
      setBackupDescription("");
    } catch (err) {
      setError(err.message || 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setOpenRestoreDialog(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/backup/restore-backup/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Restore failed');
      }

      const data = await response.json();
      setSuccess(`Backup ${id} restored successfully! ${data.message}`);
    } catch (err) {
      setError(err.message || 'Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBackup) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setOpenDeleteDialog(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/backup/backup/${selectedBackup.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      setBackups(backups.filter(b => b.id !== selectedBackup.id));
      setSuccess(`Backup ${selectedBackup.id} deleted successfully!`);
      setSelectedBackup(null);
    } catch (err) {
      setError(err.message || 'Failed to delete backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      const response = await fetch(`${API_BASE_URL}/backup/download-csv/${backup.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]
        : `backup_${backup.id}_${format(backup.date, 'yyyyMMdd')}.zip`;

      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (err) {
      setError(err.message || 'Failed to download backup');
    }
  };

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/backup/backups`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch backups');
        }
        const data = await response.json();
        setBackups(data.map(backup => ({
          id: backup.id,
          date: new Date(backup.backup_date),
          size: 'Calculating...',
          type: 'Full',
          description: backup.backup_name,
          status: "completed"
        })));
      } catch (err) {
        setError(err.message || 'Failed to fetch backups');
      }
    };

    fetchBackups();
  }, []);

  const formatDate = (date) => {
    return format(date, "PPpp");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'in-progress': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ 
      maxWidth: '1440px', 
      margin: "0 auto", 
      p: { xs: 2, md: 4 },
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3,
        mb: 4,
        flexDirection: { xs: 'column', md: 'row' },
        textAlign: { xs: 'center', md: 'left' }
      }}>
        <Box sx={{
          backgroundColor: theme.palette.primary.light,
          borderRadius: '50%',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <BackupIcon sx={{ 
            fontSize: '3rem', 
            color: theme.palette.primary.main 
          }} />
        </Box>
        <Box>
          <Typography variant="h3" component="h1" sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mb: 1
          }}>
            Backup & Recovery Management
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            color: 'text.secondary',
            maxWidth: '800px'
          }}>
            Secure your data with automated backups and easy restoration options
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      {/* <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            height: '100%',
            borderLeft: `4px solid ${theme.palette.primary.main}`
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                gap: 2
              }}>
                <StorageIcon color="primary" sx={{ fontSize: '2rem' }} />
                <Typography variant="h5" component="div">
                  {backups.length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Backups Stored
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            height: '100%',
            borderLeft: `4px solid ${theme.palette.secondary.main}`
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                gap: 2
              }}>
                <HistoryIcon color="secondary" sx={{ fontSize: '2rem' }} />
                <Typography variant="h5" component="div">
                  {backups.filter(b => b.type === 'Full').length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Full System Backups
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            height: '100%',
            borderLeft: `4px solid ${theme.palette.success.main}`
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                gap: 2
              }}>
                <SecurityIcon color="success" sx={{ fontSize: '2rem' }} />
                <Typography variant="h5" component="div">
                  {backups.filter(b => b.status === 'completed').length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Successful Backups
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Backup Creation Section */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ 
            height: '100%',
            boxShadow: theme.shadows[4]
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                mb: 4
              }}>
                <BackupIcon color="primary" sx={{ fontSize: '2rem' }} />
                <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
                  Create New Backup
                </Typography>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}
              
              <Box sx={{ mb: 4 }}>
                <TextField
                  select
                  label="Backup Type"
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value)}
                  fullWidth
                  sx={{ mb: 3 }}
                  variant="outlined"
                  size="medium"
                >
                  <MenuItem value="full">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BackupIcon color="success" fontSize="small" />
                      Full Backup
                    </Box>
                  </MenuItem>
                  {/* <MenuItem value="incremental">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BackupIcon color="info" fontSize="small" />
                      Incremental Backup
                    </Box>
                  </MenuItem> */}
                </TextField>
                
                <TextField
                  label="Description (Optional)"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ mb: 3 }}
                  variant="outlined"
                  size="medium"
                  placeholder="Enter a description for this backup..."
                />
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    onClick={handleBackup}
                    disabled={loading}
                    size="large"
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    Create Backup
                  </Button>
                  
                  <Button
                    variant={scheduledBackup ? "outlined" : "text"}
                    color={scheduledBackup ? "secondary" : "primary"}
                    startIcon={<ScheduleIcon />}
                    onClick={() => setScheduledBackup(!scheduledBackup)}
                    size="large"
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    {scheduledBackup ? 'Cancel Schedule' : 'Schedule Backup'}
                  </Button>
                </Box>
                
                {scheduledBackup && (
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 2,
                    mb: 3
                  }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2
                    }}>
                      <ScheduleIcon color="action" />
                      Schedule Settings
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Frequency"
                          value={scheduleFrequency}
                          onChange={(e) => setScheduleFrequency(e.target.value)}
                          fullWidth
                          variant="outlined"
                          size="medium"
                        >
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Time"
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          size="medium"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Box>
              
              <Paper elevation={0} sx={{ 
                p: 3, 
                bgcolor: 'background.default', 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Typography variant="body1" sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 2,
                  lineHeight: 1.6
                }}>
                  <InfoIcon color="info" sx={{ mt: 0.5 }} />
                  <span>
                    <strong>Full backups</strong> include all system data and are recommended for major changes. 
                    {/* <strong>Incremental backups</strong> only include changes since the last backup and are more storage-efficient.  */}
                    We recommend maintaining a regular backup schedule with at least one full backup per week.
                  </span>
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Backup List Section */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            height: '100%',
            width: '150%',
            mr: 35,
            boxShadow: theme.shadows[4]
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 4,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RestoreIcon color="secondary" sx={{ fontSize: '2rem' }} />
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
                    Backup Archives
                  </Typography>
                </Box>
                <Chip 
                  label={`${backups.length} backup${backups.length !== 1 ? 's' : ''}`} 
                  color="primary" 
                  variant="outlined"
                  size="medium"
                  sx={{ 
                    fontSize: '1rem',
                    px: 1.5,
                    py: 1
                  }}
                />
              </Box>
              
              {backups.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No backups available. Create your first backup to get started.
                </Alert>
              ) : (
                <List sx={{ 
                  maxHeight: '600px', 
                  overflow: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: theme.palette.grey[100],
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.grey[400],
                    borderRadius: '4px',
                  },
                }}>
                  {backups.map((backup) => (
                    <React.Fragment key={backup.id}>
                      <ListItem
                        sx={{
                          '&:hover': { 
                            backgroundColor: 'action.hover',
                            transform: 'scale(1.005)',
                            transition: 'transform 0.2s ease-in-out'
                          },
                          borderLeft: `4px solid ${backup.type === 'Full' ? theme.palette.success.main : theme.palette.info.main}`,
                          mb: 1.5,
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          p: 3
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: 48,
                          mr: 2
                        }}>
                          {backup.type === 'Full' ? (
                            <Tooltip title="Full Backup">
                              <BackupIcon color="success" sx={{ fontSize: '2rem' }} />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Incremental Backup">
                              <BackupIcon color="info" sx={{ fontSize: '2rem' }} />
                            </Tooltip>
                          )}
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2, 
                              mb: 1,
                              flexWrap: 'wrap'
                            }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600,
                                color: 'text.primary'
                              }}>
                                Backup #{backup.id}
                              </Typography>
                              <Chip 
                                label={backup.status} 
                                size="small" 
                                color={getStatusColor(backup.status)}
                                variant="outlined"
                                sx={{
                                  fontWeight: 500,
                                  textTransform: 'capitalize'
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Box component="span" sx={{ 
                                display: 'block',
                                color: 'text.secondary',
                                mb: 1,
                                fontSize: '0.9rem'
                              }}>
                                {formatDate(backup.date)} • {backup.size}
                              </Box>
                              <Box component="span" sx={{ 
                                fontStyle: 'italic',
                                color: 'text.secondary',
                                fontSize: '0.9rem'
                              }}>
                                {backup.description}
                              </Box>
                            </>
                          }
                          sx={{ my: 0 }}
                        />
                        
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1.5,
                          ml: 2,
                          flexShrink: 0
                        }}>
                          <Tooltip title="Download Backup">
                            <IconButton 
                              onClick={() => handleDownload(backup)} 
                              color="primary"
                              size="large"
                              sx={{ 
                                bgcolor: 'primary.light', 
                                '&:hover': { 
                                  bgcolor: 'primary.main', 
                                  color: 'primary.contrastText' 
                                }
                              }}
                            >
                              <DownloadIcon fontSize="medium" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Restore Backup">
                            <IconButton 
                              onClick={() => {
                                setSelectedBackup(backup);
                                setOpenRestoreDialog(true);
                              }} 
                              color="secondary"
                              size="large"
                              sx={{ 
                                bgcolor: 'secondary.light', 
                                '&:hover': { 
                                  bgcolor: 'secondary.main', 
                                  color: 'secondary.contrastText' 
                                }
                              }}
                            >
                              <RestoreIcon fontSize="medium" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Backup">
                            <IconButton 
                              onClick={() => {
                                setSelectedBackup(backup);
                                setOpenDeleteDialog(true);
                              }} 
                              color="error"
                              size="large"
                              sx={{ 
                                bgcolor: 'error.light', 
                                '&:hover': { 
                                  bgcolor: 'error.main', 
                                  color: 'error.contrastText' 
                                }
                              }}
                            >
                              <DeleteIcon fontSize="medium" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                      <Divider component="li" sx={{ my: 1.5 }} />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Restore Confirmation Dialog */}
      <Dialog
        open={openRestoreDialog}
        onClose={() => setOpenRestoreDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'secondary.main', 
          color: 'secondary.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2
        }}>
          <WarningIcon sx={{ fontSize: '2rem' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Confirm Restore Operation
            </Typography>
            <Typography variant="body2">
              Restoring backup #{selectedBackup?.id}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            You are about to restore <strong>Backup #{selectedBackup?.id}</strong> created on <strong>{selectedBackup && formatDate(selectedBackup.date)}</strong>.
          </DialogContentText>
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Warning: This action will overwrite all current system data with the data from this backup.
            </Typography>
          </Alert>
          <Alert severity="info" sx={{ mb: 2 }}>
            The system may be temporarily unavailable during the restoration process.
          </Alert>
          <Typography variant="body2" sx={{ 
            mt: 2, 
            fontStyle: 'italic',
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1
          }}>
            <strong>Backup description:</strong> {selectedBackup?.description}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenRestoreDialog(false)}
            variant="outlined"
            sx={{ 
              minWidth: 120,
              px: 3,
              py: 1
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleRestore(selectedBackup?.id)} 
            color="secondary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <RestoreIcon />}
            sx={{ 
              minWidth: 160,
              px: 3,
              py: 1
            }}
          >
            Confirm Restore
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'error.main', 
          color: 'error.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2
        }}>
          <WarningIcon sx={{ fontSize: '2rem' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Confirm Backup Deletion
            </Typography>
            <Typography variant="body2">
              Deleting backup #{selectedBackup?.id}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            You are about to permanently delete <strong>Backup #{selectedBackup?.id}</strong> created on <strong>{selectedBackup && formatDate(selectedBackup.date)}</strong>.
          </DialogContentText>
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              This action cannot be undone. All data associated with this backup will be permanently removed.
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ 
            mt: 2, 
            fontStyle: 'italic',
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1
          }}>
            <strong>Backup description:</strong> {selectedBackup?.description}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{ 
              minWidth: 120,
              px: 3,
              py: 1
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DeleteIcon />}
            sx={{ 
              minWidth: 160,
              px: 3,
              py: 1
            }}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupRecovery;