import React from "react";

const tags = [
  "전체 메일",
  "중요 메일",
  "받은 메일함",
  "보낸 메일함",
  "내게 쓴 메일",
  "스팸",
  "키워드 필터",
];

const Sidebar = ({ selectedTag, setSelectedTag }) => {
  return (
    <div className="sidebar">
      <h2>📂 MailPilot</h2>
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
