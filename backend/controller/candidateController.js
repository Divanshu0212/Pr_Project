const User = require('../models/User');
const Skill = require('../models/Skill');
const PortfolioDetails = require('../models/PortfolioDetails');
const Experience = require('../models/Experience');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');

// Advanced candidate search with multiple algorithms
exports.searchCandidates = async (req, res) => {
    try {
        const {
            skills = [],
            experience = 0,
            location = '',
            availability = '',
            searchQuery = '',
            sortBy = 'relevance',
            page = 1,
            limit = 20,
            minProficiency = 1,
            categories = []
        } = req.query;

        const offset = (page - 1) * limit;
        
        // Build base aggregation pipeline
        let pipeline = [];

        // Stage 1: Match users with skills if specified
        if (skills.length > 0) {
            const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
            pipeline.push({
                $lookup: {
                    from: 'skills',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'userSkills'
                }
            });

            // Filter by skills and proficiency
            pipeline.push({
                $match: {
                    'userSkills.name': { 
                        $in: skillsArray.map(skill => new RegExp(skill.trim(), 'i'))
                    },
                    'userSkills.proficiency': { $gte: parseInt(minProficiency) }
                }
            });
        } else {
            // Get all skills for each user
            pipeline.push({
                $lookup: {
                    from: 'skills',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'userSkills'
                }
            });
        }

        // Stage 2: Get portfolio details
        pipeline.push({
            $lookup: {
                from: 'portfoliodetails',
                localField: '_id',
                foreignField: 'userId',
                as: 'portfolio'
            }
        });

        // Stage 3: Get experiences
        pipeline.push({
            $lookup: {
                from: 'experiences',
                localField: '_id',
                foreignField: 'userId',
                as: 'experiences'
            }
        });

        // Stage 4: Get projects
        pipeline.push({
            $lookup: {
                from: 'projects',
                localField: '_id',
                foreignField: 'userId',
                as: 'projects'
            }
        });

        // Stage 5: Get certificates
        pipeline.push({
            $lookup: {
                from: 'certificates',
                localField: '_id',
                foreignField: 'userId',
                as: 'certificates'
            }
        });

        // Stage 6: Add computed fields for scoring
        pipeline.push({
            $addFields: {
                portfolio: { $arrayElemAt: ['$portfolio', 0] },
                skillsCount: { $size: '$userSkills' },
                experienceYears: {
                    $reduce: {
                        input: '$experiences',
                        initialValue: 0,
                        in: {
                            $add: [
                                '$$value',
                                {
                                    $divide: [
                                        {
                                            $subtract: [
                                                { $ifNull: ['$$this.endDate', new Date()] },
                                                '$$this.startDate'
                                            ]
                                        },
                                        365 * 24 * 60 * 60 * 1000 // Convert to years
                                    ]
                                }
                            ]
                        }
                    }
                },
                projectsCount: { $size: '$projects' },
                certificatesCount: { $size: '$certificates' },
                avgSkillProficiency: {
                    $cond: {
                        if: { $gt: [{ $size: '$userSkills' }, 0] },
                        then: { $avg: '$userSkills.proficiency' },
                        else: 0
                    }
                }
            }
        });

        // Stage 7: Apply filters
        let matchConditions = {};

        // Experience filter
        if (experience > 0) {
            matchConditions.experienceYears = { $gte: parseInt(experience) };
        }

        // Location filter
        if (location) {
            matchConditions['portfolio.location'] = new RegExp(location, 'i');
        }

        // Availability filter
        if (availability) {
            matchConditions['portfolio.availability'] = availability;
        }

        // Search query filter (search in name, bio, job title)
        if (searchQuery) {
            matchConditions.$or = [
                { displayName: new RegExp(searchQuery, 'i') },
                { username: new RegExp(searchQuery, 'i') },
                { 'portfolio.bio': new RegExp(searchQuery, 'i') },
                { 'portfolio.jobTitle': new RegExp(searchQuery, 'i') }
            ];
        }

        // Category filter
        if (categories.length > 0) {
            const categoriesArray = Array.isArray(categories) ? categories : categories.split(',');
            matchConditions['userSkills.category'] = { $in: categoriesArray };
        }

        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({ $match: matchConditions });
        }

        // Stage 8: Calculate relevance score for sorting
        if (skills.length > 0) {
            const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
            pipeline.push({
                $addFields: {
                    relevanceScore: {
                        $add: [
                            // Skill match score (40%)
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: '$userSkills',
                                                        cond: {
                                                            $in: [
                                                                '$$this.name',
                                                                skillsArray.map(s => new RegExp(s.trim(), 'i'))
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            skillsArray.length
                                        ]
                                    },
                                    40
                                ]
                            },
                            // Average skill proficiency score (30%)
                            { $multiply: ['$avgSkillProficiency', 3] },
                            // Experience score (20%)
                            { $multiply: [{ $min: ['$experienceYears', 10] }, 2] },
                            // Portfolio completeness score (10%)
                            {
                                $multiply: [
                                    {
                                        $add: [
                                            { $cond: [{ $ne: ['$portfolio.bio', ''] }, 2, 0] },
                                            { $cond: [{ $ne: ['$portfolio.jobTitle', ''] }, 2, 0] },
                                            { $cond: [{ $gt: ['$projectsCount', 0] }, 3, 0] },
                                            { $cond: [{ $gt: ['$certificatesCount', 0] }, 3, 0] }
                                        ]
                                    },
                                    1
                                ]
                            }
                        ]
                    }
                }
            });
        } else {
            pipeline.push({
                $addFields: {
                    relevanceScore: {
                        $add: [
                            { $multiply: ['$avgSkillProficiency', 4] },
                            { $multiply: [{ $min: ['$experienceYears', 10] }, 3] },
                            { $multiply: ['$skillsCount', 2] },
                            '$projectsCount',
                            '$certificatesCount'
                        ]
                    }
                }
            });
        }

        // Stage 9: Sort results
        let sortStage = {};
        switch (sortBy) {
            case 'experience':
                sortStage = { experienceYears: -1, relevanceScore: -1 };
                break;
            case 'skills':
                sortStage = { skillsCount: -1, avgSkillProficiency: -1 };
                break;
            case 'name':
                sortStage = { displayName: 1 };
                break;
            case 'newest':
                sortStage = { createdAt: -1 };
                break;
            case 'relevance':
            default:
                sortStage = { relevanceScore: -1, avgSkillProficiency: -1 };
                break;
        }
        pipeline.push({ $sort: sortStage });

        // Stage 10: Project final fields
        pipeline.push({
            $project: {
                _id: 1,
                username: 1,
                displayName: 1,
                email: 1,
                profileImage: 1,
                createdAt: 1,
                portfolio: {
                    jobTitle: 1,
                    location: 1,
                    bio: 1,
                    availability: 1,
                    yearsOfExperience: 1,
                    socialLinks: 1
                },
                userSkills: {
                    name: 1,
                    category: 1,
                    proficiency: 1,
                    icon: 1,
                    isFeatured: 1
                },
                experiences: {
                    company: 1,
                    position: 1,
                    startDate: 1,
                    endDate: 1,
                    description: 1
                },
                projects: {
                    title: 1,
                    description: 1,
                    technologies: 1,
                    githubUrl: 1,
                    liveUrl: 1
                },
                certificates: {
                    title: 1,
                    issuer: 1,
                    issueDate: 1,
                    credentialUrl: 1
                },
                skillsCount: 1,
                experienceYears: 1,
                projectsCount: 1,
                certificatesCount: 1,
                avgSkillProficiency: 1,
                relevanceScore: 1
            }
        });

        // Execute aggregation with pagination
        const totalPipeline = [...pipeline, { $count: 'total' }];
        const dataPipeline = [...pipeline, { $skip: offset }, { $limit: parseInt(limit) }];

        const [totalResult, candidates] = await Promise.all([
            User.aggregate(totalPipeline),
            User.aggregate(dataPipeline)
        ]);

        const total = totalResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);

        // Get all available skills for filters
        const availableSkills = await Skill.aggregate([
            { $group: { _id: '$name', category: { $first: '$category' }, count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 100 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                candidates,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                filters: {
                    availableSkills: availableSkills.map(skill => ({
                        name: skill._id,
                        category: skill.category,
                        count: skill.count
                    })),
                    categories: ['Languages', 'Frontend', 'Backend', 'Database', 'DevOps', 'Other']
                }
            }
        });

    } catch (error) {
        console.error('Error searching candidates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search candidates',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get candidate statistics for dashboard
exports.getCandidateStats = async (req, res) => {
    try {
        const stats = await Promise.all([
            // Total candidates
            User.countDocuments(),
            
            // Candidates by experience level
            User.aggregate([
                {
                    $lookup: {
                        from: 'experiences',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'experiences'
                    }
                },
                {
                    $addFields: {
                        experienceYears: {
                            $reduce: {
                                input: '$experiences',
                                initialValue: 0,
                                in: {
                                    $add: [
                                        '$$value',
                                        {
                                            $divide: [
                                                {
                                                    $subtract: [
                                                        { $ifNull: ['$$this.endDate', new Date()] },
                                                        '$$this.startDate'
                                                    ]
                                                },
                                                365 * 24 * 60 * 60 * 1000
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            $switch: {
                                branches: [
                                    { case: { $lt: ['$experienceYears', 1] }, then: 'Entry Level' },
                                    { case: { $lt: ['$experienceYears', 3] }, then: 'Junior' },
                                    { case: { $lt: ['$experienceYears', 5] }, then: 'Mid Level' },
                                    { case: { $gte: ['$experienceYears', 5] }, then: 'Senior' }
                                ],
                                default: 'Entry Level'
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]),
            
            // Most popular skills
            Skill.aggregate([
                { $group: { _id: '$name', count: { $sum: 1 }, category: { $first: '$category' } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            
            // Skills by category
            Skill.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCandidates: stats[0],
                experienceLevels: stats[1],
                popularSkills: stats[2],
                skillCategories: stats[3]
            }
        });

    } catch (error) {
        console.error('Error getting candidate stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get candidate statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get detailed candidate profile
exports.getCandidateProfile = async (req, res) => {
    try {
        const { candidateId } = req.params;

        const candidate = await User.aggregate([
            { $match: { _id: candidateId } },
            {
                $lookup: {
                    from: 'skills',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'skills'
                }
            },
            {
                $lookup: {
                    from: 'portfoliodetails',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'portfolio'
                }
            },
            {
                $lookup: {
                    from: 'experiences',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'experiences'
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'projects'
                }
            },
            {
                $lookup: {
                    from: 'certificates',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'certificates'
                }
            },
            {
                $project: {
                    password: 0,
                    googleId: 0,
                    githubId: 0
                }
            }
        ]);

        if (!candidate || candidate.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        res.status(200).json({
            success: true,
            data: candidate[0]
        });

    } catch (error) {
        console.error('Error getting candidate profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get candidate profile',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
