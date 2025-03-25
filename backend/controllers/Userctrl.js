const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


 exports.getUserRoleData = async (req, res) => {
      const { role } = req.user;
    
      try {
        const users = await User.findAll({
          where: {
            role: {
              [Sequelize.Op.contains]: { roles: [role] },
            },
          },
        });
    
        res.json({ users });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    };
     


    