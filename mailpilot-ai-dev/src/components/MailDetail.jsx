import React, { useState, useEffect } from "react";
import "./MailDetail.css";

const MailDetail = ({ email, onDeleteEmail, onNextEmail, emailList }) => {
  // 외부 콘텐츠 표시 설정
  const [externalContent, setExternalContent] = useState('confirm'); // 'confirm', 'always'
  const [showExternalContent, setShowExternalContent] = useState(false);
  
  // 다음 메일 자동 표시 설정
  const [autoShowNext, setAutoShowNext] = useState(false);

  // 설정 불러오기
  useEffect(() => {
    fetchReadSettings();
  }, []);

  const fetchReadSettings = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        console.error('[MailDetail] 사용자 이메일이 없습니다.');
        return;
      }
      
      const response = await fetch(`http://localhost:5001/api/settings/GENERAL/READ?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.settings) {
        console.log('[📧 MailDetail] 읽기 설정 로드:', data.settings);
        
        // 외부 콘텐츠 표시 설정 적용
        if (data.settings.externalContent) {
          console.log('[📧 MailDetail] 외부 콘텐츠 설정 적용:', data.settings.externalContent);
          setExternalContent(data.settings.externalContent);
          
          // 'always'인 경우 자동으로 외부 콘텐츠 표시
          if (data.settings.externalContent === 'always') {
            setShowExternalContent(true);
          }
        }
        
        // 다음 메일 자동 표시 설정 적용
        if (data.settings.autoShowNext !== undefined) {
          console.log('[📧 MailDetail] 다음 메일 자동 표시 설정 적용:', data.settings.autoShowNext);
          setAutoShowNext(data.settings.autoShowNext);
        }
      }
    } catch (error) {
      console.error('[MailDetail] 설정 불러오기 실패:', error);
    }
  };

  // 외부 콘텐츠 표시 허용
  const handleShowExternalContent = () => {
    setShowExternalContent(true);
  };

  // 외부 콘텐츠 포함 여부 확인
  const hasExternalContent = (content) => {
    if (!content) return false;
    // 간단한 외부 링크/이미지 감지 (실제로는 더 정교한 로직 필요)
    return content.includes('http://') || content.includes('https://') || content.includes('<img');
  };

  // 콘텐츠 처리 (외부 콘텐츠 숨김/표시)
  const processContent = (content) => {
    if (!content) return content;
    if (externalContent === 'always' || showExternalContent) {
      return content; // 외부 콘텐츠 표시
    }
    
    if (externalContent === 'never' || (externalContent === 'confirm' && !showExternalContent)) {
      // 외부 콘텐츠 숨김 처리
      let processedContent = content;
      
      // 외부 이미지 숨김
      processedContent = processedContent.replace(
        /<img[^>]*src=["'](https?:\/\/[^"']*\.(jpg|jpeg|png|gif|webp|svg))["'][^>]*>/gi, 
        '<span style="background:#f0f0f0;padding:5px;border-radius:4px;display:inline-block;">[🚫 외부 이미지 차단됨]</span>'
      );
      
      // iframe 숨김
      processedContent = processedContent.replace(
        /<iframe[^>]*src=["'](https?:\/\/[^"']*)["'][^>]*>.*?<\/iframe>/gi,
        '<span style="background:#f0f0f0;padding:5px;border-radius:4px;display:inline-block;">[🚫 외부 콘텐츠 차단됨]</span>'
      );
      
      return processedContent;
    }
    
    return content;
  };

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

        {/* 외부 콘텐츠 경고 배너 */}
        {externalContent === 'confirm' && !showExternalContent && emails.some(e => hasExternalContent(e.summary)) && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '12px',
            margin: '16px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <span>이 메일에 외부 이미지/링크가 포함되어 있습니다.</span>
            </div>
            <button 
              onClick={handleShowExternalContent}
              style={{
                padding: '6px 12px',
                border: '1px solid #f39c12',
                borderRadius: '4px',
                background: '#f39c12',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              외부 콘텐츠 표시
            </button>
          </div>
        )}

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
                <div className="summary-content" dangerouslySetInnerHTML={{__html: processContent(emailItem.summary)}} />
              </div>

              {/* ✅ 첨부파일 요약 추가 */}
              {emailItem.attachment_summary && (
                <div className="attachment-summary-section">
                  <div className="summary-header">
                    <span className="ai-icon">📄</span>
                    <span className="summary-title">첨부파일 요약</span>
                  </div>
                  <div className="summary-content attachment-summary" dangerouslySetInnerHTML={{__html: processContent(emailItem.attachment_summary)}} />
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

        {/* 단일 메일 외부 콘텐츠 경고 배너 */}
        {externalContent === 'confirm' && !showExternalContent && (hasExternalContent(singleEmail.summary) || hasExternalContent(singleEmail.attachment_summary)) && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '12px',
            margin: '16px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <span>이 메일에 외부 이미지/링크가 포함되어 있습니다.</span>
            </div>
            <button 
              onClick={handleShowExternalContent}
              style={{
                padding: '6px 12px',
                border: '1px solid #f39c12',
                borderRadius: '4px',
                background: '#f39c12',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              외부 콘텐츠 표시
            </button>
          </div>
        )}

        <div className="ai-summary-section single">
          <div className="summary-header">
            <span className="ai-icon">🧠</span>
            <span className="summary-title">AI 요약</span>
          </div>
          <div className="summary-content" dangerouslySetInnerHTML={{__html: processContent(singleEmail.summary)}} />
        </div>

        {/* ✅ 첨부파일 요약 추가 (단일 메일) */}
        {singleEmail.attachment_summary && (
          <div className="attachment-summary-section single">
            <div className="summary-header">
              <span className="ai-icon">📄</span>
              <span className="summary-title">첨부파일 요약</span>
            </div>
            <div className="summary-content attachment-summary" dangerouslySetInnerHTML={{__html: processContent(singleEmail.attachment_summary)}} />
          </div>
        )}
      </div>
    );
  }
};

export default MailDetail;
