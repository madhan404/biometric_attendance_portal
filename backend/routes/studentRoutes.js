// const express = require('express');
// const router = express.Router();
// const app = express();
// const {Op} =require('sequelize');
// const sequelize = require('sequelize');
// const User = require('../models/Devicelog');
// const { where } = require('../config/config');
// const { subDays, format } = require("date-fns");
// const sequelize = require("../config/db");


// app.post("/attendance-month", async (req, res) => {
//   const { UserId, report_type } = req.body;

//   // Get current date details
// //   const today = new Date();
// //   const month = today.getMonth() + 1; // Month is zero-based in JavaScript
// //   const year = today.getFullYear();

//   // Generate dynamic table name
//   const tableName = `devicelogs_8_2024`;
//   console.log("Table name:", tableName);

//   // Validate input
//   if (!UserId) {
//     return res.status(400).json({
//       status: 400,
//       error: "Missing required fields: UserId",
//     });
//   }


//   try {
//     // Fetch user data based on UserId
//     const user = await User.findAll({
//       where: { UserId },
//       attributes: ["LogDate","C1"],
//     });

//     // Ensure user exists
//     if (!user || user.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         error: "User not found",
//       });
//     }

//     // Calculate date range based on report_type
//     // let prevDate = today;
//     // if (report_type === "sDays") {
//     //   prevDate = subDays(today, 7);
//     // } else if (report_type === "monthly") {
//     //   prevDate = subDays(today, 30);
//     // } else {
//     //   return res.status(400).json({
//     //     status: 400,
//     //     error: "Invalid report_type. Allowed values: sDays, monthly",
//     //   });
//     // }

//     // (Optional) Logic to query the dynamic table can go here.

//     // Respond with success
//     res.status(200).json({
//       status: 200,
//       message: "Data fetched successfully",
//       data: {
//         user,
//         // date_range: { from: prevDate, to: today },
//       },
//     });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({
//       status: 500,
//       error: "Server error occurred while fetching attendance data.",
//     });
//   }
// });

// LAST EDUTED
// app.post("/attendance-month", async (req, res) => {
//   const { UserId, month, year } = req.body;

//   if (!UserId || !month || !year) {
//     return res.status(400).json({
//       status: 400,
//       error: "Missing required fields: UserId, month, year",
//     });
//   }

//   try {
//     const startDate = `${year}-${month}-01`;
//     const endDate = `${year}-${month}-31`;

//     const query = `
//       SELECT 
//         DATE(LogDate) AS AttendanceDate,
//         COUNT(CASE WHEN C1 = 'in' THEN 1 END) AS CheckIns,
//         COUNT(CASE WHEN C1 = 'out' THEN 1 END) AS CheckOuts,
//         CASE 
//           WHEN COUNT(CASE WHEN C1 = 'in' THEN 1 END) > 0 THEN 'Present'
//           ELSE 'Absent'
//         END AS AttendanceStatus,
//         SEC_TO_TIME(
//           SUM(
//             CASE 
//               WHEN C1 = 'out' THEN UNIX_TIMESTAMP(LogDate)
//               WHEN C1 = 'in' THEN -UNIX_TIMESTAMP(LogDate)
//               ELSE 0
//             END
//           )
//         ) AS HoursWorked
//       FROM 
//         devicelogs_8_2024
//       WHERE 
//         UserId = ?
//         AND DATE(LogDate) BETWEEN ? AND ?
//       GROUP BY 
//         DATE(LogDate)
//       ORDER BY 
//         AttendanceDate;
//     `;

//     const [results] = await db.query(query, [UserId, startDate, endDate]);

//     res.status(200).json({
//       status: 200,
//       data: results,
//     });
//   } catch (err) {
//     console.error("Error fetching monthly attendance:", err);
//     res.status(500).json({
//       status: 500,
//       error: "Server error occurred while fetching monthly attendance.",
//     });
//   }
// });


// app.post("/addendance-week", async (req, res) => {
//   const { UserId } = req.body;

//   // Generate dynamic table name (customize as needed)
//   const tableName = `devicelogs_8_2024`;
//   console.log("Table name:", tableName);

//   // Validate input
//   if (!UserId) {
//     return res.status(400).json({
//       status: 400,
//       error: "Missing required field: UserId",
//     });
//   }

//   try {
//     // Calculate the last 7 days excluding Sundays
//     const today = new Date();
//     const startDate = subDays(today, 7); // 7 days ago
//     const formattedStartDate = format(startDate, "yyyy-MM-dd");
//     const formattedToday = format(today, "yyyy-MM-dd");

//     // Fetch user data within the date range
//     const user = await User.findAll({
//       where: {
//         UserId,
//         LogDate: {
//           // Between start date and today
//           [Op.between]: [formattedStartDate, formattedToday],
//         },
//       },
//       attributes: ["LogDate", "C1"],
//     });

//     // Filter out Sundays
//     const filteredUserData = user.filter((entry) => {
//       const logDate = new Date(entry.LogDate);
//       const dayOfWeek = logDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
//       return dayOfWeek !== 0; // Exclude Sundays
//     });

//     // Ensure data exists
//     if (filteredUserData.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         error: "No data found for the last 7 days (excluding Sundays).",
//       });
//     }

//     // Respond with success
//     res.status(200).json({
//       status: 200,
//       message: "Data fetched successfully",
//       data: filteredUserData,
//     });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({
//       status: 500,
//       error: "Server error occurred while fetching attendance data.",
//     });
//   }
// });


// app.post("/attendance-week", async (req, res) => {
//   const { UserId } = req.body;

//   // Generate dynamic table name (customize as needed)
//   const tableName = `devicelogs_8_2024`;
//   console.log("Table name:", tableName);

//   // Validate input
//   if (!UserId) {
//     return res.status(400).json({
//       status: 400,
//       error: "Missing required field: UserId",
//     });
//   }

//   try {
//     // Define the start and end dates
//     const startDate = "2024-08-11"; // Start date
//     const endDate = "2024-08-18"; // End date

//     // Fetch user data within the specified date range
//     const user = await User.findAll({
//       where: {
//         UserId,
//         LogDate: {
//           // Between start date and end date
//           [Op.between]: [startDate, endDate],
//         },
//       },
//       attributes: ["LogDate", "C1"],
//     });

//     // Filter out Sundays
//     const filteredUserData = user.filter((entry) => {
//       const logDate = new Date(entry.LogDate);
//       const dayOfWeek = logDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
//       return dayOfWeek !== 0; // Exclude Sundays
//     });

//     // Ensure data exists
//     if (filteredUserData.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         error:
//           "No data found for the specified date range (excluding Sundays).",
//       });
//     }

//     // Respond with success
//     res.status(200).json({
//       status: 200,
//       message: "Data fetched successfully",
//       data: filteredUserData,
//     });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({
//       status: 500,
//       error: "Server error occurred while fetching attendance data.",
//     });
//   }
// });


// router.post("/attendance-week", async (req, res) => {
//   const { UserId, startDate, endDate } = req.body;

//   if (!UserId || !startDate || !endDate) {
//     return res.status(400).json({
//       status: 400,
//       error: "Missing required fields: UserId, startDate, endDate",
//     });
//   }

//   try {
//     const query = `
//       SELECT 
//         DATE(LogDate) AS AttendanceDate,
//         COUNT(CASE WHEN C1 = 'in' THEN 1 END) AS CheckIns,
//         COUNT(CASE WHEN C1 = 'out' THEN 1 END) AS CheckOuts,
//         CASE 
//           WHEN COUNT(CASE WHEN C1 = 'in' THEN 1 END) > 0 THEN 'Present'
//           ELSE 'Absent'
//         END AS AttendanceStatus,
//         SEC_TO_TIME(
//           SUM(
//             CASE 
//               WHEN C1 = 'out' THEN UNIX_TIMESTAMP(LogDate)
//               WHEN C1 = 'in' THEN -UNIX_TIMESTAMP(LogDate)
//               ELSE 0
//             END
//           )
//         ) AS HoursWorked
//       FROM 
//         devicelogs_8_2024
//       WHERE 
//         UserId = :UserId
//         AND DATE(LogDate) BETWEEN :startDate AND :endDate
//       GROUP BY 
//         DATE(LogDate)
//       ORDER BY 
//         AttendanceDate;
//     `;

//     const results = await sequelize.query(query, {
//       replacements: { UserId, startDate, endDate },
//       type: Sequelize.QueryTypes.SELECT,
//     });

//     if (results.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         error: "No attendance data found for the specified week.",
//       });
//     }

//     res.status(200).json({
//       status: 200,
//       data: results,
//     });
//   } catch (err) {
//     console.error("Error fetching weekly attendance:", err);
//     res.status(500).json({
//       status: 500,
//       error: "Server error occurred while fetching weekly attendance.",
//     });
//   }
// });
// module.exports = app;



const express = require("express");
const router = express.Router();
const { Sequelize } = require("sequelize"); // Import Sequelize for QueryTypes
const sequelize = require("../config/db"); // Import the Sequelize instance
const { subDays, format } = require("date-fns");

// Monthly Attendance API
// router.post("/attendance-month", async (req, res) => {
//   const { UserId, month, year } = req.body;

//   if (!UserId || !month || !year) {
//     return res.status(400).json({
//       status: 400,
//       error: "Missing required fields: UserId, month, year",
//     });
//   }

//   try {
//     const startDate = `${year}-${month}-01`;
//     const endDate = `${year}-${month}-31`;

//     const query = `
//       SELECT 
//         DATE(LogDate) AS AttendanceDate,
//         COUNT(CASE WHEN C1 = 'in' THEN 1 END) AS CheckIns,
//         COUNT(CASE WHEN C1 = 'out' THEN 1 END) AS CheckOuts,
//         CASE 
//           WHEN COUNT(CASE WHEN C1 = 'in' THEN 1 END) > 0 THEN 'Present'
//           ELSE 'Absent'
//         END AS AttendanceStatus,

//         TIME_FORMAT(
//   SEC_TO_TIME(
//     SUM(
//       CASE 
//         WHEN C1 = 'out' THEN UNIX_TIMESTAMP(LogDate)
//         WHEN C1 = 'in' THEN -UNIX_TIMESTAMP(LogDate)
//         ELSE 0
//       END
//     )
//   ),
//   '%H:%i:%s'
// ) AS HoursWorked
//       FROM 
//         devicelogs_8_2024
//       WHERE 
//         UserId = :UserId
//         AND DATE(LogDate) BETWEEN :startDate AND :endDate
//       GROUP BY 
//         DATE(LogDate)
//       ORDER BY 
//         AttendanceDate;
//     `;

//     const results = await sequelize.query(query, {
//       replacements: { UserId, startDate, endDate },
//       type: Sequelize.QueryTypes.SELECT,
//     });

//     if (results.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         error: "No attendance data found for the specified month.",
//       });
//     }

//     res.status(200).json({
//       status: 200,
//       data: results,
//     });
//   } catch (err) {
//     console.error("Error fetching monthly attendance:", err);
//     res.status(500).json({
//       status: 500,
//       error: "Server error occurred while fetching monthly attendance.",
//     });
//   }
// });





// New endpoint to fetch date range
router.get("/attendance-date-range", async (req, res) => {
  const { UserId } = req.query;

  if (!UserId) {
    return res.status(400).json({
      status: 400,
      error: "Missing required field: UserId",
    });
  }

  try {
    const query = `
      SELECT 
        MIN(DATE(LogDate)) AS startDate,
        MAX(DATE(LogDate)) AS endDate
      FROM 
        devicelogs_8_2024
      WHERE 
        UserId = :UserId;
    `;

    const results = await sequelize.query(query, {
      replacements: { UserId },
      type: Sequelize.QueryTypes.SELECT,
    });

    if (!results[0].startDate || !results[0].endDate) {
      return res.status(404).json({
        status: 404,
        error: "No attendance data found for the specified user.",
      });
    }

    res.status(200).json({
      status: 200,
      data: results[0],
    });
  } catch (err) {
    console.error("Error fetching date range:", err);
    res.status(500).json({
      status: 500,
      error: "Server error occurred while fetching date range.",
    });
  }
});



// Updated Weekly Attendance API
router.post("/attendance-month", async (req, res) => {
  const { UserId } = req.body;

  if (!UserId) {
    return res.status(400).json({
      status: 400,
      error: "Missing required field: UserId",
    });
  }

  try {
    // Step 1: Fetch the date range for the user
    const dateRangeQuery = `
      SELECT 
        MIN(DATE(LogDate)) AS startDate,
        MAX(DATE(LogDate)) AS endDate
      FROM 
        devicelogs_8_2024
      WHERE 
        UserId = :UserId;
    `;

    const dateRangeResults = await sequelize.query(dateRangeQuery, {
      replacements: { UserId },
      type: Sequelize.QueryTypes.SELECT,
    });

    if (!dateRangeResults[0].startDate || !dateRangeResults[0].endDate) {
      return res.status(404).json({
        status: 404,
        error: "No attendance data found for the specified user.",
      });
    }

    const { startDate, endDate } = dateRangeResults[0];

    // Step 2: Fetch attendance data for the date range
    const attendanceQuery = `
      WITH RECURSIVE DateRange AS (
        SELECT :startDate AS date
        UNION ALL
        SELECT DATE_ADD(date, INTERVAL 1 DAY)
        FROM DateRange
        WHERE date < :endDate
      )
      SELECT 
        DATE(dr.date) AS AttendanceDate,
        COUNT(CASE WHEN dl.C1 = 'in' THEN 1 END) AS CheckIns,
        COUNT(CASE WHEN dl.C1 = 'out' THEN 1 END) AS CheckOuts,
        CASE 
          WHEN COUNT(CASE WHEN dl.C1 = 'in' THEN 1 END) > 0 THEN 'Present'
          ELSE 'Absent'
        END AS AttendanceStatus,
        TIME_FORMAT(
          SEC_TO_TIME(
            SUM(
              CASE 
                WHEN dl.C1 = 'out' THEN UNIX_TIMESTAMP(dl.LogDate)
                WHEN dl.C1 = 'in' THEN -UNIX_TIMESTAMP(dl.LogDate)
                ELSE 0
              END
            )
          ),
          '%H:%i:%s'
        ) AS HoursWorked
      FROM 
        DateRange dr
      LEFT JOIN 
        devicelogs_8_2024 dl
      ON 
        DATE(dr.date) = DATE(dl.LogDate)
        AND dl.UserId = :UserId
      GROUP BY 
        dr.date
      ORDER BY 
        dr.date;
    `;

    const attendanceResults = await sequelize.query(attendanceQuery, {
      replacements: { UserId, startDate, endDate },
      type: Sequelize.QueryTypes.SELECT,
    });

    if (attendanceResults.length === 0) {
      return res.status(404).json({
        status: 404,
        error: "No attendance data found for the specified week.",
      });
    }

    res.status(200).json({
      status: 200,
      data: attendanceResults,
    });
  } catch (err) {
    console.error("Error fetching weekly attendance:", err);
    res.status(500).json({
      status: 500,
      error: "Server error occurred while fetching weekly attendance.",
    });
  }
});


// Weekly Attendance API
router.post("/attendance-week", async (req, res) => {
  const { UserId, startDate, endDate } = req.body;

  if (!UserId || !startDate || !endDate) {
    return res.status(400).json({
      status: 400,
      error: "Missing required fields: UserId, startDate, endDate",
    });
  }

  try {
    const query = `
      WITH RECURSIVE DateRange AS (
        SELECT :startDate AS date
        UNION ALL
        SELECT DATE_ADD(date, INTERVAL 1 DAY)
        FROM DateRange
        WHERE date < :endDate
      )
      SELECT 
        DATE(dr.date) AS AttendanceDate,
        COUNT(CASE WHEN dl.C1 = 'in' THEN 1 END) AS CheckIns,
        COUNT(CASE WHEN dl.C1 = 'out' THEN 1 END) AS CheckOuts,
        CASE 
          WHEN COUNT(CASE WHEN dl.C1 = 'in' THEN 1 END) > 0 THEN 'Present'
          ELSE 'Absent'
        END AS AttendanceStatus,
        TIME_FORMAT(
          SEC_TO_TIME(
            SUM(
              CASE 
                WHEN dl.C1 = 'out' THEN UNIX_TIMESTAMP(dl.LogDate)
                WHEN dl.C1 = 'in' THEN -UNIX_TIMESTAMP(dl.LogDate)
                ELSE 0
              END
            )
          ),
          '%H:%i:%s'
        ) AS HoursWorked
      FROM 
        DateRange dr
      LEFT JOIN 
        devicelogs_8_2024 dl
      ON 
        DATE(dr.date) = DATE(dl.LogDate)
        AND dl.UserId = :UserId
      GROUP BY 
        dr.date
      ORDER BY 
        dr.date;
    `;

    const results = await sequelize.query(query, {
      replacements: { UserId, startDate, endDate },
      type: Sequelize.QueryTypes.SELECT,
    });

    if (results.length === 0) {
      return res.status(404).json({
        status: 404,
        error: "No attendance data found for the specified week.",
      });
    }

    res.status(200).json({
      status: 200,
      data: results,
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