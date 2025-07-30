import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Consolidated all Fa icons into one import
import { FaGithub, FaLinkedin, FaTwitter, FaArrowRight, FaUserTie, FaBriefcase, FaSearch, FaRocket, FaCode, FaChartLine } from 'react-icons/fa';
// Consolidated all Hi icons into one import
import { HiSparkles, HiLightningBolt, HiStar } from 'react-icons/hi';
// Consolidated all Io5 icons into one import
import { IoRocketSharp, IoTrendingUp, IoCheckmarkCircle } from 'react-icons/io5';
// Consolidated all Bs icons into one import
import { BsCode, BsGraphUp, BsShieldCheck } from 'react-icons/bs';

import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';

import '../../styles/pages/LandingPage.css';
import { teamMembers, statistics } from '../../utils/data/teamdata';
import FeatureCard from '../../components/common/FeatureCard';
import TestimonialCard from '../../components/common/TestimonialCard';
import portfolioImg from '../../assets/img/TrackFolio.jpg';
import resumeImg from '../../assets/img/ResumeBuilder.png';
import atsImg from '../../assets/img/AtsTracker.png';

const LandingPage = ({ user }) => {
  const navigate = useNavigate();

  // Enhanced useInView hooks with staggered animations
  const { ref: heroSectionRef, inView: heroSectionInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: featuresHeaderRef, inView: featuresHeaderInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const { ref: differentiatorRef, inView: differentiatorInView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const { ref: howItWorksHeaderRef, inView: howItWorksHeaderInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const { ref: testimonialsHeaderRef, inView: testimonialsHeaderInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const { ref: statsSectionRef, inView: statsSectionInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const { ref: ctaSectionRef, inView: ctaSectionInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const statsRefs = {
    users: useRef(null),
    resumesGenerated: useRef(null),
    interviewSuccessRate: useRef(null),
    averageAtsScore: useRef(null),
  };
  const [statsCounted, setStatsCounted] = useState(false);

  const handleGetStarted = () => {
    navigate(user ? '/home' : '/signup');
  };

  // Replace the standardFeatures array with enhanced icons:
  const standardFeatures = [
    {
      icon: <FaBriefcase className="feature-icon gradient-icon" />,
      title: 'Portfolio Manager',
      description: 'Showcase your projects, skills, and achievements in a beautiful, organized portfolio.',
      image: portfolioImg,
      link: '/portfolio',
    },
    {
      icon: <FaUserTie className="feature-icon gradient-icon" />,
      title: 'Resume Generator', 
      description: 'Create professional, ATS-optimized resumes from your portfolio with just a few clicks.',
      image: resumeImg,
      link: '/resume',
    },
    {
      icon: <BsShieldCheck className="feature-icon gradient-icon" />,
      title: 'ATS Tracker',
      description: 'Upload your resume to test against ATS systems and get actionable improvement suggestions.',
      image: atsImg,
      link: '/ats',
    },
  ];

  // Enhanced stats animation
  useEffect(() => {
    if (statsSectionInView && !statsCounted) {
      Object.keys(statistics).forEach((key, index) => {
        const statRef = statsRefs[key];
        const target = statistics[key];
        if (statRef.current) {
          setTimeout(() => {
            let count = 0;
            const increment = target / 50;
            const interval = setInterval(() => {
              count += increment;
              if (count >= target) {
                clearInterval(interval);
                statRef.current.textContent = target;
              } else {
                statRef.current.textContent = Math.floor(count);
              }
            }, 30);
          }, index * 200);
        }
      });
      setStatsCounted(true);
    }
  }, [statsSectionInView, statsCounted, statistics]);

  return (
    <div className="landing-page">
      {/* Animated Background Elements */}
      <div className="bg-decorations">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroSectionRef} className="hero-section">
        <div className={`hero-content ${heroSectionInView ? 'animate-in' : ''}`}>
          <div className="hero-badge">
            <HiSparkles className="badge-icon" />
            <span>Elevate Your Career</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">
              Build Your 
              <span className="gradient-text glow-text"> Developer Portfolio</span>
            </span>
            <span className="title-line">
              <span className="typing-text">That Gets You Hired</span>
            </span>
          </h1>
          
          <p className="hero-subtitle">
            All-in-one platform to showcase your projects, generate ATS-optimized resumes, 
            and track your application success with AI-powered insights
          </p>
          
          {/* Redesigned hero-features-list to be more subtle */}
          <div className="hero-features-tags">
            <div className="hero-feature-tag">
              <IoTrendingUp className="tag-icon" />
              <span>Real-time ATS Scoring</span>
            </div>
            <div className="hero-feature-tag">
              <HiLightningBolt className="tag-icon" />
              <span>AI-Powered Optimization</span>
            </div>
            <div className="hero-feature-tag">
              <BsGraphUp className="tag-icon" />
              <span>Performance Analytics</span>
            </div>
          </div>
          
          <div className="hero-cta">
            <button onClick={handleGetStarted} className="btn-primary btn-enhanced pulse-animation">
              <span className="btn-text">{user ? 'Go to Dashboard' : 'Start Building Now'}</span>
              <div className="btn-icon-wrapper">
                <IoRocketSharp className="btn-icon" />
              </div>
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.getElementById('features').offsetTop, behavior: 'smooth' })}
              className="btn-secondary btn-enhanced glass-effect"
            >
              <span className="btn-text">Explore Features</span>
              <div className="btn-icon-wrapper">
                <FaArrowRight className="btn-icon" />
              </div>
            </button>
          </div>
        </div>
        
        {/* Enhanced hero-visual to fill space and be more central */}
        <div className={`hero-visual ${heroSectionInView ? 'animate-in' : ''}`}>
          <div className="code-window enhanced-code-window">
            <div className="code-header">
              <div className="window-controls">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="filename gradient-text">portfolio.js</span>
            </div>
            <div className="code-content">
              <pre>
                <code className="animated-code">
                  <span className="keyword">const</span> <span className="variable">developer</span> = {'{'}<br />
                  <span className="property">name</span>: <span className="string">"Your Name"</span>,<br />
                  <span className="property">skills</span>: [<span className="string">"React"</span>, <span className="string">"Node.js"</span>, <span className="string">"AI"</span>],<br />
                  <span className="property">projects</span>: [...<span className="comment">amazing_work</span>],<br />
                  <span className="property">experience</span>: [...<span className="comment">career_growth</span>],<br />
                  <span className="property">success</span>: <span className="boolean">true</span>,<br />
                  <span className="comment"> Let DevPortfolio handle the magic ✨</span><br />
                  {'}'}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Removed hero-robot div completely */}

      </section>

      {/* Features Section */}
      <section id="features" className={`features-section ${featuresHeaderInView ? 'animate-in' : ''}`}>
        <div ref={featuresHeaderRef} className={`section-header enhanced-header ${featuresHeaderInView ? 'slide-up' : ''}`}>
          <div className="header-decoration">
            <div className="decoration-line"></div>
            <HiSparkles className="decoration-icon" />
            <div className="decoration-line"></div>
          </div>
          <h2 className="section-title gradient-text">
            Why Choose DevPortfolio?
          </h2>
          <p className="section-subtitle">
            Everything you need to streamline your job application process and showcase your talents.
          </p>
        </div>
        
        <div className="features-grid">
          {standardFeatures.map((feature, index) => (
            <FeatureCard 
              key={index} 
              feature={{ ...feature, animationOrder: index + 1 }} 
            />
          ))}
        </div>

        {/* What Makes Us Different - Custom Styled Section */}
        <div ref={differentiatorRef} className={`differentiator-section ${differentiatorInView ? 'animate-in' : ''}`}>
          <div className="differentiator-card">
            <div className="card-header">
              <div className="header-icon">
                <HiSparkles className="sparkle-icon" />
              </div>
              <h3 className="card-title gradient-text">What Makes Us Different?</h3>
            </div>
            
            <div className="card-content">
              <div className="features-list">
                <div className="feature-item">
                  <BsGraphUp className="item-icon" />
                  <span>Real-time ATS resume scoring with instant feedback</span>
                </div>
                <div className="feature-item">
                  <BsCode className="item-icon" />
                  <span>AI-powered suggestions for optimal resume adjustments</span>
                </div>
                <div className="feature-item">
                  <IoRocketSharp className="item-icon" />
                  <span>Smart Portfolio customization with personalized features</span>
                </div>
                <div className="feature-item">
                  <HiLightningBolt className="item-icon" />
                  <span>Dynamic Skill Mapping for real-time professional development</span>
                </div>
                <div className="feature-item">
                  <IoTrendingUp className="item-icon" />
                  <span>Data-driven insights to track resume performance</span>
                </div>
              </div>
              
              <div className="special-note">
                <div className="note-content">
                  <HiSparkles className="note-icon" />
                  <p>
                    Unlock the power of real-time ATS scoring and AI-driven resume optimization. 
                    Stay ahead of the competition with cutting-edge technology...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`how-it-works ${howItWorksHeaderInView ? 'animate-in' : ''}`}>
        <div ref={howItWorksHeaderRef} className={`section-header ${howItWorksHeaderInView ? 'slide-up' : ''}`}>
          <h2 className="section-title gradient-text">How It Works</h2>
          <p className="section-subtitle">Three simple steps to boost your developer career</p>
        </div>
        
        <div className="steps-container">
          <div className="step" style={{ '--animation-order': 1 }}>
            <div className="step-number gradient-bg">1</div>
            <div className="step-content">
              <h3 className="step-title">Create Your Portfolio</h3>
              <p className="step-description">
                Add your projects, skills, and achievements to your personalized portfolio
              </p>
            </div>
          </div>
          
          <div className="step-connector animated-connector" style={{ '--animation-order': 2 }}></div>
          
          <div className="step" style={{ '--animation-order': 3 }}>
            <div className="step-number gradient-bg">2</div>
            <div className="step-content">
              <h3 className="step-title">Generate Your Resume</h3>
              <p className="step-description">
                Use your portfolio data to create customized, job-specific resumes
              </p>
            </div>
          </div>
          
          <div className="step-connector animated-connector" style={{ '--animation-order': 4 }}></div>
          
          <div className="step" style={{ '--animation-order': 5 }}>
            <div className="step-number gradient-bg">3</div>
            <div className="step-content">
              <h3 className="step-title">Analyze & Optimize</h3>
              <p className="step-description">
                Test your resume against ATS algorithms and improve your chances
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`testimonials-section ${testimonialsHeaderInView ? 'animate-in' : ''}`}>
        <div ref={testimonialsHeaderRef} className={`section-header ${testimonialsHeaderInView ? 'slide-up' : ''}`}>
          <h2 className="section-title gradient-text">Developer Success Stories</h2>
          <p className="section-subtitle">See how other developers have benefited from our platform</p>
        </div>
        <div className="testimonials-grid">
          {teamMembers.slice(0, 3).map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={{ ...testimonial, animationOrder: index + 1 }} 
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsSectionRef} className={`stats-section ${statsSectionInView ? 'animate-stats animate-in' : ''}`}>
        <div className="stats-container">
          <div className="stat-item" style={{ '--delay': '0s' }}>
            <div className="stat-number gradient-text" ref={statsRefs.users}>0</div>
            <p className="stat-label">Active Developers</p>
          </div>
          <div className="stat-item" style={{ '--delay': '0.2s' }}>
            <div className="stat-number gradient-text" ref={statsRefs.resumesGenerated}>0</div>
            <p className="stat-label">Resumes Generated</p>
          </div>
          <div className="stat-item" style={{ '--delay': '0.4s' }}>
            <div className="stat-number gradient-text" ref={statsRefs.interviewSuccessRate}>0</div>
            <p className="stat-label">Interview Success Rate</p>
          </div>
          <div className="stat-item" style={{ '--delay': '0.6s' }}>
            <div className="stat-number gradient-text" ref={statsRefs.averageAtsScore}>0</div>
            <p className="stat-label">Average ATS Score</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section ref={ctaSectionRef} className={`cta-section ${ctaSectionInView ? 'animate-in' : ''}`}>
        <div className="cta-content">
          <div className="cta-badge">
            <HiSparkles className="badge-icon" />
            <span>Ready to Transform Your Career?</span>
          </div>
          
          <h2 className="cta-title gradient-text">
            Join Thousands of Successful Developers
          </h2>
          
          <p className="cta-subtitle">
            Start building your professional portfolio today and unlock new career opportunities
          </p>
          
          <button onClick={handleGetStarted} className="btn-primary btn-enhanced btn-lg pulse-animation">
            <span className="btn-text">{user ? 'Go to Dashboard' : 'Create Your Account'}</span>
            <div className="btn-icon-wrapper">
              <IoRocketSharp className="btn-icon" />
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

LandingPage.propTypes = {
  user: PropTypes.object,
};

export default LandingPage;
