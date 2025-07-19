import React from 'react';
import { FaExternalLinkAlt, FaEdit, FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/animations.css';

const CertificateCard = ({ certificate, onEdit, onDelete }) => {
    const { theme } = useTheme();
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const cardClasses = `
        certificate-card group relative overflow-hidden rounded-xl shadow-lg
        transition-all duration-500 ease-out transform
        hover:scale-[1.02] hover:shadow-2xl
        ${theme === 'dark' 
            ? 'bg-gradient-to-br from-[rgb(22,27,34)] to-[rgb(13,17,23)] border border-gray-800 hover:border-[#00FFFF]' 
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-blue-400'
        }
        animate-fadeInUp
    `;

    const textPrimary = theme === 'dark' ? 'text-[#E5E5E5]' : 'text-gray-900';
    const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const accent = theme === 'dark' ? '#00FFFF' : '#3182CE';
    const accentText = theme === 'dark' ? 'text-[#00FFFF]' : 'text-blue-600';

    return (
        <div className={cardClasses}>
            {/* Gradient overlay for hover effect */}
            <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300
                ${theme === 'dark' 
                    ? 'bg-gradient-to-br from-[#00FFFF] to-[#9C27B0]' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }
            `} />
            
            <div className="relative z-10">
                {/* Image Section */}
                <div className="h-48 overflow-hidden rounded-t-xl">
                    <img
                        src={certificate.image.url}
                        alt={certificate.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                    {/* Title with gradient text */}
                    <h3 className={`
                        text-xl font-bold mb-2 transition-all duration-300
                        ${textPrimary}
                        group-hover:bg-gradient-to-r 
                        ${theme === 'dark' 
                            ? 'group-hover:from-[#00FFFF] group-hover:to-[#9C27B0]' 
                            : 'group-hover:from-blue-600 group-hover:to-purple-600'
                        }
                        group-hover:bg-clip-text group-hover:text-transparent
                    `}>
                        {certificate.name}
                    </h3>

                    {/* Date and Issuer */}
                    <div className={`flex justify-between ${textSecondary} text-sm mb-3`}>
                        <span className="font-medium">
                            <span className="opacity-70">Issued by:</span> {certificate.issuer}
                        </span>
                        <span className="font-mono">{formatDate(certificate.issueDate)}</span>
                    </div>

                    {/* Skills */}
                    {certificate.skills && certificate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {certificate.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className={`
                                        px-3 py-1 rounded-full text-xs font-medium
                                        transition-all duration-300 transform hover:scale-105
                                        ${theme === 'dark' 
                                            ? 'bg-[#0D1117] border border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black' 
                                            : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
                                        }
                                    `}
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-opacity-20 border-gray-500">
                        <a
                            href={certificate.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                                group/link flex items-center gap-2 px-4 py-2 rounded-lg
                                transition-all duration-300 transform hover:scale-105
                                ${theme === 'dark' 
                                    ? 'bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black hover:shadow-lg hover:shadow-cyan-500/25' 
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                                }
                                font-medium
                            `}
                        >
                            <FaExternalLinkAlt 
                                size={12} 
                                className="transition-transform duration-300 group-hover/link:translate-x-1" 
                            />
                            Verify Certificate
                        </a>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(certificate)}
                                className={`
                                    p-2 rounded-lg transition-all duration-300
                                    ${theme === 'dark' 
                                        ? 'text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10' 
                                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                    }
                                    transform hover:scale-110
                                `}
                                title="Edit Certificate"
                            >
                                <FaEdit size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(certificate._id)}
                                className={`
                                    p-2 rounded-lg transition-all duration-300
                                    ${theme === 'dark' 
                                        ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' 
                                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                    }
                                    transform hover:scale-110
                                `}
                                title="Delete Certificate"
                            >
                                <FaTrash size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

CertificateCard.propTypes = {
    certificate: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default CertificateCard;