import React from 'react';

const FAQs = () => {
  return (
    <div className="bg-[#0D1117] min-h-screen flex flex-col items-center text-[#E5E5E5] p-8">
      <h1 className="text-4xl font-bold text-[#00FFFF] mb-6">Frequently Asked Questions</h1>
      <div className="w-full max-w-3xl space-y-6">
        {[
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
        ].map((faq, index) => (
          <div key={index} className="p-4 bg-[#161B22] rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-[#9C27B0]">{faq.question}</h3>
            <p className="mt-2">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
