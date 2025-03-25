const express =require('express');
const devicelog= require("../config/config");
const Request = require('../models/Leave')
const app = express();


// Get Request form status based on id
// app.post('/leavests',async (req,res)=>{
//     const {sin_number,student_name,class_advisor_approval,hod_approval,
//         principal_approval,placement_officer_approval}=req.body;
//     try{
//         const sts = await Request.findOne({
//             where:{sin_number},

//         });
//         const responseData = {
//             status:200,
//             message:"leave sts got for gvn sin",
//             student_name: sts.student_name,
//             class_advisor_approval : sts.class_advisor_approval,
//             hod_approval: sts.hod_approval,
//             principal_approval:sts.principal_approval,
//             placement_officer_approval: sts.placement_officer_approval
//         }
//         res.json(responseData);
//     }catch(err){
        
//         res.status(500).json({error:"db error"})
//         console.error(err);
//     }
// })


// app.post('/leavests', async (req, res) => {
//     const { sin_number } = req.body;
    
//     try {
//         const sts = await Request.findOne({ where: { sin_number } });

//         if (!sts) {
//             return res.status(404).json({ error: "Request not found" });
//         }

//         console.log("Fetched PDF Data Length:", sts.pdf_path ? sts.pdf_path.length : "NULL");

//         const responseData = {
//             status: 200,
//             message: "Leave status retrieved successfully",
//             student_name: sts.student_name,
//             class_advisor_approval: sts.class_advisor_approval,
//             hod_approval: sts.hod_approval,
//             principal_approval: sts.principal_approval,
//             placement_officer_approval: sts.placement_officer_approval, pdf_data: sts.pdf_path ? sts.pdf_path.toString('base64') : null // ✅ Converts PDF to Base64
//             // pdf_present: !!sts.pdf_path // ✅ Check if PDF data exists
//         };

//         res.json(responseData);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Database error" });
//     }
// });


app.post("/leavests", async (req, res) => {
    const { sin_number } = req.body;
  
    try {
      const leaveRequests = await Request.findAll({ where: { sin_number } });
  
      if (!leaveRequests || leaveRequests.length === 0) {
        return res.status(404).json({ error: "No leave requests found for the given SIN number." });
      }
  
      const responseData = leaveRequests.map((sts) => ({
        status: 200,
        message: "Leave status retrieved successfully",
        request_id: sts.request_id,
        student_name: sts.student_name,
        request_type: sts.request_type, // Include request_type in the response
        request_type:sts.request_type,
        reason:sts.reason,
        createdAt:sts.createdAt,
        startDate:sts.startDate,
        endDate:sts.endDate,
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