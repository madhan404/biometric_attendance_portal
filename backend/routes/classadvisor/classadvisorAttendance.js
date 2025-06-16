const express = require("express");
const router = express.Router();
const { Sequelize } = require("sequelize");
const sequelize = require("../../config/db");
const { Op } = require("sequelize");
const SystemConfig = require("../../models/system_config");
const Holiday = require("../../models/holidays");
const Leave = require("../../models/Leave");
const Devicelogs = require("../../models/Devicelog");
const User = require("../../models/User");
const { format } = require('date-fns');
const SemesterDetails = require("../../models/semester_details");

// Helper function to calculate attendance for a given date range
const calculateAttendance = async (startDate, endDate, classAdvisorSinNumber, timeUnit = 'daily') => {
  // Get system configuration
  const config = await SystemConfig.findOne();
  if (!config) {
    throw new Error('System configuration not found');
  }

  // Parse time configurations
  const gracePeriod = config.grace_period;
  const autoLockout = config.auto_lockout;
  const lateThreshold = config.late_mark_threshold;

  // Convert grace period to minutes
  const graceMinutes = parseInt(gracePeriod.split(':')[1]);
  
  // Convert auto lockout to minutes
  const [lockoutHours, lockoutMinutes] = autoLockout.split(':');
  const autoLockoutMinutes = parseInt(lockoutHours) * 60 + parseInt(lockoutMinutes);

  // Get all students for this class advisor
  const students = await User.findAll({
    where: {
      class_advisor: classAdvisorSinNumber,
      role: 'student'
    }
  });

  if (!students || students.length === 0) {
    return {
      departmentData: {
        totalStudents: 0,
        attendancePercentage: 0
      },
      attendanceStats: {
        present: 0,
        absent: 0,
        late: 0,
        od: 0,
        internship: 0,
        earlyDeparture: 0
      },
      departmentStats: [],
      timeSeriesData: []
    };
  }

  const studentSinNumbers = students.map(student => student.sin_number);

  // Get all holidays for the date range
  const holidays = await Holiday.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    }
  });

  // Get all approved leaves for the date range
  const leaves = await Leave.findAll({
    where: {
      principal_approval: 'approved',
      sin_number: { [Op.in]: studentSinNumbers },
      [Op.or]: [
        {
          startDate: { [Op.lte]: endDate },
          endDate: { [Op.gte]: startDate }
        }
      ]
    }
  });

  // Get all device logs for these students
  const deviceLogs = await Devicelogs.findAll({
    where: {
      UserId: {
        [Op.in]: studentSinNumbers
      },
      LogDate: {
        [Op.between]: [new Date(`${startDate}T00:00:00`), new Date(`${endDate}T23:59:59`)]
      }
    },
    order: [['LogDate', 'ASC']]
  });

  // Initialize stats
  const stats = {
    total: students.length,
    present: 0,
    absent: 0,
    late: 0,
    od: 0,
    internship: 0,
    earlyDeparture: 0,
    attendancePercentage: 0
  };

  // Process time series data based on time unit
  const timeSeriesData = [];
  let currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);

  while (currentDate <= endDateObj) {
    let periodEnd;
    let periodName;
    
    if (timeUnit === 'daily') {
      periodEnd = new Date(currentDate);
      periodName = format(currentDate, 'MMM dd');
    } else if (timeUnit === 'weekly') {
      periodEnd = new Date(currentDate);
      periodEnd.setDate(periodEnd.getDate() + 6);
      if (periodEnd > endDateObj) periodEnd = endDateObj;
      periodName = `Week ${timeSeriesData.length + 1}`;
    } else if (timeUnit === 'monthly') {
      periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      if (periodEnd > endDateObj) periodEnd = endDateObj;
      periodName = format(currentDate, 'MMM');
    }

    const periodStats = {
      date: currentDate.toISOString().split('T')[0],
      name: periodName,
      present: 0,
      absent: 0,
      late: 0,
      od: 0,
      internship: 0,
      earlyDeparture: 0
    };

    // Process each day in the period
    let day = new Date(currentDate);
    while (day <= periodEnd) {
      const dateStr = day.toISOString().split('T')[0];
      const isHoliday = holidays.some(h => 
        typeof h.date === 'string' ? h.date === dateStr : new Date(h.date).toISOString().split('T')[0] === dateStr
      );

      if (!isHoliday) {
        studentSinNumbers.forEach(sinNumber => {
          const studentLogs = deviceLogs.filter(log => 
            log.UserId === sinNumber && 
            (typeof log.LogDate === 'string' ? log.LogDate.slice(0, 10) : log.LogDate.toISOString().split('T')[0]) === dateStr
          );

          if (studentLogs.length > 0) {
            const checkIn = studentLogs.find(log => log.C1 === 'in');
            const checkOut = studentLogs.find(log => log.C1 === 'out');

            if (checkIn) {
              const checkInTime = new Date(checkIn.LogDate);
              const baseTime = new Date(`${dateStr}T09:00:00`);
              const graceTime = new Date(baseTime);
              graceTime.setMinutes(graceTime.getMinutes() + graceMinutes);
              
              const isLate = checkInTime > graceTime;
              const isEarlyDeparture = checkOut && new Date(checkOut.LogDate) < new Date(`${dateStr}T16:30:00`);

              if (isLate) {
                periodStats.late++;
                stats.late++;
              } else if (isEarlyDeparture) {
                periodStats.earlyDeparture++;
                stats.earlyDeparture++;
              } else {
                periodStats.present++;
                stats.present++;
              }
            }
          } else {
            const studentLeaves = leaves.filter(leave => 
              leave.sin_number === sinNumber && 
              new Date(leave.startDate) <= day && 
              new Date(leave.endDate) >= day
            );

            if (studentLeaves.length > 0) {
              const leave = studentLeaves[0];
              if (leave.request_type === 'od') {
                periodStats.od++;
                stats.od++;
              } else if (leave.request_type === 'internship') {
                periodStats.internship++;
                stats.internship++;
              }
            } else {
              periodStats.absent++;
              stats.absent++;
            }
          }
        });
      }
      day.setDate(day.getDate() + 1);
    }

    timeSeriesData.push(periodStats);
    
    if (timeUnit === 'daily') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (timeUnit === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (timeUnit === 'monthly') {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
  }

  // Calculate attendance percentage
  const totalWorkingDays = timeSeriesData.filter(day => 
    !holidays.some(h => typeof h.date === 'string' ? h.date === day.date : new Date(h.date).toISOString().split('T')[0] === day.date)
  ).length;

  stats.attendancePercentage = totalWorkingDays > 0
    ? Math.round(((stats.present + stats.od + stats.internship) / (studentSinNumbers.length * totalWorkingDays)) * 100)
    : 0;

  return {
    departmentData: {
      totalStudents: students.length,
      attendancePercentage: stats.attendancePercentage
    },
    attendanceStats: {
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      od: stats.od,
      internship: stats.internship,
      earlyDeparture: stats.earlyDeparture
    },
    departmentStats: [{
      name: 'Students',
      ...stats,
      timeSeriesData
    }],
    timeSeriesData
  };
};

// Helper function to get date range for a specific week in a month
const getWeekDateRange = (monthName, weekNumber) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  if (monthIndex === -1) throw new Error('Invalid month name');

  const year = new Date().getFullYear();
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  
  const firstDayOfWeek = new Date(firstDay);
  firstDayOfWeek.setDate(firstDay.getDate() + ((weekNumber - 1) * 7));
  
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  
  if (lastDayOfWeek > lastDay) {
    lastDayOfWeek.setDate(lastDay.getDate());
  }

  return {
    startDate: firstDayOfWeek.toISOString().split('T')[0],
    endDate: lastDayOfWeek.toISOString().split('T')[0]
  };
};

// Helper function to get date range for a specific month
const getMonthDateRange = (year, monthName) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  if (monthIndex === -1) throw new Error('Invalid month name');

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  return {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0]
  };
};

// Daily attendance endpoint
router.get('/daily-attendance', async (req, res) => {
  try {
    const { date, sin_number } = req.query;
    if (!date || !sin_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: date and sin_number are required'
      });
    }
    const result = await calculateAttendance(date, date, sin_number, 'daily');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching class advisor daily attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class advisor daily attendance',
      error: error.message
    });
  }
});

// Weekly attendance endpoint
router.get('/weekly-attendance', async (req, res) => {
  try {
    const { month, weekNumber, sin_number } = req.query;
    if (!month || !weekNumber || !sin_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: month, weekNumber, and sin_number are required'
      });
    }

    const weekNum = parseInt(weekNumber);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Week number must be between 1 and 5'
      });
    }

    const { startDate, endDate } = getWeekDateRange(month, weekNum);
    const result = await calculateAttendance(startDate, endDate, sin_number, 'weekly');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching class advisor weekly attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class advisor weekly attendance',
      error: error.message
    });
  }
});

// Monthly attendance endpoint
router.get('/monthly-attendance', async (req, res) => {
  try {
    const { year, month, sin_number } = req.query;
    if (!year || !month || !sin_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: year, month, and sin_number are required'
      });
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year format'
      });
    }

    const { startDate, endDate } = getMonthDateRange(yearNum, month);
    const result = await calculateAttendance(startDate, endDate, sin_number, 'monthly');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching class advisor monthly attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class advisor monthly attendance',
      error: error.message
    });
  }
});

// Student-level attendance endpoint
router.get('/student-attendance', async (req, res) => {
  try {
    const { sin_number, date, search } = req.query;
    if (!sin_number) {
      return res.status(400).json({ success: false, message: 'Class advisor SIN number is required' });
    }

    // Default to yesterday's date for status
    const targetDate = date || new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Get all students for this class advisor
    const studentWhere = {
      class_advisor: sin_number,
      role: 'student',
      ...(search ? { sin_number: { [Op.like]: `%${search}%` } } : {})
    };
    const students = await User.findAll({ where: studentWhere });
    const sinNumbers = students.map(s => s.sin_number);

    if (!students || students.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get current semester
    const today = new Date().toISOString().split('T')[0];
    const semester = await SemesterDetails.findOne({
      where: {
        semester_start_date: { [Op.lte]: today },
        semester_end_date: { [Op.gte]: today }
      },
      order: [['semester_start_date', 'DESC']]
    });
    if (!semester) {
      return res.status(404).json({ success: false, message: 'No active semester found' });
    }
    const semesterStart = semester.semester_start_date;
    const semesterEnd = today;

    // Get all holidays in the semester
    const holidays = await Holiday.findAll({
      where: {
        date: {
          [Op.between]: [semesterStart, semesterEnd]
        }
      }
    });
    const holidayDates = holidays.map(h => typeof h.date === 'string' ? h.date : h.date.toISOString().split('T')[0]);

    // Get all device logs for these students in the semester
    const logs = await Devicelogs.findAll({
      where: {
        UserId: { [Op.in]: sinNumbers },
        LogDate: {
          [Op.gte]: new Date(`${semesterStart}T00:00:00`),
          [Op.lte]: new Date(`${semesterEnd}T23:59:59`)
        }
      }
    });

    // Get all approved leaves for the semester
    const leaves = await Leave.findAll({
      where: {
        principal_approval: 'approved',
        sin_number: { [Op.in]: sinNumbers },
        [Op.or]: [
          {
            startDate: { [Op.lte]: semesterEnd },
            endDate: { [Op.gte]: semesterStart }
          }
        ]
      }
    });

    // Helper: get all working days in the semester
    function getWorkingDays(start, end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      let count = 0;
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!holidayDates.includes(dateStr)) {
          count++;
        }
      }
      return count;
    }
    const totalWorkingDays = getWorkingDays(semesterStart, semesterEnd);

    // Attendance status logic for a single date
    const getStatus = (sin_number) => {
      const studentLogs = logs.filter(l => l.UserId === sin_number && (typeof l.LogDate === 'string' ? l.LogDate.slice(0, 10) : l.LogDate.toISOString().split('T')[0]) === targetDate);
      if (studentLogs.length > 0) {
        const checkIn = studentLogs.find(l => l.C1 === 'in');
        if (checkIn) {
          return 'present';
        }
      } else {
        const leave = leaves.find(lv => lv.sin_number === sin_number && lv.startDate <= targetDate && lv.endDate >= targetDate);
        if (leave) {
          if (leave.request_type === 'od') return 'od';
          if (leave.request_type === 'internship') return 'internship';
        }
        return 'absent';
      }
      return 'absent';
    };

    // Attendance percentage for the semester
    const getAttendancePercentage = (sin_number) => {
      let attended = 0;
      for (let d = new Date(semesterStart); d <= new Date(semesterEnd); d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (holidayDates.includes(dateStr)) continue;
        const studentLogs = logs.filter(l => l.UserId === sin_number && (typeof l.LogDate === 'string' ? l.LogDate.slice(0, 10) : l.LogDate.toISOString().split('T')[0]) === dateStr);
        if (studentLogs.length > 0) {
          const checkIn = studentLogs.find(l => l.C1 === 'in');
          if (checkIn) {
            attended++;
            continue;
          }
        }
        const leave = leaves.find(lv => lv.sin_number === sin_number && lv.startDate <= dateStr && lv.endDate >= dateStr);
        if (leave) {
          if (leave.request_type === 'od' || leave.request_type === 'internship') {
            attended++;
            continue;
          }
        }
      }
      return totalWorkingDays > 0 ? Math.round((attended / totalWorkingDays) * 100) : 0;
    };

    const data = students.map(s => {
      const status = getStatus(s.sin_number);
      return {
        sin_number: s.sin_number,
        name: s.name,
        department: s.department,
        year: s.year,
        status,
        attendancePercentage: getAttendancePercentage(s.sin_number)
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching class advisor student-level attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch class advisor student-level attendance', 
      error: error.message 
    });
  }
});

module.exports = router; 