import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';

const CodingProfilesSection = ({ codingAnalysis }) => {
    const { isDark } = useTheme();

    if (!codingAnalysis) {
        return null;
    }

    const getReadinessColor = (level) => {
        if (level.includes('Excellent')) return 'text-green-600 dark:text-green-400';
        if (level.includes('Good')) return 'text-blue-600 dark:text-blue-400';
        if (level.includes('Fair')) return 'text-yellow-600 dark:text-yellow-400';
        if (level.includes('Basic')) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 65) return 'text-blue-600 dark:text-blue-400';
        if (score >= 45) return 'text-yellow-600 dark:text-yellow-400';
        if (score >= 25) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            leetcode: '🟡',
            codeforces: '🔵',
            codechef: '🟤'
        };
        return icons[platform] || '💻';
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num?.toString() || '0';
    };

    return (
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-2xl">👨‍💻</span>
                    Coding Profiles Analysis
                </h3>
                <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(codingAnalysis.overall_coding_score)}`}>
                        {codingAnalysis.overall_coding_score}/100
                    </div>
                    <div className={`text-sm font-medium ${getReadinessColor(codingAnalysis.job_readiness_level)}`}>
                        {codingAnalysis.job_readiness_level}
                    </div>
                </div>
            </div>

            {/* Profiles Found */}
            {codingAnalysis.profiles_found && codingAnalysis.profiles_found.length > 0 ? (
                <div className="space-y-4">
                    <h4 className="font-medium text-lg mb-3">Found Profiles ({codingAnalysis.profiles_found.length})</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {codingAnalysis.profiles_found.map((profile, index) => (
                            <div key={index} className={`rounded-lg p-4 border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getPlatformIcon(profile.platform)}</span>
                                        <span className="font-medium capitalize">{profile.platform}</span>
                                    </div>
                                    {profile.url && (
                                        <a 
                                            href={profile.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-600 text-sm"
                                        >
                                            View Profile
                                        </a>
                                    )}
                                </div>
                                
                                <div className="space-y-1 text-sm">
                                    <div className="font-medium">@{profile.username}</div>
                                    
                                    {profile.platform === 'leetcode' && (
                                        <>
                                            {profile.problems_solved > 0 && (
                                                <div>Problems Solved: <span className="font-semibold text-green-600">{profile.problems_solved}</span></div>
                                            )}
                                            {profile.ranking && (
                                                <div>Ranking: <span className="font-semibold">#{formatNumber(profile.ranking)}</span></div>
                                            )}
                                            {profile.easy_solved > 0 && (
                                                <div className="flex gap-2 text-xs">
                                                    <span className="text-green-500">Easy: {profile.easy_solved}</span>
                                                    <span className="text-yellow-500">Medium: {profile.medium_solved}</span>
                                                    <span className="text-red-500">Hard: {profile.hard_solved}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    
                                    {profile.platform === 'codeforces' && (
                                        <>
                                            {profile.rating && (
                                                <div>Rating: <span className="font-semibold text-blue-600">{profile.rating}</span></div>
                                            )}
                                            {profile.max_rating && (
                                                <div>Max Rating: <span className="font-semibold">{profile.max_rating}</span></div>
                                            )}
                                            {profile.rank && (
                                                <div>Rank: <span className="font-semibold capitalize">{profile.rank}</span></div>
                                            )}
                                            {profile.problems_solved > 0 && (
                                                <div>Problems Solved: <span className="font-semibold text-green-600">{profile.problems_solved}</span></div>
                                            )}
                                        </>
                                    )}
                                    
                                    {profile.platform === 'codechef' && (
                                        <>
                                            {profile.rating && (
                                                <div>Rating: <span className="font-semibold text-yellow-600">{profile.rating}</span></div>
                                            )}
                                            {profile.stars > 0 && (
                                                <div>Stars: <span className="font-semibold">{'⭐'.repeat(profile.stars)}</span></div>
                                            )}
                                            {profile.problems_solved > 0 && (
                                                <div>Problems Solved: <span className="font-semibold text-green-600">{profile.problems_solved}</span></div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className={`text-center py-8 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="text-4xl mb-3">🔍</div>
                    <div className="text-lg font-medium mb-2">No Coding Profiles Found</div>
                    <div className="text-sm text-gray-500">
                        Add LeetCode, Codeforces, or CodeChef profile links to your resume
                    </div>
                </div>
            )}

            {/* Strengths */}
            {codingAnalysis.strengths && codingAnalysis.strengths.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-lg mb-3 text-green-600 dark:text-green-400">💪 Strengths</h4>
                    <div className="space-y-2">
                        {codingAnalysis.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span className="text-sm">{strength}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Areas for Improvement */}
            {codingAnalysis.areas_for_improvement && codingAnalysis.areas_for_improvement.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-lg mb-3 text-orange-600 dark:text-orange-400">🎯 Areas for Improvement</h4>
                    <div className="space-y-2">
                        {codingAnalysis.areas_for_improvement.map((area, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <span className="text-orange-500 mt-1">⚠</span>
                                <span className="text-sm">{area}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {codingAnalysis.recommendations && codingAnalysis.recommendations.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-lg mb-3 text-blue-600 dark:text-blue-400">💡 Recommendations</h4>
                    <div className="space-y-2">
                        {codingAnalysis.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">→</span>
                                <span className="text-sm">{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Technical Readiness Meter */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Technical Interview Readiness</span>
                    <span className={`font-bold ${getScoreColor(codingAnalysis.overall_coding_score)}`}>
                        {codingAnalysis.overall_coding_score}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                            codingAnalysis.overall_coding_score >= 80 ? 'bg-green-500' :
                            codingAnalysis.overall_coding_score >= 65 ? 'bg-blue-500' :
                            codingAnalysis.overall_coding_score >= 45 ? 'bg-yellow-500' :
                            codingAnalysis.overall_coding_score >= 25 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(codingAnalysis.overall_coding_score, 100)}%` }}
                    />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Based on problem-solving activity, ratings, and consistency across platforms
                </div>
            </div>
        </div>
    );
};

CodingProfilesSection.propTypes = {
    codingAnalysis: PropTypes.shape({
        overall_coding_score: PropTypes.number,
        job_readiness_level: PropTypes.string,
        profiles_found: PropTypes.arrayOf(PropTypes.object),
        strengths: PropTypes.arrayOf(PropTypes.string),
        areas_for_improvement: PropTypes.arrayOf(PropTypes.string),
        recommendations: PropTypes.arrayOf(PropTypes.string)
    })
};

export default CodingProfilesSection;
