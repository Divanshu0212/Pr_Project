const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        const response = await cloudinary.uploader.upload(filePath, {
            folder: 'certificates',
            resource_type: 'auto'
        });
        fs.unlinkSync(filePath); // Remove file from server after upload
        return response;
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