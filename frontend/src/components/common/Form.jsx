import React from 'react';
import PropTypes from 'prop-types';
import './Form.css';

// Base Input Component for consistent styling
const BaseInput = ({
    type,
    name,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    className = '',
    as: Component = 'input', // Default to 'input', can be 'textarea'
    ...props
}) => {
    const inputClasses = `
        form-input
        ${disabled ? 'form-input-disabled' : ''}
        ${className}
    `.trim();

    return (
        <Component
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={inputClasses}
            {...props}
        />
    );
};

BaseInput.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    as: PropTypes.oneOf(['input', 'textarea']),
};
BaseInput.displayName = 'BaseInput';

// Main Form Wrapper Component
const Form = ({ children, className = '' }) => {
    return (
        <div className={`form-wrapper ${className}`.trim()}>
            {children}
        </div>
    );
};

Form.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
Form.displayName = 'Form';

// --- Sub-components for Form ---

// Form.Input
const Input = ({ label, icon, error, className = '', ...props }) => {
    const hasIcon = !!icon;
    
    return (
        <div className={`form-group ${className}`.trim()}>
            {label && (
                <label htmlFor={props.name} className="form-label">
                    {label}
                    {props.required && <span className="form-required">*</span>}
                </label>
            )}
            <div className="form-input-wrapper">
                {icon && (
                    <div className="form-input-icon">
                        {icon}
                    </div>
                )}
                <BaseInput
                    {...props}
                    className={hasIcon ? 'form-input-with-icon' : ''}
                />
            </div>
            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    icon: PropTypes.element,
    error: PropTypes.string,
};
Input.displayName = 'Form.Input';
Form.Input = Input;

// Form.Select
const Select = ({ label, options, error, className = '', ...props }) => {
    return (
        <div className={`form-group ${className}`.trim()}>
            {label && (
                <label htmlFor={props.name} className="form-label">
                    {label}
                    {props.required && <span className="form-required">*</span>}
                </label>
            )}
            <div className="form-select-wrapper">
                <select
                    id={props.name}
                    name={props.name}
                    value={props.value}
                    onChange={props.onChange}
                    required={props.required}
                    disabled={props.disabled}
                    className={`form-select ${props.disabled ? 'form-input-disabled' : ''}`.trim()}
                    {...props}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {/* Custom chevron icon for select */}
                <div className="form-select-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="form-select-chevron" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}
        </div>
    );
};

Select.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    error: PropTypes.string,
};
Select.displayName = 'Form.Select';
Form.Select = Select;

// Form.Checkbox
const Checkbox = ({ label, name, checked, onChange, className = '', disabled = false, ...props }) => {
    return (
        <div className={`form-checkbox-wrapper ${className}`.trim()}>
            <input
                type="checkbox"
                id={name}
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className={`form-checkbox ${disabled ? 'form-input-disabled' : ''}`.trim()}
                {...props}
            />
            {label && (
                <label htmlFor={name} className="form-checkbox-label">
                    {label}
                </label>
            )}
        </div>
    );
};

Checkbox.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
};
Checkbox.displayName = 'Form.Checkbox';
Form.Checkbox = Checkbox;

// Form.TextArea
const TextArea = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`form-group ${className}`.trim()}>
            {label && (
                <label htmlFor={props.name} className="form-label">
                    {label}
                    {props.required && <span className="form-required">*</span>}
                </label>
            )}
            <BaseInput as="textarea" {...props} />
            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}
        </div>
    );
};

TextArea.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    error: PropTypes.string,
    rows: PropTypes.number,
};
TextArea.displayName = 'Form.TextArea';
Form.TextArea = TextArea;

export default Form;