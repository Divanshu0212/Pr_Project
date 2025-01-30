import React, { useState } from 'react';
import { PlusIcon, MinusIcon, ArrowLeftIcon, ArrowRightIcon, DownloadIcon } from 'lucide-react';

const ResumeForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    education: [{ school: '', degree: '', year: '' }],
    experience: [{ company: '', position: '', duration: '', responsibilities: '' }],
    achievements: [''],
    skills: ['']
  });

  const handleInputChange = (e, category = null, index = null, field = null) => {
    if (category && index !== null) {
      const newData = [...formData[category]];
      if (field) {
        newData[index][field] = e.target.value;
      } else {
        newData[index] = e.target.value;
      }
      setFormData({ ...formData, [category]: newData });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addField = (category) => {
    const defaultValues = {
      education: { school: '', degree: '', year: '' },
      experience: { company: '', position: '', duration: '', responsibilities: '' },
      achievements: '',
      skills: ''
    };
    setFormData({
      ...formData,
      [category]: [...formData[category], defaultValues[category]]
    });
  };

  const removeField = (category, index) => {
    setFormData({
      ...formData,
      [category]: formData[category].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:4000/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate resumes: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resumes.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate resumes');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const inputClasses = "w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500";
    const labelClasses = "block text-sm font-medium mb-1 text-gray-300";
    const sectionClasses = "p-4 border border-gray-700 rounded bg-gray-800/50 space-y-4";
    const buttonClasses = "flex items-center px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600";
    const removeButtonClasses = "text-red-400 hover:text-red-500";

    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className={labelClasses}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className={labelClasses}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="(123) 456-7890"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-200">Education</h3>
              <button
                onClick={() => addField('education')}
                className={buttonClasses}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Education
              </button>
            </div>
            {formData.education.map((edu, index) => (
              <div key={index} className={sectionClasses}>
                <div className="flex justify-end">
                  {index > 0 && (
                    <button
                      onClick={() => removeField('education', index)}
                      className={removeButtonClasses}
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>School</label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleInputChange(e, 'education', index, 'school')}
                    className={inputClasses}
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleInputChange(e, 'education', index, 'degree')}
                    className={inputClasses}
                    placeholder="Bachelor of Science"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Year</label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleInputChange(e, 'education', index, 'year')}
                    className={inputClasses}
                    placeholder="2023"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-200">Experience</h3>
              <button
                onClick={() => addField('experience')}
                className={buttonClasses}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Experience
              </button>
            </div>
            {formData.experience.map((exp, index) => (
              <div key={index} className={sectionClasses}>
                <div className="flex justify-end">
                  {index > 0 && (
                    <button
                      onClick={() => removeField('experience', index)}
                      className={removeButtonClasses}
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleInputChange(e, 'experience', index, 'company')}
                    className={inputClasses}
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleInputChange(e, 'experience', index, 'position')}
                    className={inputClasses}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Duration</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => handleInputChange(e, 'experience', index, 'duration')}
                    className={inputClasses}
                    placeholder="2019-2021"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Responsibilities</label>
                  <textarea
                    value={exp.responsibilities}
                    onChange={(e) => handleInputChange(e, 'experience', index, 'responsibilities')}
                    className={inputClasses}
                    rows="3"
                    placeholder="Describe your key responsibilities..."
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-200">Achievements</h3>
                <button
                  onClick={() => addField('achievements')}
                  className={buttonClasses}
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Achievement
                </button>
              </div>
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => handleInputChange(e, 'achievements', index)}
                    className={inputClasses}
                    placeholder="Enter an achievement"
                  />
                  {index > 0 && (
                    <button
                      onClick={() => removeField('achievements', index)}
                      className={removeButtonClasses}
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-200">Skills</h3>
                <button
                  onClick={() => addField('skills')}
                  className={buttonClasses}
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Skill
                </button>
              </div>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleInputChange(e, 'skills', index)}
                    className={inputClasses}
                    placeholder="Enter a skill"
                  />
                  {index > 0 && (
                    <button
                      onClick={() => removeField('skills', index)}
                      className={removeButtonClasses}
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto bg-gray-900 p-6 h-full shadow-lg text-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">Resume Generator</h2>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">Step {step} of 4</span>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center px-4 py-2 border border-gray-700 rounded text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:bg-cyan-300"
              >
                {loading ? (
                  'Generating...'
                ) : (
                  <>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Generate Resume
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {renderStep()}
      </div>
    </div>
  );
};

export default ResumeForm;