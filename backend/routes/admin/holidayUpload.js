// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const csv = require('csv-parse');
// const fs = require('fs');
// const Holiday = require('../../models/holidays');

// const upload = multer({ dest: 'uploads/' });

// // POST /api/admin/upload-holidays
// router.post('/holidays', upload.single('file'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ success: false, message: 'No file uploaded' });
//   }
//   const filePath = req.file.path;
//   const holidays = [];
//   try {
//     const parser = fs.createReadStream(filePath).pipe(csv.parse({ columns: true, trim: true }));
//     for await (const record of parser) {
//       holidays.push({
//         date: record.date,
//         day: record.day,
//         holiday_reason: record.holiday_reason
//       });
//     }
//     // Upsert holidays (update if date exists, else insert)
//     for (const h of holidays) {
//       await Holiday.upsert(h);
//     }
//     fs.unlinkSync(filePath);
//     res.json({ success: true, message: 'Holidays uploaded successfully', count: holidays.length });
//   } catch (err) {
//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     res.status(500).json({ success: false, message: 'Failed to process CSV', error: err.message });
//   }
// });

// module.exports = router; 