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

  const filteredEmails = emails.filter((emailItem) => {
    const matchesTag =
      selectedTag === "전체 메일" ||
      emailItem.tag === selectedTag.replace(" 메일함", "");
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
                setIsComposing(true);
                setViewingEmail(null);
              }}
            >
              답장
            </button>
          </div>
        ) : (
          <MailList
            emails={filteredEmails}
            onSelectEmail={(emailItem) => {
              setViewingEmail(emailItem);
              setSelectedEmail(emailItem);
            }}
          />
        )}
      </div>

      <MailDetail email={selectedEmail} />

      <div className="right-panel">
        <GmailSummaryForm
          ref={gmailRef}
          email={email}
          appPassword={appPassword}
          setEmails={(emails) => {
            setEmails(emails);
            if (emails.length > 0) {
              setSelectedEmail(emails[4]); // ✅ 첫 번째 메일 자동 선택
            }
          }}
        />
      </div>
    </div>
  );
};

export default App;
