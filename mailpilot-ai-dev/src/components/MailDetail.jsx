import React from "react";
import "./MailDetail.css";

const MailDetail = ({ email }) => {
  if (!email)
    return <div className="mail-detail empty">📭 메일을 선택해주세요</div>;

  // ✅ 배열인지 단일 객체인지 확인
  const isMultiple = Array.isArray(email);
  const emails = isMultiple ? email : [email];

  if (isMultiple) {
    // ✅ 메일이 여러 개인 경우 (첫 로딩 또는 새로고침)
    return (
      <div className="mail-detail">
        <h2>📧 메일 {emails.length}개</h2>
        <div className="new-emails-container">
          {emails.map((emailItem, index) => (
            <div
              key={`${emailItem.subject}-${emailItem.from}-${emailItem.date}`}
              className="new-email-item"
            >
              <div className="email-header">
                <h3>📩 {emailItem.subject}</h3>
                <p>
                  <strong>보낸 사람:</strong> {emailItem.from}
                </p>
                <p>
                  <strong>받은 날짜:</strong> {emailItem.date}
                </p>
                {emailItem.classification && (
                  <p>
                    <strong>분류:</strong>{" "}
                    {emailItem.classification.replace(/\.$/, "")}
                  </p>
                )}
              </div>

              <div className="ai-summary-box">
                <span className="ai-summary-label">🧠 AI 요약본</span>:<br />
                {emailItem.summary}
              </div>

              {index < emails.length - 1 && <hr className="email-separator" />}
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    // ✅ 단일 메일인 경우 (기존 로직 유지)
    const singleEmail = emails[0];
    return (
      <div className="mail-detail">
        <h2>{singleEmail.subject}</h2>
        <p>
          <strong>보낸 사람:</strong> {singleEmail.from}
        </p>
        <p>
          <strong>받은 날짜:</strong> {singleEmail.date}
        </p>
        {singleEmail.classification && (
          <p>
            <strong>분류:</strong>{" "}
            {singleEmail.classification.replace(/\.$/, "")}
          </p>
        )}
        <hr />
        <div className="ai-summary-box">
          <span className="ai-summary-label">🧠 AI 요약본</span>:<br />
          {singleEmail.summary}
        </div>
      </div>
    );
  }
};

export default MailDetail;
