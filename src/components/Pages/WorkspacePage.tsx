import React, { useState } from "react";
import Header from "../Compo/header";
import "../Style/WorkSpace.css";
import WorkSpaceLeftBoard from "../Compo/WorkSpaceLeftBoard";
import LogoIcon from "../Logo/LogoIcon.png";
import leftarrow from "../Logo/leftarrow.png";
import rightarrow from "../Logo/rightarrow.png";
import pen from "../Logo/pen.png";
import blackmember from "../Logo/blackmember.png";
import zamok from "../Logo/zamok.png"

type Workspace = {
  id: number;
  avatar: string;
};

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
  const [activeTab, setActiveTab] = useState("boards");
  const [activeMemberTab, setActiveMemberTab] = useState("workspace");

  const userWorkspaces: Workspace[] = [{ id: 1, avatar: "VL" }];

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

  const bottomBoards1: Template[] = [
    { className: "gray", label: "Marketing board" },
    { className: "pink", label: "Design Sprint" },
    { className: "teal", label: "Content Plan" },
    { className: "orange", label: "Roadmap" },
    { className: "lime", label: "Sprint Goals" },
  ];

  const bottomBoards2: Template[] = [
    { className: "aqua", label: "Bug Tracker" },
    { className: "brown", label: "Hiring Plan" },
    { className: "cyan", label: "Product Dev" },
    { className: "gold", label: "User Research" },
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
      : boards.slice(currentIndex, currentIndex + 4);
    const canScroll = boards.length > 3;

    return (
      <div className="section">
        {title && <h3 className="section-title">{title}</h3>}
        <div className="template-section">
          <div className={`template-scroll ${showAll ? "expanded" : ""} ${isRecent ? "recent-boards" : ""}`}>
            {visibleBoards.map((board, index) => (
              <div
                key={`${sectionKey}-${index}`}
                className={`template-card ${board.className} ${
                  !showAll && index === 3 ? "faded" : ""
                } ${board.isCreateNew ? "create-new-card" : ""}`}
                onClick={() => board.isCreateNew ? createNewBoard() : openTemplateWindow(board.label)}>
                <div className="card-content">
                  {board.label || "Board"}
                  {board.hasIcon && <span className="star-icon">⭐</span>}
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

  const createNewBoard = () => {
    console.log("Creating new board...");
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

      <div className="recent-boards-section">
        <div className="filter-section">
          <select className="filter-dropdown">
            <option>Most recently active</option>
            <option>Alphabetical</option>
            <option>Recently created</option>
          </select>
          <input type="text" placeholder="Search" className="search-input"/>
        </div>

        <BoardSection
          title=""
          boards={recentBoards}
          currentIndex={0}
          showAll={true}
          onToggleShowAll={() => {}}
          onLeft={() => {}}
          onRight={() => {}}
          sectionKey="recent"
          isRecent={true}/>
      </div>
    </>
  );

  const renderMembersContent = () => (
    <div className="members-view">
      <h2>Collaborators</h2>
      <div className="collab-layout">
        <div className="navbar-colabolators-btn">
          <button className={`nvb-cln-btn ${activeMemberTab === "workspace" ? "active" : ""}`} onClick={() => setActiveMemberTab("workspace")}>Workspace members</button>
          <button className={`nvb-cln-btn ${activeMemberTab === "guest" ? "active" : ""}`} onClick={() => setActiveMemberTab("guest")}>Guest</button>
          <button className={`nvb-cln-btn ${activeMemberTab === "requests" ? "active" : ""}`} onClick={() => setActiveMemberTab("requests")}>Join request</button>
        </div>
        <div className="workspace-members-colabolators">
          {activeMemberTab === "workspace" && (
            <>
              <h2>Workspace members</h2>
              <h3 className="und-workspace">workspace</h3>
              <h2>Workspace members</h2>
              <h3 className="und-workspace">workspace</h3>
              <div className="und-input-workspace">
                <input placeholder="Filter by name" />
                <h3 className="Disablelink">Disable invite link</h3>
                <button className="invited-link-btn-workspace-members">invite with link</button>
              </div>
            </>
          )}
          {activeMemberTab === "guest" && (
            <>
              <h2>Guest users</h2>
              <p>Guests can only view and edit the boards to which they’ve been added.</p>
            </>
          )}
          {activeMemberTab === "requests" && (
            <>
              <h2>Join Requests</h2>
              <p>These people have requested to join this Workspace. Adding new Workspace members will automatically update your bill. Workspace guests already count toward the free Workspace collaborator limit</p>
              <div className="und-input-workspace">
                <input placeholder="Filter by name" />
                <h3 className="Disablelink">Disable invite link</h3>
                <button className="invited-link-btn-workspace-members">invite with link</button>
              </div>
              <div className="request-header-controls">
                  <label className="select-all-label">
                  <input type="radio" name="selectALL"/>Selec All
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

      <p className="delete-workspace">Delete this Workspace?</p>
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
                <div className="workspace-icon-card-board">VH</div>
                <div className="workspace-name-private">
                  <div className="workspace-name-leftbar">
                    Vlad's workspace
                    <img src={pen} alt="Edit" className="pen-icon" />
                  </div>
                  <div className="workspace-private-header-menu">
                    <img src={zamok} className="zamok-icon"/> Private
                  </div>
                </div>
                <button className="invite-button">
                  <img src={blackmember} className="pen-icon" />Invite Members
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
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkspacePage;