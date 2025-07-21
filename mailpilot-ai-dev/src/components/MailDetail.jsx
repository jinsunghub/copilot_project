import React from "react";
import "./MailDetail.css";

const MailDetail = ({ email }) => {
  if (!email)
    return <div className="mail-detail empty">📭 메일을 선택해주세요</div>;

  return (
    <div className="mail-detail">
      <h2>{email.subject}</h2>
      <p>
        <strong>보낸 사람:</strong> {email.from}
      </p>
      <p>
        <strong>받은 날짜:</strong> {email.date}
      </p>
      <hr />
      <div className="ai-summary-box">
        <span className="ai-summary-label">🧠 AI 요약본</span>:<br />
        {email.summary}
      </div>
    </div>
  );
};

export default MailDetail;
