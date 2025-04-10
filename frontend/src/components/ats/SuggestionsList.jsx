import React from 'react';
import PropTypes from 'prop-types';
import '../common/Card.css';

const SuggestionsList = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) {
    return <p className="text-gray-400">No improvement suggestions available yet.</p>;
  }

  return (
    <div className="suggestions-container bg-[#161B22] p-5 rounded-lg border border-[#30363D]">
      <h3 className="text-[#00FFFF] text-xl mb-4">Improvement Suggestions</h3>
      <ul className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="flex items-start">
            <span className="text-[#9C27B0] mr-2">•</span>
            <div>
              <p className="text-[#E5E5E5]">{suggestion.text}</p>
              {suggestion.example && (
                <p className="text-sm text-gray-400 mt-1">
                  Example: <span className="italic">{suggestion.example}</span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

SuggestionsList.propTypes = {
  suggestions: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      example: PropTypes.string, // Example is optional, so no .isRequired
    })
  ).isRequired,
};

export default SuggestionsList;