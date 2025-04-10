import React, { useState } from 'react';
import PropTypes from 'prop-types';

const KeywordMatch = ({ keywords, resumeContent }) => {
  const [showAll, setShowAll] = useState(false);

  // Calculate match statistics
  const matchedKeywords = keywords.filter(kw => kw.found);
  const matchPercentage = Math.round((matchedKeywords.length / keywords.length) * 100);

  // Sort keywords by importance and then by match status
  const sortedKeywords = [...keywords].sort((a, b) => {
    // Sort by importance first (high to low)
    if (b.importance !== a.importance) {
      return b.importance - a.importance;
    }
    // Then sort by found status (found first)
    return b.found - a.found;
  });

  // Display only top keywords or all based on showAll state
  const displayKeywords = showAll ? sortedKeywords : sortedKeywords.slice(0, 10);

  return (
    <div className="bg-[#161B22] rounded-xl p-6 shadow-lg">
      <h3 className="text-[#E5E5E5] text-xl font-semibold mb-4">Keyword Analysis</h3>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-4"
            style={{ borderColor: matchPercentage >= 70 ? '#4CAF50' : matchPercentage >= 40 ? '#FFC107' : '#F44336' }}>
            <span className="text-xl font-bold"
              style={{ color: matchPercentage >= 70 ? '#4CAF50' : matchPercentage >= 40 ? '#FFC107' : '#F44336' }}>
              {matchPercentage}%
            </span>
          </div>
          <div className="ml-4">
            <h4 className="text-[#E5E5E5] font-medium">Keyword Match</h4>
            <p className="text-gray-400 text-sm">
              {matchedKeywords.length} of {keywords.length} keywords found
            </p>
          </div>
        </div>

        <div className="bg-[#0D1117] p-3 rounded-lg">
          <p className="text-[#E5E5E5] text-sm">
            {matchPercentage >= 70 ? (
              "Strong keyword match! Your resume is well-optimized for this job."
            ) : matchPercentage >= 40 ? (
              "Average keyword match. Consider adding more relevant keywords."
            ) : (
              "Low keyword match. Add missing keywords to improve your chances."
            )}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#0D1117]">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Keyword
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Importance
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#161B22] divide-y divide-gray-700">
            {displayKeywords.map((keyword, index) => (
              <tr key={index}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#E5E5E5]">
                  {keyword.text}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {keyword.found ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800">
                      Found
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-red-100 text-red-800">
                      Missing
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-[#E5E5E5]">
                  <div className="flex items-center">
                    {Array(keyword.importance).fill().map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#00FFFF]" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {keywords.length > 10 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[#00FFFF] hover:text-[#9C27B0] text-sm font-medium transition-colors"
          >
            {showAll ? 'Show Less' : `Show All Keywords (${keywords.length})`}
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-[#0D1117] rounded-lg">
        <h4 className="text-[#E5E5E5] text-lg font-semibold mb-3">How To Improve</h4>
        <ul className="space-y-2 text-sm text-[#E5E5E5]">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00FFFF] mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Include missing keywords naturally in your resume, especially high-importance ones
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00FFFF] mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Use exact matches when possible, rather than variations or synonyms
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00FFFF] mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Place important keywords in section headings and bullet points
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00FFFF] mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Include both spelled-out terms and acronyms (e.g., "Application Tracking System (ATS)")
          </li>
        </ul>
      </div>
    </div>
  );
};

KeywordMatch.propTypes = {
  keywords: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      found: PropTypes.bool.isRequired,
      importance: PropTypes.number.isRequired,
    })
  ).isRequired,
  resumeContent: PropTypes.string.isRequired,
};

export default KeywordMatch;