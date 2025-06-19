import React, { useState } from 'react';
import { FiSearch, FiChevronDown, FiBookOpen, FiUser, FiBriefcase, FiTarget, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../../styles/pages/HelpCenter.css';

// Sample FAQ data
const faqs = [
  {
    category: 'Account',
    question: 'How do I change my password?',
    answer: 'You can change your password from the Settings page. Navigate to Settings > Account Security and click the "Change" button next to Change Password.',
  },
  {
    category: 'Portfolio',
    question: 'How do I add a new project to my portfolio?',
    answer: 'From your Dashboard or the Portfolio Home, click the "Add New Project" button. This will take you to a form where you can fill in all your project details, upload images, and add skills.',
  },
  {
    category: 'Resume',
    question: 'Can I download my resume as a PDF?',
    answer: 'Yes! Once you are happy with your resume in the builder, click the "Download" or "Export" button, and you will be able to save it as a high-quality PDF file.',
  },
  {
    category: 'ATS',
    question: 'What does the ATS score mean?',
    answer: 'The ATS score is an estimate of how well your resume matches the job description based on keywords, formatting, and other factors that Applicant Tracking Systems look for. A higher score indicates a better match.',
  },
  {
    category: 'Account',
    question: 'How can I delete my account?',
    answer: 'To permanently delete your account, go to the Settings page. In the "Account Security" section, you will find a "Delete Account" option. Please be aware that this action is irreversible.',
  },
];

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="help-center-page">
      <header className="help-hero">
        <FiBookOpen className="hero-icon" />
        <h1>Help Center</h1>
        <p>How can we help you today?</p>
        <div className="help-search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="help-content">
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="accordion">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div className="accordion-item" key={index}>
                  <button
                    className="accordion-question"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={openAccordion === index}
                  >
                    <span>{faq.question}</span>
                    <FiChevronDown className={`chevron-icon ${openAccordion === index ? 'open' : ''}`} />
                  </button>
                  <div className={`accordion-answer ${openAccordion === index ? 'open' : ''}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No questions found matching your search.</p>
            )}
          </div>
        </section>

        <section className="contact-support-section">
          <h2>Can't find an answer?</h2>
          <p>Our support team is here to help. Get in touch with us for any questions.</p>
          <Link to="/contact-us" className="contact-support-btn">
            <FiMessageSquare /> Contact Support
          </Link>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;