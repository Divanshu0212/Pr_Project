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
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 
        ${isDragActive ? 'border-neon-cyan bg-dark-gray' : 'border-electric-purple bg-midnight-blue'}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <svg
          className="mx-auto h-12 w-12 text-neon-cyan"
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
        <div className="text-white">
          {isDragActive ? (
            <p>Drop your resume here...</p>
          ) : (
            <p>Drag and drop your resume, or click to select file</p>
          )}
        </div>
        <p className="text-xs text-electric-purple">PDF, DOC, or DOCX (Max 5MB)</p>
      </div>
    </div>
  );
};

export default ResumeUploader;
