import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Style/RegistrationForm.css";
import LogoIcon from "../Logo/LogoIcon.png";
import CameraIcon from "../Logo/camera.png";

const RegistrationForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [purpose, setPurpose] = useState("personal");

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleContinue = () => {
    if (step === 1 && isValidEmail(email)) {
      setStep(2);
    } else if (step === 2 && fullName && password.length >= 8) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      alert("Регистрация завершена!");
    }
  };

  const handleSkip = () => {
    if (step === 3) {
      setStep(4);
    } else {
      alert("Регистрация завершена!");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
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
            <h3 className="title">Let's get you started</h3>
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

            <button
              className="submit-button"
              onClick={handleContinue}
              disabled={!isValidEmail(email)}
            >
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
              Let's set up your profile and keep your account secure.
            </p>
            
            {/* Исправил тем что обернул */}
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Full name"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="password-wrapper"> 
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            <p className="note">Must be at least 8 characters</p>

            <button
              className="submit-button"
              onClick={handleContinue}
              disabled={!fullName || password.length < 8}
            >
              Continue
            </button>

            <div className="login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="title">Add a profile photo</h3>
            <p className="subtitle">Have a favorite selfie? Upload it now</p>

            <div className="photo-upload">
              <label htmlFor="file-upload" className="photo-circle">
                {photo ? (
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="Preview"
                    className="photo-preview"
                  />
                ) : (
                  <img src={CameraIcon} alt="Upload" className="camera-icon" />
                )}
              </label>
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
            </div>

            <button className="submit-button" onClick={handleContinue}>
              Continue
            </button>
            <button className="skip-button" onClick={handleSkip}>
              Skip
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="title">What do you need to do?</h3>
            <p className="subtitle">
              This will help us personalize your setup experience.
            </p>

            <div className="purpose-options">
              <label className="purpose-option">
                <input
                  type="radio"
                  name="purpose"
                  value="personal"
                  checked={purpose === "personal"}
                  onChange={() => setPurpose("personal")}
                />
                <span className="radio-custom"></span>
                <span className="option-text">Track personal tasks</span>
              </label>

              <label className="purpose-option">
                <input
                  type="radio"
                  name="purpose"
                  value="team"
                  checked={purpose === "team"}
                  onChange={() => setPurpose("team")}
                />
                <span className="radio-custom"></span>
                <span className="option-text">Manage a team or projects</span>
              </label>

              <label className="purpose-option">
                <input
                  type="radio"
                  name="purpose"
                  value="events"
                  checked={purpose === "events"}
                  onChange={() => setPurpose("events")}
                />
                <span className="radio-custom"></span>
                <span className="option-text">Organize events</span>
              </label>

              <label className="purpose-option">
                <input
                  type="radio"
                  name="purpose"
                  value="other"
                  checked={purpose === "other"}
                  onChange={() => setPurpose("other")}
                />
                <span className="radio-custom"></span>
                <span className="option-text">Other</span>
              </label>
            </div>

            <button className="submit-button" onClick={handleContinue}>
              Continue
            </button>
          </>
        )}

        <div className="steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className={`step ${step >= 4 ? "active" : ""}`}>✓</div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;