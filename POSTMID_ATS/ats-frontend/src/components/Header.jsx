import React from 'react';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <span className="logo-text">ATS Tracker</span>
        </div>
        <nav className="nav">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
