import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Style/RegistrationForm.css";

import LogoIcon from "../Logo/LogoIcon.png";

const RegistrationForm: React.FC = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="registration-container">
      <div className="form-box">
        <div className="logo-section">
          <img src={LogoIcon} alt="ItRun Logo" className="logo" />
          <h2>ItRun</h2>
        </div>

        <h3 className="title">Let’s get you started</h3>
        <p className="subtitle">Organize your tasks, projects and team in one place.</p>

        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="submit-button">Continue</button>

        <div className="login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>

        <div className="steps">
          <div className="step active">1</div>
          <div className="step">2</div>
          <div className="step">✓</div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
