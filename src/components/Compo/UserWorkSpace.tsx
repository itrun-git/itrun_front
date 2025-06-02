import React, { useState } from 'react';

// Тип описывает структуру объекта рабочего пространства
type Workspace = {
  id: number;
  name: string;
  avatar: string;
};

// Тип пропсов для компонента, включает функцию-обработчик клика по рабочему пространству
type Props = {
  onWorkspaceClick: (workspace: Workspace) => void;
};

// Компонент отображает список рабочих пространств пользователя и гостевых пространств
const UserWorkSpace: React.FC<Props> = ({ onWorkspaceClick }) => {
  // Статически определённые рабочие пространства пользователя
  const userWorkspaces: Workspace[] = [
    { id: 1, name: "Vlad's workspace", avatar: "VL" },
    { id: 2, name: "Vlad's workspace", avatar: "VL" },
    { id: 3, name: "Vlad's workspace", avatar: "VL" }
  ];

  // Статически определённые гостевые рабочие пространства
  const guestWorkspaces: Workspace[] = [
    { id: 4, name: "Vlad's guest", avatar: "VL" },
    { id: 5, name: "Vlad's guest", avatar: "VL" }
  ];

  return (
    <div className="workspace-container">
      <div className="workspace-section">
        <h3 className="section-title">YOUR WORKSPACES</h3>
        <div className="workspace-list">
          {/* Отображаем каждое пользовательское пространство как кнопку */}
          {userWorkspaces.map((workspace) => (
            <button
              key={workspace.id} 
              className="workspace-item" 
              onClick={() => onWorkspaceClick(workspace)} // обработка клика
            >
              <div className="workspace-avatar">{workspace.avatar}</div>
              <span className="workspace-name">{workspace.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Секция гостевых рабочих пространств */}
      <div className="workspace-section">
        <h3 className="section-title">GUEST WORKSPACES</h3>
        <div className="workspace-list">
          {/* Отображаем каждое гостевое пространство как кнопку */}
          {guestWorkspaces.map((workspace) => (
            <button
              key={workspace.id}
              className="workspace-item"
              onClick={() => onWorkspaceClick(workspace)}
            >
              <div className="workspace-avatar">{workspace.avatar}</div>
              <span className="workspace-name">{workspace.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserWorkSpace;
