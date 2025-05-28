import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

const RoleManagement = () => {
  // Sample initial roles data
  const initialRoles = [
    {
      id: 1,
      name: "Admin",
      description: "Full system access",
      permissions: {
        manageUsers: true,
        editAttendance: true,
        viewReports: true,
        systemConfig: true,
        manageRoles: true,
      },
    },
    {
      id: 2,
      name: "HOD",
      description: "Department head access",
      permissions: {
        manageUsers: false,
        editAttendance: true,
        viewReports: true,
        systemConfig: false,
        manageRoles: false,
      },
    },
    {
      id: 3,
      name: "Faculty",
      description: "Teaching staff access",
      permissions: {
        manageUsers: false,
        editAttendance: true,
        viewReports: false,
        systemConfig: false,
        manageRoles: false,
      },
    },
  ];

  const [roles, setRoles] = useState(initialRoles);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editMode, setEditMode] = useState(false);

  // All possible permissions
  const allPermissions = [
    { key: "manageUsers", label: "Manage Users" },
    { key: "editAttendance", label: "Edit Attendance" },
    { key: "viewReports", label: "View Reports" },
    { key: "systemConfig", label: "System Configuration" },
    { key: "manageRoles", label: "Manage Roles" },
  ];

  const handlePermissionChange = (roleId, permission) => {
    setRoles(
      roles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [permission]: !role.permissions[permission],
              },
            }
          : role
      )
    );
    showSnackbar("Permission updated successfully");
  };

  const handleAddRole = () => {
    setCurrentRole({
      id: 0,
      name: "",
      description: "",
      permissions: allPermissions.reduce((acc, perm) => {
        acc[perm.key] = false;
        return acc;
      }, {}),
    });
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleEditRole = (role) => {
    setCurrentRole(JSON.parse(JSON.stringify(role)));
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteRole = (role) => {
    setCurrentRole(role);
    setOpenDeleteDialog(true);
  };

  const handleSaveRole = () => {
    if (!currentRole.name.trim()) {
      showSnackbar("Role name is required", "error");
      return;
    }

    if (editMode) {
      // Update existing role
      setRoles(
        roles.map((role) => (role.id === currentRole.id ? currentRole : role))
      );
      showSnackbar("Role updated successfully");
    } else {
      // Add new role
      const newId = Math.max(...roles.map((r) => r.id)) + 1;
      setRoles([...roles, { ...currentRole, id: newId }]);
      showSnackbar("Role added successfully");
    }
    setOpenDialog(false);
  };

  const confirmDeleteRole = () => {
    setRoles(roles.filter((role) => role.id !== currentRole.id));
    setOpenDeleteDialog(false);
    showSnackbar("Role deleted successfully");
  };

  const handleDialogInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRole({ ...currentRole, [name]: value });
  };

  const handleDialogPermissionChange = (permission) => {
    setCurrentRole({
      ...currentRole,
      permissions: {
        ...currentRole.permissions,
        [permission]: !currentRole.permissions[permission],
      },
    });
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRole(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentRole(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Role Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRole}
        >
          Add Role
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "primary.contrastText" }}>Role</TableCell>
              <TableCell sx={{ color: "primary.contrastText" }}>
                Description
              </TableCell>
              {allPermissions.map((perm) => (
                <TableCell
                  key={perm.key}
                  align="center"
                  sx={{ color: "primary.contrastText" }}
                >
                  {perm.label}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{ color: "primary.contrastText" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id} hover>
                <TableCell>
                  <Chip
                    label={role.name}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: "bold" }}
                  />
                </TableCell>
                <TableCell>{role.description}</TableCell>
                {allPermissions.map((perm) => (
                  <TableCell key={`${role.id}-${perm.key}`} align="center">
                    <Tooltip
                      title={`Toggle ${perm.label} permission`}
                      placement="top"
                    >
                      <Switch
                        checked={role.permissions[perm.key]}
                        onChange={() =>
                          handlePermissionChange(role.id, perm.key)
                        }
                        color="primary"
                      />
                    </Tooltip>
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Tooltip title="Edit Role">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditRole(role)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {role.name !== "Admin" && (
                    <Tooltip title="Delete Role">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteRole(role)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {editMode ? "Edit Role" : "Add New Role"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Role Name"
              name="name"
              value={currentRole?.name || ""}
              onChange={handleDialogInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={currentRole?.description || ""}
              onChange={handleDialogInputChange}
              margin="normal"
              multiline
              rows={2}
            />
          </Box>
          <Typography variant="h6" gutterBottom>
            Permissions
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 2,
            }}
          >
            {allPermissions.map((perm) => (
              <Box
                key={perm.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Switch
                  checked={currentRole?.permissions[perm.key] || false}
                  onChange={() => handleDialogPermissionChange(perm.key)}
                  color="primary"
                />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {perm.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<CancelIcon />}
            onClick={handleCloseDialog}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveRole}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the role "{currentRole?.name}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteRole}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleManagement;