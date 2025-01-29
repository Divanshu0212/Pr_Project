import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaBriefcase, FaSearch } from "react-icons/fa";

import "./Animation_Css/LandingPage.css"; // Ensure to create this file for animations

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0D1117] text-[#E5E5E5] min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-4 bg-gradient-to-r from-transparent via-[#31aad5] to-transparent">
        <h1 className="text-5xl font-bold z-10">
          Your Resume, Perfected. Your Portfolio, Showcased.
        </h1>
        <p className="text-lg mt-4 z-10">
          Create ATS-friendly resumes, track job readiness, and showcase your hard work—all in one place.
        </p>
        
        <div className="mt-6 flex gap-6 z-10">
          <button 
            onClick={() => navigate("/signup")} 
            className="border border-[#00FFFF] px-6 py-3 rounded-lg hover:bg-[#161B22]">
            Get Started
          </button>
          <button 
            onClick={() => window.scrollTo({ top: document.getElementById('about').offsetTop, behavior: 'smooth' })} 
            className="border border-[#00FFFF] px-6 py-3 rounded-lg hover:bg-[#161B22]">
            Learn More
          </button>
        </div>

        {/* Hidden Hover Feature */}
        <div className="absolute bottom-10 text-2xl opacity-50 hover:opacity-100 transition">
          75% of resumes are rejected by ATS—<span className="text-[#00FFFF]">learn how to avoid this.</span>
        </div>
      </section>

      {/* About the Platform */}
      <section id="about" className="py-16 text-center">
  <h2 className="text-5xl text-[#E5E5E5] font-semibold mb-20">Why Choose Us?</h2>
  
  <div className="flex justify-center mt-25 gap-8">
    {[
      { name: "Resume Generator", icon: <FaUserTie className="text-[#00FFFF] text-5xl mb-4" /> },
      { name: "Portfolio Manager", icon: <FaBriefcase className="text-[#00FFFF] text-5xl mb-4" /> },
      { name: "ATS Tracker", icon: <FaSearch className="text-[#00FFFF] text-5xl mb-4" /> }
    ].map((feature, index) => (
      <div 
        key={index} 
        className="w-1/4 p-6 bg-[#161B22] rounded-lg shadow-md transform transition hover:scale-105 hover:shadow-[0_4px_20px_rgba(0,255,255,0.5)] duration-300"
      >
        <div className="flex flex-col items-center">
          {feature.icon}
          <h3 className="text-xl text-[#E5E5E5] font-semibold">{feature.name}</h3>
        </div>
      </div>
    ))}
  </div>
</section>



      {/* Feature Highlights */}
      <section className="py-16 px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 bg-gradient-to-r from-[#0D1117] to-[#161B22] rounded-lg shadow-xl">
  {/* Left Column - Text with List */}
  <div className="w-full lg:w-1/2">
    <h2 className="text-4xl font-semibold text-[#E5E5E5] mb-6 text-center lg:text-left tracking-wide">
      What Makes Us Different?
    </h2>
    <ul className="space-y-4 text-lg text-[#E5E5E5]">
      <li className="flex items-center gap-4 hover:bg-[#161B22] transition-colors duration-300 px-4 py-2 rounded-md">
        <span className="text-[#00FFFF] text-xl">✔️</span> Real-time ATS resume scoring
      </li>
      <li className="flex items-center gap-4 hover:bg-[#161B22] transition-colors duration-300 px-4 py-2 rounded-md">
        <span className="text-[#00FFFF] text-xl">✔️</span> AI-powered suggestions for optimal resume adjustments
      </li>
      <li className="flex items-center gap-4 hover:bg-[#161B22] transition-colors duration-300 px-4 py-2 rounded-md">
        <span className="text-[#00FFFF] text-xl">✔️</span> Smart Portfolio customization with personalized features
      </li>
      <li className="flex items-center gap-4 hover:bg-[#161B22] transition-colors duration-300 px-4 py-2 rounded-md">
        <span className="text-[#9C27B0] text-xl">✔️</span> Dynamic Skill Mapping for real-time professional development
      </li>
      <li className="flex items-center gap-4 hover:bg-[#161B22] transition-colors duration-300 px-4 py-2 rounded-md">
        <span className="text-[#9C27B0] text-xl">✔️</span> Data-driven insights to track resume performance and improvement
      </li>
    </ul>
  </div>

  {/* Right Column - Text Section */}

<div className="w-full lg:w-1/2 flex flex-col justify-center items-center text-center lg:text-left">
  <p className="text-lg text-[#d88be6ef]  leading-relaxed mb-6">
    Unlock the power of real-time ATS scoring and AI-driven resume optimization. Stay ahead of the competition by tailoring your portfolio and skillset with cutting-edge tools that help you get noticed.
  </p>
  <p className="text-xl text-[#d88be6ef] font-semibold mb-6">
    Enhance your job applications with insights that drive growth, refine your resume’s impact, and ensure it shines through every ATS filter.
  </p>
  <p className="text-2xl  text-[#d88be6ef]  font-medium leading-relaxed">
    Build a standout profile, showcase your best skills, and move one step closer to your dream job with our innovative, AI-powered platform.
  </p>
</div>

</section>



    </div>
  );
};

export default LandingPage;
