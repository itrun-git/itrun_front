import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmEmail } from "../Api/api";

const VerifyEmailRedirect: React.FC = () => {
  console.log("VerifyEmailRedirect rendered");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

useEffect(() => {
  console.log("token from URL:", token); 
  if (!token) {
    navigate("/mainform");
    return;
  }
  confirmEmail(token)
    .then(() => {
      console.log("Email confirmed");
      navigate("/mainform");
    })
    .catch((err) => {
      console.log("Ошибка при подтверждении:", err);
      navigate("/mainform");
    });
}, [token, navigate]);
  return <div>Подтверждение почты...</div>;
};

export default VerifyEmailRedirect;