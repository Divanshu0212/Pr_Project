import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeResume } from '../../services/atsService'; // Removed uploadResume import

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateFile(selectedFile);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Word document');
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size should be less than 5MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    validateFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please upload a resume');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Simulate upload by just using the file object for analysis ID (for mock purpose)
      const uploadResponse = { id: 'mock-upload-id-' + Date.now() }; // Simulate an upload response

      // After "upload", start analysis using the mock analyzeResume
      const analysisId = await analyzeResume(uploadResponse.id, jobDescription);

      // Navigate to analysis view with the analysis ID
      navigate(`/ats/analysis/${analysisId}`);
    } catch (err) {
      setError(err.message || 'Failed to process resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#161B22] p-6 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${dragActive ? 'border-[#00FFFF] bg-[#00FFFF10]' : 'border-gray-600'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('resume-upload').click()}
        >
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#00FFFF] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>

            <h3 className="text-[#E5E5E5] text-lg font-semibold mb-2">
              {file ? file.name : 'Drag & drop your resume here'}
            </h3>

            <p className="text-gray-400 text-sm mb-4">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse (PDF, DOC, DOCX)'}
            </p>

            {file && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-sm text-[#9C27B0] hover:text-[#00FFFF]"
              >
                Remove file
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="job-description" className="block text-[#E5E5E5] font-medium mb-2">
            Job Description (Optional)
          </label>
          <textarea
            id="job-description"
            rows="6"
            placeholder="Paste job description to get more accurate analysis..."
            className="w-full bg-[#0D1117] border border-gray-700 rounded-lg p-3 text-[#E5E5E5] focus:border-[#00FFFF] focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          ></textarea>
          <p className="mt-2 text-sm text-gray-400">
            Adding a job description helps us match your resume to specific requirements
          </p>
        </div>

        {error && (
          <div className="text-red-400 text-sm py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !file}
          className={`w-full py-3 px-4 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
            isLoading || !file
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#9C27B0] to-[#00FFFF] text-white hover:opacity-90 focus:ring-[#00FFFF]'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Analyze Resume'
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;