import { useState, useRef } from 'react';
import './styles/ResumeUploader.css';

function ResumeUploader({ profession, keywords, onSubmit, onBack }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      alert('Please upload a PDF, DOCX, or TXT file');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
    }
  };
 // Format keywords for display
 const renderKeywordsList = () => {
    return Object.entries(keywords).map(([category, termsList]) => (
      <div key={category} className="keyword-category">
        <h4>{formatCategoryName(category)}</h4>
        <div className="keyword-tags">
          {termsList.map((term, index) => (
            <span key={index} className="keyword-tag">{term}</span>
          ))}
        </div>
      </div>
    ));
  };

  const formatCategoryName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="resume-uploader">
      <div className="card">
        <h2>Upload Your Resume</h2>
        <p className="profession-display">Selected profession: <strong>{profession}</strong></p>
        
        <div className="keywords-section">
          <h3>Recommended Keywords</h3>
          <p className="keyword-info">Our ATS will scan for these keywords in your resume:</p>
          <div className="keywords-list">
            {renderKeywordsList()}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div 
            className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="file-input"
            />
            
            {file ? (
              <div className="file-preview">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <div className="drop-content">
                <div className="upload-icon">📤</div>
                <p>Drag & drop your resume here or click to browse</p>
                <p className="file-types">Supports PDF, DOCX, TXT</p>
              </div>
            )}
          </div>
          
          <div className="button-group">
            <button type="button" className="back-button" onClick={onBack}>
              Back
            </button>
            <button type="submit" className="submit-button" disabled={!file}>
              Analyze Resume
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResumeUploader;

// --------------