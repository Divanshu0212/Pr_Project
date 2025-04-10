import React from 'react';
import PropTypes from 'prop-types';

const FormatAnalysis = ({ score, sections, issues }) => {
  return (
    <div className="bg-[#0D1117] rounded-lg shadow p-6 text-[#E5E5E5]">
      <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">Format Analysis</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span>Format Score</span>
            <span className="font-semibold text-[#9C27B0]">{score}%</span>
          </div>
          <div className="h-2 bg-[#161B22] rounded-full">
            <div
              className="h-full bg-[#00FFFF] rounded-full"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2 text-[#00FFFF]">Found Sections</h3>
          <div className="flex flex-wrap gap-2">
            {sections.found && sections.found.map(section => (
              <span
                key={section}
                className="px-2 py-1 bg-[#161B22] text-[#00FFFF] rounded-full text-sm"
              >
                {section}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2 text-[#9C27B0]">Missing Sections</h3>
          <div className="flex flex-wrap gap-2">
            {sections.missing && sections.missing.map(section => (
              <span
                key={section}
                className="px-2 py-1 bg-[#161B22] text-[#9C27B0] rounded-full text-sm"
              >
                {section}
              </span>
            ))}
          </div>
        </div>

        {issues && issues.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 text-[#E5E5E5]">Format Issues</h3>
            <ul className="space-y-1 text-sm text-[#E5E5E5]">
              {issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#9C27B0]">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

FormatAnalysis.propTypes = {
  score: PropTypes.number.isRequired,
  sections: PropTypes.shape({
    found: PropTypes.arrayOf(PropTypes.string).isRequired,
    missing: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  issues: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default FormatAnalysis;