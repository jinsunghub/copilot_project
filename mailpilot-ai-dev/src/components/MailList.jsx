import React, { useState } from "react";

const MailList = ({ emails, onSelectEmail, selectedIds, setSelectedIds }) => {
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const toggleCheckbox = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 객체별 색상 매핑
  const getObjectColor = (objectClass) => {
    const colorMap = {
      person: "#4CAF50",
      car: "#2196F3",
      dog: "#FF9800",
      cat: "#E91E63",
      laptop: "#9C27B0",
      phone: "#00BCD4",
      book: "#FF5722",
      bottle: "#3F51B5",
      food: "#FFC107",
      chair: "#795548",
      table: "#607D8B",
      "stop sign": "#e53e3e",
      orange: "#ff9800",
      truck: "#607d8b",
      bus: "#4caf50",
    };
    return colorMap[objectClass.toLowerCase()] || "#757575";
  };

  // 객체별 이모지 매핑
  const getObjectEmoji = (objectClass) => {
    const emojiMap = {
      person: "👤",
      car: "🚗",
      dog: "🐕",
      cat: "🐱",
      laptop: "💻",
      phone: "📱",
      book: "📚",
      bottle: "🍼",
      food: "🍕",
      chair: "🪑",
      table: "🪑",
      "stop sign": "🛑",
      orange: "🍊",
      truck: "🚛",
      bus: "🚌",
    };
    return emojiMap[objectClass.toLowerCase()] || "📷";
  };

  // 문서 타입별 아이콘과 색상
  const getDocumentInfo = (attachment) => {
    const typeMap = {
      document_pdf: { icon: "📄", color: "#d32f2f", name: "PDF" },
      document_word: { icon: "📝", color: "#1976d2", name: "Word" },
      document_presentation: { icon: "📊", color: "#f57c00", name: "PPT" },
      document_spreadsheet: { icon: "📈", color: "#388e3c", name: "Excel" },
      image: { icon: "🖼️", color: "#7b1fa2", name: "Image" },
      other: { icon: "📎", color: "#616161", name: "File" },
    };

    return typeMap[attachment.type] || typeMap["other"];
  };

  // 🔧 수정된 문서 상세 정보 가져오기 함수
  const showDocumentDetails = async (attachment, emailId) => {
    try {
      const userEmail = localStorage.getItem("email");

      if (!userEmail) {
        alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
        window.location.reload();
        return;
      }

      console.log(`[📄 문서 요약 요청 시작]`);
      console.log(`  - 이메일ID: ${emailId}`);
      console.log(`  - 파일명: ${attachment.filename}`);
      console.log(`  - 파일타입: ${attachment.type}`);
      console.log(`  - 첨부파일 전체:`, attachment);

      // 🔧 로딩 상태를 즉시 표시하고 모달 열기
      setSelectedDocument({
        filename: attachment.filename,
        file_type: attachment.type,
        loading: true,
        size: attachment.size || 0,
      });
      setDocumentModalVisible(true);

      const requestBody = {
        email_id: String(emailId),
        filename: attachment.filename,
        email: userEmail,
      };

      console.log(`[📤 요청 데이터]`, requestBody);

      const response = await fetch(
        "http://localhost:5001/api/document-summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      console.log(`[📥 응답 상태] ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[❗HTTP 오류] ${response.status}: ${errorText}`);

        if (response.status === 401) {
          setDocumentModalVisible(false);
          alert("로그인 세션이 만료되었습니다. 페이지를 새로고침합니다.");
          setTimeout(() => window.location.reload(), 1000);
          return;
        } else if (response.status === 404) {
          // 🔧 404 오류 시 디버깅 API 호출 시도
          console.log("[🔍 404 오류 - 디버깅 API 호출]");
          await debugAndRetry(userEmail, emailId, attachment);
          return;
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log(`[📥 응답 데이터]`, data);

      if (data.success) {
        console.log(`[✅ 문서 요약 성공] ${attachment.filename}`);
        setSelectedDocument({
          ...data,
          loading: false,
        });
      } else {
        throw new Error(data.error || "알 수 없는 오류");
      }
    } catch (error) {
      console.error("[❗문서 정보 요청 오류]", error);
      setDocumentModalVisible(false);

      if (error.message.includes("Failed to fetch")) {
        alert("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        alert(`문서 정보를 가져올 수 없습니다: ${error.message}`);
      }
    }
  };

  // 🆕 디버깅 및 재시도 함수
  const debugAndRetry = async (userEmail, emailId, attachment) => {
    try {
      console.log("[🔍 디버깅 시작] 첨부파일 정보 확인");

      // 1. 디버깅 API 호출
      const debugResponse = await fetch(
        "http://localhost:5001/api/debug-attachments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: userEmail }),
        }
      );

      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        console.log("[🔍 디버깅 결과]", debugData);
      }

      // 2. 첨부파일 재처리 API 호출
      console.log("[🔄 첨부파일 재처리 시도]");
      const refreshResponse = await fetch(
        "http://localhost:5001/api/refresh-email-attachments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: userEmail,
            email_id: emailId,
          }),
        }
      );

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        console.log("[✅ 재처리 성공]", refreshData);

        // 3. 재처리 후 다시 문서 요약 시도
        setTimeout(() => {
          console.log("[🔄 재시도] 문서 요약 다시 시도");
          showDocumentDetails(attachment, emailId);
        }, 1000);

        return;
      }

      // 모든 시도가 실패한 경우
      setDocumentModalVisible(false);
      alert("첨부파일을 찾을 수 없습니다. 이메일을 다시 불러와 주세요.");
    } catch (debugError) {
      console.error("[❗디버깅 오류]", debugError);
      setDocumentModalVisible(false);
      alert("문서 정보를 가져오는 중 오류가 발생했습니다.");
    }
  };

  // 문서 모달 컴포넌트 - 더 나은 요약 표시
  const DocumentModal = () => {
    if (!documentModalVisible || !selectedDocument) return null;

    const modalOverlayStyles = {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    };

    const modalContentStyles = {
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "16px",
      maxWidth: "700px",
      maxHeight: "80vh",
      overflow: "auto",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    };

    const headerStyles = {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    };

    const closeButtonStyles = {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#a0aec0",
    };

    return (
      <div style={modalOverlayStyles}>
        <div style={modalContentStyles}>
          <div style={headerStyles}>
            <h3 style={{ margin: 0, color: "#2d3748" }}>📄 문서 상세 정보</h3>
            <button
              onClick={() => setDocumentModalVisible(false)}
              style={closeButtonStyles}
            >
              ✕
            </button>
          </div>

          {/* 로딩 상태 표시 */}
          {selectedDocument.loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #e2e8f0",
                  borderLeft: "4px solid #667eea",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <p style={{ margin: 0, color: "#64748b" }}>
                📄 {selectedDocument.filename} 정보를 가져오는 중...
              </p>
            </div>
          ) : (
            <>
              {/* 파일 기본 정보 */}
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <strong>📁 파일명:</strong> {selectedDocument.filename}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>📋 파일 타입:</strong> {selectedDocument.file_type}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>📏 크기:</strong>{" "}
                  {selectedDocument.size
                    ? (selectedDocument.size / 1024).toFixed(1) + " KB"
                    : "정보 없음"}
                </p>
                {selectedDocument.text_length && (
                  <p style={{ margin: "4px 0" }}>
                    <strong>📝 텍스트 길이:</strong>{" "}
                    {selectedDocument.text_length.toLocaleString()}자
                  </p>
                )}
                {selectedDocument.extraction_method && (
                  <p style={{ margin: "4px 0" }}>
                    <strong>🔧 추출 방법:</strong>{" "}
                    {selectedDocument.extraction_method}
                  </p>
                )}
              </div>

              {/* 🔧 개선된 AI 요약 섹션 */}
              {selectedDocument.document_summary && (
                <div
                  style={{
                    backgroundColor: "#f0f8ff",
                    padding: "16px",
                    borderRadius: "12px",
                    borderLeft: "4px solid #4285f4",
                    marginBottom: "16px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      color: "#1a73e8",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    🤖 AI 요약
                  </h4>
                  <div
                    style={{
                      whiteSpace: "pre-line",
                      lineHeight: 1.6,
                      color: "#202124",
                      fontFamily:
                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    }}
                  >
                    {selectedDocument.document_summary}
                  </div>
                </div>
              )}

              {/* 전체 요약이 별도로 있는 경우 */}
              {selectedDocument.full_summary &&
                selectedDocument.full_summary !==
                  selectedDocument.document_summary && (
                  <div
                    style={{
                      backgroundColor: "#fff3e0",
                      padding: "16px",
                      borderRadius: "12px",
                      borderLeft: "4px solid #ff9800",
                      marginBottom: "16px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 12px 0", color: "#f57c00" }}>
                      📋 상세 요약
                    </h4>
                    <div style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
                      {selectedDocument.full_summary}
                    </div>
                  </div>
                )}

              {/* YOLO 객체 탐지 결과 */}
              {selectedDocument.yolo_detections &&
                selectedDocument.yolo_detections.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#2d3748" }}>
                      🎯 탐지된 객체
                    </h4>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      {selectedDocument.yolo_detections.map((obj, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: getObjectColor(obj),
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {getObjectEmoji(obj)} {obj}
                        </span>
                      ))}
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "8px",
                      }}
                    >
                      총{" "}
                      {selectedDocument.object_count ||
                        selectedDocument.yolo_detections.length}
                      개 객체 탐지됨
                    </p>
                  </div>
                )}

              {/* OCR 텍스트 */}
              {selectedDocument.ocr_text && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#2d3748" }}>
                    📝 이미지 내 텍스트 (OCR)
                  </h4>
                  <div
                    style={{
                      backgroundColor: "#f1f5f9",
                      padding: "12px",
                      borderRadius: "8px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      maxHeight: "200px",
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedDocument.ocr_text}
                  </div>
                </div>
              )}

              {/* 추출된 텍스트 미리보기 */}
              {selectedDocument.extracted_text && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#2d3748" }}>
                    📝 추출된 텍스트 (미리보기)
                  </h4>
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "8px",
                      fontFamily: "'Courier New', monospace",
                      fontSize: "11px",
                      maxHeight: "300px",
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    {selectedDocument.extracted_text}
                    {selectedDocument.has_full_text && (
                      <p
                        style={{
                          color: "#667eea",
                          fontStyle: "italic",
                          marginTop: "8px",
                        }}
                      >
                        ... 더 많은 텍스트가 있습니다 (총{" "}
                        {selectedDocument.text_length?.toLocaleString()}자)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 디버깅 정보 (개발 모드에서만) */}
              {process.env.NODE_ENV === "development" && (
                <details
                  style={{ marginTop: "16px", fontSize: "12px", color: "#666" }}
                >
                  <summary style={{ cursor: "pointer" }}>
                    🔧 디버깅 정보
                  </summary>
                  <pre
                    style={{
                      marginTop: "8px",
                      padding: "8px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "4px",
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(selectedDocument, null, 2)}
                  </pre>
                </details>
              )}
            </>
          )}
        </div>

        {/* CSS 애니메이션 */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  };

  return (
    <>
      <div className="mail-list">
        {emails.map((email, index) => (
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

              {/* 향상된 첨부파일 표시 영역 */}
              {email.attachments && email.attachments.length > 0 && (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  {/* 첨부파일 총 개수 */}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        `[📎 첨부파일 개수 클릭] 총 ${email.attachments.length}개`
                      );
                      if (email.attachments.length > 0) {
                        showDocumentDetails(email.attachments[0], email.id);
                      }
                    }}
                    style={{
                      fontSize: "11px",
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                      padding: "3px 8px",
                      borderRadius: "10px",
                      fontWeight: "600",
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "all 0.2s ease",
                    }}
                    title="클릭하여 첨부파일 목록 보기"
                  >
                    📎 {email.attachments.length}개
                  </span>

                  {/* 각 첨부파일별 처리 */}
                  {email.attachments.map((attachment, attIndex) => {
                    const docInfo = getDocumentInfo(attachment);

                    // 이미지 파일 (YOLO 객체 표시)
                    if (
                      attachment.type === "image" &&
                      attachment.yolo_detections?.length > 0
                    ) {
                      return (
                        <React.Fragment key={`img-${attIndex}`}>
                          {attachment.yolo_detections
                            .sort(
                              (a, b) =>
                                (b.confidence || 0) - (a.confidence || 0)
                            )
                            .slice(0, 3)
                            .map((detection, detIndex) => (
                              <span
                                key={`${attIndex}-${detIndex}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log(
                                    `[🖼️ 이미지 태그 클릭] ${
                                      detection.class || detection
                                    }`
                                  );
                                  showDocumentDetails(attachment, email.id);
                                }}
                                style={{
                                  fontSize: "10px",
                                  backgroundColor: getObjectColor(
                                    detection.class || detection
                                  ),
                                  color: "white",
                                  padding: "2px 6px",
                                  borderRadius: "8px",
                                  fontWeight: "500",
                                  cursor: "pointer",
                                  userSelect: "none",
                                }}
                                title={`${detection.class || detection}: ${
                                  detection.confidence
                                    ? (detection.confidence * 100).toFixed(1) +
                                      "%"
                                    : "N/A"
                                } 신뢰도 - 클릭하여 상세보기`}
                              >
                                {getObjectEmoji(detection.class || detection)}{" "}
                                {detection.class || detection}
                              </span>
                            ))}
                          {attachment.ocr_success && (
                            <span
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                showDocumentDetails(attachment, email.id);
                              }}
                              style={{
                                fontSize: "10px",
                                backgroundColor: "#9c27b0",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "8px",
                                fontWeight: "500",
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                              title="클릭하여 이미지 내 텍스트 보기"
                            >
                              📝 텍스트
                            </span>
                          )}
                        </React.Fragment>
                      );
                    }

                    // 이미지 파일이지만 YOLO 객체가 없는 경우
                    else if (attachment.type === "image") {
                      return (
                        <span
                          key={`img-simple-${attIndex}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            showDocumentDetails(attachment, email.id);
                          }}
                          style={{
                            fontSize: "10px",
                            backgroundColor: "#7b1fa2",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "8px",
                            fontWeight: "500",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                          title="클릭하여 이미지 상세보기"
                        >
                          🖼️ 이미지
                        </span>
                      );
                    }

                    // 🔧 문서 파일 - 개선된 클릭 핸들러
                    else if (attachment.type.startsWith("document_")) {
                      return (
                        <span
                          key={`doc-${attIndex}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(
                              `[📄 문서 태그 클릭] ${docInfo.name}, 파일명: ${attachment.filename}`
                            );
                            console.log(
                              `[📧 이메일 정보] ID: ${email.id}, 제목: ${email.subject}`
                            );
                            console.log(`[📎 첨부파일 정보]`, attachment);
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
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            transition: "all 0.2s ease",
                            userSelect: "none",
                          }}
                          title={`${attachment.filename} - 클릭하여 요약 보기`}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.05)";
                            e.target.style.boxShadow =
                              "0 2px 8px rgba(0, 0, 0, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          {docInfo.icon} {docInfo.name}
                          {attachment.extraction_success && " ✨"}
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
                            fontWeight: "500",
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

      {/* 문서 상세 모달 */}
      <DocumentModal />
    </>
  );
};

export default MailList;
