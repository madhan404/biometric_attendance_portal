import React from "react";
import { Box, Typography, Paper, Button, Grid } from "@mui/material";
//staff req pagee
const attendanceData = [
  { studentName: "John Doe", attendance: "Present", date: "2024-10-01" },
  { studentName: "Jane Smith", attendance: "Absent", date: "2024-10-01" },
  { studentName: "Alice Johnson", attendance: "Present", date: "2024-10-01" },
  { studentName: "Bob Brown", attendance: "Present", date: "2024-10-02" },
  { studentName: "Charlie Green", attendance: "Late", date: "2024-10-02" },
  // Add more attendance records as needed
];

// Constants for calculation
const TOTAL_STUDENTS = 100;
const totalPresent = attendanceData.filter(item => item.attendance === 'Present').length;
const totalAbsent = attendanceData.filter(item => item.attendance === 'Absent').length;
const totalLate = attendanceData.filter(item => item.attendance === 'Late').length;

// Calculate average attendance percentage
const averageAttendance = ((totalPresent / TOTAL_STUDENTS) * 100).toFixed(2);

const DataPage = () => {
  const handleCancel = () => {
    window.history.back(); // Navigate to the previous page
  };

  return (
    <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2, maxWidth: '1000px', margin: '20px', borderRadius: '8px', boxShadow: 5 }}>
        <Typography variant="h4" gutterBottom align="center">
          Attendance Overview
        </Typography>

        <Grid container spacing={3} sx={{ mb: 8 }}>
          <Grid item xs={6}>
            <Typography variant="h6">Total Students: {TOTAL_STUDENTS}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Total Attendance Records: {attendanceData.length}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Total Present: {totalPresent}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Total Absent: {totalAbsent}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Total Late: {totalLate}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Average Attendance: {averageAttendance}%</Typography>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom>
          Attendance Details
        </Typography>
        <Box sx={{ overflowX: 'auto', mb: 4 }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead" sx={{ backgroundColor: '#1976d2', color: '#fff' }}>
              <Box component="tr">
                <Box component="th" sx={{ border: '1px solid #ddd', padding: '8px' }}>Student Name</Box>
                <Box component="th" sx={{ border: '1px solid #ddd', padding: '8px' }}>Attendance</Box>
                <Box component="th" sx={{ border: '1px solid #ddd', padding: '8px' }}>Date</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {attendanceData.map((record, index) => (
                <Box component="tr" key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                  <Box component="td" sx={{ border: '1px solid #ddd', padding: '8px' }}>{record.studentName}</Box>
                  <Box component="td" sx={{ border: '1px solid #ddd', padding: '8px', color: record.attendance === 'Absent' ? 'red' : 'black' }}>
                    {record.attendance}
                  </Box>
                  <Box component="td" sx={{ border: '1px solid #ddd', padding: '8px' }}>{record.date}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DataPage;
