import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="bg-[#0D1117] min-h-screen flex flex-col items-center text-[#E5E5E5] p-8">
      <h1 className="text-6xl font-bold text-[#00FFFF] mb-36">Terms and Conditions</h1>
      <div className="w-full max-w-3xl bg-[#161B22] p-6 rounded-lg shadow-md">
        <p className='text-xl font-bold text-[#cd53c3] mb-6'>
          By using this platform, you agree to these terms:
        </p>
        <ul className="mt-9 space-y-6">
          <li><strong>Usage:</strong> You must use the platform only for resume creation, portfolio management, and ATS tracking.</li>
          <li><strong>Security:</strong> Users are responsible for maintaining the confidentiality of their account details.</li>
          <li><strong>Ownership:</strong> All website content, code, and features belong to the developers.</li>
        </ul>
      </div>
    </div>
  );
};

export default TermsAndConditions;
