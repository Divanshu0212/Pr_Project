import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Welcome back, [User's Name]!");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setGreeting("Ready to boost your career today?");
    }, 3000);
  }, []);

  const tips = [
    "Optimize your resume for ATS.",
    "Keep your portfolio updated.",
    "Tailor your resume for each job.",
    "Use action words to describe achievements.",
    
  ];

  const notifications = [
    "Your resume was viewed 5 times this week!",
    "New portfolio templates added!",
  ];

  return (
    <div className="bg-[#0D1117] text-[#E5E5E5] min-h-screen flex">
      {/* Left Sidebar Navigation */}
      <aside className="w-20 md:w-64 bg-[#161B22] p-4 border-r-2 border-[#9C27B0] transition-all duration-300 group">
        <nav className="space-y-6">
          {[
            { name: "Resumes", icon: "📄", link: "/resumes" },
            { name: "Portfolios", icon: "🎨", link: "/portfolios" },
            { name: "ATS Tracker", icon: "📊", link: "/ats-tracker" },
            { name: "Settings", icon: "⚙️", link: "/settings" },
          ].map((item, index) => (
            <button
              key={index}
              className="flex items-center space-x-3 text-lg hover:text-[#00FFFF] transition w-full"
              onClick={() => navigate(item.link)}
            >
              <span>{item.icon}</span>
              <span className="hidden md:inline">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-4">
        {/* TrackFolio Branding */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#0088FF] animate-fadeIn">
            TrackFolio
          </h1>
          <p className="text-lg text-gray-400 mt-2 animate-fadeInSlow">
            Your Career, Your Control.
          </p>
        </div>

        {/* Smooth Horizontal Divider */}
        <div className="w-full mt-4">
          <div className="h-1 bg-gradient-to-r from-transparent via-[#9C27B0] to-transparent"></div>
        </div>

        {/* Welcome Banner */}
        <header className="text-center mt-20 ">
  <h1 className="text-4xl font-bold transition-all">{greeting}</h1>
  <div className="mt-4 flex justify-center gap-4">
    <button
      className="border border-[#00FFFF] px-8 py-3 text-xl rounded-lg hover:bg-[#161B22] transition-all    text-[#00FFFF]"
      onClick={() => navigate("/build-resume")}
    >
      Build Resume
    </button>
    <button
      className="border border-[#00FFFF] px-8 py-3 text-xl rounded-lg hover:bg-[#161B22] transition-all  text-[#00FFFF]"
      onClick={() => navigate("/create-portfolio")}
    >
      Create Portfolio
    </button>
    <button
      className="border border-[#00FFFF] px-8 py-3 text-xl rounded-lg hover:bg-[#161B22] transition-all  text-[#00FFFF]"
      onClick={() => navigate("/ats-tracker")}
    >
      Track ATS Scores
    </button>
  </div>
</header>


        {/* Overview Section */}
        <section className="mt-28 grid grid-cols-1 md:grid-cols-2 gap-16">
  {[
    { title: "Resume Stats", desc: "You have 2 active resumes. Avg. ATS Score: 80%." },
    { title: "Portfolio Progress", desc: "Your portfolio is 60% complete. Click to finish." },
  ].map((item, index) => (
    <div
      key={index}
      className="p-6 bg-[#1F2937] rounded-lg transition hover:scale-105 min-w-[350px] md:min-w-[450px]"
    >
      <h2 className="text-2xl text-[#00FFFF]">{item.title}</h2>
      <p className="mt-2 text-[#E5E5E5]">{item.desc}</p>
    </div>
  ))}
</section>


        {/* Tips & Insights (Carousel) */}
        <section className="mt-10">
  <h2 className="text-2xl text-center text-[#00FFFF]">Career Tips & Insights</h2>
  <div className="mt-4 flex overflow-x-auto gap-4 p-2 scrollbar-hide">
    {tips.map((tip, index) => (
      <div
        key={index}
        className="p-6 bg-gradient-to-r from-[#9C27B0] to-[#eb8ed4] text-white rounded-lg shadow-lg min-w-[250px] transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
      >
        {tip}
      </div>
    ))}
  </div>
</section>


      </div>

      {/* Notification Center */}
      <div className="absolute top-6 right-6">
        <button
          className="relative text-2xl"
          title="Notifications"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          🔔
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
              {notifications.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute mt-2 right-0 bg-[#161B22] p-4 rounded-lg shadow-lg w-64">
            {notifications.map((note, index) => (
              <p key={index} className="text-sm py-1">
                {note}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
