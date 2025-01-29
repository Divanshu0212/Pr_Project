import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#0D1117] min-h-screen flex flex-col items-center text-[#E5E5E5] p-8">
      <h1 className="text-6xl font-bold text-[#00FFFF] mb-20">Privacy Policy</h1>
      <div className="w-full max-w-3xl bg-[#161B22] p-6 rounded-lg shadow-md">
        <p className='mb-10'>
          We value your privacy. This document explains how we collect, use, and protect your information.
        </p>
        <ul className="mt-4 space-y-12">
          <li><strong>Data Collection:</strong> We collect name, email, resume details for the purpose of resume generation.</li>
          <li><strong>Data Usage:</strong> Your data is only used for managing resumes, ATS tracking, and portfolio features.</li>
          <li><strong>Data Security:</strong> We use encryption to safeguard your information against unauthorized access.</li>
          <li><strong>Protection:</strong>We implement security measures to protect your data from unauthorized access, alteration, or disclosure</li>
        </ul>
      </div>


    </div>
  );
};

export default PrivacyPolicy;
