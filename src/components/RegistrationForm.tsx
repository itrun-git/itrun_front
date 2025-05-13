import React from "react";
import "../Style/RegistrationForm.css";

const RegistrationForm: React.FC = () => {
  return (
    <div className="registration-container">
      <div className="form-box">
        <div className="logo-section">
          <img src="/logo.png" alt="ItRun Logo" className="logo" />
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
            <img src="/google.svg" alt="Google" />
            Google
          </button>
          <button className="microsoft-btn">
            <img src="/microsoft.svg" alt="Microsoft" />
            Microsoft
          </button>
          <button className="apple-btn">
            <img src="/apple.svg" alt="Apple" />
            Apple
          </button>
        </div>

        <div className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
