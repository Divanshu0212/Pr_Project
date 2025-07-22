import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Key, Lightbulb, GitCompare, Zap, Target, TrendingUp, Upload, Star, Shield } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';

const AtsHome = () => {
    const { isDark } = useTheme();
    const [inView, setInView] = useState({});

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    setInView(prev => ({ ...prev, [entry.target.id]: true }));
                } else {
                    entry.target.classList.remove('animate-in');
                    setInView(prev => ({ ...prev, [entry.target.id]: false }));
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-animate').forEach((el) => {
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
            gradient: "from-cyan-400 via-blue-500 to-purple-600"
        },
        {
            title: "Keyword Match",
            description: "Compare resume keywords against job requirements for better optimization",
            icon: <Key className="w-6 h-6" />,
            link: "/ats/keywords",
            gradient: "from-emerald-400 via-cyan-400 to-blue-500"
        },
        {
            title: "Smart Tips",
            description: "Get actionable AI-powered suggestions to boost your ATS score",
            icon: <Lightbulb className="w-6 h-6" />,
            link: "/ats/analysis",
            gradient: "from-yellow-400 via-orange-500 to-red-500"
        },
        {
            title: "Version Compare",
            description: "Compare different resume versions against the same job posting",
            icon: <GitCompare className="w-6 h-6" />,
            link: "/ats/compare",
            gradient: "from-pink-500 via-purple-500 to-indigo-600"
        }
    ];

    const stats = [
        {
            icon: <Zap className="w-6 h-6" />,
            value: "98%",
            label: "Success Rate",
            color: isDark ? "text-cyan-400" : "text-blue-600"
        },
        {
            icon: <Target className="w-6 h-6" />,
            value: "5x",
            label: "More Interviews",
            color: isDark ? "text-purple-400" : "text-purple-600"
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            value: "2min",
            label: "Quick Analysis",
            color: isDark ? "text-emerald-400" : "text-emerald-600"
        }
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0D1117]' : 'bg-white'} relative overflow-hidden`}>
            {/* Animated Background Mesh */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2s"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4s"></div>
            </div>

            <div className="relative z-10 p-6 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div id="hero" className="scroll-animate opacity-0 translate-y-10 transition-all duration-700">
                    <div className="relative py-20">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-600/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
                        <div className="relative z-10">
                            <div className={`inline-flex items-center px-6 py-3 mb-8 ${
                                isDark ? 'bg-[#161B22] border-cyan-400/20' : 'bg-gray-100 border-cyan-500/30'
                            } border rounded-full ${isDark ? 'text-cyan-400' : 'text-cyan-600'} text-sm font-medium shadow-2xl`}>
                                <Shield className="w-4 h-4 mr-2" />
                                ATS Optimization Platform
                                <Star className="w-4 h-4 ml-2 text-yellow-400" />
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
                                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse-standard"> {/* Using new class */}
                                    ATS Tracker
                                </span>
                            </h1>

                            <div className={`text-xl md:text-2xl ${isDark ? 'text-[#A0AEC0]' : 'text-gray-600'} max-w-4xl mx-auto leading-relaxed mb-8`}>
                                <span className="block mb-2">Optimize your resume for Applicant Tracking Systems</span>
                                <span className="text-cyan-400 font-bold text-2xl md:text-3xl animate-pulse-standard"> {/* Using new class */}
                                    Increase your interview chances by 5x
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link to="/ats/scan">
                                    <Button
                                        text="Start Free Analysis"
                                        className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-cyan-400/25 transform hover:scale-105 transition-all duration-300 hover:rotate-1"
                                    />
                                </Link>
                                <div className={`flex items-center ${isDark ? 'text-[#A0AEC0]' : 'text-gray-600'} text-sm`}>
                                    <div className="flex -space-x-2 mr-3">
                                        <div className={`w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full border-2 ${
                                            isDark ? 'border-[#0D1117]' : 'border-white'
                                        }`}></div>
                                        <div className={`w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 ${
                                            isDark ? 'border-[#0D1117]' : 'border-white'
                                        }`}></div>
                                        <div className={`w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full border-2 ${
                                            isDark ? 'border-[#0D1117]' : 'border-white'
                                        }`}></div>
                                    </div>
                                    <span>Trusted by 10K+ job seekers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div id="stats" className="scroll-animate opacity-0 translate-y-10 transition-all duration-700" style={{ transitionDelay: '300ms' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((stat, index) => (
                            <Card key={index} className="group hover:scale-110 transition-all duration-500 hover:rotate-1">
                                <div className="p-8 text-center relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${
                                        isDark ? 'from-cyan-400/5 to-purple-600/5 group-hover:from-cyan-400/10 group-hover:to-purple-600/10'
                                                : 'from-cyan-500/10 to-purple-600/10 group-hover:from-cyan-500/20 group-hover:to-purple-600/20'
                                    } transition-all duration-500`}></div>
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-white shadow-2xl group-hover:shadow-cyan-400/30 transition-all duration-500">
                                            {stat.icon}
                                        </div>
                                        <div className={`text-4xl font-black mb-3 ${stat.color} animate-pulse-standard`}> {/* Using new class */}
                                            {stat.value}
                                        </div>
                                        <div className={`${isDark ? 'text-[#A0AEC0]' : 'text-gray-600'} font-medium`}>
                                            {stat.label}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Quick Start Card */}
                <div id="quickstart" className="scroll-animate opacity-0 translate-y-10 transition-all duration-700" style={{ transitionDelay: '500ms' }}>
                    <Card className="relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                        <div className={`absolute inset-0 bg-gradient-to-r ${
                            isDark ? 'from-cyan-400/10 via-purple-500/10 to-pink-500/10 group-hover:from-cyan-400/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20'
                                    : 'from-cyan-500/15 via-purple-500/15 to-pink-500/15 group-hover:from-cyan-500/25 group-hover:via-purple-500/25 group-hover:to-pink-500/25'
                        } transition-all duration-500`}></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-600/5 animate-pulse-standard"></div> {/* Using new class */}
                        <div className="relative p-10 text-center">
                            <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl animate-bounce-standard"> {/* Using new class */}
                                <Zap className="w-10 h-10 text-white" />
                            </div>
                            <h2 className={`text-3xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent`}>
                                Quick Analysis
                            </h2>
                            <p className={`${isDark ? 'text-[#A0AEC0]' : 'text-gray-600'} mb-8 max-w-2xl mx-auto text-lg leading-relaxed`}>
                                Upload your resume and job description to get instant ATS compatibility feedback
                                with detailed scoring and improvement suggestions.
                            </p>
                            <Link to="/ats/scan">
                                <Button
                                    text="Start Free Analysis"
                                    className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-cyan-400/30 transform hover:scale-110 transition-all duration-300 animate-gradient-x-ats" // Using new class
                                />
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Features Grid */}
                <div id="features" className="scroll-animate opacity-0 translate-y-10 transition-all duration-700" style={{ transitionDelay: '700ms' }}>
                    <div className="text-center mb-12">
                        <h2 className={`text-4xl font-black mb-4`}>
                            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Powerful ATS Tools
                            </span>
                        </h2>
                        <p className={`text-xl ${isDark ? 'text-[#A0AEC0]' : 'text-gray-600'} max-w-2xl mx-auto`}>
                            Everything you need to optimize your resume and land more interviews
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <Link key={index} to={feature.link} className="group">
                                <Card className="h-full hover:scale-105 transition-all duration-500 hover:rotate-1 group-hover:shadow-2xl">
                                    <div className="p-8 text-center relative overflow-hidden">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${
                                            isDark ? 'from-cyan-400/5 to-purple-600/5 group-hover:from-cyan-400/10 group-hover:to-purple-600/10'
                                                    : 'from-cyan-500/10 to-purple-600/10 group-hover:from-cyan-500/20 group-hover:to-purple-600/20'
                                        } transition-all duration-500`}></div>
                                        <div className="relative z-10">
                                            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110`}>
                                                {feature.icon}
                                            </div>
                                            <h3 className={`text-xl font-bold ${isDark ? 'text-[#E5E5E5] group-hover:text-cyan-400' : 'text-gray-900 group-hover:text-cyan-600'} mb-4 transition-colors duration-300`}>
                                                {feature.title}
                                            </h3>
                                            <p className={`${isDark ? 'text-[#A0AEC0]' : 'text-gray-600'} leading-relaxed`}>
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Analysis Section */}
                <div id="recent" className="scroll-animate opacity-0 translate-y-10 transition-all duration-700" style={{ transitionDelay: '900ms' }}>
                    <Card className="group hover:scale-[1.02] transition-all duration-500">
                        <div className="p-10">
                            <h2 className={`text-3xl font-bold ${isDark ? 'text-[#E5E5E5]' : 'text-gray-900'} mb-8 flex items-center`}>
                                <TrendingUp className="w-8 h-8 mr-4 text-cyan-400" />
                                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                                    Recent Analyses
                                </span>
                            </h2>

                            <div className={`bg-gradient-to-br ${
                                isDark ? 'from-[#161B22] to-[#0D1117] border-cyan-400/20'
                                        : 'from-gray-50 to-white border-cyan-500/30'
                            } rounded-2xl p-10 text-center border relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-600/5 animate-pulse-standard"></div> {/* Using new class */}
                                <div className="relative z-10">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center animate-bounce-standard"> {/* Using new class */}
                                        <Upload className="w-10 h-10 text-cyan-400" />
                                    </div>
                                    <p className={`${isDark ? 'text-[#A0AEC0]' : 'text-gray-600'} mb-4 text-lg`}>
                                        You haven't analyzed any resumes yet.
                                    </p>
                                    <p className={`${isDark ? 'text-[#E5E5E5]' : 'text-gray-900'} mb-8 text-xl font-semibold`}>
                                        Start by uploading your resume and see how it performs against ATS systems.
                                    </p>
                                    <Link to="/ats/scan">
                                        <Button
                                            text="Upload Your First Resume"
                                            className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-cyan-400/30 transform hover:scale-110 transition-all duration-300"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AtsHome;