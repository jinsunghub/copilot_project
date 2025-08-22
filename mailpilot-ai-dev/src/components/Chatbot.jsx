import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const Chatbot = ({ email, appPassword }) => {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "안녕하세요! 메일 관리 AI 어시스턴트입니다. 무엇을 도와드릴까요?\n\n🔧 **사용 가능한 기능:**\n• 문법/맞춤법 교정\n• 메일 검색 (사람별/키워드별)\n• AI 답장 생성\n• 애플리케이션 설정 변경 (테마, 폰트, 메일 설정)",
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
        responseContent += `📊 검색된 메일: ${data.found_count}개\n\n`;

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

        // ✅ 이메일 검색 의도인 경우 챗봇 서비스 응답 직접 사용
        if (data.action === "email_search" || data.action === "person_search") {
          console.log("[🔍 이메일 검색 완료] 챗봇 서비스에서 직접 처리됨");

          // 챗봇 서비스에서 이미 검색하고 포맷된 응답 사용
          const botMessage = {
            type: "bot",
            content: data.response || "검색 결과를 가져올 수 없습니다.",
            timestamp: new Date(),
            action: data.action,
            confidence: data.confidence,
          };
          setMessages((prev) => [...prev, botMessage]);
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
          
          // 🎯 설정 변경 성공 시 UI 새로고침 이벤트 발생
          if (data.action === "settings_control" && data.response && data.response.includes("✅")) {
            console.log("[🔄 설정 새로고침] 설정 변경 성공 감지, UI 업데이트 중...");
            setTimeout(() => {
              window.dispatchEvent(new Event('settingsUpdated'));
            }, 100); // 약간의 지연으로 안정적인 업데이트
          }
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

  // 안내 메시지를 챗봇 응답으로 추가하는 함수
  const addGuidanceMessage = (content) => {
    const guidanceMessage = {
      type: "bot",
      content: content,
      timestamp: new Date(),
      isGuidance: true
    };
    setMessages((prev) => [...prev, guidanceMessage]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>🤖 AI 어시스턴트</h2>
        <p>문법 교정, 메일 검색, AI 답장 생성을 도와드립니다</p>
        <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
          👤 {email}
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.type === "user" 
                ? "user-message" 
                : message.isGuidance 
                  ? "bot-message guidance"
                  : "bot-message"
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
            onClick={() => addGuidanceMessage("📝 **문법/맞춤법 교정**\n\n교정하고 싶은 텍스트를 입력해주세요.\n\n💡 **예시:**\n• '안녕하세요. 제가 오늘 회의에 참석못할것 같습니다' 교정해주세요\n• 'I can't attend meeting today' 교정해주세요\n\n➡️ 아래 입력창에 교정할 텍스트를 입력하세요!")}
          >
            맞춤법 교정
          </button>
          <button
            className="suggestion-btn"
            onClick={() => addGuidanceMessage("🔍 **고급 키워드 검색**\n\n검색하고 싶은 키워드와 조건을 입력해주세요.\n\n💡 **기본 검색:**\n• '회의 관련 메일 찾아줘'\n• '프로젝트 업데이트 검색'\n\n🗓️ **날짜별 검색:**\n• '어제 받은 메일 보여줘'\n• '지난주 회의 메일 찾아줘'\n• '최근 3일 메일'\n\n🔢 **개수 제한:**\n• '최신 메일 5개만'\n• '회의 관련 메일 3개'\n\n📧 **타입별 검색:**\n• '받은메일만 검색'\n• '보낸메일 중 프로젝트 관련'\n\n➡️ 아래 입력창에 검색 조건을 입력하세요!")}
          >
            키워드 검색
          </button>
          <button
            className="suggestion-btn"
            onClick={() => addGuidanceMessage("👤 **고급 사람별 검색**\n\n검색하고 싶은 사람과 조건을 입력해주세요.\n\n💡 **기본 사람별 검색:**\n• '김철수님 메일 보여줘'\n• '교수님 이메일 찾아줘'\n\n🗓️ **날짜 조건 추가:**\n• '김철수님 어제 메일'\n• '교수님 지난주 이메일'\n• '박영희씨 최근 3일 메일'\n\n📧 **타입별 검색:**\n• '김철수님 받은메일만'\n• '교수님 보낸메일 찾아줘'\n\n🔢 **개수 제한:**\n• '김철수님 메일 5개만'\n• '교수님 최신 메일 3개'\n\n➡️ 아래 입력창에 사람과 조건을 입력하세요!")}
          >
            이름으로 검색
          </button>
          <button
            className="suggestion-btn"
            onClick={() => addGuidanceMessage("📧 **이메일 주소 검색**\n\n검색하고 싶은 이메일 주소를 입력해주세요.\n\n💡 **예시:**\n• 'abc@gmail.com 메일 보여줘'\n• 'john@company.com 이메일 찾아줘'\n• 'swchoi915@naver.com에서 온 메일'\n\n➡️ 아래 입력창에 이메일 주소를 입력하세요!")}
          >
            이메일로 검색
          </button>
          <button
            className="suggestion-btn"
            onClick={() => addGuidanceMessage("📊 **이메일 통계**\n\n궁금한 통계 정보를 입력해주세요.\n\n💡 **예시:**\n• '오늘 메일 몇 개?'\n• '이번주 메일 개수'\n• '총 메일 통계'\n• '어제 받은 메일 개수'\n• '이번달 메일 몇 개?'\n\n➡️ 아래 입력창에 궁금한 통계를 입력하세요!")}
          >
            메일 통계
          </button>
          <button
            className="suggestion-btn"
            onClick={() => addGuidanceMessage("🌙 **테마 설정**\n\n테마를 변경하려면 아래 예시를 참고하세요.\n\n💡 **예시:**\n• '다크모드로 바꿔줘'\n• '라이트 테마로 변경해줘'\n• '테마를 어둡게 해줘'\n• '밝은 모드로 설정해줘'\n\n➡️ 아래 입력창에 원하는 테마를 입력하세요!")}
          >
            테마 설정
          </button>
          <button
            className="suggestion-btn"
            onClick={() => addGuidanceMessage("🔤 **폰트 설정**\n\n글꼴과 크기를 변경하려면 아래 예시를 참고하세요.\n\n💡 **폰트 크기 예시:**\n• '폰트 크기를 18px로 바꿔줘'\n• '글자 크기를 16px로 설정해줘'\n\n💡 **폰트 종류 예시:**\n• '글꼴을 맑은 고딕으로 변경해줘'\n• '폰트를 Arial로 바꿔줘'\n• '글꼴을 돋움으로 설정해줘'\n\n➡️ 아래 입력창에 원하는 폰트를 입력하세요!")}
          >
            폰트 설정
          </button>
          <button
            className="suggestion-btn"
            onClick={() => addGuidanceMessage("📧 **메일 설정**\n\n메일 관련 설정을 변경하려면 아래 예시를 참고하세요.\n\n💡 **Gmail 개수 설정:**\n• 'Gmail 메일을 50개씩 가져와줘'\n• '메일 가져오기 개수를 30개로 설정해줘'\n\n💡 **페이지 크기 설정:**\n• '페이지에 10개씩 보여줘'\n• '한 페이지에 5개씩 표시해줘'\n\n💡 **발신자 이름 설정:**\n• '발신자 이름을 김철수로 바꿔줘'\n• '내 이름을 박영희로 설정해줘'\n\n➡️ 아래 입력창에 원하는 설정을 입력하세요!")}
          >
            메일 설정
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
