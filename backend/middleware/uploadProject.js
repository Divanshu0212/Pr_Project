const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import the File System module

// Define the uploads directory path
const uploadDir = path.join(__dirname, '../uploads/projects');

// Ensure the upload directory exists
// The { recursive: true } option creates parent directories (like /uploads) if they don't exist
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Successfully created directory: ${uploadDir}`);
  } catch (error) {
    console.error(`Error creating directory: ${uploadDir}`, error);
  }
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the variable for the destination path
  },
  filename: function (req, file, cb) {
    // Sanitize filename to prevent directory traversal attacks
    const safeOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, `${Date.now()}-${safeOriginalName}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  // Use a regex to check for image mimetypes
  if (file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;