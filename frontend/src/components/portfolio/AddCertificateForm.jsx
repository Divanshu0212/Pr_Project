import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import Modal from '../common/Modal';

const AddCertificateForm = ({ onClose, onSubmit, initialData = {}, isEditing = false, title }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        issuer: initialData?.issuer || '',
        issueDate: initialData?.issueDate ? new Date(initialData?.issueDate).toISOString().split('T')[0] : '',
        credentialId: initialData?.credentialId || '',
        credentialUrl: initialData?.credentialUrl || '',
        skills: initialData?.skills ? (Array.isArray(initialData.skills) ? initialData.skills.join(', ') : initialData.skills) : '',
        image: null
    });

    const [previewImage, setPreviewImage] = useState(initialData?.image?.url || initialData?.imageUrl || null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { theme, isDark } = useTheme();

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewImage && previewImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Certificate name is required';
        if (!formData.issuer.trim()) newErrors.issuer = 'Issuing organization is required';
        if (!formData.issueDate) newErrors.issueDate = 'Issue date is required';
        if (!formData.credentialUrl.trim()) newErrors.credentialUrl = 'Credential URL is required';
        
        // URL validation
        if (formData.credentialUrl.trim()) {
            try {
                new URL(formData.credentialUrl);
            } catch {
                newErrors.credentialUrl = 'Please enter a valid URL';
            }
        }
        
        // Image validation for new certificates
        if (!isEditing && !formData.image) {
            newErrors.image = 'Certificate image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            setErrors(prev => ({ ...prev, image: 'Please select an image file (JPEG, PNG, WebP)' }));
            return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'File size should be less than 5MB' }));
            return;
        }

        // Clear previous preview URL
        if (previewImage && previewImage.startsWith('blob:')) {
            URL.revokeObjectURL(previewImage);
        }

        setFormData(prev => ({ ...prev, image: file }));
        setPreviewImage(URL.createObjectURL(file));
        
        // Clear image error
        if (errors.image) {
            setErrors(prev => ({ ...prev, image: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Prepare form data
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('issuer', formData.issuer.trim());
            submitData.append('issueDate', formData.issueDate);
            
            if (formData.credentialId.trim()) {
                submitData.append('credentialId', formData.credentialId.trim());
            }
            
            submitData.append('credentialUrl', formData.credentialUrl.trim());
            
            if (formData.skills.trim()) {
                // Convert comma-separated skills to array
                const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
                submitData.append('skills', JSON.stringify(skillsArray));
            }
            
            if (formData.image) {
                submitData.append('image', formData.image);
            }

            // Call the onSubmit handler with form data
            await onSubmit(submitData, isEditing ? initialData?._id : null);
            
            // Close modal on success
            onClose();
        } catch (error) {
            console.error('Error submitting certificate form:', error);
            setErrors({ submit: 'Failed to save certificate. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // Cleanup preview URL before closing
        if (previewImage && previewImage.startsWith('blob:')) {
            URL.revokeObjectURL(previewImage);
        }
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={handleClose} className="certificate-form-modal" title={isEditing ? 'Edit Certificate' : 'Add New Certificate'}>
            <div className="certificate-form-container">
                {/* Global Error Message */}
                {errors.submit && (
                    <div className="form-error-banner">
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="certificate-form">
                    {/* Form Fields Grid */}
                    <div className="form-fields-grid">
                        {/* Certificate Name */}
                        <div className="form-field">
                            <label className="form-label">
                                Certificate Name <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                placeholder="e.g., React Developer Certification"
                            />
                            {errors.name && <span className="field-error">{errors.name}</span>}
                        </div>

                        {/* Issuing Organization */}
                        <div className="form-field">
                            <label className="form-label">
                                Issuing Organization <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="issuer"
                                value={formData.issuer}
                                onChange={handleChange}
                                className={`form-input ${errors.issuer ? 'error' : ''}`}
                                placeholder="e.g., Meta, Google, Coursera"
                            />
                            {errors.issuer && <span className="field-error">{errors.issuer}</span>}
                        </div>

                        {/* Issue Date */}
                        <div className="form-field">
                            <label className="form-label">
                                Issue Date <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="date"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                className={`form-input ${errors.issueDate ? 'error' : ''}`}
                            />
                            {errors.issueDate && <span className="field-error">{errors.issueDate}</span>}
                        </div>

                        {/* Credential ID */}
                        <div className="form-field">
                            <label className="form-label">
                                Credential ID <span className="optional-text">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                name="credentialId"
                                value={formData.credentialId}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Certificate ID or verification code"
                            />
                        </div>

                        {/* Credential URL */}
                        <div className="form-field form-field-full">
                            <label className="form-label">
                                Credential URL <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="url"
                                name="credentialUrl"
                                value={formData.credentialUrl}
                                onChange={handleChange}
                                className={`form-input ${errors.credentialUrl ? 'error' : ''}`}
                                placeholder="https://www.coursera.org/verify/..."
                            />
                            {errors.credentialUrl && <span className="field-error">{errors.credentialUrl}</span>}
                        </div>

                        {/* Skills */}
                        <div className="form-field form-field-full">
                            <label className="form-label">
                                Related Skills <span className="optional-text">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="e.g., React, Node.js, MongoDB, API Development"
                                className="form-input"
                            />
                            <p className="field-hint">Separate skills with commas</p>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="image-upload-section">
                        <label className="form-label">
                            Certificate Image <span className="required-asterisk">*</span>
                        </label>
                        <div className="image-upload-container">
                            {/* Upload Area */}
                            <div className={`image-upload-area ${errors.image ? 'error' : ''}`}>
                                {previewImage ? (
                                    <div className="image-preview-container">
                                        <img
                                            src={previewImage}
                                            alt="Certificate Preview"
                                            className="image-preview"
                                        />
                                        <div className="image-overlay">
                                            <span>Click to change image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <FaUpload className="upload-icon" />
                                        <p className="upload-text">Upload Certificate Image</p>
                                        <p className="upload-subtext">JPEG, PNG, WebP (max 5MB)</p>
                                        <p className="upload-hint">Click or drag to upload</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="file-input-hidden"
                                />
                            </div>

                            {/* Upload Info */}
                            <div className="upload-info">
                                <div className="upload-guidelines">
                                    <h4 className="guidelines-title">Upload Guidelines:</h4>
                                    <ul className="guidelines-list">
                                        <li>• Use high-quality images for best results</li>
                                        <li>• Supported formats: JPEG, PNG, WebP</li>
                                        <li>• Maximum file size: 5MB</li>
                                        <li>• Ensure certificate text is clearly readable</li>
                                    </ul>
                                </div>
                                
                                {isEditing && initialData?.image && (
                                    <div className="edit-notice">
                                        <p>
                                            <strong>Note:</strong> Uploading a new image will replace the existing one.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {errors.image && <span className="field-error">{errors.image}</span>}
                    </div>

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="form-button-cancel"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            className="form-button-submit"
                        >
                            {isLoading ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <MdSave className="button-icon" />
                                    {isEditing ? 'Update Certificate' : 'Save Certificate'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

AddCertificateForm.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    isEditing: PropTypes.bool
};

AddCertificateForm.defaultProps = {
    initialData: {},
    isEditing: false
};

export default AddCertificateForm;