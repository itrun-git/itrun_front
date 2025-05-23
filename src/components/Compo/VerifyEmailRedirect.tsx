import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmEmail } from "../Api/api";

const VerifyEmailRedirect: React.FC = () => {
  console.log("VerifyEmailRedirect rendered");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

useEffect(() => {
  console.log("token from URL:", token); // ← проверь, выводится ли

  if (!token) {
    navigate("/login");
    return;
  }

  confirmEmail(token)
    .then(() => {
      console.log("Email confirmed");
      alert("Email успешно подтверждён! Теперь можно войти.");
      navigate("/login");
    })
    .catch((err) => {
      console.log("Ошибка при подтверждении:", err);
      alert("Ошибка подтверждения почты: " + err.message);
      navigate("/login");
    });
}, [token, navigate]);


  return <div>Подтверждение почты...</div>;
};

export default VerifyEmailRedirect;
