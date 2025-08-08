// backend/models/AtsHistoryScore.js
const mongoose = require('mongoose');

const AtsHistoryScoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    detailedScores: {
        type: mongoose.Schema.Types.Mixed, // Allow dynamic field names
        default: {}
    },
    resumeTitle: {
        type: String,
        required: true,
        maxlength: 255
    },
    jobTitle: {
        type: String,
        maxlength: 255,
        default: 'General Application'
    },
    analysisDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    // Reference to the full analysis
    analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AtsAnalysis',
        required: true
    },
    // Data retention policy
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        index: { expires: '0s' }
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
AtsHistoryScoreSchema.index({ userId: 1, analysisDate: -1 });

// Method to check if score is different from the last entry (returns detailed info)
AtsHistoryScoreSchema.statics.shouldStoreScoreWithReason = async function(userId, newOverallScore, newDetailedScores) {
    const lastScore = await this.findOne({ userId })
        .sort({ analysisDate: -1 })
        .select('overallScore detailedScores analysisDate');
    
    if (!lastScore) {
        return { shouldStore: true, reason: 'No previous score exists' };
    }
    
    // Check if the last score was stored very recently (within 1 minute) - prevent rapid duplicates
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    if (lastScore.analysisDate > oneMinuteAgo) {
        const timeDiff = Date.now() - lastScore.analysisDate.getTime();
        if (timeDiff < 30000) { // Less than 30 seconds
            return { 
                shouldStore: false, 
                reason: `Recent score stored ${Math.round(timeDiff/1000)} seconds ago - preventing rapid duplicates` 
            };
        }
    }
    
    // Define tolerance for score differences (to avoid storing very minor changes)
    const SCORE_TOLERANCE = 1; // 1% tolerance
    
    // Check if overall score is significantly different
    const scoreDifference = Math.abs(lastScore.overallScore - newOverallScore);
    if (scoreDifference >= SCORE_TOLERANCE) {
        return { 
            shouldStore: true, 
            reason: `Overall score changed by ${scoreDifference}% (${lastScore.overallScore}% → ${newOverallScore}%)` 
        };
    }
    
    // Check if any detailed score is significantly different
    if (newDetailedScores && typeof newDetailedScores === 'object') {
        for (const [key, value] of Object.entries(newDetailedScores)) {
            if (typeof value === 'number') {
                const lastValue = lastScore.detailedScores?.[key] || 0;
                const detailedDifference = Math.abs(lastValue - value);
                if (detailedDifference >= SCORE_TOLERANCE) {
                    return { 
                        shouldStore: true, 
                        reason: `${key} score changed by ${detailedDifference}% (${lastValue}% → ${value}%)` 
                    };
                }
            }
        }
    }
    
    // Check if there are new detailed score categories that weren't present before
    if (newDetailedScores && typeof newDetailedScores === 'object' && lastScore.detailedScores) {
        const newKeys = Object.keys(newDetailedScores);
        const lastKeys = Object.keys(lastScore.detailedScores);
        
        // Check if there are new categories
        const hasNewCategories = newKeys.some(key => !lastKeys.includes(key));
        if (hasNewCategories) {
            const newCategories = newKeys.filter(key => !lastKeys.includes(key));
            return { 
                shouldStore: true, 
                reason: `New score categories detected: ${newCategories.join(', ')}` 
            };
        }
    }
    
    return { 
        shouldStore: false, 
        reason: `All scores within tolerance (${SCORE_TOLERANCE}% threshold)` 
    };
};

// Backward compatibility method that just returns boolean
AtsHistoryScoreSchema.statics.shouldStoreScore = async function(userId, newOverallScore, newDetailedScores) {
    const result = await this.shouldStoreScoreWithReason(userId, newOverallScore, newDetailedScores);
    
    // Log the decision for debugging
    console.log(`shouldStoreScore decision for user ${userId}:`, {
        newOverallScore,
        shouldStore: result.shouldStore,
        reason: result.reason,
        timestamp: new Date().toISOString()
    });
    
    return result.shouldStore;
};

module.exports = mongoose.model('AtsHistoryScore', AtsHistoryScoreSchema);
