import React, { useState, useEffect } from 'react';
import Modalwindow from './addWorkspace';
import { getUserWorkspace } from '../Api/api';
import '../Style/addworkspace.css';

type Workspace = {
  id: string;
  name: string;
  imageUrl?: string;
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
};

// Тип пропсов для компонента, включает функцию-обработчик клика по рабочему пространству
type Props = {
  onWorkspaceClick: ( data: { id: string; name: string; imageUrl?: string }) => void;
};

const UserWorkSpace: React.FC<Props> = ({ onWorkspaceClick  }) => {
  const [showModal, setShowModal] = useState(false);
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [guestWorkspaces, setGuestWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setLoading(true);
        const workspaces = await getUserWorkspace();
        setUserWorkspaces(workspaces);
        setGuestWorkspaces([]);
        setError(null);
      } catch (err) {
        console.error('Error loading workspaces:', err);
        setError(err instanceof Error ? err.message : 'Failed to load workspaces');
        setUserWorkspaces([]);
        setGuestWorkspaces([]);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaces();
  }, []);

  const getWorkspaceAvatar = (name: string): string => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const ModalClose = async () => {
    setShowModal(false);
    // Перезагружаем список workspace после создания нового
    try {
      const workspaces = await getUserWorkspace();
      setUserWorkspaces(workspaces);
    } catch (err) {
      console.error('Error reloading workspaces:', err);
    }
  };

  const RefreshPage = () => {
    window.location.reload();
  };
  return (
    <div className="workspace-container">
      <div className="workspace-section">
        <div className='workspace-section-title'>
          <h3 className="section-title">YOUR WORKSPACES</h3>
          <div className="workspace-section-buttons">
            <button className="plus-icon-for-modalwin" onClick={() => setShowModal(true)}>+</button>
            <button className="btn-update-workespace-maim-page" onClick={RefreshPage}>↻</button>
          </div>
        </div>
        <div className="workspace-list">
          {userWorkspaces.length === 0 ? (
            <div className="no-workspaces">
              <p>No workspaces found. Create your first workspace!</p>
            </div>
          ) : (
            userWorkspaces.map((workspace) => (
              <button
                key={workspace.id} 
                className="workspace-item" 
                onClick={() => onWorkspaceClick({id: workspace.id, name: workspace.name, imageUrl: workspace.imageUrl })}>
                <div className="workspace-avatar">
                  {workspace.imageUrl ? (
                    <img src={workspace.imageUrl} alt={workspace.name} />
                  ) : (
                    getWorkspaceAvatar(workspace.name)
                  )}
                </div>
                <span className="workspace-name">{workspace.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Секция гостевых рабочих пространств */}
      {guestWorkspaces.length > 0 && (
        <div className="workspace-section">
          <h3 className="section-title">GUEST WORKSPACES</h3>
          <div className="workspace-list">
            {guestWorkspaces.map((workspace) => (
              <button key={workspace.id} className="workspace-item"
              onClick={() => onWorkspaceClick({id: workspace.id, name: workspace.name, imageUrl: workspace.imageUrl })}>
                <div className="workspace-avatar">
                  {workspace.imageUrl ? (
                    <img src={workspace.imageUrl} alt={workspace.name} />
                  ) : (
                    getWorkspaceAvatar(workspace.name)
                  )}
                </div>
                <span className="workspace-name">{workspace.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <Modalwindow onClose={ModalClose} token={token || ''} /> //closedBy="none" (попытка реализации клика вне рамки модального окна)
      )}
    </div>
  );
};

export default UserWorkSpace;