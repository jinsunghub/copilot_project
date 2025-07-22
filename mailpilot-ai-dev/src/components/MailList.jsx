import React from "react";

const MailList = ({ emails, onSelectEmail, selectedIds, setSelectedIds }) => {
  const toggleCheckbox = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="mail-list">
      {emails.map((email) => (
        <div key={email.id} className="mail-item">
          {/* ⬅️ 체크박스만 따로 클릭 가능하도록 stopPropagation */}
          <input
            type="checkbox"
            checked={selectedIds.includes(email.id)}
            onChange={() => toggleCheckbox(email.id)}
            onClick={(e) => e.stopPropagation()}
            style={{ marginRight: "10px" }}
          />
          <div
            className="mail-info"
            onClick={() => onSelectEmail(email)} // 메일 내용 보기
            style={{ cursor: "pointer", flex: 1 }}
          >
            <div className="mail-subject">
              {email.subject}
              {email.tag === "중요" && (
                <span className="important-icon">⭐</span>
              )}
              {email.tag === "스팸" && (
                <span className="spam-label">🚫 스팸</span>
              )}
            </div>
            <div className="mail-from">{email.from}</div>
            <div className="mail-date">{email.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MailList;
