import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import Post from "./pages/Post";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AuthPage from "./pages/AuthPage";
import ResumeBuilderHome from "./pages/ResumeGen/ResumeBuilderHome";
import ResumeBuilder from "./pages/ResumeGen/ResumeBuilder";
import "./app.css";

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
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} />
        <div className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/post/:id" element={user ? <Post /> : <Navigate to="/login" />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/authpage" element={<AuthPage />} />
            <Route path="/resume-builder-home" element={<ResumeBuilderHome />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
          </Routes>
        </div>
        <Footer user={user} />
      </div>
    </BrowserRouter>
  );
};

export default App;
