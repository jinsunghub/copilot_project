import React, { useState, useEffect } from "react";
import "./WriteMail.css";

const WriteMail = ({ onBack, email, appPassword, selectedEmail }) => {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRegeneratingAI, setIsRegeneratingAI] = useState(false);
  
  // 폰트 설정
  const [fontSettings, setFontSettings] = useState({
    fontFamily: '기본글꼴',
    fontSize: '14px'
  });
  
  // 보내는 정보 설정
  const [senderSettings, setSenderSettings] = useState({
    senderName: ''
  });

  // 편집기 설정
  // const [editorType, setEditorType] = useState('html'); // HTML 에디터 비활성화

  // 나를 항상 포함 설정
  const [includeMe, setIncludeMe] = useState('none'); // 'cc', 'bcc', 'none'

  // 개별 발송 설정
  const [individualSend, setIndividualSend] = useState('disabled'); // 'enabled', 'disabled'

  // 발송 전 미리보기 설정
  const [previewMode, setPreviewMode] = useState('none'); // 'all', 'important', 'none'
  const [previewConditions, setPreviewConditions] = useState([]); // ['importantMail', 'externalRecipient']
  const [showPreview, setShowPreview] = useState(false);

  // 대기 발송 설정
  const [delayedSend, setDelayedSend] = useState('disabled'); // 'enabled', 'disabled'
  const [delayMinutes, setDelayMinutes] = useState(5);
  const [isDelayedSending, setIsDelayedSending] = useState(false);
  
  // 철자 검사 설정
  const [spellCheck, setSpellCheck] = useState(false);
  
  // 자동 저장 기능 제거됨

  // 서명 설정
  const [signatureEnabled, setSignatureEnabled] = useState(false);
  const [userSignature, setUserSignature] = useState('');

  // 설정 불러오기
  useEffect(() => {
    // 컴포넌트가 마운트되거나 selectedEmail이 변경될 때마다 설정 다시 가져오기
    fetchWriteSettings();
    fetchSignatureSettings();

    // 서명 업데이트 이벤트 리스너 등록
    const handleSignatureUpdate = () => {
      console.log('[✍️ WriteMail] 서명 업데이트 이벤트 수신');
      fetchSignatureSettings();
    };
    
    // 설정 업데이트 이벤트 리스너 등록 (설정 창에서 돌아올 때)
    const handleSettingsUpdate = () => {
      console.log('[✍️ WriteMail] 설정 업데이트 이벤트 수신');
      fetchWriteSettings();
      fetchSignatureSettings();
    };
    
    // 창 포커스 시 설정 다시 가져오기 (설정 창에서 돌아올 때)
    const handleFocus = () => {
      console.log('[✍️ WriteMail] 창 포커스 - 설정 새로고침');
      fetchWriteSettings();
      fetchSignatureSettings();
    };

    window.addEventListener('signatureUpdated', handleSignatureUpdate);
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    window.addEventListener('focus', handleFocus);

    // 클린업 함수
    return () => {
      window.removeEventListener('signatureUpdated', handleSignatureUpdate);
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  // 자동 저장 기능 제거됨
  
  // 임시 저장 기능 제거됨

  useEffect(() => {
    if (selectedEmail) {
      setTo(selectedEmail.to || "");
      setSubject(selectedEmail.subject || "");
      
      // 답장 시에는 원본 메일 본문만 사용 (서명은 백엔드에서 자동 추가됨)
      const emailBody = selectedEmail.body || "";
      setBody(emailBody);

      console.log("[📝 WriteMail] 메일 정보 로드됨", {
        to: selectedEmail.to,
        subject: selectedEmail.subject,
        isAIGenerated: selectedEmail.isAIGenerated
      });
    }
  }, [selectedEmail]); // signatureEnabled, userSignature 의존성 제거

  const fetchWriteSettings = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        console.error('[WriteMail] 사용자 이메일이 없습니다.');
        return;
      }
      
      const response = await fetch(`http://localhost:5001/api/settings/GENERAL/WRITE?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.settings) {
        console.log('[✍️ WriteMail] 설정 로드:', data.settings);
        
        // 폰트 설정 적용
        if (data.settings.fontFamily || data.settings.fontSize) {
          setFontSettings({
            fontFamily: data.settings.fontFamily || '기본글꼴',
            fontSize: data.settings.fontSize || '14px'
          });
        }
        
        // 보내는 정보 설정 적용
        if (data.settings.senderName !== undefined) {
          setSenderSettings({
            senderName: data.settings.senderName || ''
          });
        }

        // 편집기 타입 설정 적용
        // HTML 에디터 비활성화
        // if (data.settings.editorType) {
        //   console.log('[✍️ WriteMail] 편집기 타입 설정 적용:', data.settings.editorType);
        //   setEditorType(data.settings.editorType);
        // }

        // 나를 항상 포함 설정 적용
        if (data.settings.includeMe) {
          console.log('[✍️ WriteMail] 나를 항상 포함 설정 적용:', data.settings.includeMe);
          setIncludeMe(data.settings.includeMe);
          
          // 나를 자동으로 포함
          if (data.settings.includeMe === 'cc') {
            setCc(prev => prev ? `${prev}, ${email}` : email);
          } else if (data.settings.includeMe === 'bcc') {
            setBcc(prev => prev ? `${prev}, ${email}` : email);
          }
        }

        // 개별 발송 설정 적용
        if (data.settings.individualSend) {
          console.log('[✍️ WriteMail] 개별 발송 설정 적용:', data.settings.individualSend);
          setIndividualSend(data.settings.individualSend);
        }

        // 발송 전 미리보기 설정 적용
        if (data.settings.previewMode) {
          console.log('[✍️ WriteMail] 발송 전 미리보기 설정 적용:', data.settings.previewMode);
          setPreviewMode(data.settings.previewMode);
        }
        
        if (data.settings.previewConditions) {
          console.log('[✍️ WriteMail] 미리보기 조건 설정 적용:', data.settings.previewConditions);
          setPreviewConditions(data.settings.previewConditions);
        }

        // 대기 발송 설정 적용
        if (data.settings.delayedSend) {
          console.log('[✍️ WriteMail] 대기 발송 설정 적용:', data.settings.delayedSend);
          setDelayedSend(data.settings.delayedSend);
        }
        
        if (data.settings.delayMinutes) {
          console.log('[✍️ WriteMail] 대기 시간 설정 적용:', data.settings.delayMinutes);
          setDelayMinutes(data.settings.delayMinutes);
        }
        
        // 철자 검사 설정 적용
        if (data.settings.spellCheck !== undefined) {
          console.log('[✍️ WriteMail] 철자 검사 설정 적용:', data.settings.spellCheck);
          setSpellCheck(data.settings.spellCheck);
        }
        
        // 자동 저장 설정 제거됨
      }
    } catch (error) {
      console.error('[WriteMail] 설정 불러오기 실패:', error);
    }
  };

  const fetchSignatureSettings = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        console.error('[WriteMail] 사용자 이메일이 없습니다.');
        return;
      }
      
      // 서명 사용 설정 불러오기
      const signatureResponse = await fetch(`http://localhost:5001/api/settings/MY_EMAIL/SIGNATURE_MANAGEMENT?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });
      const signatureData = await signatureResponse.json();
      
      if (signatureData.success && signatureData.settings) {
        console.log('[✍️ WriteMail] 서명 설정 로드:', signatureData.settings);
        
        if (signatureData.settings.enabled !== undefined) {
          setSignatureEnabled(signatureData.settings.enabled);
        }
      }

      // 서명 내용 불러오기 (기존 서명 API 사용)
      // userEmail은 이미 위에서 선언됨
      const signaturesResponse = await fetch('http://localhost:5001/api/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      });
      
      const signaturesData = await signaturesResponse.json();
      if (signaturesData.success && signaturesData.signatures.length > 0) {
        // 첫 번째 서명을 기본 서명으로 사용
        const signature = signaturesData.signatures[0];
        const signatureContent = signature.is_html && signature.html_content 
          ? signature.html_content 
          : signature.content || '';
        
        setUserSignature(signatureContent);
        console.log('[✍️ WriteMail] 기본 서명 로드 완료');
        
        // 서명은 백엔드에서 메일 발송 시 자동 추가되므로 프론트엔드에서는 추가하지 않음
      }
      
    } catch (error) {
      console.error('[WriteMail] 서명 설정 불러오기 실패:', error);
    }
  };

  // 미리보기 필요 여부 확인
  const shouldShowPreview = () => {
    if (previewMode === 'none') return false;
    if (previewMode === 'all') return true;
    
    if (previewMode === 'important' && previewConditions.length > 0) {
      // 중요 메일 조건 체크
      if (previewConditions.includes('importantMail')) {
        const isImportantMail = subject.includes('!') || body.includes('긴급') || body.includes('urgent');
        if (isImportantMail) return true;
      }
      
      // 외부 수신인 조건 체크
      if (previewConditions.includes('externalRecipient')) {
        const hasExternalRecipient = to.includes('@') && !to.includes('@gmail.com');
        if (hasExternalRecipient) return true;
      }
    }
    
    return false;
  };

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // 미리보기 확인
    if (shouldShowPreview() && !showPreview) {
      setShowPreview(true);
      return;
    }

    // 대기 발송 처리
    if (delayedSend === 'enabled' && !isDelayedSending) {
      setIsDelayedSending(true);
      const sendTime = new Date(Date.now() + delayMinutes * 60 * 1000);
      
      alert(`🕐 메일이 ${delayMinutes}분 후 (${sendTime.toLocaleTimeString()})에 발송됩니다.`);
      
      setTimeout(() => {
        setIsDelayedSending(false);
        handleSend(); // 대기 시간 후 실제 발송
      }, delayMinutes * 60 * 1000);
      
      return;
    }

    setIsSending(true);

    const payload = {
      email,
      app_password: appPassword,
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      body,
      individualSend: individualSend === 'enabled',
    };

    try {
      console.log("[📤 메일 전송 시작]", {
        to,
        subject: subject.substring(0, 30) + "...",
      });

      const response = await fetch("http://localhost:5001/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ 세션 쿠키 포함
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("[✅ 메일 전송 성공]");

        if (selectedEmail?.isAIGenerated) {
          alert("🤖 AI가 생성한 답장이 성공적으로 전송되었습니다!");
        } else {
          alert("✅ 메일이 성공적으로 전송되었습니다.");
        }
        onBack(); // 작성 화면 닫기
      } else {
        console.error("[❗메일 전송 실패]", data.error);

        // 401 오류 (인증 실패) 처리
        if (response.status === 401) {
          alert("❗ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");

          // 3초 후 페이지 새로고침으로 로그인 화면으로 이동
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          alert("❗메일 전송 실패: " + data.error);
        }
      }
    } catch (error) {
      console.error("[❗메일 전송 오류]", error);
      alert("메일 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateNewAI = async () => {
    if (!selectedEmail?.isAIGenerated) {
      alert("AI 답장이 아닙니다.");
      return;
    }

    setIsRegeneratingAI(true);

    try {
      console.log("[🔄 AI 답장 재생성 시작]");

      // 원본 메일 정보 추출 (현재 body에서 추출)
      const bodyLines = body.split("\n");
      const originalBodyStart = bodyLines.findIndex((line) =>
        line.includes("---------------------------------------------------")
      );

      if (originalBodyStart === -1) {
        alert("원본 메일 정보를 찾을 수 없습니다.");
        setIsRegeneratingAI(false);
        return;
      }

      // 원본 메일 본문 추출
      const originalBody = bodyLines.slice(originalBodyStart + 2).join("\n");
      const originalSubject = subject.replace("RE: ", ""); // RE: 제거

      console.log("[🤖 AI 답장 재생성 요청]", { to, originalSubject });

      // 새로운 AI 답장 생성 요청
      const response = await fetch(
        "http://localhost:5001/api/generate-ai-reply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // ✅ 세션 쿠키 포함
          body: JSON.stringify({
            sender: to, // 수신자가 원래 발신자
            subject: originalSubject,
            body: originalBody,
            email: email, // ✅ 현재 사용자 이메일 추가
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("[✅ AI 답장 재생성 완료]");

        // 새로운 AI 답장으로 본문 업데이트
        const originalPart = bodyLines.slice(originalBodyStart).join("\n");
        setBody(data.ai_reply + "\n" + originalPart);
        alert("🤖 새로운 AI 답장이 생성되었습니다!");
      } else {
        console.error("[❗AI 답장 재생성 실패]", data.error);

        // 401 오류 (인증 실패) 처리
        if (response.status === 401) {
          alert("❗ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");

          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          alert(`AI 답장 재생성 실패: ${data.error}`);
        }
      }
    } catch (error) {
      console.error("[❗AI 답장 재생성 오류]", error);
      alert("AI 답장 재생성 중 오류가 발생했습니다.");
    } finally {
      setIsRegeneratingAI(false);
    }
  };

  // ✅ 문자 수 카운터 함수
  const getCharacterCount = (text) => {
    return text.length;
  };

  // ✅ 긴급도 체크 함수
  const getUrgencyLevel = () => {
    const urgentKeywords = ["긴급", "즉시", "급함", "urgent", "asap", "빨리"];
    const bodyLower = body.toLowerCase();
    const subjectLower = subject.toLowerCase();

    const hasUrgentKeyword = urgentKeywords.some(
      (keyword) => bodyLower.includes(keyword) || subjectLower.includes(keyword)
    );

    return hasUrgentKeyword ? "🚨 긴급" : "📋 일반";
  };

  // 미리보기에서 발송 확인
  const handlePreviewSend = () => {
    setShowPreview(false);
    // handleSend를 다시 호출하되, 미리보기는 건너뛰도록 설정
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  // 미리보기 취소
  const handlePreviewCancel = () => {
    setShowPreview(false);
  };

  return (
    <div className="mail-content">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        <h2>
          📨 새 메일 작성
          {selectedEmail?.isAIGenerated && (
            <span style={{ color: "#4CAF50" }}> (🤖 AI 생성)</span>
          )}
        </h2>

        {/* ✅ 현재 사용자 표시 */}
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            backgroundColor: "#f5f5f5",
            padding: "4px 8px",
            borderRadius: "12px",
          }}
        >
          👤 {senderSettings.senderName ? `${senderSettings.senderName} (${email})` : email}
        </div>
      </div>

      <input
        type="text"
        name="to"
        placeholder="수신자"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="mail-input"
        disabled={isSending || isRegeneratingAI || isDelayedSending}
      />

      {/* CC 필드 */}
      <input
        type="text"
        name="cc"
        placeholder="참조 (CC)"
        value={cc}
        onChange={(e) => setCc(e.target.value)}
        className="mail-input"
        disabled={isSending || isRegeneratingAI || isDelayedSending}
        style={{ backgroundColor: includeMe === 'cc' ? '#e8f5e8' : 'inherit' }}
      />

      {/* BCC 필드 */}
      <input
        type="text"
        name="bcc"
        placeholder="숨은참조 (BCC)"
        value={bcc}
        onChange={(e) => setBcc(e.target.value)}
        className="mail-input"
        disabled={isSending || isRegeneratingAI || isDelayedSending}
        style={{ backgroundColor: includeMe === 'bcc' ? '#e8f5e8' : 'inherit' }}
      />

      <input
        type="text"
        name="subject"
        placeholder="제목"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mail-input"
        disabled={isSending || isRegeneratingAI || isDelayedSending}
      />

      {/* ✅ 메일 정보 표시 */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          fontSize: "12px",
          color: "#666",
          marginBottom: "10px",
        }}
      >
        <span>📊 본문 글자 수: {getCharacterCount(body)}</span>
        <span>⚡ {getUrgencyLevel()}</span>
        <span>✏️ 편집기: 일반 텍스트</span>
        {includeMe !== 'none' && (
          <span>👤 나 포함: {includeMe === 'cc' ? '참조' : includeMe === 'bcc' ? '숨은참조' : '없음'}</span>
        )}
        {individualSend === 'enabled' && (
          <span>📨 개별 발송</span>
        )}
        {previewMode !== 'none' && (
          <span>🔍 미리보기: {previewMode === 'all' ? '모든 메일' : previewMode === 'important' ? '중요 메일' : '없음'}</span>
        )}
        {delayedSend === 'enabled' && (
          <span>🕐 대기 발송: {delayMinutes}분</span>
        )}
        {isDelayedSending && (
          <span style={{ color: '#ff9800' }}>⏳ 발송 대기 중...</span>
        )}
        {signatureEnabled && (
          <span>✍️ 서명 포함 (백엔드에서 자동 추가)</span>
        )}
      </div>

      {/* 일반 textarea만 사용 (HTML 에디터 비활성화) */}
      <textarea
          name="body"
          placeholder="본문"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mail-textarea"
          style={{ 
            minHeight: "300px",
            fontFamily: fontSettings.fontFamily === '기본글꼴' ? 'inherit' : fontSettings.fontFamily,
            fontSize: fontSettings.fontSize
          }}
          disabled={isSending || isRegeneratingAI || isDelayedSending}
          spellCheck={spellCheck}
        />

      <div
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          className="setting-button"
          onClick={handleSend}
          disabled={isSending || isRegeneratingAI || isDelayedSending}
          style={{
            backgroundColor: isSending || isRegeneratingAI || isDelayedSending ? "#ccc" : "#2196F3",
            cursor: isSending || isRegeneratingAI || isDelayedSending ? "not-allowed" : "pointer",
          }}
        >
          {isSending ? "전송 중..." : isDelayedSending ? `🕐 ${delayMinutes}분 후 발송` : delayedSend === 'enabled' ? `🕐 ${delayMinutes}분 후 발송` : "📤 전송"}
        </button>

        <button
          className="setting-button back-button"
          onClick={onBack}
          disabled={isSending || isRegeneratingAI || isDelayedSending}
        >
          ⬅️ 뒤로가기
        </button>

        {selectedEmail?.isAIGenerated && (
          <button
            className="setting-button"
            onClick={handleGenerateNewAI}
            style={{
              backgroundColor: isRegeneratingAI ? "#ccc" : "#FF9800",
              cursor: isRegeneratingAI ? "not-allowed" : "pointer",
            }}
            disabled={isSending || isRegeneratingAI || isDelayedSending}
          >
            {isRegeneratingAI ? "🔄 생성 중..." : "🔄 AI 답장 다시 생성"}
          </button>
        )}
      </div>

      {selectedEmail?.isAIGenerated && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#E8F5E8",
            borderRadius: "5px",
            fontSize: "14px",
            color: "#2E7D32",
          }}
        >
          💡 <strong>팁:</strong> AI가 생성한 답장입니다. 내용을 검토하고 필요시
          수정한 후 전송하세요. "AI 답장 다시 생성" 버튼으로 새로운 답장을
          생성할 수 있습니다.
        </div>
      )}

      {/* ✅ 개발 모드에서 디버그 정보 표시 */}
      {process.env.NODE_ENV === "development" && selectedEmail && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "5px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          🔧 <strong>디버그 정보:</strong>
          <br />
          AI 생성: {selectedEmail.isAIGenerated ? "예" : "아니오"}
          <br />
          원본 제목: {selectedEmail.subject || "없음"}
          <br />
          원본 발신자: {selectedEmail.from || "없음"}
        </div>
      )}

      {/* 발송 전 미리보기 모달 */}
      {showPreview && (
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
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            width: '90%'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px',
              borderBottom: '1px solid #eee',
              paddingBottom: '12px'
            }}>
              <h3 style={{ margin: 0, color: '#2d3748' }}>📧 발송 전 미리보기</h3>
              <button 
                onClick={handlePreviewCancel}
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
              <div style={{ marginBottom: '12px' }}>
                <strong>보낸 사람:</strong> {senderSettings.senderName ? `${senderSettings.senderName} (${email})` : email}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>받는 사람:</strong> {to}
              </div>
              {cc && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>참조:</strong> {cc}
                </div>
              )}
              {bcc && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>숨은참조:</strong> {bcc}
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <strong>제목:</strong> {subject}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>📝 본문 내용</h4>
              <div style={{
                whiteSpace: 'pre-wrap',
                fontFamily: fontSettings.fontFamily === '기본글꼴' ? 'inherit' : fontSettings.fontFamily,
                fontSize: fontSettings.fontSize,
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {body}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '12px',
              color: '#666',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <span>📊 글자 수: {getCharacterCount(body)}</span>
              <span>⚡ {getUrgencyLevel()}</span>
              {individualSend === 'enabled' && <span>📨 개별 발송</span>}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handlePreviewCancel}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handlePreviewSend}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#2196F3',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                📤 발송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WriteMail;
