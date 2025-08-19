import React, { useState, useEffect } from "react";

const MailList = ({ emails, onSelectEmail, selectedIds, setSelectedIds, onEmailDeleted, onRefresh }) => {
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // 설정 관련 상태
  const [autoSelectFirstMail, setAutoSelectFirstMail] = useState(false);
  const [popupInListView, setPopupInListView] = useState(false);
  const [emailsPerPage, setEmailsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60);
  
  // 설정 불러오기
  useEffect(() => {
    fetchListSettings();
    
    // 설정 업데이트 이벤트 리스너
    const handleSettingsUpdate = () => {
      console.log('[📧 MailList] 설정 업데이트 이벤트 수신, 설정 다시 로드');
      fetchListSettings();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);
  
  // 첫 메일 자동선택
  useEffect(() => {
    if (autoSelectFirstMail && emails.length > 0 && onSelectEmail) {
      console.log('[📧 MailList] 첫 메일 자동선택 실행');
      onSelectEmail(emails[0]);
    }
  }, [emails, autoSelectFirstMail]);
  
  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0 && onRefresh) {
      console.log(`[🔄 MailList] 자동 새로고침 시작 - ${refreshInterval}초 간격`);
      
      const intervalId = setInterval(() => {
        console.log('[🔄 MailList] 자동 새로고침 실행');
        onRefresh();
      }, refreshInterval * 1000);
      
      return () => {
        console.log('[🔄 MailList] 자동 새로고침 중지');
        clearInterval(intervalId);
      };
    }
  }, [autoRefresh, refreshInterval, onRefresh]);
  
  const fetchListSettings = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) return;
      
      const response = await fetch(`http://localhost:5001/api/settings/GENERAL/READ?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.settings) {
        console.log('[📧 MailList] 설정 로드:', data.settings);
        
        // 새로운 설정 구조에서 페이지당 표시할 메일 수 가져오기
        if (data.settings.itemsPerPage) {
          setEmailsPerPage(data.settings.itemsPerPage);
        }
      }
    } catch (error) {
      console.error('[MailList] 설정 불러오기 실패:', error);
    }
  };

  const toggleCheckbox = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  // 메일 클릭 처리 (팝업 읽기 지원)
  const handleEmailClick = (email) => {
    if (popupInListView) {
      // 팝업으로 메일 열기
      const popupWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      if (popupWindow) {
        popupWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${email.subject}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 20px;
                margin: 0;
                background: #f5f5f5;
              }
              .email-container {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .email-header {
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }
              .email-subject {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
              }
              .email-meta {
                color: #666;
                font-size: 14px;
                margin: 5px 0;
              }
              .email-body {
                line-height: 1.6;
                color: #333;
                white-space: pre-wrap;
              }
              .attachments {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #e0e0e0;
              }
              .attachment-item {
                display: inline-block;
                padding: 5px 10px;
                margin: 5px;
                background: #f0f0f0;
                border-radius: 5px;
                font-size: 13px;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <div class="email-subject">${email.subject}</div>
                <div class="email-meta"><strong>보낸 사람:</strong> ${email.from}</div>
                <div class="email-meta"><strong>날짜:</strong> ${email.date}</div>
                ${email.to ? `<div class="email-meta"><strong>받는 사람:</strong> ${email.to}</div>` : ''}
              </div>
              <div class="email-body">${email.body || '내용 없음'}</div>
              ${email.attachments && email.attachments.length > 0 ? `
                <div class="attachments">
                  <strong>첨부파일:</strong>
                  ${email.attachments.map(att => 
                    `<span class="attachment-item">📎 ${att.filename || '파일'}</span>`
                  ).join('')}
                </div>
              ` : ''}
            </div>
          </body>
          </html>
        `);
        popupWindow.document.close();
      }
    } else {
      // 기존 방식으로 메일 선택
      onSelectEmail(email);
    }
  };

  // ✅ 객체별 색상 매핑 (기존과 동일)
  const getObjectColor = (objectClass) => {
    const colorMap = {
      'person': '#4CAF50',
      'car': '#2196F3', 
      'dog': '#FF9800',
      'cat': '#E91E63',
      'laptop': '#9C27B0',
      'phone': '#00BCD4',
      'book': '#FF5722',
      'bottle': '#3F51B5',
      'food': '#FFC107',
      'chair': '#795548',
      'table': '#607D8B',
      'stop sign': '#e53e3e',
      'orange': '#ff9800',
      'truck': '#607d8b',
      'bus': '#4caf50'
    };
    return colorMap[objectClass.toLowerCase()] || '#757575';
  };

  // ✅ 객체별 이모지 매핑 (기존과 동일)
  const getObjectEmoji = (objectClass) => {
    const emojiMap = {
      'person': '👤',
      'car': '🚗',
      'dog': '🐕',
      'cat': '🐱',
      'laptop': '💻',
      'phone': '📱',
      'book': '📚',
      'bottle': '🍼',
      'food': '🍕',
      'chair': '🪑',
      'table': '🪑',
      'stop sign': '🛑',
      'orange': '🍊',
      'truck': '🚛',
      'bus': '🚌'
    };
    return emojiMap[objectClass.toLowerCase()] || '📷';
  };

  // ✅ 새로운 함수: 문서 타입별 아이콘과 색상
  const getDocumentInfo = (attachment) => {
    const typeMap = {
      'document_pdf': { icon: '📄', color: '#d32f2f', name: 'PDF' },
      'document_word': { icon: '📝', color: '#1976d2', name: 'Word' },
      'document_presentation': { icon: '📊', color: '#f57c00', name: 'PPT' },
      'document_spreadsheet': { icon: '📈', color: '#388e3c', name: 'Excel' },
      'image': { icon: '🖼️', color: '#7b1fa2', name: 'Image' },
      'other': { icon: '📎', color: '#616161', name: 'File' }
    };
    
    return typeMap[attachment.type] || typeMap['other'];
  };

  // ✅ 새로운 함수: 문서 상세 정보 가져오기
  const showDocumentDetails = async (attachment, emailId) => {
    try {
      const userEmail = localStorage.getItem('email');
      
      const response = await fetch('http://localhost:5001/api/document-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email_id: emailId,
          filename: attachment.filename,
          email: userEmail
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedDocument(data);
        setDocumentModalVisible(true);
      } else {
        alert(`문서 정보를 가져올 수 없습니다: ${data.error}`);
      }
    } catch (error) {
      console.error('문서 정보 요청 오류:', error);
      alert('문서 정보 요청 중 오류가 발생했습니다.');
    }
  };

  // ✅ 문서 모달 컴포넌트
  const DocumentModal = () => {
    if (!documentModalVisible || !selectedDocument) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '16px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#2d3748' }}>📄 문서 상세 정보</h3>
            <button 
              onClick={() => setDocumentModalVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#a0aec0'
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <p><strong>파일명:</strong> {selectedDocument.filename}</p>
            <p><strong>파일 타입:</strong> {selectedDocument.file_type}</p>
            <p><strong>크기:</strong> {(selectedDocument.size / 1024).toFixed(1)} KB</p>
            {selectedDocument.pages && <p><strong>페이지:</strong> {selectedDocument.pages}개</p>}
            {selectedDocument.slides && <p><strong>슬라이드:</strong> {selectedDocument.slides}개</p>}
            {selectedDocument.sheets && <p><strong>시트:</strong> {selectedDocument.sheets}개</p>}
          </div>

          {(selectedDocument.document_summary || selectedDocument.text_summary) && (
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              borderLeft: '4px solid #667eea',
              marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>🤖 AI 요약</h4>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                {selectedDocument.document_summary || selectedDocument.text_summary}
              </p>
            </div>
          )}

          {selectedDocument.yolo_detections && selectedDocument.yolo_detections.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>🎯 탐지된 객체</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedDocument.yolo_detections.map((obj, idx) => (
                  <span key={idx} style={{
                    backgroundColor: getObjectColor(obj),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {getObjectEmoji(obj)} {obj}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(selectedDocument.extracted_text || selectedDocument.ocr_text) && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>📝 추출된 텍스트 (미리보기)</h4>
              <div style={{
                backgroundColor: '#f1f5f9',
                padding: '12px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '200px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedDocument.extracted_text || selectedDocument.ocr_text}
                {selectedDocument.full_text_available && (
                  <p style={{ color: '#667eea', fontStyle: 'italic', marginTop: '8px' }}>
                    ... 더 많은 텍스트가 있습니다
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(emails.length / emailsPerPage);
  const startIndex = (currentPage - 1) * emailsPerPage;
  const endIndex = startIndex + emailsPerPage;
  const currentEmails = emails.slice(startIndex, endIndex);
  
  return (
    <>
      <div className="mail-list">
        {currentEmails.map((email, index) => (
          <div
            key={`${email.subject}-${email.from}-${email.date}-${index}`}
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
              onClick={() => handleEmailClick(email)}
              style={{ cursor: "pointer", flex: 1 }}
            >
              <div className="mail-subject">
                {email.subject}
                {email.tag === "중요" && (
                  <span className="important-icon">⭐</span>
                )}
                {email.classification && (
                  <span className="classification-label">
                    ({email.classification.replace(/\.$/, "")})
                  </span>
                )}
              </div>

              <div className="mail-from">{email.from}</div>
              <div className="mail-date">{email.date}</div>
              
              {/* ✅ 향상된 첨부파일 표시 영역 */}
              {email.attachments && email.attachments.length > 0 && (
                <div style={{ 
                  marginTop: "8px", 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: "6px",
                  alignItems: "center"
                }}>
                  {/* 첨부파일 총 개수 */}
                  <span style={{
                    fontSize: "11px",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    padding: "3px 8px",
                    borderRadius: "10px",
                    fontWeight: "600"
                  }}>
                    📎 {email.attachments.length}개
                  </span>

                  {/* 각 첨부파일별 처리 */}
                  {email.attachments.map((attachment, attIndex) => {
                    console.log(`첨부파일 ${attIndex}:`, attachment); // 콘솔 디버깅
                    
                    const docInfo = getDocumentInfo(attachment);
                    
                    // 이미지 파일 (항상 클릭 가능)
                    if (attachment.type === 'image') {
                      return (
                        <React.Fragment key={`img-${attIndex}`}>
                          {/* 기본 이미지 태그 - 항상 표시 */}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              showDocumentDetails(attachment, email.id);
                            }}
                            style={{
                              fontSize: "10px",
                              backgroundColor: docInfo.color,
                              color: "white",
                              padding: "3px 8px",
                              borderRadius: "10px",
                              fontWeight: "600",
                              cursor: "pointer",
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            title="클릭하여 이미지 상세보기"
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            🖼️ Image
                            {attachment.ocr_success && ' 📝'}
                            {attachment.yolo_detections?.length > 0 && ' 🎯'}
                          </span>
                        </React.Fragment>
                      );
                    }
                    
                    // 문서 파일 (클릭 가능한 태그)
                    else if (attachment.type.startsWith('document_')) {
                      return (
                        <span
                          key={`doc-${attIndex}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            showDocumentDetails(attachment, email.id);
                          }}
                          style={{
                            fontSize: "10px",
                            backgroundColor: docInfo.color,
                            color: "white",
                            padding: "3px 8px",
                            borderRadius: "10px",
                            fontWeight: "600",
                            cursor: "pointer",
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          title={`${docInfo.name} 문서 - 클릭하여 요약 보기`}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          {docInfo.icon} {docInfo.name}
                          {attachment.extraction_success && ' ✨'}
                        </span>
                      );
                    }
                    
                    // 기타 파일
                    else {
                      return (
                        <span
                          key={`other-${attIndex}`}
                          style={{
                            fontSize: "10px",
                            backgroundColor: docInfo.color,
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "8px",
                            fontWeight: "500"
                          }}
                          title={attachment.filename}
                        >
                          {docInfo.icon} {docInfo.name}
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* 페이지네이션 컨트롤 */}
      {emails.length > 0 && (
        <div className="pagination-container">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-btn prev-btn"
          >
            이전
          </button>
          
          <span className="pagination-info">
            {currentPage} / {totalPages} 페이지 (전체 {emails.length}개)
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn next-btn"
          >
            다음
          </button>
          
        </div>
      )}

      {/* ✅ 문서 상세 모달 */}
      <DocumentModal />
    </>
  );
};

export default MailList;