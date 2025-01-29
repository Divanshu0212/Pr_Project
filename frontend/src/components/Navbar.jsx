import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user }) => {
  const logout = () => {
    window.open("http://localhost:5000/auth/logout", "_self");
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        className={`focus:outline-none focus:ring-0 active:outline-none active:ring-0 flex fixed left-0 top-2 items-center bg-gray-800 text-white border-0 z-50 bg-transparent `}
        onClick={toggleNavbar}
      >
        <div className="items-center justify-center">☰</div>
      </button>
      <div className={`fixed left-0 top-0 h-full bg-gray-800 p-4 transition-transform z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <span className="logo text-white text-xl">
          <Link className="link" to="/" onClick={toggleNavbar}>
            TrackFolio
          </Link>
        </span>
        {user ? (
          <ul className="list mt-4">
            <li className="listItem mb-4 ml-10">
              <img src={user.photos[0].value} alt="" className="avatar rounded-full w-16 h-16" />
            </li>
            <li className="listItem text-white mb-4">{user.displayName}</li>
            <li className="listItem text-white cursor-pointer" onClick={logout}>
              Logout
            </li>
          </ul>
        ) : (
          <Link className="link text-white mt-4" to="authPage" onClick={toggleNavbar}>
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
