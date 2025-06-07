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

import OAuthCallback from './pages/OAuthCallback';

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

//Hooks
import { useAuth } from './hooks/useAuth';

// Styles
import './styles/variables.css';
import './styles/global.css';
import './App.css';
import './styles/animations.css'; // Ensure animations.css is imported
import ResumeATSScanner from './pages/ats/new';

// AnimatedRoutes component wraps all routes with transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  return (
    <PageTransition location={location}>
      <Routes location={location}>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Public Routes - Pass currentUser to MainLayout */}
        <Route path="/" element={<MainLayout user={currentUser}><LandingPage /></MainLayout>} />
        <Route path="/faqs" element={<MainLayout user={currentUser}><FAQs /></MainLayout>} />
        <Route path="/contact-us" element={<MainLayout user={currentUser}><ContactUs /></MainLayout>} />
        <Route path="/privacy-policy" element={<MainLayout user={currentUser}><PrivacyPolicy /></MainLayout>} />
        <Route path="/terms-and-conditions" element={<MainLayout user={currentUser}><TermsAndConditions /></MainLayout>} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          {/* Redirect to home page if authenticated */}
          <Route path="/home" element={
            <DashboardLayout user={currentUser}>
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
            <DashboardLayout user={currentUser}>
              <PortfolioHome />
            </DashboardLayout>
          } />
          <Route path="/portfolio/add" element={
            <DashboardLayout user={currentUser}>
              <AddProject />
            </DashboardLayout>
          } />

          <Route path="/portfolio/view/:id" element={
            <DashboardLayout user={currentUser}>
              <PortfolioItemDetail />
            </DashboardLayout>
          } />

          <Route path="/portfolio/edit/:id" element={
            <DashboardLayout user={currentUser}>
              <AddProject isEditing={true} />
            </DashboardLayout>
          } />
          <Route path="/portfolio/tracking" element={
            <DashboardLayout user={currentUser}>
              <ProjectTracking />
            </DashboardLayout>
          } />
          <Route path="/portfolio/team" element={
            <DashboardLayout user={currentUser}>
              <TeamCollab />
            </DashboardLayout>
          } />

          {/* Resume Routes */}
          <Route path="/resume-builder-home" element={
            <DashboardLayout user={currentUser}>
              <ResumeBuilderHome />
            </DashboardLayout>
          } />
          <Route path="/resume-builder" element={
            <DashboardLayout user={currentUser}>
              <BuildResume />
            </DashboardLayout>
          } />
          <Route path="/resume/templates" element={
            <DashboardLayout user={currentUser}>
              <TemplateGallery />
            </DashboardLayout>
          } />
          <Route path="/resume/create" element={
            <DashboardLayout user={currentUser}>
              <BuildResume />
            </DashboardLayout>
          } />

          {/* ATS Routes */}
          <Route path="/ats/home" element={
            <DashboardLayout user={currentUser}>
              <AtsHome />
            </DashboardLayout>
          } />
          <Route path="/ats/tracker" element={
            <DashboardLayout user={currentUser}>
              <ResumeATSScanner />
            </DashboardLayout>
          } />
          <Route path="/ats/analysis/:analysisId" element={
            <DashboardLayout user={currentUser}>
              <AnalysisView />
            </DashboardLayout>
          } />
          <Route path="/ats/results" element={
            <DashboardLayout user={currentUser}>
              <AnalysisResults />
            </DashboardLayout>
          } />
          <Route path="/ats/keywords" element={
            <DashboardLayout user={currentUser}>
              <KeywordAnalysis />
            </DashboardLayout>
          } />
        </Route>

        {/* Redirect unknown routes to home when authenticated */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />

        {/* 404 Page */}
        <Route path="*" element={<MainLayout user={currentUser}><NotFound /></MainLayout>} />
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