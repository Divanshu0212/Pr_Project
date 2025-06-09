const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'portfolio-projects'
    });
    fs.unlinkSync(filePath); // Remove file from server after upload
    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    fs.unlinkSync(filePath); // Remove file from server if upload fails
    throw error;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };