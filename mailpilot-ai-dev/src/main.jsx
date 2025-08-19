import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./components/Login";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./App.css";
import "./styles/theme.css";

const Root = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");

  // ✅ 로그인 처리 함수 (App.jsx와 동일한 로직)
  const handleLogin = async (userEmail, userPassword) => {
    try {
      console.log(`[🔑 Main 로그인] ${userEmail}`);
      
      // 백엔드 로그인 API 호출
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 세션 쿠키 포함
        body: JSON.stringify({ 
          email: userEmail,
          app_password: userPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("[✅ Main 백엔드 로그인 성공]", data.session_id);
        
        // 프론트엔드 상태 설정
        setEmail(userEmail);
        setAppPassword(userPassword);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("appPassword", userPassword);
        setIsLoggedIn(true);
        
        return true;
      } else {
        console.error("[❗Main 백엔드 로그인 실패]", data.error);
        alert(`로그인 실패: ${data.error}`);
        return false;
      }
    } catch (error) {
      console.error("[❗Main 로그인 오류]", error);
      alert("로그인 중 오류가 발생했습니다.");
      return false;
    }
  };

  // ✅ 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      console.log(`[🚪 Main 로그아웃] ${email}`);
      
      // 백엔드 로그아웃 API 호출
      const response = await fetch("http://localhost:5001/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 세션 쿠키 포함
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        console.log("[✅ Main 백엔드 로그아웃 성공]");
      } else {
        console.error("[❗Main 백엔드 로그아웃 실패]", data.error);
      }
    } catch (error) {
      console.error("[❗Main 로그아웃 오류]", error);
    } finally {
      // 프론트엔드 상태 초기화 (백엔드 성공/실패 상관없이)
      setIsLoggedIn(false);
      setEmail("");
      setAppPassword("");
      localStorage.removeItem("email");
      localStorage.removeItem("appPassword");
      
      // 다크 테마 클래스 제거 (로그인 화면이 깨지지 않도록)
      document.documentElement.classList.remove('dark-theme');
      
      console.log("[🔄 Main 로그아웃 완료] 모든 데이터 초기화됨");
    }
  };

  return isLoggedIn ? (
    <App email={email} appPassword={appPassword} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <Root />
  </LanguageProvider>
);
