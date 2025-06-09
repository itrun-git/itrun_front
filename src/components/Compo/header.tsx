import React, { useState, useEffect, useRef } from 'react';
import '../Style/HeaderMenu.css';
import LogoIcon from "../Logo/LogoIcon.png";
import { getUserFullName, getUserEmail, getUserAvatar, logoutUser } from '../Api/api';
import { useNavigate } from 'react-router-dom';
import vopsor from '../Logo/vopsor.png';
import exit from '../Logo/exit.png';
import settings from '../Logo/settings.png';
import bell from "../Logo/bell.png";
import loopa from "../Logo/loopa.png";
const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    avatar: string | null;
  }>({
    name: '',
    email: '',
    avatar: null,
  });
  const [loading, setLoading] = useState(true);

  const menuRef = useRef <HTMLDivElement> (null);
  const token = localStorage.getItem('authToken');

  const navigate = useNavigate();
  const TabClick = () => {
    navigate('/mainform');
  };

  useEffect(() => {
  const fetchUserData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [nameResponse, emailResponse, avatarResponse] = await Promise.all([
        getUserFullName(token).catch((e) => {
          console.log("Ошибка имени:", e);
          return { fullName: '' };
        }),
        getUserEmail(token).catch((e) => {
          console.log("Ошибка email:", e);
          return { email: '' };
        }),
        getUserAvatar(token).catch((e) => {
          console.log("Ошибка аватара:", e);
          return { avatarUrl: null };
        }),
      ]);

      console.log("Имя:", nameResponse);
      console.log("Email:", emailResponse);
      console.log("Аватар:", avatarResponse);

      setUserData({
        name: nameResponse.fullName || 'Пользователь',
        email: emailResponse.email || '',
        avatar: avatarResponse.avatarUrl,
      });
    } catch (error) {
      console.error('Общая ошибка:', error);
      setUserData({
        name: 'Пользователь',
        email: '',
        avatar: null
      });
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, [token]);


  useEffect(() => {
    const ClickOutside = (event: { target: any; }) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', ClickOutside);
    } else {
      document.removeEventListener('mousedown', ClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', ClickOutside);
    };
  }, [isUserMenuOpen]);

  const userInitials = userData.name
    ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : "?";

  const Logout = async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    setIsUserMenuOpen(false);
  };

  const Settings = () => {
    window.location.href = '/settings';
    setIsUserMenuOpen(false);
  };
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <button className="header-menu-btn" onClick={TabClick}>
          <img src={LogoIcon} alt="ItRun Logo" className="logo"/>
          </button>
          </div>
          <div className="logo-text">
            <button className="header-menu-btn" onClick={TabClick}>
            ItRun
            </button>
          </div>
        <nav className="menu">
          <div className="menu-item">Workspaces ▾</div>
          <div className="menu-item">Recent ▾</div>
          <div className="menu-item">Starred ▾</div>
          <div className="menu-item">Templates ▾</div>
        </nav>
      </div>

      <div className="header-right">
        {/* <button className="create-btn">Create</button> */}
        <input type="text" placeholder="Search" className="search" />
        <span className="headericon "><img src={bell}/></span>
        <span className="headericon "><img src={vopsor}/></span>
        <div className="user-avatar-container" onClick={() => 
          setIsUserMenuOpen(prev => !prev)}
          ref={menuRef}>
          {userData.avatar ? (
            <img src={userData.avatar} alt="Avatar" className="avatar-img"/>
          ) : (<div className="avatar-fallback">{userInitials}</div> )}

          {isUserMenuOpen && (
            <div className="user-dropdown-menu">
              <div className="user-info">
                <div className="user-name">{userData.name}</div>
                <div className="user-email">{userData.email}</div>
              </div>

              <div className="menu-divider"></div>

              <div className="menu-actions">
                <button onClick={Settings} className="menu-action-btn">
                  <span className="menu-icon"><img className='setting-header-btn' src={settings}/></span>
                  Settings
                </button>
                <button onClick={Logout} className="menu-action-btn logout-btn">
                  <span className="menu-icon"><img className='exit-header-btn' src={exit}></img></span>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;