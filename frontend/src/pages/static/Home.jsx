import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import usePortfolio from "../../hooks/usePortfolio";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
// === IMPORTS TO ADD ===
import { useTheme } from "../../context/ThemeContext";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { theme: currentTheme } = useContext(ThemeContext); // Renamed to avoid conflict with useTheme hook
  const [greeting, setGreeting] = useState(`Welcome back, ${currentUser?.displayName || 'Developer'}!`);  const [activeTab, setActiveTab] = useState('overview');
  const [animate, setAnimate] = useState(false);

  // === COMPONENT INITIALIZATION EDITS ===
  const { theme, isDark } = useTheme(); // Added useTheme hook

  const { portfolioData, loading, fetchAllPortfolioData } = usePortfolio();

  // Calculate portfolio completion percentage
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

  // Add scroll animation effect
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
      rootMargin: '50px 0px -50px 0px',
    });

    // Observe all elements with animate-on-scroll classes
    const animateElements = document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .animate-on-scroll-scale');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    fetchAllPortfolioData().then(data => {
      let completion = 0;
      console.log("Portfolio Data:", data);

      // Check each section and add 20% if it exists and has content
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

    setAnimate(true); // Triggers the main container fade-in

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
    // === MAIN CONTAINER EDIT ===
    <div className={`min-h-screen transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'} animate-on-scroll`}>
      {/* === WELCOME BANNER EDIT === */}
      <header className="text-center mt-8 mb-10 relative overflow-hidden rounded-xl p-8 panel animate-on-scroll">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(var(--color-accent-primary),0.1)] via-[rgba(var(--color-highlight),0.2)] to-[rgba(var(--color-accent-primary),0.1)] opacity-50 animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient text-shimmer">
            {greeting}
          </h1>
          <p className="text-xl text-secondary mb-6 animate-on-scroll-scale">
            Track your career progress, build your portfolio, and land your dream job.
          </p>
          <div className="flex justify-center gap-4 flex-wrap stagger-children">
            {quickLinks.map((link, index) => (
              <Button
                key={index}
                variant="primary"
                onClick={() => navigate(link.path)}
                icon={<span className="text-xl">{link.icon}</span>}
                enableShine={true}
                className="animate-on-scroll-scale"
              >
                {link.text}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* === TAB NAVIGATION EDIT === */}
      <div className="flex justify-center mb-6 animate-on-scroll">
        <div className="inline-flex panel p-1 glass">
          {['overview', 'activities', 'resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[rgba(var(--color-accent-primary),0.2)] to-[rgba(var(--color-highlight),0.2)] text-gradient'
                  : 'text-secondary hover:text-primary hover-lift'
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
            {/* === STATS CARDS SECTION EDIT === */}
            <section className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              <Card className="animate-on-scroll-left hover-glow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gradient">Resume Stats</h3>
                  <span className="text-2xl float">📊</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-secondary">Active Resumes</p>
                    <p className="text-3xl font-bold mt-1 mb-3 text-primary">2</p>
                    <p className="text-sm text-secondary">Avg. ATS Score</p>
                    <p className="text-3xl font-1 text-primary">80%</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => navigate('/resume-builder-home')}
                  >
                    View Details
                  </Button>
                </div>
              </Card>

              <Card className="animate-on-scroll-scale hover-glow">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold text-gradient">Portfolio Progress</h3>
                    
                  </div>
                  <span className="text-2xl float">📁</span>
                </div>

                {/* Progress Dialog Enhancement */}
                {showProgressDialog && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="panel max-w-md w-full glass animate-on-scroll-scale">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gradient">Portfolio Completion</h3>
                        <button
                          onClick={() => setShowProgressDialog(false)}
                          className="text-secondary hover:text-primary hover-magnetic"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="mb-4">
                        <p className="text-primary mb-2">Your portfolio is {portfolioCompletion}% complete. Each section contributes 20%:</p>
                        <ul className="space-y-2">
                          {[
                            { key: 'portfolioDetails', label: 'Portfolio Details', data: portfolioData.portfolioDetails },
                            { key: 'skills', label: 'Skills', data: portfolioData.skills?.length },
                            { key: 'projects', label: 'Projects', data: portfolioData.projects?.length },
                            { key: 'certificates', label: 'Certificates', data: portfolioData.certificates?.length },
                            { key: 'experiences', label: 'Experiences', data: portfolioData.experiences?.length }
                          ].map((item, index) => (
                            <li key={index} className={`flex items-center ${item.data ? 'text-primary' : 'text-secondary'}`}>
                              {item.data ? '✓' : '✗'} {item.label} {item.key !== 'portfolioDetails' && `(${item.data || 0} added)`}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="panel p-3">
                        <h4 className="text-sm font-medium text-gradient mb-1">Missing Sections</h4>
                        {getEmptySections().length > 0 ? (
                          <p className="text-sm text-primary">
                            Complete: {getEmptySections().join(', ')} to increase your completion score.
                          </p>
                        ) : (
                          <p className="text-sm text-gradient">All sections completed! Great job!</p>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => {
                          setShowProgressDialog(false);
                          navigate('/portfolioHome');
                        }}
                        className="mt-4"
                      >
                        Go to Portfolio
                      </Button>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="space-y-4">
                    <div className="skeleton h-2.5 rounded-full"></div>
                    <div className="skeleton h-8 rounded w-1/2"></div>
                    <div className="skeleton h-8 rounded w-1/2"></div>
                  </div>
                ) : (
                  <div>
                    <div className="w-full mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-secondary">Completion</span>
                        <span className="text-sm font-medium text-gradient">{portfolioCompletion}%</span>
                      </div>
                      <div className="w-full bg-[rgb(var(--color-accent-neutral))] rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))] h-3 rounded-full transition-all duration-500"
                          style={{ width: `${portfolioCompletion}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-secondary">Projects Added</p>
                        <p className="text-3xl font-bold mt-1 text-primary">{portfolioData.projects?.length || 0}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate('/portfolioHome')}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="animate-on-scroll-right hover-glow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gradient">ATS Performance</h3>
                  <span className="text-2xl float">🎯</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-secondary">Highest Score</p>
                    <p className="text-3xl font-bold mt-1 mb-3 text-primary">92%</p>
                    <p className="text-sm text-secondary">Analyzes Run</p>
                    <p className="text-3xl font-bold mt-1 text-primary">5</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => navigate('/ats')}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            </section>

            {/* === TIPS CAROUSEL EDIT === */}
            <section className="mt-10 animate-on-scroll">
              <h2 className="text-2xl font-semibold mb-4 text-center text-gradient text-shimmer">
                Career Tips & Insights
              </h2>
              <div className="mt-4 flex overflow-x-auto gap-12 p-2 pb-4 no-scrollbar">
                {tips.map((tip, index) => (
                  <Card
                    key={index}
                    className="flex-shrink-0 w-64 hover-lift card-hover animate-on-scroll-scale"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-3xl mb-3 float">{tip.icon}</div>
                    <p className="font-medium text-primary">{tip.text}</p>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        {/* === ACTIVITIES TAB EDIT === */}
        {activeTab === 'activities' && (
          <Card className="animate-on-scroll">
            <h2 className="text-xl font-semibold mb-4 text-gradient">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start p-3 border-l-2 border-[rgb(var(--color-accent-primary))] panel hover-lift">
                  <div className="mr-4 mt-1">
                    {activity.type === 'resume' && <span className="text-xl float">📝</span>}
                    {activity.type === 'portfolio' && <span className="text-xl float">💼</span>}
                    {activity.type === 'ats' && <span className="text-xl float">📊</span>}
                  </div>
                  <div>
                    <p className="font-medium text-primary">{activity.text}</p>
                    <p className="text-sm text-secondary">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              fullWidth
              className="mt-4"
            >
              View All Activity
            </Button>
          </Card>
        )}

        {/* === RESOURCES TAB EDIT === */}
        {activeTab === 'resources' && (
          <Card className="animate-on-scroll">
            <h2 className="text-xl font-semibold mb-4 text-gradient">Learning Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
              {[
                { title: "Resume Writing Masterclass", desc: "Learn how to create resumes that get interviews", action: "Watch Video", color: "accent-primary" },
                { title: "Portfolio Best Practices", desc: "Showcase your work effectively to impress employers", action: "Read Guide", color: "highlight" },
                { title: "ATS-Proof Your Application", desc: "Get past automated screening systems with these tips", action: "Read Article", color: "accent-primary" },
                { title: "Technical Interview Prep", desc: "Practice common coding questions and algorithms", action: "Start Learning", color: "highlight" }
              ].map((resource, index) => (
                <Card key={index} className="hover-lift animate-on-scroll-scale">
                  <h3 className="font-medium text-gradient">{resource.title}</h3>
                  <p className="text-sm text-secondary mt-1">{resource.desc}</p>
                  <Button
                    variant="ghost"
                    size="small"
                    className="mt-3"
                  >
                    {resource.action} →
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Progress Modal (kept outside the conditional tab content for direct access via button) */}
      {showProgressDialog && (
        <Modal
          isOpen={showProgressDialog}
          onClose={() => setShowProgressDialog(false)}
          title="Portfolio Completion"
        >
          <div className="mb-4">
            <p className="text-[rgb(var(--color-text-primary))] mb-2">
              Your portfolio is {portfolioCompletion}% complete. Each section contributes 20%:
            </p>
            <ul className="space-y-2">
              {[
                { name: 'Portfolio Details', data: portfolioData.portfolioDetails },
                { name: 'Skills', data: portfolioData.skills?.length },
                { name: 'Projects', data: portfolioData.projects?.length },
                { name: 'Certificates', data: portfolioData.certificates?.length },
                { name: 'Experiences', data: portfolioData.experiences?.length }
              ].map((item, index) => (
                <li key={index} className={`flex items-center ${item.data ? 'text-[rgb(var(--color-accent-primary))]' : 'text-[rgb(var(--color-text-secondary))]'}`}>
                  {item.data ? '✓' : '✗'} {item.name} {item.name !== 'Portfolio Details' && `(${item.data || 0} added)`}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[rgb(var(--color-background-primary))] p-3 rounded-lg mb-4">
            <h4 className="text-sm font-medium text-[rgb(var(--color-highlight))] mb-1">Missing Sections</h4>
            {getEmptySections().length > 0 ? (
              <p className="text-sm text-[rgb(var(--color-text-primary))]">
                Complete: {getEmptySections().join(', ')} to increase your completion score.
              </p>
            ) : (
              <p className="text-sm text-[rgb(var(--color-accent-primary))]">All sections completed! Great job!</p>
            )}
          </div>

          <Button
            variant="primary"
            onClick={() => {
              setShowProgressDialog(false);
              navigate('/portfolioHome');
            }}
            className="w-full"
          >
            Go to Portfolio
          </Button>
        </Modal>
      )}


    </div>
  );
};

export default Home;
