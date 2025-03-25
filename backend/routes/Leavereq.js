
// const express = require('express');
// const bodyParser = require('body-parser');
// const multer = require('multer');
// const Request = require('../models/Leave');
// const { where } = require('sequelize');
// const app = express();
// app.use(bodyParser.json());


// const storage = multer.memoryStorage();  // No destination needed for memory storage

// const upload = multer({ 
//     storage,
//     limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype === 'application/pdf') {
//             cb(null, true);
//         } else {
//             cb(new Error('Only PDF files are allowed'), false);
//         }
//     }
// });


// // Post the student leave request
// app.post('/std-request', upload.single('pdf'), async (req, res) => {
//     console.log("Received File:", req.file);  // ✅ Check if multer is getting the file
//     const { sin_number, student_name, department, year, startDate, endDate, request_type, reason } = req.body;
// //student_name 

// try {
    
//     const reqcount = await Request.count({ where: { request_type } });
//     const reqid = `${request_type}-00${reqcount + 1}`;
    
//     let pdfData = null;
//     if (request_type === 'internship') {
//         if (!req.file) {
//             return res.status(400).json({ error: 'PDF upload is required for internship requests' });
//         }
//         pdfData = req.file.buffer; 
//         console.log("PDF Buffer Length:", req.file.buffer.length);  // ✅ Check if buffer exists
//         }

        
//         const request = await Request.create({
//             sin_number,
//             student_name,
//             department,
//             year,
//             request_type,
//             reason,
//             startDate,
//             endDate,
//             request_id: reqid,
//             pdf_path: pdfData, 
//         });

//         console.log("Saved Request ID:", request.request_id);  // ✅ Check if DB save work

//         res.json({ message: `Request submitted successfully with ID ${reqid}`, req_id: reqid });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Database error' });
//     }
// });

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const Request = require('../models/Leave');
const app = express();
app.use(bodyParser.json());

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'), false);
      }
    },
  });



// Post the student leave request
app.post('/std-request', upload.single('pdf'), async (req, res) => {
  console.log("Received File:", req.file); // Debug: Check if the file is received
  const { sin_number, student_name, department, year, startDate, endDate, request_type, reason,reason_Details } = req.body;

  try {
    const reqcount = await Request.count({ where: { request_type } });
    const reqid = `${request_type}-00${reqcount + 1}`;

    let pdfData = null;
    if (request_type === 'internship') {
      if (!req.file) {
        return res.status(400).json({ error: 'PDF upload is required for internship requests' });
      }
      pdfData = req.file.buffer; // Store the PDF file buffer
      console.log("PDF Buffer Length:", req.file.buffer.length); // Debug: Check the buffer length
    }

    const request = await Request.create({
      sin_number,
      student_name,
      department,
      year,
      request_type,
      reason,
      reason_Details,
      startDate,
      endDate,
      request_id: reqid,
      pdf_path: pdfData, // Store the PDF file in the database
    });

    console.log("Saved Request ID:", request.request_id); // Debug: Check if the request is saved
    console.log("PDF Data Stored:", request.pdf_path ? request.pdf_path.length : "NULL"); // Debug: Check if PDF data is stored

    res.json({ message: `Request submitted successfully with ID ${reqid}`, req_id: reqid });
  } catch (err) {
    console.error("Error:", err); // Debug: Log the error
    res.status(500).json({ error: 'Database error' });
  }
});

// Post the staff leave request
app.post('/staff-leave-req',async (req,res)=>{
    const {sin_number,staff_name,department,
        request_type,reason,startDate,endDate}= req.body;
        try{
            const reqcount = await Request.count({where:{request_type}});
            const reqid = `${request_type}- 00${reqcount +1}`;

            const request = await Request.create({
                request_id :reqid,
                sin_number,staff_name,
                department,
                request_type,
                reason,
                startDate,endDate,
                hod_approval:'pending',
                principal_approval:'pending'
            });
            res.json({ message:`requst submted suceessfully ${reqid}`,req_id : reqid})
        }catch(err){
            res.status(500).json({error:' db error'});
            console.log(err);
            
        }
});

// Post the hod leave request
app.post('/hod-leave-req',async(req,res)=>{
    const {sin_number,hod_name,department,
        request_type,reason,startDate,endDate}= req.body;

        try{
            const reqcount= await Request.count({where:{request_type}});
            const reqid =`${request_type}- 00${reqcount+1}`;
            const request = await Request.create({

                request_id:reqid,
                sin_number,hod_name,department,request_type,reason,
                startDate,endDate,
                principal_approval:'pending'
            });
            res.json({message:`request submitted successdully ${reqid}`,req_id:reqid})
        }catch(err){
            res.status(500).json({errror:'db errro'});
        }
});

// CA approval
app.post('/class-advisor-approval', async (req, res) => {
    const { sin_number, approval_status } = req.body;

    try {
        const request = await Request.findOne({
            where: { sin_number },
            order: [['createdAt', 'Desc']]
        });

        if (!request) {
            return res.status(400).json({ error: `Request not found for ${sin_number}` });
        }

        if (request.class_advisor_approval !== 'pending') {
            return res.status(400).json({ error: `Request already ${approval_status} by class advisor` });
        }

        request.class_advisor_approval = approval_status;
        await request.save();

        res.json({ message: 'Class advisor approval updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/hod-approval', async (req, res) => {
    const { sin_number, approval_status } = req.body;

    try {
        const request = await Request.findOne({
            where: { sin_number },
            order: [['createdAt', 'Desc']]
        });

        if (!request) {
            return res.status(400).json({ error: `Request not found for ${sin_number}` });
        }

        if (request.class_advisor_approval !== 'approved') {
            return res.status(400).json({ error: 'Class advisor approval is required' });
        }

        if (request.hod_approval !== 'pending') {
            return res.status(400).json({ error: `Request already ${approval_status} by HOD` });
        }

        request.hod_approval = approval_status;
        await request.save();

        res.json({ message: 'HOD approval updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/placement-officer-approval', async (req, res) => {
    const { sin_number, approval_status } = req.body;

    try {
        const request = await Request.findOne({
            where: { sin_number, request_type: 'internship' },
            order: [["createdAt", "Desc"]]
        });

        if (!request) {
            return res.status(400).json({ error: `Internship request not found for ${sin_number}` });
        }

        if (request.hod_approval !== 'approved') {
            return res.status(400).json({ error: 'HOD approval is required' });
        }

        if (request.placement_officer_approval !== 'pending') {
            return res.status(400).json({ error: `Request already ${approval_status} by Placement Officer` });
        }

        request.placement_officer_approval = approval_status;
        await request.save();

        res.json({ message: 'Placement officer approval updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/principal-approval', async (req, res) => {
    const { sin_number, approval_status } = req.body;

    try {
        const request = await Request.findOne({
            where: { sin_number },
            order: [["createdAt", "Desc"]]
        });

        if (!request) {
            return res.status(400).json({ error: `Request not found for ${sin_number}` });
        }

        if (request.request_type === 'internship' && request.placement_officer_approval !== 'approved') {
            return res.status(400).json({ error: 'Placement officer approval is required for internship requests' });
        } else if (request.request_type !== 'internship' && request.hod_approval !== 'approved') {
            return res.status(400).json({ error: 'HOD approval is required' });
        }

        if (request.principal_approval !== 'pending') {
            return res.status(400).json({ error: `Request already ${approval_status} by Principal` });
        }

        request.principal_approval = approval_status;
        await request.save();

        res.json({ message: 'Principal approval updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// get all student leave request data
app.post('/studentsleaverequests', async (req,res)=>{
    try{
        const stdreq = await Request.findAll();
        const responsedata={
            status:200,
            message:"data fetched",
            stdreq,
        };
        res.json({  
            status:200,
            responsedata
        })
    }catch(err){
        console.log(err);
        res.status(500).json({error:"db error"})
    }
});
module.exports = app;