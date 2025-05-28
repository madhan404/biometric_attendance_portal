const express = require('express');
const router = express.Router();
const LeaveRequest = require('../../models/Leave');
const User = require('../../models/User');
const { Op } = require('sequelize');

// Get all leave requests with optional date filter and search
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, search } = req.query;
        const whereClause = {};

        // Add date range filter if provided
        if (startDate && endDate) {
            whereClause.startDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Add search functionality
        if (search) {
            whereClause[Op.or] = [
                { student_name: { [Op.like]: `%${search}%` } },
                { staff_name: { [Op.like]: `%${search}%` } },
                { hod_name: { [Op.like]: `%${search}%` } },
                { department: { [Op.like]: `%${search}%` } },
                { request_type: { [Op.like]: `%${search}%` } },
                { reason: { [Op.like]: `%${search}%` } },
                { reason_Details: { [Op.like]: `%${search}%` } },
                { sin_number: { [Op.like]: `%${search}%` } },
                { request_id: { [Op.like]: `%${search}%` } }
            ];
        }

        const leaveRequests = await LeaveRequest.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['photo'],
                required: false
            }]
        });
        
        // Format the response to include photo
        const formattedRequests = leaveRequests.map(request => {
            const requestData = request.get({ plain: true });
            return {
                ...requestData,
                photo: requestData.user?.photo || null
            };
        });
        
        res.status(200).json({
            success: true,
            data: formattedRequests
        });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave requests',
            error: error.message
        });
    }
});

// Get single leave request by ID
router.get('/:request_id', async (req, res) => {
    try {
        const { request_id } = req.params;
        
        const leaveRequest = await LeaveRequest.findOne({
            where: { request_id: request_id },
            include: [{
                model: User,
                as: 'user',
                attributes: ['photo'],
                required: false
            }]
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        const requestData = leaveRequest.get({ plain: true });
        const formattedRequest = {
            ...requestData,
            photo: requestData.user?.photo || null
        };

        res.status(200).json({
            success: true,
            data: formattedRequest
        });
    } catch (error) {
        console.error('Error fetching leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave request',
            error: error.message
        });
    }
});

// Update leave request
router.put('/:request_id', async (req, res) => {
    try {
        const { request_id } = req.params;
        const updateData = req.body;
        
        console.log('Updating leave request:', { request_id, updateData }); // Debug log
        
        const leaveRequest = await LeaveRequest.findOne({
            where: { request_id: request_id }
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        await leaveRequest.update(updateData);
        
        // Fetch the updated record
        const updatedRequest = await LeaveRequest.findOne({
            where: { request_id: request_id }
        });
        
        res.status(200).json({
            success: true,
            message: 'Leave request updated successfully',
            data: updatedRequest
        });
    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating leave request',
            error: error.message
        });
    }
});

// Delete leave request
router.delete('/:request_id', async (req, res) => {
    try {
        const { request_id } = req.params;
        
        const leaveRequest = await LeaveRequest.findOne({
            where: { request_id: request_id }
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        await leaveRequest.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Leave request deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting leave request',
            error: error.message
        });
    }
});

module.exports = router;
