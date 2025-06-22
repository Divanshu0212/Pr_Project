import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Card from '../common/Card';

const ComparisonTool = ({ resumes }) => {
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <div className={`transition-all duration-800 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-6">
            Resume Comparison Tool
          </h3>

          <div className="mb-6">
            <p className="text-text-secondary mb-4 text-lg">Select two resumes to compare:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map((resume, index) => (
                <div
                  key={resume.id}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-400 transform hover:scale-105 hover:shadow-glow
                    ${selectedResumes.includes(resume.id)
                      ? 'bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border-2 border-accent-primary shadow-glow'
                      : 'bg-background-secondary border-2 border-transparent hover:border-accent-neutral/50'}`}
                  onClick={() => handleResumeSelect(resume.id)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-text-primary font-semibold text-lg">{resume.name}</p>
                  <p className="text-text-secondary">
                    Score: <span className="font-bold text-accent-primary">{resume.score}%</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              text="Compare Resumes"
              onClick={compareResumes}
              disabled={selectedResumes.length !== 2}
              className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-glow-purple transform hover:scale-105 transition-all duration-300"
            />
          </div>

          {comparisonResults && (
            <div className="animate-slide-up border-t-2 border-accent-neutral/30 pt-6">
              <h4 className="text-xl font-bold text-accent-primary mb-4">Comparison Results</h4>

              <div className="mb-6">
                <h5 className="text-lg font-semibold bg-gradient-to-r from-accent-secondary to-accent-primary bg-clip-text text-transparent mb-4">
                  Score Comparison
                </h5>
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <Card className="text-center transform hover:scale-105 transition-all duration-300">
                    <p className="text-text-secondary text-sm mb-2">Resume 1</p>
                    <p className="text-3xl font-bold text-accent-primary">
                      {comparisonResults.scoreComparison.resume1}%
                    </p>
                  </Card>
                  <Card className="text-center transform hover:scale-105 transition-all duration-300">
                    <p className="text-text-secondary text-sm mb-2">Resume 2</p>
                    <p className="text-3xl font-bold text-accent-secondary">
                      {comparisonResults.scoreComparison.resume2}%
                    </p>
                  </Card>
                </div>
                <p className="text-text-primary text-center text-lg">
                  Difference: <span className="font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                    {comparisonResults.scoreComparison.difference}%
                  </span>
                </p>
              </div>

              <div>
                <h5 className="text-lg font-semibold bg-gradient-to-r from-accent-secondary to-accent-primary bg-clip-text text-transparent mb-4">
                  Keyword Comparison
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="transform hover:scale-105 transition-all duration-300">
                    <p className="text-text-secondary font-medium mb-3">Unique to Resume 1</p>
                    {comparisonResults.keywordComparison.uniqueToResume1.length === 0 ? (
                      <p className="text-text-placeholder italic">None</p>
                    ) : (
                      <ul className="space-y-2">
                        {comparisonResults.keywordComparison.uniqueToResume1.map(keyword => (
                          <li key={keyword} className="text-text-primary flex items-center">
                            <span className="w-2 h-2 bg-accent-primary rounded-full mr-3"></span>
                            {keyword}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                  <Card className="transform hover:scale-105 transition-all duration-300">
                    <p className="text-text-secondary font-medium mb-3">Unique to Resume 2</p>
                    {comparisonResults.keywordComparison.uniqueToResume2.length === 0 ? (
                      <p className="text-text-placeholder italic">None</p>
                    ) : (
                      <ul className="space-y-2">
                        {comparisonResults.keywordComparison.uniqueToResume2.map(keyword => (
                          <li key={keyword} className="text-text-primary flex items-center">
                            <span className="w-2 h-2 bg-accent-secondary rounded-full mr-3"></span>
                            {keyword}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
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