const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Leave = require('../../models/Leave');
const { Op } = require('sequelize');

// Get all mentees with their leave status and request counts
router.get('/mentees/:sin_number', async (req, res) => {
    try {
        const { sin_number } = req.params;
        console.log('Fetching mentees for mentor:', sin_number);

        // Find all students where this sin_number is their mentor
        const mentees = await User.findAll({
            where: {
                mentor: sin_number,
                role: 'student',
                is_deleted: 0
            },
            attributes: [
                'id', 'sin_number', 'name', 'gender', 'email', 'address',
                'year', 'department', 'college', 'dayScholar_or_hosteller',
                'phone', 'parent_phone', 'photo', 'batch', 'mentor'
            ],
            raw: true
        });

        if (!mentees || mentees.length === 0) {
            return res.json({
                status: "success",
                mentees: [],
                requestCounts: {
                    pendingLeaveRequests: 0,
                    pendingODRequests: 0,
                    pendingInternshipRequests: 0,
                    approvedLeaves: 0,
                    rejectedLeaves: 0,
                    approvedOD: 0,
                    rejectedOD: 0,
                    approvedInternship: 0,
                    rejectedInternship: 0
                }
            });
        }

        // Get leave requests for all mentees
        const menteeIds = mentees.map(m => m.sin_number);
        const leaveRequests = await Leave.findAll({
            where: {
                sin_number: { [Op.in]: menteeIds }
            },
            order: [['createdAt', 'DESC']],
            raw: true
        });

        // Calculate request counts based on mentor_approval
        const requestCounts = {
            pendingLeaveRequests: leaveRequests.filter(req => 
                req.request_type === 'leave' && req.mentor_approval === 'pending'
            ).length,
            pendingODRequests: leaveRequests.filter(req => 
                req.request_type === 'od' && req.mentor_approval === 'pending'
            ).length,
            pendingInternshipRequests: leaveRequests.filter(req => 
                req.request_type === 'internship' && req.mentor_approval === 'pending'
            ).length,
            approvedLeaves: leaveRequests.filter(req => 
                req.request_type === 'leave' && req.mentor_approval === 'approved'
            ).length,
            rejectedLeaves: leaveRequests.filter(req => 
                req.request_type === 'leave' && req.mentor_approval === 'rejected'
            ).length,
            approvedOD: leaveRequests.filter(req => 
                req.request_type === 'od' && req.mentor_approval === 'approved'
            ).length,
            rejectedOD: leaveRequests.filter(req => 
                req.request_type === 'od' && req.mentor_approval === 'rejected'
            ).length,
            approvedInternship: leaveRequests.filter(req => 
                req.request_type === 'internship' && req.mentor_approval === 'approved'
            ).length,
            rejectedInternship: leaveRequests.filter(req => 
                req.request_type === 'internship' && req.mentor_approval === 'rejected'
            ).length
        };

        // Create a map of leave requests by student
        const leaveRequestMap = {};
        leaveRequests.forEach(request => {
            if (!leaveRequestMap[request.sin_number]) {
                leaveRequestMap[request.sin_number] = [];
            }
            leaveRequestMap[request.sin_number].push({
                request_id: request.request_id,
                request_type: request.request_type,
                reason: request.reason,
                reason_details: request.reason_Details,
                dates: {
                    start: request.startDate,
                    end: request.endDate,
                    applied: request.createdAt
                },
                approvals: {
                    mentor_approval: request.mentor_approval || 'pending',
                    class_advisor_approval: request.class_advisor_approval || 'pending',
                    hod_approval: request.hod_approval || 'pending',
                    principal_approval: request.principal_approval || 'pending',
                    placement_officer_approval: request.placement_officer_approval || 'pending'
                },
                status: getApprovalStatus(request),
                pdf_path: request.pdf_path ? request.pdf_path.toString("base64") : null,
                has_attachment: !!request.pdf_path
            });
        });

        // Combine mentee data with their leave requests
        const menteesWithLeaves = mentees.map(mentee => ({
            ...mentee,
            leave_requests: leaveRequestMap[mentee.sin_number] || [],
            current_leave_status: getCurrentLeaveStatus(leaveRequestMap[mentee.sin_number] || [])
            }));

            res.json({
                status: "success",
            mentees: menteesWithLeaves,
            requestCounts,
            metadata: {
                total_mentees: mentees.length,
                total_leave_requests: leaveRequests.length
            }
        });

    } catch (error) {
        console.error('Error in mentor route:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
});

// Add new endpoint for mentor approvals
router.post('/approve-request', async (req, res) => {
    const { request_id, approval_status, approver_sin, approver_name } = req.body;

    try {
        // Validate input
        if (!request_id || !approval_status || !approver_sin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get mentor details
        const mentor = await User.findOne({ 
            where: { 
                sin_number: approver_sin,
                position_1: 'mentor'  // Check if user is a mentor
            },
            raw: true
        });

        if (!mentor) {
            return res.status(403).json({ error: 'Mentor not found' });
        }

        // Get the leave request
        const request = await Leave.findOne({ where: { request_id } });
        if (!request) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        // Verify if the student is under this mentor
        const student = await User.findOne({ 
            where: { 
                sin_number: request.sin_number,
                mentor: approver_sin  // Check if student is assigned to this mentor
            },
            raw: true
        });

        if (!student) {
            return res.status(403).json({ error: 'Not authorized for this student' });
        }

        // Check if request is already approved/rejected by mentor
        if (request.mentor_approval !== 'pending') {
            return res.status(400).json({ 
                error: `Request already ${request.mentor_approval} by mentor` 
            });
        }

        // Update mentor approval
        request.mentor_approval = approval_status;
        request.mentor_approver_name = approver_name;
        request.mentor_approver_sin = approver_sin;
        request.mentor_approval_date = new Date();

        await request.save();

        res.json({ 
            status: 200,
            message: 'Mentor approval status updated successfully',
            request: {
                ...request.toJSON(),
                mentor_approval_date: request.mentor_approval_date?.toISOString(),
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Helper function to get approval status
function getApprovalStatus(request) {
    const approvals = [
        request.class_advisor_approval,
        request.hod_approval,
        request.placement_officer_approval,
        request.principal_approval
    ];

    if (approvals.some(a => a === 'rejected')) {
        return 'Rejected';
    }

    if (request.principal_approval === 'approved') {
        return 'Approved by Principal';
    }
    if (request.placement_officer_approval === 'approved') {
        return 'Approved by Placement Officer';
    }
    if (request.hod_approval === 'approved') {
        return 'Approved by HOD';
    }
    if (request.class_advisor_approval === 'approved') {
        return 'Approved by Class Advisor';
    }

    return 'Pending Class Advisor Approval';
}

// Helper function to get current leave status
function getCurrentLeaveStatus(leaveRequests) {
    if (!leaveRequests || leaveRequests.length === 0) {
        return 'No active leaves';
    }

    const now = new Date();
    const activeRequest = leaveRequests.find(request => {
        const startDate = new Date(request.dates.start);
        const endDate = new Date(request.dates.end);
        return startDate <= now && endDate >= now && request.status !== 'Rejected';
    });

    if (activeRequest) {
        return `On ${activeRequest.request_type} until ${new Date(activeRequest.dates.end).toLocaleDateString()}`;
    }

    return 'No active leaves';
}

module.exports = router; 