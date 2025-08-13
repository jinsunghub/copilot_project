import React from "react";
import "./MailDetail.css";

const MailDetail = ({ email }) => {
  if (!email)
    return (
      <div className="mail-detail empty">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>메일을 선택해주세요</h3>
          <p>왼쪽에서 메일을 선택하면 여기에 내용이 표시됩니다.</p>
        </div>
      </div>
    );

  // ✅ 배열인지 단일 객체인지 확인
  const isMultiple = Array.isArray(email);
  const emails = isMultiple ? email : [email];

  if (isMultiple) {
    // ✅ 메일이 여러 개인 경우 (첫 로딩 또는 새로고침)
    return (
      <div className="mail-detail">
        <div className="detail-header">
          <div className="header-icon">📧</div>
          <div className="header-text">
            <h2> 새로운 메일 {emails.length}개</h2>
            <p>새로운 메일들을 확인하세요</p>
          </div>
        </div>

        <div className="emails-container">
          {emails.map((emailItem, index) => (
            <div
              key={`${emailItem.subject}-${emailItem.from}-${emailItem.date}`}
              className="email-card"
            >
              <div className="email-header">
                <div className="subject-line">
                  <h3>{emailItem.subject}</h3>
                  {emailItem.classification && (
                    <span className="classification-tag">
                      {emailItem.classification.replace(/\.$/, "")}
                    </span>
                  )}
                </div>

                <div className="email-meta">
                  <div className="meta-item">
                    <span className="meta-label">보낸 사람</span>
                    <span className="meta-value">{emailItem.from}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">받은 시간</span>
                    <span className="meta-value">{emailItem.date}</span>
                  </div>
                </div>
              </div>

              <div className="ai-summary-section">
                <div className="summary-header">
                  <span className="ai-icon">🧠</span>
                  <span className="summary-title">AI 요약</span>
                </div>
                <div className="summary-content">{emailItem.summary}</div>
              </div>

              {/* ✅ 첨부파일 요약 추가 */}
              {emailItem.attachment_summary && (
                <div className="attachment-summary-section">
                  <div className="summary-header">
                    <span className="ai-icon">📄</span>
                    <span className="summary-title">첨부파일 요약</span>
                  </div>
                  <div className="summary-content attachment-summary">
                    {emailItem.attachment_summary}
                  </div>
                </div>
              )}
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
        <div className="detail-header single">
          <div className="header-text">
            <h2>{singleEmail.subject}</h2>
            {singleEmail.classification && (
              <span className="classification-tag">
                {singleEmail.classification.replace(/\.$/, "")}
              </span>
            )}
          </div>
        </div>

        <div className="single-email-meta">
          <div className="meta-item">
            <span className="meta-label">보낸 사람</span>
            <span className="meta-value">{singleEmail.from}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">받은 시간</span>
            <span className="meta-value">{singleEmail.date}</span>
          </div>
        </div>

        <div className="ai-summary-section single">
          <div className="summary-header">
            <span className="ai-icon">🧠</span>
            <span className="summary-title">AI 요약</span>
          </div>
          <div className="summary-content">{singleEmail.summary}</div>
        </div>

        {/* ✅ 첨부파일 요약 추가 (단일 메일) */}
        {singleEmail.attachment_summary && (
          <div className="attachment-summary-section single">
            <div className="summary-header">
              <span className="ai-icon">📄</span>
              <span className="summary-title">첨부파일 요약</span>
            </div>
            <div className="summary-content attachment-summary">
              {singleEmail.attachment_summary}
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default MailDetail;
