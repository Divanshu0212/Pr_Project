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
  disabled = false,
  as = 'input', // New prop to specify element type
  ...props // Pass down other props like rows for textarea
}) => {
  const InputElement = as; // Use 'as' prop to render input or textarea

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
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
      </div>
      {error && (
        <p className="input-error-message">
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