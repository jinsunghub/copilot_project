import React, { useState } from "react";
import "./Login.css";

const Login = ({ setIsLoggedIn, setEmail, setAppPassword }) => {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputEmail && inputPassword) {
      setEmail(inputEmail);
      setAppPassword(inputPassword);
  
      // setState는 batching되므로, delay를 두고 실행
      setTimeout(() => {
        setIsLoggedIn(true);
      }, 0); // 혹은 10ms
    } else {
      alert("이메일과 비밀번호를 입력해주세요.");
    }
  };
  
  

  return (
    <div className="login-container">
      <h1 className="logo">📬 MailPilot AI</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일 주소"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="앱 비밀번호"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
        />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login;
