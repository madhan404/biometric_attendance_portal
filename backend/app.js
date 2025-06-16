const sequelize = require("./config/db"); 
require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const User = require("./models/User"); 
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
const app = express();

const advisor_details = require("./routes/student/advisor_details");
const profileRoutes = require('./routes/student/profileRoutes');
const principalProfileRoutes = require('./routes/principal/profileRoutes');
const hodProfileRoutes = require('./routes/hod/profileRoutes');
const hodstaffProfileRoutes = require('./routes/hodstaff/profileRoutes');
const staffProfileRoutes = require('./routes/staff/profileRoutes');
const placementProfileRoutes = require('./routes/placement/profileRoutes');

// const holidayUpload = require('./routes/admin/holidayUpload');
const attendanceRoutes = require('./routes/principal/attendanceRoutes');
const staffAttendanceRoutes = require('./routes/principal/staffAttendanceRoutes');
const hodAttendanceRoutes = require('./routes/hod/attendanceRoutes');
const hodstaffAttendanceRoutes = require('./routes/hod/staffAttendanceRoutes');
// Import routes
// const studentRoutes = require('./routes/student/studentRoutes');
// const teacherRoutes = require('./routes/teacher/teacherRoutes');
// const principalRoutes = require('./routes/principal/principalRoutes');
const holidayRoutes = require('./routes/principal/holidayRoutes');
const hodholidayRoutes = require('./routes/hod/holidayRoutes');
const hodstaffholidayRoutes = require('./routes/hodstaff/holidayRoutes');
const staffholidayRoutes = require('./routes/staff/holidayRoutes');
const placementholidayRoutes = require('./routes/placement/studentSummary');
const mentorRoutes = require('./routes/mentor/mentor');
const classadvisorRoutes = require('./routes/classadvisor/classadvisor');
const classadvisorAttendance = require('./routes/classadvisor/classadvisorAttendance');
 const mentorAttendance= require('./routes/mentor/mentorAttendance');

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  })
);

// Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Log all incoming requests
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   next();
// });

app.use('/api/student', profileRoutes);

app.use("/api/users", authRoutes);
app.use("/api/leavereq",leavereq);
// get attendance monthly and weekly
app.use("/api",stdatt);

app.use("/api/daily",dailyapi);

app.use("/api/stdleavests",stdleavests);
app.use("/api/staff",staffleavests);

app.use("/api",staffsstdleavests);
app.use("/api",hodstaffleave);
app.use("/api",principalstaffleavests);
app.use("/api",principalstaffleave_approve);

app.use("/api",principalhodleave);
// app.use("/api",mentor_approval);
app.use("/api",staff_approval);
app.use("/api",advisor_details);
// app.use("/api",hod_staff_approve_request);
app.use("/api",admin_dashboard);
app.use("/api",user_management);
app.use("/api",SystemConfigurations);
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
// Use routes
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

// Move this before the 404 handler
app.use('/api/backup', backupRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

sequelize
  .sync({ alter: false, force: false }) 
  .then(() => {
    console.log("Database synced successfully!");
    
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log('Database connection established');
    });
  })
  .catch((error) => {
    console.error("Unable to sync the database:", error); 
  });

module.exports = app;

