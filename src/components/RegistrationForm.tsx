import "../Style/RegistrationForm.css";

const RegisterForm = () => {
  return (
    <div className="register-container">
      <h2>Зарегистрируйтесь, чтобы продолжить</h2>
      <input
        type="email"
        placeholder="Введите ваш адрес электронной почты"
        className="input"
      />
      <p className="terms">
        Регистрируясь, я соглашаюсь с <a href="#">Условиями использования продуктов Cloud</a> и принимаю <a href="#">Политику конфиденциальности Atlassian</a>.
      </p>
      <button className="register-button">Зарегистрироваться</button>
      <div className="divider">Или продолжить с помощью:</div>
      <button className="google-button">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google"
          className="google-icon"
        />
        Google
      </button>
      <button className="google-button">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google"
          className="google-icon"
        />
        Google
      </button>
      <button className="google-button">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google"
          className="google-icon"
        />
        Google
      </button>
      <button className="google-button">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google"
          className="google-icon"
        />
        Google
      </button>
    </div>
  );
};

export default RegisterForm;
