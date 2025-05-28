const express = require('express');
const router = express.Router();
const Holiday = require('../../models/holidays');
const { Op } = require('sequelize');

// Get all holidays for the current year
router.get('/holidays', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const holidays = await Holiday.findAll({
            where: {
                date: {
                    [Op.gte]: `${currentYear}-01-01`,
                    [Op.lte]: `${currentYear}-12-31`
                }
            },
            order: [['date', 'ASC']]
        });

        res.json({
            status: "success",
            holidays: holidays
        });
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({
            status: "error",
            error: "Failed to fetch holidays"
        });
    }
});

module.exports = router; 