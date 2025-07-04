import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Auth.css';
import ProfileImageUpload from '../../components/common/ProfileImageUpload';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; 

const SignUp = () => {
  const navigate = useNavigate();
    const { theme } = useTheme();
  const { signup, signInWithGoogle, signInWithGithub, isAuthenticated, error: authError } = useAuth();
  const context = React.useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState({
    file: null,
    url: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    message: [],
  });
  const [messageIndex, setMessageIndex] = useState(0); // Added missing state

  const messages = [
    "Build Your Professional Identity Today",
    "Create a Resume That Stands Out",
    "Your Career Journey Starts Here",
    "Design Your Future With Our Templates",
    "Get Noticed By Top Employers"
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (authError) {
      setErrors(prevErrors => ({
        ...prevErrors,
        submit: authError
      }));
    }
  }, [authError]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const calculatePasswordStrength = (password) => {
    const messages = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else messages.push('At least 8 characters');

    if (/[A-Z]/.test(password)) score += 1;
    else messages.push('One uppercase letter');

    if (/[a-z]/.test(password)) score += 1;
    else messages.push('One lowercase letter');

    if (/[0-9]/.test(password)) score += 1;
    else messages.push('One number');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else messages.push('One special character');

    let label = '';
    if (score === 0) label = 'Very Weak';
    else if (score === 1) label = 'Weak';
    else if (score === 2) label = 'Fair';
    else if (score === 3) label = 'Good';
    else if (score === 4) label = 'Strong';
    else label = 'Very Strong';

    return { score, label, message: messages };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak. Please improve it.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      setErrors({});
      setSuccessMessage('');

      try {
        const signupFormData = new FormData();
        signupFormData.append('username', formData.username);
        signupFormData.append('displayName', formData.displayName);
        signupFormData.append('email', formData.email);
        signupFormData.append('password', formData.password);
        if (profileImage.file) {
          signupFormData.append('profileImage', profileImage.file);
        } else {
          console.log('No profile image selected');
        }

        const signupResponse = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          credentials: 'include',
          body: signupFormData
        });

        const signupResult = await signupResponse.json();

        if (!signupResponse.ok) {
          throw new Error(signupResult.message || 'Signup failed');
        }

        // Store token and update auth state
        localStorage.setItem('token', signupResult.token);
        localStorage.setItem('isAuthenticated', 'true');
        context.setIsAuthenticated(true);

        // Refresh user data
        try {
          await context.fetchUserDetails();
        } catch (fetchError) {
          console.error('Error fetching user details after signup:', fetchError);
        }

        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/home'), 2000);

      } catch (error) {
        console.error('Signup error:', error);
        setErrors({
          submit: error.message || 'An error occurred during signup'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    
    <div  className={'auth-wrapper ${theme}flex flex-col md:flex-row h-screen bg-[#0D1117]'}>
      <div className="left-section relative w-full md:w-2/5 bg-gradient-to-b from-[#0D1117] to-[#161B22] text-white flex flex-col justify-center items-center p-6 md:p-8 py-12 md:py-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="glow-effect cyan absolute top-1/4 left-1/4 w-64 h-64"></div>
          <div className="glow-effect purple absolute bottom-1/3 right-1/4 w-80 h-80"></div>
        </div>

        <div className="brand-logo mb-8 z-10 ">
          <div className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] animate-glow">
            ResumeBuilder
          </div>
        </div>

        <div className="message-container z-10 h-24 mb-6">
          {messages.map((message, index) => (
            <h1
              key={index}
              className={`animated-message text-3xl md:text-4xl font-bold text-center ${index === messageIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              {message}
            </h1>
          ))}
        </div>

        <button
          onClick={() => navigate("/login")}
          className="gradient-button mt-8 px-8 py-3 rounded-lg font-medium text-[#0D1117] z-10 animate-pulse-slow"
        >
          Already Have An Account
        </button>

        <svg
          className="wave-svg absolute bottom-0 left-0 w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#161B22"
            fillOpacity="0.8"
            d="M0,192L60,202.7C120,213,240,235,360,213.3C480,192,600,128,720,122.7C840,117,960,171,1080,197.3C1200,224,1320,224,1380,224L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="right-section w-full md:w-3/5 flex justify-center items-start md:items-center bg-[#161B22] p-4 md:p-8 lg:p-12 overflow-y-auto h-[60vh] md:h-full pt-16 md:pt-0">
        <div className="form-container w-full max-w-md animate-fade-in mb-8 md:mb-0 md:mt-[calc(400px)] mt-0">
          <h2 className="text-3xl font-bold text-[#00FFFF] mb-8">Create Account</h2>

          {errors.submit && (
            <div className="error-alert bg-red-500/10 border border-red-400 text-red-400 p-4 rounded-lg flex items-start mb-6">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 102 0V11a1 1 0 10-2 0v4z" clipRule="evenodd" />
              </svg>
              <span>{errors.submit}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 border border-green-400 text-green-400 p-4 rounded-lg flex items-start mb-6 animate-fade-in">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={signInWithGoogle}
              className="social-btn flex items-center justify-center py-3 px-4 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition-colors"
            >
              <FaGoogle className="social-btn-icon mr-2" />
              <span className="social-btn-text">Google</span>
            </button>
            <button
              onClick={signInWithGithub}
              className="social-btn flex items-center justify-center py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <FaGithub className="social-btn-icon mr-2" />
              <span className="social-btn-text">GitHub</span>
            </button>
          </div>

          <div className="divider">
            <span className="divider-text">or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <label htmlFor="username" className="text-[#ffffff] block font-medium">Username</label>
              <div className="input-container">
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-[#0D1117] text-white border-0 focus:outline-none ${errors.username ? 'ring-2 ring-red-500' : ''}`}
                />
              </div>
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="displayName" className="text-[#E5E5E5] block font-medium">Display Name</label>
              <div className="input-container">
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  placeholder="Choose a display name"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-[#0D1117] text-white border-0 focus:outline-none ${errors.displayName ? 'ring-2 ring-red-500' : ''}`}
                />
              </div>
              {errors.displayName && <p className="text-red-400 text-sm mt-1">{errors.displayName}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-[#E5E5E5] block font-medium">Email Address</label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-[#0D1117] text-white border-0 focus:outline-none ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[#E5E5E5] block font-medium">Password</label>
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-[#0D1117] text-white border-0 focus:outline-none pr-12 ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              {formData.password && (
                <div className="mt-2">
                  <div className="strength-bar-container">
                    <div
                      className={`strength-bar strength-${passwordStrength.score === 0 ? 'very-weak' : passwordStrength.score === 1 ? 'weak' : passwordStrength.score === 2 ? 'fair' : passwordStrength.score === 3 ? 'good' : 'strong'}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm" style={{
                      color:
                        passwordStrength.score === 0 ? '#ff4d4d' :
                          passwordStrength.score === 1 ? '#ff8533' :
                            passwordStrength.score === 2 ? '#ffcc00' :
                              passwordStrength.score === 3 ? '#99cc00' :
                                '#33cc33'
                    }}>
                      {passwordStrength.label}
                    </span>
                    {passwordStrength.message.length > 0 && (
                      <span className="text-gray-400 text-xs">
                        {passwordStrength.message.join(' • ')}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-[#E5E5E5] block font-medium">Confirm Password</label>
              <div className="input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-[#0D1117] text-white border-0 focus:outline-none pr-12 ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
             <div className="form-group">
              <label className="text-[#E5E5E5] block font-medium mb-2">Profile Picture (Optional)</label>
              <ProfileImageUpload
                onImageChange={(imageData) => {
                  setProfileImage({
                    file: imageData.file,
                    url: imageData.previewUrl
                  });
                }}
                initialImage={profileImage.url}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="gradient-button w-full py-3 rounded-lg font-medium text-[#0D1117] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-3"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center mt-8 text-[#E5E5E5]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#00FFFF] hover:text-[#9C27B0] transition-colors font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;