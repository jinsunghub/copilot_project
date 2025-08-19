import React, { useState } from "react";
import "./Login.css";

const Login = ({ onLogin, setEmail, setAppPassword, setIsLoggedIn }) => {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  // ✅ Props 디버깅
  console.log("[🔍 Login Props 확인]", {
    onLogin: typeof onLogin,
    setEmail: typeof setEmail,
    setAppPassword: typeof setAppPassword,
    setIsLoggedIn: typeof setIsLoggedIn,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputEmail || !inputPassword) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLogging(true);

    try {
      console.log("[🔑 로그인 시도]", inputEmail);

      // ✅ 새로운 방식 (onLogin이 있을 때)
      if (onLogin && typeof onLogin === "function") {
        console.log("[🆕 새로운 방식] onLogin 함수 사용");
        const success = await onLogin(inputEmail, inputPassword);

        if (success) {
          console.log("[✅ 로그인 성공]");
        } else {
          console.log("[❗로그인 실패]");
        }
      }
      // ✅ 기존 방식 (fallback)
      else if (setEmail && setAppPassword && setIsLoggedIn) {
        console.log("[🔄 기존 방식] 개별 setter 사용");
        setEmail(inputEmail);
        setAppPassword(inputPassword);

        // setState는 batching되므로, delay를 두고 실행
        setTimeout(() => {
          setIsLoggedIn(true);
        }, 10);
      }
      // ❌ 둘 다 없는 경우
      else {
        console.error("[❗Props 오류] onLogin 또는 개별 setter가 필요합니다");
        alert(
          "로그인 함수가 제대로 연결되지 않았습니다. 개발자에게 문의하세요."
        );
      }
    } catch (error) {
      console.error("[❗로그인 오류]", error);
      alert("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="logo">📬 E.M.Pilot</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일 주소"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          disabled={isLogging}
        />
        <input
          type="password"
          placeholder="앱 비밀번호"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          disabled={isLogging}
        />

        <button
          type="submit"
          disabled={isLogging}
          style={{
            backgroundColor: isLogging ? "#ccc" : "",
            cursor: isLogging ? "not-allowed" : "pointer",
          }}
        >
          {isLogging ? "🔄 로그인 중..." : "🔑 로그인"}
        </button>
      </form>

      {isLogging && (
        <div
          style={{
            marginTop: "15px",
            textAlign: "center",
            fontSize: "14px",
            color: "#666",
          }}
        >
          처리 중입니다... ⏳
        </div>
      )}
      {/* ✅ 도움말 섹션 */}
      <div
        style={{
          marginTop: "30px",
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          <strong>📧 Gmail 앱 비밀번호 설정 방법:</strong>
        </div>
        <div style={{ textAlign: "left", maxWidth: "300px", margin: "0 auto" }}>
          1. Gmail 계정 → 보안 설정
          <br />
          2. 2단계 인증 활성화
          <br />
          3. 앱 비밀번호 생성
          <br />
          4. 생성된 16자리 비밀번호 사용
        </div>
        <div style={{ marginTop: "15px", fontSize: "11px", color: "#999" }}>
          🔒 개인정보는 안전하게 보호됩니다
        </div>
      </div>
    </div>
  );
};

export default Login;
