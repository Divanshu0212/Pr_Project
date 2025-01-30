import React, { useState } from 'react';
import SummaryApi from '../common';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const checkPasswordStrength = (password) => {
    const messages = [];
    if (password.length < 8) messages.push('At least 8 characters long.');
    if (!/[A-Z]/.test(password)) messages.push('One uppercase letter.');
    if (!/[a-z]/.test(password)) messages.push('One lowercase letter.');
    if (!/[0-9]/.test(password)) messages.push('One number.');
    if (!/[@$!%*?&]/.test(password)) messages.push('One special character.');

    if (messages.length === 0) {
      setPasswordStrength('Strong');
      setIsPasswordValid(true);
    } else {
      setPasswordStrength(`Weak: ${messages.join(' ')}`);
      setIsPasswordValid(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    checkPasswordStrength(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password is too weak.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(SummaryApi.signUp.url, {
        method: SummaryApi.signUp.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage('Signup successful! You can now log in.');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(result.message || 'Signup failed.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-0 w-full h-full flex items-center justify-center min-h-screen bg-[#0D1117] p-6">
      <div className="bg-[#161B22] p-8 md:p-12 rounded-3xl w-full max-w-2xl shadow-2xl space-y-6 z-10">
        <h2 className="text-3xl font-bold text-center text-[#E5E5E5]">Sign Up</h2>
        <p className="text-center text-[#E5E5E5]">Create a new account</p>
        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <InputField
            label="Username"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <InputField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <InputField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
          />
          {passwordStrength && (
            <div className="text-sm text-[#E5E5E5]">{passwordStrength}</div>
          )}
          <InputField
            label="Confirm Password"
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className={`bg-[#00FFFF] px-8 py-3 text-[#0D1117] font-semibold rounded-lg shadow-lg hover:bg-[#9C27B0] focus:outline-none focus:ring-2 focus:ring-[#00FFFF] ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Create Account'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <button
            className="text-[#00FFFF] underline hover:text-[#9C27B0]"
            onClick={() => navigate("/authpage")}
          >
            If already have an account, login
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, id, type, value, onChange, placeholder }) => (
  <div className="flex items-center space-x-4">
    <label htmlFor={id} className="w-1/3 text-[#E5E5E5] font-semibold">
      {label}:
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="w-full p-2 bg-[#161B22] text-[#E5E5E5] border rounded-lg border-[#444C56] focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
      placeholder={placeholder}
      required
    />
  </div>
);

export default SignUp;
