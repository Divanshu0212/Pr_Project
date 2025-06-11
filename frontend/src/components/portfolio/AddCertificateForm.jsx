import React, { useState } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-[#161B22] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#00FFFF]">
                        {isEditing ? 'Edit Certificate' : 'Add New Certificate'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-400 mb-2">Certificate Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-[#0D1117] border border-gray-700 rounded focus:border-[#00FFFF] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Issuing Organization*</label>
                            <input
                                type="text"
                                name="issuer"
                                value={formData.issuer}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-[#0D1117] border border-gray-700 rounded focus:border-[#00FFFF] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Issue Date*</label>
                            <input
                                type="date"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-[#0D1117] border border-gray-700 rounded focus:border-[#00FFFF] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Credential ID (if any)</label>
                            <input
                                type="text"
                                name="credentialId"
                                value={formData.credentialId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-[#0D1117] border border-gray-700 rounded focus:border-[#00FFFF] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Credential URL*</label>
                            <input
                                type="url"
                                name="credentialUrl"
                                value={formData.credentialUrl}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-[#0D1117] border border-gray-700 rounded focus:border-[#00FFFF] focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 mb-2">Related Skills (comma separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="e.g., React, Node.js, MongoDB"
                                className="w-full px-4 py-2 bg-[#0D1117] border border-gray-700 rounded focus:border-[#00FFFF] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2">Certificate Image*</label>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative w-full md:w-1/2 h-48 bg-[#0D1117] border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Certificate Preview"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <FaUpload size={24} className="mx-auto mb-2 text-gray-400" />
                                        <p className="text-gray-400">Upload Certificate Image</p>
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
                                <p className="text-sm text-gray-400">
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

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-[#2D333B] text-[#E5E5E5] rounded-lg hover:bg-[#444C56] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            {isLoading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <MdSave size={20} /> {isEditing ? 'Update Certificate' : 'Save Certificate'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddCertificateForm.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    isEditing: PropTypes.bool
};

export default AddCertificateForm;