import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const Chatbot = ({ email, appPassword }) => {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "안녕하세요! 메일 관리 AI 어시스턴트입니다. 무엇을 도와드릴까요?\n\n✨ 새로운 기능: 이메일 검색이 추가되었습니다!\n예시: 'find abc@gmail.com'",
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

  // ✅ 이메일 검색 전용 함수
  const handleEmailSearch = async (userInput) => {
    try {
      console.log("[🔍 이메일 검색 시작]", userInput);

      const response = await fetch("http://localhost:5001/api/email-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user_input: userInput,
          email: email,
          app_password: appPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("[✅ 이메일 검색 성공]", data.found_count);

        let responseContent = `🔍 **검색 결과**\n\n`;
        responseContent += `📧 검색 대상: "${data.search_target}"\n`;
        responseContent += `📊 검색된 메일: ${data.found_count}개 (총 ${data.total_searched}개 중)\n\n`;

        if (data.results && data.results.length > 0) {
          responseContent += `**발견된 메일들:**\n\n`;
          data.results.forEach((mail, index) => {
            responseContent += `**${index + 1}. ${mail.subject}**\n`;
            responseContent += `📤 발신자: ${mail.from}\n`;
            responseContent += `📅 날짜: ${mail.date}\n`;
            responseContent += `📝 내용: ${mail.body.substring(0, 100)}${
              mail.body.length > 100 ? "..." : ""
            }\n\n`;
          });
        } else {
          responseContent += `❌ "${data.search_target}"와 관련된 메일을 찾을 수 없습니다.\n\n`;
          responseContent += `💡 **검색 팁:**\n`;
          responseContent += `• 이메일 주소로 검색: "abc@gmail.com에서 온 메일"\n`;
          responseContent += `• 이름으로 검색: "김철수님의 메일"\n`;
          responseContent += `• 키워드로 검색: "회의 관련 메일"`;
        }

        return {
          type: "bot",
          content: responseContent,
          timestamp: new Date(),
          action: "email_search_result",
          searchData: data,
        };
      } else {
        return {
          type: "bot",
          content: `❌ 검색 실패: ${data.message || data.error}`,
          timestamp: new Date(),
          action: "email_search_error",
        };
      }
    } catch (error) {
      console.error("[❗이메일 검색 오류]", error);
      return {
        type: "bot",
        content:
          "❌ 이메일 검색 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.",
        timestamp: new Date(),
        action: "email_search_error",
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      console.log("[🤖 챗봇 요청]", currentInput);

      // ✅ 먼저 의도 분류
      const response = await fetch("http://localhost:5001/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          app_password: appPassword,
          user_input: currentInput,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("[✅ 챗봇 응답]", data.action, data.confidence);

        // ✅ 이메일 검색 의도인 경우 전용 검색 실행
        if (data.action === "email_search" || data.action === "person_search") {
          console.log("[🔍 이메일 검색 모드 진입]");

          // 검색 시작 메시지
          const searchingMessage = {
            type: "bot",
            content: `🔍 "${currentInput}"에 대한 이메일을 검색하고 있습니다...\n잠시만 기다려주세요.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, searchingMessage]);

          // 실제 검색 실행
          const searchResult = await handleEmailSearch(currentInput);
          setMessages((prev) => [...prev, searchResult]);
        } else {
          // ✅ 기존 챗봇 응답
          const botMessage = {
            type: "bot",
            content:
              data.response || "죄송합니다. 처리 중 오류가 발생했습니다.",
            timestamp: new Date(),
            action: data.action || null,
            confidence: data.confidence || 0,
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      } else {
        console.error("[❗챗봇 응답 오류]", data.error);

        if (response.status === 401) {
          const errorMessage = {
            type: "bot",
            content: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);

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

  const handleQuickInput = (text) => {
    setInputValue(text);
    document.querySelector(".chat-input")?.focus();
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>🤖 AI 어시스턴트</h2>
        <p>문법 교정, 이미지 생성, 메일 검색 등을 도와드립니다</p>
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
              <div className="message-text" style={{ whiteSpace: "pre-line" }}>
                {message.content}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
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
                      🎯 {message.action}{" "}
                      {message.confidence &&
                        `(${(message.confidence * 100).toFixed(1)}%)`}
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
              <div className="message-time">처리 중...</div>
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
            onClick={() => handleQuickInput("김철수님의 메일을 찾아주세요")}
          >
            이름으로 검색
          </button>
          <button
            className="suggestion-btn"
            onClick={() => handleQuickInput("abc@gmail.com에서 온 메일")}
          >
            이메일로 검색
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
