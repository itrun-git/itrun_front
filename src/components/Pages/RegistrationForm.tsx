import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import "../Style/RegistrationForm.css";
import LogoIcon from "../Logo/logoItRun.png";
import CameraIcon from "../Logo/camera.png";
import { emailSchema, passwordSchema } from "../Schema/ValidationService";
import { registerUser, CreateUserDto, UserPurpose, checkEmail, sendVerificationEmail, changeUserEmail, setUserPurpose, uploadAvatar } from "../Api/api";

interface FormData {
  email: string;
  fullName: string;
  password: string;
  photo?: FileList;
}

const getResolver = (step: number) => {
  if (step === 1 || step === 5) {
    return yupResolver(emailSchema);
  }
  if (step === 2) {
    return yupResolver(passwordSchema);
  }
  return undefined;
};

const RegistrationForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [purpose, setPurposeValue] = useState<UserPurpose>(UserPurpose.PERSONAL);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  
  // Новые состояния для 5-й формы
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [, setIsEmailSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<FormData>({
    resolver: getResolver(step) as any,
    mode: "onChange",
  });

 const interval = setInterval(() => {
  setTimer(timer - 1);
  }, 1000);


  // Функциональность для проверки размера файла
  const validateFile = (file: File): string | null => {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return 'The file size must not exceed 5 MB.';
    }
    if (!file.type.startsWith('image/')) {
      return 'Only images can be uploaded';
    }
    return null;
  };

  const PhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);
    
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    // Проверяем файл
    const validationError = validateFile(file);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }

    try {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    } catch (error) {
      setPhotoError('Error processing file');
      console.error('Photo upload error:', error);
    }
  };

  // Функциональность загрузки фото на сервер - используем ваш API
  const uploadPhotoToServer = async (file: File, userId: string): Promise<void> => {
    try {
      const user = await uploadAvatar(file, userId);
      console.log('Аватар успешно загружен:', user);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw new Error('Failed to upload photo');
    }
  };

  // Функциональность отправки письма подтверждения
  const SendVerificationEmail = async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const userIdToUse = userId || registeredUserId;
      if (!userIdToUse) {
        throw new Error('User ID not found');
      }

      await sendVerificationEmail(userIdToUse);
      setIsEmailSent(true);
      setTimer(60); // 1 минута
      console.log('Подтверждение отправлено по электронной почте');
    } catch (err: any) {
      setError(err.message || 'Error sending email');
    } finally {
      setLoading(false);
    }
  };

  // Функциональность смены email
  const ChangeEmail = async () => {
    try {
      setLoading(true);
      setError(null);

    const emailCheck = await checkEmail(newEmail);
    if (!emailCheck.available) {
      setError("This email is already in use");
      return;
    }

    const currentEmail = getValues("email");
    
    await changeUserEmail(currentEmail, newEmail);

    setValue("email", newEmail);
    setShowChangeEmail(false);
    setIsEmailSent(false);
    setTimer(0);

    console.log('Email изменен и обновлен на сервере:', newEmail);

    await SendVerificationEmail();
    } catch (err: any) {
      setError(err.message || 'Error when changing email');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);

      // Если первый шаг - проверяем доступность email
      if (step === 1) {
        setLoading(true);
        try {
          const emailCheck = await checkEmail(data.email);
          if (!emailCheck.available) {
            setError("This email is already in use");
            setLoading(false);
            return;
          }
        } catch (emailError) {
          console.warn('Ошибка проверки email:', emailError);
        }
        setLoading(false);
        setStep(step + 1);
        return;
      }

      // Если не 4-й шаг - перейти на следующий
      if (step < 4) {
        setStep(step + 1);
        return;
      }

      // 4-й шаг - регистрация пользователя
      if (step === 4) {
        setLoading(true);

        const userData: CreateUserDto = {
          email: data.email,
          name: data.fullName,      
          password: data.password,  
        };

        console.log('Отправляем данные на сервер:', userData);
        
        // Регистрируем пользователя
        const newUser = await registerUser(userData);
        setRegisteredUserId(newUser.id);

        // Устанавливаем purpose отдельным запросом после регистрации
        if (newUser.id) {
          try {
            await setUserPurpose({
              userId: newUser.id,
              purpose: purpose
            });
            console.log('Purpose установлен успешно');
          } catch (purposeError) {
            console.warn('Error installing purpose:', purposeError);
          }
        }

        // Загружаем фото, если оно выбрано
        if (photoFile && newUser.id) {
          try {
            console.log('Загружаем фото на сервер...');
            await uploadPhotoToServer(photoFile, newUser.id);
            console.log('Фото успешно загружено!');
          } catch (photoUploadError) {
            console.error('Ошибка загрузки фото:', photoUploadError);
            setError('Registration completed, but photo failed to upload');
          }
        }

        console.log('Регистрация успешна! Переходим к подтверждению email');
        // Переходим к 5-му шагу
        setStep(5);
        await SendVerificationEmail(newUser.id);
        return;
      }

      // 5-й шаг - обработка смены email
      if (step === 5 && showChangeEmail) {
        await ChangeEmail();
        return;
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || "There was a registration error");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="registration-container">
      <div className="form-box">
        <div className="logo-section">
          <img src={LogoIcon} alt="ItRun Logo" className="logo-register-form" />
          {/* <h2>ItRun</h2> */}
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <h3 className="title">Let's get you started</h3>
              <p className="subtitle">
                Organize your tasks, projects and team in one place.
              </p>

              <input type="email" placeholder="Email" className="input" {...register("email")}/>
              {errors.email && (
                <p className="error">{String(errors.email.message)}</p>
              )}

              <button className="submit-button" type="submit" disabled={loading}>
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="title">A few more details</h3>
              <p className="subtitle">
                Let's set up your profile and keep your account secure.
              </p>

              <input type="text" placeholder="Full name" className="input" {...register("fullName")} />
              {errors.fullName && (
                <p className="error">{String(errors.fullName.message)}</p>
              )}

              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Password" className="input" {...register("password")}/>
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)} >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
               {/* <div className="password-text-much">Must be at least 8 characters</div>*/}
              {errors.password && (
                <p className="error">{String(errors.password.message)}</p>
              )}

              <button className="submit-button" type="submit" disabled={loading}>
                Continue
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="title">Add a profile photo</h3>
              {/* <p className="subtitle">Have a favorite selfie? Upload it now (max 5MB)</p> */}
              {photoError && <p className="error">{photoError}</p>}

              <div className="photo-upload">
                <label htmlFor="file-upload" className="photo-circle">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="photo-preview" />
                  ) : (
                    <img src={CameraIcon} alt="Upload" className="camera-icon" />
                  )}
                </label>
              </div>
              <div className="hiden-text">
                <input type="file" id="file-upload" accept="image/*" onChange={PhotoUpload}/>
              </div>
              <button className="submit-button" type="submit" disabled={loading}>
                Continue
              </button>
              <button type="button" className="skip-button" onClick={() => setStep(4)}
                disabled={loading}>
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
                {[
                  { label: "Track personal tasks", value: UserPurpose.PERSONAL },
                  { label: "Manage a team or projects", value: UserPurpose.TEAM },
                  { label: "Organize events", value: UserPurpose.EVENTS },
                  { label: "Other", value: UserPurpose.OTHER },
                ].map((opt) => (
                  <label key={opt.value} className="purpose-option">
                    <input type="radio" name="purpose" value={opt.value} checked={purpose === opt.value}
                      onChange={() => setPurposeValue(opt.value)}/>
                    <span className="radio-custom"></span>
                    <span className="option-text">{opt.label}</span>
                  </label>
                ))}
              </div>
              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? "Processing..." : "Continue"}
              </button>
            </>
          )}

          {step === 5 && (
            <>
              <h3 className="title">Welcome to ItRun</h3>
              <p className="subtitle">
                Registration is almost complete! A confirmation email has been sent to your 
                account. Please verify your email by clicking the link in the email.
              </p>

              {!showChangeEmail ? (
                <>
                  <button className="submit-button" type="button" disabled={loading || timer > 0}
                    onClick={() => SendVerificationEmail()}>
                    {loading ? "Sending..." : timer > 0 ? `Resend (${formatTime(timer)})` : "Send Email"}
                  </button>
                  <p className="email-info">
                    {timer > 0 ? `You can resend in ${formatTime(timer)}` : "Click to send verification email"}
                  </p>
                  <button type="button" className="change-email-button" onClick={() => {setShowChangeEmail(true); setNewEmail(getValues("email")); }}>Change email</button>
                  <p className="login-link">
                    Already have an account? <button type="button" onClick={() => navigate("/login")} className="link-button">Sign In</button>
                  </p>
                </>
              ) : (
                <>
                  <h3 className="title">Something went wrong?</h3>
                  <p className="subtitle">
                    You can change your email right here. You won't have to type other data again!
                  </p>
                  <input type="email" placeholder="Email" className="input" value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}/>
                  {errors.email && (
                    <p className="error">{String(errors.email.message)}</p>
                  )}

                  <button className="submit-button" type="button" disabled={loading || !newEmail}
                    onClick={ChangeEmail}>
                    {loading ? "Processing..." : "Continue"}
                  </button>
                  <p className="login-link">
                    Already have an account? <button type="button" onClick={() => navigate("/login")} className="link-button">Sign In</button>
                  </p>
                </>
              )}
            </>
          )}
        </form>

        <div className="steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
          <div className={`step ${step >= 4 ? "active" : ""}`}>4</div>
          <div className={`step ${step >= 5 ? "active" : ""}`}>✓</div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;