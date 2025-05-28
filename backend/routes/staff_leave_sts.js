const express =require('express');
const Request = require('../models/Leave')
const sequelize = require('../config/db');
const app = express();

app.post("/staff-leave-sts", async (req, res) => {
    const { sin_number } = req.body;  
    //console.log('Received request for sin_number:', sin_number);
    try {
      // Test database connection
      await sequelize.authenticate();
      console.log('Database connection successful');

      const leaveRequests = await Request.findAll({ where: { sin_number } });
    //  console.log('Found leave requests:', leaveRequests);
  
      if (!leaveRequests || leaveRequests.length === 0) {
        console.log('No leave requests found');
        return res.status(404).json({ error: "No leave requests found for the given SIN number." });
      }
  
      const responseData = leaveRequests.map((sts) => ({
        status: 200,
        message: "Leave status retrieved for student successfully",
        request_id: sts.request_id,
        staff_name: sts.staff_name,
        sin_number:sts.sin_number,
        request_type: sts.request_type,
        reason_Details:sts.reason_Details,
        reason:sts.reason,     time_slot:sts.time_slot,
        createdAt:sts.createdAt,
        startDate:sts.startDate,
        endDate:sts.endDate,
        hod_approval: sts.hod_approval,
        principal_approval: sts.principal_approval,
        pdf_data: sts.pdf_path ? sts.pdf_path.toString("base64") : null,
      }));
  
  //    console.log('Sending response:', responseData);
      res.json(responseData);
    } catch (err) {
      console.error('Error in staff-leave-sts:', err);
      if (err.name === 'SequelizeConnectionError') {
        res.status(500).json({ error: "Database connection error" });
      } else {
        res.status(500).json({ error: "Database error" });
      }
    }
  });
  
  
  app.post("/hod-leave-sts", async (req, res) => {
    const { sin_number } = req.body;
    try {
      const leaveRequests = await Request.findAll({
        where: { sin_number },
      });
      if (!leaveRequests || leaveRequests.length === 0) {
        return res.status(404).json({ error: "No leave requests found for the given SIN number." });
      }
      const resposedatd = leaveRequests.map((sts) => ({
        status: 200,
        message: "Leave status retrieved for hod successfully",
        sin_number: sts.sin_number,
        hod_name: sts.hod_name,
        request_type: sts.request_type,
          reason_Details:sts.reason_Details,
          reason:sts.reason,
          createdAt:sts.createdAt,
          startDate:sts.startDate,
          endDate:sts.endDate,
        principal_approval: sts.principal_approval,
      }));
      res.json(resposedatd);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "db errror" });
    }
  });

app.post("/hod-personal-leavests", async (req, res) => {
  const { sin_number } = req.body;
  try {
    const leaveRequests = await Request.findAll({
      where: { sin_number },
    });

    if (!leaveRequests || leaveRequests.length === 0) {
      return res.status(404).json({ 
        status: "error",
        error: "No leave requests found for the given SIN number." 
      });
    }

    const responseData = {
      status: "success",
      requests: leaveRequests.map((request) => ({
        request_id: request.request_id,
        request_type: request.request_type,
        reason: request.reason,
        reason_Details: request.reason_Details,
        startDate: request.startDate,
        endDate: request.endDate,
        status: request.principal_approval === 'Approved' ? 'Approved' : 
                request.principal_approval === 'Rejected' ? 'Rejected' : 
                'Pending principal Approval',
        createdAt: request.createdAt,
        pdf_data: request.pdf_path ? request.pdf_path.toString("base64") : null
      }))
    };

    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "error",
      error: "Database error" 
    });
  }
});

module.exports=app;