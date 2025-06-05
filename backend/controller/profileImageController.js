const { cloudinary } = require('../config/cloudinary');
const upload = require('../middleware/upload');

const uploadProfileImage = async (req, res) => {
  try {
    // Use upload middleware for single file
    upload.single('profileImage')(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer Error:', err);
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        console.error('Upload Error:', err);
        return res.status(400).json({ success: false, message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      console.log('Cloudinary File:', {
        public_id: req.file.public_id,
        url: req.file.secure_url
      });

      // Return the uploaded file details (to be used by auth.js or other routes)
      res.status(200).json({
        success: true,
        public_id: req.file.public_id,
        url: req.file.secure_url
      });
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { uploadProfileImage };