import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Header from '../Compo/header';
import UserWorkSpace from '../Compo/UserWorkSpace';
import AddBoardModal from '../Compo/addBoard';
import '../Style/MainFrom.css';
import LogoIcon from "../Logo/LogoIcon.png";
import LogoIconl from "../Logo/logoItRun.png";
import home from "../Logo/home.png";
import table from "../Logo/table.png";
import leftarrow from "../Logo/leftarrow.png";
import rightarrow from "../Logo/rightarrow.png";
import timer from "../Logo/timer.png";
import star from "../Logo/star.png";
import starlight from "../Logo/starlight.png";
import settings from "../Logo/settings.png";
import spisok from "../Logo/spisok.png";
import member from "../Logo/member.png";
import board from "../Logo/board.png";
import { getFavoriteBoards, addBoardToFavorites, removeBoardFromFavorites, getRecentBoards, getUserBoards, getWorkspaceBoards, Board, getUserWorkspace, WorkspaceData} from '../Api/api';

const MainForm = () => {
  // Основные шаблоны (Suggested)
  const [suggestedShowAll, setSuggestedShowAll] = useState<boolean>(false);
  const [suggestedIndex, setSuggestedIndex] = useState<number>(0);
  const [userBoards, setUserBoards] = useState<Board[]>([]);

  // Избранные доски
  const [starredShowAll, setStarredShowAll] = useState<boolean>(false);
  const [starredIndex, setStarredIndex] = useState<number>(0);

  // Недавние доски
  const [recentShowAll, setRecentShowAll] = useState<boolean>(false);
  const [recentIndex, setRecentIndex] = useState<number>(0);

  const [showCentralBoard, setShowCentralBoard] = useState<boolean>(true);
  const [showWorkspaceBoard, setShowWorkspaceBoard] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showAddBoardModal, setShowAddBoardModal] = useState<boolean>(false);

  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState<string>('My Workspace');
  const [selectedWorkspaceImage, setSelectedWorkspaceImage] = useState<string | undefined>(undefined);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [workspaceBoards, setWorkspaceBoards] = useState<Board[]>([]);

  const [showWorkspaceModal, setShowWorkspaceModal] = useState<boolean>(false);
  const [selectedBoardToAdd, setSelectedBoardToAdd] = useState<Board | null>(null);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceData[]>([]);
  const navigate = useNavigate();
  const TabClick = (tab: string) => {
    if(selectedWorkspaceId){
      navigate(`/workspace/${selectedWorkspaceId}/${tab}`);
    } else {
      console.warn(`No workspace`);
    }
  };
  // Статические шаблоны
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
  const [starredBoards, setStarredBoard] = useState<Board[]>([]);
  const [recentBoards, setRecentBoards] = useState<Board[]>([]);
  const loadData = async () => {
    try {
      const userBoardsData = await getUserBoards();
      setUserBoards(userBoardsData);
      const favoriteData = await getFavoriteBoards();
      const favoriteTemplates = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
      const favoriteTemplateBoards = staticSuggestedBoards
        .filter(template => favoriteTemplates.includes(template.id))
        .map(template => ({ ...template, isStarred: true }));
      setStarredBoard([
        ...favoriteData.map(board => ({ ...board, isStarred: true })),
        ...favoriteTemplateBoards
      ]);
      const recentData = await getRecentBoards();
      setRecentBoards(recentData);
    } catch (err) {
      console.error('Error loading data', err);
    }
  };
  
  const loadWorkspaceBoards = async (workspaceId: string) => {
    try {
      const boards = await getWorkspaceBoards(workspaceId);
      const favoriteData = await getFavoriteBoards();
      const workspaceTemplates = JSON.parse(localStorage.getItem(`workspaceTemplates_${workspaceId}`) || '[]');
      const templateBoards = staticSuggestedBoards.filter(template => 
        workspaceTemplates.includes(template.id)
      );
      const boardsWithStars = [...boards, ...templateBoards].map(board => ({
        ...board,
        isStarred: favoriteData.some(fav => fav.id === board.id) || JSON.parse(localStorage.getItem('favoriteTemplates') || '[]').includes(board.id)
      }));
      setWorkspaceBoards(boardsWithStars);
    } catch (err) {
      console.error('Error loading workspace boards', err);
      setWorkspaceBoards([]);
    }
  };

  const loadAvailableWorkspaces = async () => {
    try{
      const workspaces = await getUserWorkspace();
      const workspaceData: WorkspaceData[] = workspaces.map(workspace => ({
        id: workspace.id,
        name: workspace.name,
        imageUrl: workspace.imageUrl
      }));
      setAvailableWorkspaces(workspaceData);
    }catch(err){
      console.error('Error loading workspace boards', err);
      setAvailableWorkspaces;
    }
  };

  useEffect(() => {
    loadData();
    loadAvailableWorkspaces();
  }, []);
  useEffect(() => {
    if (selectedWorkspaceId) {
      loadWorkspaceBoards(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);
  const AddToWorkspace = (board: Board) => {
    setSelectedBoardToAdd(board);
    setShowWorkspaceModal(true);
  };
  const addTemplateToWorkspace = (workspaceId: string) => {
    if (!selectedBoardToAdd) return;
    const storageKey = `workspaceTemplates_${workspaceId}`;
    const existingTemplates = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!existingTemplates.includes(selectedBoardToAdd.id)) {
      existingTemplates.push(selectedBoardToAdd.id);
      localStorage.setItem(storageKey, JSON.stringify(existingTemplates));
      if (workspaceId === selectedWorkspaceId) {
        loadWorkspaceBoards(workspaceId);
      }
    }
    setShowWorkspaceModal(false);
    setSelectedBoardToAdd(null);
  };

  const StarredFromSuggested = (index: number) => {
    const board = staticSuggestedBoards[index];
    const favoriteTemplates = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
    if (favoriteTemplates.includes(board.id)) {
      const updatedTemplates = favoriteTemplates.filter((id: string) => id !== board.id);
      localStorage.setItem('favoriteTemplates', JSON.stringify(updatedTemplates));
      setStarredBoard(prev => prev.filter(b => b.id !== board.id));
    } else {
      favoriteTemplates.push(board.id);
      localStorage.setItem('favoriteTemplates', JSON.stringify(favoriteTemplates));
      setStarredBoard(prev => [...prev, { ...board, isStarred: true }]);
    }
    staticSuggestedBoards[index].isStarred = !staticSuggestedBoards[index].isStarred;
  };
  const Starred = async (index: number) => {
    const board = starredBoards[index];
    if (board.id.startsWith('template-')) {
      const favoriteTemplates = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
      const updatedTemplates = favoriteTemplates.filter((id: string) => id !== board.id);
      localStorage.setItem('favoriteTemplates', JSON.stringify(updatedTemplates));
      setStarredBoard(prev => prev.filter((_, i) => i !== index));
    } else {
      try {
        await removeBoardFromFavorites(board.id);
        setStarredBoard(prev => prev.filter((_, i) => i !== index));
      } catch (err) {
        console.error('Error toggling favorite:', err);
      }
    }
  };

  const WorkspaceStarred = async (index: number) => {
    const board = workspaceBoards[index];
    
    if (board.id.startsWith('template-')) {
      const favoriteTemplates = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
      
      if (favoriteTemplates.includes(board.id)) {
        const updatedTemplates = favoriteTemplates.filter((id: string) => id !== board.id);
        localStorage.setItem('favoriteTemplates', JSON.stringify(updatedTemplates));
        setWorkspaceBoards(prev => prev.map((b, i) => i === index ? { ...b, isStarred: false } : b));
        setStarredBoard(prev => prev.filter(b => b.id !== board.id));
      } else {
        favoriteTemplates.push(board.id);
        localStorage.setItem('favoriteTemplates', JSON.stringify(favoriteTemplates));
        setWorkspaceBoards(prev => prev.map((b, i) => i === index ? { ...b, isStarred: true } : b));
        setStarredBoard(prev => [...prev, { ...board, isStarred: true }]);
      }
    } else {
      try {
        if (board.isStarred) {
          await removeBoardFromFavorites(board.id);
          setWorkspaceBoards(prev => prev.map((b, i) => i === index ? { ...b, isStarred: false } : b));
          setStarredBoard(prev => prev.filter(b => b.id !== board.id));
        } else {
          await addBoardToFavorites(board.id);
          setWorkspaceBoards(prev => prev.map((b, i) => i === index ? { ...b, isStarred: true } : b));
          setStarredBoard(prev => [...prev, { ...board, isStarred: true }]);
        }
      } catch (err) {
        console.error('Error toggling workspace favorite:', err);
      }
    }
  };

  // Прокрутка для каждой секции
  const scrollByArrow = (direction: number, index: number, setter: React.Dispatch<React.SetStateAction<number>>, listLength: number) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex <= listLength - 4) {
      setter(newIndex);
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
    loadData();
    if (selectedWorkspaceId) {
      loadWorkspaceBoards(selectedWorkspaceId);
    }
  };

  const getSuggestedBoardsWithStarStatus = () => {
    const favoriteTemplates = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
    return staticSuggestedBoards.map(board => ({
      ...board,
      isStarred: favoriteTemplates.includes(board.id)
    }));
  };

  // Универсальный компонент секции с досками
  const BoardSection = ({
    image,
    title,
    boards,
    currentIndex,
    showAll,
    onShowAll,
    onLeft,
    onRight,
    sectionKey,
  }: {
    image?: string;
    title: string;
    boards: Board[];
    currentIndex: number;
    showAll: boolean;
    onShowAll: () => void;
    onLeft: () => void;
    onRight: () => void;
    sectionKey: string;
  }) => {
    const visibleBoards = showAll ? boards : boards.slice(currentIndex, currentIndex + 4);
    const canScroll = boards.length > 3;

    return (
      <div className="section">
        <div className="board-section-header">
          {image && <img src={image} alt="section icon" className="board-section-image" />}
          <h2 className="board-section-title">{title}</h2>
        </div>
        <div className="template-section">
          <div className={`template-scroll ${showAll ? 'expanded' : ''}`}>
            {visibleBoards.map((board, index) => (
              <div className={`template-card ${board.className} ${!showAll && index === 3 ? 'faded' : ''}`}
                key={`${sectionKey}-${index}`}>
                  {board.imageUrl && (
                    <img src={board.imageUrl} alt={board.label} className="board-image"/>
                  )}
                  <div className='card-content-tmp'>
                    {board.label || 'Board'}
                    <div className="add-temp-card">
                      {sectionKey === 'suggested' && (
                        <>
                          <button className="add-btn-card-tmp" onClick={() => AddToWorkspace(board)} title="Add to workspace">+ </button>
                          <img src={board.isStarred ? starlight : star} alt="star" className='star-icon-content' onClick={() => StarredFromSuggested(currentIndex + index)}/>
                        </>
                      )}
                      {sectionKey === 'starred' && (
                        <img src={board.isStarred ? starlight : star} alt="star" className='star-icon-content' onClick={() => Starred(currentIndex + index)}/>
                      )}
                    </div>
                  </div>
              </div>
            ))}
          </div>

          {canScroll && (
           <div className="controls-container">
            <div className="left-block">
              <button className="show-all-btn" onClick={onShowAll}>
              {showAll ? 'Hide All' : 'Open all'}
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

  const CloseBoard = () => setShowCentralBoard(false);
  const HiddenBoard = () => setShowCentralBoard(false);
  const ItRunClick = () => {
    setShowCentralBoard(true);
    setShowWorkspaceBoard(false);
  };
  const WorkspaceClick = () => {
    setShowWorkspaceBoard(true);
    setShowCentralBoard(false);
  };
  const openTemplateWindow = (label?: string) => label && setSelectedTemplate(label);
  const closeTemplateWindow = () => setSelectedTemplate(null);

  return (
    <div className="main-page">
      <Header />
      <div className="main-content">
        <div className="left-side">
          <div className="navigation-block">
            <button className="btn-grp active" onClick={ItRunClick}>
              <span className="btn-icon-logo"><img src={LogoIcon} alt="ItRun Logo" className='btnleftside'/></span>
              Run
            </button>
            <button className="btn-grp">
              <span className="btn-icon"><img src={table} alt="Table" className='btnleftside'/></span>
              Templates
            </button>
            <button className="btn-grp">
              <span className="btn-icon"><img src={home} alt="Home" className='btnleftside'/></span>
              Home
            </button>
          </div>
          <div className="workspace-block">
            <UserWorkSpace onWorkspaceClick={(data: WorkspaceData) => { 
              WorkspaceClick(); 
              setSelectedWorkspaceName(data.name); 
              setSelectedWorkspaceImage(data.imageUrl); 
              setSelectedWorkspaceId(data.id);
            }}/>
          </div>
        </div>

        {showCentralBoard && (
          <div className="central-side">
            {/* Suggested Templates */}
            <div className="suggested-templates">
              <div className="header-row">
                <div className="header-left">
                  <img src={LogoIconl} alt="ItRun Logo" className="logo-workspace-page"/>
                  <h2>Suggested templates</h2>
                </div>
                <button className="close-button" onClick={CloseBoard}>X</button>
              </div>
              <p className="subtext">Get going faster with a template from itRun community</p>

              <BoardSection 
                title="" 
                boards={getSuggestedBoardsWithStarStatus()} 
                currentIndex={suggestedIndex} 
                showAll={suggestedShowAll}
                onShowAll={() => setSuggestedShowAll(!suggestedShowAll)}
                onLeft={() => scrollByArrow(-1, suggestedIndex, setSuggestedIndex, staticSuggestedBoards.length)}
                onRight={() => scrollByArrow(1, suggestedIndex, setSuggestedIndex, staticSuggestedBoards.length)}
                sectionKey="suggested"
              />
            </div>

            {/* Starred Boards */}
            <div className="starred-boards">
              <BoardSection image={star} title="Starred boards" boards={starredBoards} currentIndex={starredIndex} showAll={starredShowAll}
                onShowAll={() => setStarredShowAll(!starredShowAll)}
                onLeft={() => scrollByArrow(-1, starredIndex, setStarredIndex, starredBoards.length)}
                onRight={() => scrollByArrow(1, starredIndex, setStarredIndex, starredBoards.length)}
                sectionKey="starred"/>
            </div>

            {/* Recently Viewed */}
            <div className="recently-viewed">
              <BoardSection title="Recently viewed" image={timer} boards={recentBoards} currentIndex={recentIndex}
                showAll={recentShowAll}
                onShowAll={() => setRecentShowAll(!recentShowAll)}
                onLeft={() => scrollByArrow(-1, recentIndex, setRecentIndex, recentBoards.length)}
                onRight={() => scrollByArrow(1, recentIndex, setRecentIndex, recentBoards.length)}
                sectionKey="recent"/>
            </div>
            
            <div className="bottom-controls">
              <button className="control-btn" onClick={CloseBoard}>Closed boards</button>
              <button className="control-btn" onClick={HiddenBoard}>Hidden boards</button>
            </div>
          </div>
        )}

        {/* Workspace Board */}
        {showWorkspaceBoard && (
          <div className="central-side">
            <div className="workspace-board">
              <div className="header-row">
                <div className="header-left">
                  {selectedWorkspaceImage ? (
                    <img src={selectedWorkspaceImage} alt="Workspace Avatar" className="workspace-avatar-board workspace-avatar-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.nextElementSibling?.classList.remove('hidden');
                      }}/>
                  ) : (
                    <span className="workspace-avatar-board">
                      {getWorkspaceInitials(selectedWorkspaceName)}
                    </span>
                  )}
                  <span className='userworkboard'>{selectedWorkspaceName}</span>
                </div>

                <div className="workspace-tabs">
                  <button className="tab-btn-wsp" onClick={()=> TabClick('boards')}>
                    <span className='btn-logo-gap'>
                      <img src={board} className='btn-logo-wsp' alt="Boards" />
                    </span>
                    Boards
                  </button>
                  <button className="tab-btn-wsp" onClick={()=> TabClick('boards')}>
                    <span className='btn-logo-gap'>
                      <img src={member} className='btn-logo-wsp' alt="Members" />
                    </span>
                    Members
                  </button>
                  <button className="tab-btn-wsp" onClick={()=> TabClick('boards')}>
                    <span className='btn-logo-gap'>
                      <img src={settings} className='btn-logo-wsp' alt="Settings" />
                    </span>
                    Settings
                  </button>
                </div>
              </div>
              <div className="workspace-content">
                {workspaceBoards.map((board, index) => (
                  <div className="board-item" key={board.id}>
                    <div className={`board-preview ${board.className || 'basic-board'}`}>
                      {board.imageUrl && (
                        <img src={board.imageUrl} alt={board.label}/>
                      )}
                      <span className="star-icon" onClick={() => WorkspaceStarred(index)}>
                        <img src={board.isStarred ? starlight : star} alt="Star" />
                      </span>
                    </div>
                    <span className="board-name">{board.label}</span>
                  </div>
                ))}
                <div className="board-item create-new" onClick={() => setShowAddBoardModal(true)}>
                  <div className="board-preview create-board">
                    <span className="plus-icon">+</span>
                  </div>
                  <span className="board-name">Create new board</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Модальное окно выбора workspace */}
        {showWorkspaceModal && (
          <div className="modal-overlay" onClick={() => setShowWorkspaceModal(false)}>
            <div className="modal-all-workspace">
              <div className="modal-header-add-card">
                <h3>Choose {selectedBoardToAdd?.label} to workspace</h3>
                <button className="close-modal-add-board" onClick={() => setShowWorkspaceModal(false)}>×</button>
              </div>
              <div className="workspace-list-add-card">
                {availableWorkspaces.map((workspace) => (
                  <div key={workspace.id} className="workspace-item-add-card" onClick={() => addTemplateToWorkspace(workspace.id)}>
                    {workspace.imageUrl ? (
                      <img src={workspace.imageUrl} alt={workspace.name} className="workspace-item-avatar-add-card" />
                    ) : (
                      <span className="workspace-item-avatar-add-card">
                        {getWorkspaceInitials(workspace.name)}
                      </span>
                    )}
                    <span className="workspace-item-name-add-card">{workspace.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Окно шаблона */}
        {selectedTemplate && (
          <div className="template-window">
            <div className="template-window-content">
              <span className="close-window" onClick={closeTemplateWindow}>X</span>
              <h2>{selectedTemplate}</h2>
              <p>This is a detailed description for the selected template.</p>
            </div>
          </div>
        )}
        {/* Модальное окно создания доски */}
        {showAddBoardModal && selectedWorkspaceId && (
          <AddBoardModal workspaceId={selectedWorkspaceId} onClose={() => setShowAddBoardModal(false)} onBoardCreated={BoardCreated}/>
        )}
      </div>
    </div>
  );
};

export default MainForm;