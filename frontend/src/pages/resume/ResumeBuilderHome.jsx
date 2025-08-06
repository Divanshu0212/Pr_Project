import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/ResumeBuilderHome.css'; // Added new stylesheet import

const ResumeBuilderHome = () => {
    const navigate = useNavigate();

    return (
        // Replaced all hard-coded color classes with semantic class names
        <div className="resume-home-page">
            <div className="resume-home-container">
                <div className="page-header">
                    <h1 className="page-title">Resume Builder</h1>
                    <p className="page-subtitle">
                        Create professional resumes tailored to your career goals. Pull in your portfolio data
                        or start fresh with our intuitive builder.
                    </p>
                </div>

                <div className="action-cards-grid">
                    <div className="action-card">
                        <h2 className="action-card-title">Create General Resume</h2>
                        <p className="action-card-description">
                            Start from scratch with our step-by-step resume builder.
                            Choose from premium templates and customize to your needs.
                        </p>
                        <button
                            onClick={() => navigate("/resume/build")}
                            className="action-button"
                        >
                            Start Building
                        </button>
                    </div>

                    <div className="action-card">
                        <h2 className="action-card-title">Build for ATS Compatibility</h2>
                        <p className="action-card-description">
                            Optimize your resume to pass through Applicant Tracking Systems effectively.
                            Focus on keywords and formatting that ATS can easily read.
                        </p>
                        <button
                            onClick={() => navigate("/ats")}
                            className="action-button"
                        >
                            Optimize for ATS
                        </button>
                    </div>
                </div>

                <div className="feature-section">
                    <h2 className="section-title">Why Use Our Resume Builder?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h3 className="feature-title">ATS-Optimized</h3>
                            <p className="feature-description">Our templates are designed to pass through Applicant Tracking Systems with ease.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-palette"></i>
                            </div>
                            <h3 className="feature-title">Beautiful Templates</h3>
                            <p className="feature-description">Choose from professionally designed templates that stand out from the crowd.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-sync-alt"></i>
                            </div>
                            <h3 className="feature-title">Sync with Portfolio</h3>
                            <p className="feature-description">Automatically pull in projects, skills, and experience from your portfolio.</p>
                        </div>
                    </div>
                </div>

                <div className="tips-section">
                    <h2 className="section-title">Resume Building Tips</h2>
                    <div className="tips-list">
                        <div className="tip-item">
                            <h3 className="tip-title">Tailor to the Job Description</h3>
                            <p className="tip-description">Customize your resume for each application by matching keywords from the job posting.</p>
                        </div>
                        <div className="tip-item">
                            <h3 className="tip-title">Quantify Achievements</h3>
                            <p className="tip-description">Use numbers and percentages to demonstrate your impact in previous roles.</p>
                        </div>
                        <div className="tip-item">
                            <h3 className="tip-title">Keep it Concise</h3>
                            <p className="tip-description">Focus on relevant experience and skills, limiting your resume to 1-2 pages.</p>
                        </div>
                        <div className="tip-item">
                            <h3 className="tip-title">Check ATS Compatibility</h3>
                            <p className="tip-description">Use our ATS Tracker to ensure your resume is optimized for applicant tracking systems.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilderHome;