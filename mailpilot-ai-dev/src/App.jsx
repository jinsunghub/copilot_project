import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import MailList from "./components/MailList";
import MailDetail from "./components/MailDetail";
import BackendTestButton from "./components/BackendTestButtons";
import GmailSummaryForm from "./components/GmailSummaryForm";

const App = () => {
  const [emails, setEmails] = useState([]);
  const [selectedTag, setSelectedTag] = useState("전체 메일");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmails = emails.filter((email) => {
    const matchesTag =
      selectedTag === "전체 메일" ||
      email.tag === selectedTag.replace(" 메일함", "");
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  // 디버깅 로그
  console.log("📬 전체 emails:", emails);
  console.log("🔎 필터된 emails:", filteredEmails);

  return (
    <div className="app-container">
      <Sidebar selectedTag={selectedTag} setSelectedTag={setSelectedTag} />

      <div className="main-panel">
        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

        <p>🧪 렌더링 확인 로그: {filteredEmails.length}개 메일 있음</p>

        <MailList
          emails={filteredEmails}
          onSelectEmail={(email) => {
            console.log("🖱️ 메일 클릭:", email);
            setSelectedEmail(email);
          }}
        />
      </div>

      <MailDetail email={selectedEmail} />

      <div className="right-panel">
        <h1>📬 MailPilot AI</h1>
        <BackendTestButton />
        <GmailSummaryForm
          setEmails={(emails) => {
            console.log("📨 setEmails 호출됨:", emails.length);
            setEmails(emails);
          }}
        />
      </div>
    </div>
  );
};

export default App;
