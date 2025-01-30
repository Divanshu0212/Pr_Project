import React, { useState, useCallback } from 'react';
import ResumeUploader from './ResumeUploader';
import AnalysisResults from './AnalysisResults';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';

const ATSTracker = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalysis = async (file) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('http://localhost:8080/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ResumeUploader onUpload={handleAnalysis} />
      {isAnalyzing && <LoadingState />}
      {error && <ErrorMessage message={error} />}
      {analysisResult && <AnalysisResults results={analysisResult} />}
    </div>
  );
};

export default ATSTracker;