import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [greeting, setGreeting] = useState(`Welcome back, ${currentUser?.displayName || 'Developer'}!`);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [animate, setAnimate] = useState(false);

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

  const notifications = [
    { text: "Your resume was viewed 5 times this week!", time: "2 hours ago", type: "resume" },
    { text: "New portfolio templates added!", time: "Yesterday", type: "portfolio" },
    { text: "Your ATS score improved by 15%", time: "3 days ago", type: "ats" }
  ];

  const quickLinks = [
    { text: "Build Resume", path: "/resume-builder-home", icon: "📝" },
    { text: "Manage Portfolio", path: "/portfolioHome", icon: "💼" },
    { text: "Check ATS Score", path: "/ats", icon: "📊" },
  ];

  const recentActivities = [
    { text: "Updated Frontend Developer Resume", time: "3 hours ago", type: "resume" },
    { text: "Added React Project to Portfolio", time: "Yesterday", type: "portfolio" },
    { text: "ATS Score for 'Senior Dev' improved", time: "2 days ago", type: "ats" }
  ];

  return (
    <div className={`transition-opacity duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
      {/* Welcome Banner with gradient animation */}
      <header className="text-center mt-8 mb-10 relative overflow-hidden rounded-xl p-8 bg-gradient-to-r from-[#161B22] to-[#0D1117]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00FFFF20] via-[#9C27B020] to-[#00FFFF20] opacity-20 animate-pulse"></div>
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9C27B0]">
          {greeting}
        </h1>
        <p className="text-xl text-gray-300 mb-6">Track your career progress, build your portfolio, and land your dream job.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              className="group flex items-center border border-[#00FFFF] px-6 py-3 rounded-lg hover:bg-gradient-to-r hover:from-[#00FFFF20] hover:to-[#9C27B020] transition-all text-[#00FFFF]"
              onClick={() => navigate(link.path)}
            >
              <span className="mr-2 text-xl">{link.icon}</span>
              <span>{link.text}</span>
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          ))}
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-[#161B22] rounded-lg p-1">
          {['overview', 'activities', 'resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-[#00FFFF20] to-[#9C27B020] text-[#00FFFF]' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <section className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="stat-card bg-[#161B22] rounded-xl p-6 border-l-4 border-[#00FFFF] hover:shadow-lg hover:shadow-[#00FFFF30] transition-all transform hover:-translate-y-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-[#00FFFF]">Resume Stats</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-400">Active Resumes</p>
                    <p className="text-3xl font-bold mt-1 mb-3">2</p>
                    <p className="text-sm text-gray-400">Avg. ATS Score</p>
                    <p className="text-3xl font-bold mt-1">80%</p>
                  </div>
                  <button 
                    className="px-3 py-1 bg-[#0D1117] text-[#00FFFF] text-sm rounded-md hover:bg-[#00FFFF20]"
                    onClick={() => navigate('/resume-builder-home')}
                  >
                    View Details
                  </button>
                </div>
              </div>

              <div className="stat-card bg-[#161B22] rounded-xl p-6 border-l-4 border-[#9C27B0] hover:shadow-lg hover:shadow-[#9C27B030] transition-all transform hover:-translate-y-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-[#9C27B0]">Portfolio Progress</h3>
                  <span className="text-2xl">📁</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-400">Completion</p>
                    <p className="text-3xl font-bold mt-1 mb-3">60%</p>
                    <p className="text-sm text-gray-400">Projects Added</p>
                    <p className="text-3xl font-bold mt-1">4</p>
                  </div>
                  <button 
                    className="px-3 py-1 bg-[#0D1117] text-[#9C27B0] text-sm rounded-md hover:bg-[#9C27B020]"
                    onClick={() => navigate('/portfolioHome')}
                  >
                    View Details
                  </button>
                </div>
              </div>

              <div className="stat-card bg-[#161B22] rounded-xl p-6 border-l-4 border-[#00FFFF] hover:shadow-lg hover:shadow-[#00FFFF30] transition-all transform hover:-translate-y-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-[#00FFFF]">ATS Performance</h3>
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-400">Highest Score</p>
                    <p className="text-3xl font-bold mt-1 mb-3">92%</p>
                    <p className="text-sm text-gray-400">Analyzes Run</p>
                    <p className="text-3xl font-bold mt-1">5</p>
                  </div>
                  <button 
                    className="px-3 py-1 bg-[#0D1117] text-[#00FFFF] text-sm rounded-md hover:bg-[#00FFFF20]"
                    onClick={() => navigate('/ats')}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </section>

            {/* Tips Carousel */}
            <section className="mt-10">
              <h2 className="text-2xl font-semibold mb-4 text-center text-[#00FFFF]">Career Tips & Insights</h2>
              <div className="mt-4 flex overflow-x-auto gap-4 p-2 pb-4 no-scrollbar">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-64 p-6 bg-gradient-to-br from-[#9C27B0] to-[#0D1117] text-white rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="text-3xl mb-3">{tip.icon}</div>
                    <p className="font-medium">{tip.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="bg-[#161B22] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start p-3 border-l-2 border-[#9C27B0] bg-[#0D1117] rounded-lg">
                  <div className="mr-4 mt-1">
                    {activity.type === 'resume' && <span className="text-xl">📝</span>}
                    {activity.type === 'portfolio' && <span className="text-xl">💼</span>}
                    {activity.type === 'ats' && <span className="text-xl">📊</span>}
                  </div>
                  <div>
                    <p className="font-medium text-[#E5E5E5]">{activity.text}</p>
                    <p className="text-sm text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="mt-4 w-full p-2 text-center bg-[#0D1117] hover:bg-[#161B22] border border-[#9C27B0] text-[#E5E5E5] rounded-lg transition-colors"
            >
              View All Activity
            </button>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="bg-[#161B22] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">Learning Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="resource-card p-4 bg-[#0D1117] rounded-lg border-l-2 border-[#00FFFF] hover:bg-[#161B22] transition-colors">
                <h3 className="font-medium text-[#00FFFF]">Resume Writing Masterclass</h3>
                <p className="text-sm text-gray-400 mt-1">Learn how to create resumes that get interviews</p>
                <button className="mt-3 text-sm text-[#00FFFF] hover:underline">Watch Video →</button>
              </div>
              
              <div className="resource-card p-4 bg-[#0D1117] rounded-lg border-l-2 border-[#9C27B0] hover:bg-[#161B22] transition-colors">
                <h3 className="font-medium text-[#9C27B0]">Portfolio Best Practices</h3>
                <p className="text-sm text-gray-400 mt-1">Showcase your work effectively to impress employers</p>
                <button className="mt-3 text-sm text-[#9C27B0] hover:underline">Read Guide →</button>
              </div>
              
              <div className="resource-card p-4 bg-[#0D1117] rounded-lg border-l-2 border-[#00FFFF] hover:bg-[#161B22] transition-colors">
                <h3 className="font-medium text-[#00FFFF]">ATS-Proof Your Application</h3>
                <p className="text-sm text-gray-400 mt-1">Get past automated screening systems with these tips</p>
                <button className="mt-3 text-sm text-[#00FFFF] hover:underline">Read Article →</button>
              </div>
              
              <div className="resource-card p-4 bg-[#0D1117] rounded-lg border-l-2 border-[#9C27B0] hover:bg-[#161B22] transition-colors">
                <h3 className="font-medium text-[#9C27B0]">Technical Interview Prep</h3>
                <p className="text-sm text-gray-400 mt-1">Practice common coding questions and algorithms</p>
                <button className="mt-3 text-sm text-[#9C27B0] hover:underline">Start Learning →</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Center */}
      <div className="fixed top-16 right-6 z-10">
        <button
          className="relative text-2xl bg-[#161B22] p-2 rounded-full shadow-lg hover:bg-[#0D1117] transition-colors"
          title="Notifications"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          🔔
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-[#9C27B0] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#161B22]">
              {notifications.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute mt-2 right-0 bg-[#161B22] rounded-lg shadow-xl w-80 z-50 border border-[#9C27B0] overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
              <h3 className="font-semibold text-[#00FFFF]">Notifications</h3>
              <button 
                className="text-xs text-gray-400 hover:text-[#00FFFF]"
                onClick={() => setShowNotifications(false)}
              >
                Mark all as read
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((note, index) => (
                <div 
                  key={index} 
                  className="p-3 border-b border-gray-700 hover:bg-[#0D1117] transition-colors flex items-start"
                >
                  <div className="mr-3 mt-1">
                    {note.type === 'resume' && <span className="text-xl">📝</span>}
                    {note.type === 'portfolio' && <span className="text-xl">💼</span>}
                    {note.type === 'ats' && <span className="text-xl">📊</span>}
                  </div>
                  <div>
                    <p className="text-sm">{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{note.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-2 text-center border-t border-gray-700">
              <button className="text-sm text-[#00FFFF] hover:underline">
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;