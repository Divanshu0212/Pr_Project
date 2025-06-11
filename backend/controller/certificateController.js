const Certificate = require('../models/Certificate');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinaryCertificates');
const fs = require('fs');
const path = require('path');

// @desc    Get all certificates for a user
// @route   GET /api/certificates
// @access  Private
const getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.user._id }).sort('-createdAt');
        res.status(200).json({ success: true, count: certificates.length, certificates });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Add a new certificate
// @route   POST /api/certificates
// @access  Private
const addCertificate = async (req, res) => {
    try {
        const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, skills } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a certificate image' });
        }

        const result = await uploadToCloudinary(req.file.path);
        
        const certificate = new Certificate({
            userId: req.user._id,
            name,
            issuer,
            issueDate,
            credentialId,
            credentialUrl,
            image: {
                public_id: result.public_id,
                url: result.secure_url
            },
            skills: skills ? skills.split(',').map(skill => skill.trim()) : []
        });

        await certificate.save();

        res.status(201).json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update a certificate
// @route   PUT /api/certificates/:id
// @access  Private
const updateCertificate = async (req, res) => {
    try {
        const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, skills } = req.body;
        const certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({ success: false, error: 'Certificate not found' });
        }

        // Check if the certificate belongs to the user
        if (certificate.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this certificate' });
        }

        let imageData = certificate.image;
        if (req.file) {
            // Delete old image from Cloudinary
            await deleteFromCloudinary(certificate.image.public_id);
            
            // Upload new image
            const result = await uploadToCloudinary(req.file.path);
            imageData = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const updatedCertificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            {
                name,
                issuer,
                issueDate,
                credentialId,
                credentialUrl,
                image: imageData,
                skills: skills ? skills.split(',').map(skill => skill.trim()) : []
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, certificate: updatedCertificate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private
const deleteCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({ success: false, error: 'Certificate not found' });
        }

        // Check if the certificate belongs to the user
        if (certificate.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this certificate' });
        }

        // Delete image from Cloudinary
        await deleteFromCloudinary(certificate.image.public_id);

        await certificate.remove();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get certificate counts
// @route   GET /api/certificates/count
// @access  Private
const getCertificateCount = async (req, res) => {
    try {
        const count = await Certificate.countDocuments({ userId: req.user._id });
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getCertificates,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    getCertificateCount
};