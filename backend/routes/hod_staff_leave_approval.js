const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Request = require('../models/Leave');
const app = express();

const parseUserRoles = (user) => {
    if (typeof user.role === 'object' && user.role !== null) {
        return user.role.roles || [];
    }
    if (typeof user.role === 'string') {
        try {
            return JSON.parse(user.role).roles || [];
        } catch (err) {
            console.error("Error parsing role JSON:", err);
        }
    }
    return [];
};

app.post('/hod-staff-approve-request', async (req, res) => {
    const { request_id, approval_status, approver_sin ,approver_name} = req.body;

    try {
        // Validate input
        if (!request_id || !approval_status || !approver_sin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get requester details
        const approver = await User.findOne({ 
            where: { sin_number: approver_sin ,student_name:approver_name},
            raw: true
        });

        if (!approver) {
            return res.status(403).json({ error: 'Approver not found' });
        }

        const roles = parseUserRoles(approver);
        // const isClassAdvisor = roles.includes('class_advisor');
        const isHOD = roles.includes('hod');
        const isPrincipal = roles.includes('principal');
        // const isPlacementOfficer = roles.includes('placement_officer');

        // Get the leave request
        const request = await Request.findOne({ where: { request_id } });
        if (!request) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        // Verify authority over student
        if ( isHOD) {
            const student = await User.findOne({ 
                where: { sin_number: request.sin_number },
                raw: true
            });

            // if (isClassAdvisor && 
            //     (student.department !== approver.department || student.year !== approver.year)) {
            //     return res.status(403).json({ error: 'Not authorized for this student' });
            // }

            if (isHOD && student.department !== approver.department) {
                return res.status(403).json({ error: 'Not authorized for this department' });
            }
        }

        // Process approval based on role
        // if (isClassAdvisor) {
        //     if (request.class_advisor_approval !== 'pending') {
        //         return res.status(400).json({ 
        //             error: `Request already ${request.class_advisor_approval} by class advisor` 
        //         });
        //     }
        //     request.class_advisor_approval = approval_status;
        //     request.class_advisor_approver_name = approver_name;
        //     request.class_advisor_approver_sin = approver_sin;
        //     request.class_advisor_approval_date = new Date();
        // } 
         if (isHOD) {
            // if (request.class_advisor_approval !== 'approved') {
            //     return res.status(400).json({ error: 'Class advisor approval required first' });
            // }
            if (request.hod_approval !== 'pending') {
                return res.status(400).json({ 
                    error: `Request already ${request.hod_approval} by HOD` 
                });
            }
            request.hod_approval = approval_status;
            request.hod_approver_name = approver_name;
            request.hod_approver_sin = approver_sin;
            request.hod_approval_date = new Date();
        } 
        // else if (isPlacementOfficer) {
        //     if (request.request_type !== 'internship') {
        //         return res.status(400).json({ error: 'Only internship requests require placement officer approval' });
        //     }
        //     if (request.hod_approval !== 'approved') {
        //         return res.status(400).json({ error: 'HOD approval required first' });
        //     }
        //     if (request.placement_officer_approval !== 'pending') {
        //         return res.status(400).json({ 
        //             error: `Request already ${request.placement_officer_approval} by placement officer` 
        //         });
        //     }
        //     request.placement_officer_approval = approval_status;
        //     request.placement_officer_approver_name = approver_name;
        //     request.placement_officer_approver_sin = approver_sin;
        //     request.placement_officer_approval_date = new Date();
        // } 
        else if (isPrincipal) {
            // if (request.request_type === 'internship') {
            //     if (request.placement_officer_approval !== 'approved') {
            //         return res.status(400).json({ error: 'Placement officer approval required for internships' });
            //     }
            // } else {
                if (request.hod_approval !== 'approved') {
                    return res.status(400).json({ error: 'HOD approval required first' });
                }
            // }
            
            if (request.principal_approval !== 'pending') {
                return res.status(400).json({ 
                    error: `Request already ${request.principal_approval} by principal` 
                });
            }
            request.principal_approval = approval_status;
            request.principal_approver_name = approver_name;
            request.principal_approver_sin = approver_sin;
            request.principal_approval_date = new Date();
        } 
        else {
            return res.status(403).json({ error: 'Not authorized to approve requests' });
        }

        await request.save();

        res.json({ 
            status: 200,
            message: 'Approval status updated successfully',
            // request_id: request.request_id,
            // approver_sin,approver_name,
            // current_status: {
            //     class_advisor: request.class_advisor_approval,
            //     hod: request.hod_approval,
            //     placement_officer: request.placement_officer_approval,
            //     principal: request.principal_approval
            // }
            request: { // Return full request object
                ...request.toJSON(),
                // Include formatted dates if needed

                // class_advisor_approval_date: request.class_advisor_approval_date?.toISOString(),
                principal_approval_date: request.principal_approval_date?.toISOString(),
                // placement_officer_approval_date: request.placement_officer_approval_date?.toISOString(),
                hod_approval_date: request.hod_approval_date?.toISOString(),

                // ... other dates
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});
module.exports = app;
