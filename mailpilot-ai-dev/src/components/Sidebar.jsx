import React from "react";
import "./Sidebar.css";

const tags = ["전체 메일", "중요 메일", "스팸", "보안 경고", "챗봇 AI"];

const Sidebar = ({ selectedTag, setSelectedTag, onCompose }) => {
  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </div>
        <span className="logo-text">MailPilot</span>
      </div>
      <button
        className="setting-button"
        onClick={onCompose}
        style={{ width: "100%", marginBottom: "20px" }}
      >
        메일 쓰기
      </button>
      <ul>
        {tags.map((tag) => (
          <li
            key={tag}
            className={selectedTag === tag ? "active" : ""}
            onClick={() => setSelectedTag(tag)}
          >
            {tag === "챗봇 AI" ? "🤖 챗봇 AI" : tag}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
