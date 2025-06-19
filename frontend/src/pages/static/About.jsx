import React from 'react';
import { FiAward, FiUsers, FiTarget } from 'react-icons/fi';
import '../../styles/pages/About.css'; // We will create this file next

// Placeholder team data - you can move this to teamdata.js
const teamMembers = [
  { name: 'Alex Johnson', role: 'Lead Developer & Architect', avatar: 'A' },
  { name: 'Maria Garcia', role: 'UX/UI Designer', avatar: 'M' },
  { name: 'Sam Chen', role: 'Product Manager', avatar: 'S' },
];

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">About TrackFolio</h1>
          <p className="hero-subtitle">
            Empowering professionals to build, track, and showcase their careers with confidence.
          </p>
        </div>
      </section>

      <section className="about-mission">
        <div className="mission-content">
          <FiTarget className="mission-icon" />
          <h2>Our Mission</h2>
          <p>
            In today's competitive job market, a standout portfolio and a perfectly tailored resume are essential.
            TrackFolio was born from the need for a unified platform that seamlessly integrates portfolio creation, 
            resume building, and application tracking. Our mission is to provide you with the tools you need to not 
            only land your dream job but to manage and visualize your entire career journey.
          </p>
        </div>
      </section>

      <section className="about-team">
        <h2><FiUsers className="team-icon" /> Meet the Team</h2>
        <p className="team-intro">We are a small, passionate team dedicated to your success.</p>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar">{member.avatar}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

       <section className="about-values">
        <h2><FiAward className="values-icon" /> Our Values</h2>
        <div className="values-grid">
            <div className="value-item">
                <h3>User-Centric</h3>
                <p>Your goals are our priority. We design with your experience in mind.</p>
            </div>
            <div className="value-item">
                <h3>Innovation</h3>
                <p>We constantly seek better ways to help you succeed.</p>
            </div>
            <div className="value-item">
                <h3>Integrity</h3>
                <p>We are committed to being transparent and trustworthy.</p>
            </div>
        </div>
       </section>
    </div>
  );
};

export default About;