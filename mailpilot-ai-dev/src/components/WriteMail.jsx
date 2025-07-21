import React, { useState } from "react";
import "./WriteMail.css";

const WriteMail = ({ onBack }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = () => {
    alert(`메일 전송됨!\nTo: ${to}\nSubject: ${subject}\nBody: ${body}`);
    onBack(); // 전송 후 메일 리스트로 돌아가기
  };

  return (
    <div className="mail-content">
      <h2>📨 새 메일 작성</h2>
      <input
        type="text"
        placeholder="수신자"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="mail-input"
      />
      <input
        type="text"
        placeholder="제목"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mail-input"
      />
      <textarea
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
