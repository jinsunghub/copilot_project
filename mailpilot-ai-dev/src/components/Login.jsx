// Login.jsx
import React, { useState } from "react";
import "./Login.css";

const Login = ({ setIsLoggedIn, setEmail, setAppPassword }) => {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputEmail && inputPassword) {
      setEmail(inputEmail); // 상위 컴포넌트에 이메일 전달
      setAppPassword(inputPassword); // 상위 컴포넌트에 앱 비밀번호 전달
      setIsLoggedIn(true); // 로그인 상태 true로 전환
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
