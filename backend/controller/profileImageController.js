const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const upload = require('../middleware/upload');

// Upload profile image
exports.uploadProfileImage = [
  upload.single('profileImage'),
  async (req, res, next) => {
    try {
      // 1. Verify the upload
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'No image file was uploaded' 
        });
      }

      console.log('Cloudinary File:', {
        public_id: req.file.public_id,
        url: req.file.secure_url
      });

      // 2. Atomic update operation
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user.id },
        { 
          $set: { 
            'profileImage.public_id': req.file.public_id,
            'profileImage.url': req.file.secure_url 
          } 
        },
        { 
          new: true,
          upsert: false,
          runValidators: true 
        }
      );

      // 3. Verify the update
      if (!updatedUser) {
        // Rollback: Delete from Cloudinary if update fails
        await cloudinary.uploader.destroy(req.file.public_id);
        return res.status(404).json({
          success: false,
          message: 'User not found or update failed'
        });
      }

      console.log('MongoDB Update Result:', updatedUser.profileImage);

      // 4. Return complete response
      res.json({
        success: true,
        message: 'Profile image updated successfully',
        user: {
          id: updatedUser._id,
          profileImage: updatedUser.profileImage
        }
      });

    } catch (err) {
      console.error('Error in uploadProfileImage:', err);
      
      // Rollback on any error
      if (req.file?.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update profile image',
        error: err.message
      });
    }
  }
];

// Delete profile image
exports.deleteProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profileImage.public_id) {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
      user.profileImage = { public_id: '', url: '' };
      await user.save();
    }

    res.json({
      success: true,
      data: null
    });
  } catch (err) {
    next(err);
  }
};