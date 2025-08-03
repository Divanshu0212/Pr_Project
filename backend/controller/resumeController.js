const Resume = require('../models/Resume');
const Joi = require('joi');
const JoiDate = require('@joi/date');
const mongoose = require('mongoose');
const { cloudinary, validateConfig,
    uploadResume,
    deleteResume,
    listUserResumes } = require('../config/cloudinaryResume');
const fs = require('fs');
const path = require('path');
const { console } = require('inspector');
const { log } = require('console');
const logger = require('../utils/logger');

// Extend Joi with date validations
const customJoi = Joi.extend(JoiDate);

// Joi schema for validating individual resume elements
// Joi schema for education - flexible for both formats
const educationSchema = customJoi.object({
    institution: customJoi.string().trim().min(1).max(255).required(),
    degree: customJoi.string().trim().min(1).max(255).required(),
    field: customJoi.string().trim().min(1).max(255).optional(),
    field_of_study: customJoi.string().trim().min(1).max(255).optional(), // New format
    date_range: customJoi.string().trim().min(1).max(50).optional(), // Old format
    graduation_date: customJoi.string().trim().min(1).max(50).optional(), // New format
    gpa: customJoi.string().trim().min(1).max(10).optional(),
    relevant_coursework: customJoi.array().items(customJoi.string().trim().max(100)).optional()
});

const experienceSchema = customJoi.object({
    company: customJoi.string().trim().min(1).max(255).required(),
    position: customJoi.string().trim().min(1).max(255).required(),
    date_range: customJoi.string().trim().min(1).max(50).optional(), // Old format
    start_date: customJoi.string().trim().min(1).max(50).optional(), // New format
    end_date: customJoi.string().trim().min(1).max(50).optional(), // New format
    location: customJoi.string().trim().max(255).optional(), // New format
    description: customJoi.array().items(customJoi.string().trim().min(1).max(1000)).optional(), // Old format
    responsibilities: customJoi.array().items(customJoi.string().trim().min(1).max(1000)).optional(), // New format
    achievements: customJoi.array().items(customJoi.string().trim().min(1).max(1000)).optional() // New format
});

const projectSchema = customJoi.object({
    name: customJoi.string().trim().min(1).max(255).required(),
    description: customJoi.alternatives().try(
        customJoi.array().items(customJoi.string().trim().min(1).max(1000)), // Old format
        customJoi.string().trim().min(1).max(1000) // New format
    ).optional(),
    link: customJoi.string().trim().uri().optional(),
    url: customJoi.string().trim().uri().optional(), // New format
    technologies: customJoi.array().items(customJoi.string().trim().max(100)).optional(),
    achievements: customJoi.array().items(customJoi.string().trim().min(1).max(1000)).optional() // New format
});

const skillCategorySchema = customJoi.object({
    category: customJoi.string().trim().min(1).max(100).required(),
    skills: customJoi.array().items(customJoi.string().trim().min(1).max(100)).min(1).required()
});

const achievementSchema = customJoi.object({
    title: customJoi.string().trim().min(1).max(255).required(),
    description: customJoi.string().trim().min(1).max(500).optional()
});

const codingProfileSchema = customJoi.object({
    platform: customJoi.string().trim().min(1).max(100).required(),
    url: customJoi.string().trim().uri().required()
});

// Joi schema for the entire resumeData JSON structure - flexible for both formats
const resumeDataSchema = customJoi.object({
    name: customJoi.string().trim().max(255).optional().allow(''),
    email: customJoi.string().trim().email().max(255).optional().allow(''),
    phone: customJoi.string().trim().max(50).optional().allow(''),
    location: customJoi.string().trim().max(255).optional().allow(''), // New format
    linkedin: customJoi.string().trim().max(500).optional().allow(''),
    github: customJoi.string().trim().max(500).optional().allow(''),
    portfolio: customJoi.string().trim().max(500).optional().allow(''),
    target_profession: customJoi.string().trim().max(2000).optional().allow(''),
    professional_summary: customJoi.string().trim().max(2000).optional().allow(''), // New format
    education: customJoi.array().items(educationSchema).optional(),
    experiences: customJoi.array().items(experienceSchema).optional(),
    projects: customJoi.array().items(projectSchema).optional(),
    skills: customJoi.alternatives().try(
        customJoi.array().items(skillCategorySchema), // Old format
        customJoi.object().pattern(customJoi.string(), customJoi.array().items(customJoi.string())) // New format: object with category keys
    ).optional(),
    achievements: customJoi.array().items(achievementSchema).optional(),
    coding_profiles: customJoi.array().items(codingProfileSchema).optional(),
    certifications: customJoi.array().items(customJoi.string()).optional(), // New format
    languages: customJoi.array().items(customJoi.string()).optional() // New format
}).required();

// Helper for sending consistent error responses
const sendErrorResponse = (res, statusCode, message, errors = null) => {
    res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};


// @route   POST /api/resumes
// @desc    Create a new resume
// @access  Private (Auth required)
exports.createResume = async (req, res) => {
    const userId = req.user.id; // Get user ID from authenticated request
    const { title, resumeData } = req.body;

    // Input Validation using Joi
    const { error: titleError } = Joi.string().trim().min(3).max(100).required().validate(title);
    if (titleError) {
        return sendErrorResponse(res, 400, 'Invalid resume title.', titleError.details);
    }

    // Validate the resumeData structure
    const { error: dataError, value: validatedResumeData } = resumeDataSchema.validate(resumeData, { abortEarly: false });
    if (dataError) {
        return sendErrorResponse(res, 400, 'Invalid resume data structure.', dataError.details);
    }

    try {
        const newResume = new Resume({
            userId,
            title,
            resumeData: JSON.stringify(validatedResumeData), // Store validated data as string
        });

        // Handle file upload if present
        if (req.file) {
            try {
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'raw',
                            folder: `resumes/${userId}`,
                            public_id: `${title}_${Date.now()}`
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });

                newResume.cloudinaryResumes = {
                    public_id: uploadResult.public_id,
                    url: uploadResult.secure_url,
                    uploadedAt: new Date()
                };
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                // Continue without file upload - don't fail the entire resume creation
            }
        }

        // The pre-save hook in the model will handle encryption of PII in resumeData
        await newResume.save();

        // Return the resume, but ensure PII is decrypted for the response (via virtual)
        const responseResume = newResume.toObject();
        responseResume.resumeData = responseResume.decryptedResumeData; // Replace raw with decrypted virtual
        delete responseResume.decryptedResumeData; // Clean up virtual for response

        res.status(201).json({
            success: true,
            message: 'Resume created successfully.',
            resume: responseResume
        });
    } catch (error) {
        console.error('Error creating resume:', error.message);
        if (error.name === 'ValidationError') { // Mongoose validation error
            return sendErrorResponse(res, 400, 'Data validation failed.', error.errors);
        }
        sendErrorResponse(res, 500, 'Server error. Could not create resume.');
    }
};

// @route   GET /api/resumes
// @desc    Get all resumes for the authenticated user
// @access  Private (Auth required)
exports.getAllResumes = async (req, res) => {
    const userId = req.user.id;

    try {
        const resumes = await Resume.find({ userId }).sort({ lastUpdated: -1 });

        // Decrypt PII for each resume in the list using the virtual
        const responseResumes = resumes.map(resume => {
            const r = resume.toObject();
            r.resumeData = r.decryptedResumeData;
            delete r.decryptedResumeData;
            return r;
        });

        res.status(200).json({
            success: true,
            count: responseResumes.length,
            resumes: responseResumes
        });
    } catch (error) {
        console.error('Error fetching resumes:', error.message);
        sendErrorResponse(res, 500, 'Server error. Could not retrieve resumes.');
    }
};

// @route   GET /api/resumes/:id
// @desc    Get a single resume by ID for the authenticated user
// @access  Private (Auth required)
exports.getResumeById = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendErrorResponse(res, 400, 'Invalid resume ID format.');
    }

    try {
        const resume = await Resume.findOne({ _id: id, userId });

        if (!resume) {
            return sendErrorResponse(res, 404, 'Resume not found or not authorized.');
        }

        // Return the resume, ensure PII is decrypted for the response (via virtual)
        const responseResume = resume.toObject();
        responseResume.resumeData = responseResume.decryptedResumeData;
        delete responseResume.decryptedResumeData;

        res.status(200).json({
            success: true,
            resume: responseResume
        });
    } catch (error) {
        console.error('Error fetching resume by ID:', error.message);
        sendErrorResponse(res, 500, 'Server error. Could not retrieve resume.');
    }
};

// @route   PUT /api/resumes/:id
// @desc    Update a resume by ID for the authenticated user
// @access  Private (Auth required)
exports.updateResume = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, resumeData } = req.body;

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendErrorResponse(res, 400, 'Invalid resume ID format.');
    }

    // Input Validation using Joi for updates (title is optional for update)
    const updateSchema = customJoi.object({
        title: customJoi.string().trim().min(3).max(100).optional(),
        resumeData: resumeDataSchema.optional(),
    }).min(1); // At least one field must be provided for update

    const { error: validationError, value: validatedUpdateData } = updateSchema.validate(req.body, { abortEarly: false });
    if (validationError) {
        return sendErrorResponse(res, 400, 'Invalid update data.', validationError.details);
    }

    try {
        let resume = await Resume.findOne({ _id: id, userId });

        if (!resume) {
            return sendErrorResponse(res, 404, 'Resume not found or not authorized.');
        }

        // Apply updates if present
        if (validatedUpdateData.title !== undefined) {
            resume.title = validatedUpdateData.title;
        }
        if (validatedUpdateData.resumeData !== undefined) {
            // Stringify before setting, pre-save hook will encrypt PII
            resume.resumeData = JSON.stringify(validatedUpdateData.resumeData);
        }

        // Mongoose pre-save hook will automatically handle encryption of resumeData PII
        await resume.save();

        // Return the updated resume, ensure PII is decrypted for the response (via virtual)
        const responseResume = resume.toObject();
        responseResume.resumeData = responseResume.decryptedResumeData;
        delete responseResume.decryptedResumeData;

        res.status(200).json({
            success: true,
            message: 'Resume updated successfully.',
            resume: responseResume
        });
    } catch (error) {
        console.error('Error updating resume:', error.message);
        if (error.name === 'ValidationError') {
            return sendErrorResponse(res, 400, 'Data validation failed during update.', error.errors);
        }
        sendErrorResponse(res, 500, 'Server error. Could not update resume.');
    }
};

// @route   DELETE /api/resumes/:id
// @desc    Delete a resume by ID for the authenticated user
// @access  Private (Auth required)
exports.deleteResume = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendErrorResponse(res, 400, 'Invalid resume ID format.');
    }

    try {
        // Find the resume first to get Cloudinary info
        const resume = await Resume.findOne({ _id: id, userId });

        if (!resume) {
            return sendErrorResponse(res, 404, 'Resume not found or not authorized.');
        }

        // Delete from Cloudinary if exists
        if (resume.cloudinaryResumes && resume.cloudinaryResumes.public_id) {
            try {
                await cloudinary.uploader.destroy(resume.cloudinaryResumes.public_id, {
                    resource_type: 'raw'
                });
                console.log(`Deleted Cloudinary file: ${resume.cloudinaryResumes.public_id}`);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
                // Continue with database deletion even if Cloudinary deletion fails
            }
        }

        // Delete from database
        const result = await Resume.deleteOne({ _id: id, userId });

        if (result.deletedCount === 0) {
            return sendErrorResponse(res, 404, 'Resume not found or not authorized.');
        }

        res.status(200).json({
            success: true,
            message: 'Resume deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting resume:', error.message);
        sendErrorResponse(res, 500, 'Server error. Could not delete resume.');
    }
};

// @route   GET /api/resumes/default-resume
// @desc    Get a default/empty resume structure
// @access  Public (No Auth required for template)
exports.getDefaultResume = (req, res) => {
    // This is a privacy-first default. No PII is pre-filled.
    const defaultResumeData = {
        name: "", // Encouraging user to fill consciously
        email: "",
        phone: "",
        linkedin: "",
        github: "",
        portfolio: "",
        target_profession: "",
        education: [],
        experiences: [],
        projects: [],
        skills: [],
        achievements: [],
        coding_profiles: []
    };
    res.status(200).json({
        success: true,
        message: 'Default resume structure provided.',
        resumeData: defaultResumeData
    });
};

// @route   POST /api/resumes/upload
// @desc    Upload a resume PDF to Cloudinary
// @access  Private
// @route   POST /api/resumes/upload
// @desc    Upload a resume PDF to Cloudinary and save metadata to database
// @access  Private
exports.uploadResumeToCloudinary = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user.id;
        const resumeId = req.body.resumeId || `resume_${Date.now()}`;

        // Process the file buffer and upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    folder: `resumes/${userId}`,
                    public_id: resumeId.length === 24 ? `resume_${Date.now()}` : resumeId // Use timestamp for ObjectIds
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            uploadStream.end(req.file.buffer);
        });

        let resume;

        // Check if resumeId is a valid MongoDB ObjectId (existing resume)
        if (mongoose.Types.ObjectId.isValid(resumeId) && resumeId.length === 24) {
            // This is an existing resume - update it
            resume = await Resume.findOne({ _id: resumeId, userId: userId });
            
            if (!resume) {
                return res.status(404).json({
                    success: false,
                    message: 'Resume not found or not authorized'
                });
            }

            // Update existing resume with Cloudinary info
            resume.cloudinaryResumes = {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url,
                uploadedAt: new Date()
            };
            await resume.save();
        } else {
            // Check if a resume with this title already exists for this user
            const existingResume = await Resume.findOne({ 
                userId: userId, 
                title: resumeId 
            });

            if (existingResume) {
                // Update existing resume with Cloudinary info
                existingResume.cloudinaryResumes = {
                    public_id: uploadResult.public_id,
                    url: uploadResult.secure_url,
                    uploadedAt: new Date()
                };
                await existingResume.save();
                resume = existingResume;
            } else {
                // Create new resume entry in database
                const newResume = new Resume({
                    userId: userId,
                    title: resumeId,
                    resumeData: JSON.stringify({
                        name: "",
                        email: "",
                        phone: "",
                        linkedin: "",
                        github: "",
                        portfolio: "",
                        target_profession: "",
                        education: [],
                        experiences: [],
                        projects: [],
                        skills: [],
                        achievements: [],
                        coding_profiles: []
                    }),
                    cloudinaryResumes: {
                        public_id: uploadResult.public_id,
                        url: uploadResult.secure_url,
                        uploadedAt: new Date()
                    }
                });
                resume = await newResume.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            resumeId: resumeId,
            databaseId: resume._id
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during upload',
            error: error.message
        });
    }
};

// @route   GET /api/resumes/cloudinary
exports.listCloudinaryResumes = async (req, res) => {
    const userId = req.user.id;
    try {
        // Use the new listUserResumes function
        const resumes = await listUserResumes(userId);
        res.status(200).json({
            success: true,
            count: resumes.length,
            resumes
        });
    } catch (error) {
        console.error('List error:', error.message);
        sendErrorResponse(res, 500, error.message);
    }
};

// @route   DELETE /api/resumes/cloudinary/:resumeId
exports.deleteCloudinaryResume = async (req, res) => {
    const userId = req.user.id;
    const { resumeId } = req.params;

    try {
        // Use the new deleteResume function
        const result = await deleteResume(`resumes/${userId}/${resumeId}`);

        if (result.success) {
            return res.status(200).json(result);
        }
        sendErrorResponse(res, 404, result.message);
    } catch (error) {
        console.error('Delete error:', error.message);
        sendErrorResponse(res, 500, error.message);
    }
};