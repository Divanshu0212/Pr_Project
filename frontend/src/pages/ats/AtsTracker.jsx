import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Target, Zap, CheckCircle, AlertCircle, TrendingUp, Shield, Star } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import UploadForm from '../../components/ats/UploadForm';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';
import { useTheme } from '../../context/ThemeContext';
// Ensure your animations.css is imported somewhere globally (e.g., App.js)
// or import it here if it's specific to this component's needs:
// import '../../styles/animations.css'; 

// Placeholder for the backend analysis function
const analyzeResumeOnBackend = async (file, jobDescription) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jobDescription', jobDescription);

  const response = await fetch('http://localhost:8080/api/analyze-resume', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || 'Analysis failed on the backend');
  }

  const result = await response.json();
  return result.analysisId;
};

const AtsTracker = () => {
  const { theme, isDark } = useTheme();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Use a single useEffect for Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, // Element is considered "in view" when 10% is visible
      rootMargin: '0px 0px -50px 0px' // Adjust trigger point to be slightly before the bottom
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible'); // Add 'visible' class to trigger CSS animation
        } else {
          // Optional: Remove 'visible' class if you want animations to replay when scrolling back up
          // entry.target.classList.remove('visible');
        }
      });
    }, observerOptions);

    // Observe all elements with the 'animate-on-scroll' class
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []); // Empty dependency array means this runs once on mount

  const handleResumeUpload = (file) => {
    setResumeFile(file);
    setError('');
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      setError('Please upload a resume file');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsLoading(true);
    try {
      const analysisId = await analyzeResumeOnBackend(resumeFile, jobDescription);
      navigate(`/ats/analysis/${analysisId}`);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      icon: <Upload className="w-6 h-6" />,
      text: "Upload your resume",
      subtitle: "PDF recommended for best parsing",
      gradient: "from-cyan-400 to-blue-500"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      text: "Paste job description",
      subtitle: "Complete requirements & qualifications",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      text: "Get ATS analysis",
      subtitle: "Compatibility score & insights",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      text: "Receive recommendations",
      subtitle: "Actionable improvement tips",
      gradient: "from-pink-500 to-cyan-400"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "ATS Score",
      desc: "Get detailed compatibility ratings"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Keyword Analysis",
      desc: "Identify missing critical keywords"
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Format Check",
      desc: "Ensure ATS-friendly formatting"
    }
  ];

  if (isLoading) {
    return <LoadingState message="Analyzing your resume against ATS criteria..." />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50'
    }`}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Floating Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-cyan-500' : 'bg-blue-400'
          } animate-float-bg-circles-normal`}></div> {/* Using new class */}
          <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-15 ${
            isDark ? 'bg-purple-500' : 'bg-purple-400'
          } animate-float-bg-circles-reverse`}></div> {/* Using new class */}
        </div>

        {/* Header */}
        <div
          id="header"
          data-animate
          className="animate-on-scroll scroll-reveal-delay-0" // Using animate-on-scroll
        >
          <div className="relative z-10 text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className={`bg-gradient-to-r ${
                isDark
                  ? 'from-cyan-400 via-blue-400 to-purple-400'
                  : 'from-cyan-600 via-blue-600 to-purple-600'
              } bg-clip-text text-transparent`}>
                ATS Resume
              </span>
              <br />
              <span className={`bg-gradient-to-r ${
                isDark
                  ? 'from-purple-400 via-pink-400 to-cyan-400'
                  : 'from-purple-600 via-pink-600 to-cyan-600'
              } bg-clip-text text-transparent`}>
                Analyzer
              </span>
            </h1>

            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Optimize your resume for Applicant Tracking Systems with AI-powered analysis and
              <span className={`font-semibold ${
                isDark ? 'text-cyan-400' : 'text-blue-600'
              }`}> actionable insights</span>
            </p>

            {/* Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 animate-on-scroll`} // Apply animate-on-scroll here
                  style={{ animationDelay: `${index * 150}ms` }} // Staggered reveal
                >
                  <div className={`${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                    {benefit.icon}
                  </div>
                  <span className="text-sm font-medium">{benefit.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div
            id="error"
            data-animate
            className="animate-on-scroll scroll-reveal-delay-0" // Using animate-on-scroll
          >
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Main Upload Section */}
        <div
          id="upload-section"
          data-animate
          className="animate-on-scroll scroll-reveal-delay-300" // Using animate-on-scroll
        >
          <Card className={`relative overflow-hidden backdrop-blur-sm ${
            isDark
              ? 'bg-gray-800/30 border-gray-700/30'
              : 'bg-white/70 border-gray-200/30'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
            <div className="relative p-8 md:p-12">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mr-6 shadow-lg">
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${
                    isDark ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    Upload Your Resume
                  </h2>
                  <p className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Start your ATS optimization journey
                  </p>
                </div>
              </div>

              <UploadForm onFileUpload={handleResumeUpload} />

              <div className="mt-10">
                <label className={`flex items-center mb-6 text-xl font-semibold ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`} htmlFor="jobDescription">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-600'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  Job Description
                </label>

                <div className="relative">
                  <textarea
                    id="jobDescription"
                    className={`w-full rounded-2xl p-6 text-lg min-h-[240px] resize-y transition-all duration-300 focus:scale-[1.02] ${
                      isDark
                        ? 'bg-gray-800/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:bg-gray-800/70'
                        : 'bg-white/50 border-2 border-gray-300/50 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:bg-white/80'
                    } focus:outline-none focus:ring-4 focus:ring-cyan-500/20`}
                    placeholder="Paste the complete job description here including requirements, qualifications, and responsibilities..."
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className={`mt-4 flex items-center text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <AlertCircle className={`w-5 h-5 mr-2 ${
                    isDark ? 'text-cyan-400' : 'text-blue-600'
                  }`} />
                  <span>For best results, include the complete job posting with requirements and qualifications</span>
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <Button
                  text={
                    <span className="flex items-center text-lg font-semibold">
                      <Zap className="w-6 h-6 mr-3" />
                      Analyze Resume
                    </span>
                  }
                  onClick={handleSubmit}
                  disabled={!resumeFile || !jobDescription.trim()}
                  className={`px-10 py-4 rounded-2xl text-white font-semibold shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    !resumeFile || !jobDescription.trim()
                      ? 'bg-gray-400'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95'
                  }`}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* How It Works Section */}
        <div
          id="how-it-works"
          data-animate
          className="animate-on-scroll scroll-reveal-delay-500" // Using animate-on-scroll
        >
          <Card className={`backdrop-blur-sm ${
            isDark
              ? 'bg-gray-800/30 border-gray-700/30'
              : 'bg-white/70 border-gray-200/30'
          }`}>
            <div className="p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className={`text-3xl font-bold mb-4 ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  How It Works
                </h2>
                <p className={`text-lg ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Four simple steps to optimize your resume
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="text-center group animate-on-scroll" // Each step will also animate individually
                    style={{ animationDelay: `${index * 150}ms` }} // Staggered reveal
                  >
                    <div className="relative mb-6">
                      <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r ${step.gradient} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        {step.icon}
                      </div>
                      <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-gradient-to-r ${
                        isDark ? 'from-cyan-500 to-purple-500' : 'from-blue-500 to-purple-500'
                      } flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                        {index + 1}
                      </div>
                    </div>

                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {step.text}
                    </h3>

                    <p className={`text-sm leading-relaxed ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.subtitle}
                    </p>
                  </div>
                ))}
              </div>

              {/* Process Flow Line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 -translate-y-1/2"></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AtsTracker;