import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiUploadCloud, FiCamera } from 'react-icons/fi';
import './ProfileImageUpload.css';

const ProfileImageUpload = ({ onImageChange, initialImage = '' }) => {
  const [preview, setPreview] = useState(initialImage);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      onImageChange({ file, previewUrl: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="profile-image-upload">
      <div 
        className={`image-preview-wrapper ${isHovered ? 'hovered' : ''}`}
        onClick={handleImageClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="gradient-border">
          <div className="image-container">
            {preview ? (
              <img 
                src={preview} 
                alt="Profile Preview" 
                className="preview-image"
              />
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon-wrapper">
                  <FiUploadCloud className="placeholder-icon" />
                </div>
                <span className="placeholder-text">Upload Photo</span>
                <span className="placeholder-subtext">Click to browse</span>
              </div>
            )}
            
            <div className="upload-overlay">
              <div className="upload-content">
                <FiCamera className="upload-icon" />
                <span className="upload-text">Change Photo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageChange} 
        accept="image/*"
        id="profileImage"
        className="hidden-file-input"
      />
    </div>
  );
};

ProfileImageUpload.propTypes = {
  onImageChange: PropTypes.func.isRequired,
  initialImage: PropTypes.string,
};

export default ProfileImageUpload;