// src/components/ComposeMail.jsx
import React, { useState } from "react";

const ComposeMail = ({ onSend }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (to && subject && body) {
      onSend({ to, subject, body });
      setTo("");
      setSubject("");
      setBody("");
    } else {
      alert("모든 항목을 입력해주세요.");
    }
  };

  return (
    <div className="compose-container">
      <h2>✉️ 메일 작성</h2>
      <form onSubmit={handleSend}>
        <input
          type="email"
          placeholder="받는 사람 이메일"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="제목"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          placeholder="본문"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <button type="submit">📤 보내기</button>
      </form>
    </div>
  );
};

export default ComposeMail;
