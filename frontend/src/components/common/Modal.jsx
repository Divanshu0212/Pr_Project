import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  const { theme } = useTheme();

  // Enhanced useEffect to handle both escape key and body class management
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listener for escape key
      window.addEventListener('keydown', handleEsc);
      
      // Add class to body to disable background scroll and apply blur
      document.body.classList.add('modal-is-open');
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleEsc);
      
      // Remove the class and restore scroll
      document.body.classList.remove('modal-is-open');
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Use ReactDOM.createPortal to render the modal into '#modal-root'
  return ReactDOM.createPortal(
    <div 
      className={`modal-overlay ${theme}`} 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-glow"></div>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') // The target element for the portal
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;

/*import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import './Modal.css';
const Modal = ({ isOpen, onClose, title, children }) => {
const { theme } = useTheme();
// Effect to handle escape key press
useEffect(() => {
const handleEsc = (event) => {
if (event.keyCode === 27) {
onClose();
}
};
if (isOpen) {
window.addEventListener('keydown', handleEsc);
document.body.style.overflow = 'hidden';
}
return () => {
window.removeEventListener('keydown', handleEsc);
document.body.style.overflow = 'unset';
};
}, [isOpen, onClose]);
if (!isOpen) return null;
return (
<div className={modal-overlay ${theme}} onClick={onClose}>
<div
className="modal-container"
onClick={(e) => e.stopPropagation()}
>
<div className="modal-glow"></div>
<div className="modal-header">
<h2 className="modal-title">{title}</h2>
<button 
className="modal-close-btn" 
onClick={onClose} 
aria-label="Close modal"
>
<FiX />
</button>
</div>
<div className="modal-content">
{children}
</div>
</div>
</div>
);
};
Modal.propTypes = {
isOpen: PropTypes.bool.isRequired,
onClose: PropTypes.func.isRequired,
title: PropTypes.string.isRequired,
children: PropTypes.node.isRequired,
};
export default Modal; */