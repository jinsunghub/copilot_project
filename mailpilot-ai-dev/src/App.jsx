import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import MailList from "./components/MailList";
import MailDetail from "./components/MailDetail";
import BackendTestButton from "./components/BackendTestButtons";
import GmailSummaryForm from "./components/GmailSummaryForm";
import Login from "./components/Login";
import WriteMail from "./components/WriteMail";

// ✅ 날짜 파싱 함수를 App 레벨로 이동하여 일관성 확보
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
  const [selectedIds, setSelectedIds] = useState([]); //체크박스

  // 로그인 관련 상태
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const gmailRef = useRef(null); // ✅ 새로고침 버튼용 ref

  // 로그인 정보 복원
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("appPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setAppPassword(savedPassword);
      setIsLoggedIn(true);
    }
  }, []);

  const tagMap = {
    "전체 메일": null, // all
    "받은 메일함": "받은",
    "중요 메일": "중요",
    스팸: "스팸",
    "보낸 메일함": "보낸", // future
    "내게 쓴 메일": "내게", // future
    "키워드 필터": "키워드", // optional
  };

  const requiredTag = tagMap[selectedTag];

  const filteredEmails = emails.filter((emailItem) => {
    let matchesTag = true;

    if (requiredTag) {
      if (requiredTag === "스팸") {
        // tag가 "스팸"이거나 classification이 "spam mail"인 메일 모두 포함
        matchesTag =
          emailItem.tag === "스팸" ||
          emailItem.classification?.toLowerCase() === "spam mail";
      } else {
        matchesTag = emailItem.tag === requiredTag;
      }
    }

    const matchesSearch =
      emailItem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailItem.from.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTag && matchesSearch;
  });

  if (!isLoggedIn) {
    return (
      <Login
        setEmail={(value) => {
          setEmail(value);
          localStorage.setItem("email", value); // 저장
        }}
        setAppPassword={(value) => {
          setAppPassword(value);
          localStorage.setItem("appPassword", value); // 저장
        }}
        setIsLoggedIn={setIsLoggedIn}
      />
    );
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
      />

      <div className="main-panel">
        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

        {/* ✅ 새로고침 버튼 */}
        <div style={{ padding: "8px 16px" }}>
          <button
            className="setting-button"
            onClick={() => gmailRef.current?.refetch()}
          >
            🔄 메일 새로고침
          </button>
        </div>

        {isComposing ? (
          <WriteMail
            onBack={() => setIsComposing(false)}
            email={email}
            appPassword={appPassword}
            selectedEmail={selectedEmail}
          />
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
                // 2️⃣ 그리고 10ms 후에 작성 모드로 전환
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
                // 2️⃣ 그리고 10ms 후에 작성 모드로 전환
                setTimeout(() => {
                  setIsComposing(true);
                  setViewingEmail(null);
                }, 10);
              }}
            >
              AI 답장
            </button>
          </div>
        ) : (
          <MailList
            emails={filteredEmails}
            onSelectEmail={(emailItem) => {
              setViewingEmail(emailItem);
              setSelectedEmail(emailItem);
            }}
            selectedIds={selectedIds} //체크박스
            setSelectedIds={setSelectedIds} //체크박스
          />
        )}
      </div>

      <MailDetail email={selectedEmail} />

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

              // ✅ 1. 모든 메일을 하나의 배열로 합치기 (기존 + 새로운)
              const combined = [...prev, ...newMails];

              // ✅ 2. 중복 제거 (subject + from + date 기준으로)
              const seen = new Set();
              const unique = combined.filter((mail) => {
                const key = `${mail.subject}-${mail.from}-${mail.date}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });

              // ✅ 3. 날짜 기준 정렬 (내림차순: 최신이 위로)
              const sorted = unique.sort((a, b) => {
                const dateA = parseDate(a.date);
                const dateB = parseDate(b.date);
                return dateB - dateA; // 내림차순 정렬
              });

              console.log("정렬된 메일:", sorted.length, "개");
              console.log("최신 메일 날짜:", sorted[0]?.date);
              console.log(
                "가장 오래된 메일 날짜:",
                sorted[sorted.length - 1]?.date
              );

              return sorted;
            });

            // ✅ 4. 메일 선택 상태 갱신 (새 메일이 있을 때만)
            if (newMails.length > 0) {
              // 새 메일 중에서 가장 최신 메일 선택
              const latest = [...newMails].sort(
                (a, b) => parseDate(b.date) - parseDate(a.date)
              )[0];
              setSelectedEmail(latest);
            }

            // ✅ 5. 새로고침 시점 저장
            setLastFetchTime(new Date().toISOString());
          }}
        />
      </div>
    </div>
  );
};

export default App;
