import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Key, Lightbulb, GitCompare, Zap, Target, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';
import FeatureCard from '../../components/common/FeatureCard'; // This component is imported but not used. You might want to remove it if not needed.
import Button from '../../components/common/Button';

// Assuming useTheme is available to get the current theme, if needed for dynamic gradient generation
// import { useTheme } from '../../context/ThemeContext'; // Uncomment if you need to dynamically generate gradients based on theme

const AtsHome = () => {
  const [isVisible, setIsVisible] = useState({});
  // const { theme, getThemeColor } = useTheme(); // Uncomment if you need to dynamically generate gradients based on theme

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Resume Scanner",
      description: "Upload and get instant ATS compatibility feedback with detailed scoring",
      icon: <FileText className="w-6 h-6" />,
      link: "/ats/tracker",
      // Use Tailwind's direct color names where possible, or specific theme variables
      // These gradients are still hardcoded as string values, they will not dynamically change with the theme directly
      // unless Tailwind's JIT or a custom plugin processes these at runtime with theme knowledge.
      // For truly dynamic gradients based on theme, you'd need to construct them using JS with getThemeColor()
      // and apply them as inline styles, or ensure these colors are also theme-aware in Tailwind's config.
      gradient: "from-accent-primary to-purple-500" // purple-500 is not a variable, consider from-accent-secondary
    },
    {
      title: "Keyword Match",
      description: "Compare resume keywords against job requirements for better optimization",
      icon: <Key className="w-6 h-6" />,
      link: "/ats/keywords",
      gradient: "from-green-400 to-accent-primary" // green-400 is not a variable
    },
    {
      title: "Smart Tips",
      description: "Get actionable AI-powered suggestions to boost your ATS score",
      icon: <Lightbulb className="w-6 h-6" />,
      link: "/ats/analysis",
      gradient: "from-yellow-400 to-orange-500" // yellow-400, orange-500 are not variables
    },
    {
      title: "Version Compare",
      description: "Compare different resume versions against the same job posting",
      icon: <GitCompare className="w-6 h-6" />,
      link: "/ats/compare",
      gradient: "from-pink-500 to-accent-secondary" // pink-500 is not a variable
    }
  ];

  const stats = [
    { icon: <Zap className="w-6 h-6" />, value: "98%", label: "Success Rate" },
    { icon: <Target className="w-6 h-6" />, value: "5x", label: "More Interviews" },
    { icon: <TrendingUp className="w-6 h-6" />, value: "2min", label: "Quick Analysis" }
  ];

  return (
    // Updated background gradient to use theme variables
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-background-primary))] via-[rgb(var(--color-background-secondary))] to-[rgb(var(--color-background-primary))]">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div
          id="hero"
          data-animate
          className={`mb-12 text-center transition-all duration-800 ${
            isVisible.hero ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative">
            {/* The bg-gradient-mesh opacity-30 blur-3xl is excellent as it uses a CSS variable */}
            <div className="absolute inset-0 bg-gradient-mesh opacity-30 blur-3xl"></div>
            <div className="relative z-10">
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                {/* This gradient uses accent-primary and accent-secondary, which are theme-aware */}
                <span className="bg-gradient-to-r from-accent-primary via-accent-secondary to-[rgb(var(--color-accent-secondary))] bg-clip-text text-transparent">
                  ATS Tracker
                </span>
              </h1>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Optimize your resume for Applicant Tracking Systems and
                <span className="text-accent-primary font-semibold"> increase your interview chances by 5x</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div
          id="stats"
          data-animate
          className={`mb-12 transition-all duration-800 delay-200 ${
            isVisible.stats ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="p-6">
                  {/* These gradients use accent-primary and accent-secondary, which are theme-aware */}
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-text-primary mb-2">{stat.value}</div>
                  <div className="text-text-secondary">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Start Card */}
        <div
          id="quickstart"
          data-animate
          className={`mb-12 transition-all duration-800 delay-300 ${
            isVisible.quickstart ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <Card className="relative overflow-hidden">
            {/* These gradients use accent-primary and accent-secondary with opacity, which are theme-aware */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10"></div>
            <div className="relative p-8 text-center">
              {/* These gradients use accent-primary and accent-secondary, which are theme-aware */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">Quick Analysis</h2>
              <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                Upload your resume and job description to get instant ATS compatibility feedback
                with detailed scoring and improvement suggestions.
              </p>
              <Link to="/ats/tracker">
                <Button
                  text="Start Free Analysis"
                  // These gradients use accent-primary and accent-secondary, which are theme-aware
                  // hover:shadow-glow is also theme-aware from global.css
                  className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-glow transform hover:scale-105 transition-all duration-300"
                />
              </Link>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div
          id="features"
          data-animate
          className={`mb-12 transition-all duration-800 delay-400 ${
            isVisible.features ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl font-bold text-center text-text-primary mb-8">
            Powerful ATS Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link} className="group">
                {/* hover:shadow-hover and dark:hover:shadow-hover-dark should come from your CSS setup */}
                <Card className="h-full hover:shadow-hover dark:hover:shadow-hover-dark transition-all duration-300 group-hover:scale-105">
                  <div className="p-6 text-center">
                    {/* These feature gradients are defined in the features array.
                        For full theme responsiveness here, you'd need to:
                        1. Define more theme-aware gradients in your Tailwind config.
                        2. Or use inline styles generated by JS if the gradients are very dynamic.
                        Currently, 'purple-500', 'green-400', 'yellow-400', 'orange-500', 'pink-500'
                        are fixed Tailwind colors, not theme variables.
                    */}
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Analysis Section */}
        <div
          id="recent"
          data-animate
          className={`transition-all duration-800 delay-500 ${
            isVisible.recent ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <Card>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-accent-primary" />
                Recent Analyses
              </h2>
              {/* Updated background gradient to use theme variables and border color */}
              <div className="bg-gradient-to-r from-[rgb(var(--color-background-secondary))] to-[rgb(var(--color-background-primary))] rounded-xl p-8 text-center border border-[rgb(var(--color-accent-neutral))/0.2]">
                {/* These gradients use accent-primary and accent-secondary with opacity, which are theme-aware */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-accent-primary" />
                </div>
                <p className="text-text-secondary mb-4">You haven't analyzed any resumes yet.</p>
                <p className="text-text-primary mb-6">
                  Start by uploading your resume and see how it performs against ATS systems.
                </p>
                <Link to="/ats/tracker">
                  <Button
                    text="Upload Your First Resume"
                    // These gradients use accent-primary and accent-secondary, which are theme-aware
                    // hover:shadow-glow is also theme-aware from global.css
                    className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-glow"
                  />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AtsHome;