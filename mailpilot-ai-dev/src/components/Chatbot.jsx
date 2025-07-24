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
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          app_password: appPassword,
          user_input: inputValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = {
          type: "bot",
          content: data.response || "죄송합니다. 처리 중 오류가 발생했습니다.",
          timestamp: new Date(),
          action: data.action || null,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || "서버 오류");
      }
    } catch (error) {
      console.error("챗봇 요청 실패:", error);
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

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>🤖 AI 어시스턴트</h2>
        <p>문법 교정, 이미지 생성, 메일 검색 등을 도와드립니다</p>
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
            onClick={() => setInputValue("맞춤법을 교정해주세요")}
          >
            맞춤법 교정
          </button>
          <button
            className="suggestion-btn"
            onClick={() => setInputValue("이미지를 생성해주세요")}
          >
            이미지 생성
          </button>
          <button
            className="suggestion-btn"
            onClick={() => setInputValue("특정 메일을 찾아주세요")}
          >
            메일 검색
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
