import React, { useEffect, useState } from "react";
import Header from "../Compo/header";
import "../Style/WorkSpace.css";
import WorkSpaceLeftBoard from "../Compo/WorkSpaceLeftBoard";
import LogoIcon from "../Logo/LogoIcon.png";
import leftarrow from "../Logo/leftarrow.png";
import rightarrow from "../Logo/rightarrow.png";
import pen from "../Logo/pen.png";
import star from "../Logo/star.png";
import delet from "../Logo/exit.png"
import starlight from "../Logo/starlight.png";
import blackmember from "../Logo/blackmember.png";
import zamok from "../Logo/zamok.png"
import AddBoardModal from '../Compo/addBoard';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getUserWorkspace, deleteWorkspace, getWorkspaceBoards, getFavoriteBoards, addBoardToFavorites, removeBoardFromFavorites, getBoardByIdDelete, generateInviteLink, Board, Guest, getWorkspaceGuests, removeGuestFromWorkspace, findUserByEmail, SearchUserResult } from "../Api/api";

type Template = {
  className: string;
  label?: string;
  isCreateNew?: boolean;
  hasIcon?: boolean;
};

const WorkspacePage = () => {
  const [suggestedShowAll, setSuggestedShowAll] = useState(false);
  const [suggestedIndex, setSuggestedIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeMemberTab, ActiveMemberTab] = useState("workspace");
  const [showAddBoardModal, ShowAddBoardModal] = useState(false);
  const [workspaceBoards, WorkspaceBoards] = useState<Board[]>([]);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  const [guest, setGuests] = useState<Guest[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { name?: string; imageUrl?: string } | undefined;

  const { workspaceId, tab } = useParams<{ workspaceId: string; tab?: string }>();

  const [activeTab, setActiveTab] = useState(tab || "boards");
  const [workspaceName, setWorkspaceName] = useState("Loading...");
  const [workspaceImageUrl, setWorkspaceImageUrl] = useState<string | null>(null);

  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);


  const loadGuests = async () => {
    if (!workspaceId) return;
    
    setIsLoadingGuests(true);
    try {
      const guestsData = await getWorkspaceGuests(workspaceId);
      setGuests(guestsData);
    } catch (error) {
      console.error('Error loading guests:', error);
      setGuests([]);
    } finally {
      setIsLoadingGuests(false);
    }
  };

  const RemoveGuest = async (guestId: string, guestName: string) => {
    if (!workspaceId) return;
    
    const confirmRemove = window.confirm(`Are you sure you want to remove ${guestName} from this workspace?`);
    if (!confirmRemove) return;
    
    try {
      await removeGuestFromWorkspace(workspaceId, guestId);
      setGuests(prev => prev.filter(guest => guest.id !== guestId));
      alert(`${guestName} has been removed from the workspace`);
    } catch (error: any) {
      console.error('Error removing guest:', error);
      alert(error.message || 'Failed to remove guest');
    }
  };

    const staticSuggestedBoards: Board[] = [
    { id: 'template-1', className: 'green', label: 'Project Management', isStarred: false, name: ''},
    { id: 'template-2', className: 'blue', label: 'Team Collaboration', isStarred: false, name: '' },
    { id: 'template-3', className: 'darkblue', label: 'Marketing Campaign', isStarred: false, name: ''},
    { id: 'template-4', className: 'purple', label: 'Product Development', isStarred: false, name: '' },
    { id: 'template-5', className: 'navy', label: 'Content Planning', isStarred: false, name: '' },
    { id: 'template-6', className: 'olive', label: 'Event Management', isStarred: false, name: '' },
    { id: 'template-7', className: 'maroon', label: 'Client Relations', isStarred: false, name: '' },
    { id: 'template-8', className: 'green', label: 'Design Sprint', isStarred: false, name: '' },
  ];

  const loadWorkspaceBoard = async (workspaceId: string) => {
    try{
      const boards = await getWorkspaceBoards(workspaceId);
      const favoriteData = await getFavoriteBoards();
      const workspaceTemplates = JSON.parse(localStorage.getItem(`workspaceTemplates_${workspaceId}`) || `[]`);
      const templateBoards = staticSuggestedBoards.filter(template => workspaceTemplates.includes(template.id));
      const boardsWithStars = [...boards, ...templateBoards].map(board => ({
        ...board,
        isStarred: favoriteData.some(fav => fav.id === board.id) || JSON.parse(localStorage.getItem('favoriteTemplates') || '[]').includes(board.id)
      }));
      WorkspaceBoards(boardsWithStars);
    } catch (err) {
      console.error('Error loading workspace boards', err);
      WorkspaceBoards([]);
    }
  };

  const searchUserByEmail = async (email: string) => {
    if (!email.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setIsSearching(true);
    try {
      const user = await findUserByEmail(email);
      setSearchResults([{
        id: user.id,
        email: user.email,
        fullName: user.fullName || 'Unknown User',
        avatarUrl: user.avatarUrl || null
      }]);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching user:', error);
      setSearchResults([]);
      setShowSearchResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  const SearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setSearchEmail(email);
    setTimeout(() => {
      if (email === searchEmail) {
        searchUserByEmail(email);
      }
    }, 500);
  };

  const toggleWorkspaceFavorite = async (index: number) => {
    const board = workspaceBoards[index];
    if (board.id.startsWith('template-')) {
      const favoriteTemplates = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
      if (favoriteTemplates.includes(board.id)) {
        const updatedTemplates = favoriteTemplates.filter((id: string) => id !== board.id);
        localStorage.setItem('favoriteTemplates', JSON.stringify(updatedTemplates));
        WorkspaceBoards(prev => prev.map((b, i) => i === index ? { ...b, isStarred: false } : b));
      } else {
        favoriteTemplates.push(board.id);
        localStorage.setItem('favoriteTemplates', JSON.stringify(favoriteTemplates));
        WorkspaceBoards(prev => prev.map((b, i) => i === index ? { ...b, isStarred: true } : b));
      }
    } else {
      try {
        if (board.isStarred) {
          await removeBoardFromFavorites(board.id);
          WorkspaceBoards(prev => prev.map((b, i) => i === index ? { ...b, isStarred: false } : b));
        } else {
          await addBoardToFavorites(board.id);
          WorkspaceBoards(prev => prev.map((b, i) => i === index ? { ...b, isStarred: true } : b));
        }
      } catch (err) {
        console.error('Error toggling workspace favorite:', err);
      }
    }
  };

  const DeleteBoard = async (boardId: string) => {
    const confirmDelete = window.confirm("Are you sure to delete this board?");
    if (!confirmDelete) return;
    try{
      await getBoardByIdDelete(boardId);
      WorkspaceBoards(prev => prev.filter(board => board.id !== boardId));
      console.log("Board deleted successfully");
    }catch(error: any){
      console.error("Error delete board:", error);
      alert(error.message || "Failde to delete");
    }
  };

  const InviteMembers = async () => {
    if (!workspaceId) return;
    setIsGeneratingInvite(true);
    try {
      const { inviteLink } = await generateInviteLink(workspaceId);
      setInviteLink(inviteLink);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteLink);
        alert("Link copied to clipboard!");
      } else {
        prompt("Copy link", inviteLink);
      }
    } catch (err) {
      console.error("Error generating invite link:", err);
      alert("Error generate link or login");
    } finally {
      setIsGeneratingInvite(false);
    }
  };


  const getWorkspaceInitials = (name: string): string => {
  return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const BoardCreated = () => {
    if (workspaceId) {
      loadWorkspaceBoard(workspaceId);
    }
  };

  useEffect(() => {
    async function fetchWorkspace() {
      if (!workspaceId) return;
      try {
        const workspaces = await getUserWorkspace();
        const currentWorkspace = workspaces.find(ws => ws.id === workspaceId);
        if (currentWorkspace) {
          setWorkspaceName(currentWorkspace.name ?? "Unnamed Workspace");
          setWorkspaceImageUrl(currentWorkspace.imageUrl ?? null);
          loadWorkspaceBoard(workspaceId);
        }
      } catch (error) {
        console.error("Error fetching workspace:", error);
        setWorkspaceName("Workspace not found");
      }
    }
    fetchWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    if (activeMemberTab === "guest" && workspaceId) {
      loadGuests();
    }
  }, [activeMemberTab, workspaceId]);

  const DeleteWorkspace  = async () => {
    if(!workspaceId) 
      return;
    const confiremDelete = window.confirm("Are you sure you want to delete this workspace?");
    if(!confirm) 
      return;
    try{
      await deleteWorkspace(workspaceId)
      navigate("/main");
    }catch (error: any){
      console.log(error.message || "failed");
    }
  };

  const templates: Template[] = [
    { className: "green", label: "Basic Board" },
    { className: "blue" },
    { className: "darkblue" },
    { className: "purple" },
    { className: "navy" },
    { className: "olive" },
    { className: "maroon" },
  ];

  const recentBoards: Template[] = [
    { className: "create-new", label: "Create new board", isCreateNew: true },
    { className: "green", label: "Basic Board", hasIcon: true },
  ];

  const scrollByArrow = (
    direction: number,
    index: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    listLength: number
  ) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex <= listLength - 4) {
      setter(newIndex);
    }
  };

  const BoardSection = ({
    title,
    boards,
    currentIndex,
    showAll,
    onToggleShowAll,
    onLeft,
    onRight,
    sectionKey,
    isRecent = false,
  }: {
    title: string;
    boards: Template[];
    currentIndex: number;
    showAll: boolean;
    onToggleShowAll: () => void;
    onLeft: () => void;
    onRight: () => void;
    sectionKey: string;
    isRecent?: boolean;
  }) => {
    const visibleBoards = showAll
      ? boards
      : boards.slice(currentIndex, currentIndex + 5);
    const canScroll = boards.length > 4;

    return (
      <div className="section">
        {title && <h3 className="section-title">{title}</h3>}
        <div className="template-section">
          <div className={`template-scroll ${showAll ? "expanded" : ""} ${isRecent ? "recent-boards" : ""}`}>
            {visibleBoards.map((board, index) => (
              <div key={`${sectionKey}-${index}`} className={`template-card-workspace ${board.className} ${
                  !showAll && index === 3 ? "faded" : ""
                } ${board.isCreateNew ? "create-new-card" : ""}`}
                onClick={() => board.isCreateNew ? ShowAddBoardModal(true) : openTemplateWindow(board.label)}>
                <div className="card-content">
                  {board.label || "Board"}
                  {board.hasIcon && <span className="star-icon"><img src={starlight}></img></span>}
                </div>
              </div>
            ))}
          </div>

          {canScroll && !isRecent && (
            <div className="controls-container">
              <div className="left-block">
                <button className="show-all-btn" onClick={onToggleShowAll}>
                  {showAll ? "Hide All" : "Open all"}
                </button>
              </div>

              {!showAll && (
                <div className="center-buttons">
                  <button className="arrow-btn" onClick={onLeft}>
                    <img src={leftarrow} alt="Left Arrow" />
                  </button>
                  <button className="arrow-btn" onClick={onRight}>
                    <img src={rightarrow} alt="Right Arrow" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  const openTemplateWindow = (label?: string) => {
    if (label) setSelectedTemplate(label);
  };
  const closeTemplateWindow = () => {
    setSelectedTemplate(null);
  };
  const renderBoardsContent = () => (
    <>
      <div className="suggested-templates">
        <div className="header-row">
          <div className="header-left">
            <img src={LogoIcon} alt="ItRun Logo" className="logo" />
            <h2>Suggested templates</h2>
          </div>
        </div>
        <p className="subtext">Get going faster with a template from itRun community</p>
        <BoardSection title="" boards={templates} currentIndex={suggestedIndex} showAll={suggestedShowAll}
          onToggleShowAll={() => setSuggestedShowAll(!suggestedShowAll)}
          onLeft={() => scrollByArrow(-1, suggestedIndex, setSuggestedIndex, templates.length)}
          onRight={() => scrollByArrow( 1, suggestedIndex, setSuggestedIndex, templates.length)}
          sectionKey="suggested"/>
      </div>
       {/* Реальные доски */}
      <div className="workspace-boards-section">
        <div className="filter-section">
          <select className="filter-dropdown">
            <option>Most recently active</option>
            <option>TEST1</option>
            <option>TEST2</option>
          </select>
          <input type="text" placeholder="Search" className="search-input"/>
        </div>
        <div className="workspace-content">
          {workspaceBoards.map((board, index) => (
            <div className="board-item-workspace" key={board.id}>
              <div className={`board-preview ${board.className || 'basic-board'}`}>
                {board.imageUrl && (
                  <img src={board.imageUrl} alt={board.label || board.name} />
                )}
                <span className="star-icon" onClick={() => toggleWorkspaceFavorite(index)}>
                  <img src={board.isStarred ? starlight : star} alt="Star" />
                </span>
              </div>
              <div className="board-info-workspace">
                <span className="board-name-workspace">{board.label || board.name}</span>
                {!board.id.startsWith('template') && (
                  <button className="delete-board-btn" onClick={(e) => { e.stopPropagation(); DeleteBoard(board.id);}}title="Delete board">
                    <img src={delet}></img>
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="board-item create-new" onClick={() => ShowAddBoardModal(true)}>
            <div className="board-preview create-board">
              <span className="plus-icon">+</span>
            </div>
            <span className="board-name">Create new board</span>
          </div>
        </div>
      </div>
    </>
  );
   const renderMembersContent = () => (
    <div className="members-view">
      <h2>Collaborators</h2>
      <div className="collab-layout">
        <div className="navbar-colabolators-btn">
          <button className={`nvb-cln-btn ${activeMemberTab === "workspace" ? "active" : ""}`} onClick={() => ActiveMemberTab("workspace")}>Workspace members</button>
          <button className={`nvb-cln-btn ${activeMemberTab === "guest" ? "active" : ""}`} onClick={() => ActiveMemberTab("guest")}>Guest</button>
          <button className={`nvb-cln-btn ${activeMemberTab === "requests" ? "active" : ""}`} onClick={() => ActiveMemberTab("requests")}>Join request</button>
        </div>
        <div className="workspace-members-colabolators">
          {activeMemberTab === "workspace" && (
            <>
              <h2>Workspace members</h2>
              <h3 className="und-workspace">workspace</h3>
              <h2>Workspace members</h2>
              <h3 className="und-workspace">workspace</h3>
              <div className="und-input-workspace">
                <div className="search-container">
                  <input placeholder="Search by email" value={searchEmail} onChange={SearchInputChange}/>
                  {isSearching && <div className="search-loading">Searching...</div>}
                  {showSearchResults && (
                  <div className="search-results">
                    {searchResults.length > 0 ? (
                    searchResults.map(user => (
                    <div key={user.id} className="search-result-item">
                      <div className="user-avatar">
                        {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} />
                        ) : (
                        <div className="avatar-initials">
                          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                        )}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.fullName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      <button className="invite-user-btn">Invite</button>
                    </div>
                    ))
                    ) : (
                    <div className="no-results">No users found</div>
                    )}
                  </div>
                  )}
                  </div>
                  <h3 className="Disablelink">Disable invite link</h3>
                  <button className="invited-link-btn-workspace-members" onClick={InviteMembers} disabled={isGeneratingInvite}>
                    {isGeneratingInvite ? "Generating..." : "invite with link"}
                  </button>
                </div>
            </>
          )}
          {activeMemberTab === "guest" && (
            <>
              <h2>Guest users</h2>
              <p>Guests can only view and edit the boards to which they've been added.</p>
              
              {isLoadingGuests ? (
                <div className="loading-guests">Loading guests...</div>
              ) : guest.length === 0 ? (
                <div className="no-guests">
                  <p>No guests in this workspace yet.</p>
                </div>
              ) : (
                <div className="guest-list">
                  {guest.map((guest) => (
                    <div key={guest.id} className="guest-item">
                      <div className="guest-info">
                        <div className="guest-avatar">
                          {guest.avatarUrl ? (
                            <img src={guest.avatarUrl} alt={guest.name} className="avatar-image" />
                          ) : (
                            <div className="avatar-initials-guest">
                              {guest.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="guest-details">
                          <div className="guest-name">{guest.name}</div>
                          <div className="guest-email">{guest.email}</div>
                          <div className="guest-joined">
                            Joined: {new Date(guest.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button className="remove-guest-btn" onClick={() => RemoveGuest(guest.id, guest.name)} title="Remove guest">
                        <img src={delet} alt="Remove" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {activeMemberTab === "requests" && (
            <>
              <h2>Join Requests</h2>
              <p>These people have requested to join this Workspace. Adding new Workspace members will automatically update your bill. Workspace guests already count toward the free Workspace collaborator limit</p>
              <div className="und-input-workspace">
                <div className="search-container">
                  <input placeholder="Search by email" value={searchEmail} onChange={SearchInputChange}/>
                  {isSearching && <div className="search-loading">Searching...</div>}
                  {showSearchResults && (
                  <div className="search-results">
                    {searchResults.length > 0 ? (
                    searchResults.map(user => (
                    <div key={user.id} className="search-result-item">
                      <div className="user-avatar">
                        {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} />
                        ) : (
                        <div className="avatar-initials">
                          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                        )}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.fullName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      <button className="invite-user-btn">Invite</button>
                    </div>
                    ))
                    ) : (
                    <div className="no-results">No users found</div>
                    )}
                  </div>
                  )}
                  </div>
                  <h3 className="Disablelink">Disable invite link</h3>
                  <button className="invited-link-btn-workspace-members" onClick={InviteMembers} disabled={isGeneratingInvite}>
                    {isGeneratingInvite ? "Generating..." : "invite with link"}
                  </button>
                  <h3 className="Disablelink">Disable invite link</h3>
                  <button className="invited-link-btn-workspace-members" onClick={InviteMembers} disabled={isGeneratingInvite}>
                    {isGeneratingInvite ? "Generating..." : "invite with link"}
                  </button>
                </div>
                <div className="request-header-controls">
                  <label className="select-all-label">
                  <input type="radio" name="selectALL"/>Select All
                </label>
                <div className="request-btn">
                 <button className="accept-btn">Accept</button>
                  <button className="decline-btn">Decline</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
  const renderSettingsContent = () => (
  <div className="settings-view">
    <hr className="settings-divider" />

    <div className="workspace-settings-block">
      <h2>Workspace settings</h2>
      <h3 className="und-workspace">Workspace visibility</h3>

      <div className="workspace-visibility-section">
        <p className="visibility-text">
          <img src={zamok}/> <b>Private</b> – This Workspace is private. It’s not indexed or visible to those outside the Workspace.
        </p>
        <button className="change-btn">Change</button>
      </div>

      <button className="delete-workspace" onClick={DeleteWorkspace}>Delete this Workspace?</button>
    </div>
  </div>
);


  const renderViewsContent = () => (
    <div className="views-section">
      <h2>Workspace Views</h2>
      <div className="views-grid">
        <div className="view-card">
          <h3>Table View</h3>
          <p>View all boards in a table format</p>
        </div>
        <div className="view-card">
          <h3>Calendar View</h3>
          <p>See all activities in calendar format</p>
        </div>
        <div className="view-card">
          <h3>Timeline View</h3>
          <p>Track project progress over time</p>
        </div>
        <div className="view-card">
          <h3>Dashboard View</h3>
          <p>Overview of all workspace metrics</p>
        </div>
      </div>
    </div>
  );

  const renderActiveContent = () => {
    switch (activeTab) {
      case "boards":
        return renderBoardsContent();
      case "members":
        return renderMembersContent();
      case "settings":
        return renderSettingsContent();
      case "views":
        return renderViewsContent();
      default:
        return renderBoardsContent();
    }
  };

  return (
    <>
      <div className="workspace-body">
        <Header />
        <div className="main-contentboard">
          <div className="workspacepage">
            <WorkSpaceLeftBoard activeTab={activeTab} setActiveTab={setActiveTab}/>
            <div className="central-sideboard">
              <div className="workspace-header-place">
                <div className="workspace-icon-card-board">{workspaceImageUrl ? (
                  <img src={workspaceImageUrl} alt={workspaceName} />
                  ) : (workspaceName
                  .split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2)
                  )}</div>
                <div className="workspace-name-private">
                  <div className="workspace-name-leftbar">
                    {workspaceName}
                    <img src={pen} alt="Edit" className="pen-icon" />
                  </div>
                  <div className="workspace-private-header-menu">
                    <img src={zamok} className="zamok-icon"/> Private
                  </div>
                </div>
                <button className="invite-button" onClick={InviteMembers} disabled={isGeneratingInvite}>
                  <img src={blackmember} className="pen-icon" />
                  {isGeneratingInvite ? "Generating..." : "Invite Members"}
                </button>
              </div>
              <div className="tab-content">
                {renderActiveContent()}
              </div>
            </div>
            {selectedTemplate && (
              <div className="template-window">
                <div className="template-window-content">
                  <span className="close-window" onClick={closeTemplateWindow}>
                    ✕
                  </span>
                  <h2>{selectedTemplate}</h2>
                  <p>This is a detailed description for the selected template.</p>
                </div>
              </div>
            )}
            {showAddBoardModal && workspaceId && (
              <AddBoardModal workspaceId={workspaceId} onClose={() => ShowAddBoardModal(false)}onBoardCreated={BoardCreated} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkspacePage;