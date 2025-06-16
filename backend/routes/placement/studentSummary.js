const express = require('express');
const { Op } = require('sequelize');
const User = require('../../models/User');
const app = express();

app.post("/student-summary", async (req, res) => {
    const { college } = req.body;
    
    try {
        if (!college) {
            return res.status(400).json({ 
                status: "error",
                message: "College name is required" 
            });
        }

        // Find all students in the specified college
        const students = await User.findAll({
            where: {
                role: 'student',
                college: college
            },
            attributes: [
                'name',
                'sin_number',
                'year',
                'department',
                'email',
                'phone'
            ],
            raw: true
        });

        // Group students by department and year
        const departmentWise = {};
        let totalStudents = 0;

        students.forEach(student => {
            // Initialize department if not exists
            if (!departmentWise[student.department]) {
                departmentWise[student.department] = {
                    total: 0,
                    year_wise: {
                        "1": { count: 0, students: [] },
                        "2": { count: 0, students: [] },
                        "3": { count: 0, students: [] },
                        "4": { count: 0, students: [] }
                    }
                };
            }

            // Add student to department total
            departmentWise[student.department].total++;

            // Add student to year-wise count and list
            const year = student.year;
            if (departmentWise[student.department].year_wise[year]) {
                departmentWise[student.department].year_wise[year].count++;
                departmentWise[student.department].year_wise[year].students.push({
                    name: student.name,
                    sin_number: student.sin_number,
                    year: student.year,
                    department: student.department,
                    email: student.email,
                    phone: student.phone
                });
            }

            totalStudents++;
        });

        // Prepare response
        const response = {
            status: "success",
            total_students: totalStudents,
            department_wise: departmentWise
        };

        res.json(response);

    } catch (err) {
        console.error("Student summary endpoint error:", err);
        res.status(500).json({ 
            status: "error",
            message: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = app; 