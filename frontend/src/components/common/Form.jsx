import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext'; // Ensure this path is correct
import clsx from 'clsx'; // Assuming clsx is installed and used

// Base Input Component for consistent styling
const BaseInput = ({
    type,
    name,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    className,
    as: Component = 'input', // Default to 'input', can be 'textarea'
    ...props
}) => {
    const { isDark } = useTheme();

    const inputClasses = clsx(
        "w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 transform",
        isDark
            ? "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 backdrop-blur-sm"
            : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm",
        className, // Allow external classes to be passed
        disabled && "opacity-50 cursor-not-allowed" // Disabled state
    );

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

// Main Form Wrapper Component
const Form = ({ children }) => {
    // This component acts as a container for form elements,
    // It doesn't have direct props for input elements itself.
    return <div className="form-wrapper">{children}</div>;
};

// --- Sub-components for Form ---

// Form.Input
Form.Input = ({ label, icon, ...props }) => {
    const { isDark } = useTheme();
    const labelClasses = clsx(
        "block mb-2 font-semibold transition-colors duration-300",
        isDark ? 'text-gray-200' : 'text-gray-700'
    );
    const requiredIndicatorClass = clsx("text-red-500", !props.label && 'sr-only'); // Optional screen reader text for required if no label

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={props.name} className={labelClasses}>
                    {label}
                    {props.required && <span className={requiredIndicatorClass}> *</span>}
                </label>
            )}
            <div className="relative">
                {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
                <BaseInput
                    {...props}
                    className={clsx(props.className, icon && 'pl-10')} // Add left padding if icon is present
                />
            </div>
            {props.error && (
                <p className={clsx("text-red-500 text-sm mt-1")}>
                    {props.error}
                </p>
            )}
        </div>
    );
};

Form.Input.propTypes = {
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

// Form.Select
Form.Select = ({ label, options, ...props }) => {
    const { isDark } = useTheme();
    const labelClasses = clsx(
        "block mb-2 font-semibold transition-colors duration-300",
        isDark ? 'text-gray-200' : 'text-gray-700'
    );
    const selectClasses = clsx(
        "w-full px-4 py-3 rounded-lg border-2 appearance-none transition-all duration-300 focus:outline-none focus:ring-2",
        isDark
            ? "bg-gray-800/50 border-gray-600 text-white focus:border-cyan-400 focus:ring-cyan-400/20 backdrop-blur-sm"
            : "bg-white/80 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm",
        props.className
    );

    return (
        <div className="form-group">
            {label && <label htmlFor={props.name} className={labelClasses}>{label}</label>}
            <div className="relative">
                <select
                    id={props.name}
                    name={props.name}
                    value={props.value}
                    onChange={props.onChange}
                    className={selectClasses}
                    {...props}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {/* Custom chevron icon for select */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            {props.error && (
                <p className={clsx("text-red-500 text-sm mt-1")}>
                    {props.error}
                </p>
            )}
        </div>
    );
};

Form.Select.propTypes = {
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

// Form.Checkbox
Form.Checkbox = ({ label, name, checked, onChange, className, ...props }) => {
    const { isDark } = useTheme();

    return (
        <div className={clsx("flex items-center", className)}>
            <input
                type="checkbox"
                id={name}
                name={name}
                checked={checked}
                onChange={onChange}
                className={clsx(
                    "h-5 w-5 rounded transition-colors duration-300",
                    isDark
                        ? "text-cyan-400 bg-gray-700 border-gray-600 focus:ring-cyan-400 focus:ring-offset-gray-800"
                        : "text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-offset-white"
                )}
                {...props}
            />
            {label && (
                <label htmlFor={name} className={clsx("ml-2 text-base transition-colors duration-300", isDark ? 'text-gray-300' : 'text-gray-700')}>
                    {label}
                </label>
            )}
        </div>
    );
};

Form.Checkbox.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};


// You can also add a TextArea component
Form.TextArea = ({ label, ...props }) => {
    const { isDark } = useTheme();
    const labelClasses = clsx(
        "block mb-2 font-semibold transition-colors duration-300",
        isDark ? 'text-gray-200' : 'text-gray-700'
    );
    const requiredIndicatorClass = clsx("text-red-500", !props.label && 'sr-only');

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={props.name} className={labelClasses}>
                    {label}
                    {props.required && <span className={requiredIndicatorClass}> *</span>}
                </label>
            )}
            <BaseInput as="textarea" {...props} />
            {props.error && (
                <p className={clsx("text-red-500 text-sm mt-1")}>
                    {props.error}
                </p>
            )}
        </div>
    );
};

Form.TextArea.propTypes = {
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


export default Form;