const sequelize = require("./config/db"); 
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const User = require("./models/User"); 
const authRoutes = require("./routes/Userroute"); 
const leavereq = require("./routes/Leavereq");
const stdatt = require("./routes/studentRoutes");
const stdleavests = require("./routes/std_leave_sts");
const staffleavests = require("./routes/staff_leave_sts");
const app = express();

app.use(express.json()); 

app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true, 
  })
);

app.use("/api/users", authRoutes);
app.use("/api/leavereq",leavereq);
// get attendance monthly and weekly
app.use("/api/attendance",stdatt);
app.use("/api/stdleavests",stdleavests);
app.use("/api/staff",staffleavests);
app.use((err, req, res, next) => {
  console.error("Error Stack:", err.stack);
  if (err.name === "ValidationError") {
    res.status(400).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


sequelize
  .sync({ alter: false, force: false, logging: console.log }) 
  .then(() => {
    console.log("Database synced successfully!");
    
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to sync the database:", error); 
  });

