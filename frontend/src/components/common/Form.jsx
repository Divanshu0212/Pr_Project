import React from 'react';
import './Form.css';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation

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
      {error && <p className="input-error-message">{error}</p>}
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