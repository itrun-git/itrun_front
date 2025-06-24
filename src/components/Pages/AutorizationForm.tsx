import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, Link } from "react-router-dom";

import "../Style/AutorizationForm.css";
import LogoIcon from "../Logo/logoItRun.png";
import Logoapple from "../Logo/Logoapple.png";
import Logogoogle from "../Logo/Logogoogle.png";
import Logomicrosoft from "../Logo/Logomicrosoft.png";

import { loginSchema } from "../Schema/ValidationService";
import { loginUser, initiateGoogleAuth, initiateMicrosoftAuth, initiateAppleAuth } from "../Api/api";

interface LoginFormInputs {
  email: string;
  password: string;
}

const AutorizationForm: React.FC = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    const existingToken = localStorage.getItem("authToken");
    if (existingToken) {
      navigate("/mainform");
    }
  }, [navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await loginUser(data);

      if (response.token) {
        localStorage.setItem("authToken", response.token);
        navigate("/mainform");
      }
    } catch (error: any) {
      console.error("Error while logging in:", error.message);
    }
  };

  const GoogleLogin = async () => {
    try {
      await initiateGoogleAuth();
    } catch (error) {
      console.error("Error initiating Google auth:", error);
    }
  };

  const MicrosoftLogin = async () => {
    try {
      await initiateMicrosoftAuth();
    } catch (error) {
      console.error("Error initiating Microsoft auth:", error);
    }
  };

  const AppleLogin = async () => {
    try {
      await initiateAppleAuth();
    } catch (error) {
      console.error("Error initiating Apple auth:", error);
    }
  };

  return (
    <div className="registration-container">
      <div className="form-box">
        <div className="logo-section-authorization">
          <img src={LogoIcon} alt="ItRun Logo" className="logo-autorization-form" />
          {/* <h2>ItRun</h2> */}
        </div>
        <h3 className="title-autorization">Log in to continue</h3>
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
          <button type="button" className="google-btn" onClick={GoogleLogin}>
            <img src={Logogoogle} alt="Google" />
            Google
          </button>
          <button type="button" className="microsoft-btn" onClick={MicrosoftLogin}>
            <img src={Logomicrosoft} alt="Microsoft" />
            Microsoft
          </button>
          <button type="button" className="apple-btn" onClick={AppleLogin}>
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