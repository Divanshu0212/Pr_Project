import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Enhanced animation variants with staggered effects
  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const logoVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const socialVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const socialItemVariants = {
    hidden: { 
      scale: 0,
      rotate: -180
    },
    visible: { 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <motion.footer
      className="footer"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Fixed: Changed from footer-content footer-container to just footer-container */}
      <div className="footer-container">
        <motion.div className="footer-brand" variants={logoVariants}>
          <motion.h2 
            className="footer-logo"
            whileHover={{
              scale: 1.05,
              filter: "brightness(1.1) drop-shadow(0 0 15px rgba(99, 102, 241, 0.5))"
            }}
            transition={{ duration: 0.3 }}
          >
            TrackFolio
          </motion.h2>
          <motion.p 
            className="footer-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Your all-in-one platform for portfolio management, resume building, and ATS optimization.
          </motion.p>
          <motion.div 
            className="social-links"
            variants={socialVariants}
          >
            {[
              { icon: FaGithub, href: "https://github.com", label: "GitHub" },
              { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
              { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
              { icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
              { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" }
            ].map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="social-icon"
                variants={socialItemVariants}
                whileHover={{
                  scale: 1.2,
                  rotate: 5,
                  y: -5
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="footer-section" variants={itemVariants}>
          <motion.h3 
            className="footer-heading"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            Explore
          </motion.h3>
          <ul className="footer-links">
            {[
              { to: "/home", text: "Dashboard" },
              { to: "/portfolioHome", text: "Portfolio" },
              { to: "/resume-builder-home", text: "Resume" },
              { to: "/ats", text: "ATS Scanner" }
            ].map(({ to, text }, index) => (
              <motion.li 
                key={to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
              >
                <Link to={to}>{text}</Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="footer-section" variants={itemVariants}>
          <motion.h3 
            className="footer-heading"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            Company
          </motion.h3>
          <ul className="footer-links">
            {[
              { to: "/about", text: "About Us" },
              { to: "/faqs", text: "FAQs" },
              { to: "/contact-us", text: "Contact Us" }
            ].map(({ to, text }, index) => (
              <motion.li 
                key={to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05, duration: 0.4 }}
              >
                <Link to={to}>{text}</Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="footer-section" variants={itemVariants}>
          <motion.h3 
            className="footer-heading"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            Legal
          </motion.h3>
          <ul className="footer-links">
            {[
              { to: "/privacy-policy", text: "Privacy Policy" },
              { to: "/terms-and-conditions", text: "Terms & Conditions" }
            ].map(({ to, text }, index) => (
              <motion.li 
                key={to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05, duration: 0.4 }}
              >
                <Link to={to}>{text}</Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div 
        className="footer-bottom"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          © {currentYear} TrackFolio. All rights reserved.
        </motion.p>
        <motion.button 
          onClick={scrollToTop} 
          className="scroll-top-button" 
          aria-label="Back to top"
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiArrowUp className="scroll-top-icon" />
          </motion.div>
          <span>Back to Top</span>
        </motion.button>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;