const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const ActiveToday = require('../../models/active_today');
const moment = require('moment');
const { Op } = require('sequelize');
const sequelize = require('../../config/db');

router.get('/admin-dashboard', async (req, res) => {
    try {
        // Get total students count - using Sequelize count method
        const totalUserscount = await User.count();

        const totalStudents = await User.count({ 
            where: { role: 'student' }
        });

        // Get total staff members count (including all staff roles)
        const totalStaff = await User.count({
            where: {
                role: ['staff', 'hodstaff', 'principal', 'placement_officer', 'hod']
            }
        });

        // Get total administrators count
        const totalAdmins = await User.count({ 
            where: { role: 'admin' }
        });

        // Get active users today
        const today = moment().startOf('day');
        const activeToday = await ActiveToday.findAll({
            where: {
                createdAt: {
                    [Op.gte]: today.toDate(),
                    [Op.lte]: moment(today).endOf('day').toDate()
                }
            },
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('sin_number')), 'sin_number']]
        });

        // Get monthly user activity for current year
        const currentYear = moment().year();
        // Update the monthly activity query to use the correct alias
        // Update the monthly activity query to specify the table for sin_number
        // Update the monthly activity query to handle GROUP BY properly
        const monthlyActivity = await ActiveToday.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('active_today.sin_number'))), 'count'],
                [sequelize.literal(`CASE 
                    WHEN user.role = 'student' THEN 'student'
                    WHEN user.role IN ('staff', 'hodstaff', 'hod', 'placement_officer', 'principal') THEN 'staff'
                    ELSE user.role
                END`), 'role']
            ],
            include: [{
                model: User,
                required: false,
                attributes: [],
                as: 'user'
            }],
            where: {
                createdAt: {
                    [Op.gte]: moment().startOf('year').toDate(),
                    [Op.lte]: moment().endOf('year').toDate()
                }
            },
            group: [
                sequelize.fn('MONTH', sequelize.col('createdAt')),
                sequelize.literal(`CASE 
                    WHEN user.role = 'student' THEN 'student'
                    WHEN user.role IN ('staff', 'hodstaff', 'hod', 'placement_officer', 'principal') THEN 'staff'
                    ELSE user.role
                END`)
            ],
            order: [[sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']]
        });

        // Calculate user distribution percentages
        const totalUsers = await User.count();
        const userDistribution = {
            students: (totalStudents / totalUsers * 100).toFixed(2),
            staff: (totalStaff / totalUsers * 100).toFixed(2)
        };

        res.json({
            totalUserscount,
            totalStudents,
            totalStaff,
            activeToday: activeToday.length,
            totalAdmins,
            monthlyActivity,
            userDistribution
        });

    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
