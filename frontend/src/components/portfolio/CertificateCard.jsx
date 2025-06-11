import React from 'react';
import { FaExternalLinkAlt, FaEdit, FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';

const CertificateCard = ({ certificate, onEdit, onDelete }) => {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="bg-[#161B22] rounded-lg shadow-lg overflow-hidden border border-gray-800 hover:border-[#00FFFF] transition-colors">
            <div className="h-48 overflow-hidden">
                <img
                    src={certificate.image.url}
                    alt={certificate.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold text-[#E5E5E5] mb-2">{certificate.name}</h3>
                <div className="flex justify-between text-gray-400 text-sm mb-2">
                    <span>Issued by: {certificate.issuer}</span>
                    <span>{formatDate(certificate.issueDate)}</span>
                </div>
                {certificate.skills && certificate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {certificate.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-[#0D1117] border border-[#00FFFF] text-[#00FFFF] rounded-full text-xs"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <a
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-[#161B22] border border-[#00FFFF] text-[#00FFFF] rounded hover:bg-[#0D1117] transition-colors"
                    >
                        <FaExternalLinkAlt size={12} /> Verify
                    </a>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(certificate)}
                            className="p-2 text-gray-400 hover:text-[#00FFFF] transition-colors"
                        >
                            <FaEdit size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(certificate._id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <FaTrash size={16} />
                        </button>
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