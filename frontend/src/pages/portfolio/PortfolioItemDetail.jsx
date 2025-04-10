// src/pages/portfolio/PortfolioItemDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePortfolio from '../../hooks/usePortfolio';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import '../../styles/pages/PortfolioItemDetail.css';

const PortfolioItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPortfolioItem, deletePortfolioItem, loading, error } = usePortfolio();
  const [item, setItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      const data = await fetchPortfolioItem(id);
      if (data) {
        setItem(data);
      }
    };
    
    loadItem();
  }, [id, fetchPortfolioItem]);

  const handleDelete = async () => {
    try {
      await deletePortfolioItem(id);
      navigate('/portfolioHome');
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  if (loading) return <Loader />;
  
  if (error) return (
    <div className="error-container">
      <h2 className="text-red-500">Error loading portfolio item</h2>
      <p>{error}</p>
      <Button onClick={() => navigate('/portfolioHome')}>Back to Portfolio</Button>
    </div>
  );
  
  if (!item) return null;

  return (
    <div className="portfolio-item-detail">
      <div className="portfolio-item-header">
        <h1 className="text-3xl font-bold text-[#E5E5E5]">{item.title}</h1>
        <div className="portfolio-item-actions">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/portfolio/edit/${id}`)}
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>
      
      <div className="portfolio-item-badge">
        {item.category}
      </div>
      
      <div className="portfolio-item-content">
        {item.image && (
          <div className="portfolio-item-image">
            <img src={item.image} alt={item.title} />
          </div>
        )}
        
        <div className="portfolio-item-info">
          {item.description && (
            <div className="info-section">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>
          )}
          
          {(item.startDate || item.endDate) && (
            <div className="info-section">
              <h3>Duration</h3>
              <p>
                {formatDate(item.startDate)}
                {' - '}
                {item.ongoing ? 'Present' : formatDate(item.endDate)}
              </p>
            </div>
          )}
          
          {item.organization && (
            <div className="info-section">
              <h3>{getCategorySpecificLabel(item.category, 'organization')}</h3>
              <p>{item.organization}</p>
            </div>
          )}
          
          {item.location && (
            <div className="info-section">
              <h3>Location</h3>
              <p>{item.location}</p>
            </div>
          )}
          
          {item.degree && (
            <div className="info-section">
              <h3>Degree/Course</h3>
              <p>{item.degree}</p>
            </div>
          )}
          
          {item.grade && (
            <div className="info-section">
              <h3>Grade/Score</h3>
              <p>{item.grade}</p>
            </div>
          )}
          
          {item.proficiency && (
            <div className="info-section">
              <h3>Proficiency Level</h3>
              <p className="proficiency-level">{capitalizeFirstLetter(item.proficiency)}</p>
            </div>
          )}
          
          {item.technologies && item.technologies.length > 0 && (
            <div className="info-section">
              <h3>Technologies Used</h3>
              <div className="technologies-list">
                {item.technologies.map((tech, index) => (
                  <span key={index} className="technology-badge">{tech}</span>
                ))}
              </div>
            </div>
          )}
          
          {item.link && (
            <div className="info-section">
              <h3>{item.category === 'projects' ? 'Project URL' : 'Certificate URL'}</h3>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link"
              >
                {item.link}
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div className="portfolio-item-footer">
        <Button variant="outline" onClick={() => navigate('/portfolioHome')}>
          Back to Portfolio
        </Button>
      </div>
      
      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="delete-confirmation">
            <p>Are you sure you want to delete <strong>{item.title}</strong>?</p>
            <p className="text-red-400">This action cannot be undone.</p>
            
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Helper functions
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short'
  });
}

function getCategorySpecificLabel(category, field) {
  if (field === 'organization') {
    switch (category) {
      case 'education': return 'Institution';
      case 'experience': return 'Company';
      case 'certifications': return 'Issuing Organization';
      default: return 'Organization';
    }
  }
  return field;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default PortfolioItemDetail;