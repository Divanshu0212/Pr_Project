import { useState, useEffect, useContext } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    FaSearch, 
    FaFilter, 
    FaUser, 
    FaMapMarkerAlt, 
    FaGraduationCap,
    FaCode,
    FaGithub,
    FaLinkedin,
    FaExternalLinkAlt,
    FaStar,
    FaSort,
    FaChevronDown,
    FaChevronUp,
    FaTimes,
    FaUsers,
    FaChartBar,
    FaBookmark
} from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SummaryApi from '../../config';

const FindCandidatesPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);
    const { isDark } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Search state
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedSkills, setSelectedSkills] = useState(
        searchParams.get('skills') ? searchParams.get('skills').split(',') : []
    );
    const [selectedCategories, setSelectedCategories] = useState(
        searchParams.get('categories') ? searchParams.get('categories').split(',') : []
    );
    const [minExperience, setMinExperience] = useState(searchParams.get('experience') || '0');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [availability, setAvailability] = useState(searchParams.get('availability') || '');
    const [minProficiency, setMinProficiency] = useState(searchParams.get('proficiency') || '1');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    
    // UI state
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    // Build search parameters
    const buildSearchParams = () => {
        const params = {
            searchQuery,
            skills: selectedSkills.join(','),
            categories: selectedCategories.join(','),
            experience: minExperience,
            location,
            availability,
            minProficiency,
            sortBy,
            page: currentPage,
            limit: 12
        };
        return new URLSearchParams(
            Object.entries(params).filter(([, value]) => value !== '' && value !== '0')
        ).toString();
    };

    // Fetch candidates
    const { 
        data: candidatesData, 
        isLoading: isLoadingCandidates, 
        error: candidatesError,
        refetch: refetchCandidates 
    } = useQuery(
        ['candidates', searchQuery, selectedSkills, selectedCategories, minExperience, location, availability, minProficiency, sortBy, currentPage],
        async () => {
            if (!isAuthenticated) return null;

            const token = localStorage.getItem('token');
            const queryString = buildSearchParams();
            
            const response = await fetch(`${SummaryApi.candidates.search.url}?${queryString}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch candidates');
            }

            return response.json();
        },
        {
            enabled: !!isAuthenticated,
            staleTime: 2 * 60 * 1000,
            refetchOnWindowFocus: false
        }
    );

    // Fetch candidate statistics
    const { data: statsData, isLoading: isLoadingStats } = useQuery(
        ['candidateStats'],
        async () => {
            if (!isAuthenticated) return null;

            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.candidates.stats.url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            return response.json();
        },
        {
            enabled: !!isAuthenticated,
            staleTime: 10 * 60 * 1000
        }
    );

    // Update URL when search params change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','));
        if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
        if (minExperience !== '0') params.set('experience', minExperience);
        if (location) params.set('location', location);
        if (availability) params.set('availability', availability);
        if (minProficiency !== '1') params.set('proficiency', minProficiency);
        if (sortBy !== 'relevance') params.set('sort', sortBy);
        if (currentPage !== 1) params.set('page', currentPage.toString());

        setSearchParams(params);
    }, [searchQuery, selectedSkills, selectedCategories, minExperience, location, availability, minProficiency, sortBy, currentPage, setSearchParams]);

    // Handle skill selection
    const toggleSkill = (skill) => {
        setSelectedSkills(prev => 
            prev.includes(skill) 
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
        setCurrentPage(1);
    };

    // Handle category selection
    const toggleCategory = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
        setCurrentPage(1);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSkills([]);
        setSelectedCategories([]);
        setMinExperience('0');
        setLocation('');
        setAvailability('');
        setMinProficiency('1');
        setSortBy('relevance');
        setCurrentPage(1);
    };

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        refetchCandidates();
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // For future use - keeping for potential implementation
    // eslint-disable-next-line no-unused-vars
    const getExperienceLevel = (years) => {
        if (years < 1) return 'Entry Level';
        if (years < 3) return 'Junior';
        if (years < 5) return 'Mid Level';
        return 'Senior';
    };

    // eslint-disable-next-line no-unused-vars
    const getProficiencyColor = (proficiency) => {
        if (proficiency >= 8) return 'text-green-500 bg-green-100 dark:bg-green-900/30';
        if (proficiency >= 6) return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
        if (proficiency >= 4) return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
    };

    if (!isAuthenticated) {
        return (
            <div>
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                        <p className="text-gray-600 mb-6">Please log in to search for candidates.</p>
                        <Button onClick={() => navigate('/login')} className="bg-blue-500 hover:bg-blue-600">
                            Login
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    const candidates = candidatesData?.data?.candidates || [];
    const pagination = candidatesData?.data?.pagination || {};
    const filters = candidatesData?.data?.filters || {};
    const stats = statsData?.data || {};

    return (
        <div>
            <div className={`min-h-screen transition-colors duration-300 ${
                isDark
                    ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
                    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50'
            }`}>
                <div className="p-6 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Find Candidates
                        </h1>
                        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Discover talented developers with the skills you need
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    {!isLoadingStats && stats.totalCandidates && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card className={`p-6 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Total Candidates
                                        </p>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {stats.totalCandidates}
                                        </p>
                                    </div>
                                    <FaUsers className="w-8 h-8 text-blue-500" />
                                </div>
                            </Card>

                            <Card className={`p-6 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Skills Categories
                                        </p>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {stats.skillCategories?.length || 0}
                                        </p>
                                    </div>
                                    <FaCode className="w-8 h-8 text-green-500" />
                                </div>
                            </Card>

                            <Card className={`p-6 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Popular Skills
                                        </p>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {stats.popularSkills?.length || 0}
                                        </p>
                                    </div>
                                    <FaChartBar className="w-8 h-8 text-purple-500" />
                                </div>
                            </Card>

                            <Card className={`p-6 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Search Results
                                        </p>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {pagination.total || 0}
                                        </p>
                                    </div>
                                    <FaSearch className="w-8 h-8 text-orange-500" />
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Search and Filters */}
                    <Card className={`mb-8 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                        <div className="p-6">
                            {/* Search Bar */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, job title, or bio..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                >
                                    <FaSearch className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant="outline"
                                    className="px-6 py-3"
                                >
                                    <FaFilter className="w-4 h-4 mr-2" />
                                    Filters
                                    {showFilters ? <FaChevronUp className="w-4 h-4 ml-2" /> : <FaChevronDown className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <div className={`border-t pt-6 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Experience Level */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Min Experience (Years)
                                            </label>
                                            <select
                                                value={minExperience}
                                                onChange={(e) => setMinExperience(e.target.value)}
                                                className={`w-full px-3 py-2 rounded border ${
                                                    isDark 
                                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                            >
                                                <option value="0">Any Experience</option>
                                                <option value="1">1+ Years</option>
                                                <option value="2">2+ Years</option>
                                                <option value="3">3+ Years</option>
                                                <option value="5">5+ Years</option>
                                                <option value="7">7+ Years</option>
                                                <option value="10">10+ Years</option>
                                            </select>
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="City or Country"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className={`w-full px-3 py-2 rounded border ${
                                                    isDark 
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                            />
                                        </div>

                                        {/* Availability */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Availability
                                            </label>
                                            <select
                                                value={availability}
                                                onChange={(e) => setAvailability(e.target.value)}
                                                className={`w-full px-3 py-2 rounded border ${
                                                    isDark 
                                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                            >
                                                <option value="">Any Availability</option>
                                                <option value="available">Available</option>
                                                <option value="open_to_opportunities">Open to Opportunities</option>
                                                <option value="not_available">Not Available</option>
                                            </select>
                                        </div>

                                        {/* Min Proficiency */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Min Skill Proficiency
                                            </label>
                                            <select
                                                value={minProficiency}
                                                onChange={(e) => setMinProficiency(e.target.value)}
                                                className={`w-full px-3 py-2 rounded border ${
                                                    isDark 
                                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                            >
                                                <option value="1">Any Level</option>
                                                <option value="3">Beginner (3+)</option>
                                                <option value="5">Intermediate (5+)</option>
                                                <option value="7">Advanced (7+)</option>
                                                <option value="9">Expert (9+)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Skill Categories */}
                                    <div className="mt-6">
                                        <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Categories
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Languages', 'Frontend', 'Backend', 'Database', 'DevOps', 'Other'].map(category => (
                                                <button
                                                    key={category}
                                                    onClick={() => toggleCategory(category)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                                        selectedCategories.includes(category)
                                                            ? 'bg-blue-500 text-white'
                                                            : isDark 
                                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Available Skills */}
                                    {filters.availableSkills && filters.availableSkills.length > 0 && (
                                        <div className="mt-6">
                                            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Skills ({filters.availableSkills.length} available)
                                            </label>
                                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                                {filters.availableSkills.slice(0, 50).map(skill => (
                                                    <button
                                                        key={skill.name}
                                                        onClick={() => toggleSkill(skill.name)}
                                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                                            selectedSkills.includes(skill.name)
                                                                ? 'bg-green-500 text-white'
                                                                : isDark 
                                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                    >
                                                        {skill.name} ({skill.count})
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Filter Actions */}
                                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <Button
                                            onClick={clearFilters}
                                            variant="outline"
                                            className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <FaTimes className="w-4 h-4 mr-2" />
                                            Clear All Filters
                                        </Button>

                                        <div className="flex gap-2">
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Active filters: {[
                                                    searchQuery && 'Search',
                                                    selectedSkills.length > 0 && `${selectedSkills.length} Skills`,
                                                    selectedCategories.length > 0 && `${selectedCategories.length} Categories`,
                                                    minExperience !== '0' && 'Experience',
                                                    location && 'Location',
                                                    availability && 'Availability',
                                                    minProficiency !== '1' && 'Proficiency'
                                                ].filter(Boolean).join(', ') || 'None'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Sort and Results Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {isLoadingCandidates ? (
                                'Searching...'
                            ) : (
                                `${pagination.total || 0} candidates found`
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <FaSort className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className={`px-3 py-2 rounded border ${
                                    isDark 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            >
                                <option value="relevance">Most Relevant</option>
                                <option value="experience">Most Experienced</option>
                                <option value="skills">Most Skills</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="newest">Newest Members</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoadingCandidates && (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Searching for candidates...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {candidatesError && (
                        <Card className={`p-8 text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                            <p className={`text-lg font-semibold mb-4 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                                Error loading candidates
                            </p>
                            <p className={`mb-6 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                                {candidatesError.message}
                            </p>
                            <Button onClick={refetchCandidates} variant="outline">
                                Try Again
                            </Button>
                        </Card>
                    )}

                    {/* Results Grid */}
                    {!isLoadingCandidates && !candidatesError && (
                        <>
                            {candidates.length === 0 ? (
                                <Card className={`p-8 text-center ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                    <FaUsers className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        No candidates found
                                    </h3>
                                    <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Try adjusting your search criteria or removing some filters.
                                    </p>
                                    <Button onClick={clearFilters} className="bg-blue-500 hover:bg-blue-600">
                                        Clear Filters
                                    </Button>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {candidates.map((candidate) => (
                                        <CandidateCard 
                                            key={candidate._id} 
                                            candidate={candidate} 
                                            isDark={isDark}
                                            onSelect={setSelectedCandidate}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <Button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={!pagination.hasPrevPage}
                                        variant="outline"
                                        className="px-4 py-2"
                                    >
                                        Previous
                                    </Button>
                                    
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        const pageNum = Math.max(1, currentPage - 2) + i;
                                        if (pageNum > pagination.totalPages) return null;
                                        
                                        return (
                                            <Button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                variant={pageNum === currentPage ? "default" : "outline"}
                                                className="px-4 py-2"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                    
                                    <Button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                        variant="outline"
                                        className="px-4 py-2"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Candidate Detail Modal */}
            {selectedCandidate && (
                <CandidateModal 
                    candidate={selectedCandidate} 
                    isDark={isDark}
                    onClose={() => setSelectedCandidate(null)}
                />
            )}
        </div>
    );
};

// Candidate Card Component  
// eslint-disable-next-line react/prop-types
const CandidateCard = ({ candidate, isDark, onSelect }) => {
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();
    
    const getAvailabilityColor = (availability) => {
        switch (availability) {
            case 'available':
                return 'text-green-500 bg-green-100 dark:bg-green-900/30';
            case 'open_to_opportunities':
                return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
            case 'not_available':
                return 'text-red-500 bg-red-100 dark:bg-red-900/30';
            default:
                return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
        }
    };

    const formatAvailability = (availability) => {
        switch (availability) {
            case 'available':
                return 'Available';
            case 'open_to_opportunities':
                return 'Open to Opportunities';
            case 'not_available':
                return 'Not Available';
            default:
                return 'Unknown';
        }
    };

    return (
        <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${
            isDark ? 'bg-gray-800/30 hover:bg-gray-800/50' : 'bg-white/70 hover:bg-white'
        }`} onClick={() => onSelect(candidate)}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        {candidate.profileImage?.url ? (
                            <img
                                src={candidate.profileImage.url}
                                alt={candidate.displayName}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                            />
                        ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                                isDark ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                                <FaUser className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                        )}
                        <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {candidate.displayName}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                @{candidate.username}
                            </p>
                        </div>
                    </div>
                    
                    {candidate.relevanceScore && (
                        <div className="flex items-center">
                            <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {Math.round(candidate.relevanceScore)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Job Title & Location */}
                <div className="mb-4">
                    {candidate.portfolio?.jobTitle && (
                        <p className={`font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {candidate.portfolio.jobTitle}
                        </p>
                    )}
                    {candidate.portfolio?.location && (
                        <div className="flex items-center text-sm text-gray-500">
                            <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                            {candidate.portfolio.location}
                        </div>
                    )}
                </div>

                {/* Experience & Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={`text-center p-2 rounded ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {Math.round(candidate.experienceYears) || 0}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Years Exp.
                        </p>
                    </div>
                    <div className={`text-center p-2 rounded ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {candidate.skillsCount}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Skills
                        </p>
                    </div>
                </div>

                {/* Skills Preview */}
                {candidate.userSkills && candidate.userSkills.length > 0 && (
                    <div className="mb-4">
                        <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Top Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {candidate.userSkills
                                .sort((a, b) => b.proficiency - a.proficiency)
                                .slice(0, 3)
                                .map((skill, index) => (
                                <span
                                    key={index}
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                        isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                                    }`}
                                >
                                    {skill.name} ({skill.proficiency}/10)
                                </span>
                            ))}
                            {candidate.userSkills.length > 3 && (
                                <span className={`px-2 py-1 rounded text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    +{candidate.userSkills.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Availability */}
                {candidate.portfolio?.availability && (
                    <div className="mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getAvailabilityColor(candidate.portfolio.availability)
                        }`}>
                            {formatAvailability(candidate.portfolio.availability)}
                        </span>
                    </div>
                )}

                {/* Bio Preview */}
                {candidate.portfolio?.bio && (
                    <p className={`text-sm line-clamp-2 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {candidate.portfolio.bio}
                    </p>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                        {candidate.portfolio?.socialLinks?.github && (
                            <a
                                href={candidate.portfolio.socialLinks.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                            >
                                <FaGithub className="w-4 h-4" />
                            </a>
                        )}
                        {candidate.portfolio?.socialLinks?.linkedin && (
                            <a
                                href={candidate.portfolio.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                            >
                                <FaLinkedin className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                    
                    <Button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(candidate);
                        }}
                        className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600"
                    >
                        View Profile
                    </Button>
                </div>
            </div>
        </Card>
    );
};

// Candidate Detail Modal Component
// eslint-disable-next-line react/prop-types
const CandidateModal = ({ candidate, isDark, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center">
                            {candidate.profileImage?.url ? (
                                <img
                                    src={candidate.profileImage.url}
                                    alt={candidate.displayName}
                                    className="w-16 h-16 rounded-full object-cover mr-4"
                                />
                            ) : (
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${
                                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                    <FaUser className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                            )}
                            <div>
                                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {candidate.displayName}
                                </h2>
                                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {candidate.portfolio?.jobTitle || '@' + candidate.username}
                                </p>
                                {candidate.portfolio?.location && (
                                    <div className="flex items-center mt-1 text-gray-500">
                                        <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                                        {candidate.portfolio.location}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <Button onClick={onClose} variant="outline" className="p-2">
                            <FaTimes className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Bio */}
                            {candidate.portfolio?.bio && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        About
                                    </h3>
                                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                                        {candidate.portfolio.bio}
                                    </p>
                                </div>
                            )}

                            {/* Skills */}
                            {candidate.userSkills && candidate.userSkills.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Skills
                                    </h3>
                                    <div className="space-y-3">
                                        {['Languages', 'Frontend', 'Backend', 'Database', 'DevOps', 'Other'].map(category => {
                                            const categorySkills = candidate.userSkills.filter(skill => skill.category === category);
                                            if (categorySkills.length === 0) return null;
                                            
                                            return (
                                                <div key={category}>
                                                    <h4 className={`text-md font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {category}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {categorySkills.map((skill, index) => (
                                                            <span
                                                                key={index}
                                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                    isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                                                                }`}
                                                            >
                                                                {skill.name} ({skill.proficiency}/10)
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Experience */}
                            {candidate.experiences && candidate.experiences.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Experience
                                    </h3>
                                    <div className="space-y-4">
                                        {candidate.experiences.map((exp, index) => (
                                            <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                    {exp.position}
                                                </h4>
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {exp.company} • {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                                                </p>
                                                {exp.description && (
                                                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {candidate.projects && candidate.projects.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Projects
                                    </h3>
                                    <div className="space-y-4">
                                        {candidate.projects.slice(0, 3).map((project, index) => (
                                            <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                        {project.title}
                                                    </h4>
                                                    <div className="flex gap-2">
                                                        {project.githubUrl && (
                                                            <a
                                                                href={project.githubUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                                                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                                                }`}
                                                            >
                                                                <FaGithub className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        {project.liveUrl && (
                                                            <a
                                                                href={project.liveUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                                                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                                                }`}
                                                            >
                                                                <FaExternalLinkAlt className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                {project.description && (
                                                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {project.description}
                                                    </p>
                                                )}
                                                {project.technologies && project.technologies.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {project.technologies.map((tech, techIndex) => (
                                                            <span
                                                                key={techIndex}
                                                                className={`px-2 py-1 rounded text-xs ${
                                                                    isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                                                                }`}
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    Statistics
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Experience</span>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {Math.round(candidate.experienceYears) || 0} years
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Skills</span>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {candidate.skillsCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Projects</span>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {candidate.projectsCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Certificates</span>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {candidate.certificatesCount}
                                        </span>
                                    </div>
                                    {candidate.avgSkillProficiency && (
                                        <div className="flex justify-between">
                                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Proficiency</span>
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                {Math.round(candidate.avgSkillProficiency)}/10
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Availability */}
                            {candidate.portfolio?.availability && (
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Availability
                                    </h3>
                                    <span className={`px-3 py-2 rounded-full text-sm font-medium ${
                                        candidate.portfolio.availability === 'available'
                                            ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                                            : candidate.portfolio.availability === 'open_to_opportunities'
                                            ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {candidate.portfolio.availability === 'available' && 'Available for Work'}
                                        {candidate.portfolio.availability === 'open_to_opportunities' && 'Open to Opportunities'}
                                        {candidate.portfolio.availability === 'not_available' && 'Not Available'}
                                    </span>
                                </div>
                            )}

                            {/* Contact Links */}
                            {candidate.portfolio?.socialLinks && (
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Links
                                    </h3>
                                    <div className="space-y-2">
                                        {candidate.portfolio.socialLinks.github && (
                                            <a
                                                href={candidate.portfolio.socialLinks.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}
                                            >
                                                <FaGithub className="w-4 h-4 mr-2" />
                                                GitHub Profile
                                            </a>
                                        )}
                                        {candidate.portfolio.socialLinks.linkedin && (
                                            <a
                                                href={candidate.portfolio.socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}
                                            >
                                                <FaLinkedin className="w-4 h-4 mr-2" />
                                                LinkedIn Profile
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Certificates */}
                            {candidate.certificates && candidate.certificates.length > 0 && (
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Certificates
                                    </h3>
                                    <div className="space-y-2">
                                        {candidate.certificates.slice(0, 3).map((cert, index) => (
                                            <div key={index} className="flex items-start">
                                                <FaGraduationCap className={`w-4 h-4 mr-2 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                                <div>
                                                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                        {cert.title}
                                                    </p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {cert.issuer} • {new Date(cert.issueDate).getFullYear()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                        <Button
                            onClick={() => window.open(`mailto:${candidate.email}`, '_blank')}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            Contact Candidate
                        </Button>
                        <Button
                            onClick={() => {
                                // Add to bookmarks functionality can be implemented here
                                alert('Bookmarking feature coming soon!');
                            }}
                            variant="outline"
                        >
                            <FaBookmark className="w-4 h-4 mr-2" />
                            Bookmark
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindCandidatesPage;
