import React, { useState, useEffect, useContext } from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaGlobe, FaEnvelope } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const PortfolioDetailsForm = ({ onClose }) => {
    const { fetchPortfolioDetails, updatePortfolioDetails, portfolioDetails } = useContext(AuthContext);
    const [localFormData, setLocalFormData] = useState({ ...portfolioDetails });
    useEffect(() => {
        setLocalFormData({ ...portfolioDetails });
    }, [portfolioDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialLinkChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updatePortfolioDetails(localFormData);
            await fetchPortfolioDetails(); // Refresh data
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error updating portfolio details:', error);
            alert('Failed to update portfolio details');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">Portfolio Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-300 mb-2">Job Title</label>
                        <input
                            type="text"
                            name="jobTitle"
                            value={localFormData.jobTitle}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={localFormData.location}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Years of Experience</label>
                        <input
                            type="number"
                            name="yearsOfExperience"
                            value={localFormData.yearsOfExperience}
                            onChange={handleChange}
                            min="0"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Availability</label>
                        <select
                            name="availability"
                            value={localFormData.availability}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                        >
                            <option value="available">Available for work</option>
                            <option value="not-available">Not available</option>
                            <option value="freelance">Freelance/Contract</option>
                        </select>
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-gray-300 mb-2">Bio</label>
                    <textarea
                        name="bio"
                        value={localFormData.bio}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                    />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-300">Social Links</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <FaGithub className="text-gray-300 mr-2" size={20} />
                            <input
                                type="url"
                                name="github"
                                value={localFormData.socialLinks.github}
                                onChange={handleSocialLinkChange}
                                placeholder="GitHub URL"
                                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center">
                            <FaLinkedin className="text-gray-300 mr-2" size={20} />
                            <input
                                type="url"
                                name="linkedin"
                                value={localFormData.socialLinks.linkedin}
                                onChange={handleSocialLinkChange}
                                placeholder="LinkedIn URL"
                                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center">
                            <FaTwitter className="text-gray-300 mr-2" size={20} />
                            <input
                                type="url"
                                name="twitter"
                                value={localFormData.socialLinks.twitter}
                                onChange={handleSocialLinkChange}
                                placeholder="Twitter URL"
                                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center">
                            <FaInstagram className="text-gray-300 mr-2" size={20} />
                            <input
                                type="url"
                                name="instagram"
                                value={localFormData.socialLinks.instagram}
                                onChange={handleSocialLinkChange}
                                placeholder="Instagram URL"
                                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center">
                            <FaFacebook className="text-gray-300 mr-2" size={20} />
                            <input
                                type="url"
                                name="facebook"
                                value={localFormData.socialLinks.facebook}
                                onChange={handleSocialLinkChange}
                                placeholder="Facebook URL"
                                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center">
                            <FaEnvelope className="text-gray-300 mr-2" size={20} />
                            <input
                                type="url"
                                name="website"
                                value={localFormData.socialLinks.website}
                                onChange={handleSocialLinkChange}
                                placeholder="Personal Website"
                                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded focus:border-cyan-400 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 rounded-lg font-medium transition-opacity"
                    >
                        Save Portfolio Details
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PortfolioDetailsForm;