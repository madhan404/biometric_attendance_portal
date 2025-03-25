import { useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import WeeklyAttendance from "./WeeklyAttendance";
import MonthlyAttendance from "./MonthlyAttendance";

const PersonalAttendance = () => {
  const [attendanceType, setAttendanceType] = useState("weekly");

  const handleAttendanceTypeChange = (event) => {
    setAttendanceType(event.target.value);
  };

  return (
    <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Personal Attendance
      </Typography>

      <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
        <InputLabel id="attendance-type-label">Attendance Type</InputLabel>
        <Select
          labelId="attendance-type-label"
          value={attendanceType}
          onChange={handleAttendanceTypeChange}
          label="Attendance Type"
        >
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </Select>
      </FormControl>

      {attendanceType === "weekly" && (
        <Box>
          <WeeklyAttendance/>
        </Box>
      )}
      {attendanceType === "monthly" && (
        <Box>
          <MonthlyAttendance/>
        </Box>
      )}
    </Paper>
  );
};

export default PersonalAttendance;
