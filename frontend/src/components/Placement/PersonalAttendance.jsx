import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
} from "@mui/material";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

const personalAttendanceData = [
  { name: "Present", value: 15 },
  { name: "Absent", value: 5 },
];

const attendanceLog = [
  { date: "2024-10-01", status: "Present" },
  { date: "2024-10-02", status: "Absent" },
  { date: "2024-10-03", status: "Present" },
  { date: "2024-10-04", status: "Present" },
  { date: "2024-10-05", status: "Absent" },
  { date: "2024-10-06", status: "Present" },
];

// Function to handle cancel button click
const handleCancel = () => {
  window.history.back(); // Navigate to the previous page
};

const PersonalAttendance = () => {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Personal Attendance
      </Typography>

      {/* Attendance Summary */}
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Attendance Summary
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={personalAttendanceData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          />
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Attendance Log Section */}
      <Typography variant="h5" sx={{ marginTop: 4 }}>
        Attendance Log
      </Typography>
      <Box sx={{ maxHeight: 300, overflowY: "auto", mt: 2 }}>
        {attendanceLog.map((entry, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="body1">{entry.date}</Typography>
            <Typography
              variant="body1"
              sx={{
                color: entry.status === "Present" ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {entry.status}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="outlined" color="primary" onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
};

export default PersonalAttendance;
