import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocialLoginCallback } from '../Api/api';
import '../Style/AutorizationForm.css';

const SocialLoginCallbackapi: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const hasToken = await SocialLoginCallback();
        if (hasToken) {
          navigate('/mainform');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error processing social login callback:', error);
        navigate('/login');
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="google-autorization">
      <div>Обработка авторизации...</div>
    </div>
  );
};

export default SocialLoginCallbackapi;