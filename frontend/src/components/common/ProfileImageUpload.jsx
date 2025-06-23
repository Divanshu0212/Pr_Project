import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiUploadCloud, FiCamera, FiX } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import './ProfileImageUpload.css';

const ProfileImageUpload = ({ onImageChange, initialImage = '' }) => {
  const [preview, setPreview] = useState(initialImage);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { theme } = useTheme();
  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = (file) => {
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => { // Simulate upload delay for better UX
          setPreview(reader.result);
          onImageChange({ file, previewUrl: URL.createObjectURL(file) });
          setIsUploading(false);
        }, 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageChange(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreview('');
    onImageChange({ file: null, previewUrl: '' });
  };

  return (
    <div className={`profile-image-upload ${theme}`}>
      <div 
        className={`image-preview-wrapper ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onClick={handleImageClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleImageClick()}
      >
        <div className="gradient-border">
          <div className="image-container">
            {isUploading ? (
              <div className="upload-progress">
                <div className="spinner"></div>
                <span className="upload-progress-text">Uploading...</span>
              </div>
            ) : preview ? (
              <>
                <img 
                  src={preview} 
                  alt="Profile Preview" 
                  className="preview-image"
                />
                <button 
                  className="remove-button"
                  onClick={handleRemoveImage}
                  type="button"
                  aria-label="Remove image"
                >
                  <FiX />
                </button>
              </>
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon-wrapper">
                  <FiUploadCloud className="placeholder-icon" />
                </div>
                <span className="placeholder-text">
                  {isDragging ? 'Drop image here' : 'Upload Photo'}
                </span>
                <span className="placeholder-subtext">
                  Click or drag 
                </span>
              </div>
            )}
            
            {!isUploading && preview && (
              <div className="upload-overlay">
                <div className="upload-content">
                  <FiCamera className="upload-icon" />
                  <span className="upload-text">Change Photo</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="ripple-effect"></div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect} 
        accept="image/*"
        id="profileImage"
        className="hidden-file-input"
        aria-hidden="true"
      />
    </div>
  );
};

ProfileImageUpload.propTypes = {
  onImageChange: PropTypes.func.isRequired,
  initialImage: PropTypes.string,
};

export default ProfileImageUpload;