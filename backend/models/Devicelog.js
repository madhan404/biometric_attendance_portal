


// 7 naal attendance + monthly attendance

const {DataTypes} = require("sequelize");
const Sequelize = require("../config/db");
const att = Sequelize.define(
    "devicelogs_8_2024",
    {
        DeviceLogid:{
            type:DataTypes.MEDIUMINT,
            allowNull:true,
            primaryKey:true
        },
        DownloadDate:{
            type:DataTypes.STRING(22),
            allowNull:true,
        },
        DeviceId:{
            type:DataTypes.TINYINT,
            allowNull:true
        },
        UserId:{
            type:DataTypes.MEDIUMINT,
            allowNull:false,
        },
        LogDate:{
            type:DataTypes.STRING(56),
            allowNull:true,
        },
        Direction:{
            type:DataTypes.STRING(0),
            allowNull:true
        },
        AttDirection:{
            type:DataTypes.STRING(0),
            allowNull:true
        },
        // LOG STATUS
        C1:{ 
            type:DataTypes.STRING(4),
            allowNull:true,
        },
        C2:{
            type:DataTypes.STRING(3),
            allowNull:true
        },
        C3:{
            type:DataTypes.STRING(4),
            allowNull:true
        },
        C4:{
            type:DataTypes.STRING(4),
            allowNullll:true
        },
        C5:{
            type:DataTypes.STRING(4),
            allowNull:true
        },
        C6:{
            type:DataTypes.STRING(4),
            allowNull:true
        },
        C7:{
            type:DataTypes.STRING,
            allowNull:true
        },
        WorkCode:{
            type:DataTypes.STRING(2),
            allowNull:true

        },
        UpdateFlag:{
            type:DataTypes.TINYINT,
            allowNull:true
        },
        EmployeeImage:{
            type:DataTypes.TINYINT,
            allowNull:true
        },
        FileName:{
            type:DataTypes.STRING(3),
            allowNull:true
        },
        Longitude:{
            type:DataTypes.STRING(4),
            allowNull:true
        },
        IsApproved:{
            type:DataTypes.STRING(7),
            allowNull:true
        },
        CreatedDate:{
            type:DataTypes.STRING(232),
            allowNull:true
        },
        LastModifiedDate:{
            type:DataTypes.STRING(34),
            allowNull:true
        },
        BodyTemperature:{
            type:DataTypes.DECIMAL(2,1),
            allowNull:false
        },
        IsMaskOn:{
            type:DataTypes.STRING(2),
            allowNull:true
        },
        HrappSync:{
            type:DataTypes.STRING(3),
            allowNull:true
        },
        FailureReason:{
            type:DataTypes.STRING(2),
            allowNull:true
        },

    },
    {
        tableName:"devicelogs_8_2024",
        timestamps:false

    }
);

module.exports= att;