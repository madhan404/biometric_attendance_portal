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
const calculateAttendance = async (startDate, endDate, college, timeUnit = 'daily') => {
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

  // Get all departments
  const departments = await User.findAll({
    where: {
      role: 'student',
      college: college
    },
    attributes: [
      'department',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalStudents']
    ],
    group: ['department']
  });

  // Get all students for all departments
  const allStudents = await User.findAll({
    where: {
      role: 'student',
      college: college
    }
  });

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
      [Op.or]: [
        {
          startDate: { [Op.lte]: endDate },
          endDate: { [Op.gte]: startDate }
        }
      ]
    }
  });

  // Process each department
  const departmentStats = await Promise.all(departments.map(async (dept) => {
    const departmentName = dept.department;
    const totalStudents = parseInt(dept.getDataValue('totalStudents'));

    // Get students in this department
    const students = allStudents.filter(student => student.department === departmentName);
    const studentSinNumbers = students.map(student => student.sin_number);

    // Get all device logs for these students
    const deptDeviceLogs = await Devicelogs.findAll({
      where: {
        UserId: {
          [Op.in]: studentSinNumbers
        }
      },
      order: [['LogDate', 'ASC']]
    });

    // Filter logs for the date range
    const filteredLogs = deptDeviceLogs.filter(log => {
      const logDate = new Date(log.LogDate);
      return logDate >= new Date(`${startDate}T00:00:00`) && 
             logDate <= new Date(`${endDate}T23:59:59`);
    });

    // Filter leaves for this department
    const deptLeaves = leaves.filter(leave => studentSinNumbers.includes(leave.sin_number));

    // Initialize department stats
    const stats = {
      name: departmentName,
      total: totalStudents,
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
            const studentLogs = filteredLogs.filter(log => 
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
              const studentLeaves = deptLeaves.filter(leave => 
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
      ...stats,
      timeSeriesData
    };
  }));

  // Calculate overall statistics
  const totalStudents = departments.reduce((sum, dept) => 
    sum + parseInt(dept.getDataValue('totalStudents')), 0);

  const overallStats = {
    present: departmentStats.reduce((sum, dept) => sum + dept.present, 0),
    absent: departmentStats.reduce((sum, dept) => sum + dept.absent, 0),
    late: departmentStats.reduce((sum, dept) => sum + dept.late, 0),
    od: departmentStats.reduce((sum, dept) => sum + dept.od, 0),
    internship: departmentStats.reduce((sum, dept) => sum + dept.internship, 0),
    earlyDeparture: departmentStats.reduce((sum, dept) => sum + dept.earlyDeparture, 0)
  };

  // Calculate total working days for the period
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const totalWorkingDays = totalDays - holidays.length;

  const overallAttendancePercentage = totalStudents > 0 && totalWorkingDays > 0
    ? Math.round(((overallStats.present + overallStats.od + overallStats.internship) / 
       (totalStudents * totalWorkingDays)) * 100)
    : 0;

  return {
    departmentData: {
      totalStudents,
      attendancePercentage: overallAttendancePercentage
    },
    attendanceStats: overallStats,
    departmentStats,
    timeSeriesData: departmentStats[0]?.timeSeriesData || []
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
  
  // Calculate the first day of the requested week
  const firstDayOfWeek = new Date(firstDay);
  firstDayOfWeek.setDate(firstDay.getDate() + ((weekNumber - 1) * 7));
  
  // Calculate the last day of the requested week
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  
  // Ensure we don't go beyond the last day of the month
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
router.get('/department-daily-attendance', async (req, res) => {
  try {
    const { date, college } = req.query;
    if (!date || !college) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: date and college are required'
      });
    }
    // Use the same date for start and end
    const result = await calculateAttendance(date, date, college, 'daily');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching department daily attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department daily attendance',
      error: error.message
    });
  }
});

// Weekly attendance endpoint
router.get('/department-weekly-attendance', async (req, res) => {
  try {
    const { month, weekNumber, college } = req.query;
    if (!month || !weekNumber || !college) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: month, weekNumber, and college are required'
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
    const result = await calculateAttendance(startDate, endDate, college, 'weekly');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching department weekly attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department weekly attendance',
      error: error.message
    });
  }
});

// Monthly attendance endpoint
router.get('/department-monthly-attendance', async (req, res) => {
  try {
    const { year, month, college } = req.query;
    if (!year || !month || !college) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: year, month, and college are required'
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
    const result = await calculateAttendance(startDate, endDate, college, 'monthly');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching department monthly attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department monthly attendance',
      error: error.message
    });
  }
});

// Student-level attendance endpoint
router.get('/department-student-attendance', async (req, res) => {
  try {
    const { college, department, year, date, search } = req.query;
    if (!college) {
      return res.status(400).json({ success: false, message: 'College is required' });
    }
    // Default to yesterday's date for status
    const targetDate = date || new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Get all students for the college (and department/year if provided)
    const studentWhere = {
      role: 'student',
      college,
      ...(department ? { department } : {}),
      ...(year ? { year } : {}),
      ...(search ? { sin_number: { [Op.like]: `%${search}%` } } : {})
    };
    const students = await User.findAll({ where: studentWhere });
    const sinNumbers = students.map(s => s.sin_number);

    // Get current semester for the college (latest semester_start_date <= today)
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
    const semesterEnd = today; // always up to today

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
        // Present/OD/Internship for this day?
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
    console.error('Error fetching student-level attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student-level attendance', error: error.message });
  }
});

module.exports = router;