import React from "react";
import { Link } from 'react-router-dom';
import "../Style/AutorizationForm.css";

import LogoIcon from "../Logo/LogoIcon.png";
import Logoapple from "../Logo/Logoapple.png";
import Logogoogle from "../Logo/Logogoogle.png";
import Logomicrosoft from "../Logo/Logomicrosoft.png";

const AutorizationForm: React.FC = () => {
  return (
    <div className="registration-container">
      <div className="form-box">
        <div className="logo-section">
          <img src={LogoIcon} alt="ItRun Logo" className="logo" />
          <h2>ItRun</h2>
        </div>
        <h3 className="title">Log in to continue</h3>


        <div className="password-container">
          <input type="email" placeholder="Email" className="input" />
          <input type="password" placeholder="Password" className="input" />

          <div className="options-row">
             <input type="checkbox" /> Remember me
            <label className="remember">
             <a href="#" className="forgot">Forgot password?</a>
            </label>
          </div>
        </div>

        <button className="submit-button">Log in</button>

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
          Can’t log in?   <Link to="/register" >Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default AutorizationForm;
