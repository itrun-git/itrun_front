import React from "react";
import settings from "../Logo/settings.png";
import spisok from "../Logo/spisok.png";
import member from "../Logo/member.png";
import board from "../Logo/board.png";
import "../Style/LeftNavbarMenu.css";
import { useNavigate } from "react-router-dom";

interface WorkSpaceLeftBoardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const WorkSpaceLeftBoard: React.FC<WorkSpaceLeftBoardProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div className="left-sidebar">
      <div className="workspace-header">
        <div className="avatar">VH</div>
        <div className="workspace-name">
          <p className="name">Vlad Holubov's workspace</p>
        </div>
      </div>

      <div className="nav-section">
        <div className={`nav-item ${activeTab === "boards" ? "active" : ""}`} onClick={() => setActiveTab("boards")}>
          <img src={board} alt="Boards" />
          Boards
        </div>
        <div className={`nav-item ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>
          <img src={member} alt="Members" />
          Members
        </div>
        <div className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
          <img src={settings} alt="Settings" />
          Settings
        </div>

        <div className="boards-section">
            <div className="boards-header">
              <p>YOUR BOARDS</p>
              <div className="plus-icon"/>
            </div>
            <div className="board-item" onClick={() => navigate("/boardpage")}>
              <div className="board-color"/>
              Plans
              <div className="star-icon"/>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WorkSpaceLeftBoard;