const express = require('express');
const router = express.Router();
const SystemConfig = require('../../models/system_config');
const SemesterDetails = require('../../models/semester_details');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const Holiday = require('../../models/holidays');
const Devicelog = require('../../models/Devicelog');

// Update or create system configuration
router.post('/system-config', async (req, res) => {
    try {
        const configData = req.body;

        // Check if configuration already exists
        const existingConfig = await SystemConfig.findOne();

        if (existingConfig) {
            // Update existing configuration
            const updatedConfig = await SystemConfig.update(configData, {
                where: { id: existingConfig.id }
            });
            
            return res.status(200).json({
                success: true,
                message: 'System configuration updated successfully',
                data: updatedConfig
            });
        } else {
            // Create new configuration if none exists
            const newConfig = await SystemConfig.create(configData);
            
            return res.status(201).json({
                success: true,
                message: 'System configuration created successfully',
                data: newConfig
            });
        }
    } catch (error) {
        console.error('Error in system configuration:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating system configuration',
            error: error.message
        });
    }
});

// Get current system configuration
router.get('/system-config', async (req, res) => {
    try {
        const config = await SystemConfig.findOne();
        
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'System configuration not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Error fetching system configuration:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching system configuration',
            error: error.message
        });
    }
});

// Get semester details
router.get('/semester-details', async (req, res) => {
  try {
    const semester = await SemesterDetails.findOne({ order: [['created_at', 'DESC']] });
    res.json({
      success: true,
      data: semester || {
        semester_name: '',
        semester_start_date: null,
        semester_end_date: null,
        total_semester_days: null
      }
    });
  } catch (error) {
    console.error('Error fetching semester details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch semester details'
    });
  }
});

// Update semester details
router.put('/semester-details', async (req, res) => {
  try {
    const { semester_name, semester_start_date, semester_end_date, total_semester_days } = req.body;

    // Validate dates
    if (new Date(semester_start_date) > new Date(semester_end_date)) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    // Upsert semester details (create new or update latest)
    let semester = await SemesterDetails.findOne({ order: [['created_at', 'DESC']] });
    if (!semester) {
      semester = await SemesterDetails.create({
        semester_name,
        semester_start_date,
        semester_end_date,
        total_semester_days
      });
    } else {
      await semester.update({
        semester_name,
        semester_start_date,
        semester_end_date,
        total_semester_days
      });
    }

    res.json({
      success: true,
      message: 'Semester details updated successfully',
      data: semester
    });
  } catch (error) {
    console.error('Error updating semester details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update semester details',
      details: error.message
    });
  }
});

const upload = multer({ dest: 'uploads/' });

// POST /api/admin/upload-holidays
router.post('/upload-holidays', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const filePath = req.file.path;
  const holidays = [];
  try {
    const parser = fs.createReadStream(filePath).pipe(csv.parse({ columns: true, trim: true }));
    for await (const record of parser) {
      holidays.push({
        date: record.date,
        day: record.day,
        holiday_reason: record.holiday_reason
      });
    }
    // Upsert holidays (update if date exists, else insert)
    for (const h of holidays) {
      await Holiday.upsert(h);
    }
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Holidays uploaded successfully', count: holidays.length });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ success: false, message: 'Failed to process CSV', error: err.message });
  }
});

// GET /api/holidays
router.get('/holidays', async (req, res) => {
  try {
    const holidays = await Holiday.findAll({ order: [['date', 'ASC']] });
    res.json({ success: true, data: holidays });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch holidays', error: err.message });
  }
});

// DELETE /api/holidays
router.delete('/holidays', async (req, res) => {
  try {
    await Holiday.destroy({ where: {} });
    res.json({ success: true, message: 'All holidays deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete holidays', error: err.message });
  }
});

// PUT /api/holidays/:id
router.put('/holidays/:id', async (req, res) => {
  try {
    const { date, day, holiday_reason } = req.body;
    const id = req.params.id;
    const holiday = await Holiday.findByPk(id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }
    await holiday.update({ date, day, holiday_reason });
    res.json({ success: true, message: 'Holiday updated', data: holiday });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update holiday', error: err.message });
  }
});

// GET /api/devicelogs
router.get('/devicelogs', async (req, res) => {
  try {
    const logs = await Devicelog.findAll();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch devicelogs', error: err.message });
  }
});

// DELETE /api/devicelogs
router.delete('/devicelogs', async (req, res) => {
  try {
    await Devicelog.destroy({ where: {} });
    res.json({ success: true, message: 'All devicelogs deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete devicelogs', error: err.message });
  }
});

// POST /api/upload-devicelogs
router.post('/upload-devicelogs', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const filePath = req.file.path;
  const logs = [];
  try {
    const parser = fs.createReadStream(filePath).pipe(csv.parse({ columns: true, trim: true }));
    for await (const record of parser) {
      logs.push(record);
    }
    for (const log of logs) {
      await Devicelog.upsert(log);
    }
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Devicelogs uploaded successfully', count: logs.length });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ success: false, message: 'Failed to process CSV', error: err.message });
  }
});

module.exports = router;
