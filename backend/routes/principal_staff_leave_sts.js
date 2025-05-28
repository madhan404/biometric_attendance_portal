const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Request = require('../models/Leave');
const app = express();

const parseUserRoles = (user) => {
    // If role is a string, return it directly in an array
    if (typeof user.role === 'string') {
        return [user.role];
    }
    // Fallback for any other cases
    return [];
};

app.post("/principal-staff-leavests", async (req, res) => {
    const { sin_number } = req.body;
    
    try {
        // 1. Verify requesting user is a principal
        const principal = await User.findOne({
            where: { sin_number },
            raw: true
        });

        if (!principal) {
            return res.status(404).json({ error: "User not found" });
        }

        const roles = parseUserRoles(principal);
        
        if (!roles.includes('principal')) {
            return res.status(403).json({ error: "Access denied. Principal role required" });
        }

        // 2. Find all HODs and Class Advisors in the same college
        const staffMembers = await User.findAll({
            where: { 
                [Op.and]: [
                    { 
                        [Op.or]: [
                            { role: 'staff' }  // Simplified to match exact string
                        ]
                    },
                    { college: principal.college }
                ]
            },
            attributes: ['sin_number', 'name', 'department','phone', 'photo', 'email', 'role'],
            raw: true
        });

        // 3. Get leave requests for these staff members
        const staffIds = staffMembers.map(staff => staff.sin_number);
        const leaveRequests = await Request.findAll({
            where: {
                sin_number: { [Op.in]: staffIds }
            },
            order: [['createdAt', 'DESC']],
            raw: true
        });

        // 4. Organize data for response
        const staffMap = {};
        staffMembers.forEach(staff => {
            staffMap[staff.sin_number] = {
                ...staff,
                role_type: staff.role === 'hodstaff' ? 'hodstaff' : 'staff'  // Direct role comparison
            };
        });

        // 5. Format response
        const response = {
            status: "success",
            college: principal.college,
            staff_count: staffMembers.length,
            leave_requests_count: leaveRequests.length,
            staff_leave_requests: leaveRequests.map(request => {
                const staff = staffMap[request.sin_number] || {};
                // const isHod = staff.role_type === 'hod';
                
                return {
                    request_id: request.request_id,
                    staff_info: {
                        sin_number: staff.sin_number,
                        name:  request.staff_name,
                        pdf_path: request.pdf_path, // Use correct name field
                        role: staff.role,
                        department: staff.department,
                        email: staff.email,
                        photo: staff.photo,
                        phone: staff.phone
                    },
                    leave_details: {
                        type: request.request_type,
                        reason: request.reason,
                        details: request.reason_Details,
                        start_date: request.startDate,
                        end_date: request.endDate,
                        time_slot: request.time_slot,
                        applied_on: request.createdAt
                    },
                    approval_status: {
                        class_advisor: request.class_advisor_approval || 'pending',
                        hod: request.hod_approval || 'pending',
                        principal: request.principal_approval || 'pending',
                        placement: request.placement_officer_approval || 'pending',
                        overall_status: getOverallStatus(request)
                    },
                    attachments: {
                        has_pdf: !!request.pdf_path,
                        pdf_path: request.pdf_path ? request.pdf_path.toString("base64") : null
                    }
                };
            }),
            metadata: {
                generated_at: new Date().toISOString(),
                filters: {
                    college: principal.college,
                    roles_included: ['hod', 'staff']
                }
            }
        };

        res.json(response);

    } catch (err) {
        console.error("Principal endpoint error:", err);
        res.status(500).json({ 
            error: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Helper function to determine overall status
function getOverallStatus(request) {
    if (request.principal_approval === 'approved') return 'Approved by Principal';
    if (request.hod_approval === 'approved') return 'Approved by HOD (Pending Principal)';
    if (request.class_advisor_approval === 'approved') return 'Approved by Class Advisor (Pending HOD)';
    if ([request.class_advisor_approval, request.hod_approval, request.principal_approval].includes('rejected')) {
        return 'Rejected';
    }
    return 'Pending Approval';
}

module.exports = app;
