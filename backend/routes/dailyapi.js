const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const moment = require("moment");
const User = require("../models/User");
const Devicelog = require("../models/Devicelog");

const parseUserRoles = (user) => {
  if (typeof user.role === 'object' && user.role !== null) {
    return user.role.roles || [];
  }
  if (typeof user.role === 'string') {
    try {
      return JSON.parse(user.role).roles || [];
    } catch (err) {
      console.error("Error parsing role JSON:", err);
    }
  }
  return [];
};

// Common function to get students based on role
async function getStudentsForUser(requestingUser, roles) {
  let studentWhereClause = {};
  
  if (roles.includes('student')) {
    studentWhereClause.sin_number = requestingUser.sin_number;
  } 
  else if (roles.includes('mentor')) {
    studentWhereClause.department = requestingUser.department;
    studentWhereClause.year = requestingUser.year;
  } 
  else if (roles.includes('class_advisor')) {
    studentWhereClause.department = requestingUser.department;
    studentWhereClause.year = requestingUser.year;
  } 
  else if (roles.includes('hod')) {
    studentWhereClause.department = requestingUser.department;
  } 
  else if (roles.includes('principal')) {
    studentWhereClause.college = requestingUser.college;
  } 
  else {
    return [];
  }

  const potentialStudents = await User.findAll({
    where: studentWhereClause,
    attributes: ['sin_number', 'student_name', 'department', 'year', 'role'],
    raw: true
  });

  return potentialStudents.filter(user => {
    if (user.sin_number === requestingUser.sin_number) return false;
    try {
      const userRoles = typeof user.role === 'string' 
        ? JSON.parse(user.role).roles || []
        : (user.role?.roles || []);
      return userRoles.includes('student');
    } catch (e) {
      console.error(`Error parsing role for ${user.sin_number}:`, e);
      return false;
    }
  });
}

// Common function to calculate attendance
async function calculateAttendance(studentIds, startDate, endDate) {
  const logs = await Devicelog.findAll({
    where: {
      UserId: studentIds,
      LogDate: {
        [Op.between]: [
          moment(startDate).startOf('day').toDate(),
          moment(endDate).endOf('day').toDate()
        ]
      }
    },
    order: [["LogDate", "ASC"]],
    raw: true
  });

  const dateRange = [];
  let currentDate = moment(startDate);
  const endDateMoment = moment(endDate);

  while (currentDate <= endDateMoment) {
    dateRange.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.add(1, 'days');
  }

  const attendanceData = {};

  studentIds.forEach(studentId => {
    attendanceData[studentId] = {};
    dateRange.forEach(date => {
      attendanceData[studentId][date] = {
        hours: 0,
        status: 'Absent'
      };
    });
  });

  const logsByUserAndDate = {};

  logs.forEach(log => {
    const logDate = moment(log.LogDate).format('YYYY-MM-DD');
    const userId = log.UserId;
    
    if (!logsByUserAndDate[userId]) {
      logsByUserAndDate[userId] = {};
    }
    if (!logsByUserAndDate[userId][logDate]) {
      logsByUserAndDate[userId][logDate] = [];
    }
    
    logsByUserAndDate[userId][logDate].push(log);
  });

  Object.keys(logsByUserAndDate).forEach(userId => {
    Object.keys(logsByUserAndDate[userId]).forEach(date => {
      const studentLogs = logsByUserAndDate[userId][date];
      const hours = calculatePresentHours(studentLogs);
      
      attendanceData[userId][date] = {
        hours: parseFloat(hours.toFixed(2)),
        status: hours > 0 ? 'Present' : 'Absent'
      };
    });
  });

  return attendanceData;
}

function calculatePresentHours(logs) {
  let totalDuration = 0;
  let lastInLog = null;

  logs.forEach(log => {
    if (log.C1 === "in") {
      lastInLog = log;
    } else if (log.C1 === "out" && lastInLog) {
      const inTime = moment(lastInLog.LogDate);
      const outTime = moment(log.LogDate);
      totalDuration += outTime.diff(inTime, "hours", true);
      lastInLog = null;
    }
  });

  return totalDuration = parseFloat(totalDuration.toFixed(2));
}

// Daily Attendance API - Your working version
router.post("/daily-attendance", async (req, res) => {  
  try {
    
    // const { UserId, targetDate } = req.body;
    const { UserId } = req.body;
    const targetDate = "2024-08-04"; 


    if (!UserId) {

    // if (!UserId || !targetDate) {
      return res.status(400).json({
        status: 400,
        error: "Missing required fields: UserId or targetDate",
      });
    }

    // Get requesting user details
    const requestingUser = await User.findOne({ 
      where: { sin_number: UserId } 
    });
    
    if (!requestingUser) {
      return res.status(404).json({
        status: 404,
        error: "User not found",
      });
    }

    // Parse user roles
    const roles = parseUserRoles(requestingUser);
    
    // Determine which students we need to fetch attendance for
    let studentWhereClause = {};
    
    if (roles.includes('student')) {
      studentWhereClause.sin_number = UserId;
    } 
    else if (roles.includes('mentor')) {
      studentWhereClause.department = requestingUser.department;
      studentWhereClause.year = requestingUser.year;
    } 
    else if (roles.includes('class_advisor')) {
      studentWhereClause.department = requestingUser.department;
      studentWhereClause.year = requestingUser.year;
    } 
    else if (roles.includes('hod')) {
      studentWhereClause.department = requestingUser.department;
    } 
    else if (roles.includes('principal')) {
      studentWhereClause.college = requestingUser.college;
    }
    else if (roles.includes('admin')) {
      studentWhereClause.college = requestingUser.college;
    } 
    else {
      return res.status(403).json({
        status: 403,
        error: "Unauthorized access - no valid role found",
      });
    }

    // First find all relevant users (before student filtering)
    const potentialStudents = await User.findAll({
      where: studentWhereClause,
      attributes: ['sin_number', 'student_name', 'department', 'year', 'role'],
      raw: true
    });

    // Filter to only include actual students (excluding the requesting user)
    const students = potentialStudents.filter(user => {
      // Skip the requesting user regardless of role
      if (user.sin_number === UserId) return false;
      
      try {
        const userRoles = typeof user.role === 'string' 
          ? JSON.parse(user.role).roles || []
          : (user.role?.roles || []);
        return userRoles.includes('student');
      } catch (e) {
        console.error(`Error parsing role for ${user.sin_number}:`, e);
        return false;
      }
    });

    if (students.length === 0) {
      return res.json({
        status: 200,
        date: targetDate,
        message: "No students found for the given criteria",
        presentHours: {},
        studentDetails: {}
      });
    }

    const studentIds = students.map(s => s.sin_number);

    // Then fetch their attendance logs
    const logs = await Devicelog.findAll({
      where: {
        UserId: studentIds
      },
      order: [["LogDate", "ASC"]],
      raw: true
    });

    // Calculate present hours for each student
    const presentHours = {};
    const studentDetails = {};

    students.forEach(student => {
      studentDetails[student.sin_number] = {
        name: student.student_name,
        department: student.department,
        year: student.year
      };
      
      // Filter logs for this student and target date
      const studentLogs = logs.filter(log => 
        log.UserId === student.sin_number && 
        moment(log.LogDate).format("YYYY-MM-DD") === moment(targetDate).format("YYYY-MM-DD")
      );

      presentHours[student.sin_number] = {
        hours: calculatePresentHours(studentLogs),
        status: parseFloat(calculatePresentHours(studentLogs)) > 0 ? "Present" : "Absent"
      };
    });

    return res.json({
      status: 200,
      date: targetDate,
      role: roles,
      presentHours,
      studentDetails
    });

  } catch (error) {
    console.error("Error in daily-attendance:", error);
    return res.status(500).json({
      status: 500,
      error: "Internal server error"
    });
  }
});

// Monthly Attendance API
router.post("/attendance-month", async (req, res) => {
  try {
    const { UserId } = req.body;
    // const {UserId,startDate,endDate} = req.body;

    // if(!UserId || !startDate || !endDate){
    if (!UserId) {
    return res.status(400).json({
        status: 400,
        error: "Missing required field: UserId , startDate, endDate",
      });
    }

    const requestingUser = await User.findOne({ 
      where: { sin_number: UserId } 
    });
    
    if (!requestingUser) {
      return res.status(404).json({
        status: 404,
        error: "User not found",
      });
    }

    const roles = parseUserRoles(requestingUser);
    const students = await getStudentsForUser(requestingUser, roles);

    if (students.length === 0) {
      return res.json({
        status: 200,
        message: "No students found for the given criteria",
        data: {}
      });
    }

    const studentIds = students.map(s => s.sin_number);
    const studentDetails = {};

    students.forEach(student => {
      studentDetails[student.sin_number] = {
        name: student.student_name,
        department: student.department,
        year: student.year
      };
    });
      // IDHAA MATTER REEH 
    // Get first and last day of current month
    // const startDate = moment().startOf('month').format('YYYY-MM-DD');
    // const endDate = moment().endOf('month').format('YYYY-MM-DD');

     // IDHU POONA MONTH KU 
//     const startDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
// const endDate = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');

    const targetMonth = "2024-08"; // YYYY-MM format
    const startDate = moment(targetMonth).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(targetMonth).endOf('month').format('YYYY-MM-DD');
    const attendanceData = await calculateAttendance(studentIds, startDate, endDate);

    // Calculate totals
    const result = {};
    Object.keys(attendanceData).forEach(studentId => {
      const studentAttendance = attendanceData[studentId];
      let presentDays = 0;
      let absentDays = 0;

      Object.keys(studentAttendance).forEach(date => {
        if (studentAttendance[date].status === 'Present') {
          presentDays++;
        } else {
          absentDays++;
        }
      });

      result[studentId] = {
        ...studentDetails[studentId],
        presentDays,
        absentDays,
        attendance: studentAttendance
      };
    });

    res.status(200).json({
      status: 200,
      data: result
    });

  } catch (err) {
    console.error("Error fetching monthly attendance:", err);
    res.status(500).json({
      status: 500,
      error: "Server error occurred while fetching monthly attendance.",
    });
  }
});

// Weekly Attendance API
router.post("/attendance-week", async (req, res) => {
  try {
    // const { UserId, startDate, endDate } = req.body;
    const { UserId } = req.body;

    if (!UserId) {
        // if (!UserId || !startDate || !endDate) {
      return res.status(400).json({
        status: 400,
        error: "Missing required fields: UserId, startDate, endDate",
      });
    }

    const requestingUser = await User.findOne({ 
      where: { sin_number: UserId } 
    });
    
    if (!requestingUser) {
      return res.status(404).json({
        status: 404,
        error: "User not found",
      });
    }

    const roles = parseUserRoles(requestingUser);
    const students = await getStudentsForUser(requestingUser, roles);

    if (students.length === 0) {
      return res.json({
        status: 200,
        message: "No students found for the given criteria",
        data: {}
      });
    }

    const studentIds = students.map(s => s.sin_number);
    const studentDetails = {};

    students.forEach(student => {
      studentDetails[student.sin_number] = {
        name: student.student_name,
        department: student.department,
        year: student.year
      };
    });


    // IDHAA MATTER REEEH 

    // IDHU CURRENT WEEK KU
    // const startDate = moment().startOf('week').format('YYYY-MM-DD');
    // const endDate = moment().endOf('week').format('YYYY-MM-DD');

    // IDHU POONA VAARAM  KU 
//     const startDate = moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
// const endDate = moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');

// IDHU SPECIFIC WEEK KU 
    const targetWeek = "2024-08-12";  // ← Any date in August 2024's 3rd week
    const endWeek = "2024-08-18";
const startDate = moment(targetWeek).format('YYYY-MM-DD');
const endDate = moment(endWeek).format('YYYY-MM-DD');

    const attendanceData = await calculateAttendance(studentIds, startDate, endDate);

    // Calculate totals
    const result = {};
    Object.keys(attendanceData).forEach(studentId => {
      const studentAttendance = attendanceData[studentId];
      let presentDays = 0;
      let absentDays = 0;

      Object.keys(studentAttendance).forEach(date => {
        if (studentAttendance[date].status === 'Present') {
          presentDays++;
        } else {
          absentDays++;
        }
      });

      result[studentId] = {
        ...studentDetails[studentId],
        presentDays,
        absentDays,
        attendance: studentAttendance
      };
    });

    res.status(200).json({
      status: 200,
      data: result
    });

  } catch (err) {
    console.error("Error fetching weekly attendance:", err);
    res.status(500).json({
      status: 500,
      error: "Server error occurred while fetching weekly attendance.",
    });
  }
});

module.exports = router;