import React from 'react';
import { useTheme } from '../../context/ThemeContext';
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
  disabled = false,
  as = 'input',
  ...props
}) => {
  const { theme } = useTheme();
  const InputElement = as;

  return (
    <div className={`input-wrapper ${theme}`}>
      {label && (
        <label className="input-label" htmlFor={name}>
          <span className="label-text">{label}</span>
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-container">
        <InputElement
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input ${error ? 'is-error' : ''}`}
          disabled={disabled}
          required={required}
          {...props}
        />
        <div className="input-focus-ring"></div>
        <div className="input-glow"></div>
      </div>
      {error && (
        <p className="input-error-message">
          <span className="error-icon">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

Form.propTypes = {
  type: PropTypes.string.isRequired,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  as: PropTypes.oneOf(['input', 'textarea']),
};

export default Form;