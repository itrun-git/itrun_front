import React, {useEffect, useState} from "react";
import settings from "../Logo/settings.png";
import spisok from "../Logo/spisok.png";
import member from "../Logo/member.png";
import board from "../Logo/board.png";
import star from "../Logo/star.png";
import starlight from "../Logo/starlight.png";
import "../Style/LeftNavbarMenu.css";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkspaceBoards, getUserWorkspace, Board, WorkspaceData, addBoardToFavorites, removeBoardFromFavorites, getFavoriteBoards } from '../Api/api';

interface WorkSpaceLeftBoardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  workspaceData?: WorkspaceData | null;
  workspaceBoards?: Board[];
  onBoardsUpdate?: () => void;
}

const WorkSpaceLeftBoard: React.FC<WorkSpaceLeftBoardProps> = ({ activeTab, setActiveTab, workspaceData: externalWorkspaceData,
  workspaceBoards: externalWorkspaceBoards, onBoardsUpdate }) => {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspaceData, setworkspaceData] = useState<WorkspaceData | null>(externalWorkspaceData || null);
  const [boards, setBoards] = useState<Board[]>(externalWorkspaceBoards || []);
  const [favoriteBoards, setFavoriteBoards] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);

  const getWorkspaceInitials = (name: string): string => {
    return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  };

  const loadWorkspaceData = async () => {
    if (!workspaceId || externalWorkspaceData) return;
    try{
      const workspaces = await getUserWorkspace();
      const currentWorkspace = workspaces.find(ws => ws.id === workspaceId);
      if(currentWorkspace){
        setworkspaceData({
          id: currentWorkspace.id,
          name: currentWorkspace.name,
          imageUrl: currentWorkspace.imageUrl
        });
      }
    }catch(error){
      console.error(`Error loading workspace`, error);
    }
  };

  const loadWorkspaceBoards = async () =>{
    if(!workspaceId || externalWorkspaceBoards)return;
    try{
      const worksapceBoards = await getWorkspaceBoards(workspaceId);
      const favorites = await getFavoriteBoards();
      const favoriteIds = favorites.map(fav => fav.id);
      const boardsWithFavorites = worksapceBoards.map(board => ({
        ...board, isStarred: favoriteIds.includes(board.id)
      }));
      setBoards(boardsWithFavorites);
      setFavoriteBoards(favoriteIds);
    }catch (error){
      console.error('Error load workspace board:',error);
    }
  };

  const toggleBoardFavorite = async (boardId: string, isCurrentlyStarred: boolean) => {
    try{
      if(isCurrentlyStarred){
        await removeBoardFromFavorites(boardId);
      }else{
        await addBoardToFavorites(boardId);
      }
      setBoards(prevBoards =>
        prevBoards.map(board =>
          board.id === boardId ? {...board, isStarred: !isCurrentlyStarred}: board)
      )
      if (onBoardsUpdate){
        onBoardsUpdate();
      }
    }catch(error){
      console.error('Error toggling board favorite:', error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    loadWorkspaceData();
    loadWorkspaceBoards();
  }, [workspaceId]);

  useEffect(() =>{
    if(externalWorkspaceData){
      setworkspaceData(externalWorkspaceData);
    }
  }, [externalWorkspaceData]);

    useEffect(() =>{
    if(externalWorkspaceBoards){
      setBoards(externalWorkspaceBoards);
      setImageError(false);
    }
  }, [externalWorkspaceBoards]);

  const navigateToBoard = (boardId: string) => {
    //navigate(`/boardpage/`);
    navigate(`/workspace/${workspaceId}/boardpage/${boardId}`); 
    console.log( 'Navigate to board:', boardId);
  }
  return (
    <div className="left-sidebar">
      <div className="workspace-header">
        <div className="avatar">
          {workspaceData?.imageUrl ? (
            <img src={workspaceData.imageUrl} alt="workspace Avatar" className="workspace-avatar-image-left-bar" onError={handleImageError}/>) : null}
            <span className={`workspace-initials ${workspaceData?.imageUrl && !imageError ? 'hidden' : ''}`}>
            {workspaceData ? getWorkspaceInitials(workspaceData.name) : 'WS'}
          </span>
        </div>
        <div className="workspace-name">
          <p className="name">{workspaceData ? workspaceData.name : 'Load...'}</p>
        </div>
      </div>

      <div className="nav-section">
        <div className={`nav-item ${activeTab === "boards" ? "active" : ""}`} onClick={() => setActiveTab("boards")}>
          <img src={board} alt="Boards"/>
          Boards
        </div>
        <div className={`nav-item ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>
          <img src={member} alt="Members"/>
          Members
        </div>
        <div className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
          <img src={settings} alt="Settings"/>
          Settings
        </div>
        <div className="boards-section">
            <div className="boards-header">
              <p>YOUR BOARDS</p>
              <div className="plus-icon"/>
            </div>
          {boards.length > 0 ? (
            boards.map((board) => (
              <div key={board.id} className="board-item-btn-left-bar" onClick={() => navigateToBoard(board.id)} >
                  <div className="board-left-navbar-group">
                    <div className={`board-color ${board.className || 'default-board-color'}`} />
                      <span className="board-name">{board.name || board.label || 'Untitled Board'}</span>
                    </div>
                      <div className="star-icon-left-bar" onClick={(e) => { e.stopPropagation();
                        toggleBoardFavorite(board.id, board.isStarred || false);
                      }}>
                      <img src={board.isStarred ? starlight : star} alt="Star" />
                  </div>
                </div>
              )
            )
          ) : (
            <div className="no-boards-message">
              <p>No boards yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default WorkSpaceLeftBoard;