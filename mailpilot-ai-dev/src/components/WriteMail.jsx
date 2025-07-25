import React, { useState, useEffect } from "react";
import "./WriteMail.css";

const WriteMail = ({ onBack, email, appPassword, selectedEmail }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRegeneratingAI, setIsRegeneratingAI] = useState(false);

  useEffect(() => {
    if (selectedEmail) {
      setTo(selectedEmail.to || "");
      setSubject(selectedEmail.subject || "");
      setBody(selectedEmail.body || "");

      console.log("[📝 WriteMail] 메일 정보 로드됨", {
        to: selectedEmail.to,
        subject: selectedEmail.subject,
        isAIGenerated: selectedEmail.isAIGenerated,
      });
    }
  }, [selectedEmail]);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsSending(true);

    const payload = {
      email,
      app_password: appPassword,
      to,
      subject,
      body,
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
          👤 {email}
        </div>
      </div>

      <input
        type="text"
        name="to"
        placeholder="수신자"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="mail-input"
        disabled={isSending || isRegeneratingAI}
      />

      <input
        type="text"
        name="subject"
        placeholder="제목"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mail-input"
        disabled={isSending || isRegeneratingAI}
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
      </div>

      <textarea
        name="body"
        placeholder="본문"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="mail-textarea"
        style={{ minHeight: "300px" }}
        disabled={isSending || isRegeneratingAI}
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
          disabled={isSending || isRegeneratingAI}
          style={{
            backgroundColor: isSending || isRegeneratingAI ? "#ccc" : "#2196F3",
            cursor: isSending || isRegeneratingAI ? "not-allowed" : "pointer",
          }}
        >
          {isSending ? "전송 중..." : "📤 전송"}
        </button>

        <button
          className="setting-button back-button"
          onClick={onBack}
          disabled={isSending || isRegeneratingAI}
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
            disabled={isSending || isRegeneratingAI}
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
    </div>
  );
};

export default WriteMail;
