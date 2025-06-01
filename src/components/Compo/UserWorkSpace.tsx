import React from 'react';

const UserWorkSpace = () => {
  const userWorkspaces = [
    { id: 1, name: "Vlad's workspace", avatar: "VL" },
    { id: 2, name: "Vlad's workspace", avatar: "VL" },
    { id: 3, name: "Vlad's workspace", avatar: "VL" }
  ];

  const guestWorkspaces = [
    { id: 1, name: "Vlad's workspace", avatar: "VL" },
    { id: 2, name: "Vlad's workspace", avatar: "VL" }
  ];

  return (
    <div className="workspace-container">
        <div className="workspace-section">
            <h3 className="section-title">YOUR WORKSPACES</h3>
        <div className="workspace-list">
          {userWorkspaces.map((workspace) => (
            <div key={workspace.id} className="workspace-item">
              <div className="workspace-avatar">
                {workspace.avatar}
              </div>
              <span className="workspace-name">
                {workspace.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="workspace-section">
        <h3 className="section-title">GUEST WORKSPACES</h3>
        <div className="workspace-list">
          {guestWorkspaces.map((workspace) => (
            <div key={workspace.id} className="workspace-item">
              <div className="workspace-avatar">
                {workspace.avatar}
              </div>
              <span className="workspace-name">
                {workspace.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserWorkSpace;