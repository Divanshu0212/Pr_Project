import React, { useState, useEffect } from 'react';
import { FiSearch, FiChevronDown, FiBookOpen, FiMessageSquare, FiZap, FiHelpCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/pages/HelpCenter.css'; // Ensure this path is correct

// Sample FAQ data with categories
const faqs = [
  {
    category: 'Account',
    icon: '👤',
    question: 'How do I change my password?',
    answer: 'You can change your password from the Settings page. Navigate to Settings > Account Security and click the "Change" button next to Change Password.',
  },
  {
    category: 'Portfolio',
    icon: '💼',
    question: 'How do I add a new project to my portfolio?',
    answer: 'From your Dashboard or the Portfolio Home, click the "Add New Project" button. This will take you to a form where you can fill in all your project details, upload images, and add skills.',
  },
  {
    category: 'Resume',
    icon: '📄',
    question: 'Can I download my resume as a PDF?',
    answer: 'Yes! Once you are happy with your resume in the builder, click the "Download" or "Export" button, and you will be able to save it as a high-quality PDF file.',
  },
  {
    category: 'ATS',
    icon: '🎯',
    question: 'What does the ATS score mean?',
    answer: 'The ATS score is an estimate of how well your resume matches the job description based on keywords, formatting, and other factors that Applicant Tracking Systems look for. A higher score indicates a better match.',
  },
  {
    category: 'Account',
    icon: '🗑️',
    question: 'How can I delete my account?',
    answer: 'To permanently delete your account, go to the Settings page. In the "Account Security" section, you will find a "Delete Account" option. Please be aware that this action is irreversible.',
  },
];

const quickLinks = [
  { title: 'Getting Started', icon: FiZap, description: 'Learn the basics' },
  { title: 'Build Resume', icon: FiBookOpen, description: 'Create your resume' },
  { title: 'Portfolio Tips', icon: FiHelpCircle, description: 'Showcase your work' },
];

const HelpCenter = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openAccordion, setOpenAccordion] = useState(null);
  // Removed isVisible state as it's not directly used for animation classes in the JSX anymore,
  // relying on the general animate-on-scroll logic.

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in'); // Assuming 'slide-in' is the class for active animation
        } else {
          // Optional: remove 'slide-in' if you want elements to re-animate on scroll out/in
          // entry.target.classList.remove('slide-in');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px', // Adjust as needed
    });

    // Observe all elements with animate-on-scroll class
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`help-center-page ${theme}`}>
      <header className="help-hero">
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <FiBookOpen className="hero-icon" />
          </div>
          <h1 className="gradient-text">Help Center</h1>
          <p>Find answers to your questions quickly and easily</p>
          
          <div className="help-search-container">
            <div className="help-search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="help-content">
        {/* Quick Links */}
        <section className="quick-links-section animate-on-scroll" id="quick-links">
          <h2>Quick Links</h2>
          <div className="quick-links-grid">
            {quickLinks.map((link, index) => (
              <div 
                key={index} 
                className="quick-link-card animate-on-scroll" // Added animate-on-scroll
                style={{ animationDelay: `${index * 0.1}s` }} // Stagger animation
              >
                <link.icon className="quick-link-icon" />
                <h3>{link.title}</h3>
                <p>{link.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section animate-on-scroll" id="faq">
          <h2>Frequently Asked Questions</h2>
          <div className="accordion">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div 
                  className={`accordion-item animate-on-scroll`} // Apply animate-on-scroll here
                  key={index}
                  style={{ animationDelay: `${index * 0.1}s` }} // Stagger animation
                >
                  <button
                    className="accordion-question"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={openAccordion === index}
                  >
                    <div className="question-content">
                      <span className="faq-icon">{faq.icon}</span>
                      <span className="question-text">{faq.question}</span>
                    </div>
                    <FiChevronDown className={`chevron-icon ${openAccordion === index ? 'open' : ''}`} />
                  </button>
                  <div className={`accordion-answer ${openAccordion === index ? 'open' : ''}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results animate-on-scroll"> {/* Added animate-on-scroll */}
                <FiHelpCircle className="no-results-icon" />
                <p>No questions found matching your search.</p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Support */}
        <section className="contact-support-section animate-on-scroll" id="contact">
          <div className="support-card animate-on-scroll"> {/* Added animate-on-scroll */}
            <h2>Still need help?</h2>
            <p>Our support team is here to help you succeed</p>
            <Link to="/contact-us" className="contact-support-btn">
              <FiMessageSquare /> Contact Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
