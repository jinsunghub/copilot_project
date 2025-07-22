import React, { useState } from "react";
import "./WriteMail.css";

const WriteMail = ({ onBack, email, appPassword }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // 로그인한 사용자 이메일
          app_password: appPassword, // 로그인한 사용자 앱 비밀번호
          to,
          subject,
          body,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ 메일이 성공적으로 전송되었습니다.");
        onBack(); // 작성 화면 닫기
      } else {
        alert("❗메일 전송 실패: " + data.error);
      }
    } catch (error) {
      console.error("❗에러:", error);
      alert("메일 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="mail-content">
      <h2>📨 새 메일 작성</h2>
      <input
        type="text"
        name="to"
        placeholder="수신자"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="mail-input"
      />
      <input
        type="text"
        name="subject"
        placeholder="제목"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mail-input"
      />
      <textarea
        name="body"
        placeholder="본문"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="mail-textarea"
      />
      <br />
      <button className="setting-button" onClick={handleSend}>
        전송
      </button>
      <button className="setting-button back-button" onClick={onBack}>
        뒤로가기
      </button>
    </div>
  );
};

export default WriteMail;
