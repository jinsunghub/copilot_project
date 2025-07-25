// ===== Chatbot.js =====
import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const Chatbot = ({ email, appPassword }) => {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "안녕하세요! 메일 관리 AI 어시스턴트입니다. 무엇을 도와드릴까요?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue; // 입력값 저장
    setInputValue("");
    setIsLoading(true);

    try {
      console.log("[🤖 챗봇 요청]", currentInput);

      const response = await fetch("http://localhost:5001/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ 세션 쿠키 포함
        body: JSON.stringify({
          email: email,
          app_password: appPassword,
          user_input: currentInput,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("[✅ 챗봇 응답]", data.action, data.confidence);

        const botMessage = {
          type: "bot",
          content: data.response || "죄송합니다. 처리 중 오류가 발생했습니다.",
          timestamp: new Date(),
          action: data.action || null,
          confidence: data.confidence || 0,
          detected_intent: data.detected_intent || null,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error("[❗챗봇 응답 오류]", data.error);

        // 401 오류 (인증 실패) 처리
        if (response.status === 401) {
          const errorMessage = {
            type: "bot",
            content: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);

          // 3초 후 페이지 새로고침으로 로그인 화면으로 이동
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          throw new Error(data.error || "서버 오류");
        }
      }
    } catch (error) {
      console.error("[❗챗봇 요청 실패]", error);
      const errorMessage = {
        type: "bot",
        content: "죄송합니다. 서버와의 연결에 문제가 있습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ 빠른 입력 버튼 핸들러
  const handleQuickInput = (text) => {
    setInputValue(text);
    // 포커스를 텍스트 영역으로 이동
    document.querySelector(".chat-input")?.focus();
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>🤖 AI 어시스턴트</h2>
        <p>문법 교정, 이미지 생성, 메일 검색 등을 도와드립니다</p>
        {/* ✅ 현재 사용자 표시 */}
        <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
          👤 {email}
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.type === "user" ? "user-message" : "bot-message"
            }`}
          >
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {formatTime(message.timestamp)}
                {/* ✅ 봇 메시지에 디버그 정보 표시 (개발 모드에서만) */}
                {process.env.NODE_ENV === "development" &&
                  message.type === "bot" &&
                  message.action && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#999",
                        marginTop: "2px",
                      }}
                    >
                      🎯 {message.detected_intent} (
                      {(message.confidence * 100).toFixed(1)}%)
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="message-time">입력 중...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-container">
        <div className="input-suggestions">
          <button
            className="suggestion-btn"
            onClick={() => handleQuickInput("맞춤법을 교정해주세요")}
          >
            맞춤법 교정
          </button>
          <button
            className="suggestion-btn"
            onClick={() => handleQuickInput("이미지를 생성해주세요")}
          >
            이미지 생성
          </button>
          <button
            className="suggestion-btn"
            onClick={() => handleQuickInput("특정 메일을 찾아주세요")}
          >
            메일 검색
          </button>
          <button
            className="suggestion-btn"
            onClick={() => handleQuickInput("김철수님의 메일을 찾아주세요")}
          >
            사람 검색
          </button>
        </div>

        <div className="input-area">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="무엇을 도와드릴까요? (Enter로 전송)"
            className="chat-input"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? "⏳" : "📤"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
