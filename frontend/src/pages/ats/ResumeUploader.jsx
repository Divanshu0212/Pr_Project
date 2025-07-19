import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '../context/AuthContext'; // Adjust path as needed

const ResumeUploader = ({ onUpload }) => {
  const { isDark } = useTheme();
  
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
      className={`
        relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer 
        transition-all duration-500 ease-out group animate-fade-in-up hover:scale-[1.02]
        ${isDragActive 
          ? `border-cyan-400 shadow-2xl shadow-cyan-400/25 scale-[1.02]
             ${isDark ? 'bg-gradient-to-br from-cyan-400/10 via-purple-600/10 to-cyan-400/5' : 'bg-gradient-to-br from-cyan-100/50 via-purple-100/50 to-cyan-50/30'}`
          : `${isDark ? 'border-gray-600 bg-gradient-to-br from-gray-800/50 to-gray-900/30' : 'border-gray-300 bg-gradient-to-br from-white/80 to-gray-50/60'}
             hover:border-cyan-400/70 hover:shadow-xl ${isDark ? 'hover:shadow-cyan-400/15' : 'hover:shadow-cyan-400/20'}`
        } backdrop-blur-sm
      `}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute top-4 left-4 w-2 h-2 rounded-full animate-float-1 ${isDark ? 'bg-cyan-400' : 'bg-cyan-500'}`}></div>
        <div className={`absolute top-8 right-6 w-1.5 h-1.5 rounded-full animate-float-2 ${isDark ? 'bg-purple-400' : 'bg-purple-500'}`}></div>
        <div className={`absolute bottom-6 left-8 w-1 h-1 rounded-full animate-float-3 ${isDark ? 'bg-cyan-300' : 'bg-cyan-400'}`}></div>
      </div>

      <input {...getInputProps()} />
      
      <div className="relative z-10 space-y-6">
        {/* Upload Icon */}
        <div className="relative flex justify-center">
          <div className={`
            relative p-4 rounded-2xl transition-all duration-500 group-hover:scale-110
            ${isDragActive 
              ? `${isDark ? 'bg-gradient-to-r from-cyan-400/20 to-purple-500/20' : 'bg-gradient-to-r from-cyan-100/60 to-purple-100/60'} animate-pulse-gentle`
              : `${isDark ? 'bg-gradient-to-r from-gray-700/50 to-gray-600/30' : 'bg-gradient-to-r from-gray-100/60 to-white/80'} group-hover:from-cyan-400/10 group-hover:to-purple-500/10`
            }
          `}>
            <svg
              className={`h-12 w-12 transition-all duration-500 ${
                isDragActive 
                  ? 'text-cyan-400 scale-110 animate-bounce-gentle' 
                  : `${isDark ? 'text-gray-300' : 'text-gray-600'} group-hover:text-cyan-400 group-hover:scale-105`
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
                d="M24 8v24m0-24l-8 8m8-8l8 8"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 32v8a2 2 0 002 2h28a2 2 0 002-2v-8"
              />
            </svg>
          </div>
          
          {/* Glow effect */}
          {isDragActive && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/30 to-purple-500/30 blur-xl animate-pulse-slow"></div>
          )}
        </div>
        
        {/* Text Content */}
        <div className="space-y-3">
          {isDragActive ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent animate-gradient-flow">
                Drop your resume here! 🚀
              </p>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} animate-fade-in`}>
                Release to analyze with our ATS system
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'} group-hover:scale-105 transition-transform duration-300`}>
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent font-bold animate-gradient-flow-slow">
                  Click to upload
                </span> 
                <span className={`${isDark ? 'text-gray-200' : 'text-gray-700'} ml-2`}>
                  or drag and drop
                </span>
              </p>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} group-hover:text-cyan-400 transition-colors duration-300`}>
                Your resume for professional ATS analysis
              </p>
            </div>
          )}
        </div>
        
        {/* File Type Badges */}
        <div className="flex items-center justify-center space-x-3">
          <span className={`
            px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 group-hover:scale-105
            ${isDark 
              ? 'bg-gradient-to-r from-cyan-400/10 to-purple-500/10 text-cyan-400 border-cyan-400/30 hover:border-cyan-400/60'
              : 'bg-gradient-to-r from-cyan-50/80 to-purple-50/80 text-cyan-600 border-cyan-300/50 hover:border-cyan-400/70'
            }
          `}>
            PDF
          </span>
          <span className={`
            px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 group-hover:scale-105
            ${isDark 
              ? 'bg-gradient-to-r from-purple-500/10 to-cyan-400/10 text-purple-400 border-purple-400/30 hover:border-purple-400/60'
              : 'bg-gradient-to-r from-purple-50/80 to-cyan-50/80 text-purple-600 border-purple-300/50 hover:border-purple-400/70'
            }
          `}>
            DOCX
          </span>
          <span className={`
            text-xs font-medium px-3 py-1 rounded-lg transition-all duration-300
            ${isDark 
              ? 'text-gray-400 bg-gray-800/50 group-hover:text-gray-300'
              : 'text-gray-500 bg-gray-100/60 group-hover:text-gray-600'
            }
          `}>
            Max 5MB
          </span>
        </div>

        {/* Progress indicator when dragging */}
        {isDragActive && (
          <div className="mt-4">
            <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-progress-flow"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;