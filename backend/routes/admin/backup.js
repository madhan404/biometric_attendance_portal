const express = require('express');
const router = express.Router();
const Backup = require('../../models/backup');
const User = require('../../models/User');
const LeaveRequest = require('../../models/Leave');
const Devicelog = require('../../models/Devicelog');
const Holiday = require('../../models/holidays');
const { stringify } = require('csv-stringify/sync');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');


// Helper function to convert data to CSV
const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    return stringify(data, { header: true, columns: headers });
};

// Download backup as CSV files
router.get('/download-csv/:id', async (req, res) => {
    try {
        const backup = await Backup.findByPk(req.params.id);
        if (!backup) {
            return res.status(404).json({ error: 'Backup not found' });
        }

        // Create a zip archive
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=backup_${backup.id}_${new Date().toISOString()}.zip`);

        // Pipe the archive to the response
        archive.pipe(res);

        // Add each table's data as a CSV file
        if (backup.user_data && backup.user_data.length > 0) {
            const userCSV = convertToCSV(backup.user_data);
            archive.append(userCSV, { name: 'users.csv' });
        }

        if (backup.leave_data && backup.leave_data.length > 0) {
            const leaveCSV = convertToCSV(backup.leave_data);
            archive.append(leaveCSV, { name: 'leaves.csv' });
        }

        if (backup.devicelog_data && backup.devicelog_data.length > 0) {
            const devicelogCSV = convertToCSV(backup.devicelog_data);
            archive.append(devicelogCSV, { name: 'devicelogs.csv' });
        }

        if (backup.holiday_data && backup.holiday_data.length > 0) {
            const holidayCSV = convertToCSV(backup.holiday_data);
            archive.append(holidayCSV, { name: 'holidays.csv' });
        }

        // Finalize the archive
        archive.finalize();

    } catch (error) {
        console.error('CSV download error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate CSV files',
            details: error.message
        });
    }
});

// Create new backup
router.post('/create-backup', async (req, res) => {
    try {
        // Get all data from tables
        const users = await User.findAll({ raw: true });
        const leaves = await LeaveRequest.findAll({ raw: true });
        const devicelogs = await Devicelog.findAll({ raw: true });
        const holidays = await Holiday.findAll({ raw: true });

        // Create backup record
        const backup = await Backup.create({
            backup_name: req.body.name || `Backup_${new Date().toISOString()}`,
            user_data: users,
            leave_data: leaves,
            devicelog_data: devicelogs,
            holiday_data: holidays,
            total_records: {
                users: users.length,
                leaves: leaves.length,
                devicelogs: devicelogs.length,
                holidays: holidays.length
            }
        });

        res.status(201).json({
            success: true,
            message: 'Backup created successfully',
            backupId: backup.id
        });
    } catch (error) {
        console.error('Backup creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Backup creation failed',
            details: error.message
        });
    }
});

// Restore from backup
router.post('/restore-backup/:id', async (req, res) => {
    try {
        const backup = await Backup.findByPk(req.params.id);
        if (!backup) {
            return res.status(404).json({ error: 'Backup not found' });
        }

        // Restore data to tables
        await User.bulkCreate(backup.user_data, { updateOnDuplicate: ['id'] });
        await LeaveRequest.bulkCreate(backup.leave_data, { updateOnDuplicate: ['id'] });
        await Devicelog.bulkCreate(backup.devicelog_data, { updateOnDuplicate: ['id'] });
        await Holiday.bulkCreate(backup.holiday_data, { updateOnDuplicate: ['id'] });

        res.json({
            success: true,
            message: 'Data restored successfully',
            recordsRestored: backup.total_records
        });
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({
            success: false,
            error: 'Restore failed',
            details: error.message
        });
    }
});

// Get all backups
router.get('/backups', async (req, res) => {
    try {
        const backups = await Backup.findAll({
            attributes: ['id', 'backup_name', 'backup_date', 'total_records'],
            order: [['backup_date', 'DESC']]
        });
        res.json(backups);
    } catch (error) {
        console.error('Error fetching backups:', error);
        res.status(500).json({ error: 'Failed to fetch backups' });
    }
});

// Delete backup
router.delete('/backup/:id', async (req, res) => {
    try {
        const backup = await Backup.findByPk(req.params.id);
        if (!backup) {
            return res.status(404).json({ error: 'Backup not found' });
        }
        await backup.destroy();
        res.json({ success: true, message: 'Backup deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete backup' });
    }
});

module.exports = router;