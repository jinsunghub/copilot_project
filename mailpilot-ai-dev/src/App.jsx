// App.jsx (필터링 기능 강화된 버전)
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

// ✅ 날짜 파싱 함수
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

const App = () => {
  const [emails, setEmails] = useState([]);
  const [selectedTag, setSelectedTag] = useState("전체 메일");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [viewingEmail, setViewingEmail] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 로그인 관련 상태
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ 필터링 관련 상태 추가
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");

  const gmailRef = useRef(null);

  // ✅ 백엔드 로그인 API 호출
  const loginToBackend = async (userEmail, userPassword) => {
    try {
      console.log(`[🔑 백엔드 로그인] ${userEmail}`);
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: userEmail,
          app_password: userPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("[✅ 백엔드 로그인 성공]", data.session_id);

        // 저장된 이메일 불러오기
        const emailRes = await fetch(
          "http://localhost:5001/api/emails/stored",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              app_password: userPassword,
            }),
          }
        );

        const emailData = await emailRes.json();
        if (emailData.emails) {
          console.log("📬 저장된 메일:", emailData.emails.length);
          setEmails(emailData.emails);
          // ✅ 초기 필터링 적용
          loadFilteredEmails("all", emailData.emails);
        }

        setEmail(userEmail);
        setAppPassword(userPassword);
        setIsLoggedIn(true);
        return true;
      } else {
        console.error("[❗백엔드 로그인 실패]", data.error);
        return false;
      }
    } catch (error) {
      console.error("[❗백엔드 로그인 오류]", error);
      return false;
    }
  };

  // ✅ 백엔드 로그아웃 API 호출
  const logoutFromBackend = async (userEmail) => {
    try {
      console.log(`[🚪 백엔드 로그아웃] ${userEmail}`);
      const response = await fetch("http://localhost:5001/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("[✅ 백엔드 로그아웃 성공]");
        return true;
      } else {
        console.error("[❗백엔드 로그아웃 실패]", data.error);
        return false;
      }
    } catch (error) {
      console.error("[❗백엔드 로그아웃 오류]", error);
      return false;
    }
  };

  // ✅ 필터링된 이메일 로드 함수
  const loadFilteredEmails = async (filterType, emailData = null) => {
    try {
      if (!email && !emailData) return;

      setIsLoadingFilter(true);
      console.log(`[🔍 필터링 시작] ${filterType}`);

      // 로컬 이메일 데이터가 있으면 사용, 없으면 API 호출
      if (emailData) {
        // 로컬 필터링 (로그인 직후)
        const filtered = applyLocalFilter(emailData, filterType);
        setFilteredEmails(filtered);
        console.log(
          `[✅ 로컬 필터링 완료] ${filterType}: ${filtered.length}개`
        );
      } else {
        // API 필터링
        const url =
          filterType === "all"
            ? `http://localhost:5001/api/emails?email=${encodeURIComponent(
                email
              )}`
            : `http://localhost:5001/api/emails/filtered?email=${encodeURIComponent(
                email
              )}&filter=${filterType}`;

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFilteredEmails(data.emails);
            console.log(
              `[✅ API 필터링 완료] ${filterType}: ${data.emails.length}개`
            );
          }
        } else {
          console.error(`[❗필터링 오류] ${response.status}`);
          // API 실패 시 로컬 필터링으로 fallback
          const filtered = applyLocalFilter(emails, filterType);
          setFilteredEmails(filtered);
        }
      }

      setCurrentFilter(filterType);
    } catch (error) {
      console.error("[❗필터링 오류]", error);
      // 오류 시 로컬 필터링으로 fallback
      const filtered = applyLocalFilter(emails, filterType);
      setFilteredEmails(filtered);
    } finally {
      setIsLoadingFilter(false);
    }
  };

  // ✅ 로컬 필터링 함수 (백엔드 API 실패 시 사용)
  const applyLocalFilter = (emailList, filterType) => {
    if (filterType === "all") return emailList;

    return emailList.filter((emailItem) => {
      const subject = (emailItem.subject || "").toLowerCase();
      const body = (emailItem.body || "").toLowerCase();
      const from = (emailItem.from || "").toLowerCase();
      const classification = (emailItem.classification || "").toLowerCase();

      switch (filterType) {
        case "important":
          return (
            classification.includes("university") ||
            classification.includes("company") ||
            subject.includes("긴급") ||
            subject.includes("중요") ||
            subject.includes("urgent") ||
            subject.includes("important")
          );

        case "spam":
          return (
            classification.includes("spam") ||
            subject.includes("무료") ||
            subject.includes("당첨") ||
            subject.includes("할인") ||
            subject.includes("광고")
          );

        case "security":
          return (
            classification.includes("security") ||
            subject.includes("보안") ||
            subject.includes("로그인") ||
            subject.includes("비밀번호") ||
            subject.includes("security") ||
            subject.includes("alert")
          );

        default:
          return true;
      }
    });
  };

  // ✅ 필터 변경 핸들러
  const handleFilterChange = (filterType) => {
    console.log(`[🔄 필터 변경] ${currentFilter} -> ${filterType}`);
    loadFilteredEmails(filterType);
  };

  // ✅ 로그인 처리 함수
  const handleLogin = async (userEmail, userPassword) => {
    try {
      const backendLoginSuccess = await loginToBackend(userEmail, userPassword);

      if (backendLoginSuccess) {
        setEmail(userEmail);
        setAppPassword(userPassword);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("appPassword", userPassword);
        setIsLoggedIn(true);

        console.log("[🎉 로그인 완료] 프론트엔드 + 백엔드 세션 생성됨");
        return true;
      } else {
        alert("백엔드 로그인에 실패했습니다. 다시 시도해주세요.");
        return false;
      }
    } catch (error) {
      console.error("[❗로그인 처리 오류]", error);
      alert("로그인 중 오류가 발생했습니다.");
      return false;
    }
  };

  // ✅ 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await logoutFromBackend(email);

      // 모든 상태 초기화
      setEmails([]);
      setFilteredEmails([]);
      setSelectedEmail(null);
      setViewingEmail(null);
      setLastFetchTime(null);
      setSelectedIds([]);
      setSelectedTag("전체 메일");
      setSearchTerm("");
      setIsComposing(false);
      setCurrentFilter("all");

      setEmail("");
      setAppPassword("");
      setIsLoggedIn(false);
      localStorage.removeItem("email");
      localStorage.removeItem("appPassword");

      console.log("[🔄 로그아웃 완료] 모든 데이터 초기화됨");
      alert("로그아웃되었습니다.");
    } catch (error) {
      console.error("[❗로그아웃 처리 오류]", error);
    }
  };

  // ✅ 로그인 정보 복원
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("appPassword");

    if (savedEmail && savedPassword) {
      console.log("[🔄 로그인 정보 복원]", savedEmail);

      loginToBackend(savedEmail, savedPassword).then((success) => {
        if (success) {
          setEmail(savedEmail);
          setAppPassword(savedPassword);
          setIsLoggedIn(true);
          console.log("[✅ 세션 복원 완료]");
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("appPassword");
          console.log("[⚠️ 세션 복원 실패 - 로컬 정보 삭제]");
        }
      });
    }
  }, []);

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

  // ✅ 검색 필터링 (로컬 검색)
  const getDisplayEmails = () => {
    if (!searchTerm) return filteredEmails;

    return filteredEmails.filter((emailItem) => {
      const matchesSearch =
        emailItem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emailItem.from.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        onCompose={() => {
          setIsComposing(true);
          setSelectedEmail(null);
        }}
        onLogout={handleLogout}
        userEmail={email}
        onFilterChange={handleFilterChange} // ✅ 필터 변경 콜백 추가
      />

      <div className="main-panel">
        {/* 검색바와 새로고침 (할일 관리와 챗봇 제외) */}
        {selectedTag !== "할일 관리" && selectedTag !== "챗봇 AI" && (
          <>
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

            <div
              style={{
                padding: "8px 16px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <button
                className="setting-button"
                onClick={() => gmailRef.current?.refetch()}
              >
                🔄 메일 새로고침
              </button>

              {/* ✅ 필터 상태 표시 */}
              {isLoadingFilter && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    color: "#6c757d",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      border: "1px solid #dee2e6",
                      borderTop: "1px solid #007bff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  필터링 중...
                </div>
              )}
            </div>
          </>
        )}

        {/* 메인 콘텐츠 */}
        {isComposing ? (
          <WriteMail
            onBack={() => setIsComposing(false)}
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
              onClick={() => setViewingEmail(null)}
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
          // ✅ 필터링된 메일 리스트 표시
          <div>
            {/* 필터 헤더 */}
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid #dee2e6",
                backgroundColor: "#f8f9fa",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "#495057" }}>
                  {selectedTag} {isLoadingFilter && "🔄"}
                </h3>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    color: "#6c757d",
                  }}
                >
                  {isLoadingFilter
                    ? "필터링 중..."
                    : `${getDisplayEmails().length}개의 메일`}
                </p>
              </div>
            </div>

            {/* 메일 리스트 */}
            <MailList
              emails={getDisplayEmails()}
              onSelectEmail={(emailItem) => {
                setViewingEmail(emailItem);
                setSelectedEmail(emailItem);
              }}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          </div>
        )}
      </div>

      {/* MailDetail (할일 관리와 챗봇 제외) */}
      {selectedTag !== "할일 관리" && selectedTag !== "챗봇 AI" && (
        <MailDetail email={selectedEmail} />
      )}

      {/* GmailSummaryForm (할일 관리와 챗봇 제외) */}
      {selectedTag !== "할일 관리" && selectedTag !== "챗봇 AI" && (
        <div className="right-panel">
          <GmailSummaryForm
            ref={gmailRef}
            email={email}
            appPassword={appPassword}
            after={lastFetchTime}
            setEmails={(newMails) => {
              setEmails((prev) => {
                console.log("새로운 메일:", newMails.length, "개");
                console.log("기존 메일:", prev.length, "개");

                const isFirstLoad = prev.length === 0;

                if (isFirstLoad) {
                  const sorted = newMails.sort((a, b) => {
                    const dateA = parseDate(a.date);
                    const dateB = parseDate(b.date);
                    return dateB - dateA;
                  });

                  // ✅ 새 메일 로드 시 현재 필터 다시 적용
                  loadFilteredEmails(currentFilter, sorted);

                  setSelectedEmail(sorted);
                  return sorted;
                } else {
                  const latestExistingDate =
                    prev.length > 0
                      ? Math.max(
                          ...prev.map((mail) => parseDate(mail.date).getTime())
                        )
                      : 0;

                  const reallyNewMails = newMails.filter((mail) => {
                    const mailDate = parseDate(mail.date).getTime();
                    return mailDate > latestExistingDate;
                  });

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

                    // ✅ 새 메일 추가 시 현재 필터 다시 적용
                    loadFilteredEmails(currentFilter, unique);

                    setSelectedEmail(sortedNewMails);
                    return unique;
                  } else {
                    return prev;
                  }
                }
              });

              setLastFetchTime(new Date().toISOString());
            }}
          />
        </div>
      )}

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

export default App;
