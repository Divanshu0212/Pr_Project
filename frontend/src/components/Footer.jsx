import React from "react";
import teamData from "../pages/JS_files/teamData.js"; // Import team details (name & images)
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Importing social media icons
import "../pages/Animation_Css/LandingPage.css"; // Ensure to create this file for animations

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-[#0D1117] via-[#161B22] to-[#0D1117] text-[#E5E5E5]">
      <footer className="py-16 px-6">
        
        {/* Team Members Section (One Row) */}
        <div className="flex justify-center flex-wrap gap-24 mb-10">
          <h2 className="text-3xl font-semibold text-[#E5E5E5]  w-full text-center">Meet the Team</h2>
          {teamData.map((member, index) => (
            <div key={index} className="team-member group relative hover:scale-105 transition-all duration-300">
              {/* Member Image */}
              <img 
                src={member.image} 
                alt="Member_Pic" 
                className="w-36 h-36 rounded-full border-4 border-[#00FFFF] transition-transform group-hover:scale-110 group-hover:border-[#9C27B0] duration-300"
              />
              <p className="mt-2 text-lg font-semibold text-center">{member.name}</p>
            </div>
          ))}
        </div>

        {/* Footer Sections (Below the team members row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 text-center">
          
          {/* Quick Links Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-semibold text-[#E5E5E5] mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="/privacy" className="flex items-center gap-2 hover:text-[#00FFFF] transition duration-200">
                  <FaFacebook className="text-[#00FFFF] hover:text-[#9C27B0]"/> Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="flex items-center gap-2 hover:text-[#00FFFF] transition duration-200">
                  <FaTwitter className="text-[#00FFFF] hover:text-[#9C27B0]"/> Terms
                </a>
              </li>
              <li>
                <a href="/contact" className="flex items-center gap-2 hover:text-[#00FFFF] transition duration-200">
                  <FaFacebook className="text-[#00FFFF] hover:text-[#9C27B0]"/> Contact Us
                </a>
              </li>
              <li>
                <a href="/faq" className="flex items-center gap-2 hover:text-[#00FFFF] transition duration-200">
                  <FaTwitter className="text-[#00FFFF] hover:text-[#9C27B0]"/> FAQ
                </a>
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
          <div className="flex flex-col items-center mt-6 scroll-smooth">
            <a href="#top" className="text-[#9C27B0] hover:text-[#00FFFF] font-semibold text-lg">
              Back to Top
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
