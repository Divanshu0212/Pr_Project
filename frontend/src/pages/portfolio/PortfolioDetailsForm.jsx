import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaGlobe, FaEnvelope, FaSave } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PortfolioDetailsForm = ({ onClose }) => {
    const { fetchPortfolioDetails, updatePortfolioDetails, portfolioDetails } = useContext(AuthContext);
    const { isDark } = useTheme();
    const [localFormData, setLocalFormData] = useState({ ...portfolioDetails });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Ensure portfolioDetails is not null/undefined before spreading
        setLocalFormData(prev => ({ 
            ...prev, // Keep previous state if portfolioDetails is null on initial render
            ...portfolioDetails 
        }));
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
                ...prev.socialLinks, // Ensure existing social links are preserved
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updatePortfolioDetails(localFormData);
            // Assuming fetchPortfolioDetails updates the context correctly
            await fetchPortfolioDetails(); 
            onClose();
        } catch (error) {
            console.error('Error updating portfolio details:', error);
            alert('Failed to update portfolio details'); // Provide user feedback
        } finally {
            setIsSubmitting(false);
        }
    };

    // Define common input and label classes for reusability and theming
    const inputClasses = `w-full p-4 rounded-xl transition-all duration-300 focus:scale-[1.02]
        ${isDark
            ? 'bg-[rgb(var(--color-background-secondary))] border-[rgb(var(--color-accent-neutral))] text-[rgb(var(--color-text-primary))] focus:border-[rgb(var(--color-accent-primary))] focus:shadow-[0_0_20px_rgba(0,255,255,0.3)]'
            : 'bg-[rgb(var(--color-background-primary))] border-[rgb(var(--color-accent-neutral))] text-[rgb(var(--color-text-primary))] focus:border-[rgb(var(--color-accent-primary))] focus:shadow-[0_0_20px_rgba(49,130,206,0.3)]'
        } border-2 focus:outline-none placeholder-[rgb(var(--color-text-placeholder))]`;

    const labelClasses = `block mb-3 font-semibold tracking-wide ${isDark ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-primary))]'}`;

    return (
        <div className="portfolio-form-container slide-in-up">
            <div className={`max-w-4xl mx-auto p-8 rounded-2xl shadow-2xl backdrop-blur-sm relative overflow-hidden
                ${isDark
                    ? 'bg-gradient-to-br from-[rgba(13,17,23,0.9)] via-[rgba(22,27,34,0.95)] to-[rgba(13,17,23,0.9)]'
                    : 'bg-gradient-to-br from-[rgba(255,255,255,0.9)] via-[rgba(247,250,252,0.95)] to-[rgba(255,255,255,0.9)]'
                }`}>

                {/* Animated background gradient */}
                <div className="gradient-mesh-bg"></div>

                {/* Header */}
                <div className="relative z-10 text-center mb-8 fade-in">
                    <h2 className={`text-4xl font-bold mb-2 gradient-text-primary`}>
                        Portfolio Details
                    </h2>
                    {/* Dynamic border color based on theme accent primary */}
                    <div className={`w-24 h-1 mx-auto rounded-full ${isDark ? 'bg-[rgb(var(--color-accent-primary))]' : 'bg-[rgb(var(--color-accent-primary))]'}`}></div>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                    {/* Basic Info Section */}
                    <div className="form-section slide-in-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="input-group">
                                <label className={labelClasses}>Job Title</label>
                                <input
                                    type="text"
                                    name="jobTitle"
                                    value={localFormData.jobTitle || ''} // Ensure default empty string for control
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="e.g., Full Stack Developer"
                                />
                            </div>

                            <div className="input-group">
                                <label className={labelClasses}>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={localFormData.location || ''} // Ensure default empty string
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="e.g., New York, USA"
                                />
                            </div>

                            <div className="input-group">
                                <label className={labelClasses}>Years of Experience</label>
                                <input
                                    type="number"
                                    name="yearsOfExperience"
                                    value={localFormData.yearsOfExperience || 0} // Ensure default 0 for number input
                                    onChange={handleChange}
                                    min="0"
                                    className={inputClasses}
                                    placeholder="0"
                                />
                            </div>

                            <div className="input-group">
                                <label className={labelClasses}>Availability</label>
                                <select
                                    name="availability"
                                    value={localFormData.availability || 'available'} // Default value
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="available">Available for work</option>
                                    <option value="not-available">Not available</option>
                                    <option value="freelance">Freelance/Contract</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="form-section slide-in-right">
                        <div className="input-group">
                            <label className={labelClasses}>Bio</label>
                            <textarea
                                name="bio"
                                value={localFormData.bio || ''} // Ensure default empty string
                                onChange={handleChange}
                                rows="5"
                                className={inputClasses}
                                placeholder="Tell us about yourself, your passions, and what drives you..."
                            />
                        </div>
                    </div>

                    {/* Social Links Section */}
                    <div className="form-section slide-in-up">
                        <h3 className={`text-2xl font-bold mb-6 gradient-text-secondary`}>
                            Social Links
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="social-input-group">
                                <div className="flex items-center space-x-3">
                                    <FaGithub className={`text-2xl ${isDark ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-primary))]'}`} />
                                    <input
                                        type="url"
                                        name="github"
                                        value={localFormData.socialLinks?.github || ''} // Handle nested optional chaining
                                        onChange={handleSocialLinkChange}
                                        placeholder="GitHub Profile URL"
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="social-input-group">
                                <div className="flex items-center space-x-3">
                                    <FaLinkedin className={`text-2xl ${isDark ? 'text-[rgb(var(--color-accent-primary))]' : 'text-[rgb(var(--color-accent-primary))]'}`} />
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={localFormData.socialLinks?.linkedin || ''}
                                        onChange={handleSocialLinkChange}
                                        placeholder="LinkedIn Profile URL"
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="social-input-group">
                                <div className="flex items-center space-x-3">
                                    <FaTwitter className={`text-2xl ${isDark ? 'text-[rgb(var(--color-accent-primary))]' : 'text-[rgb(var(--color-accent-primary))]'}`} />
                                    <input
                                        type="url"
                                        name="twitter"
                                        value={localFormData.socialLinks?.twitter || ''}
                                        onChange={handleSocialLinkChange}
                                        placeholder="Twitter Profile URL"
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="social-input-group">
                                <div className="flex items-center space-x-3">
                                    {/* Using a general accent color for social icons, adjust if specific branding needed */}
                                    <FaInstagram className={`text-2xl ${isDark ? 'text-[rgb(var(--color-highlight))]' : 'text-[rgb(var(--color-highlight))]'}`} />
                                    <input
                                        type="url"
                                        name="instagram"
                                        value={localFormData.socialLinks?.instagram || ''}
                                        onChange={handleSocialLinkChange}
                                        placeholder="Instagram Profile URL"
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="social-input-group">
                                <div className="flex items-center space-x-3">
                                    <FaFacebook className={`text-2xl ${isDark ? 'text-[rgb(var(--color-accent-primary))]' : 'text-[rgb(var(--color-accent-primary))]'}`} />
                                    <input
                                        type="url"
                                        name="facebook"
                                        value={localFormData.socialLinks?.facebook || ''}
                                        onChange={handleSocialLinkChange}
                                        placeholder="Facebook Profile URL"
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="social-input-group">
                                <div className="flex items-center space-x-3">
                                    <FaGlobe className={`text-2xl ${isDark ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-primary))]'}`} />
                                    <input
                                        type="url"
                                        name="website"
                                        value={localFormData.socialLinks?.website || ''}
                                        onChange={handleSocialLinkChange}
                                        placeholder="Personal Website URL"
                                        className={inputClasses}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 slide-in-up">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden
                                ${isDark
                                    ? 'bg-gradient-to-r from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))] text-[rgb(var(--color-background-primary))] hover:shadow-[0_10px_30px_rgba(0,255,255,0.4)]'
                                    : 'bg-gradient-to-r from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))] text-white hover:shadow-[0_10px_30px_rgba(49,130,206,0.4)]'
                                }`}
                        >
                            <span className="flex items-center justify-center space-x-3">
                                <FaSave className="text-xl" />
                                <span>{isSubmitting ? 'Saving...' : 'Save Portfolio Details'}</span>
                            </span>
                            {!isSubmitting && <div className="button-shine"></div>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- PropTypes for PortfolioDetailsForm ---
PortfolioDetailsForm.propTypes = {
    onClose: PropTypes.func.isRequired, // Define onClose as a required function
};

export default PortfolioDetailsForm;