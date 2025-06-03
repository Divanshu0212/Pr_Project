import { useState, useRef } from 'react';

const ProfileImageUpload = ({ onImageChange, initialImage = '' }) => {
  const [preview, setPreview] = useState(initialImage);
  const fileInputRef = useRef(null);
  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageChange({
        file,
        previewUrl
      });
    }
  };

  return (
    <div className="profile-image-upload">
      <div 
        className="image-preview cursor-pointer" 
        onClick={handleImageClick}
      >
        {preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="preview-image"
          />
        ) : (
          <div className="placeholder">Click to upload image</div>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageChange} 
        accept="image/*"
        id="profileImage"
        className="hidden"
      />
      
      <style jsx="true">{`
        .profile-image-upload {
          margin: 20px 0;
          text-align: center;
        }
        .image-preview {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          margin: 0 auto 15px;
          overflow: hidden;
          border: 2px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        .image-preview:hover {
          border-color: #4CAF50;
        }
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .placeholder {
          color: #999;
          padding: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ProfileImageUpload;