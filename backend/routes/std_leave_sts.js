const express =require('express');
const devicelog= require("../config/db");
const Request = require('../models/Leave')
const app = express();


app.post("/leavests", async (req, res) => {
    const { sin_number } = req.body;
  
    try {
      const leaveRequests = await Request.findAll({ where: { sin_number } });
  
      if (!leaveRequests || leaveRequests.length === 0) {
        return res.status(404).json({ error: "No leave requests found for the given SIN number." });
      }
  
      const responseData = leaveRequests.map((sts) => ({
        status: 200,
        message: "Leave status retrieved for student successfully",
        request_id: sts.request_id,
        student_name: sts.student_name,
        sin_number:sts.sin_number,
        request_type: sts.request_type, // Include request_type in the response
        reason_Details:sts.reason_Details,
        reason:sts.reason,
        time_slot:sts.time_slot,
        createdAt:sts.createdAt,
        startDate:sts.startDate,
        endDate:sts.endDate,
        mentor_approval: sts.mentor_approval,
        class_advisor_approval: sts.class_advisor_approval,
        hod_approval: sts.hod_approval,
        principal_approval: sts.principal_approval,
        placement_officer_approval: sts.placement_officer_approval,
        pdf_data: sts.pdf_path ? sts.pdf_path.toString("base64") : null,
      }));
  
      res.json(responseData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

module.exports=app;
