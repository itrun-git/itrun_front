import React from 'react';
import '../Style/HeaderMenu.css';
import LogoIcon from "../Logo/LogoIcon.png";

const userAvatarUrl = null; 
const userInitials = "?";

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <img src={LogoIcon} alt="ItRun Logo" className="logo" />
        </div>
        <div className="logo-text">ItRun</div> 
        <nav className="menu">
          <div className="menu-item">Workspaces ▾</div>
          <div className="menu-item">Recent ▾</div>
          <div className="menu-item">Starred ▾</div>
          <div className="menu-item">Templates ▾</div>
        </nav>
      </div>

      <div className="header-right">
        <button className="create-btn">Create</button>
        <input type="text" placeholder="Search" className="search" />
        <span className="icon">🔔</span>
        <span className="icon">❓</span>

        {userAvatarUrl ? (
          <img src={userAvatarUrl} alt="Avatar" className="avatar-img" />
        ) : (
          <div className="avatar-fallback">{userInitials}</div>
        )}
      </div>
    </header>
  );
};

export default Header;
