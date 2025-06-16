const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Request = require('../models/Leave');
const app = express();

app.post('/principal-staff-approve-request', async (req, res) => {
    const { request_id, approval_status, approver_sin, approver_name } = req.body;

    try {
        // Validate input
        if (!request_id || !approval_status || !approver_sin || !approver_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify the approver is a principal
        const principal = await User.findOne({ 
            where: { sin_number: approver_sin, name: approver_name },
            raw: true
        });

        if (!principal) {
            return res.status(403).json({ error: 'Principal not found' });
        }

        if (principal.role !== 'principal') {
            return res.status(403).json({ error: 'Only principals can use this endpoint' });
        }

        // Get the leave request
        const request = await Request.findOne({ where: { request_id } });
        if (!request) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        // Check HOD approval status
        if (request.hod_approval !== 'approved') {
            return res.status(400).json({ 
                error: 'HOD approval required before principal approval',
                current_status: {
                    hod_approval: request.hod_approval || 'pending'
                }
            });
        }

        // Check if principal already approved/rejected
        if (request.principal_approval !== 'pending') {
            return res.status(400).json({ 
                error: `Request already ${request.principal_approval} by principal`,
                current_status: {
                    principal_approval: request.principal_approval
                }
            });
        }

        // Update principal approval
        request.principal_approval = approval_status;
        request.principal_approver_name = approver_name;
        request.principal_approver_sin = approver_sin;
        request.principal_approval_date = new Date();

        await request.save();

        res.json({ 
            status: 200,
            message: 'Principal approval status updated successfully',
            request: {
                ...request.toJSON(),
                principal_approval_date: request.principal_approval_date?.toISOString(),
                hod_approval_date: request.hod_approval_date?.toISOString()
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            error: 'Database error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports=app;