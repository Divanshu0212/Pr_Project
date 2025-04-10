import { useState } from 'react';
import './styles/ProfessionSelector.css';

const COMMON_PROFESSIONS = [
  'Software Engineer',
  'Data Scientist',
  'Product Manager',
  'Marketing Specialist',
  'Sales Representative',
  'Financial Analyst',
  'Graphic Designer',
  'Human Resources Manager',
  'Project Manager',
  'Customer Service Representative',
  'Content Writer',
  'Mechanical Engineer',
  'Nurse',
  'Administrative Assistant',
  'Business Analyst'
];

function ProfessionSelector({ onSubmit }) {
  const [profession, setProfession] = useState('');
  const [customProfession, setCustomProfession] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showCustomInput) {
      if (customProfession.trim()) {
        onSubmit(customProfession.trim());
      }
    } else if (profession) {
      onSubmit(profession);
    }
  };

  const handleProfessionSelect = (selected) => {
    setProfession(selected);
    setShowCustomInput(false);
  };

  const handleCustomOption = () => {
    setProfession('');
    setShowCustomInput(true);
  };

  return (
    <div className="profession-selector">
      <div className="card">
        <h2>ATS Resume Analyzer</h2>
        <p>Start by selecting your profession to get personalized resume analysis</p>
        
        <form onSubmit={handleSubmit}>
          {!showCustomInput ? (
            <div className="profession-options">
              {COMMON_PROFESSIONS.map((prof) => (
                <button
                  key={prof}
                  type="button"
                  className={`profession-button ${profession === prof ? 'selected' : ''}`}
                  onClick={() => handleProfessionSelect(prof)}
                >
                  {prof}
                </button>
              ))}
              <button
                type="button"
                className="profession-button custom-button"
                onClick={handleCustomOption}
              >
                + Custom Profession
              </button>
            </div>
          ) : (
            <div className="custom-input-container">
              <input
                type="text"
                placeholder="Enter your profession"
                value={customProfession}
                onChange={(e) => setCustomProfession(e.target.value)}
                className="custom-profession-input"
                autoFocus
              />
              <button
                type="button"
                className="back-button"
                onClick={() => setShowCustomInput(false)}
              >
                Back to List
              </button>
            </div>
          )}
          
          <button
            type="submit"
            className="submit-button"
            disabled={(showCustomInput && !customProfession.trim()) || (!showCustomInput && !profession)}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfessionSelector;