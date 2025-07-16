import React, { useEffect } from 'react';
import { FiAward, FiUsers, FiTarget, FiZap } from 'react-icons/fi';
import '../../styles/pages/About.css'; // Ensure this path is correct
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/common/Card';

// Updated team data to 5 members based on project context
const teamMembers = [
  { name: 'Alex Johnson', role: 'Lead Developer & Architect', avatar: 'A' },
  { name: 'Maria Garcia', role: 'UX/UI Designer', avatar: 'M' },
  { name: 'Sam Chen', role: 'Product Manager', avatar: 'S' },
  { name: 'Your Name', role: 'Fullstack + Security', avatar: 'Y' }, // Assuming 'Your Name' is the user
  { name: 'Jane Doe', role: 'ML Lead', avatar: 'J' }, // Placeholder for another ML Lead or specific name
];

const About = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        } else {
          // Optional: remove 'animate-in' if you want elements to re-animate on scroll out/in
          // entry.target.classList.remove('animate-in');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    // Observe all elements with animate-on-scroll class
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`about-page ${theme}`}>
      <section className="about-hero">
        <div className="hero-background-mesh"></div>
        {/* Ensure animate-on-scroll is on hero-content for the observer to pick it up */}
        <div className="hero-content animate-on-scroll"> 
          <div className="hero-icon-wrapper">
            <FiZap className="hero-icon" />
          </div>
          <h1 className="hero-title gradient-text">About TrackFolio</h1>
          <p className="hero-subtitle">
            Empowering professionals to build, track, and showcase their careers with confidence.
          </p>
        </div>
      </section>

      <section className="about-mission animate-on-scroll">
        <Card className="mission-card">
          <FiTarget className="mission-icon" />
          <h2>Our Mission</h2>
          <p>
            In today's competitive job market, a standout portfolio and a perfectly tailored resume are essential.
            TrackFolio was born from the need for a unified platform that seamlessly integrates portfolio creation, 
            resume building, and application tracking. Our mission is to provide you with the tools you need to not 
            only land your dream job but to manage and visualize your entire career journey.
          </p>
        </Card>
      </section>

      <section className="about-team animate-on-scroll">
        <h2><FiUsers className="team-icon" /> Meet the Team</h2>
        <p className="team-intro">We are a small, passionate team dedicated to your success.</p>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <Card 
              key={index} 
              className="team-card animate-on-scroll"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="team-avatar">{member.avatar}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="about-values animate-on-scroll">
        <h2><FiAward className="values-icon" /> Our Values</h2>
        <div className="values-grid">
          <Card 
            className="value-item animate-on-scroll"
            style={{ animationDelay: '0.1s' }}
          >
            <h3>User-Centric</h3>
            <p>Your goals are our priority. We design with your experience in mind.</p>
          </Card>
          <Card 
            className="value-item animate-on-scroll"
            style={{ animationDelay: '0.2s' }}
          >
            <h3>Innovation</h3>
            <p>We constantly seek better ways to help you succeed.</p>
          </Card>
          <Card 
            className="value-item animate-on-scroll"
            style={{ animationDelay: '0.3s' }}
          >
            <h3>Integrity</h3>
            <p>We are committed to being transparent and trustworthy.</p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;
