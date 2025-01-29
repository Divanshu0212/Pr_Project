import React from "react";
import teamData from "../pages/JS_files/teamData.js"; // Import team details (name & images)
import { Link } from "react-router-dom"; // For internal navigation
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import "../pages/Animation_Css/LandingPage.css"; // Ensure to create this file for animations

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-[#0D1117] via-[#161B22] to-[#0D1117] text-[#E5E5E5]">
      <footer className="py-16 px-6">
        
        {/* Team Members Section */}
        <div className="flex justify-center flex-wrap gap-24 mb-10">
          <h2 className="text-3xl font-semibold text-[#E5E5E5] w-full text-center">Meet the Team</h2>
          {teamData.map((member, index) => (
            <div key={index} className="team-member group relative hover:scale-105 transition-all duration-300">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-36 h-36 rounded-full border-4 border-[#00FFFF] transition-transform group-hover:scale-110 group-hover:border-[#9C27B0] duration-300"
              />
              <p className="mt-2 text-lg font-semibold text-center">{member.name}</p>
            </div>
          ))}
        </div>

        {/* Footer Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 text-center">
          
          {/* Quick Links Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-semibold text-[#E5E5E5] mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}
                  className="flex items-center gap-2 hover:text-[#00FFFF] transition duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" onClick={() => window.scrollTo(0, 0)}
                  className="flex items-center gap-2 hover:text-[#00FFFF] transition duration-200">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/contact-us" onClick={() => window.scrollTo(0, 0)}
                  className="flex items-center gap-2 hover:text-[#00FFFF] transition duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faqs" onClick={() => window.scrollTo(0, 0)}
                  className="flex items-center gap-2 hover:text-[#00FFFF] transition duration-200">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-semibold text-[#E5E5E5] mb-4">Follow Us</h3>
            <div className="flex justify-center gap-6 text-3xl">
              <a href="https://facebook.com" className="text-[#00FFFF] hover:text-[#9C27B0]"><FaFacebook /></a>
              <a href="https://twitter.com" className="text-[#00FFFF] hover:text-[#9C27B0]"><FaTwitter /></a>
              <a href="https://instagram.com" className="text-[#00FFFF] hover:text-[#9C27B0]"><FaInstagram /></a>
              <a href="https://linkedin.com" className="text-[#00FFFF] hover:text-[#9C27B0]"><FaLinkedin /></a>
            </div>
          </div>

          {/* Back to Top Section */}
          <div className="flex flex-col items-center mt-6">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-[#9C27B0] hover:text-[#00FFFF] font-semibold text-lg"
            >
              Back to Top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
