const express = require('express');
// const bodyParser = require('body-parser');
const multer = require('multer');
const Request = require('../models/Leave');
const { v4: uuidv4 } = require('uuid');

const app =express();
app.use(express.json());

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


  app.post('/std-request', upload.single('pdf'), async (req, res) => {
    try {
      // Debug logging
      console.log("Request received with file:", req.file);
      console.log("Request body:", req.body);
  
      // Normalize request type
      const request_type = req.body.request_type?.toLowerCase() || '';
      
      // Handle PDF for internship
      let pdfBuffer = null;
    //   if (request_type === 'internship') {
        if (request_type === 'internship' || request_type === 'od' || request_type === 'leave') {
          if (request_type === 'od' || request_type === 'leave') {
            if (!req.body.startDate || !req.body.endDate) {
              return res.status(400).json({ error: 'Start and end dates are required for OD/Leave requests' });
            }
          }
          if (!req.file) {
            console.error("No PDF uploaded for internship request");
            return res.status(400).json({ error: 'PDF required for internship/od/leave request' });
          }
          pdfBuffer = req.file.buffer;
        }
  
      // Process request
      const request = await Request.create({
        ...req.body,
        request_id: uuidv4(),
        pdf_path: pdfBuffer
      });
  
      res.json({ 
        success: true,
        request_id: request.request_id
      });
      
    } catch (error) {
      console.error("Request processing error:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message
      });
    }
  });


// Post the staff leave request
app.post('/staff-leave-req', upload.single('pdf'), async (req, res) => {
    try {
        // Debug logging
        console.log("Request received with file:", req.file);
        console.log("Request body:", req.body);

        console.log("BODY:", req.body);
console.log("FILES:", req.file);

        const {sin_number, staff_name, department,
            request_type, reason, reason_Details, startDate, endDate, time_slot} = req.body;

        // Normalize request type
        const normalized_request_type = request_type?.toLowerCase() || '';

        // Handle PDF for requests
        let pdfBuffer = null;
        if (normalized_request_type === 'od' || normalized_request_type === 'leave') {
            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'Start and end dates are required for OD/Leave requests' });
            }
            if (!req.file) {
                console.error("No PDF uploaded for request");
                return res.status(400).json({ error: 'PDF required for this request type' });
            }
            pdfBuffer = req.file.buffer;
        } else if (normalized_request_type === 'permission') {
            // PDF might be optional for permission, let's assume it's not strictly required unless specified.
            // However, startDate and time_slot are essential.
            if (!startDate || !time_slot) {
                return res.status(400).json({ error: 'Start date and time slot are required for permission requests' });
            }
            if (req.file) {
                console.log("PDF uploaded for permission request, will be saved.");
                pdfBuffer = req.file.buffer; // Save PDF if provided
            } else {
                console.log("No PDF uploaded for permission request, proceeding without it.");
            }
        }else {
            return res.status(400).json({ error: 'Invalid request type. Must be od, leave, or permission' });
        }

        const reqid = uuidv4();

        let requestData = {
            request_id: reqid,
            sin_number,
            staff_name, 
            department,
            request_type: normalized_request_type,
            reason,
            reason_Details,
            pdf_path: pdfBuffer,
            hod_approval: 'pending',
            principal_approval: 'pending'
        };

        if (normalized_request_type === 'permission') {
            requestData.time_slot = time_slot;
            requestData.startDate = startDate; // Ensure startDate is saved for permission
            // endDate is not applicable for permission, so it won't be in requestData
        } else { // For 'od' and 'leave'        
            requestData.startDate = startDate;
            requestData.endDate = endDate;
        }

        const request = await Request.create(requestData);

        res.json({
            success: true,
            message: `Request submitted successfully ${reqid}`,
            request_id: reqid
        });

    } catch (err) {
        console.error("Request processing error:", err);
        res.status(500).json({
            error: "Database error", 
            details: err.message
        });
    }
});


app.post('/hod-leave-req', upload.single('pdf'), async (req, res) => {
    try {
        // Debug logging
        console.log("Request received with file:", req.file);
        console.log("Request body:", req.body);

        const {sin_number, hod_name, department,
            request_type, reason, reason_Details, startDate, endDate, time_slot} = req.body;

        // Normalize request type
        const normalized_request_type = request_type?.toLowerCase() || '';

        // Handle PDF for requests
        let pdfBuffer = null;
        if (normalized_request_type === 'od' || normalized_request_type === 'leave') {
            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'Start and end dates are required for OD/Leave requests' });
            }

            // Validate date format and logic
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Check if dates are valid
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD format' });
            }

            // Check if end date is before start date
            if (end < start) {
                return res.status(400).json({ error: 'End date cannot be before start date' });
            }

            // Check if dates are in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (start < today) {
                return res.status(400).json({ error: 'Start date cannot be in the past' });
            }

            if (!req.file) {
                console.error("No PDF uploaded for request");
                return res.status(400).json({ error: 'PDF required for this request type' });
            }
            pdfBuffer = req.file.buffer;
        } else if (normalized_request_type === 'permission') {
            // Validate time_slot for permission requests
            if (!time_slot || !startDate) {
                return res.status(400).json({ error: 'Time slot and Start Date are required for permission requests' });
            }
            // No PDF required for permission requests
            if (req.file) {
                console.log("PDF uploaded but not required for permission request");
            }
        } else {
            return res.status(400).json({ error: 'Invalid request type. Must be od, leave, or permission' });
        }

        const reqid = uuidv4();

        let requestData = {
            request_id: reqid,
            sin_number,
            hod_name, 
            department,
            request_type: normalized_request_type,
            reason,
            reason_Details,
            pdf_path: pdfBuffer,
            principal_approval: 'pending'
        };

        if (normalized_request_type === 'permission') {
            requestData.time_slot = time_slot;
            requestData.startDate = startDate;
            // Do not include endDate
        } else {
            requestData.startDate = startDate;
            requestData.endDate = endDate;
        }

        const request = await Request.create(requestData);

        res.json({
            success: true,
            message: `Request submitted successfully ${reqid}`,
            request_id: reqid
        });

    } catch (err) {
        console.error("Request processing error:", err);
        res.status(500).json({
            error: "Database error", 
            details: err.message
        });
    }
});

module.exports = app;