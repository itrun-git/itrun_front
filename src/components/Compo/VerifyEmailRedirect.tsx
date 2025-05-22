import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmEmail } from "../Api/api";

const VerifyEmailRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    confirmEmail(token)
      .then(() => {
        alert("Email успешно подтверждён! Теперь можно войти.");
        navigate("/login");
      })
      .catch((err) => {
        alert("Ошибка подтверждения почты: " + err.message);
        navigate("/login");
      });
  }, [token, navigate]);

  return <div>Подтверждение почты...</div>;
};

export default VerifyEmailRedirect;
