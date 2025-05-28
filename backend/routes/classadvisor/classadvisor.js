const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Leave = require('../../models/Leave');
const { Op } = require('sequelize');

// Get all students with their leave status for a class advisor
router.get('/students/:sin_number', async (req, res) => {
    try {
        const { sin_number } = req.params;
        console.log('Fetching students for class advisor:', sin_number);

        // Find all students where class_advisor matches the given sin_number
        const students = await User.findAll({
            where: {
                class_advisor: sin_number,
                role: 'student'
            },
            attributes: [
                'id', 'sin_number', 'name', 'gender', 'email', 'address',
                'year', 'department', 'college', 'dayScholar_or_hosteller',
                'phone', 'parent_phone', 'photo', 'batch', 'mentor', 'class_advisor'
            ],
            raw: true
        });

        if (!students || students.length === 0) {
            return res.json({
                status: "success",
                students: [],
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

        // Get leave requests for all students
        const studentIds = students.map(s => s.sin_number);
        const leaveRequests = await Leave.findAll({
            where: {
                sin_number: { [Op.in]: studentIds }
            },
            order: [['createdAt', 'DESC']],
            raw: true
        });

        // Calculate request counts
        const requestCounts = {
            pendingLeaveRequests: 0,
            pendingODRequests: 0,
            pendingInternshipRequests: 0,
            approvedLeaves: 0,
            rejectedLeaves: 0,
            approvedOD: 0,
            rejectedOD: 0,
            approvedInternship: 0,
            rejectedInternship: 0
        };

        leaveRequests.forEach(request => {
            // Get the request type in lowercase for consistent comparison
            const requestType = request.request_type.toLowerCase();
            // Get the class advisor approval status
            const approvalStatus = request.class_advisor_approval;

            // Count based on request type and approval status
            if (requestType === 'leave') {
                if (approvalStatus === 'pending') requestCounts.pendingLeaveRequests++;
                if (approvalStatus === 'approved') requestCounts.approvedLeaves++;
                if (approvalStatus === 'rejected') requestCounts.rejectedLeaves++;
            } else if (requestType === 'od') {
                if (approvalStatus === 'pending') requestCounts.pendingODRequests++;
                if (approvalStatus === 'approved') requestCounts.approvedOD++;
                if (approvalStatus === 'rejected') requestCounts.rejectedOD++;
            } else if (requestType === 'internship') {
                if (approvalStatus === 'pending') requestCounts.pendingInternshipRequests++;
                if (approvalStatus === 'approved') requestCounts.approvedInternship++;
                if (approvalStatus === 'rejected') requestCounts.rejectedInternship++;
            }
        });

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

        // Combine student data with their leave requests
        const studentsWithLeaves = students.map(student => ({
            ...student,
            leave_requests: leaveRequestMap[student.sin_number] || [],
            current_leave_status: getCurrentLeaveStatus(leaveRequestMap[student.sin_number] || [])
        }));

        res.json({
            status: "success",
            students: studentsWithLeaves,
            requestCounts: requestCounts,
            metadata: {
                total_students: students.length,
                total_leave_requests: leaveRequests.length
            }
        });

    } catch (error) {
        console.error('Error in class advisor route:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
});

// Approve or reject leave request
router.post('/approve-request', async (req, res) => {
    try {
        const { request_id, action, sin_number } = req.body;

        if (!request_id || !action || !sin_number) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: request_id, action, and sin_number are required'
            });
        }

        // Validate action
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be either "approve" or "reject"'
            });
        }

        // Find the leave request
        const leaveRequest = await Leave.findOne({
            where: { request_id }
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        // Check if mentor has approved
        if (leaveRequest.mentor_approval !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Cannot process request: Mentor approval is required first'
            });
        }

        // Check if the student belongs to this class advisor
        const student = await User.findOne({
            where: {
                sin_number: leaveRequest.sin_number,
                class_advisor: sin_number
            }
        });

        if (!student) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to approve/reject this request'
            });
        }

        // Update the request
        const updateData = {
            class_advisor_approval: action === 'approve' ? 'approved' : 'rejected',
            class_advisor_approval_date: new Date()
        };

        await leaveRequest.update(updateData);

        res.json({
            success: true,
            message: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
            data: {
                request_id,
                status: action === 'approve' ? 'approved' : 'rejected',
                updated_at: new Date()
            }
        });

    } catch (error) {
        console.error('Error in approve request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request',
            error: error.message
        });
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