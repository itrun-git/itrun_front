import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, Link } from "react-router-dom";

import "../Style/AutorizationForm.css";
import LogoIcon from "../Logo/LogoIcon.png";
import Logoapple from "../Logo/Logoapple.png";
import Logogoogle from "../Logo/Logogoogle.png";
import Logomicrosoft from "../Logo/Logomicrosoft.png";

import { loginSchema } from "../Schema/ValidationService";
import { loginUser } from "../Api/api";

interface LoginFormInputs {
  email: string;
  password: string;
}

const AutorizationForm: React.FC = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await loginUser(data);

      if (response.token) {
        localStorage.setItem("authToken", response.token);
        // alert(response.message);
        navigate("/mainform");
      } else {
        // alert("Authorization error: " + (response.message || "Unknown error"));
      }
    } catch (error: any) {
      // alert("Error while logging in: " + error.message);
    }
  };

  return (
    <div className="registration-container">
      <div className="form-box">
        <div className="logo-section">
          <img src={LogoIcon} alt="ItRun Logo" className="logo" />
          <h2>ItRun</h2>
        </div>
        
        <h3 className="title">Log in to continue</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="password-container">
          <input type="email" placeholder="Email" className="input" {...register("email")} />
          {errors.email && <p className="error">{errors.email.message}</p>}
          <input type="password" placeholder="Password" className="input" {...register("password")} />
          {errors.password && <p className="error">{errors.password.message}</p>}

          <div className="options-row">
            <input type="checkbox"/> Remember me 
            <label className="remember">
              <a href="#" className="forgot">
                Forgot password?
              </a>
            </label>
          </div>

          <button className="submit-button" type="submit">
            Log in
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-buttons">
          <button className="google-btn">
            <img src={Logogoogle} alt="Google" />
            Google
          </button>
          <button className="microsoft-btn">
            <img src={Logomicrosoft} alt="Microsoft" />
            Microsoft
          </button>
          <button className="apple-btn">
            <img src={Logoapple} alt="Apple" />
            Apple
          </button>
        </div>

        <div className="login-link">
          Can't log in? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default AutorizationForm;