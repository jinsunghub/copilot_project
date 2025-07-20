import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import MailList from "./components/MailList";
import MailDetail from "./components/MailDetail";
import BackendTestButton from "./components/BackendTestButtons";
import GmailSummaryForm from "./components/GmailSummaryForm";
import Login from "./components/Login"; // 👈 로그인 컴포넌트 추가
const App = ({ email, appPassword }) => {
  const [emails, setEmails] = useState([]);
  const [selectedTag, setSelectedTag] = useState("전체 메일");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmails = emails.filter((emailItem) => {
    const matchesTag =
      selectedTag === "전체 메일" ||
      emailItem.tag === selectedTag.replace(" 메일함", "");
    const matchesSearch =
      emailItem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailItem.from.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="app-container">
      <Sidebar selectedTag={selectedTag} setSelectedTag={setSelectedTag} />

      <div className="main-panel">
        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

        <MailList
          emails={filteredEmails}
          onSelectEmail={(emailItem) => setSelectedEmail(emailItem)}
        />
      </div>

      <MailDetail email={selectedEmail} />
      <div className="right-panel">
        <h1>📬 MailPilot AI</h1>
        <BackendTestButton />
        <GmailSummaryForm
          email={email} // ✅ 여기
          appPassword={appPassword} // ✅ 여기
          setEmails={(emails) => setEmails(emails)}
        />
      </div>
    </div>
  );
};

export default App;
