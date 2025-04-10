import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data for resume templates
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

const TemplateGallery = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter templates based on category and search term
    const filteredTemplates = templateData.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              template.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleTemplateSelect = (templateId) => {
        // Store selected template in localStorage for the next step
        localStorage.setItem('selectedTemplateId', templateId);
        // Navigate to the resume builder with the selected template
        navigate('/resume/create', { state: { templateId } });
    };

    return (
        <div className="bg-[#0D1117] text-[#E5E5E5] min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-4 text-[#00FFFF]">Choose Your Template</h1>
                    <p className="text-xl max-w-3xl mx-auto text-gray-300">
                        Select from our professionally designed templates to start building your resume.
                        All templates are ATS-friendly and fully customizable.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-between mb-8">
                    {/* Filter Options */}
                    <div className="mb-4 md:mb-0">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-md ${selectedCategory === 'all' ?
                                    'bg-[#9C27B0] text-white' : 'bg-[#161B22] text-[#E5E5E5] hover:bg-[#1E293B]'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setSelectedCategory('professional')}
                                className={`px-4 py-2 rounded-md ${selectedCategory === 'professional' ?
                                    'bg-[#9C27B0] text-white' : 'bg-[#161B22] text-[#E5E5E5] hover:bg-[#1E293B]'}`}
                            >
                                Professional
                            </button>
                            <button
                                onClick={() => setSelectedCategory('creative')}
                                className={`px-4 py-2 rounded-md ${selectedCategory === 'creative' ?
                                    'bg-[#9C27B0] text-white' : 'bg-[#161B22] text-[#E5E5E5] hover:bg-[#1E293B]'}`}
                            >
                                Creative
                            </button>
                            <button
                                onClick={() => setSelectedCategory('minimal')}
                                className={`px-4 py-2 rounded-md ${selectedCategory === 'minimal' ?
                                    'bg-[#9C27B0] text-white' : 'bg-[#161B22] text-[#E5E5E5] hover:bg-[#1E293B]'}`}
                            >
                                Minimal
                            </button>
                            <button
                                onClick={() => setSelectedCategory('technical')}
                                className={`px-4 py-2 rounded-md ${selectedCategory === 'technical' ?
                                    'bg-[#9C27B0] text-white' : 'bg-[#161B22] text-[#E5E5E5] hover:bg-[#1E293B]'}`}
                            >
                                Technical
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 bg-[#161B22] border border-gray-700 rounded-md focus:outline-none focus:border-[#00FFFF] w-full"
                        />
                    </div>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="bg-[#161B22] rounded-lg overflow-hidden border border-gray-700 hover:border-[#9C27B0] transition-all shadow-md"
                        >
                            <div className="relative">
                                <img
                                    src={template.previewImage}
                                    alt={`${template.name} template preview`}
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center">
                                    <button
                                        onClick={() => handleTemplateSelect(template.id)}
                                        className="bg-[#9C27B0] text-white py-2 px-4 rounded-md opacity-0 hover:opacity-100 transition-all transform translate-y-4 hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#9C27B0] focus:ring-offset-1"
                                    >
                                        Use This Template
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-bold mb-2 text-[#00FFFF]">{template.name}</h3>
                                <p className="text-sm text-gray-300 mb-3">{template.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm px-3 py-1 bg-gray-800 rounded-full">
                                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                                    </span>
                                    <button
                                        onClick={() => handleTemplateSelect(template.id)}
                                        className="text-[#00FFFF] hover:text-[#9C27B0] transition-colors focus:outline-none"
                                    >
                                        Select →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-2xl text-gray-400">No templates match your current filters.</p>
                        <button
                            onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}
                            className="mt-4 text-[#00FFFF] hover:text-[#9C27B0] focus:outline-none"
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