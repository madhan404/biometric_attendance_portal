
// const express = require('express');
// const { Op } = require('sequelize');
// const User = require('../models/User');
// const Request = require('../models/Leave');
// const app = express();

// const parseUserRoles = (user) => {
//     if (typeof user.role === 'object' && user.role !== null) {
//         return user.role.roles || [];
//     }
//     if (typeof user.role === 'string') {
//         try {
//             return JSON.parse(user.role).roles || [];
//         } catch (err) {
//             console.error("Error parsing role JSON:", err);
//         }
//     }
//     return [];
// };
// app.post("/hod-staff-leavests", async (req, res) => {
//     const { sin_number } = req.body;
    
//     try {
//         // 1. Get requesting user
//         const requestingUser = await User.findOne({
//             where: { sin_number },
//             raw: true
//         });

//         if (!requestingUser) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         const roles = parseUserRoles(requestingUser);
        
//         // 2. Build query based on user role
//         let queryConditions = [];
//         let leaveRequestWhere = {};
//         let responseData = {};

//         if (roles.includes('hod')) {
//             // For HOD - get class advisors in same department
//             queryConditions = [
//                 { 
//                     [Op.or]: [
//                         { role: { [Op.regexp]: 'class_advisor|CLASS_ADVISOR|"roles":\\s*\\["class_advisor"\\]' } }
//                     ]
//                 },
//                 { department: requestingUser.department }
//             ];

//             const classAdvisors = await User.findAll({
//                 where: { [Op.and]: queryConditions },
//                 attributes: ['sin_number', 'department', 'year', 'address', 'photo', 'email', 'phone', 'student_name','college'],
//                 raw: true
//             });

//             // Get leave requests for these class advisors
//             const classAdvisorIds = classAdvisors.map(advisor => advisor.sin_number);
//             const leaveRequests = await Request.findAll({
//                 where: {
//                     sin_number: { [Op.in]: classAdvisorIds }
//                 },
//                 order: [['createdAt', 'DESC']],
//                 raw: true
//             });

//             // Create class advisor map for quick lookup
//             const classAdvisorMap = {};
//             classAdvisors.forEach(advisor => {
//                 classAdvisorMap[advisor.sin_number] = advisor;
//             });

//             responseData = {
//                 status: "success",
//                 count: leaveRequests.length,
//                 requests: leaveRequests.map(req => {
//                     const advisor = classAdvisorMap[req.sin_number] || {};
//                     const status = getApprovalStatus(req);
                    
//                     return {
//                         serial_no: req.serial_no,
//                         request_id: req.request_id,
//                         class_advisor_name: req.staff_name,
//                         sin_number: req.sin_number,
//                         department: req.department,
//                         year: req.year,
//                         photo: advisor.photo,
//                         email: advisor.email,
//                         request_type: req.request_type,
//                         reason: req.reason,
//                         reason_details: req.reason_Details,
//                         dates: {
//                             start: req.startDate,
//                             end: req.endDate,
//                             applied: req.createdAt
//                         },
//                         approvals: {
//                             hod_approval: req.hod_approval || 'pending',
//                             principal_approval: req.principal_approval || 'pending'
//                         },
//                         status: status,
//                         pdf_path: req.pdf_path ? req.pdf_path.toString("base64") : null,
//                         has_attachment: !!req.pdf_path
//                     };
//                 }),
//                 metadata: {
//                     class_advisor_count: classAdvisors.length,
//                     department: requestingUser.department,
//                     role: 'hod',
//                     filters_applied: 'Class advisors in same department with their leave requests'
//                 }
//             };

//             return res.json(responseData);
//         }
        
//         // [Rest of your original code for other roles...]
//         // Original student and leave request logic for other roles...

//     } catch (err) {
//         console.error("Endpoint error:", err);
//         res.status(500).json({ 
//             error: "Internal server error",
//             details: process.env.NODE_ENV === 'development' ? err.message : undefined
//         });
//     }
// });


// // New function to properly calculate approval status
// function getApprovalStatus(request) {
//     const approvals = [
//         request.hod_approval,
//         request.principal_approval
//     ];

//     if (approvals.some(a => a === 'rejected')) {
//         return 'Rejected';
//     }
//     if (request.hod_approval === 'approved') {
//         return 'Approved by HOD';
//     }

//     if (request.principal_approval === 'approved') {
//         return 'Approved by Principal';
//     }



//     return 'Pending HOd Advisor Approval';
// }



// app.post('/hod-staff-approve-request', async (req, res) => {
//     const { request_id, approval_status, approver_sin ,approver_name} = req.body;

//     try {
//         // Validate input
//         if (!request_id || !approval_status || !approver_sin) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         // Get requester details
//         const approver = await User.findOne({ 
//             where: { sin_number: approver_sin ,student_name:approver_name},
//             raw: true
//         });

//         if (!approver) {
//             return res.status(403).json({ error: 'Approver not found' });
//         }

//         const roles = parseUserRoles(approver);
//         // const isClassAdvisor = roles.includes('class_advisor');
//         const isHOD = roles.includes('hod');
//         const isPrincipal = roles.includes('principal');
//         // const isPlacementOfficer = roles.includes('placement_officer');

//         // Get the leave request
//         const request = await Request.findOne({ where: { request_id } });
//         if (!request) {
//             return res.status(404).json({ error: 'Leave request not found' });
//         }

//         // Verify authority over student
//         if ( isHOD) {
//             const student = await User.findOne({ 
//                 where: { sin_number: request.sin_number },
//                 raw: true
//             });

//             // if (isClassAdvisor && 
//             //     (student.department !== approver.department || student.year !== approver.year)) {
//             //     return res.status(403).json({ error: 'Not authorized for this student' });
//             // }

//             if (isHOD && student.department !== approver.department) {
//                 return res.status(403).json({ error: 'Not authorized for this department' });
//             }
//         }

//         // Process approval based on role
//         // if (isClassAdvisor) {
//         //     if (request.class_advisor_approval !== 'pending') {
//         //         return res.status(400).json({ 
//         //             error: `Request already ${request.class_advisor_approval} by class advisor` 
//         //         });
//         //     }
//         //     request.class_advisor_approval = approval_status;
//         //     request.class_advisor_approver_name = approver_name;
//         //     request.class_advisor_approver_sin = approver_sin;
//         //     request.class_advisor_approval_date = new Date();
//         // } 
//          if (isHOD) {
//             // if (request.class_advisor_approval !== 'approved') {
//             //     return res.status(400).json({ error: 'Class advisor approval required first' });
//             // }
//             if (request.hod_approval !== 'pending') {
//                 return res.status(400).json({ 
//                     error: `Request already ${request.hod_approval} by HOD` 
//                 });
//             }
//             request.hod_approval = approval_status;
//             request.hod_approver_name = approver_name;
//             request.hod_approver_sin = approver_sin;
//             request.hod_approval_date = new Date();
//         } 
//         // else if (isPlacementOfficer) {
//         //     if (request.request_type !== 'internship') {
//         //         return res.status(400).json({ error: 'Only internship requests require placement officer approval' });
//         //     }
//         //     if (request.hod_approval !== 'approved') {
//         //         return res.status(400).json({ error: 'HOD approval required first' });
//         //     }
//         //     if (request.placement_officer_approval !== 'pending') {
//         //         return res.status(400).json({ 
//         //             error: `Request already ${request.placement_officer_approval} by placement officer` 
//         //         });
//         //     }
//         //     request.placement_officer_approval = approval_status;
//         //     request.placement_officer_approver_name = approver_name;
//         //     request.placement_officer_approver_sin = approver_sin;
//         //     request.placement_officer_approval_date = new Date();
//         // } 
//         else if (isPrincipal) {
//             // if (request.request_type === 'internship') {
//             //     if (request.placement_officer_approval !== 'approved') {
//             //         return res.status(400).json({ error: 'Placement officer approval required for internships' });
//             //     }
//             // } else {
//                 if (request.hod_approval !== 'approved') {
//                     return res.status(400).json({ error: 'HOD approval required first' });
//                 }
//             // }
            
//             if (request.principal_approval !== 'pending') {
//                 return res.status(400).json({ 
//                     error: `Request already ${request.principal_approval} by principal` 
//                 });
//             }
//             request.principal_approval = approval_status;
//             request.principal_approver_name = approver_name;
//             request.principal_approver_sin = approver_sin;
//             request.principal_approval_date = new Date();
//         } 
//         else {
//             return res.status(403).json({ error: 'Not authorized to approve requests' });
//         }

//         await request.save();

//         res.json({ 
//             status: 200,
//             message: 'Approval status updated successfully',
//             // request_id: request.request_id,
//             // approver_sin,approver_name,
//             // current_status: {
//             //     class_advisor: request.class_advisor_approval,
//             //     hod: request.hod_approval,
//             //     placement_officer: request.placement_officer_approval,
//             //     principal: request.principal_approval
//             // }
//             request: { // Return full request object
//                 ...request.toJSON(),
//                 // Include formatted dates if needed

//                 // class_advisor_approval_date: request.class_advisor_approval_date?.toISOString(),
//                 principal_approval_date: request.principal_approval_date?.toISOString(),
//                 // placement_officer_approval_date: request.placement_officer_approval_date?.toISOString(),
//                 hod_approval_date: request.hod_approval_date?.toISOString(),

//                 // ... other dates
//             }
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Database error' });
//     }
// });

// module.exports = app;



const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Request = require('../models/Leave');
const app = express();

const parseUserRoles = (user) => {
    if (!user.role) {
        return [];
    }
    return user.role.split(',').map(role => role.trim());
};
app.post("/hod-staff-leavests", async (req, res) => {
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
        
        // 2. Build query based on user role
        let queryConditions = [];
        let leaveRequestWhere = {};
        let responseData = {};

        if (roles.includes('hod')) {
            // For HOD - get class advisors in same department
            queryConditions = [
                { role: 'staff' },
                { department: requestingUser.department }
            ];

            const classAdvisors = await User.findAll({
                where: { [Op.and]: queryConditions },
                attributes: ['sin_number', 'department','role', 'address', 'photo', 'email', 'phone', 'name','college'],
                raw: true
            });

            // Get leave requests for these class advisors
            const classAdvisorIds = classAdvisors.map(advisor => advisor.sin_number);
            const leaveRequests = await Request.findAll({
                where: {
                    sin_number: { [Op.in]: classAdvisorIds }
                },
                order: [['createdAt', 'DESC']],
                raw: true
            });

            // Create class advisor map for quick lookup
            const classAdvisorMap = {};
            classAdvisors.forEach(advisor => {
                classAdvisorMap[advisor.sin_number] = advisor;
            });

            responseData = {
                status: "success",
                count: leaveRequests.length,
                requests: leaveRequests.map(req => {
                    const advisor = classAdvisorMap[req.sin_number] || {};
                    const status = getApprovalStatus(req);
                    
                    return {
                        serial_no: req.serial_no,
                        request_id: req.request_id,
                        class_advisor_name: req.staff_name,
                        sin_number: req.sin_number,
                        department: req.department,
                        year: req.year,
                        photo: advisor.photo,
                        email: advisor.email,
                        phone: advisor.phone,
                        role: advisor.role,
                        request_type: req.request_type,
                        reason: req.reason,
                        reason_details: req.reason_Details,
                        time_slot: req.time_slot,
                        dates: {
                            start: req.startDate,
                            end: req.endDate,
                            applied: req.createdAt
                        },
                        approvals: {
                            hod_approval: req.hod_approval || 'pending',
                            principal_approval: req.principal_approval || 'pending'
                        },
                        status: status,
                        pdf_path: req.pdf_path ? req.pdf_path.toString("base64") : null,
                        has_attachment: !!req.pdf_path
                    };
                }),
                metadata: {
                    class_advisor_count: classAdvisors.length,
                    department: requestingUser.department,
                    role: 'hod',
                    filters_applied: 'Class advisors in same department with their leave requests'
                }
            };

            return res.json(responseData);
        }
        
        // [Rest of your original code for other roles...]
        // Original student and leave request logic for other roles...

    } catch (err) {
        console.error("Endpoint error:", err);
        res.status(500).json({ 
            error: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});


// New function to properly calculate approval status
function getApprovalStatus(request) {
    const approvals = [
        request.hod_approval,
        request.principal_approval
    ];

    if (approvals.some(a => a === 'rejected')) {
        return 'Rejected';
    }
    if (request.hod_approval === 'approved') {
        return 'Approved by HOD';
    }

    if (request.principal_approval === 'approved') {
        return 'Approved by Principal';
    }



    return 'Pending HOD Approval';
}



app.post('/hod-staff-approve-request', async (req, res) => {
    const { request_id, approval_status, approver_sin ,approver_name} = req.body;

    try {
        // Validate input
        if (!request_id || !approval_status || !approver_sin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get requester details
        const approver = await User.findOne({ 
            where: { sin_number: approver_sin ,name:approver_name},
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


