const express = require("express");
const router = express.Router();
const { Op, Sequelize } = require("sequelize");
const User = require("../../models/User");
const Holiday = require("../../models/holidays");
const Devicelogs = require("../../models/Devicelog");
const SemesterDetails = require("../../models/semester_details");
const { format } = require('date-fns');
const Leave = require("../../models/Leave");

// Helper: get all working days in a range, excluding holidays
function getWorkingDays(start, end, holidayDates) {
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

// Helper: get week date range
function getWeekDateRange(monthName, weekNumber) {
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
  if (lastDayOfWeek > lastDay) lastDayOfWeek.setDate(lastDay.getDate());
  return {
    startDate: firstDayOfWeek.toISOString().split('T')[0],
    endDate: lastDayOfWeek.toISOString().split('T')[0]
  };
}

// Helper: get month date range
function getMonthDateRange(year, monthName) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  if (monthIndex === -1) throw new Error('Invalid month name');
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  return {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0]
  };
}

// Main logic for staff attendance stats (single date)
async function getStaffAttendanceStats({ date, college, department }) {
  // Get all staff for the college (and department if provided)
  const staffWhere = {
    role: { [Op.or]: ['staff', 'mentor', 'class_advisor'] },
    college,
    ...(department ? { department } : {})
  };
  const staff = await User.findAll({ where: staffWhere });
  const sinNumbers = staff.map(s => s.sin_number);
  // Get all holidays for the date
  const holidays = await Holiday.findAll({
    where: { date }
  });
  const isHoliday = holidays.length > 0;
  // Get all device logs for these staff
  const logs = await Devicelogs.findAll({
    where: {
      UserId: { [Op.in]: sinNumbers },
      LogDate: { [Op.gte]: new Date(`${date}T00:00:00`), [Op.lte]: new Date(`${date}T23:59:59`) }
    }
  });

  // Get all approved leaves for the date
  const leaves = await Leave.findAll({
    where: {
      principal_approval: 'approved',
      sin_number: { [Op.in]: sinNumbers }, 
      [Op.or]: [
        { // OD and Leave types that span the date
          request_type: { [Op.in]: ['od', 'leave'] },
          startDate: { [Op.lte]: date },
          endDate: { [Op.gte]: date }
        },
        { // Permission type for the specific date
          request_type: 'permission',
          [Op.and]: Sequelize.where(Sequelize.fn('date', Sequelize.col('startDate')), date)
        }
      ]
    }
  });

  // Department stats
  const departmentStats = {};
  staff.forEach(staffMember => {
    const dept = staffMember.department;
    if (!departmentStats[dept]) departmentStats[dept] = { present: 0, absent: 0, od: 0, permission: 0, total: 0 };
    
    let currentPresent = 0, currentOd = 0, currentAbsent = 0, currentPermission = 0;

    if (!isHoliday) {
      const dayLogs = logs.filter(l => l.UserId === staffMember.sin_number && (typeof l.LogDate === 'string' ? l.LogDate.slice(0, 10) : l.LogDate.toISOString().split('T')[0]) === date);
      
      // Explicitly find if there's a permission leave for this staff member for the date
      const permissionLeaveForStaff = leaves.find(l => 
        l.sin_number === staffMember.sin_number && 
        l.request_type === 'permission'
        // Date is already filtered by the main query
      );

      // Explicitly find if there's an OD leave for this staff member for the date
      const odLeaveForStaff = leaves.find(l => 
        l.sin_number === staffMember.sin_number && 
        l.request_type === 'od'
        // Date is already filtered by the main query
      );

      if (dayLogs.length > 0) {
        currentPresent++;
      } else if (permissionLeaveForStaff) { // Check for permission first
        currentPermission++;
      } else if (odLeaveForStaff) { // Then check for OD
        currentOd++;
      } else {
        currentAbsent++;
      }
    }
    departmentStats[dept].present += currentPresent;
    departmentStats[dept].od += currentOd;
    departmentStats[dept].permission += currentPermission;
    departmentStats[dept].absent += currentAbsent;
    departmentStats[dept].total++;
  });
  // Overall stats
  const overallStats = { present: 0, absent: 0, od: 0, permission: 0, holiday: 0 };
  Object.values(departmentStats).forEach(stats => {
    overallStats.present += stats.present;
    overallStats.absent += stats.absent;
    overallStats.od += stats.od;
    overallStats.permission += stats.permission;
  });
  // Calculate overall holiday count: if it's a holiday, all staff in scope are on holiday.
  if (isHoliday) {
    overallStats.holiday = staff.length;
    // Reset other counts for overall if it's a holiday, as they are mutually exclusive
    overallStats.present = 0;
    overallStats.absent = 0;
    overallStats.od = 0;
    overallStats.permission = 0;
  }

  return { departmentStats, overallStats };
}

// Main logic for staff attendance stats (date range)
async function getStaffAttendanceStatsRange({ startDate, endDate, college, department }) {
  // Get all staff for the college (and department if provided)
  const staffWhere = {
    role: { [Op.or]: ['staff', 'mentor', 'class_advisor'] },
    college,
    ...(department ? { department } : {})
  };
  const staff = await User.findAll({ where: staffWhere });
  const sinNumbers = staff.map(s => s.sin_number);
  // Get all holidays for the date range
  const holidays = await Holiday.findAll({
    where: { date: { [Op.between]: [startDate, endDate] } }
  });
  const holidayDates = holidays.map(h => typeof h.date === 'string' ? h.date : h.date.toISOString().split('T')[0]);
  // Get all device logs for these staff
  const logs = await Devicelogs.findAll({
    where: {
      UserId: { [Op.in]: sinNumbers },
      LogDate: { [Op.gte]: new Date(`${startDate}T00:00:00`), [Op.lte]: new Date(`${endDate}T23:59:59`) }
    }
  });

  // Get all approved leaves for the date range for these staff
  const leaves = await Leave.findAll({
    where: {
      principal_approval: 'approved',
      sin_number: { [Op.in]: sinNumbers },
      [Op.or]: [
        { // OD and Leave types
          request_type: { [Op.in]: ['od', 'leave'] },
          startDate: { [Op.lte]: endDate }, // Starts on or before the range ends
          endDate: { [Op.gte]: startDate }  // Ends on or after the range starts
        },
        { // Permission type - its startDate must be within the queried range
          request_type: 'permission',
          startDate: { [Op.between]: [startDate, endDate] }
        }
      ]
    }
  });

  // Department stats
  const departmentStats = {};
  staff.forEach(staffMember => {
    const dept = staffMember.department;
    if (!departmentStats[dept]) departmentStats[dept] = { present: 0, absent: 0, od: 0, permission: 0, holiday: 0, total: 0 };
    
    let currentPresent = 0, currentOd = 0, currentAbsent = 0, currentPermission = 0, currentHoliday = 0;

    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (holidayDates.includes(dateStr)) {
        currentHoliday++;
        continue;
      }
      const dayLogs = logs.filter(l => l.UserId === staffMember.sin_number && (typeof l.LogDate === 'string' ? l.LogDate.slice(0, 10) : l.LogDate.toISOString().split('T')[0]) === dateStr);
      
      // Find permission leave for the specific day (dateStr)
      const permissionLeaveOnDate = leaves.find(l => 
        l.sin_number === staffMember.sin_number &&
        l.request_type === 'permission' && 
        (l.startDate.toISOString ? l.startDate.toISOString().split('T')[0] : String(l.startDate).split(' ')[0]) === dateStr
      );

      // Find OD leave for the specific day (dateStr) that spans this day
      const odLeaveOnDate = leaves.find(l => 
        l.sin_number === staffMember.sin_number &&
        l.request_type === 'od' &&
        new Date(l.startDate) <= d && new Date(l.endDate) >= d
      );
      
      // Note: A generic 'leave' type that is not OD or Permission might also be found by the odLeaveOnDate logic if its request_type was 'leave'
      // but we prioritize permission and OD explicitly.

      if (dayLogs.length > 0) {
        currentPresent++;
      } else if (permissionLeaveOnDate) { // Check for permission first for this specific day
        currentPermission++;
      } else if (odLeaveOnDate) { // Then check for OD for this specific day
        currentOd++;
      } else {
        currentAbsent++;
      }
    }
    departmentStats[dept].present += currentPresent;
    departmentStats[dept].od += currentOd;
    departmentStats[dept].permission += currentPermission;
    departmentStats[dept].absent += currentAbsent;
    departmentStats[dept].holiday += currentHoliday;
    departmentStats[dept].total++;
  });
  // Overall stats
  const overallStats = { present: 0, absent: 0, od: 0, permission: 0, holiday: 0 };
  Object.values(departmentStats).forEach(stats => {
    overallStats.present += stats.present;
    overallStats.absent += stats.absent;
    overallStats.od += stats.od;
    overallStats.permission += stats.permission;
    overallStats.holiday += stats.holiday;
  });
  return { departmentStats, overallStats };
}

// Daily attendance endpoint
router.get('/staff-daily-attendance', async (req, res) => {
  try {
    const { date, college, department } = req.query;
    if (!date || !college) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    const result = await getStaffAttendanceStats({ date, college, department });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error fetching staff daily attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff daily attendance', error: error.message });
  }
});

// Weekly attendance endpoint
router.get('/staff-weekly-attendance', async (req, res) => {
  try {
    const { month, weekNumber, college, department } = req.query;
    if (!month || !weekNumber || !college) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    const { startDate, endDate } = getWeekDateRange(month, parseInt(weekNumber));
    const result = await getStaffAttendanceStatsRange({ startDate, endDate, college, department });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error fetching staff weekly attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff weekly attendance', error: error.message });
  }
});

// Monthly attendance endpoint
router.get('/staff-monthly-attendance', async (req, res) => {
  try {
    const { year, month, college, department } = req.query;
    if (!year || !month || !college) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    const { startDate, endDate } = getMonthDateRange(parseInt(year), month);
    const result = await getStaffAttendanceStatsRange({ startDate, endDate, college, department });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error fetching staff monthly attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff monthly attendance', error: error.message });
  }
});

// Staff table endpoint
router.get('/staff-table', async (req, res) => {
  try {
    const { college, department, date, status, search } = req.query;
    if (!college || !date) {
      return res.status(400).json({ success: false, message: 'College and date are required' });
    }
    const staffWhere = {
      role: { [Op.or]: ['staff', 'mentor', 'class_advisor'] },
      college,
      ...(department ? { department } : {}),
      ...(search ? { [Op.or]: [
        { sin_number: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } }
      ] } : {})
    };
    const staff = await User.findAll({ where: staffWhere });
    const sinNumbers = staff.map(s => s.sin_number);

    // Get logs for the specific date
    const dateLogs = await Devicelogs.findAll({
      where: {
        UserId: { [Op.in]: sinNumbers },
        LogDate: { [Op.gte]: new Date(`${date}T00:00:00`), [Op.lte]: new Date(`${date}T23:59:59`) }
      }
    });

    // Get approved leaves for the specific date
    const dateLeaves = await Leave.findAll({
      where: {
        principal_approval: 'approved',
        sin_number: { [Op.in]: sinNumbers },
        [Op.or]: [
          { // OD and Leave types that span the date
            request_type: { [Op.in]: ['od', 'leave'] },
            startDate: { [Op.lte]: date },
            endDate: { [Op.gte]: date }
          },
          { // Permission type for the specific date
            request_type: 'permission',
            [Op.and]: Sequelize.where(Sequelize.fn('date', Sequelize.col('startDate')), date)
          }
        ]
      }
    });
    
    // Check if the specific date is a holiday
    const specificDateHoliday = await Holiday.findOne({ where: { date } });
    const isSpecificDateHoliday = !!specificDateHoliday;

    // Attendance % calculation: get all logs for the current month up to the selected date
    const monthStart = new Date(date);
    monthStart.setDate(1);
    // Get all holidays in the month up to the selected date
    const monthHolidays = await Holiday.findAll({
      where: { date: { [Op.between]: [monthStart.toISOString().split('T')[0], date] } }
    });
    const holidayDatesInMonth = monthHolidays.map(h => typeof h.date === 'string' ? h.date : h.date.toISOString().split('T')[0]);
    
    // Get all device logs for the month up to the selected date
    const monthDeviceLogs = await Devicelogs.findAll({
      where: {
        UserId: { [Op.in]: sinNumbers },
        LogDate: { [Op.gte]: new Date(`${monthStart.toISOString().split('T')[0]}T00:00:00`), [Op.lte]: new Date(`${date}T23:59:59`) }
      }
    });

    // Get all approved leaves for the month up to the selected date
    const monthDateLeaves = await Leave.findAll({
        where: {
            principal_approval: 'approved',
            sin_number: { [Op.in]: sinNumbers },
            [Op.or]: [
                { // OD and Leave types that are active within the month up to the specific date
                    request_type: { [Op.in]: ['od', 'leave'] },
                    startDate: { [Op.lte]: date }, 
                    endDate: { [Op.gte]: monthStart.toISOString().split('T')[0] } 
                },
                { // Permission type with startDate within the month up to the specific date
                    request_type: 'permission',
                    startDate: { [Op.between]: [monthStart.toISOString().split('T')[0], date] }
                }
            ]
        }
    });

    // Number of working days in the month up to the selected date
    let workingDaysInMonth = 0;
    for (let d = new Date(monthStart); d <= new Date(date); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (!holidayDatesInMonth.includes(dateStr)) workingDaysInMonth++;
    }

    const data = staff.map(s => {
      let statusVal = 'absent';
      if (isSpecificDateHoliday) {
        statusVal = 'holiday';
      } else {
        const staffDateLogs = dateLogs.filter(l => l.UserId === s.sin_number);
        
        const staffPermissionForDate = dateLeaves.find(l => l.sin_number === s.sin_number && l.request_type === 'permission');
        const staffOdForDate = dateLeaves.find(l => l.sin_number === s.sin_number && l.request_type === 'od');
        
        if (staffDateLogs.length > 0) {
          statusVal = 'present';
        } else if (staffPermissionForDate) { // Prioritize permission
          statusVal = 'permission';
        } else if (staffOdForDate) { // Then OD
          statusVal = 'od';
        } // Default is 'absent' if none of the above and not holiday
      }
      
      // Attendance % calculation for the month
      let presentDays = 0, odDays = 0, permissionDays = 0;
      for (let d = new Date(monthStart); d <= new Date(date); d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (holidayDatesInMonth.includes(dateStr)) continue;
        
        const dayDeviceLogs = monthDeviceLogs.filter(l => l.UserId === s.sin_number && (typeof l.LogDate === 'string' ? l.LogDate.slice(0, 10) : l.LogDate.toISOString().split('T')[0]) === dateStr);
        
        const permissionLeaveForDay = monthDateLeaves.find(l => 
            l.sin_number === s.sin_number && 
            l.request_type === 'permission' && 
            (l.startDate.toISOString ? l.startDate.toISOString().split('T')[0] : String(l.startDate).split(' ')[0]) === dateStr
        );

        const odLeaveForDay = monthDateLeaves.find(l => 
            l.sin_number === s.sin_number && 
            l.request_type === 'od' && 
            new Date(l.startDate) <= d && new Date(l.endDate) >= d
        );

        if (dayDeviceLogs.length > 0) {
          presentDays++;
        } else if (permissionLeaveForDay) { // Prioritize permission
          permissionDays++;
        } else if (odLeaveForDay) { // Then OD
          odDays++;
        }
      }
      const attendancePercentage = workingDaysInMonth > 0 ? Math.round(((presentDays + odDays + permissionDays) / workingDaysInMonth) * 100) : 0;
      return {
        sin_number: s.sin_number,
        name: s.name,
        department: s.department,
        status: statusVal,
        attendancePercentage
      };
    });
    // Filter by status if provided
    const filtered = status ? data.filter(d => d.status === status) : data;
    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error fetching staff table:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff table', error: error.message });
  }
});

// Get total staff count
router.get('/total-staff', async (req, res) => {
  try {
    const { college } = req.query;
    if (!college) {
      return res.status(400).json({ success: false, message: 'College is required' });
    }
    const count = await User.count({
      where: {
        role: { [Op.or]: ['staff', 'mentor', 'class_advisor'] },
        college
      }
    });
    res.json({ success: true, total: count });
  } catch (error) {
    console.error('Error fetching total staff count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch total staff count', error: error.message });
  }
});

module.exports = router; 