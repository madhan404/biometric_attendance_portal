require("dotenv").config();  // Load env vars early
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
// Routes
const authRoutes = require("./routes/Userroute");
const leavereq = require("./routes/Leavereq");
const stdatt = require("./routes/studentRoutes");
const dailyapi = require("./routes/dailyapi");
const stdleavests = require("./routes/std_leave_sts");
const staffleavests = require("./routes/staff_leave_sts");
const backupRoutes = require('./routes/admin/backup');
const staffsstdleavests = require("./routes/staffs_std_leave_sts");
const hodstaffleave = require("./routes/hod_staff_leave");
const principalstaffleavests = require("./routes/principal_staff_leave_sts");
const principalstaffleave_approve = require("./routes/principal_staff_leave_approval");
const principalhodleave = require("./routes/principal_hod_leave");
const staff_approval = require("./routes/staff_approval");
const admin_dashboard = require("./routes/admin/admin_dashboard");
const user_management = require("./routes/admin/user_management");
const SystemConfigurations  = require("./routes/admin/systemConfig");
const adminLeaveRequests = require('./routes/admin/leave_requests');
const advisor_details = require("./routes/student/advisor_details");
const profileRoutes = require('./routes/student/profileRoutes');
const principalProfileRoutes = require('./routes/principal/profileRoutes');
const hodProfileRoutes = require('./routes/hod/profileRoutes');
const hodstaffProfileRoutes = require('./routes/hodstaff/profileRoutes');
const staffProfileRoutes = require('./routes/staff/profileRoutes');
const placementProfileRoutes = require('./routes/placement/profileRoutes');
const attendanceRoutes = require('./routes/principal/attendanceRoutes');
const staffAttendanceRoutes = require('./routes/principal/staffAttendanceRoutes');
const hodAttendanceRoutes = require('./routes/hod/attendanceRoutes');
const hodstaffAttendanceRoutes = require('./routes/hod/staffAttendanceRoutes');
const holidayRoutes = require('./routes/principal/holidayRoutes');
const hodholidayRoutes = require('./routes/hod/holidayRoutes');
const hodstaffholidayRoutes = require('./routes/hodstaff/holidayRoutes');
const staffholidayRoutes = require('./routes/staff/holidayRoutes');
const placementholidayRoutes = require('./routes/placement/studentSummary');
const mentorRoutes = require('./routes/mentor/mentor');
const classadvisorRoutes = require('./routes/classadvisor/classadvisor');
const classadvisorAttendance = require('./routes/classadvisor/classadvisorAttendance');
const mentorAttendance= require('./routes/mentor/mentorAttendance');

const app = express();

console.log("Starting Express app...");

// CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// Body parsing with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes registration
app.use('/api/student', profileRoutes);
app.use("/api/users", authRoutes);
app.use("/api/leavereq", leavereq);
app.use("/api", stdatt);
app.use("/api/daily", dailyapi);
app.use("/api/stdleavests", stdleavests);
app.use("/api/staff", staffleavests);
app.use("/api", staffsstdleavests);
app.use("/api", hodstaffleave);
app.use("/api", principalstaffleavests);
app.use("/api", principalstaffleave_approve);
app.use("/api", principalhodleave);
app.use("/api", staff_approval);
app.use("/api", advisor_details);
app.use("/api", admin_dashboard);
app.use("/api", user_management);
app.use("/api", SystemConfigurations);
app.use('/api', adminLeaveRequests);
app.use('/api/principal/attendance', attendanceRoutes);
app.use('/api/principal/staff-attendance', staffAttendanceRoutes);
app.use('/api/hod', hodAttendanceRoutes);
app.use('/api/hod', hodstaffAttendanceRoutes);
app.use('/api/principal', principalProfileRoutes);
app.use('/api/hod', hodProfileRoutes);
app.use('/api/hodstaff', hodstaffProfileRoutes);
app.use('/api/staff', staffProfileRoutes);
app.use('/api/placement', placementProfileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/principal', holidayRoutes);
app.use('/api/hod', hodholidayRoutes);
app.use('/api/hodstaff', hodstaffholidayRoutes);
app.use('/api/staff', staffholidayRoutes);
app.use('/api/placement', placementholidayRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/mentor', mentorAttendance);
app.use('/api/classadvisor', classadvisorRoutes);
app.use('/api/classadvisor', classadvisorAttendance);
app.use('/api/backup', backupRoutes); // before 404

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error middleware caught:", err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Database sync & server start
(async () => {
  try {
    console.log("Attempting to sync database...");
    await sequelize.sync({ alter: false, force: false });
    console.log("Database synced successfully!");

    const port = process.env.DB_PORT || 3001;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log('Database connection established');
    });
  } catch (error) {
    console.error("Unable to sync the database:", error);
    process.exit(1); // Quit app on error sync
  }
})();

module.exports = app;
