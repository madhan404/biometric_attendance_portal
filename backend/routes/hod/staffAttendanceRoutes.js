const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const User = require("../../models/User");
const Holiday = require("../../models/holidays");
const Devicelogs = require("../../models/Devicelog");
const { format } = require('date-fns');
const Leave = require("../../models/Leave");
const { Sequelize } = require("sequelize");

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
async function getStaffAttendanceStats({ date, department }) {
  // Get all staff for the department
  const staff = await User.findAll({
    where: {
      role: 'staff',
      department
    }
  });
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

  // Get all HOD approved leaves for the date
  // Fetches OD, Leave, and Permission types. Permission is only relevant if its startDate matches the queried 'date'.
  const leaves = await Leave.findAll({
    where: {
      hod_approval: 'approved', 
      sin_number: { [Op.in]: sinNumbers },
      // For OD/Leave, the date must be within their range.
      // For Permission, its startDate must be the date.
      [Op.or]: [
        { // OD and Leave
          request_type: { [Op.in]: ['od', 'leave'] },
          startDate: { [Op.lte]: date },
          endDate: { [Op.gte]: date }
        },
        { // Permission
          request_type: 'permission',
          // Reverting to Sequelize.fn for proper date comparison on DATETIME columns
          [Op.and]: Sequelize.where(Sequelize.fn('date', Sequelize.col('startDate')), date)
        }
      ]
    }
  });

  // Debugging logs
  // console.log(`[staffAttendanceRoutes] For date: ${date}, department: ${department}`);
  // console.log(`[staffAttendanceRoutes] Fetched ${leaves.length} total leave records.`);
  const permissionLeavesFetched = leaves.filter(l => l.request_type === 'permission');
  // console.log(`[staffAttendanceRoutes] Found ${permissionLeavesFetched.length} 'permission' type leaves in fetched records:`, JSON.stringify(permissionLeavesFetched, null, 2));

  // Calculate stats
  const stats = {
    present: 0,
    absent: 0,
    od: 0,
    permission: 0, 
    holiday: 0, // Initial holiday count
    total: staff.length
  };

  if (isHoliday) {
    stats.holiday = staff.length;
  } else {
    staff.forEach(staffMember => {
      const dayLogs = logs.filter(l => 
        l.UserId === staffMember.sin_number && 
        (typeof l.LogDate === 'string' ? l.LogDate.slice(0, 10) : l.LogDate.toISOString().split('T')[0]) === date
      );
      
      // Explicitly find if there's a permission leave for this staff member for the date
      const permissionLeaveForStaff = leaves.find(l => 
        l.sin_number === staffMember.sin_number && 
        l.request_type === 'permission'
      );

      // Explicitly find if there's an OD leave for this staff member for the date
      const odLeaveForStaff = leaves.find(l => 
        l.sin_number === staffMember.sin_number && 
        l.request_type === 'od'
      );
      
      if (dayLogs.length > 0) {
        stats.present++;
      } else if (permissionLeaveForStaff) { // Check for permission first
        stats.permission++;
      } else if (odLeaveForStaff) { // Then check for OD
        stats.od++;
      } else {
        // If not present, not Permission, not OD, and not a holiday, then absent.
        // This also covers generic 'leave' types if no specific leave record was found above.
        stats.absent++;
      }
    });
  }

  // console.log(`[staffAttendanceRoutes] Calculated Stats for ${date}, ${department}:`, JSON.stringify(stats, null, 2));
  return stats;
}

// Main logic for staff attendance stats (date range)
async function getStaffAttendanceStatsRange({ startDate, endDate, department }) {
  // Get all staff for the department
  const staff = await User.findAll({
    where: {
      role: 'staff',
      department
    }
  });
  const sinNumbers = staff.map(s => s.sin_number);

  // Get all holidays for the date range
  const holidays = await Holiday.findAll({
    where: { date: { [Op.between]: [startDate, endDate] } }
  });
  const holidayDates = holidays.map(h => 
    typeof h.date === 'string' ? h.date : h.date.toISOString().split('T')[0]
  );

  // Get all device logs for these staff
  const logs = await Devicelogs.findAll({
    where: {
      UserId: { [Op.in]: sinNumbers },
      LogDate: { [Op.gte]: new Date(`${startDate}T00:00:00`), [Op.lte]: new Date(`${endDate}T23:59:59`) }
    }
  });

  // Get all HOD approved leaves for the date range for these staff
  const leaves = await Leave.findAll({
    where: {
      hod_approval: 'approved',
      sin_number: { [Op.in]: sinNumbers },
      [Op.or]: [
        { // OD and Leave
          request_type: { [Op.in]: ['od', 'leave'] },
          startDate: { [Op.lte]: endDate },
          endDate: { [Op.gte]: startDate }
        },
        { // Permission - its startDate must be within the queried range
          request_type: 'permission',
          startDate: { [Op.between]: [startDate, endDate] }
        }
      ]
    }
  });

  // Calculate stats
  const stats = {
    present: 0,
    absent: 0,
    od: 0,
    permission: 0, // Added permission
    holiday: 0,
    total: staff.length // This is total staff, not total attendance entries
  };

  staff.forEach(staffMember => {
    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (holidayDates.includes(dateStr)) {
        stats.holiday++; // Each holiday instance per staff member is counted
        continue;
      }

      const dayLogs = logs.filter(l => 
        l.UserId === staffMember.sin_number && 
        (typeof l.LogDate === 'string' ? l.LogDate.slice(0, 10) : l.LogDate.toISOString().split('T')[0]) === dateStr
      );

      const staffLeaveForDay = leaves.find(l => 
        l.sin_number === staffMember.sin_number &&
        ((l.request_type === 'od' && new Date(l.startDate) <= d && new Date(l.endDate) >= d) ||
         (l.request_type === 'leave' && new Date(l.startDate) <= d && new Date(l.endDate) >= d) ||
         (l.request_type === 'permission' && (l.startDate.toISOString ? l.startDate.toISOString().split('T')[0] : String(l.startDate).split(' ')[0]) === dateStr))
      );

      if (dayLogs.length > 0) {
        stats.present++;
      } else if (staffLeaveForDay && staffLeaveForDay.request_type === 'od') {
        stats.od++;
      } else if (staffLeaveForDay && staffLeaveForDay.request_type === 'permission') {
        stats.permission++;
      } else {
        // Includes generic 'leave' types if not OD/Permission, or no leave and no logs
        stats.absent++;
      }
    }
  });

  return stats;
}

// Daily attendance endpoint
router.get('/staff-daily-attendance', async (req, res) => {
  try {
    const { date, department } = req.query;
    if (!date || !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: date and department are required' 
      });
    }
    const result = await getStaffAttendanceStats({ date, department });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching staff daily attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch staff daily attendance', 
      error: error.message 
    });
  }
});

// Weekly attendance endpoint
router.get('/staff-weekly-attendance', async (req, res) => {
  try {
    const { month, weekNumber, department } = req.query;
    if (!month || !weekNumber || !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: month, weekNumber, and department are required' 
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
    const result = await getStaffAttendanceStatsRange({ startDate, endDate, department });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching staff weekly attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch staff weekly attendance', 
      error: error.message 
    });
  }
});

// Monthly attendance endpoint
router.get('/staff-monthly-attendance', async (req, res) => {
  try {
    const { year, month, department } = req.query;
    if (!year || !month || !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: year, month, and department are required' 
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
    const result = await getStaffAttendanceStatsRange({ startDate, endDate, department });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching staff monthly attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch staff monthly attendance', 
      error: error.message 
    });
  }
});

// Staff table endpoint
router.get('/staff-table', async (req, res) => {
  try {
    const { department, date, status, search } = req.query;
    if (!department || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department and date are required' 
      });
    }

    const staffWhere = {
      role: 'staff',
      department,
      ...(search ? { 
        [Op.or]: [
          { sin_number: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } }
        ] 
      } : {})
    };

    const staff = await User.findAll({ where: staffWhere });
    const sinNumbers = staff.map(s => s.sin_number);

    // Check if the specific date is a holiday
    const specificDateIsHoliday = await Holiday.count({ where: { date } }) > 0;

    // Get device logs for the specific date
    const dateDeviceLogs = await Devicelogs.findAll({
      where: {
        UserId: { [Op.in]: sinNumbers },
        LogDate: { 
          [Op.gte]: new Date(`${date}T00:00:00`), 
          [Op.lte]: new Date(`${date}T23:59:59`) 
        }
      }
    });

    // Get HOD approved leaves (OD, Leave, Permission) for the specific date
    const dateLeaves = await Leave.findAll({
      where: {
        hod_approval: 'approved',
        sin_number: { [Op.in]: sinNumbers },
        [Op.or]: [
          { // OD and Leave
            request_type: { [Op.in]: ['od', 'leave'] },
            startDate: { [Op.lte]: date },
            endDate: { [Op.gte]: date }
          },
          { // Permission
            request_type: 'permission',
            [Op.and]: Sequelize.where(Sequelize.fn('date', Sequelize.col('startDate')), date)
          }
        ]
      }
    });

    // ---- Attendance % calculation setup ----
    const monthStart = new Date(date);
    monthStart.setDate(1);
    const monthStartDateString = monthStart.toISOString().split('T')[0];

    // Get all holidays in the month up to the selected date
    const monthHolidays = await Holiday.findAll({
      where: { 
        date: { 
          [Op.between]: [monthStartDateString, date] 
        } 
      }
    });
    const holidayDatesInMonth = monthHolidays.map(h => 
      typeof h.date === 'string' ? h.date : h.date.toISOString().split('T')[0]
    );

    // Get all device logs for the month up to the selected date
    const monthDeviceLogs = await Devicelogs.findAll({
      where: {
        UserId: { [Op.in]: sinNumbers },
        LogDate: { 
          [Op.gte]: new Date(`${monthStartDateString}T00:00:00`), 
          [Op.lte]: new Date(`${date}T23:59:59`) 
        }
      }
    });

    // Get all HOD approved leaves for the month up to the selected date
    const monthLeaves = await Leave.findAll({
      where: {
        hod_approval: 'approved',
        sin_number: { [Op.in]: sinNumbers },
        [Op.or]: [
          { // OD and Leave active within the month range
            request_type: { [Op.in]: ['od', 'leave'] },
            startDate: { [Op.lte]: date }, // Starts on or before the specific date
            endDate: { [Op.gte]: monthStartDateString } // Ends on or after month start
          },
          { // Permission with startDate within the month range
            request_type: 'permission',
            startDate: { [Op.between]: [monthStartDateString, date] }
          }
        ]
      }
    });

    // Number of working days in the month up to the selected date
    const workingDaysInMonth = getWorkingDays(
      monthStartDateString,
      date,
      holidayDatesInMonth
    );

    const data = staff.map(s => {
      let statusVal = 'absent'; // Default status
      if (specificDateIsHoliday) {
        statusVal = 'holiday';
      } else {
        const staffLogsForDate = dateDeviceLogs.filter(l => l.UserId === s.sin_number);
        const staffLeaveForDate = dateLeaves.find(l => l.sin_number === s.sin_number);
        
        if (staffLogsForDate.length > 0) {
          statusVal = 'present';
        } else if (staffLeaveForDate && staffLeaveForDate.request_type === 'od') {
          statusVal = 'od';
        } else if (staffLeaveForDate && staffLeaveForDate.request_type === 'permission') {
          statusVal = 'permission';
        } else {
          statusVal = 'absent'; // Covers generic 'leave' or no log/no applicable leave
        }
      }

      // Attendance % calculation
      let presentDays = 0, odDays = 0, permissionDays = 0;
      for (let d = new Date(monthStart); d <= new Date(date); d.setDate(d.getDate() + 1)) {
        const dateStrLoop = d.toISOString().split('T')[0];
        if (holidayDatesInMonth.includes(dateStrLoop)) continue;

        const dayLogs = monthDeviceLogs.filter(l => 
          l.UserId === s.sin_number && 
          (typeof l.LogDate === 'string' ? l.LogDate.slice(0, 10) : l.LogDate.toISOString().split('T')[0]) === dateStrLoop
        );

        const dayLeave = monthLeaves.find(l => 
          l.sin_number === s.sin_number &&
          ((l.request_type === 'od' && new Date(l.startDate) <= d && new Date(l.endDate) >= d) ||
           (l.request_type === 'leave' && new Date(l.startDate) <= d && new Date(l.endDate) >= d) || // Assuming generic leave also counts towards positive if not explicitly absent
           (l.request_type === 'permission' && l.startDate === dateStrLoop))
        );

        if (dayLogs.length > 0) {
          presentDays++;
        } else if (dayLeave && dayLeave.request_type === 'od') {
          odDays++;
        } else if (dayLeave && dayLeave.request_type === 'permission') {
          permissionDays++;
        } else if (dayLeave && dayLeave.request_type === 'leave') {
          // If generic leave should count for attendance percentage, add to presentDays or a similar category.
          // For now, assuming it doesn't if not OD/Permission, thus contributing to lower percentage if staff is absent.
        }
      }

      const attendancePercentage = workingDaysInMonth > 0 
        ? Math.round(((presentDays + odDays + permissionDays) / workingDaysInMonth) * 100) 
        : 0;

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
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch staff table', 
      error: error.message 
    });
  }
});

// Get total staff count
router.get('/total-staff', async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department is required' 
      });
    }

    const count = await User.count({
      where: {
        role: 'staff',
        department
      }
    });

    res.json({ success: true, total: count });
  } catch (error) {
    console.error('Error fetching total staff count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch total staff count', 
      error: error.message 
    });
  }
});

module.exports = router; 