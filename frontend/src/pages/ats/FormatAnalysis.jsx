import React from 'react';
import PropTypes from 'prop-types';

const FormatAnalysis = ({ format }) => {
  if (!format) return null;

  return (
    <div className="bg-[#0D1117] rounded-lg shadow p-6 text-[#E5E5E5]">
      <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">Format Analysis</h2>
      <div className="space-y-4">
        {format.compatibility !== undefined && (
          <div>
            <div className="flex justify-between mb-2">
              <span>Format Score</span>
              <span className="font-semibold text-[#9C27B0]">{format.compatibility}%</span>
            </div>
            <div className="h-2 bg-[#161B22] rounded-full">
              <div
                className="h-full bg-[#00FFFF] rounded-full"
                style={{ width: `${format.compatibility}%` }}
              />
            </div>
          </div>
        )}

        {format.sections && (
          <div>
            <h3 className="font-medium mb-2 text-[#00FFFF]">Found Sections</h3>
            <div className="flex flex-wrap gap-2">
              {format.sections.found && format.sections.found.map(section => (
                <span
                  key={section}
                  className="px-2 py-1 bg-[#161B22] text-[#00FFFF] rounded-full text-sm"
                >
                  {section}
                </span>
              ))}
            </div>

            <h3 className="font-medium mb-2 text-[#9C27B0]">Missing Sections</h3>
            <div className="flex flex-wrap gap-2">
              {format.sections.missing && format.sections.missing.map(section => (
                <span
                  key={section}
                  className="px-2 py-1 bg-[#161B22] text-[#9C27B0] rounded-full text-sm"
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}

        {format.issues && format.issues.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 text-[#E5E5E5]">Format Issues</h3>
            <ul className="space-y-1 text-sm text-[#E5E5E5]">
              {format.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#9C27B0]">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {format.recommendations && format.recommendations.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 text-[#E5E5E5]">Recommendations</h3>
            <ul className="space-y-1 text-sm text-[#E5E5E5]">
              {format.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#00FFFF]">•</span>
                  {rec}
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
  format: PropTypes.shape({
    compatibility: PropTypes.number, // Optional as it might not always be present
    sections: PropTypes.shape({
      found: PropTypes.arrayOf(PropTypes.string), // Optional
      missing: PropTypes.arrayOf(PropTypes.string), // Optional
    }),
    issues: PropTypes.arrayOf(PropTypes.string), // Optional
    recommendations: PropTypes.arrayOf(PropTypes.string), // Optional
    isCompatible: PropTypes.bool, // Optional
    type: PropTypes.string, // Optional
  }),
};

export default FormatAnalysis;