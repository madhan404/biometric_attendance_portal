import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,

  Tooltip,
  TextField,
  Box,
  Button,

  Menu,
  
} from "@mui/material";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

const studentAttendanceData = [
  { name: "Alice", date: "2024-10-01", status: "Present", hoursWorked: 8 },
  { name: "Bob", date: "2024-10-01", status: "Absent", hoursWorked: 0 },
  { name: "Charlie", date: "2024-10-01", status: "Present", hoursWorked: 7 },
  { name: "Alice", date: "2024-10-02", status: "Absent", hoursWorked: 0 },
  { name: "Bob", date: "2024-10-02", status: "Present", hoursWorked: 8 },
];

const StudentAttendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [leaveRequestOpen, setLeaveRequestOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const open = Boolean(anchorEl);

  const filteredData = studentAttendanceData.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  const handleLeaveRequestClose = () => {
    setLeaveRequestOpen(false);
    // Reset leave request fields
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleSubmitLeaveRequest = () => {
    // Handle the submission logic here
    console.log({ leaveType, startDate, endDate, reason });
    handleLeaveRequestClose();
  };

  const handleCancel = () => {
    window.history.back(); // Navigate to the previous page
};

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Attendance
      </Typography>

      {/* Filter Section */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
        <Tooltip title="Filter Attendance">
        
        </Tooltip>
        <TextField
          label="Search by Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginLeft: 2, flex: 1 }}
        />
        
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hours Worked</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.hoursWorked}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Chart Section */}
      <Typography variant="h5" sx={{ marginTop: 5 }}>
        Attendance Summary
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(tick) => format(new Date(tick), "dd-MMM")} />
          <YAxis />
          <RechartsTooltip labelFormatter={(label) => format(new Date(label), "dd-MMM-yyyy")} />
          <Legend />
          <Bar dataKey="hoursWorked" fill="#8884d8" name="Hours Worked" />
        </BarChart>
      </ResponsiveContainer>

      {/* User Profile Section */}
      <Box sx={{ display: "flex", alignItems: "center", marginTop: 4 }}>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
        </Menu>
      </Box>

      {/* Leave Request Form Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          
        </Typography>
      
      
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" color="primary" onClick={handleCancel}>
                    Cancel
                </Button>
            </Box>


      </Box>
    </Paper>
  );
};

export default StudentAttendance;
