import React, { useState, useEffect } from "react";
import "./WriteMail.css";

const WriteMail = ({ onBack, email, appPassword, selectedEmail }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (selectedEmail) {
      setTo(selectedEmail.to || "");
      setSubject(selectedEmail.subject || "");
      setBody(selectedEmail.body || "");
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
      const response = await fetch("http://localhost:5001/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (selectedEmail?.isAIGenerated) {
          alert("🤖 AI가 생성한 답장이 성공적으로 전송되었습니다!");
        } else {
          alert("✅ 메일이 성공적으로 전송되었습니다.");
        }
        onBack(); // 작성 화면 닫기
      } else {
        alert("❗메일 전송 실패: " + data.error);
      }
    } catch (error) {
      console.error("❗에러:", error);
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

    try {
      // 원본 메일 정보 추출 (현재 body에서 추출)
      const bodyLines = body.split("\n");
      const originalBodyStart = bodyLines.findIndex((line) =>
        line.includes("---------------------------------------------------")
      );

      if (originalBodyStart === -1) {
        alert("원본 메일 정보를 찾을 수 없습니다.");
        return;
      }

      // 새로운 AI 답장 생성 요청
      const response = await fetch(
        "http://localhost:5001/api/generate-ai-reply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: to, // 수신자가 원래 발신자
            subject: subject.replace("RE: ", ""), // RE: 제거
            body: bodyLines.slice(originalBodyStart + 2).join("\n"), // 원본 메일 본문
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // 새로운 AI 답장으로 본문 업데이트
        const originalPart = bodyLines.slice(originalBodyStart).join("\n");
        setBody(data.ai_reply + "\n" + originalPart);
        alert("🤖 새로운 AI 답장이 생성되었습니다!");
      } else {
        alert(`AI 답장 재생성 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("AI 답장 재생성 오류:", error);
      alert("AI 답장 재생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="mail-content">
      <h2>
        📨 새 메일 작성
        {selectedEmail?.isAIGenerated && (
          <span style={{ color: "#4CAF50" }}> (🤖 AI 생성)</span>
        )}
      </h2>

      <input
        type="text"
        name="to"
        placeholder="수신자"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="mail-input"
      />

      <input
        type="text"
        name="subject"
        placeholder="제목"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mail-input"
      />

      <textarea
        name="body"
        placeholder="본문"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="mail-textarea"
        style={{ minHeight: "300px" }}
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
          disabled={isSending}
          style={{
            backgroundColor: isSending ? "#ccc" : "#2196F3",
            cursor: isSending ? "not-allowed" : "pointer",
          }}
        >
          {isSending ? "전송 중..." : "전송"}
        </button>

        <button
          className="setting-button back-button"
          onClick={onBack}
          disabled={isSending}
        >
          뒤로가기
        </button>

        {selectedEmail?.isAIGenerated && (
          <button
            className="setting-button"
            onClick={handleGenerateNewAI}
            style={{ backgroundColor: "#FF9800" }}
            disabled={isSending}
          >
            🔄 AI 답장 다시 생성
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
    </div>
  );
};

export default WriteMail;
