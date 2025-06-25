import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/404.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-text">Страница не найдена</p>
        <button className="back-button" onClick={handleGoBack}>
          Назад
        </button>
      </div>
    </div>
  );
};

export default NotFound;