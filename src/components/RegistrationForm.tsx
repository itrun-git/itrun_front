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
      <button className="Microsoft-button">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Microsoft"
          className="Microsoft-icon"
        />
        Microsoft
      </button>
      <button className="Apple-button">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Apple"
          className="Apple-icon"
        />
        Apple
      </button>
      <button className="Slack-button">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Slack"
          className="Slack-icon"
        />
        Slack
      </button>
    </div>
  );
};

export default RegisterForm;
