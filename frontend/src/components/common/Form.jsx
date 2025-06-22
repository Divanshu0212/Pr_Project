import React from 'react';
import './Form.css';
import PropTypes from 'prop-types';

const Form = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false
}) => {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-container">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input ${error ? 'input-error' : ''}`}
          disabled={disabled}
          required={required}
        />
        <div className="input-focus-ring"></div>
      </div>
      {error && (
        <div className="input-error-message">
          <svg className="input-error-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 4v4M8 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

Form.propTypes = {
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'date', 'checkbox', 'radio']).isRequired,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Form;