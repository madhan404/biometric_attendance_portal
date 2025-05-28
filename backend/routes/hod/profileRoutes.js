const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/profile_pictures';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get hod profile
router.get('/profile/:sin_number', async (req, res) => {
  try {
    const { sin_number } = req.params;
    
    const hod = await User.findOne({
      where: { 
        sin_number,
        role: 'hod'
      },
      attributes: { exclude: ['password'] }
    });

    if (!hod) {
      return res.status(404).json({ error: 'Hod not found' });
    }

    res.json({
      status: 'success',
      hod: {
        ...hod.toJSON(),
        photo: hod.photo ? hod.photo.toString('base64') : null
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update hod profile
router.put('/update-profile/:sin_number', upload.single('photo'), async (req, res) => {
  try {
    const { sin_number } = req.params;
    const { email, phone, address } = req.body;
    
    // Validate sin_number
    if (!sin_number) {
      return res.status(400).json({ error: 'sin_number is required' });
    }

    // Find the hod 
    const hod = await User.findOne({ 
      where: { 
        sin_number,
        role: 'hod'
      }
    });

    if (!hod) {
      return res.status(404).json({ error: 'Hod not found' });
    }

    // Handle photo upload
    let photoBase64 = null;
    if (req.file) {
      const photoPath = req.file.path;
      const photoBuffer = fs.readFileSync(photoPath);
      photoBase64 = photoBuffer.toString('base64');
      
      // Clean up the temporary file
      fs.unlinkSync(photoPath);
    }

    // Prepare update data
    const updateData = {
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(photoBase64 && { photo: photoBase64 })
    };

    // Update hod
    await User.update(updateData, {
      where: { sin_number }
    });

    // Get updated hod data
    const updatedHod = await User.findOne({
      where: { sin_number },
      attributes: { exclude: ['password'] }
    });

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      hod: {
        ...updatedHod.toJSON(),
        photo: updatedHod.photo ? updatedHod.photo.toString('base64') : null
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum size is 5MB' });
      }
      return res.status(400).json({ error: 'File upload error', details: error.message });
    }
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Change password
router.put('/change-password/:sin_number', async (req, res) => {
  try {
    const { sin_number } = req.params;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    // Find hod
    const hod = await User.findOne({ 
      where: { 
        sin_number,
        role: 'hod'
      }
    });

    if (!hod) {
      return res.status(404).json({ error: 'Hod not found' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, hod.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.update(
      { password: hashedPassword },
      { where: { sin_number } }
    );

    res.json({ 
      status: 'success',
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Password update failed' });
  }
});

module.exports = router; 