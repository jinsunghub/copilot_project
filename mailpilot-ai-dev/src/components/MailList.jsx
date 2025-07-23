import React from "react";

const MailList = ({ emails, onSelectEmail, selectedIds, setSelectedIds }) => {
  const toggleCheckbox = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // ✅ App.js에서 이미 정렬된 상태로 받으므로 추가 정렬 불필요
  // const sortedEmails = emails.slice().sort(...) 제거

  return (
    <div className="mail-list">
      {emails.map((email, index) => (
        <div
          key={`${email.subject}-${email.from}-${email.date}-${index}`} // 유니크 키 보강
          className="mail-item"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(email.id)}
            onChange={() => toggleCheckbox(email.id)}
            onClick={(e) => e.stopPropagation()}
            style={{ marginRight: "10px" }}
          />
          <div
            className="mail-info"
            onClick={() => onSelectEmail(email)}
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
              {email.classification && (
                <span className="classification-label">
                  ({email.classification.replace(/\.$/, "")})
                </span>
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
