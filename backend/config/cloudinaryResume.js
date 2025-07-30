// backend/config/cloudinaryResume.js
const cloudinary = require('cloudinary').v2;
const path = require('path');
const { promisify } = require('util');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Promisify Cloudinary methods for async/await
const uploadAsync = promisify(cloudinary.uploader.upload);
const destroyAsync = promisify(cloudinary.uploader.destroy);
const resourcesAsync = promisify(cloudinary.api.resources);

// Custom upload settings for resumes
const uploadOptions = {
  resource_type: 'raw',
  allowed_formats: ['pdf', 'doc', 'docx'],
  unique_filename: true,
  overwrite: false,
  use_filename: true,
  folder: 'resumes'
};

// Validate Cloudinary configuration
const validateConfig = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary configuration in environment variables');
    return false;
  }
  return true;
};

/**
 * Uploads a resume to Cloudinary
 * @param {String|Buffer} file - File path or buffer
 * @param {String} userId - User ID for folder organization
 * @param {String} resumeId - Optional custom resume ID
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadResume = async (file, userId, resumeId = null) => {
  if (!validateConfig()) {
    throw new Error('Cloudinary configuration is invalid');
  }

  const options = {
    ...uploadOptions,
    public_id: resumeId ? `resumes/${userId}/${resumeId}` : undefined,
    folder: `resumes/${userId}`
  };

  try {
    const result = await uploadAsync(file, options);
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload resume: ${error.message}`);
  }
};

/**
 * Deletes a resume from Cloudinary
 * @param {String} publicId - Cloudinary public_id of the resume
 * @returns {Promise<Object>} Deletion result
 */
const deleteResume = async (publicId) => {
  if (!validateConfig()) {
    throw new Error('Cloudinary configuration is invalid');
  }

  try {
    const result = await destroyAsync(publicId, { resource_type: 'raw' });
    if (result.result === 'ok') {
      return { success: true, message: 'Resume deleted successfully' };
    }
    return { success: false, message: 'Resume not found' };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete resume: ${error.message}`);
  }
};

/**
 * Lists all resumes for a specific user
 * @param {String} userId - User ID to filter resumes
 * @returns {Promise<Array>} Array of resume objects
 */
const listUserResumes = async (userId) => {
  if (!validateConfig()) {
    throw new Error('Cloudinary configuration is invalid');
  }

  try {
    const result = await resourcesAsync({
      type: 'upload',
      resource_type: 'raw',
      prefix: `resumes/${userId}/`,
      max_results: 50
    });

    return result.resources.map(res => ({
      resume_id: res.public_id.split('/').pop(),
      url: res.secure_url,
      public_id: res.public_id,
      format: res.format,
      created_at: res.created_at,
      size: res.bytes
    }));
  } catch (error) {
    console.error('Cloudinary list error:', error);
    throw new Error(`Failed to list resumes: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  validateConfig,
  uploadResume,
  deleteResume,
  listUserResumes
};