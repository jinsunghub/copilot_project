import React from "react";
import "./Sidebar.css";

const tags = ["전체 메일", "중요 메일", "스팸", "보안 경고", "챗봇 AI"];

const Sidebar = ({ selectedTag, setSelectedTag, onCompose }) => {
  return (
    <div className="sidebar">
      <h1>📂 MailPilot</h1>
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
