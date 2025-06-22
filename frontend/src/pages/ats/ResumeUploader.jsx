import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const ResumeUploader = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-400 group animate-fade-in-up
        ${isDragActive 
          ? 'border-accent-primary bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 shadow-glow' 
          : 'border-accent-neutral/50 bg-gradient-to-br from-background-primary/50 to-background-secondary/50 hover:border-accent-primary/70 hover:shadow-card-dark'
        } backdrop-blur-sm`}
    >
      <input {...getInputProps()} />
      <div className="space-y-6">
        <div className="relative">
          <svg
            className={`mx-auto h-16 w-16 transition-all duration-400 ${
              isDragActive 
                ? 'text-accent-primary scale-110 animate-bounce-gentle' 
                : 'text-accent-secondary group-hover:text-accent-primary group-hover:scale-105'
            }`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M24 8v24m0-24l-8 8m8-8l8 8m-8 16v.01"
            />
          </svg>
          {isDragActive && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary opacity-20 animate-pulse-slow"></div>
          )}
        </div>
        
        <div className="text-text-primary">
          {isDragActive ? (
            <p className="text-xl font-semibold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent animate-pulse">
              Drop your resume here! 🚀
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium">
                <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent font-bold">
                  Click to upload
                </span> 
                <span className="text-text-primary"> or drag and drop</span>
              </p>
              <p className="text-sm text-text-secondary">Your resume for ATS analysis</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <span className="px-4 py-2 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full text-xs font-medium text-accent-primary border border-accent-primary/30">
            PDF
          </span>
          <span className="px-4 py-2 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full text-xs font-medium text-accent-primary border border-accent-primary/30">
            DOCX
          </span>
          <span className="text-text-placeholder text-xs">Max 5MB</span>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;