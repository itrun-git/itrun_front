import React, { useState, useEffect, useRef } from 'react';
import '../Style/HeaderMenu.css';
import LogoIcon from "../Logo/logoItRun.png";
import { getUserFullName, getUserEmail, getUserAvatar, logoutUser, getUserWorkspace, getFavoriteBoards, Workspace, Board } from '../Api/api';
import { useNavigate } from 'react-router-dom';
import vopsor from '../Logo/vopsor.png';
import exit from '../Logo/exit.png';
import settings from '../Logo/settings.png';
import bell from "../Logo/bell.png";
import loopa from "../Logo/loopa.png";
import star from "../Logo/starlight.png";

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWorkspacesMenuOpen, setIsWorkspacesMenuOpen] = useState(false);
  const [isStarredMenuOpen, setIsStarredMenuOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [starredBoards, setStarredBoards] = useState<Board[]>([]);
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
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const starredMuneRef = useRef<HTMLDivElement>(null);
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
        setUserData({ name: 'Пользователь', email: '', avatar: null });
      } finally {
        setLoading(false);
      }
    };
  fetchUserData();
  }, [token]);

  const fetchWorkspaces = async () => {
    if(!token) return;
    try{
      const workspacesData = await getUserWorkspace();
      setWorkspaces(workspacesData);
    }catch (error){
      console.error("Error upgrate workspace", error);
      setWorkspaces([]);
    }
  };

  const fetchStarredBoards = async () => {
    if(!token) return;
    try{
      const starredData = await getFavoriteBoards();
      setStarredBoards(starredBoards);
    }catch (error){
      console.error("Error upgrate workspace", error);
      setStarredBoards([]);
    }
  };

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

  const userInitials = userData.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : "?";

  const Settings = () => {
    window.location.href = '/settings';
    setIsUserMenuOpen(false);
  };

  const WorkspaceClick = (workspaceId: string) =>{
    navigate(`/workspace/${workspaceId}`);
    setIsWorkspacesMenuOpen(false);
  }

  const StarredBoardClick = (boardId: string) =>{
    navigate(`/workspace/${boardId}`);
    setIsWorkspacesMenuOpen(false);
  }

  const WorkspacesClick = () =>{
    if(!isWorkspacesMenuOpen){
      fetchWorkspaces();
    }
    setIsWorkspacesMenuOpen(prev => !prev);
    setIsStarredMenuOpen(false);
  }

  const StarredClick = () => {
    if(!isStarredMenuOpen){
      fetchStarredBoards();
    }
    setIsStarredMenuOpen(prev => !prev);
    setIsWorkspacesMenuOpen(false);
  }

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

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-header">
          <button className="header-menu-btn" onClick={TabClick}>
          <img src={LogoIcon} alt="ItRun Logo" className="logo-header"/>
          </button>
          </div>
          {/* <div className="logo-text">
            <button className="header-menu-btn" onClick={TabClick}>
            ItRun
            </button>
          </div> */}
        <nav className="menu">
          <div className='menu-item-drop-down'ref={workspaceMenuRef}>
            <button className="menu-item-btn-drop-down" onClick={WorkspacesClick}>Workspaces ▾</button>
             {isWorkspacesMenuOpen && (
              <div className="dropdown-menu workspaces-dropdown">
                <div className="dropdown-header">Your Workspaces</div>
                {workspaces.length > 0 ? (
                  workspaces.map((workspace) => (
                    <div key={workspace.id} className="dropdown-item" onClick={() => WorkspaceClick(workspace.id)}>
                      <div className="workspace-item-btn-drop-down">
                        {workspace.imageUrl ? (
                          <img src={workspace.imageUrl} alt={workspace.name} className="workspace-icon"/>
                        ) : (
                          <div className="workspace-icon-fallback">
                            {workspace.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="workspace-info">
                          <div className="workspace-name">{workspace.name}</div>
                          {/* <div className="workspace-visibility">
                            {workspace.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                          </div> */}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item-empty">No workspaces found</div>
                )}
              </div>
            )}

            <div className="menu-item-btn-drop-down">Recent ▾</div>
            
            <div className="menu-item-btn-drop-down" ref={starredMuneRef}>
              <button className="menu-item-btn"onClick={StarredClick}>Starred ▾</button>
              {isStarredMenuOpen && (
              <div className="dropdown-menu starred-dropdown">
                <div className="dropdown-header">Starred Boards</div>
                {starredBoards.length > 0 ? (
                  starredBoards.map((board) => (
                    <div key={board.id} className="dropdown-item" onClick={() => StarredBoardClick(board.id)}>
                      <div className="board-item">
                        {board.imageUrl ? (
                          <img src={board.imageUrl} alt={board.name} className="board-icon"/>
                        ) : (
                          <div className="board-icon-fallback">📋</div>
                        )}
                        <div className="board-info">
                          <div className="board-name">{board.name}</div>
                          <div className="board-label">{board.label}</div>
                        </div>
                        <div className="star-icon"><img src={star}/></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item-empty">No starred boards</div>
                )}
              </div>
            )}  
            </div>
            <div className="menu-item-btn-drop-down">Templates ▾</div>
          </div>
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