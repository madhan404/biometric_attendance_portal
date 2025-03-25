const express = require('express');
const Request = require('../models/Leave');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sequelize = require('../config/db');
sequelize.sync()
    .then(() => console.log('Database synced'))
    .catch((err) => console.log('Error syncing database:', err));


    
app.post("/staff-leave-sts",async (req,res)=>{
    const {sin_number,staff_name,
        hod_approval,principal_approval}=req.body;
    try{
        const sts = await Request.findOne({
            where:{sin_number}
        });
        if (!sts) {
            return res.status(404).json({ error: "No record found for the given SIN number." });
        }
        
        const responseData ={
            status:200,
            message:'leave sts data got for staff  ',
            staff_name:sts.staff_name,
            hod_approval:sts.hod_approval,
            principal_approval:sts.principal_approval
        }
        res.json(responseData);
    }catch(err){
        res.status(500).json({error:"db error"})
        console.log(err);
    }
})


app.post('/hod-leave-sts',async(req,res)=>{
    const {sin_number,hod_name,principal_approval}=req.body;
    try{
        const sts = await Request.findOne({
            where:{sin_number}
        });
        if (!sts) {
            return res.status(404).json({ error: "No record found for the given SIN number." });
        }        

        const resposedatd={
            status:200,
            sin_number:sts.sin_number,
            hod_name:sts.hod_name,
            principal_approval:sts.principal_approval
        }
        res.json(resposedatd);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"db errror"})
        
    }
})

module.exports = app;