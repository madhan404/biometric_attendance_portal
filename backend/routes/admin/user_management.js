const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const deleted_user = require('../../models/DeletedUser');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');                       
const csv = require('csv-parser');
const fs = require('fs');
const stream = require('stream');
const DeletedUser = require('../../models/DeletedUser');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept both CSV and image files
    if (file.mimetype === 'text/csv' || 
        file.originalname.endsWith('.csv') ||
        file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload a CSV or image file'));
    }
  }
});

// Get all users
router.get('/get-users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'sin_number',
        'name',
        'gender',
        'email',
        'address',
        'class_advisor',
        'mentor',
        'year',
        'department',
        'college',
        'dayScholar_or_hosteller',
        'quota',
        'role',
        'position_1',
        'position_2',
        'is_deleted',
        'deleted_at',
        'phone',
        'parent_phone',
        'photo',
        'batch'
      ],
      where: {
        is_deleted: false // Only get active users by default
      }
    });

    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching users',
      details: error.message
    });
  }
});

// 1. Create User with photo upload and password hashing
router.post('/create-user', upload.single('photo'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userData = req.body;
    const photo = req.file ? req.file.buffer.toString('base64') : null;

    // Validate required fields
    if (!userData.sin_number || !userData.name || !userData.email || !userData.password) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { sin_number: userData.sin_number },
          { email: userData.email }
        ]
      },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    // Create new user with photo
    const newUser = await User.create({
      ...userData,
      photo
    }, { transaction });

    await transaction.commit();
    
    // Return user data without password
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ 
      error: 'User creation failed', 
      details: error.message 
    });
  }
});

// 2. Bulk User Creation from CSV
router.post('/bulk-upload', upload.single('csv'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const users = [];
    const errors = [];
    
    // Create a readable stream from the buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csv())
        .on('data', (row) => {
          // Map CSV columns to user model fields exactly as in MySQL table
          const userData = {
            id: row.id,
            sin_number: row.sin_number,
            name: row.name,
            gender: row.gender,
            email: row.email,
            password: row.password,
            address: row.address,
            class_advisor: row.class_advisor || '',
            mentor: row.mentor || '',
            year: row.year || '',
            department: row.department || '',
            college: row.college || '',
            dayScholar_or_hosteller: row.dayScholar_or_hosteller || '',
            quota: row.quota || '',
            role: row.role || 'student',
            position_1: row.position_1 || '',
            position_2: row.position_2 || '',
            is_deleted: row.is_deleted === '1' || row.is_deleted === 'true' || false,
            deleted_at: row.deleted_at || null,
            phone: row.phone || '',
            parent_phone: row.parent_phone || '',
            photo: row.photo || '',
            batch: row.batch || ''
          };

          // Validate required fields
          if (!userData.sin_number || !userData.name || !userData.email || !userData.password) {
            errors.push({ row: userData, error: 'Missing required fields (sin_number, name, email, password)' });
            return;
          }
          users.push(userData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (errors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Validation errors in CSV data', 
        details: errors 
      });
    }

    // Process users
    const createdUsers = [];
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { sin_number: userData.sin_number },
            { email: userData.email }
          ]
        },
        transaction
      });

      if (existingUser) {
        errors.push({ 
          user: userData, 
          error: `User with sin_number ${userData.sin_number} or email ${userData.email} already exists` 
        });
        continue;
      }

      // Create new user
      const newUser = await User.create(userData, { transaction });
      createdUsers.push(newUser);
    }

    if (errors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Some users could not be created', 
        details: errors 
      });
    }

    await transaction.commit();
    res.status(201).json({
      message: `Successfully created ${createdUsers.length} users`,
      users: createdUsers.map(user => {
        const u = user.toJSON();
        delete u.password;
        return u;
      })
    });

  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ 
      error: 'Bulk user creation failed', 
      details: error.message 
    });
  }
});

// Update User with photo upload
router.put('/update-user/:sin_number', upload.single('photo'), async (req, res) => {
  try {
    const { sin_number } = req.params;
    const updateData = req.body;
    const photo = req.file ? req.file.buffer.toString('base64') : null;

    // Validate sin_number
    if (!sin_number) {
      return res.status(400).json({ error: 'sin_number is required in URL parameters' });
    }

    // Prepare update data
    const updatePayload = {
      ...updateData,
      ...(photo && { photo }) // Only add photo if it exists
    };

    // If password is being updated, hash it
    if (updatePayload.password) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(updatePayload.password, salt);
    }

    // Update user
    const [updated] = await User.update(updatePayload, {
      where: { sin_number }
    });

    if (updated === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user data
    const updatedUser = await User.findOne({
      where: { sin_number },
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    res.status(400).json({ 
      error: 'User update failed', 
      details: error.message 
    });
  }
});

// Hard delete user
router.delete('/delete-user/:sin_number', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { sin_number } = req.params;
    const { deleted_by } = req.body;
    
    if (!deleted_by) {
      return res.status(400).json({ error: 'deleted_by is required' });
    }

    // Find the user with all fields
    const user = await User.findOne({ 
      where: { sin_number },
      attributes: { exclude: [] }, // Get all fields including photo
      transaction 
    });
    
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user data before deletion
    const userData = user.toJSON();
    
    // Generate a new UUID for the deleted_user record
    const newId = uuid.v4();
    
    // Create deleted user record with all fields
    const deletedUserData = {
      id: newId,
      sin_number: userData.sin_number,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      department: userData.department,
      year: userData.year,
      gender: userData.gender,
      phone: userData.phone,
      parent_phone: userData.parent_phone,
      address: userData.address,
      class_advisor: userData.class_advisor,
      mentor: userData.mentor,
      college: userData.college,
      dayScholar_or_hosteller: userData.dayScholar_or_hosteller,
      quota: userData.quota,
      position_1: userData.position_1,
      position_2: userData.position_2,
      batch: userData.batch,
      deleted_by,
      deleted_at: new Date()
    };

    // Handle photo data if it exists
    if (userData.photo) {
      // If the photo is already in the correct format, use it as is
      if (userData.photo.startsWith('data:image/')) {
        deletedUserData.photo = userData.photo;
      } else {
        // If it's just base64 data, add the prefix
        deletedUserData.photo = `data:image/jpeg;base64,${userData.photo}`;
      }
    }

    // Create deleted user record first
    await deleted_user.create(deletedUserData, { transaction });

    // Then delete the user
    await user.destroy({ transaction });

    await transaction.commit();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'User deletion failed', 
      message: error.message,
      details: error.errors?.[0]?.message || error.message
    });
  }
});

// Restore deleted user
router.post('/restore-user', async (req, res) => {
  try {
    const { sin_number } = req.body;
    
    // Find the deleted user
    const deletedUser = await DeletedUser.findOne({ where: { sin_number } });
    if (!deletedUser) {
      return res.status(404).json({ error: 'Deleted user not found' });
    }

    // Restore the user
    const userData = deletedUser.toJSON();
    delete userData.deleted_by;
    delete userData.deleted_at;
    await User.create(userData);

    // Remove from deleted_users
    await deletedUser.destroy();

    res.json({ message: 'User restored successfully' });
  } catch (error) {
    res.status(500).json({ error: 'User restoration failed', details: error.message });
  }
});

// Permanently delete user
router.post('/permanently-delete-user', async (req, res) => {
  try {
    const { sin_number } = req.body;
    
    // Find and delete from deleted_users
    const deleted = await DeletedUser.destroy({
      where: { sin_number },
      force: true
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'User not found in deleted users' });
    }

    res.json({ message: 'User permanently deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Permanent deletion failed', details: error.message });
  }
});

// Get deleted users
router.get('/deleted-users', async (req, res) => {
  try {
    const deletedUsers = await DeletedUser.findAll();
    res.json(deletedUsers);
  } catch (error) {
    console.error('Error fetching deleted users:', error);
    res.status(500).json({ error: 'Error fetching deleted users' });
  }
});


// Helper function to validate base64 string
function isValidBase64(str) {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (err) {
    return false;
  }
}

module.exports = router;