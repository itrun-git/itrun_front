import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "../Style/RegistrationForm.css";
import LogoIcon from "../Logo/LogoIcon.png";
import CameraIcon from "../Logo/camera.png";
import { emailSchema, passwordSchema } from "../Schema/ValidationService";


interface FormData {
  email: string;
  fullName: string;
  password: string;
  photo?: FileList;
}

const getSchemaForStep = (step: number) => {
  if (step === 1) return emailSchema;
  if (step === 2) return passwordSchema;
  return yup.object(); 
};

const RegistrationForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [purpose, setPurpose] = useState("personal");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(getSchemaForStep(step)),
    mode: "onChange",
  });


  const onSubmit = (data: FormData) => {
    if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      console.log("Регистрация завершена", data);
      navigate("/mainform");
    } else {
      setStep(step + 1);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="registration-container">
      <div className="form-box">
        <div className="logo-section">
          <img src={LogoIcon} alt="ItRun Logo" className="logo" />
          <h2>ItRun</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <h3 className="title">Let's get you started</h3>
              <p className="subtitle">Organize your tasks, projects and team in one place.</p>

              <input
                type="email"
                placeholder="Email"
                className="input"
                {...register("email")}
              />
              {errors.email?.message && <p className="error">{String(errors.email.message)}</p>}

              <button className="submit-button" type="submit">
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="title">A few more details</h3>
              <p className="subtitle">Let's set up your profile and keep your account secure.</p>

              <input
                type="text"
                placeholder="Full name"
                className="input"
                {...register("fullName")}
              />
              {errors.fullName?.message && <p className="error">{String(errors.fullName.message)}</p>}

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="input"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password?.message && <p className="error">{String(errors.password.message)}</p>}

              <button className="submit-button" type="submit">
                Continue
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="title">Add a profile photo</h3>
              <p className="subtitle">Have a favorite selfie? Upload it now</p>

              <div className="photo-upload">
                <label htmlFor="file-upload" className="photo-circle">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="photo-preview" />
                  ) : (
                    <img src={CameraIcon} alt="Upload" className="camera-icon" />
                  )}
                </label>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  style={{ display: "none" }}
                  {...register("photo")}
                  onChange={handlePhotoUpload}
                />
              </div>

              <button className="submit-button" type="submit">
                Continue
              </button>
              <button type="button" className="skip-button" onClick={() => setStep(4)}>
                Skip
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <h3 className="title">What do you need to do?</h3>
              <p className="subtitle">This will help us personalize your setup experience.</p>

              <div className="purpose-options">
                {[
                  { label: "Track personal tasks", value: "personal" },
                  { label: "Manage a team or projects", value: "team" },
                  { label: "Organize events", value: "events" },
                  { label: "Other", value: "other" },
                ].map((opt) => (
                  <label key={opt.value} className="purpose-option">
                    <input
                      type="radio"
                      name="purpose"
                      value={opt.value}
                      checked={purpose === opt.value}
                      onChange={() => setPurpose(opt.value)}
                    />
                    <span className="radio-custom"></span>
                    <span className="option-text">{opt.label}</span>
                  </label>
                ))}
              </div>

              <button onClick={() => navigate("/mainform")} className="submit-button" type="submit" >
                Continue  
              </button>
            </>
          )}
        </form>

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
