import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';

const ComparisonTool = ({ resumes }) => {
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);

  const handleResumeSelect = (resumeId) => {
    if (selectedResumes.includes(resumeId)) {
      setSelectedResumes(selectedResumes.filter(id => id !== resumeId));
    } else if (selectedResumes.length < 2) {
      setSelectedResumes([...selectedResumes, resumeId]);
    }
  };

  const compareResumes = () => {
    if (selectedResumes.length !== 2) return;

    const resume1 = resumes.find(r => r.id === selectedResumes[0]);
    const resume2 = resumes.find(r => r.id === selectedResumes[1]);

    setComparisonResults({
      scoreComparison: {
        resume1: resume1.score,
        resume2: resume2.score,
        difference: Math.abs(resume1.score - resume2.score)
      },
      keywordComparison: {
        resume1: resume1.matchedKeywords,
        resume2: resume2.matchedKeywords,
        uniqueToResume1: resume1.matchedKeywords.filter(k => !resume2.matchedKeywords.includes(k)),
        uniqueToResume2: resume2.matchedKeywords.filter(k => !resume1.matchedKeywords.includes(k))
      }
    });
  };

  return (
    <div className="comparison-tool bg-[#161B22] p-5 rounded-lg">
      <h3 className="text-[#00FFFF] text-xl mb-4">Resume Comparison Tool</h3>

      <div className="mb-5">
        <p className="text-[#E5E5E5] mb-2">Select two resumes to compare:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {resumes.map(resume => (
            <div
              key={resume.id}
              className={`p-3 rounded cursor-pointer transition-all
                ${selectedResumes.includes(resume.id)
                  ? 'bg-[#9C27B0] bg-opacity-20 border border-[#9C27B0]'
                  : 'bg-[#0D1117] border border-[#30363D] hover:border-[#00FFFF]'}`}
              onClick={() => handleResumeSelect(resume.id)}
            >
              <p className="text-[#E5E5E5] font-medium">{resume.name}</p>
              <p className="text-sm text-gray-400">Score: {resume.score}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-5">
        <Button
          text="Compare Resumes"
          onClick={compareResumes}
          disabled={selectedResumes.length !== 2}
        />
      </div>

      {comparisonResults && (
        <div className="comparison-results mt-5 border-t border-[#30363D] pt-5">
          <h4 className="text-[#00FFFF] text-lg mb-3">Comparison Results</h4>

          <div className="mb-4">
            <h5 className="text-[#9C27B0] mb-2">Score Comparison</h5>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="bg-[#0D1117] p-3 rounded">
                <p className="text-sm text-gray-400">Resume 1</p>
                <p className="text-xl text-[#E5E5E5]">{comparisonResults.scoreComparison.resume1}%</p>
              </div>
              <div className="bg-[#0D1117] p-3 rounded">
                <p className="text-sm text-gray-400">Resume 2</p>
                <p className="text-xl text-[#E5E5E5]">{comparisonResults.scoreComparison.resume2}%</p>
              </div>
            </div>
            <p className="text-[#E5E5E5]">
              Difference: <span className="text-[#00FFFF]">{comparisonResults.scoreComparison.difference}%</span>
            </p>
          </div>

          <div>
            <h5 className="text-[#9C27B0] mb-2">Keyword Comparison</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0D1117] p-3 rounded">
                <p className="text-sm text-gray-400">Unique to Resume 1</p>
                {comparisonResults.keywordComparison.uniqueToResume1.length === 0 ? (
                  <p className="text-[#E5E5E5] italic">None</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {comparisonResults.keywordComparison.uniqueToResume1.map(keyword => (
                      <li key={keyword} className="text-[#E5E5E5]">{keyword}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-[#0D1117] p-3 rounded">
                <p className="text-sm text-gray-400">Unique to Resume 2</p>
                {comparisonResults.keywordComparison.uniqueToResume2.length === 0 ? (
                  <p className="text-[#E5E5E5] italic">None</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {comparisonResults.keywordComparison.uniqueToResume2.map(keyword => (
                      <li key={keyword} className="text-[#E5E5E5]">{keyword}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ComparisonTool.propTypes = {
  resumes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
      matchedKeywords: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
};

export default ComparisonTool;