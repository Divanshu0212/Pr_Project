// Updated App.jsx with Page Transitions

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PageTransition from './components/common/PageTransition'; // Import PageTransition

// Layout Components
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Common Components
import Loader from './components/common/Loader';

// Auth Pages
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';

// Static Pages
import LandingPage from './pages/static/LandingPage';
import HomePage from './pages/static/Home';
import FAQs from './pages/static/FAQs';
import ContactUs from './pages/static/ContactUs';
import PrivacyPolicy from './pages/static/Privacy';
import TermsAndConditions from './pages/static/Terms';
import NotFound from './pages/static/NotFound';

// Portfolio Pages
import PortfolioHome from './pages/portfolio/PortfolioHome';
import AddProject from './pages/portfolio/AddProject';
import ProjectTracking from './pages/portfolio/ProjectTracking';
import TeamCollab from './pages/portfolio/TeamCollab';
import PortfolioItemDetail from './pages/portfolio/PortfolioItemDetail';

// Resume Pages
import ResumeBuilderHome from './pages/resume/ResumeBuilderHome';
import BuildResume from './pages/resume/BuildResume';
import TemplateGallery from './pages/resume/TemplateGallery';

// ATS Pages
import ATSTracker from './pages/ats/ATSTracker';
import AtsHome from './pages/ats/AtsHome';
import AnalysisView from './pages/ats/AnalysisView';
import AnalysisResults from './pages/ats/AnalysisResults'; // Assuming this page exists
import KeywordAnalysis from './pages/ats/KeywordAnalysis'; // Assuming this page exists

// Post
import Post from './pages/Post';

// Styles
import './styles/variables.css';
import './styles/global.css';
import './App.css';
import './styles/animations.css'; // Ensure animations.css is imported

// AnimatedRoutes component wraps all routes with transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <PageTransition location={location}>
      <Routes location={location}>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Public Routes */}
        <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
        <Route path="/faqs" element={<MainLayout><FAQs /></MainLayout>} />
        <Route path="/contact-us" element={<MainLayout><ContactUs /></MainLayout>} />
        <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
        <Route path="/terms-and-conditions" element={<MainLayout><TermsAndConditions /></MainLayout>} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          {/* Redirect to home page if authenticated */}
          <Route path="/home" element={
            <DashboardLayout>
              <HomePage />
            </DashboardLayout>
          } />

          {/* Post */}
          <Route path="/post/:id" element={
            <MainLayout>
              <Post />
            </MainLayout>
          } />

          {/* Portfolio Routes */}
          <Route path="/portfolioHome" element={
            <DashboardLayout>
              <PortfolioHome />
            </DashboardLayout>
          } />
          <Route path="/portfolio/add" element={
            <DashboardLayout>
              <AddProject />
            </DashboardLayout>
          } />

          <Route path="/portfolio/view/:id" element={
            <DashboardLayout>
              <PortfolioItemDetail />
            </DashboardLayout>
          } />

          <Route path="/portfolio/edit/:id" element={
            <DashboardLayout>
              <AddProject isEditing={true} />
            </DashboardLayout>
          } />
          <Route path="/portfolio/tracking" element={
            <DashboardLayout>
              <ProjectTracking />
            </DashboardLayout>
          } />
          <Route path="/portfolio/team" element={
            <DashboardLayout>
              <TeamCollab />
            </DashboardLayout>
          } />

          {/* Resume Routes */}
          <Route path="/resume-builder-home" element={
            <DashboardLayout>
              <ResumeBuilderHome />
            </DashboardLayout>
          } />
          <Route path="/resume-builder" element={
            <DashboardLayout>
              <BuildResume />
            </DashboardLayout>
          } />
          <Route path="/resume/templates" element={
            <DashboardLayout>
              <TemplateGallery />
            </DashboardLayout>
          } />
          <Route path="/resume/create" element={
            <DashboardLayout>
              <BuildResume />
            </DashboardLayout>
          } />

          {/* ATS Routes */}
          <Route path="/ats/home" element={
            <DashboardLayout>
              <AtsHome />
            </DashboardLayout>
          } />
          <Route path="/ats/tracker" element={
            <DashboardLayout>
              <ATSTracker />
            </DashboardLayout>
          } />
          <Route path="/ats/analysis/:analysisId" element={
            <DashboardLayout>
              <AnalysisView />
            </DashboardLayout>
          } />
          <Route path="/ats/results" element={
            <DashboardLayout>
              <AnalysisResults />
            </DashboardLayout>
          } />
          <Route path="/ats/keywords" element={
            <DashboardLayout>
              <KeywordAnalysis />
            </DashboardLayout>
          } />
        </Route>

        {/* Redirect unknown routes to home when authenticated */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />

        {/* 404 Page */}
        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Routes>
    </PageTransition>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleAuthError = (error) => {
    setAuthError(error);
    console.error('Authentication error:', error);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <AuthProvider onError={handleAuthError}>
      <Router>
        <div className="app-container bg-[#0D1117] min-h-screen">
          <AnimatedRoutes />
          {authError && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
              Authentication error: {authError.message}
            </div>
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;