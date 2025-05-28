const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/staff-details', async (req, res) => {
    try {
        const { class_advisor, mentor } = req.query;

        if (!class_advisor || !mentor) {
            return res.status(400).json({ 
                error: 'Both class_advisor and mentor sin_numbers are required' 
            });
        }

        const [advisorDetails, mentorDetails] = await Promise.all([
            db.query(
                'SELECT photo, name, department, email, phone FROM user WHERE sin_number = :sin_number',
                {
                    replacements: { sin_number: class_advisor },
                    type: db.QueryTypes.SELECT
                }
            ),
            db.query(
                'SELECT photo, name, department, email, phone FROM user WHERE sin_number = :sin_number',
                {
                    replacements: { sin_number: mentor },
                    type: db.QueryTypes.SELECT
                }
            )
        ]);

        const response = {
            class_advisor: advisorDetails.length ? advisorDetails[0] : null,
            mentor: mentorDetails.length ? mentorDetails[0] : null
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching advisor/mentor details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;