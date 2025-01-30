import React from "react";
import { useNavigate } from "react-router-dom";

const ResumeBuilderHome = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0D1117] text-[#E5E5E5] min-h-screen flex flex-col items-center p-12">
      <h1 className="text-4xl font-bold">Resume Builder</h1>
      <p className="mt-4">Choose how you want to build your resume.</p>

      <div className="mt-8 flex gap-6">
        <button
          onClick={() => navigate("/resume-builder")}
          className="bg-[#00FFFF] text-[#0D1117] px-8 py-4 rounded-lg hover:scale-105 transition"
        >
          Create General Resume
        </button>
        <button
          onClick={() => navigate("/ats")}
          className="border border-[#00FFFF] px-8 py-4 rounded-lg hover:bg-[#161B22] transition"
        >
          Build for ATS Compatibility
        </button>
      </div>
    </div>
  );
};

export default ResumeBuilderHome;
