import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserTie, FaBriefcase, FaSearch } from 'react-icons/fa';
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

  // Add useInView for the Hero Section
  const { ref: heroSectionRef, inView: heroSectionInView } = useInView({
    triggerOnce: true, // Animation plays only once when it enters the viewport
    threshold: 0.1,    // Starts when 10% of the element is visible
  });

  const { ref: featuresHeaderRef, inView: featuresHeaderInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
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

  // Standard feature cards
  const standardFeatures = [
    {
      icon: <FaBriefcase className="text-[#00FFFF] text-2xl" />,
      title: 'Portfolio Manager',
      description: 'Showcase your projects, skills, and achievements in a beautiful, organized portfolio.',
      image: portfolioImg,
      link: '/portfolioHome',
    },
    {
      icon: <FaUserTie className="text-[#00FFFF] text-2xl" />,
      title: 'Resume Generator',
      description: 'Create professional, ATS-optimized resumes from your portfolio with just a few clicks.',
      image: resumeImg,
      link: '/resume-builder-home',
    },
    {
      icon: <FaSearch className="text-[#00FFFF] text-2xl" />,
      title: 'ATS Tracker',
      description: 'Upload your resume to test against ATS systems and get actionable improvement suggestions.',
      image: atsImg,
      link: '/ats',
    },
  ];

  // Special "What Makes Us Different" feature
  const differentiatorFeature = {
    title: 'What Makes Us Different?',
    isSpecial: true, // Added a flag to identify this as a special card
    description: (
      <div className="what-makes-different">
        <ul>
          <li>Real-time ATS resume scoring</li>
          <li>AI-powered suggestions for optimal resume adjustments</li>
          <li>Smart Portfolio customization with personalized features</li>
          <li>Dynamic Skill Mapping for real-time professional development</li>
          <li>Data-driven insights to track resume performance and improvement</li>
        </ul>
        <p className="special-note">
          Unlock the power of real-time ATS scoring and AI-driven resume optimization. Stay ahead of the competition...
        </p>
      </div>
    ),
  };

  // All features combined
  const featuresData = [...standardFeatures, differentiatorFeature];

  useEffect(() => {
    if (statsSectionInView && !statsCounted) {
      Object.keys(statistics).forEach((key) => {
        const statRef = statsRefs[key];
        const target = statistics[key];
        if (statRef.current) {
          let count = 0;
          const interval = setInterval(() => {
            count = Math.ceil(target * (count / target + 0.05));
            statRef.current.textContent = count;
            if (count >= target) {
              clearInterval(interval);
              statRef.current.textContent = target;
            }
          }, 50);
        }
      });
      setStatsCounted(true);
    }
  }, [statsSectionInView, statsCounted, statistics]);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section ref={heroSectionRef} className="hero-section">
        {/* Apply 'animate-in' class when heroSectionInView is true */}
        <div className={`hero-content ${heroSectionInView ? 'animate-in' : ''}`}>
          <h1 className="hero-title">Elevate Your <span className="text-accent">Developer Profile</span></h1>
          <p className="hero-subtitle">
            All-in-one platform to showcase your projects, generate ATS-optimized resumes, and track your application success
          </p>
          <div className="hero-cta">
            <button onClick={handleGetStarted} className="btn-primary">
              {user ? 'Go to Dashboard' : 'Get Started for Free'}
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.getElementById('features').offsetTop, behavior: 'smooth' })}
              className="btn-secondary"
            >
              Explore Features
            </button>
          </div>
        </div>
        {/* Apply 'animate-in' class to hero-visual as well */}
        <div className={`hero-visual ${heroSectionInView ? 'animate-in' : ''}`}>
          <div className="code-window">
            <div className="code-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="filename">portfolio.js</span>
            </div>
            <div className="code-content">
              <pre>
                <code>
                  <span className="keyword">const</span> <span className="variable">developer</span> = {'{'}<br />
                  &nbsp;&nbsp;name: <span className="string">`Your Name`</span>,<br />
                  &nbsp;&nbsp;skills: [<span className="string">`React`</span>, <span className="string">"Node.js"</span>, <span className="string">"Python"</span>],<br />
                  &nbsp;&nbsp;projects: [...],<br />
                  &nbsp;&nbsp;experience: [...],<br />
                  &nbsp;&nbsp;education: [...],<br />
                  &nbsp;&nbsp;<span className="comment">Let DevPortfolio handle the rest</span><br />
                  {'}'}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div ref={featuresHeaderRef} className={`section-header ${featuresHeaderInView ? 'in-view' : ''}`}>
          <h2>Why Choose Us? & Our Key Features</h2>
          <p>Everything you need to streamline your job application process and showcase your talents.</p>
        </div>
        <div className="features-grid">
          {featuresData.map((feature, index) => (
            <FeatureCard key={index} feature={{ ...feature, animationOrder: index + 1 }} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div ref={howItWorksHeaderRef} className={`section-header ${howItWorksHeaderInView ? 'in-view' : ''}`}>
          <h2>How It Works</h2>
          <p>Three simple steps to boost your developer career</p>
        </div>
        <div className="steps-container">
          <div className="step" style={{ '--animation-order': 1 }}>
            <div className="step-number">1</div>
            <h3>Create Your Portfolio</h3>
            <p>Add your projects, skills, and achievements to your personalized portfolio</p>
          </div>
          <div className="step-connector" style={{ '--animation-order': 2 }}></div>
          <div className="step" style={{ '--animation-order': 3 }}>
            <div className="step-number">2</div>
            <h3>Generate Your Resume</h3>
            <p>Use your portfolio data to create customized, job-specific resumes</p>
          </div>
          <div className="step-connector" style={{ '--animation-order': 4 }}></div>
          <div className="step" style={{ '--animation-order': 5 }}>
            <div className="step-number">3</div>
            <h3>Analyze & Optimize</h3>
            <p>Test your resume against ATS algorithms and improve your chances of getting interviews</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div ref={testimonialsHeaderRef} className={`section-header ${testimonialsHeaderInView ? 'in-view' : ''}`}>
          <h2>Developer Success Stories</h2>
          <p>See how other developers have benefited from our platform</p>
        </div>
        <div className="testimonials-grid">
          {teamMembers.slice(0, 3).map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={{ ...testimonial, animationOrder: index + 1 }} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsSectionRef} className="stats-section">
        <div className="stat-container">
          <div className="stat">
            <h2 ref={statsRefs.users}>0</h2>
            <p>Active Developers</p>
          </div>
          <div className="stat">
            <h2 ref={statsRefs.resumesGenerated}>0</h2>
            <p>Resumes Generated</p>
          </div>
          <div className="stat">
            <h2 ref={statsRefs.interviewSuccessRate}>0</h2>
            <p>Interview Success Rate</p>
          </div>
          <div className="stat">
            <h2 ref={statsRefs.averageAtsScore}>0</h2>
            <p>Average ATS Score</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section ref={ctaSectionRef} className={`cta-section ${ctaSectionInView ? 'animate-in' : ''}`}>
        <h2>Ready to Boost Your Developer Career?</h2>
        <p>Join thousands of professionals who've improved their job prospects with our platform</p>
        <button onClick={handleGetStarted} className="btn-primary btn-lg">
          {user ? 'Go to Dashboard' : 'Create Your Account'}
        </button>
      </section>
    </div>
  );
};

LandingPage.propTypes = {
  user: PropTypes.object,
};

export default LandingPage;