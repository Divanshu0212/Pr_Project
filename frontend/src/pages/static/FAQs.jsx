import React from 'react';
import '../../styles/pages/FAQs.css'; // Added new stylesheet import

const FAQs = () => {
  const faqsList = [
    {
      question: "What is a Resume Generator?",
      answer: "It helps users create professional resumes by entering details, choosing templates, and downloading their resume.",
    },
    {
      question: "How do I check ATS compatibility?",
      answer: "Our ATS tracker scans your resume and gives feedback on formatting, keywords, and optimization for job applications.",
    },
    {
      question: "What does the Portfolio Manager do?",
      answer: "It allows you to store and showcase your projects, skills, and achievements in a structured way.",
    },
  ];

  return (
    // Replaced all hard-coded color classes with semantic class names
    <div className="faq-page">
      <h1 className="faq-title">Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqsList.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.question}</h3>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;