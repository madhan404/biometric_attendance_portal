const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Request = require('../models/Leave');
const app = express();

const parseUserRoles = (user) => {
    const roles = [];
    
    // Add base role
    if (user.role) {
        roles.push(user.role);
    }
    
    // Add positions as roles
    if (user.position_1) {
        roles.push(user.position_1);
    }
    if (user.position_2) {
        roles.push(user.position_2);
    }
    
    return roles;
};

app.post("/staffs-std-leavests", async (req, res) => {
    const { sin_number } = req.body;
    
    try {
        // 1. Get requesting user
        const requestingUser = await User.findOne({
            where: { sin_number },
            raw: true
        });

        if (!requestingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const roles = parseUserRoles(requestingUser);
       // console.log('User roles:', roles);
        
        // 2. Build query with role filtering
        const studentConditions = [{
            [Op.or]: [
                { role: 'student' }
            ]
        }];

        // Add role-specific filters
        if (roles.includes('class_advisor')) {
            studentConditions.push(
                { department: requestingUser.department },
                { year: requestingUser.year }
            );
        }
        
        if (roles.includes('mentor')) {
            studentConditions.push(
                { mentor: requestingUser.sin_number }
            );
        }

        if (roles.includes('hod')) {
            studentConditions.push(
                { department: requestingUser.department }
            );
        } else if (roles.includes('principal')) {
            studentConditions.push(
                { college: requestingUser.college }
            );
        } else if (roles.includes('placement_officer')) {
            studentConditions.push(
                { college: requestingUser.college }
            );
        }

        // 3. Find students
        const students = await User.findAll({
            where: { [Op.and]: studentConditions },
            attributes: ['sin_number', 'name', 'department', 'year', 'address', 'photo', 'email', 
                        'dayScholar_or_hosteller', 'phone', 'parent_phone', 'class_advisor', 'mentor'],
            raw: true
        });

        // 4. Get leave requests with filtering
        const studentIds = students.map(s => s.sin_number);
        const leaveRequestWhere = {
            sin_number: { [Op.in]: studentIds }
        };

        if (roles.includes('placement_officer')) {
            leaveRequestWhere.request_type = 'internship';
        }

        const leaveRequests = await Request.findAll({
            where: leaveRequestWhere,
            order: [['createdAt', 'DESC']],
            raw: true
        });

        // 5. Create student map for quick lookup
        const studentMap = {};
        students.forEach(student => {
            studentMap[student.sin_number] = student;
        });

        // 6. Format response
        const response = {
            status: "success",
            count: leaveRequests.length,
            requests: leaveRequests.map(req => {
                const student = studentMap[req.sin_number] || {};
                const status = getApprovalStatus(req);
                
                return {
                    serial_no: req.serial_no,
                    request_id: req.request_id,
                    student_name: req.student_name,
                    sin_number: req.sin_number,
                    department: req.department,
                    year: req.year,
                    photo: student.photo,
                    email: student.email,
                    phone: student.phone,
                    parent_phone: student.parent_phone,
                    class_advisor: student.class_advisor,
                    mentor: student.mentor,
                    dayScholar_or_hosteller: student.dayScholar_or_hosteller,
                    address: student.address,
                    request_type: req.request_type,
                    reason: req.reason,
                    reason_details: req.reason_Details,
                    dates: {
                        start: req.startDate,
                        end: req.endDate,
                        applied: req.createdAt
                    },
                    approvals: {
                        mentor_approval: req.mentor_approval || 'pending',
                        class_advisor_approval: req.class_advisor_approval || 'pending',
                        hod_approval: req.hod_approval || 'pending',
                        principal_approval: req.principal_approval || 'pending',
                        placement_officer_approval: req.placement_officer_approval || 'pending'
                    },
                    status: status,
                    pdf_path: req.pdf_path ? req.pdf_path.toString("base64") : null,
                    has_attachment: !!req.pdf_path
                };
            }),
            metadata: {
                student_count: students.length,
                department: requestingUser.department,
                year: requestingUser.year,
                role: roles.join(', '),
                is_mentor: roles.includes('mentor'),
                is_class_advisor: roles.includes('class_advisor'),
                filters_applied: roles.includes('placement_officer') ? 
                    'Only internship requests' : 'All request types'
            }
        };

        res.json(response);

    } catch (err) {
        console.error("Endpoint error:", err);
        res.status(500).json({ 
            error: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Function to calculate approval status
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

module.exports = app;