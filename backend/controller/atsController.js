// backend/controller/atsController.js
const AtsAnalysis = require('../models/AtsAnalysis');
const AtsHistoryScore = require('../models/AtsHistoryScore');
const mongoose = require('mongoose'); // For ObjectId validation
const Joi = require('@hapi/joi'); // For robust input validation
const multer = require('multer'); // Import multer to catch MulterErrors

// Import new utilities
const malwareScanner = require('../utils/malwareScanner');
const { parseResume } = require('../utils/resumeParser'); // Destructure to get parseResume function
const { redactPii } = require('../utils/piiRedactor'); // Destructure to get redactPii function
const logger = require('../utils/logger'); // Import the logger

// Helper for sending consistent error responses and logging
const sendErrorResponse = (res, statusCode, message, errors = null) => {
    // Log the error using the imported logger
    logger.error(`Sending error response: ${message}`, { statusCode, errors });
    res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};

// Joi schema for validating the incoming request body for ATS analysis
const analyzeResumeSchema = Joi.object({
    resumeTitle: Joi.string().trim().max(255).optional().allow(''),
    jobDescription: Joi.string().trim().min(50).optional().allow('') // Add jobDescription field
});

// Joi schema for validating the incoming text for keyword extraction
const keywordExtractionSchema = Joi.object({
    text: Joi.string().trim().min(20).max(10000).required() // Text to analyze, e.g., job description or resume snippet
});

// @route   POST /api/ats/analyze
// @desc    Upload a resume file and job description for ATS analysis
// @access  Private
exports.analyzeResume = async (req, res) => {
    // Multer middleware (uploadResume.single('resumeFile')) handles the file upload
    if (!req.file) {
        logger.warn('Attempted ATS analysis without file upload or invalid file type.', { userId: req.user ? req.user.id : 'N/A' });
        return sendErrorResponse(res, 400, 'No resume file uploaded or invalid file type.');
    }

    const { error, value } = analyzeResumeSchema.validate(req.body);
    if (error) {
        logger.warn('Invalid request data for ATS analysis.', { userId: req.user.id, errors: error.details });
        return sendErrorResponse(res, 400, 'Invalid request data.', error.details);
    }

    const resumeBuffer = req.file.buffer;
    const resumeMimeType = req.file.mimetype;
    const userId = req.user.id;
    const resumeTitle = value.resumeTitle || req.file.originalname || 'Uploaded Resume';
    const jobDescription = value.jobDescription || '';

    logger.info('Starting ATS analysis process.', { userId, resumeTitle, hasJobDescription: jobDescription.length > 0 });

    try {
        // --- STEP 1: Malware Scanning ---
        logger.security(`Initiating malware scan for user ${userId}.`);
        const scanResult = await malwareScanner.scan(resumeBuffer);

        if (scanResult.isInfected) {
            logger.security(`MALWARE DETECTED: User ${userId} uploaded malicious file.`, { details: scanResult.details });
            return sendErrorResponse(res, 400, `Malicious file detected. ${scanResult.details}`);
        }
        logger.security(`Malware scan clean for user ${userId}.`);

        // --- STEP 2: Resume Parsing ---
        logger.info(`Parsing resume file (${resumeMimeType}) for user ${userId}.`);
        let resumeText = await parseResume(resumeBuffer, resumeMimeType);
        logger.debug(`Resume text extracted for user ${userId}. Length: ${resumeText.length}.`);

        // --- STEP 3: PII Redaction/Pseudonymization ---
        logger.security(`Redacting PII from resume text for user ${userId}.`);
        const redactedResumeText = redactPii(resumeText);
        logger.debug(`PII redaction complete for user ${userId}. Original length: ${resumeText.length}, Redacted length: ${redactedResumeText.length}.`);

        let redactedJobDescription = jobDescription;
        if (jobDescription) {
            logger.security(`Redacting PII from job description for user ${userId}.`);
            redactedJobDescription = redactPii(jobDescription);
            logger.debug(`PII redaction complete for job description for user ${userId}. Original length: ${jobDescription.length}, Redacted length: ${redactedJobDescription.length}.`);
        }

        // --- STEP 4: Core ATS Logic (Placeholder for actual NLP/AI integration) ---
        logger.info(`Performing core ATS analysis using redacted texts for user ${userId}.`);

        const analysisResult = {
            matchScore: Math.floor(Math.random() * 100) + 1,
            keywordsFound: ['Leadership', 'Teamwork', 'Communication', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'API Design', 'Problem-Solving', 'Agile Methodologies'],
            formatScore: Math.floor(Math.random() * 20) + 80,
            suggestions: [
                'Add more quantifiable achievements to your experience section (e.g., "Increased sales by 15%").',
                'Tailor your resume keywords more closely to the specific job description by incorporating industry-specific terms.',
                'Ensure consistent formatting throughout the document, including font sizes and spacing.',
                'Consider adding a professional summary or objective statement if not already present, highlighting key skills.',
                'Proofread carefully for any grammatical errors or typos.'
            ],
            sectionsAnalyzed: {
                summary: { score: Math.floor(Math.random() * 20) + 70, feedback: 'Good summary, but could be more impactful. Try to include a career goal.' },
                experience: { score: Math.floor(Math.random() * 20) + 60, feedback: 'Quantify achievements using numbers and metrics. Use strong action verbs.' },
                skills: { score: Math.floor(Math.random() * 20) + 80, feedback: 'Comprehensive skills section. Ensure they are relevant to target jobs.' },
                education: { score: Math.floor(Math.random() * 20) + 85, feedback: 'Clear and concise.' }
            },
            missingKeywords: ['Cloud Computing', 'Data Analytics', 'Machine Learning']
        };
        logger.info('ATS analysis simulation complete.', { userId, matchScore: analysisResult.matchScore });

        // Prepare detailed scores for history tracking
        const detailedScores = {
            keywords: Math.floor(Math.random() * 20) + 70,
            formatting: analysisResult.formatScore,
            experience: analysisResult.sectionsAnalyzed.experience.score,
            skills: analysisResult.sectionsAnalyzed.skills.score,
            education: analysisResult.sectionsAnalyzed.education.score,
            summary: analysisResult.sectionsAnalyzed.summary.score
        };

        // --- STEP 5: Save Analysis Report to Database ---
        const newAnalysis = new AtsAnalysis({
            userId: userId,
            resumeTitle: resumeTitle,
            jobTitle: jobDescription.substring(0, 255) || 'General Application', // Store jobDescription as jobTitle (trimmed) or default
            analysisDate: new Date(),
            summary: {
                matchScore: analysisResult.matchScore,
                keywordCount: analysisResult.keywordsFound.length
            },
            reportData: JSON.stringify(analysisResult)
        });

        await newAnalysis.save();
        logger.security(`ATS analysis report saved successfully.`, { userId, analysisId: newAnalysis._id });

        // --- STEP 6: Store ATS Score History (only if different from previous) ---
        try {
            const shouldStore = await AtsHistoryScore.shouldStoreScore(userId, analysisResult.matchScore, detailedScores);
            
            if (shouldStore) {
                const historyScore = new AtsHistoryScore({
                    userId: userId,
                    overallScore: analysisResult.matchScore,
                    detailedScores: detailedScores,
                    resumeTitle: resumeTitle,
                    jobTitle: jobDescription.substring(0, 255) || 'General Application',
                    analysisDate: new Date(),
                    analysisId: newAnalysis._id
                });

                await historyScore.save();
                logger.info(`ATS score history saved successfully.`, { 
                    userId, 
                    overallScore: analysisResult.matchScore,
                    scoreId: historyScore._id,
                    reason: 'Score significantly different from previous analysis'
                });
            } else {
                logger.info(`ATS score unchanged, skipping history storage.`, { 
                    userId, 
                    overallScore: analysisResult.matchScore,
                    reason: 'Score change below tolerance threshold (1%)'
                });
            }
        } catch (historyError) {
            logger.error('Error saving ATS score history:', { userId, error: historyError.message });
            // Don't fail the entire request if history storage fails
        }

        res.status(201).json({
            success: true,
            message: 'Resume analyzed successfully. Redirecting to analysis report.',
            analysisId: newAnalysis._id,
            summary: newAnalysis.summary
        });

    } catch (error) {
        logger.error('Error during ATS analysis process.', {
            userId: req.user ? req.user.id : 'N/A',
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack
        });

        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return sendErrorResponse(res, 400, 'File size too large. Maximum 5MB allowed.', { originalError: error.message });
            }
            return sendErrorResponse(res, 400, `File upload error: ${error.message}`, { originalError: error.message });
        }
        if (error.message.includes('Failed to parse resume') || error.message.includes('Unsupported resume file type')) {
            return sendErrorResponse(res, 400, `Failed to process resume file: ${error.message}`, { originalError: error.message });
        }

        sendErrorResponse(res, 500, 'Server error during resume analysis. Please try again.', { originalError: error.message });
    }
};

// @route   GET /api/ats/history
// @desc    Get a summary list of all ATS analyses for the authenticated user
// @access  Private
exports.getAtsHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        const history = await AtsAnalysis.find({ userId })
            .select('analysisId resumeTitle jobTitle analysisDate summary reportData createdAt')
            .sort({ analysisDate: -1 });

        // Parse the report data to include overall score for frontend
        const formattedHistory = history.map(item => {
            let overall_score = 0;
            let analysis_timestamp = item.analysisDate;
            
            // Try to get score from summary first, then from reportData
            if (item.summary && item.summary.matchScore) {
                overall_score = item.summary.matchScore;
            } else if (item.reportData) {
                try {
                    const parsedData = JSON.parse(item.reportData);
                    overall_score = parsedData.overall_score || parsedData.matchScore || 0;
                    if (parsedData.analysis_timestamp) {
                        analysis_timestamp = parsedData.analysis_timestamp;
                    }
                } catch (e) {
                    console.warn('Could not parse reportData for analysis:', item._id);
                }
            }

            return {
                _id: item._id,
                analysisId: item.analysisId,
                resumeTitle: item.resumeTitle || 'Untitled Resume',
                jobTitle: item.jobTitle || 'General Analysis',
                analysisDate: item.analysisDate,
                analysis_timestamp: analysis_timestamp,
                overall_score: overall_score,
                summary: item.summary,
                createdAt: item.createdAt
            };
        });

        res.status(200).json({
            success: true,
            count: formattedHistory.length,
            history: formattedHistory
        });
    } catch (error) {
        logger.error('Error fetching ATS history:', { userId, errorMessage: error.message, stack: error.stack });
        sendErrorResponse(res, 500, 'Server error. Could not retrieve ATS history.');
    }
};

// @route   GET /api/ats/analysis/:analysisId
// @desc    Get a specific ATS analysis report by its unique ID
// @access  Private
exports.getAtsAnalysisById = async (req, res) => {
    const userId = req.user.id;
    const { analysisId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(analysisId)) {
        logger.warn('Invalid analysis ID format provided for getAtsAnalysisById.', { userId, analysisId });
        return sendErrorResponse(res, 400, 'Invalid analysis ID format.');
    }

    try {
        const analysis = await AtsAnalysis.findOne({ _id: analysisId, userId });

        if (!analysis) {
            logger.info('ATS analysis report not found or not authorized for user.', { userId, analysisId });
            return sendErrorResponse(res, 404, 'ATS analysis report not found or not authorized.');
        }

        res.status(200).json({
            success: true,
            message: 'ATS analysis report retrieved successfully.',
            analysis: analysis
        });
    } catch (error) {
        logger.error('Error fetching ATS analysis by ID:', { userId, analysisId, errorMessage: error.message, stack: error.stack });
        sendErrorResponse(res, 500, 'Server error. Could not retrieve ATS analysis report.');
    }
};

// @route   DELETE /api/ats/analysis/:analysisId
// @desc    Delete a specific ATS analysis report by its unique ID
// @access  Private
exports.deleteAtsAnalysis = async (req, res) => {
    const userId = req.user.id;
    const { analysisId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(analysisId)) {
        logger.warn('Invalid analysis ID format provided for deleteAtsAnalysis.', { userId, analysisId });
        return sendErrorResponse(res, 400, 'Invalid analysis ID format.');
    }

    try {
        const result = await AtsAnalysis.deleteOne({ _id: analysisId, userId });

        if (result.deletedCount === 0) {
            logger.info('ATS analysis report not found or not authorized for deletion.', { userId, analysisId });
            return sendErrorResponse(res, 404, 'ATS analysis report not found or not authorized for deletion.');
        }

        logger.info('ATS analysis report deleted successfully.', { userId, analysisId });
        res.status(200).json({
            success: true,
            message: 'ATS analysis report deleted successfully.'
        });
    } catch (error) {
        logger.error('Error deleting ATS analysis:', { userId, analysisId, errorMessage: error.message, stack: error.stack });
        sendErrorResponse(res, 500, 'Server error. Could not delete ATS analysis report.');
    }
};

// @route   GET /api/ats/score-history
// @desc    Get ATS score history for graph visualization
// @access  Private
exports.getAtsScoreHistory = async (req, res) => {
    const userId = req.user.id;
    const { period = 'all', limit = 50 } = req.query;

    try {
        let dateFilter = {};
        
        // Apply date filtering based on period
        if (period !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (period) {
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '1y':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = null;
            }
            
            if (startDate) {
                dateFilter.analysisDate = { $gte: startDate };
            }
        }

        const scoreHistory = await AtsHistoryScore.find({ 
            userId, 
            ...dateFilter 
        })
        .select('overallScore detailedScores resumeTitle jobTitle analysisDate')
        .sort({ analysisDate: -1 })
        .limit(parseInt(limit));

        // Calculate statistics
        const scores = scoreHistory.map(entry => entry.overallScore);
        const stats = {
            totalEntries: scoreHistory.length,
            averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            highestScore: scores.length > 0 ? Math.max(...scores) : 0,
            lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
            improvement: scores.length >= 2 ? scores[0] - scores[scores.length - 1] : 0
        };

        res.status(200).json({
            success: true,
            data: {
                history: scoreHistory,
                statistics: stats,
                period: period,
                count: scoreHistory.length
            }
        });

    } catch (error) {
        logger.error('Error fetching ATS score history:', { 
            userId, 
            errorMessage: error.message, 
            stack: error.stack 
        });
        sendErrorResponse(res, 500, 'Server error. Could not retrieve ATS score history.');
    }
};

// @route   GET /api/ats/score-trends
// @desc    Get ATS score trends and analytics
// @access  Private
exports.getAtsScoreTrends = async (req, res) => {
    const userId = req.user.id;

    try {
        // Get score history for trend analysis
        const scoreHistory = await AtsHistoryScore.find({ userId })
            .select('overallScore detailedScores analysisDate')
            .sort({ analysisDate: 1 }) // Ascending order for trend calculation
            .limit(100); // Limit for performance

        if (scoreHistory.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    trends: [],
                    categoryTrends: {},
                    insights: []
                }
            });
        }

        // Calculate overall trend
        const trends = scoreHistory.map((entry, index) => ({
            date: entry.analysisDate,
            score: entry.overallScore,
            change: index > 0 ? entry.overallScore - scoreHistory[index - 1].overallScore : 0
        }));

        // Calculate category-wise trends
        const categoryTrends = {};
        const categories = ['keywords', 'formatting', 'experience', 'skills', 'education', 'summary'];
        
        categories.forEach(category => {
            categoryTrends[category] = scoreHistory
                .filter(entry => entry.detailedScores && entry.detailedScores[category])
                .map((entry, index, filteredArray) => ({
                    date: entry.analysisDate,
                    score: entry.detailedScores[category],
                    change: index > 0 ? entry.detailedScores[category] - filteredArray[index - 1].detailedScores[category] : 0
                }));
        });

        // Generate insights
        const insights = [];
        const recentScores = scoreHistory.slice(-5);
        const olderScores = scoreHistory.slice(0, -5);

        if (recentScores.length >= 2) {
            const recentAvg = recentScores.reduce((sum, entry) => sum + entry.overallScore, 0) / recentScores.length;
            const olderAvg = olderScores.length > 0 ? 
                olderScores.reduce((sum, entry) => sum + entry.overallScore, 0) / olderScores.length : 
                recentAvg;

            if (recentAvg > olderAvg + 5) {
                insights.push({
                    type: 'positive',
                    message: `Your ATS scores have improved by ${Math.round(recentAvg - olderAvg)} points recently!`,
                    category: 'overall'
                });
            } else if (recentAvg < olderAvg - 5) {
                insights.push({
                    type: 'warning',
                    message: `Your ATS scores have decreased by ${Math.round(olderAvg - recentAvg)} points recently.`,
                    category: 'overall'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                trends,
                categoryTrends,
                insights,
                totalAnalyses: scoreHistory.length
            }
        });

    } catch (error) {
        logger.error('Error fetching ATS score trends:', { 
            userId, 
            errorMessage: error.message, 
            stack: error.stack 
        });
        sendErrorResponse(res, 500, 'Server error. Could not retrieve ATS score trends.');
    }
};

// @route   GET /api/ats/score-config
// @desc    Get current ATS score storage configuration
// @access  Private
exports.getScoreConfig = async (req, res) => {
    const userId = req.user.id;

    try {
        // For now, return static config. Could be made dynamic per user in the future
        const config = {
            scoreTolerance: 1, // 1% tolerance
            storeOnlySignificantChanges: true,
            description: 'Scores are only stored if they differ by at least 1% from the previous analysis'
        };

        res.status(200).json({
            success: true,
            config: config
        });
    } catch (error) {
        logger.error('Error fetching score config:', { userId, errorMessage: error.message, stack: error.stack });
        sendErrorResponse(res, 500, 'Server error. Could not retrieve score configuration.');
    }
};

// @route   POST /api/ats/store-score
// @desc    Store ATS score for tracking (only if different from previous)
// @access  Private
exports.storeAtsScore = async (req, res) => {
    const userId = req.user.id;
    const { overallScore, detailedScores, resumeTitle, jobTitle } = req.body;

    // Add detailed logging to see what we're receiving
    logger.info(`Received ATS score storage request for user ${userId}:`, {
        overallScore,
        detailedScores,
        detailedScoresKeys: detailedScores ? Object.keys(detailedScores) : [],
        detailedScoresValues: detailedScores ? Object.values(detailedScores) : [],
        resumeTitle,
        jobTitle,
        timestamp: new Date().toISOString()
    });

    // Validate input
    if (!overallScore || typeof overallScore !== 'number' || overallScore < 0 || overallScore > 100) {
        logger.warn('Invalid overall score provided for score storage.', { userId, overallScore });
        return sendErrorResponse(res, 400, 'Invalid overall score. Must be a number between 0 and 100.');
    }

    try {
        // Check if we should store this score (only if different from previous)
        const shouldStore = await AtsHistoryScore.shouldStoreScore(userId, overallScore, detailedScores);
        
        logger.info(`Score storage check for user ${userId}:`, {
            overallScore,
            shouldStore,
            timestamp: new Date().toISOString()
        });
        
        if (!shouldStore) {
            logger.info(`ATS score unchanged for user ${userId}, skipping storage.`, { 
                overallScore,
                reason: 'Score change below tolerance threshold (1%)'
            });
            return res.status(200).json({
                success: true,
                message: 'Score unchanged from previous analysis, not stored.',
                stored: false,
                reason: 'Score difference is below the significance threshold'
            });
        }

        // Create corresponding ATS Analysis record first (required for analysisId reference)
        const analysisData = {
            overallScore,
            detailedScores: detailedScores || {},
            resumeTitle: resumeTitle || 'Analyzed Resume',
            jobTitle: jobTitle || 'Job Analysis',
            analysisDate: new Date()
        };

        const newAnalysis = new AtsAnalysis({
            userId: userId,
            resumeTitle: resumeTitle || 'Analyzed Resume',
            jobTitle: jobTitle || 'Job Analysis',
            analysisDate: new Date(),
            summary: {
                matchScore: overallScore,
                keywordCount: 0 // Default value for score-only storage
            },
            reportData: JSON.stringify(analysisData) // Store the score data as report
        });

        await newAnalysis.save();
        logger.info('ATS analysis record created for score storage.', { userId, analysisId: newAnalysis._id });

        // Create new score entry with the analysisId reference
        const newScoreEntry = new AtsHistoryScore({
            userId: userId,
            overallScore: overallScore,
            detailedScores: detailedScores || {},
            resumeTitle: resumeTitle || 'Analyzed Resume',
            jobTitle: jobTitle || 'Job Analysis',
            analysisDate: new Date(),
            analysisId: newAnalysis._id // Required field
        });

        await newScoreEntry.save();
        logger.info(`ATS score stored successfully for user ${userId}.`, { 
            overallScore, 
            scoreId: newScoreEntry._id,
            analysisId: newAnalysis._id
        });

        res.status(201).json({
            success: true,
            message: 'ATS score stored successfully.',
            stored: true,
            scoreId: newScoreEntry._id,
            analysisId: newAnalysis._id,
            data: {
                overallScore: newScoreEntry.overallScore,
                detailedScores: newScoreEntry.detailedScores,
                analysisDate: newScoreEntry.analysisDate
            }
        });

    } catch (error) {
        logger.error('Error storing ATS score:', { 
            userId, 
            errorMessage: error.message, 
            stack: error.stack 
        });
        sendErrorResponse(res, 500, 'Server error. Could not store ATS score.');
    }
};

// --- New function for STEP 3.6: getKeywords ---
// @route   POST /api/ats/keywords
// @desc    Extract keywords from provided text (e.g., job description) without retaining PII.
//          This endpoint processes text in-memory and returns keywords immediately.
// @access  Private (Authentication required, as it's an API resource)
exports.getKeywords = async (req, res) => {
    const userId = req.user.id; // Get user ID from authenticated request
    const { error, value } = keywordExtractionSchema.validate(req.body);

    if (error) {
        logger.warn('Invalid input for keyword extraction.', { userId, errors: error.details });
        return sendErrorResponse(res, 400, 'Invalid input text for keyword extraction.', error.details);
    }

    const inputText = value.text;
    logger.info(`Initiating keyword extraction for user ${userId}. Text length: ${inputText.length}`);

    try {
        // --- PII Redaction ---
        // Crucial for privacy: redact PII from the input text before processing
        logger.security(`Redacting PII from input text for keyword extraction for user ${userId}.`);
        const redactedText = redactPii(inputText);
        logger.debug(`PII redaction complete for keyword extraction. Original length: ${inputText.length}, Redacted length: ${redactedText.length}.`);

        // --- Keyword Extraction Logic (Placeholder) ---
        // In a real application, you'd use a more sophisticated NLP library
        // (e.g., natural, compromise.js, or an external NLP service)
        // to extract meaningful keywords.
        // For this placeholder, we'll do a very basic simulation.
        logger.info(`Performing basic keyword extraction on redacted text for user ${userId}.`);
        const commonWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'for', 'with', 'as', 'at', 'by', 'from', 'this', 'that', 'these', 'those', 'it', 'its', 'you', 'your', 'he', 'she', 'his', 'her', 'we', 'our', 'they', 'their', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'not', 'no', 'yes', 'can', 'will', 'would', 'should', 'could', 'get', 'got', 'make', 'made', 'like', 'just', 'also', 'about', 'some', 'any', 'all', 'out', 'up', 'down', 'then', 'than', 'more', 'most', 'such', 'very', 'only', 'even', 'into', 'over', 'under', 'through', 'after', 'before', 'where', 'when', 'why', 'how', 'who', 'what', 'which', 'whom', 'where', 'when', 'upon', 'among', 'across', 'behind', 'below', 'beside', 'between', 'beyond', 'during', 'except', 'inside', 'near', 'off', 'onto', 'outside', 'past', 'round', 'since', 'until', 'up', 'within', 'without', 'via', 'vs']);

        const extractedKeywords = redactedText
            .toLowerCase() // Convert to lowercase
            .replace(/[^\w\s-]/g, ' ') // Remove punctuation (keep hyphens)
            .split(/\s+/) // Split by whitespace
            .filter(word => word.length > 2 && !commonWords.has(word)) // Remove short words and common words
            .filter((value, index, self) => self.indexOf(value) === index) // Get unique keywords
            .slice(0, 20); // Limit to top 20 unique keywords for simplicity

        logger.info(`Keyword extraction complete for user ${userId}. Found ${extractedKeywords.length} keywords.`);

        // --- Stateless Processing ---
        // No data related to this specific keyword extraction is stored persistently.
        // The process happens in-memory and results are returned immediately.

        res.status(200).json({
            success: true,
            message: 'Keywords extracted successfully.',
            keywords: extractedKeywords
        });

    } catch (error) {
        logger.error('Error during keyword extraction process.', {
            userId: userId,
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack
        });
        sendErrorResponse(res, 500, 'Server error during keyword extraction. Please try again.');
    }
};
