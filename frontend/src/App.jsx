import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 
import PrivateRoute from './components/PrivateRoute';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './components/common/Loader';
import PropTypes from 'prop-types';

// Layout Components
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Hooks
import { useAuth } from './hooks/useAuth';

// Styles
import './styles/global.css';
import './App.css';
import './styles/animations.css';

// Lazy-loaded components
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const Login = lazy(() => import('./pages/auth/Login'));
const LandingPage = lazy(() => import('./pages/static/LandingPage'));
const HomePage = lazy(() => import('./pages/static/Home'));
const FAQs = lazy(() => import('./pages/static/FAQs'));
const ContactUs = lazy(() => import('./pages/static/ContactUs'));
const PrivacyPolicy = lazy(() => import('./pages/static/Privacy'));
const TermsAndConditions = lazy(() => import('./pages/static/Terms'));
const NotFound = lazy(() => import('./pages/static/NotFound'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const PortfolioHome = lazy(() => import('./pages/portfolio/PortfolioHome'));
const ProjectTracking = lazy(() => import('./pages/portfolio/ProjectTracking'));
const TeamCollab = lazy(() => import('./pages/portfolio/TeamCollab'));
const SkillManagement = lazy(() => import('./components/portfolio/SkillManagement'));
const ProjectForm = lazy(() => import('./components/portfolio/ProjectForm'));
const ProjectDetails = lazy(() => import('./pages/portfolio/ProjectDetails'));
const ResumeBuilderHome = lazy(() => import('./pages/resume/ResumeBuilderHome'));
const BuildResume = lazy(() => import('./pages/resume/BuildResume'));
const TemplateGallery = lazy(() => import('./pages/resume/TemplateGallery'));
const AtsHome = lazy(() => import('./pages/ats/AtsHome'));
const AnalysisView = lazy(() => import('./pages/ats/AnalysisView'));
const AnalysisResults = lazy(() => import('./pages/ats/AnalysisResults'));
const KeywordAnalysis = lazy(() => import('./pages/ats/KeywordAnalysis'));
const Post = lazy(() => import('./pages/Post'));
const ResumeATSScanner = lazy(() => import('./pages/ats/new'));

// NEW: Lazy load the new pages
const About = lazy(() => import('./pages/static/About'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Settings = lazy(() => import('./pages/user/Settings'));
const HelpCenter = lazy(() => import('./pages/static/HelpCenter'));

// Page transition variants for Framer Motion
const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

const pageTransition = {
  duration: 0.35,
  ease: 'easeInOut',
};

// FIXED: Simplified ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="page-container"
      >
        <Routes location={location}>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Public Routes */}
          <Route path="/" element={<MainLayout user={currentUser}><LandingPage /></MainLayout>} />
          <Route path="/faqs" element={<MainLayout user={currentUser}><FAQs /></MainLayout>} />
          <Route path="/contact-us" element={<MainLayout user={currentUser}><ContactUs /></MainLayout>} />
          <Route path="/privacy-policy" element={<MainLayout user={currentUser}><PrivacyPolicy /></MainLayout>} />
          <Route path="/terms-and-conditions" element={<MainLayout user={currentUser}><TermsAndConditions /></MainLayout>} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/about" element={<MainLayout user={currentUser}><About /></MainLayout>} />

          {/* Protected Routes - FIXED: Proper structure */}
          <Route path="/home" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <HomePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/help" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <HelpCenter />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Post Route */}
          <Route path="/post/:id" element={
            <ProtectedRoute>
              <MainLayout user={currentUser}>
                <Post />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Portfolio Routes */}
          <Route path="/portfolioHome" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <PortfolioHome />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/skills" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <SkillManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/add" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <ProjectForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/:id" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <ProjectDetails />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/edit/:id" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <ProjectForm editMode={true} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/tracking" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <ProjectTracking />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/team" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <TeamCollab />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Resume Routes */}
          <Route path="/resume-builder-home" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <ResumeBuilderHome />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/resume-builder" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <BuildResume />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/resume/templates" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <TemplateGallery />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ATS Routes */}
          <Route path="/ats/home" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <AtsHome />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ats/tracker" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <ResumeATSScanner />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/ats/analysis" element={
            <ProtectedRoute>
              <AnalysisView />
            </ProtectedRoute>
          } /> 
          
          <Route path="/ats/results" element={
            <ProtectedRoute>
              <AnalysisResults />
            </ProtectedRoute>
          } />
          
          <Route path="/ats/keywords" element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser}>
                <KeywordAnalysis />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Fallback Routes */}
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<MainLayout user={currentUser}><NotFound /></MainLayout>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
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
      <ThemeProvider>
        <Router>
          <div className="app-container min-h-screen">
            <Suspense fallback={<Loader />}>
              <AnimatedRoutes />
            </Suspense>
            {authError && (
              <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
                Authentication error: {authError.message}
              </div>
            )}
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;