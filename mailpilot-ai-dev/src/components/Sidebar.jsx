import React from "react";

const tags = [
  "전체 메일",
  "중요 메일",
  "받은 메일함",
  "보낸 메일함",
  "스팸",
  "키워드 필터",
];

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
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
