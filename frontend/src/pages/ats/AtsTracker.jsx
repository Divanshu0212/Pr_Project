import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import UploadForm from '../../components/ats/UploadForm'; // Assuming this handles single file upload
import Button from '../../components/common/Button';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';

// Placeholder for the backend analysis function (adjust path if needed)
const analyzeResumeOnBackend = async (file, jobDescription) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jobDescription', jobDescription); // Send job description

  const response = await fetch('http://localhost:8080/api/analyze-resume', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || 'Analysis failed on the backend');
  }

  const result = await response.json();
  return result.analysisId; // Assuming the backend returns an analysis ID
};

const AtsTracker = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResumeUpload = (file) => {
    setResumeFile(file);
    setError('');
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      setError('Please upload a resume file');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsLoading(true);
    try {
      // Use the placeholder function to interact with the existing backend endpoint
      const analysisId = await analyzeResumeOnBackend(resumeFile, jobDescription);
      // Navigate to the analysis results page using the ID
      navigate(`/ats/analysis/${analysisId}`);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      
        <LoadingState message="Analyzing your resume against ATS criteria..." />
    
    );
  }

  return (
 
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E5E5E5] mb-2">ATS Resume Analyzer</h1>
          <p className="text-gray-400">
            Upload your resume and job description to get detailed ATS compatibility analysis.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="bg-[#161B22] rounded-lg p-6 mb-8">
          <h2 className="text-xl text-[#00FFFF] mb-6">Upload Your Resume</h2>
          <UploadForm onFileUpload={handleResumeUpload} />

          <div className="mt-8">
            <label className="block text-[#E5E5E5] mb-2" htmlFor="jobDescription">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-md p-3 text-[#E5E5E5] min-h-[200px]"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={handleJobDescriptionChange}
            ></textarea>
            <p className="text-sm text-gray-400 mt-1">
              For best results, paste the entire job description including requirements and qualifications.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              text="Analyze Resume"
              onClick={handleSubmit}
              disabled={!resumeFile || !jobDescription.trim()}
            />
          </div>
        </div>

        <div className="bg-[#161B22] rounded-lg p-6">
          <h2 className="text-xl text-[#00FFFF] mb-4">How It Works</h2>
          <ol className="list-decimal list-inside text-[#E5E5E5] space-y-2">
            <li>Upload your resume (PDF format recommended)</li>
            <li>Paste the job description you `re applying for</li>
            <li>Our ATS analyzer will check your resume for compatibility</li>
            <li>Get a detailed score and recommendations to improve</li>
          </ol>
        </div>
      </div>

  );
};

export default AtsTracker;