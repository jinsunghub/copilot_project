// App.jsx (수정된 버전 - 사이드바 네비게이션 개선)
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import MailList from "./components/MailList";
import MailDetail from "./components/MailDetail";
import BackendTestButton from "./components/BackendTestButtons";
import GmailSummaryForm from "./components/GmailSummaryForm";
import Login from "./components/Login";
import WriteMail from "./components/WriteMail";
import Chatbot from "./components/Chatbot";
import TodoDashboard from "./components/TodoDashboard";

// 날짜 파싱 함수
const parseDate = (dateStr) => {
  const parsed = new Date(dateStr);
  if (!isNaN(parsed)) return parsed;

  const koreanMatch = dateStr.match(
    /(?:(\d{4})년)?\s*(\d{1,2})월\s*(\d{1,2})일/
  );
  if (koreanMatch) {
    const year = koreanMatch[1] || new Date().getFullYear();
    const month = koreanMatch[2].padStart(2, "0");
    const day = koreanMatch[3].padStart(2, "0");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date();
};

const App = ({ email, appPassword, onLogout }) => {
  const [emails, setEmails] = useState([]);
  const [selectedTag, setSelectedTag] = useState("받은 메일");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [viewingEmail, setViewingEmail] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const gmailRef = useRef(null);

  // 태그 변경 시 선택된 메일 상태 초기화
  const handleTagChange = (newTag) => {
    console.log(`[🏷️ 태그 변경] ${selectedTag} → ${newTag}`);

    // 1. 태그 변경
    setSelectedTag(newTag);

    // 2. 메일 관련 상태 모두 초기화
    setSelectedEmail(null);
    setViewingEmail(null);
    setIsComposing(false);
    setSearchTerm(""); // 검색어도 초기화
    setSelectedIds([]); // 체크박스 선택도 초기화

    console.log(`[✅ 상태 초기화 완료] ${newTag}로 이동`);
  };

  // 로그인 후 자동 새로고침
  useEffect(() => {
    if (
      email &&
      appPassword &&
      (selectedTag === "받은 메일" || selectedTag === "보낸 메일")
    ) {
      console.log(
        `[🔄 메일 가져오기] ${selectedTag} - 로그인: ${!!email}, 태그: ${selectedTag}`
      );

      const timer = setTimeout(() => {
        gmailRef.current?.refetch();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [email, appPassword, selectedTag]);

  // AI 답장 생성 함수
  const generateAIReply = async (originalEmail) => {
    setIsGeneratingAI(true);
    try {
      console.log("[🤖 AI 답장 생성 시작]", originalEmail.subject);

      const response = await fetch(
        "http://localhost:5001/api/generate-ai-reply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            sender: originalEmail.from,
            subject: originalEmail.subject,
            body: originalEmail.body,
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("[✅ AI 답장 생성 완료]");

        const sender =
          originalEmail.from.match(/<(.+?)>/)?.[1] || originalEmail.from;

        const replyHeader = `\n\n---------------------------------------------------\n${originalEmail.date}에, 작성자 <${sender}>님이 작성:\n${originalEmail.body}`;

        const aiReplyWithOriginal = data.ai_reply + replyHeader;

        setSelectedEmail({
          to: sender,
          subject: `RE: ${originalEmail.subject}`,
          body: aiReplyWithOriginal,
          isAIGenerated: true,
        });

        setTimeout(() => {
          setIsComposing(true);
          setViewingEmail(null);
        }, 10);

        alert("🤖 AI 답장이 생성되었습니다!");
      } else {
        console.error("[❗AI 답장 생성 실패]", data.error);
        alert(`AI 답장 생성 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("[❗AI 답장 요청 오류]", error);
      alert("AI 답장 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // 태그 매핑
  const tagMap = {
    "받은 메일": "inbox",
    "보낸 메일": "sent",
    "중요 메일": ["university.", "company."],
    스팸: "spam mail.",
    "보안 경고": "security alert.",
    "할일 관리": "todo_dashboard",
    "챗봇 AI": "chatbot",
  };

  const requiredTag = tagMap[selectedTag];

  const filteredEmails = emails.filter((emailItem) => {
    let matchesTag = true;

    if (requiredTag) {
      if (selectedTag === "받은 메일") {
        matchesTag = emailItem.classification !== "sent";
      } else if (selectedTag === "보낸 메일") {
        matchesTag = emailItem.classification === "sent";
      } else if (selectedTag === "중요 메일") {
        matchesTag =
          emailItem.classification !== "sent" &&
          (emailItem.classification?.toLowerCase() === "university." ||
            emailItem.classification?.toLowerCase() === "company.");
      } else if (selectedTag === "스팸") {
        matchesTag =
          emailItem.classification !== "sent" &&
          emailItem.classification?.toLowerCase() === "spam mail.";
      } else if (selectedTag === "보안 경고") {
        matchesTag =
          emailItem.classification !== "sent" &&
          emailItem.classification?.toLowerCase() === "security alert.";
      }
    }

    const matchesSearch =
      emailItem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailItem.from.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTag && matchesSearch;
  });

  return (
    <div className="app-container">
      <Sidebar
        selectedTag={selectedTag}
        setSelectedTag={handleTagChange} //  수정된 핸들러 사용
        onCompose={() => {
          setIsComposing(true);
          setSelectedEmail(null);
          setViewingEmail(null); //  작성 시에도 상태 정리
        }}
        onLogout={onLogout}
        userEmail={email}
      />

      <div className="main-panel">
        {/* 검색바와 새로고침 버튼 */}
        {selectedTag !== "할일 관리" && selectedTag !== "챗봇 AI" && (
          <>
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

            <div style={{ padding: "8px 16px" }}>
              <button
                className="setting-button"
                onClick={() => gmailRef.current?.refetch()}
              >
                🔄 메일 새로고침
              </button>
            </div>
          </>
        )}

        {/* 메인 컨텐츠 렌더링 */}
        {isComposing ? (
          <WriteMail
            onBack={() => {
              setIsComposing(false);
              setSelectedEmail(null); //   작성 취소 시 상태 정리
              setViewingEmail(null);
            }}
            email={email}
            appPassword={appPassword}
            selectedEmail={selectedEmail}
          />
        ) : selectedTag === "할일 관리" ? (
          <TodoDashboard email={email} appPassword={appPassword} />
        ) : selectedTag === "챗봇 AI" ? (
          <Chatbot email={email} appPassword={appPassword} />
        ) : viewingEmail ? (
          <div className="mail-content">
            <h2>{viewingEmail.subject}</h2>
            <p>
              <strong>보낸 사람:</strong> {viewingEmail.from}
            </p>
            <p>
              <strong>받은 날짜:</strong> {viewingEmail.date}
            </p>
            <hr />
            <pre className="mail-body">{viewingEmail.body}</pre>
            <br />
            <button
              className="setting-button"
              onClick={() => {
                setViewingEmail(null);
                setSelectedEmail(null); //  상태 정리
              }}
            >
              뒤로가기
            </button>
            <button
              className="setting-button"
              style={{ marginLeft: "10px" }}
              onClick={() => {
                const original = viewingEmail;
                const sender =
                  original.from.match(/<(.+?)>/)?.[1] || original.from;
                const replyHeader = `\n---------------------------------------------------
                \n${original.date}에, 작성자 <${sender}>님이 작성:\n${original.body}`;

                setSelectedEmail({
                  to: sender,
                  subject: `RE: ${original.subject}`,
                  body: replyHeader,
                });

                setTimeout(() => {
                  setIsComposing(true);
                  setViewingEmail(null);
                }, 10);
              }}
            >
              답장
            </button>

            <button
              className="setting-button"
              style={{
                marginLeft: "10px",
                backgroundColor: isGeneratingAI ? "#ccc" : "#4CAF50",
                cursor: isGeneratingAI ? "not-allowed" : "pointer",
              }}
              onClick={() => generateAIReply(viewingEmail)}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? "🤖 AI 답장 생성 중..." : "🤖 AI 답장"}
            </button>
          </div>
        ) : (
          // 메일 리스트
          <MailList
            emails={filteredEmails}
            onSelectEmail={(emailItem) => {
              setViewingEmail(emailItem);
              setSelectedEmail(emailItem);
            }}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        )}
      </div>

      {/* MailDetail은 할일 관리와 챗봇이 아닐 때만 표시 */}
      {selectedTag !== "할일 관리" && selectedTag !== "챗봇 AI" && (
        <MailDetail email={selectedEmail} />
      )}

      {/* GmailSummaryForm */}
      <div className="right-panel" style={{ display: "none" }}>
        <GmailSummaryForm
          ref={gmailRef}
          email={email}
          appPassword={appPassword}
          after={lastFetchTime}
          selectedTag={selectedTag}
          setEmails={(newMails) => {
            setEmails((prev) => {
              console.log("새로운 메일:", newMails.length, "개");
              console.log("기존 메일:", prev.length, "개");

              const isFirstLoad = prev.length === 0;

              if (isFirstLoad) {
                console.log("첫 로딩 - 새 메일들을 날짜순 정렬");
                const sorted = newMails.sort((a, b) => {
                  const dateA = parseDate(a.date);
                  const dateB = parseDate(b.date);
                  return dateB - dateA;
                });
                console.log("첫 로딩 정렬 완료:", sorted.length, "개");

                //  첫 로딩 시에도 특정 태그가 선택되어 있으면 전체 메일 표시하지 않음
                if (selectedTag === "받은 메일") {
                  setSelectedEmail(sorted);
                }
                return sorted;
              } else {
                console.log("새로고침 - 기존 메일보다 최신인 메일만 필터링");

                const latestExistingDate =
                  prev.length > 0
                    ? Math.max(
                        ...prev.map((mail) => parseDate(mail.date).getTime())
                      )
                    : 0;

                console.log(
                  "기존 메일 중 최신 날짜:",
                  new Date(latestExistingDate)
                );

                const reallyNewMails = newMails.filter((mail) => {
                  const mailDate = parseDate(mail.date).getTime();
                  return mailDate > latestExistingDate;
                });

                console.log("진짜 새로운 메일:", reallyNewMails.length, "개");

                if (reallyNewMails.length > 0) {
                  const sortedNewMails = reallyNewMails.sort((a, b) => {
                    const dateA = parseDate(a.date);
                    const dateB = parseDate(b.date);
                    return dateB - dateA;
                  });

                  const combined = [...sortedNewMails, ...prev];

                  const seen = new Set();
                  const unique = combined.filter((mail) => {
                    const key = `${mail.subject}-${mail.from}-${mail.date}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });

                  console.log("새로고침 완료:", unique.length, "개");
                  console.log("맨 위 메일 날짜:", unique[0]?.date);

                  // 새로고침 시에도 현재 태그 상태 고려
                  if (selectedTag === "받은 메일") {
                    setSelectedEmail(sortedNewMails);
                  }

                  return unique;
                } else {
                  console.log("새로운 메일이 없습니다.");
                  return prev;
                }
              }
            });

            setLastFetchTime(new Date().toISOString());
          }}
        />
      </div>
    </div>
  );
};

export default App;
