import React, { useState } from "react";

const ResumeBuilder = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="bg-[#0D1117] text-[#E5E5E5] min-h-screen p-6">
      <h1 className="text-3xl text-center">Build Your Resume</h1>

      {/* Multi-Step Form */}
      {step === 1 && (
        <div className="p-6 bg-[#161B22] rounded-lg mt-8">
          <h2 className="text-2xl">Step 1: Personal Information</h2>
          <input type="text" placeholder="Full Name" className="w-full p-2 mt-2 bg-[#0D1117] border border-[#9C27B0] rounded" />
          <button onClick={() => setStep(2)} className="mt-4 bg-[#00FFFF] text-[#0D1117] px-4 py-2 rounded">
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="p-6 bg-[#161B22] rounded-lg mt-8">
          <h2 className="text-2xl">Step 2: Work Experience</h2>
          <input type="text" placeholder="Job Title" className="w-full p-2 mt-2 bg-[#0D1117] border border-[#9C27B0] rounded" />
          <button onClick={() => setStep(3)} className="mt-4 bg-[#00FFFF] text-[#0D1117] px-4 py-2 rounded">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
