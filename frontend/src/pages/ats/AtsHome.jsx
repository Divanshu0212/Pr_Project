import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import FeatureCard from '../../components/common/FeatureCard';

const AtsHome = () => {
  const features = [
    {
      title: "Resume Analysis",
      description: "Upload your resume and get detailed ATS compatibility feedback",
      icon: "document-search",
      link: "/ats/tracker"
    },
    {
      title: "Keyword Matching",
      description: "Compare your resume keywords against job descriptions",
      icon: "key",
      link: "/ats/keywords"
    },
    {
      title: "Improvement Suggestions",
      description: "Get actionable tips to improve your resume's ATS score",
      icon: "lightbulb",
      link: "/ats/analysis"
    },
    {
      title: "Resume Comparison",
      description: "Compare different versions of your resume against the same job",
      icon: "git-compare",
      link: "/ats/compare"
    }
  ];

  return (

      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E5E5E5] mb-2">ATS Tracker</h1>
          <p className="text-gray-400">
            Optimize your resume for Applicant Tracking Systems and increase your chances of getting interviews.
          </p>
        </div>

        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl text-[#00FFFF] mb-4">Quick Analysis</h2>
            <p className="text-[#E5E5E5] mb-4">
              Upload your resume and a job description to get instant ATS compatibility feedback.
            </p>
            <Link
              to="/ats/tracker"
              className="inline-block bg-[#9C27B0] hover:bg-opacity-80 text-white py-2 px-6 rounded-md transition-all"
            >
              Start Analysis
            </Link>
          </div>
        </Card>

        <div className="mb-8">
          <h2 className="text-xl text-[#E5E5E5] mb-4">ATS Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature} // Pass the entire feature object as the 'feature' prop
              />
            ))}
          </div>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-xl text-[#00FFFF] mb-4">Recent Analyses</h2>
            <div className="bg-[#0D1117] p-4 rounded-md mb-4 text-center">
              <p className="text-gray-400">You haven`t analyzed any resumes yet.</p>
              <p className="text-[#E5E5E5] mt-2">
                Start by uploading your resume in the <Link to="/ats/tracker" className="text-[#00FFFF] hover:underline">ATS Tracker</Link>.
              </p>
            </div>
          </div>
        </Card>
      </div>

  );
};

export default AtsHome;