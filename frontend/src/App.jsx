import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import "./app.css";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import Post from "./pages/Post";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SignUp from "./pages/SignUp";
import AuthPage from "./pages/AuthPage";
import ResumeBuilderHome from "./pages/ResumeGen/ResumeBuilderHome";
import ResumeBuilder from "./pages/ResumeGen/ResumeBuilder";
import FAQs from './pages/FAQs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/termsAndConditions';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = () => {
      fetch("http://localhost:5000/auth/login/success", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      })
        .then((response) => {
          if (response.status === 200) return response.json();
          throw new Error("authentication has been failed!");
        })
        .then((resObject) => {
          setUser(resObject.user);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getUser();
  }, []);

  return (
    <BrowserRouter>
      <div>
        {/* <Navbar user={user} /> */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/post/:id"
            element={user ? <Post /> : <Navigate to="/login" />}
          />
          <Route
            path="/signup"
            element={<SignUp/>}
          />
        
          <Route path="/authpage" element={<AuthPage />} />
          <Route path="/resume-builder-home" element={<ResumeBuilderHome />}/>
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/faqs"  element={<FAQs />}  />
          <Route path="/contact-us"  element={<ContactUs />} />
        < Route path="/privacy-policy"  element={<PrivacyPolicy />}/>
        <Route path="/terms-and-conditions"  element={<TermsAndConditions />}  />

        </Routes>
        <Footer user={user} />
         
      </div>
    </BrowserRouter>
  );
};

export default App;
