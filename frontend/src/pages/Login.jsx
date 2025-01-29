import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";
import Lady from "../img/auth_Lady_img.jpg";
import SummaryApi from "../common";

const Login = () => {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const messages = [
    "Welcome! Create your perfect resume today.",
    "Join us to manage your professional portfolio.",
    "Sign up and take control of your career journey.",
  ];

  // Rotating messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // OAuth handlers
  const google = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  const github = () => {
    window.open("http://localhost:5000/auth/github", "_self");
  };

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(SummaryApi.signIn.url, {
        method: SummaryApi.signIn.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Login successful!");
      } else {
        setErrorMessage(result.message || "Login failed.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Section with Curve */}
      <div className="relative md:flex-1 bg-[#0D1117] text-white flex flex-col justify-center items-center p-6">
        {/* Curved Background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path
              fill="#161B22"
              fillOpacity="1"
              d="M0,192L60,202.7C120,213,240,235,360,213.3C480,192,600,128,720,122.7C840,117,960,171,1080,197.3C1200,224,1320,224,1380,224L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
        <h1 className="mt-20 text-3xl md:text-4xl font-bold mb-4 text-center animate-pulse z-10">
          {messages[messageIndex]}
        </h1>
        <button
          onClick={() => navigate("/signup")}
          className="bg-[#00FFFF] text-[#0D1117] px-6 py-2 rounded-lg font-medium shadow-md hover:bg-[#9C27B0] hover:text-white z-10"
        >
          Sign Up
        </button>
        <div className="mt-20 hidden md:block z-10">
          <img
            src={Lady}
            alt="Illustration"
            className="w-84 mt-40 md:w-84 h-88 md:h-64 object-contain"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="md:flex-1 flex justify-center items-center bg-[#161B22] p-6">
        <div className="w-full max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold text-[#00FFFF] mb-6">
            Sign in
          </h2>
          {/* Email/Password login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#9C27B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF] bg-[#0D1117] text-white"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#9C27B0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF] bg-[#0D1117] text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#9C27B0] text-white py-2 rounded-lg font-medium hover:bg-[#00FFFF] hover:text-[#0D1117]"
            >
              Sign In
            </button>
          </form>
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-sm mt-2">{successMessage}</p>
          )}
          <p className="text-center text-gray-500 my-4">or</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={google}
              className="bg-gray-100 p-3 rounded-full shadow-md hover:bg-gray-200 flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faGoogle} className="text-xl" />
              <span>Google</span>
            </button>
            <button
              onClick={github}
              className="bg-gray-100 p-3 rounded-full shadow-md hover:bg-gray-200 flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faGithub} className="text-xl" />
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
