import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import usePortfolio from "../../hooks/usePortfolio";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { FiActivity, FiBriefcase, FiFileText, FiBarChart2, FiBookOpen, FiMessageSquare, FiZap, FiHelpCircle, FiSettings, FiBell, FiChevronDown, FiArrowRight, FiX, FiCode, FiPlusCircle, FiEye } from 'react-icons/fi';
import { HiSparkles, HiLightningBolt, HiOutlineDocumentText, HiOutlineFolderOpen, HiOutlineChartBar } from 'react-icons/hi';
import { IoRocketSharp, IoCheckmarkCircle } from 'react-icons/io5';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [greeting, setGreeting] = useState(`Welcome back, ${currentUser?.displayName || 'Developer'}!`);
  const [activeTab, setActiveTab] = useState('overview');
  const [animate, setAnimate] = useState(false);

  const { theme, isDark } = useContext(ThemeContext);
  const { portfolioData, loading, fetchAllPortfolioData } = usePortfolio();

  const [portfolioCompletion, setPortfolioCompletion] = useState(0);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const getEmptySections = () => {
    const emptySections = [];
    if (!portfolioData.portfolioDetails) emptySections.push("Portfolio Details");
    if (!portfolioData.skills || portfolioData.skills.length === 0) emptySections.push("Skills");
    if (!portfolioData.projects || portfolioData.projects.length === 0) emptySections.push("Projects");
    if (!portfolioData.certificates || portfolioData.certificates.length === 0) emptySections.push("Certificates");
    if (!portfolioData.experiences || portfolioData.experiences.length === 0) emptySections.push("Experiences");
    return emptySections;
  };

  // Intersection Observer for smooth scroll animations
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '50px 0px -100px 0px',
    });

    const animateElements = document.querySelectorAll('.scroll-animate');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchAllPortfolioData().then(data => {
      let completion = 0;
      if (data.portfolioDetails) completion += 20;
      if (data.skills && data.skills.length > 0) completion += 20;
      if (data.projects && data.projects.length > 0) completion += 20;
      if (data.certificates && data.certificates.length > 0) completion += 20;
      if (data.experiences && data.experiences.length > 0) completion += 20;
      setPortfolioCompletion(completion);
    });
  }, [fetchAllPortfolioData]);

  useEffect(() => {
    const initialGreeting = `Welcome back, ${currentUser?.displayName || 'Developer'}!`;
    setGreeting(initialGreeting);

    const timeoutId = setTimeout(() => {
      setGreeting("Ready to boost your career today?");
    }, 3000);

    setAnimate(true);

    return () => clearTimeout(timeoutId);
  }, [currentUser]);

  const tips = [
    { text: "Optimize your resume for ATS.", icon: "🚀" },
    { text: "Keep your portfolio updated.", icon: "📂" },
    { text: "Tailor your resume for each job.", icon: "✏️" },
    { text: "Use action words to describe achievements.", icon: "💪" },
  ];

  const quickLinks = [
    { text: "Build Resume", path: "/resume-builder-home", icon: <FiFileText /> },
    { text: "Manage Portfolio", path: "/portfolioHome", icon: <FiBriefcase /> },
    { text: "Check ATS Score", path: "/ats", icon: <FiBarChart2 /> },
  ];

  const recentActivities = [
    { text: "Updated Frontend Developer Resume", time: "3 hours ago", type: "resume", icon: <FiFileText /> },
    { text: "Added React Project to Portfolio", time: "Yesterday", type: "portfolio", icon: <FiBriefcase /> },
    { text: "ATS Score for 'Senior Dev' improved", time: "2 days ago", type: "ats", icon: <FiBarChart2 /> }
  ];

  const learningResources = [
    { title: "Resume Writing Masterclass", desc: "Learn how to create resumes that get interviews", action: "Watch Video", icon: <FiBookOpen /> },
    { title: "Portfolio Best Practices", desc: "Showcase your work effectively to impress employers", action: "Read Guide", icon: <FiBriefcase /> },
    { title: "ATS-Proof Your Application", desc: "Get past automated screening systems with these tips", action: "Read Article", icon: <FiFileText /> },
    { title: "Technical Interview Prep", desc: "Practice common coding questions and algorithms", action: "Start Learning", icon: <FiCode /> }
  ];

  return (
    <div className={`min-h-screen transition-opacity duration-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <header className="scroll-animate text-center mb-12 relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/20 to-blue-600/10 opacity-50"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {greeting}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Track your career progress, build your portfolio, and land your dream job.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {quickLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="primary"
                  onClick={() => navigate(link.path)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  {link.icon}
                  {link.text}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        {/* <div className="scroll-animate flex justify-center mb-8">
          <div className="inline-flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-lg">
            {['overview', 'activities', 'resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div> */}

        {/* Tab Content */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content Area */}
              <div className="xl:col-span-3 space-y-8">
                {/* Stats Cards */}
                <section className="scroll-animate">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resume Stats</h3>
                        <FiFileText className="text-2xl text-blue-600" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Active Resumes</p>
                          <p className="text-3xl font-bold text-blue-600">2</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Avg. ATS Score</p>
                          <p className="text-3xl font-bold text-green-600">80%</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => navigate('/resume-builder-home')}
                          className="w-full mt-4"
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Progress</h3>
                          <button
                            onClick={() => setShowProgressDialog(true)}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <FiHelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <FiBriefcase className="text-2xl text-purple-600" />
                      </div>
                      
                      {loading ? (
                        <div className="space-y-4">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Completion</span>
                              <span className="text-sm font-semibold text-purple-600">{portfolioCompletion}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${portfolioCompletion}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Projects Added</p>
                            <p className="text-3xl font-bold text-purple-600">{portfolioData.projects?.length || 0}</p>
                          </div>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => navigate('/portfolioHome')}
                            className="w-full"
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </Card>

                    <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ATS Performance</h3>
                        <FiBarChart2 className="text-2xl text-green-600" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Highest Score</p>
                          <p className="text-3xl font-bold text-green-600">92%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Analyses Run</p>
                          <p className="text-3xl font-bold text-green-600">5</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => navigate('/ats')}
                          className="w-full mt-4"
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </div>
                </section>

                {/* Career Tips */}
                <section className="scroll-animate">
                  <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                    Career Tips & Insights
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tips.map((tip, index) => (
                      <Card
                        key={index}
                        className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="text-3xl mb-4">{tip.icon}</div>
                        <p className="font-medium text-gray-900 dark:text-white">{tip.text}</p>
                      </Card>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-1 space-y-6">
                {/* Quick Actions */}
                <Card className="scroll-animate p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/resume-builder-home')}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <FiPlusCircle /> New Resume
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/portfolioHome')}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <FiEye /> View Portfolio
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/ats')}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <FiBarChart2 /> Analyze Resume
                    </Button>
                  </div>
                </Card>

                {/* Recent Activities */}
                <Card className="scroll-animate p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activities</h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-600">
                        <div className="text-blue-600 mt-1">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4">
                    View All Activity
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="scroll-animate">
              <Card className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Recent Activities</h2>
                <div className="space-y-6">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-600">
                      <div className="text-blue-600 text-xl mt-1">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{activity.text}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="primary" className="w-full mt-6">
                  View All Activity
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="scroll-animate">
              <Card className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Learning Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {learningResources.map((resource, index) => (
                    <Card key={index} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl text-blue-600">{resource.icon}</span>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{resource.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{resource.desc}</p>
                      <Button variant="outline" size="small" className="flex items-center gap-2">
                        {resource.action} <FiArrowRight />
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Progress Modal */}
        {showProgressDialog && (
          <Modal
            isOpen={showProgressDialog}
            onClose={() => setShowProgressDialog(false)}
            title="Portfolio Completion"
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Your portfolio is {portfolioCompletion}% complete. Each section contributes 20%:
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Portfolio Details', data: portfolioData.portfolioDetails },
                  { name: 'Skills', data: portfolioData.skills?.length },
                  { name: 'Projects', data: portfolioData.projects?.length },
                  { name: 'Certificates', data: portfolioData.certificates?.length },
                  { name: 'Experiences', data: portfolioData.experiences?.length }
                ].map((item, index) => (
                  <div key={index} className={`flex items-center gap-2 ${item.data ? 'text-green-600' : 'text-red-600'}`}>
                    {item.data ? <IoCheckmarkCircle /> : <FiX />}
                    <span>{item.name} {item.name !== 'Portfolio Details' && `(${item.data || 0} added)`}</span>
                  </div>
                ))}
              </div>
              
              {getEmptySections().length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Missing Sections</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Complete: {getEmptySections().join(', ')} to increase your completion score.
                  </p>
                </div>
              )}

              <Button
                variant="primary"
                onClick={() => {
                  setShowProgressDialog(false);
                  navigate('/portfolioHome');
                }}
                className="w-full mt-6"
              >
                Go to Portfolio
              </Button>
            </div>
          </Modal>
        )}
      </div>

      <style jsx>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .scroll-animate:nth-child(1) { transition-delay: 0.1s; }
        .scroll-animate:nth-child(2) { transition-delay: 0.2s; }
        .scroll-animate:nth-child(3) { transition-delay: 0.3s; }
        .scroll-animate:nth-child(4) { transition-delay: 0.4s; }
        .scroll-animate:nth-child(5) { transition-delay: 0.5s; }
      `}</style>
    </div>
  );
};

export default Home;