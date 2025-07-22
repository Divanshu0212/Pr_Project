import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import Modal from '../common/Modal';

const AddCertificateForm = ({ onClose, onSubmit, initialData = {}, isEditing = false }) => {
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

    // Theme-based classes
    const bgPrimary = isDark ? 'bg-[#161B22]' : 'bg-white';
    const bgSecondary = isDark ? 'bg-[#0D1117]' : 'bg-[#F7FAFC]';
    const textPrimary = isDark ? 'text-[#E5E5E5]' : 'text-[#1A202C]';
    const textSecondary = isDark ? 'text-[#8B949E]' : 'text-[#718096]';
    const accent = isDark ? 'text-[#00FFFF]' : 'text-[#3182CE]';
    const highlight = isDark ? 'text-[#9C27B0]' : 'text-[#805AD5]';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
    const errorColor = 'text-red-400';

    return (
        <Modal onClose={handleClose} className={`add-cert-modal ${bgPrimary}`}>
            <div className={`rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl ${bgPrimary}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        {isEditing ? 'Edit Certificate' : 'Add New Certificate'}
                    </h2>
                    <Button
                        variant="icon"
                        onClick={handleClose}
                        className={`hover:${accent} transition-colors`}
                        aria-label="Close"
                    >
                        <FaTimes size={24} />
                    </Button>
                </div>

                {/* Global Error Message */}
                {errors.submit && (
                    <div className={`mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500 ${errorColor}`}>
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Certificate Name */}
                        <div>
                            <label className={`block mb-2 ${textPrimary} font-medium`}>
                                Certificate Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 ${bgSecondary} ${borderColor} border rounded-lg 
                                    focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none 
                                    ${textPrimary} transition-all duration-200 ${errors.name ? 'border-red-400' : ''}`}
                                placeholder="e.g., React Developer Certification"
                            />
                            {errors.name && <span className={`text-sm ${errorColor} mt-1 block`}>{errors.name}</span>}
                        </div>

                        {/* Issuing Organization */}
                        <div>
                            <label className={`block mb-2 ${textPrimary} font-medium`}>
                                Issuing Organization <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="issuer"
                                value={formData.issuer}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 ${bgSecondary} ${borderColor} border rounded-lg 
                                    focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none 
                                    ${textPrimary} transition-all duration-200 ${errors.issuer ? 'border-red-400' : ''}`}
                                placeholder="e.g., Meta, Google, Coursera"
                            />
                            {errors.issuer && <span className={`text-sm ${errorColor} mt-1 block`}>{errors.issuer}</span>}
                        </div>

                        {/* Issue Date */}
                        <div>
                            <label className={`block mb-2 ${textPrimary} font-medium`}>
                                Issue Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 ${bgSecondary} ${borderColor} border rounded-lg 
                                    focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none 
                                    ${textPrimary} transition-all duration-200 ${errors.issueDate ? 'border-red-400' : ''}`}
                            />
                            {errors.issueDate && <span className={`text-sm ${errorColor} mt-1 block`}>{errors.issueDate}</span>}
                        </div>

                        {/* Credential ID */}
                        <div>
                            <label className={`block mb-2 ${textPrimary} font-medium`}>
                                Credential ID <span className={`${textSecondary} text-sm`}>(Optional)</span>
                            </label>
                            <input
                                type="text"
                                name="credentialId"
                                value={formData.credentialId}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 ${bgSecondary} ${borderColor} border rounded-lg 
                                    focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none 
                                    ${textPrimary} transition-all duration-200`}
                                placeholder="Certificate ID or verification code"
                            />
                        </div>

                        {/* Credential URL */}
                        <div className="md:col-span-2">
                            <label className={`block mb-2 ${textPrimary} font-medium`}>
                                Credential URL <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="url"
                                name="credentialUrl"
                                value={formData.credentialUrl}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 ${bgSecondary} ${borderColor} border rounded-lg 
                                    focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none 
                                    ${textPrimary} transition-all duration-200 ${errors.credentialUrl ? 'border-red-400' : ''}`}
                                placeholder="https://www.coursera.org/verify/..."
                            />
                            {errors.credentialUrl && <span className={`text-sm ${errorColor} mt-1 block`}>{errors.credentialUrl}</span>}
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                            <label className={`block mb-2 ${textPrimary} font-medium`}>
                                Related Skills <span className={`${textSecondary} text-sm`}>(Optional)</span>
                            </label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="e.g., React, Node.js, MongoDB, API Development"
                                className={`w-full px-4 py-3 ${bgSecondary} ${borderColor} border rounded-lg 
                                    focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none 
                                    ${textPrimary} transition-all duration-200`}
                            />
                            <p className={`text-xs ${textSecondary} mt-1`}>Separate skills with commas</p>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="mb-6">
                        <label className={`block mb-2 ${textPrimary} font-medium`}>
                            Certificate Image <span className="text-red-400">*</span>
                        </label>
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Upload Area */}
                            <div className={`relative w-full lg:w-1/2 h-64 ${bgSecondary} border-2 border-dashed 
                                ${errors.image ? 'border-red-400' : borderColor} rounded-lg overflow-hidden 
                                transition-colors duration-200 hover:border-cyan-400`}>
                                {previewImage ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={previewImage}
                                            alt="Certificate Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 
                                            transition-opacity duration-200 flex items-center justify-center">
                                            <span className="text-white text-sm">Click to change image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-center p-4">
                                        <div>
                                            <FaUpload size={32} className={`mx-auto mb-3 ${accent}`} />
                                            <p className={`${textPrimary} font-medium mb-1`}>Upload Certificate Image</p>
                                            <p className={`text-sm ${textSecondary}`}>JPEG, PNG, WebP (max 5MB)</p>
                                            <p className={`text-xs ${textSecondary} mt-2`}>Click or drag to upload</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            {/* Upload Info */}
                            <div className="w-full lg:w-1/2 space-y-3">
                                <div className={`p-4 ${bgSecondary} rounded-lg border ${borderColor}`}>
                                    <h4 className={`${textPrimary} font-medium mb-2`}>Upload Guidelines:</h4>
                                    <ul className={`text-sm ${textSecondary} space-y-1`}>
                                        <li>• Use high-quality images for best results</li>
                                        <li>• Supported formats: JPEG, PNG, WebP</li>
                                        <li>• Maximum file size: 5MB</li>
                                        <li>• Ensure certificate text is clearly readable</li>
                                    </ul>
                                </div>
                                
                                {isEditing && initialData?.image && (
                                    <div className={`p-3 bg-yellow-900/20 border border-yellow-500 rounded-lg`}>
                                        <p className="text-yellow-400 text-sm">
                                            <strong>Note:</strong> Uploading a new image will replace the existing one.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {errors.image && <span className={`text-sm ${errorColor} mt-2 block`}>{errors.image}</span>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            className={`px-6 py-3 rounded-lg transition-all duration-200 ${bgSecondary} ${textPrimary} 
                                hover:${highlight} border ${borderColor} hover:border-purple-400`}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="gradient"
                            disabled={isLoading}
                            className={`px-6 py-3 font-medium rounded-lg flex items-center justify-center gap-2 
                                bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 
                                text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 
                                disabled:cursor-not-allowed disabled:transform-none min-w-[140px]`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <MdSave size={18} />
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