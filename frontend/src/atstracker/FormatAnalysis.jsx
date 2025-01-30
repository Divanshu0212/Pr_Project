import React from 'react';

const FormatAnalysis = ({ score, sections, issues }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Format Analysis</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span>Format Score</span>
            <span className="font-semibold">{score}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Found Sections</h3>
          <div className="flex flex-wrap gap-2">
            {sections.found.map(section => (
              <span
                key={section}
                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {section}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Missing Sections</h3>
          <div className="flex flex-wrap gap-2">
            {sections.missing.map(section => (
              <span
                key={section}
                className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {section}
              </span>
            ))}
          </div>
        </div>

        {issues.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Format Issues</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
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

export default FormatAnalysis;