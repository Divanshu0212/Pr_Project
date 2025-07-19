import React, { useState } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext'; // Import your theme hook
import Button from '../common/Button'; // Use your styled Button component
import Modal from '../common/Modal'; // Use your Modal for overlay


const AddCertificateForm = ({ onClose, onSubmit, initialData = {}, isEditing = false }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        issuer: initialData?.issuer || '',
        issueDate: initialData?.issueDate ? new Date(initialData?.issueDate).toISOString().split('T')[0] : '',
        credentialId: initialData?.credentialId || '',
        credentialUrl: initialData?.credentialUrl || '',
        skills: initialData?.skills ? initialData?.skills.join(', ') : '',
        image: null
    });

    const [previewImage, setPreviewImage] = useState(initialData?.image?.url || null);
    const [isLoading, setIsLoading] = useState(false);
    const { theme, isDark } = useTheme();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('File size should be less than 5MB');
            return;
        }

        setFormData(prev => ({ ...prev, image: file }));
        setPreviewImage(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('issuer', formData.issuer);
            data.append('issueDate', formData.issueDate);
            if (formData.credentialId) data.append('credentialId', formData.credentialId);
            data.append('credentialUrl', formData.credentialUrl);
            if (formData.skills) data.append('skills', formData.skills);
            if (formData.image) data.append('image', formData.image);

            await onSubmit(data, isEditing ? initialData?._id : null);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Theme-based classes
    const bgPrimary = isDark ? 'bg-[#161B22]' : 'bg-white';
    const bgSecondary = isDark ? 'bg-[#0D1117]' : 'bg-[#F7FAFC]';
    const textPrimary = isDark ? 'text-[#E5E5E5]' : 'text-[#1A202C]';
    const accent = isDark ? 'text-[#00FFFF]' : 'text-[#3182CE]';
    const highlight = isDark ? 'text-[#9C27B0]' : 'text-[#805AD5]';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';

    return (
        <Modal onClose={onClose} className={`add-cert-modal ${bgPrimary} fade-in`}>
            <div className={`rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl ${bgPrimary} glide-in`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold gradient-text`}>
                        {isEditing ? 'Edit Certificate' : 'Add New Certificate'}
                    </h2>
                    <Button
                        variant="icon"
                        onClick={onClose}
                        className={`hover:${accent} transition-colors`}
                        aria-label="Close"
                    >
                        <FaTimes size={24} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="fade-up">
                            <label className={`block mb-2 ${textPrimary}`}>Certificate Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 ${bgSecondary} ${borderColor} border rounded focus:border-[#00FFFF] focus:outline-none ${textPrimary} transition-all`}
                            />
                        </div>
                        <div className="fade-up">
                            <label className={`block mb-2 ${textPrimary}`}>Issuing Organization*</label>
                            <input
                                type="text"
                                name="issuer"
                                value={formData.issuer}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 ${bgSecondary} ${borderColor} border rounded focus:border-[#00FFFF] focus:outline-none ${textPrimary} transition-all`}
                            />
                        </div>
                        <div className="fade-up">
                            <label className={`block mb-2 ${textPrimary}`}>Issue Date*</label>
                            <input
                                type="date"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 ${bgSecondary} ${borderColor} border rounded focus:border-[#00FFFF] focus:outline-none ${textPrimary} transition-all`}
                            />
                        </div>
                        <div className="fade-up">
                            <label className={`block mb-2 ${textPrimary}`}>Credential ID (if any)</label>
                            <input
                                type="text"
                                name="credentialId"
                                value={formData.credentialId}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 ${bgSecondary} ${borderColor} border rounded focus:border-[#00FFFF] focus:outline-none ${textPrimary} transition-all`}
                            />
                        </div>
                        <div className="fade-up">
                            <label className={`block mb-2 ${textPrimary}`}>Credential URL*</label>
                            <input
                                type="url"
                                name="credentialUrl"
                                value={formData.credentialUrl}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 ${bgSecondary} ${borderColor} border rounded focus:border-[#00FFFF] focus:outline-none ${textPrimary} transition-all`}
                            />
                        </div>
                        <div className="md:col-span-2 fade-up">
                            <label className={`block mb-2 ${textPrimary}`}>Related Skills (comma separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="e.g., React, Node.js, MongoDB"
                                className={`w-full px-4 py-2 ${bgSecondary} ${borderColor} border rounded focus:border-[#00FFFF] focus:outline-none ${textPrimary} transition-all`}
                            />
                        </div>
                    </div>

                    <div className="mb-6 fade-up">
                        <label className={`block mb-2 ${textPrimary}`}>Certificate Image*</label>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className={`relative w-full md:w-1/2 h-48 ${bgSecondary} border-2 border-dashed ${borderColor} rounded-lg flex items-center justify-center overflow-hidden`}>
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Certificate Preview"
                                        className="w-full h-full object-contain animate-img-pop"
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <FaUpload size={24} className={`mx-auto mb-2 ${accent}`} />
                                        <p className={textPrimary}>Upload Certificate Image</p>
                                        <p className="text-xs text-gray-500">(JPEG, PNG, max 5MB)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required={!isEditing}
                                />
                            </div>
                            <div className="w-full md:w-1/2">
                                <p className={`text-sm ${textPrimary}`}>
                                    Upload a clear image or scan of your certificate. The image should be in JPEG or PNG format and not exceed 5MB in size.
                                </p>
                                {isEditing && (
                                    <p className="text-sm text-yellow-400 mt-2">
                                        Note: Uploading a new image will replace the existing one.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 fade-up">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className={`px-6 py-2 rounded-lg transition-colors ${bgSecondary} ${textPrimary} hover:${highlight}`}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="gradient"
                            disabled={isLoading}
                            className="px-6 py-2 font-medium rounded-lg flex items-center gap-2 gradient-btn"
                        >
                            {isLoading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <MdSave size={20} /> {isEditing ? 'Update Certificate' : 'Save Certificate'}
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

export default AddCertificateForm;