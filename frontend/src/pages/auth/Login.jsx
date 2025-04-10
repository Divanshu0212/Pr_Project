import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, signInWithGoogle, signInWithGithub, isAuthenticated, error: authError } = useAuth();

  const [messageIndex, setMessageIndex] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remember, setRemember] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const messages = [
    "Welcome! Create your perfect resume today.",
    "Join us to manage your professional portfolio.",
    "Sign up and take control of your career journey.",
    "Craft a resume that gets you noticed.",
    "Your career success starts here."
  ];

  // Rotating messages with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update errors if auth context has an error
  useEffect(() => {
    if (authError) {
      setErrors({
        ...errors,
        submit: authError
      });
    }
  }, [authError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await login(formData.email, formData.password);
        // Navigation handled by the useEffect watching isAuthenticated
      } catch (error) {
        setErrors({
          ...errors,
          submit: error.message || 'Invalid email or password'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Left Section - Branding & Messaging */}
      <div className="left-section">
        {/* Decorative Elements */}
        <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
          <div className="glow-effect cyan absolute left-1/4 top-1/4 h-64 w-64"></div>
          <div className="glow-effect purple absolute bottom-1/3 right-1/4 h-80 w-80"></div>
        </div>

        {/* Logo Placeholder */}
        <div className="brand-logo z-10 mb-12 animate-float">
          <div className="animate-glow bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] bg-clip-text text-5xl font-bold text-transparent">
            ResumeBuilder
          </div>
        </div>

        {/* Animated Message */}
        <div className="message-container z-10 mb-6 h-24">
          {messages.map((message, index) => (
            <h1
              key={index}
              className={`animated-message text-center text-3xl font-bold ${
                index === messageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {message}
            </h1>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/signup")}
          className="gradient-button z-10 mt-8 animate-pulse-slow rounded-lg px-8 py-3 font-medium text-[#0D1117]"
        >
          Create Account
        </button>

        {/* Decorative SVG Wave */}
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

      {/* Right Section - Login Form */}
      <div className="right-section">
        <div className="form-container">
          {/* Mobile version of branding - only shows on small screens */}
          <div className="mb-8 text-center md:hidden">
            <div className="animate-glow bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] bg-clip-text text-4xl font-bold text-transparent">
              ResumeBuilder
            </div>
          </div>

          <h2 className="mb-8 text-3xl font-bold text-[#00FFFF]">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {errors.submit && (
              <div className="error-alert flex items-start rounded-lg border border-red-400 bg-red-500/10 p-4 text-red-400">
                <svg className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 102 0V11a1 1 0 10-2 0v4z" clipRule="evenodd" />
                </svg>
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block font-medium text-[#E5E5E5]">Email Address</label>
              <div className={`input-container ${errors.email ? 'ring-2 ring-red-500' : ''}`}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border-0 bg-[#0D1117] px-4 py-3 text-white focus:outline-none"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block font-medium text-[#E5E5E5]">Password</label>
              <div className={`input-container relative ${errors.password ? 'ring-2 ring-red-500' : ''}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border-0 bg-[#0D1117] px-4 py-3 pr-12 text-white focus:outline-none"
                />
                <button
                  type="button"
                  className="password-toggle absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-[#00FFFF]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-wrap items-center justify-between gap-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 text-[#00FFFF] focus:ring-[#00FFFF] focus:ring-offset-[#161B22]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-[#E5E5E5]">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-sm text-[#00FFFF] transition-colors hover:text-[#9C27B0]">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="gradient-button mt-4 w-full rounded-lg py-3 font-medium text-[#0D1117] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-3"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="divider mt-8">
            <span className="divider-text">or continue with</span>
          </div>

          {/* Social Login */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={signInWithGoogle}
              className="social-btn flex items-center justify-center rounded-lg bg-white px-4 py-3 text-gray-800 transition-colors hover:bg-gray-100"
            >
              <FaGoogle className="social-btn-icon mr-2" />
              <span className="social-btn-text">Google</span>
            </button>
            <button
              onClick={signInWithGithub}
              className="social-btn flex items-center justify-center rounded-lg bg-gray-800 px-4 py-3 text-white transition-colors hover:bg-gray-700"
            >
              <FaGithub className="social-btn-icon mr-2" />
              <span className="social-btn-text">GitHub</span>
            </button>
          </div>

          <div className="mt-8 text-center text-[#E5E5E5]">
            Don`t have an account?{" "}
            <Link to="/signup" className="font-medium text-[#00FFFF] transition-colors hover:text-[#9C27B0]">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;