import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import MailList from "./components/MailList";
import MailDetail from "./components/MailDetail";
import BackendTestButton from "./components/BackendTestButtons";
import GmailSummaryForm from "./components/GmailSummaryForm";
import Login from "./components/Login";
import WriteMail from "./components/WriteMail";

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
    const matchesTag = !requiredTag || emailItem.tag === requiredTag;
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
              // 1. 기존 + 새로운 메일 합치기
              const combined = [...prev, ...newMails];

              // 2. 중복 제거 (subject + from + date 기준으로)
              const seen = new Set();
              const unique = combined.filter((mail) => {
                const key = `${mail.subject}-${mail.from}-${mail.date}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });

              // 3. 날짜 기준 정렬 (내림차순: 최신이 위로)
              unique.sort((a, b) => new Date(b.date) - new Date(a.date));

              return unique;
            });

            // 4. 메일 선택 상태 갱신
            if (newMails.length > 0) {
              const latest = [...newMails].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
              )[0];
              setSelectedEmail(latest);
            }

            // 5. 새로고침 시점 저장
            setLastFetchTime(new Date().toISOString());
          }}
        />
      </div>
    </div>
  );
};

export default App;
