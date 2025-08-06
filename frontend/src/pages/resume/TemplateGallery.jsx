import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/TemplateGallery.css';

// Mock data for resume templates
const TemplateGallery = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const templateData = [
        {
            id: 1,
            name: 'Modern Clean',
            description: 'A clean, modern design with subtle cyan accents. Perfect for tech professionals.',
            previewImage: '/api/placeholder/300/400',
            category: 'professional',
            color: 'cyan'
        },
        {
            id: 2,
            name: 'Creative Purple',
            description: 'Stand out with this creative design featuring purple accents. Ideal for design roles.',
            previewImage: '/api/placeholder/300/400',
            category: 'creative',
            color: 'purple'
        },
        {
            id: 3,
            name: 'Minimalist',
            description: 'A minimalist design that puts your content front and center. Works for any industry.',
            previewImage: '/api/placeholder/300/400',
            category: 'minimal',
            color: 'white'
        },
        {
            id: 4,
            name: 'Technical Focus',
            description: 'Designed for technical roles with sections for skills and projects prominently displayed.',
            previewImage: '/api/placeholder/300/400',
            category: 'technical',
            color: 'cyan'
        },
        {
            id: 5,
            name: 'Executive Pro',
            description: 'A professional template for executive and senior positions that emphasizes leadership.',
            previewImage: '/api/placeholder/300/400',
            category: 'professional',
            color: 'white'
        },
        {
            id: 6,
            name: 'Creative Portfolio',
            description: 'Visual-focused template with space for portfolio pieces and creative achievements.',
            previewImage: '/api/placeholder/300/400',
            category: 'creative',
            color: 'purple'
        }
    ];

    // Filter templates based on category and search term
    const filteredTemplates = templateData.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              template.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleTemplateSelect = (template) => {
        navigate('/resume/create', { state: { template } });
    };

    return (
        <div className="template-gallery-page">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Choose Your Template</h1>
                    <p className="page-subtitle">
                        Select from our professionally designed templates to start building your resume.
                        All templates are ATS-friendly and fully customizable.
                    </p>
                </div>

                <div className="filters-section">
                    <div className="category-filters">
                        <div className="filter-buttons">
                            {['all', 'professional', 'creative', 'minimal', 'technical'].map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`category-filter-button ${selectedCategory === category ? 'active' : ''}`}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="search-section">
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="templates-grid">
                    {filteredTemplates.map(template => (
                        <div key={template.id} className="template-card">
                            <div className="template-preview">
                                <img
                                    src={template.previewImage}
                                    alt={`${template.name} template preview`}
                                    className="preview-image"
                                />
                                <div className="preview-overlay">
                                    <button
                                        onClick={() => handleTemplateSelect(template)}
                                        className="use-template-button"
                                    >
                                        Use This Template
                                    </button>
                                </div>
                            </div>
                            <div className="template-info">
                                <h3 className="template-name">{template.name}</h3>
                                <p className="template-description">{template.description}</p>
                                <div className="template-footer">
                                    <span className="template-category">
                                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                                    </span>
                                    <button
                                        onClick={() => handleTemplateSelect(template)}
                                        className="select-button"
                                    >
                                        Select →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="no-results">
                        <p className="no-results-text">No templates match your current filters.</p>
                        <button
                            onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}
                            className="clear-filters-button"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateGallery;