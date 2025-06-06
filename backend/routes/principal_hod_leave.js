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

app.post("/principal-hod-leavests", async (req, res) => {
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
                            { role: 'hodstaff' }  // Simplified to match exact string
                        ]
                    },
                    { college: principal.college }
                ]
            },
            attributes: ['sin_number', 'name','phone', 'department', 'year', 'photo', 'email', 'role'],
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
                role_type: staff.role === 'hodstaff' ? 'hodstaff' : 'class_advisor'
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
                const isHod = staff.role_type === 'hodstaff';
                
                return {
                    request_id: request.request_id,
                    staff_info: {
                        sin_number: staff.sin_number,
                        name: isHod ? request.hod_name : request.staff_name, // Use correct name field
                        role: isHod ? 'hodstaff' : 'STAFF',
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
                       
                        principal: request.principal_approval || 'pending',
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
                    roles_included: ['hodstaff']
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
 
    return 'Pending Approval';
}

app.post('/principal-hod-approve-request', async (req, res) => {
    const { request_id, approval_status, approver_sin ,approver_name} = req.body;

    try {
        // Validate input
        if (!request_id || !approval_status || !approver_sin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get requester details
        const approver = await User.findOne({ 
            where: { sin_number: approver_sin, name: approver_name },
            raw: true
        });

        if (!approver) {
            return res.status(403).json({ error: 'Approver not found' });
        }

        const roles = parseUserRoles(approver);
        const isPrincipal = roles.includes('principal');

        // Get the leave request
        const request = await Request.findOne({ where: { request_id } });
        if (!request) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        // Verify authority over student
        if (isPrincipal) {
            const student = await User.findOne({ 
                where: { sin_number: request.sin_number },
                raw: true
            });

            if (isPrincipal && student.college !== approver.college) {
                return res.status(403).json({ error: 'Not authorized for this department' });
            }
        }

        // Process approval based on role
        if (isPrincipal) {            
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
            request: {
                ...request.toJSON(),
                principal_approval_date: request.principal_approval_date?.toISOString(),
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = app;
