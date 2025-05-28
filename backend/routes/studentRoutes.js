const express = require("express");
const router = express.Router();
const { Sequelize } = require("sequelize"); // Import Sequelize for QueryTypes
const sequelize = require("../config/db"); // Import the Sequelize instance
const { subDays, format } = require("date-fns");
const { Op } = require("sequelize");
const SystemConfig = require("../models/system_config");
const SemesterDetails = require("../models/semester_details");
const Holiday = require("../models/holidays");
const Leave = require("../models/Leave");
const Devicelogs = require("../models/Devicelog");


router.get('/daily-attendance', async (req, res) => {
  try {
    const { startDate, endDate, UserId } = req.query;

    // Validate required parameters
    if (!startDate || !endDate || !UserId) {
    return res.status(400).json({
        success: false, 
        message: 'Missing required parameters: startDate, endDate, and UserId are required' 
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return res.status(400).json({
        success: false, 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Get system configuration
    const config = await SystemConfig.findOne();
    if (!config) {
      return res.status(500).json({ 
        success: false, 
        message: 'System configuration not found' 
      });
    }

    // Parse time configurations
    const gracePeriod = config.grace_period; // "00:20:00"
    const autoLockout = config.auto_lockout; // "09:00:00"
    const lateThreshold = config.late_mark_threshold; // "09:00:00"

    // Convert grace period to minutes
    const graceMinutes = parseInt(gracePeriod.split(':')[1]);
    
    // Convert auto lockout to minutes
    const [lockoutHours, lockoutMinutes] = autoLockout.split(':');
    const autoLockoutMinutes = parseInt(lockoutHours) * 60 + parseInt(lockoutMinutes);

    // Generate array of dates between start and end date
    const dates = [];
    let currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    while (currentDate <= endDateObj) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

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
        sin_number: UserId,
        request_type: { [Op.in]: ['od', 'internship'] },
        principal_approval: 'approved',
        [Op.or]: [
          {
            startDate: { [Op.lte]: endDate },
            endDate: { [Op.gte]: startDate }
          }
        ]
      }
    });

    // Get all device logs for the date range
    const deviceLogs = await Devicelogs.findAll({
      where: {
        UserId: UserId,
        LogDate: {
          [Op.between]: [
            new Date(`${startDate}T00:00:00`),
            new Date(`${endDate}T23:59:59`)
          ]
        }
      },
      order: [['LogDate', 'ASC']]
    });

    // Process each date
    const attendanceData = await Promise.all(dates.map(async (date) => {
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if it's a holiday
      const isHoliday = holidays.some(h => {
        const holidayDate = new Date(h.date).toISOString().split('T')[0];
        return holidayDate === dateStr;
      });

      if (isHoliday) {
        return {
          date: dateStr,
          status: "Holiday",
          inTime: null,
          outTime: null,
          workingHours: "0",
          isWorkingDay: false,
          lateArrival: false,
          earlyDeparture: false,
          odStatus: null,
          internshipStatus: null
        };
      }

      // Check for approved leave
      const leave = leaves.find(l => {
        try {
          const leaveStart = new Date(l.startDate).toISOString().split('T')[0];
          const leaveEnd = new Date(l.endDate).toISOString().split('T')[0];
          return dateStr >= leaveStart && dateStr <= leaveEnd;
        } catch (error) {
          console.error('Error processing leave dates:', error);
          return false;
        }
      });

      if (leave) {
        const isOD = leave.request_type === 'od';
        const isInternship = leave.request_type === 'internship';
        
        return {
          date: dateStr,
          status: isOD ? 'OD' : 'Internship',
          inTime: (isOD || isInternship) ? '09:00:00' : null,
          outTime: (isOD || isInternship) ? '16:30:00' : null,
          workingHours: (isOD || isInternship) ? '7.50' : '0',
          isWorkingDay: true,
          lateArrival: false,
          earlyDeparture: false,
          odStatus: isOD ? 'approved' : null,
          internshipStatus: isInternship ? 'approved' : null
        };
      }

      // Get device logs for the date
      const dateLogs = deviceLogs.filter(log => {
        const logDate = new Date(log.LogDate).toISOString().split('T')[0];
        return logDate === dateStr;
      });

      if (dateLogs.length === 0) {
        return {
          date: dateStr,
          status: "Absent",
          inTime: null,
          outTime: null,
          workingHours: "0",
          isWorkingDay: true,
          lateArrival: false,
          earlyDeparture: false,
          odStatus: null,
          internshipStatus: null
        };
      }

      // Get first check-in and last check-out
      const checkIn = dateLogs.find(log => log.C1 === 'in');
      const checkOut = [...dateLogs].reverse().find(log => log.C1 === 'out');

      if (!checkIn) {
        return {
          date: dateStr,
          status: "Absent",
          inTime: null,
          outTime: null,
          workingHours: "0",
          isWorkingDay: true,
          lateArrival: false,
          earlyDeparture: false,
          odStatus: null,
          internshipStatus: null
        };
      }

      // Calculate attendance status
      const checkInTime = new Date(checkIn.LogDate);
      const baseTime = new Date(`${dateStr}T09:00:00`);
      
      // Add grace period (10 minutes)
      const graceTime = new Date(baseTime);
      graceTime.setMinutes(graceTime.getMinutes() + graceMinutes);
      
      // Add auto lockout (1 hour)
      const lockoutTime = new Date(graceTime);
      lockoutTime.setMinutes(lockoutTime.getMinutes() + autoLockoutMinutes);

      let status = "Present";
      let lateArrival = false;
      let earlyDeparture = false;

      // Check for late arrival or absence
      if (checkInTime > graceTime) {
        if (checkInTime > lockoutTime) {
          status = "Absent";
        } else {
          status = "Late";
          lateArrival = true;
        }
      }

      // Calculate working hours if check-out exists
      let workingHours = "0";
      if (checkOut) {
        const checkOutTime = new Date(checkOut.LogDate);
        const workingMinutes = (checkOutTime - checkInTime) / (1000 * 60);
        workingHours = (workingMinutes / 60).toFixed(2);

        // Check for early departure (before 16:30)
        const minDepartureTime = new Date(`${dateStr}T16:30:00`);
        if (checkOutTime < minDepartureTime) {
          earlyDeparture = true;
        }
      } else {
        // No check-out means absent
        status = "Absent";
      }

      return {
        date: dateStr,
        status,
        inTime: checkIn.LogDate.split(' ')[1],
        outTime: checkOut ? checkOut.LogDate.split(' ')[1] : null,
        workingHours,
        isWorkingDay: true,
        lateArrival,
        earlyDeparture,
        odStatus: null,
        internshipStatus: null
      };
    }));

    res.json({
      success: true,
      data: attendanceData
    });
  } catch (error) {
    console.error('Error fetching daily attendance:', error);
    res.status(500).json({
      success: false, 
      message: 'Failed to fetch daily attendance',
      error: error.message 
    });
  }
});

// Get weekly attendance
router.get('/weekly-attendance', async (req, res) => {
    try {
        const { year, month, week, UserId } = req.query;

        if (!year || !month || !week || !UserId) {
    return res.status(400).json({
                success: false,
                message: 'Year, month, week, and UserId are required'
            });
        }

        // Get system configuration
        const config = await SystemConfig.findOne({
            order: [['id', 'DESC']]
        });
        const { grace_period, auto_lockout } = config.dataValues;

        // Parse grace period and auto lockout
        const graceMinutes = parseInt(grace_period.split(':')[1]);
        const autoLockoutMinutes = parseInt(auto_lockout.split(':')[0]) * 60 + parseInt(auto_lockout.split(':')[1]);

        // Calculate start and end dates for the week
        const startDate = new Date(year, month - 1, (week - 1) * 7 + 1);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        // Get all holidays for the week
        const holidays = await Holiday.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // Get all approved leaves for the week
        const leaves = await Leave.findAll({
            where: {
                sin_number: UserId,
                startDate: {
                    [Op.lte]: endDate
                },
                endDate: {
                    [Op.gte]: startDate
                },
                principal_approval: 'approved'
            }
        });

        // Get all device logs for the week
        const deviceLogs = await Devicelogs.findAll({
            where: {
                UserId: UserId,
                LogDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['LogDate', 'ASC']]
        });

        // Initialize statistics
        const statistics = {
            totalDays: 7,
            workingDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateArrivalDays: 0,
            earlyDepartureDays: 0,
            odDays: 0,
            internshipDays: 0,
            holidayDays: 0,
            totalWorkingHours: 0
        };

        // Process each day in the week
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            // Check if it's a holiday
            const isHoliday = holidays.some(h => {
                const holidayDate = new Date(h.date).toISOString().split('T')[0];
                return holidayDate === dateStr;
            });
            if (isHoliday) {
                statistics.holidayDays++;
                continue;
            }

            // Check for OD or internship
            const leave = leaves.find(l => {
                const leaveStart = new Date(l.startDate).toISOString().split('T')[0];
                const leaveEnd = new Date(l.endDate).toISOString().split('T')[0];
                return dateStr >= leaveStart && dateStr <= leaveEnd;
            });

            if (leave) {
                if (leave.request_type === 'od') {
                    statistics.odDays++;
                    statistics.workingDays++;
                    statistics.presentDays++; // OD days count as present
                    // Fixed working hours for OD (9:00 AM to 4:30 PM)
                    statistics.totalWorkingHours += 7.5; // 7.5 hours = 9:00 AM to 4:30 PM
                } else if (leave.request_type === 'internship') {
                    statistics.internshipDays++;
                    statistics.workingDays++;
                    statistics.presentDays++; // Internship days count as present
                    // Fixed working hours for internship (9:00 AM to 4:30 PM)
                    statistics.totalWorkingHours += 7.5; // 7.5 hours = 9:00 AM to 4:30 PM
                }
                continue;
            }

            // It's a working day
            statistics.workingDays++;

            // Get device logs for the date
            const dateLogs = deviceLogs.filter(log => {
                const logDate = new Date(log.LogDate).toISOString().split('T')[0];
                return logDate === dateStr;
            });

            if (dateLogs.length === 0) {
                statistics.absentDays++;
                continue;
            }

            // Get first check-in and last check-out
            const checkIn = dateLogs.find(log => log.C1 === 'in');
            const checkOut = [...dateLogs].reverse().find(log => log.C1 === 'out');

            if (!checkIn || !checkOut) {
                statistics.absentDays++;
                continue;
            }

            // Calculate attendance status
            const checkInTime = new Date(checkIn.LogDate);
            const baseTime = new Date(`${dateStr}T09:00:00`);
            
            // Add grace period
            const graceTime = new Date(baseTime);
            graceTime.setMinutes(graceTime.getMinutes() + graceMinutes);
            
            // Add auto lockout
            const lockoutTime = new Date(graceTime);
            lockoutTime.setMinutes(lockoutTime.getMinutes() + autoLockoutMinutes);

            // Check for late arrival or absence
            if (checkInTime > graceTime) {
                if (checkInTime > lockoutTime) {
                    statistics.absentDays++;
                } else {
                    statistics.presentDays++;
                    statistics.lateArrivalDays++;
                }
            } else {
                statistics.presentDays++;
            }

            // Calculate working hours
            const checkOutTime = new Date(checkOut.LogDate);
            const workingMinutes = (checkOutTime - checkInTime) / (1000 * 60);
            statistics.totalWorkingHours += workingMinutes / 60;

            // Check for early departure
            const minDepartureTime = new Date(`${dateStr}T16:30:00`);
            if (checkOutTime < minDepartureTime) {
                statistics.earlyDepartureDays++;
            }
        }

        // Calculate average working hours
        statistics.averageWorkingHours = (statistics.totalWorkingHours / statistics.workingDays).toFixed(2);

        res.json({
            success: true,
            data: {
                week: parseInt(week),
                month: parseInt(month),
                year: parseInt(year),
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                statistics
            }
        });
    } catch (error) {
        console.error('Error in weekly attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching weekly attendance',
            error: error.message
        });
      }
    });
    
// Get monthly attendance for a year
router.get('/monthly-attendance', async (req, res) => {
    try {
        const { year, UserId } = req.query;

        if (!year || !UserId) {
        return res.status(400).json({
                success: false,
                message: 'Year and UserId are required'
            });
        }

        // Get system configuration
        const config = await SystemConfig.findOne({
            order: [['id', 'DESC']]
        });
        const { grace_period, auto_lockout } = config.dataValues;

        // Parse grace period and auto lockout
        const graceMinutes = parseInt(grace_period.split(':')[1]);
        const autoLockoutMinutes = parseInt(auto_lockout.split(':')[0]) * 60 + parseInt(auto_lockout.split(':')[1]);

        // Initialize overall statistics
        const overallStats = {
            totalWorkingDays: 0,
            totalPresentDays: 0,
            totalAbsentDays: 0,
            totalODDays: 0,
            totalInternshipDays: 0
        };

        // Initialize monthly data array
        const monthlyData = [];
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Process each month
        for (let month = 1; month <= 12; month++) {
            // Calculate start and end dates for the month
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Last day of the month

            // Get all holidays for the month
            const holidays = await Holiday.findAll({
                where: {
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            });

            // Get all approved leaves for the month
            const leaves = await Leave.findAll({
                where: {
                    sin_number: UserId,
                    startDate: {
                        [Op.lte]: endDate
                    },
                    endDate: {
                        [Op.gte]: startDate
                    },
                    principal_approval: 'approved'
                }
            });

            // Get all device logs for the month
            const deviceLogs = await Devicelogs.findAll({
                where: {
                    UserId: UserId,
                    LogDate: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                order: [['LogDate', 'ASC']]
            });

            // Initialize monthly statistics
            const monthStats = {
                totalDays: endDate.getDate(),
                workingDays: 0,
                presentDays: 0,
                absentDays: 0,
                odDays: 0,
                internshipDays: 0,
                holidayDays: 0,
                totalWorkingHours: 0
            };

            // Process each day in the month
            for (let i = 1; i <= endDate.getDate(); i++) {
                const currentDate = new Date(year, month - 1, i);
                const dateStr = currentDate.toISOString().split('T')[0];

                // Check if it's a holiday
                const isHoliday = holidays.some(h => {
                    const holidayDate = new Date(h.date).toISOString().split('T')[0];
                    return holidayDate === dateStr;
                });
                if (isHoliday) {
                    monthStats.holidayDays++;
                    continue;
                }

                // Check for OD or internship
                const leave = leaves.find(l => {
                    const leaveStart = new Date(l.startDate).toISOString().split('T')[0];
                    const leaveEnd = new Date(l.endDate).toISOString().split('T')[0];
                    return dateStr >= leaveStart && dateStr <= leaveEnd;
                });

                if (leave) {
                    if (leave.request_type === 'od') {
                        monthStats.odDays++;
                        monthStats.workingDays++;
                        monthStats.presentDays++; // OD days count as present
                        overallStats.totalODDays++;
                        overallStats.totalPresentDays++;
                    } else if (leave.request_type === 'internship') {
                        monthStats.internshipDays++;
                        monthStats.workingDays++;
                        monthStats.presentDays++; // Internship days count as present
                        overallStats.totalInternshipDays++;
                        overallStats.totalPresentDays++;
                    }
                    continue;
                }

                // It's a working day
                monthStats.workingDays++;

                // Get device logs for the date
                const dateLogs = deviceLogs.filter(log => {
                    const logDate = new Date(log.LogDate).toISOString().split('T')[0];
                    return logDate === dateStr;
                });

                if (dateLogs.length === 0) {
                    monthStats.absentDays++;
                    overallStats.totalAbsentDays++;
                    continue;
                }

                // Get first check-in and last check-out
                const checkIn = dateLogs.find(log => log.C1 === 'in');
                const checkOut = [...dateLogs].reverse().find(log => log.C1 === 'out');

                if (!checkIn || !checkOut) {
                    monthStats.absentDays++;
                    overallStats.totalAbsentDays++;
                    continue;
                }

                // Calculate attendance status
                const checkInTime = new Date(checkIn.LogDate);
                const baseTime = new Date(`${dateStr}T09:00:00`);
                
                // Add grace period
                const graceTime = new Date(baseTime);
                graceTime.setMinutes(graceTime.getMinutes() + graceMinutes);
                
                // Add auto lockout
                const lockoutTime = new Date(graceTime);
                lockoutTime.setMinutes(lockoutTime.getMinutes() + autoLockoutMinutes);

                // Check for late arrival or absence
                if (checkInTime > graceTime) {
                    if (checkInTime > lockoutTime) {
                        monthStats.absentDays++;
                        overallStats.totalAbsentDays++;
                    } else {
                        monthStats.presentDays++;
                        overallStats.totalPresentDays++;
                    }
                } else {
                    monthStats.presentDays++;
                    overallStats.totalPresentDays++;
                }

                // Calculate working hours
                const checkOutTime = new Date(checkOut.LogDate);
                const workingMinutes = (checkOutTime - checkInTime) / (1000 * 60);
                monthStats.totalWorkingHours += workingMinutes / 60;
            }

            // Calculate monthly percentage
            const monthlyPercentage = monthStats.workingDays > 0 
                ? ((monthStats.presentDays + monthStats.odDays + monthStats.internshipDays) / monthStats.workingDays) * 100 
                : 0;

            // Update overall statistics
            overallStats.totalWorkingDays += monthStats.workingDays;

            // Add month data to array
            monthlyData.push({
                month,
                monthName: monthNames[month - 1],
                statistics: {
                    ...monthStats,
                    percentage: monthlyPercentage.toFixed(2)
                }
            });
        }

        // Calculate overall percentage
        const overallPercentage = overallStats.totalWorkingDays > 0
            ? ((overallStats.totalPresentDays + overallStats.totalODDays + overallStats.totalInternshipDays) / overallStats.totalWorkingDays) * 100
            : 0;

        res.json({
            success: true,
            data: {
                year: parseInt(year),
                overallStatistics: {
                    ...overallStats,
                    overallPercentage: overallPercentage.toFixed(2)
                },
                monthlyData
            }
        });
    } catch (error) {
        console.error('Error in monthly attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly attendance',
            error: error.message
        });
    }
});

// Get overall attendance statistics
router.get('/overall-attendance', async (req, res) => {
    try {
        const { UserId } = req.query;

        if (!UserId) {
          return res.status(400).json({
                success: false,
                message: 'UserId is required'
            });
        }

        // Get current semester details
        const semester = await SemesterDetails.findOne({
            where: {
                semester_start_date: {
                    [Op.lte]: new Date()
                },
                semester_end_date: {
                    [Op.gte]: new Date()
                }
            }
        });

        if (!semester) {
          return res.status(404).json({
                success: false,
                message: 'No active semester found'
            });
        }

        // Get system configuration
        const config = await SystemConfig.findOne({
            order: [['id', 'DESC']]
        });
        const { grace_period, auto_lockout } = config.dataValues;

        // Parse grace period and auto lockout
        const graceMinutes = parseInt(grace_period.split(':')[1]);
        const autoLockoutMinutes = parseInt(auto_lockout.split(':')[0]) * 60 + parseInt(auto_lockout.split(':')[1]);

        // Get all holidays in the semester
        const holidays = await Holiday.findAll({
            where: {
                date: {
                    [Op.between]: [semester.semester_start_date, semester.semester_end_date]
                }
            }
        });

        // Get all approved leaves in the semester
        const leaves = await Leave.findAll({
            where: {
                sin_number: UserId,
                startDate: {
                    [Op.lte]: semester.semester_end_date
                },
                endDate: {
                    [Op.gte]: semester.semester_start_date
                },
                principal_approval: 'approved'
            }
        });

        // Get all device logs in the semester
        const deviceLogs = await Devicelogs.findAll({
            where: {
                UserId: UserId,
                LogDate: {
                    [Op.between]: [semester.semester_start_date, semester.semester_end_date]
                }
            },
            order: [['LogDate', 'ASC']]
        });

        // Initialize statistics
        const statistics = {
            totalWorkingDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateArrivalDays: 0,
            earlyDepartureDays: 0,
            odApproved: 0,
            internshipDays: 0
        };

        // Process each day from semester start to end date
        let date = new Date(semester.semester_start_date);
        const endDate = new Date(semester.semester_end_date);
        
        while (date <= endDate) {
            const dateStr = date.toISOString().split('T')[0];

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) {
                date.setDate(date.getDate() + 1);
                continue;
            }

            // Check if it's a holiday
            const isHoliday = holidays.some(h => {
                const holidayDate = new Date(h.date).toISOString().split('T')[0];
                return holidayDate === dateStr;
            });
            if (isHoliday) {
                date.setDate(date.getDate() + 1);
                continue;
            }

            // It's a working day
            statistics.totalWorkingDays++;

            // Check for OD or internship
            const leave = leaves.find(l => {
                const leaveStart = new Date(l.startDate).toISOString().split('T')[0];
                const leaveEnd = new Date(l.endDate).toISOString().split('T')[0];
                return dateStr >= leaveStart && dateStr <= leaveEnd;
            });

            if (leave) {
                if (leave.request_type === 'od') {
                    statistics.odApproved++;
                    statistics.presentDays++;
                } else if (leave.request_type === 'internship') {
                    statistics.internshipDays++;
                    statistics.presentDays++;
                }
                date.setDate(date.getDate() + 1);
                continue;
            }

            // Get device logs for the date
            const dateLogs = deviceLogs.filter(log => {
                const logDate = new Date(log.LogDate).toISOString().split('T')[0];
                return logDate === dateStr;
            });

            if (dateLogs.length === 0) {
                statistics.absentDays++;
                date.setDate(date.getDate() + 1);
                continue;
            }

            // Get first check-in and last check-out
            const checkIn = dateLogs.find(log => log.C1 === 'in');
            const checkOut = [...dateLogs].reverse().find(log => log.C1 === 'out');

            if (!checkIn || !checkOut) {
                statistics.absentDays++;
                date.setDate(date.getDate() + 1);
                continue;
            }

            // Calculate attendance status
            const checkInTime = new Date(checkIn.LogDate);
            const baseTime = new Date(`${dateStr}T09:00:00`);
            
            // Add grace period
            const graceTime = new Date(baseTime);
            graceTime.setMinutes(graceTime.getMinutes() + graceMinutes);
            
            // Add auto lockout
            const lockoutTime = new Date(graceTime);
            lockoutTime.setMinutes(lockoutTime.getMinutes() + autoLockoutMinutes);

            // Check for late arrival or absence
            if (checkInTime > graceTime) {
                if (checkInTime > lockoutTime) {
                    statistics.absentDays++;
                } else {
                    statistics.presentDays++;
                    statistics.lateArrivalDays++;
                }
            } else {
                statistics.presentDays++;
            }

            // Check for early departure
            const checkOutTime = new Date(checkOut.LogDate);
            const minDepartureTime = new Date(`${dateStr}T16:30:00`);
            if (checkOutTime < minDepartureTime) {
                statistics.earlyDepartureDays++;
            }

            date.setDate(date.getDate() + 1);
        }

        // Calculate overall percentage
        const overallPercentage = statistics.totalWorkingDays > 0 
            ? ((statistics.presentDays + statistics.odApproved + statistics.internshipDays) / statistics.totalWorkingDays) * 100 
            : 0;

        res.json({
            success: true,
            data: {
                semesterName: semester.semester_name,
                semesterStartDate: semester.semester_start_date,
                semesterEndDate: semester.semester_end_date,
                overallPercentage: overallPercentage.toFixed(2),
                totalWorkingDays: statistics.totalWorkingDays,
                presentDays: statistics.presentDays,
                absentDays: statistics.absentDays,
                lateArrivalDays: statistics.lateArrivalDays,
                earlyDepartureDays: statistics.earlyDepartureDays,
                odApproved: statistics.odApproved,
                internshipDays: statistics.internshipDays
            }
        });
    } catch (error) {
        console.error('Error in overall attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching overall attendance',
            error: error.message
        });
      }
    });

module.exports = router; 