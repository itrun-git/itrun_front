import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Style/RegistrationForm.css";
import LogoIcon from "../Logo/LogoIcon.png";

const RegistrationForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleContinue = () => {
    if (step === 1 && email) {
      setStep(2);
    } else if (step === 2 && fullName && password.length >= 8) {
      alert("Регистрация завершена!");
    }
  };

  return (
    <div className="registration-container">
      <div className="form-box">
        <div className="logo-section">
          <img src={LogoIcon} alt="ItRun Logo" className="logo" />
          <h2>ItRun</h2>
        </div>

        {step === 1 && (
          <>
            <h3 className="title">Let’s get you started</h3>
            <p className="subtitle">
              Organize your tasks, projects and team in one place.
            </p>

            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="submit-button" onClick={handleContinue}>
              Continue
            </button>

            <div className="login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="title">A few more details</h3>
            <p className="subtitle">
              Let’s set up your profile and keep your account secure.
            </p>

            <input
              type="text"
              placeholder="Full name"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
              </span>
            </div>

            <p className="note">Must be at least 8 characters</p>

            <button className="submit-button" onClick={handleContinue}>
              Continue
            </button>

            <div className="login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </>
        )}

        <div className="steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`step ${step === 2 ? "active" : ""}`}>2</div>
          <div className="step">✓</div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
