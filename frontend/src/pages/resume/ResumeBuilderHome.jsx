import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResumeBuilderHome = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#0D1117] text-[#E5E5E5] min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 text-[#00FFFF]">Resume Builder</h1>
                    <p className="text-xl max-w-3xl mx-auto text-gray-300">
                        Create professional resumes tailored to your career goals. Pull in your portfolio data
                        or start fresh with our intuitive builder.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-[#161B22] p-8 rounded-lg border border-gray-700 hover:border-[#9C27B0] transition-all shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-[#00FFFF]">Create General Resume</h2>
                        <p className="mb-6 text-gray-300">
                            Start from scratch with our step-by-step resume builder.
                            Choose from premium templates and customize to your needs.
                        </p>
                        <button
                            onClick={() => navigate("/resume/build")}
                            className="inline-block py-3 px-6 bg-[#9C27B0] text-white font-medium rounded-md hover:bg-opacity-80 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9C27B0] focus:ring-offset-1"
                        >
                            Start Building
                        </button>
                    </div>

                    <div className="bg-[#161B22] p-8 rounded-lg border border-gray-700 hover:border-[#9C27B0] transition-all shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-[#00FFFF]">Build for ATS Compatibility</h2>
                        <p className="mb-6 text-gray-300">
                            Optimize your resume to pass through Applicant Tracking Systems effectively.
                            Focus on keywords and formatting that ATS can easily read.
                        </p>
                        <button
                            onClick={() => navigate("/ats")}
                            className="inline-block py-3 px-6 bg-[#9C27B0] text-white font-medium rounded-md hover:bg-opacity-80 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9C27B0] focus:ring-offset-1"
                        >
                            Optimize for ATS
                        </button>
                    </div>
                </div>

                <div className="bg-[#161B22] p-8 rounded-lg border border-gray-700 mb-12 shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-[#00FFFF]">Why Use Our Resume Builder?</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="feature-card">
                            <div className="text-[#00FFFF] text-4xl mb-3">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[#E5E5E5]">ATS-Optimized</h3>
                            <p className="text-gray-300">Our templates are designed to pass through Applicant Tracking Systems with ease.</p>
                        </div>

                        <div className="feature-card">
                            <div className="text-[#00FFFF] text-4xl mb-3">
                                <i className="fas fa-palette"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[#E5E5E5]">Beautiful Templates</h3>
                            <p className="text-gray-300">Choose from professionally designed templates that stand out from the crowd.</p>
                        </div>

                        <div className="feature-card">
                            <div className="text-[#00FFFF] text-4xl mb-3">
                                <i className="fas fa-sync-alt"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[#E5E5E5]">Sync with Portfolio</h3>
                            <p className="text-gray-300">Automatically pull in projects, skills, and experience from your portfolio.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#161B22] p-8 rounded-lg border border-gray-700 shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-[#00FFFF]">Resume Building Tips</h2>

                    <div className="space-y-4">
                        <div className="tip-item">
                            <h3 className="text-xl font-semibold mb-1 text-[#00FFFF]">Tailor to the Job Description</h3>
                            <p className="text-gray-300">Customize your resume for each application by matching keywords from the job posting.</p>
                        </div>

                        <div className="tip-item">
                            <h3 className="text-xl font-semibold mb-1 text-[#00FFFF]">Quantify Achievements</h3>
                            <p className="text-gray-300">Use numbers and percentages to demonstrate your impact in previous roles.</p>
                        </div>

                        <div className="tip-item">
                            <h3 className="text-xl font-semibold mb-1 text-[#00FFFF]">Keep it Concise</h3>
                            <p className="text-gray-300">Focus on relevant experience and skills, limiting your resume to 1-2 pages.</p>
                        </div>

                        <div className="tip-item">
                            <h3 className="text-xl font-semibold mb-1 text-[#00FFFF]">Check ATS Compatibility</h3>
                            <p className="text-gray-300">Use our ATS Tracker to ensure your resume is optimized for applicant tracking systems.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilderHome;