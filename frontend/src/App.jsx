// This is the App.jsx content you should use.
// Make sure to add the new lazy imports at the top.

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute'; // Assuming this handles loading/redirect logic
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './components/common/Loader';
import PropTypes from 'prop-types';

// Layout Components
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Hooks
import { useAuth } from './hooks/useAuth';

// Styles (ensure these paths are correct and CSS files are updated)
import './styles/global.css';
import './App.css';
import './styles/animations.css'; // Global animations
import PortfolioNotFound from './pages/portfolio/PortfolioNotFound';

// Lazy-loaded components (grouped by module and access level for clarity)

// --- Public / Static Pages ---
const LandingPage = lazy(() => import('./pages/static/LandingPage'));
const About = lazy(() => import('./pages/static/About'));
const ContactUs = lazy(() => import('./pages/static/ContactUs'));
const FAQs = lazy(() => import('./pages/static/FAQs'));
const HelpCenter = lazy(() => import('./pages/static/HelpCenter'));
const NotFound = lazy(() => import('./pages/static/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/static/Privacy'));
const TermsAndConditions = lazy(() => import('./pages/static/Terms')); // Confirmed this is the file name
const PublicPortfolio = lazy(() => import('./pages/portfolio/PublicPortfolio')); // NEW: Public portfolio view page

// --- Authentication Pages ---
const Login = lazy(() => import('./pages/auth/Login'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));

// --- User Dashboard & Profile Management ---
const HomePage = lazy(() => import('./pages/static/Home')); // Acts as the main Dashboard
const Profile = lazy(() => import('./pages/user/Profile'));
const Settings = lazy(() => import('./pages/user/Settings'));
const Post = lazy(() => import('./pages/Post')); // Generic Post/Content View

// --- Resume Builder Module ---
const ResumeBuilderHome = lazy(() => import('./pages/resume/ResumeBuilderHome'));
const ResumeOptimizer = lazy(() => import('./pages/resumeBuilder/Resume')); // Using 'pages/resumeBuilder/Resume.jsx' as the builder
const TemplateGallery = lazy(() => import('./pages/resume/TemplateGallery'));
const MyResumesPage = lazy(() => import('./pages/resume/MyResumesPage')); // NEW: Create this page

// --- ATS Optimizer Module ---
const AtsTracker = lazy(() => import('./pages/ats/AtsTracker')); // Main scan input page
const AtsResults = lazy(() => import('./pages/ats/AtsResults')); // Analysis results page
const AnalysisView = lazy(() => import('./pages/ats/AnalysisView')); // Detailed report page (modified to fetch by ID)
const KeywordAnalysis = lazy(() => import('./pages/ats/KeywordAnalysis'));
const AtsHistoryPage = lazy(() => import('./pages/ats/AtsHistoryPage')); // NEW: Create this page

// --- Portfolio Module ---
const PortfolioHome = lazy(() => import('./pages/portfolio/PortfolioHome')); // Main portfolio dashboard
const ProjectDetails = lazy(() => import('./pages/portfolio/ProjectDetails')); // Single project details
const ProjectForm = lazy(() => import('./components/portfolio/ProjectForm')); // Component for Add/Edit Project
const ProjectTracking = lazy(() => import('./pages/portfolio/ProjectTracking')); // All projects list page
const SkillManagement = lazy(() => import('./components/portfolio/SkillManagement')); // Manage skills page
const TeamCollab = lazy(() => import('./pages/portfolio/TeamCollab'));
const ProfileSettingsPage = lazy(() => import('./pages/portfolio/ProfileSettingsPage')); // NEW: Create this page for PortfolioDetailsForm
const CertificatesPage = lazy(() => import('./pages/portfolio/CertificatesPage')); // NEW: Create this page
const ExperiencePage = lazy(() => import('./pages/portfolio/ExperiencePage')); // NEW: Create this page


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

// ProtectedRoute component - ensures user is logged in
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
          {/* --- Public Routes (accessible without login) --- */}
          <Route path="/" element={<MainLayout user={currentUser}><LandingPage /></MainLayout>} />
          <Route path="/about" element={<MainLayout user={currentUser}><About /></MainLayout>} />
          <Route path="/faqs" element={<MainLayout user={currentUser}><FAQs /></MainLayout>} />
          <Route path="/contact-us" element={<MainLayout user={currentUser}><ContactUs /></MainLayout>} />
          <Route path="/privacy" element={<MainLayout user={currentUser}><PrivacyPolicy /></MainLayout>} />
          <Route path="/terms" element={<MainLayout user={currentUser}><TermsAndConditions /></MainLayout>} />
          <Route path="/help" element={<MainLayout user={currentUser}><HelpCenter /></MainLayout>} />
          <Route path="/portfolio/public/:username" element={<MainLayout user={currentUser}><PublicPortfolio /></MainLayout>} /> {/* Public portfolio view */}
          <Route path="/portfolio-not-found" element={<MainLayout user={currentUser}><PortfolioNotFound /></MainLayout>} /> {/* Portfolio Not Found page */}

          {/* --- Authentication Routes --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />

          {/* --- Protected Routes (require user login) --- */}
          {/* General Dashboard & User Management */}
          <Route path="/home" element={<ProtectedRoute><DashboardLayout user={currentUser}><HomePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><DashboardLayout user={currentUser}><Profile /></DashboardLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><DashboardLayout user={currentUser}><Settings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/post/:id" element={<ProtectedRoute><MainLayout user={currentUser}><Post /></MainLayout></ProtectedRoute>} /> {/* Generic post view */}

          {/* Portfolio Module */}
          <Route path="/portfolio" element={<ProtectedRoute><DashboardLayout user={currentUser}><PortfolioHome /></DashboardLayout></ProtectedRoute>} /> {/* Main dashboard */}
          <Route path="/portfolio/settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} /> {/* New page */}
          <Route path="/portfolio/skills" element={<ProtectedRoute><DashboardLayout user={currentUser}><SkillManagement /></DashboardLayout></ProtectedRoute>} />
          <Route path="/portfolio/projects" element={<ProtectedRoute><DashboardLayout user={currentUser}><ProjectTracking /></DashboardLayout></ProtectedRoute>} /> {/* All projects list */}
          <Route path="/portfolio/projects/add" element={<ProtectedRoute><DashboardLayout user={currentUser}><ProjectForm /></DashboardLayout></ProtectedRoute>} />
          <Route path="/portfolio/projects/edit/:id" element={<ProtectedRoute><DashboardLayout user={currentUser}><ProjectForm editMode={true} /></DashboardLayout></ProtectedRoute>} />
          <Route path="/portfolio/projects/:id" element={<ProtectedRoute><DashboardLayout user={currentUser}><ProjectDetails /></DashboardLayout></ProtectedRoute>} />
          <Route path="/portfolio/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} /> {/* New page */}
          <Route path="/portfolio/experience" element={<ProtectedRoute><ExperiencePage /></ProtectedRoute>} /> {/* New page */}
          <Route path="/portfolio/team" element={<ProtectedRoute><DashboardLayout user={currentUser}><TeamCollab /></DashboardLayout></ProtectedRoute>} />

          {/* Resume Builder Module */}
          <Route path="/resume" element={<ProtectedRoute><DashboardLayout user={currentUser}><ResumeBuilderHome /></DashboardLayout></ProtectedRoute>} /> {/* Builder Home */}
          <Route path="/resume/build" element={<ProtectedRoute><DashboardLayout user={currentUser}><ResumeOptimizer /></DashboardLayout></ProtectedRoute>} /> {/* Using pages/newResume/Resume.jsx */}
          <Route path="/resume/edit/:resumeId" element={<ProtectedRoute><DashboardLayout user={currentUser}><ResumeOptimizer editMode={true} /></DashboardLayout></ProtectedRoute>} />
          <Route path="/resume/templates" element={<ProtectedRoute><DashboardLayout user={currentUser}><TemplateGallery /></DashboardLayout></ProtectedRoute>} />
          <Route path="/resume/my-resumes" element={<ProtectedRoute><MyResumesPage /></ProtectedRoute>} /> {/* New page */}

          {/* ATS Optimizer Module */}
          <Route path="/ats" element={<ProtectedRoute><AtsTracker /></ProtectedRoute>} /> {/* Main ATS page with upload */}

          <Route path="/ats/results" element={<ProtectedRoute><AtsResults /></ProtectedRoute>} /> {/* Analysis results page */}
          <Route path="/ats/analysis/:analysisId" element={<ProtectedRoute><DashboardLayout user={currentUser}><AnalysisView /></DashboardLayout></ProtectedRoute>} /> {/* Detailed report (fetches by ID) */}
          <Route path="/ats/history" element={<ProtectedRoute><AtsHistoryPage /></ProtectedRoute>} /> {/* New page */}
          <Route path="/ats/keywords" element={<ProtectedRoute><DashboardLayout user={currentUser}><KeywordAnalysis /></DashboardLayout></ProtectedRoute>} />

          {/* --- Fallback Routes --- */}
          <Route path="/index.html" element={<Navigate to="/" replace />} /> {/* Redirect old index.html route */}
          <Route path="*" element={<MainLayout user={currentUser}><NotFound /></MainLayout>} /> {/* 404 Not Found */}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Simulate initial loading time, perhaps for auth context to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthError = (error) => {
    setAuthError(error);
  };

  if (isLoading) {
    return <Loader />; // Your global loading component
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
              <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
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