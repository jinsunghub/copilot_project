import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import MailList from "./components/MailList";
import MailDetail from "./components/MailDetail";
import sampleEmails from "./sampleEmails";

const App = () => {
  const [selectedTag, setSelectedTag] = useState("전체 메일");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmails = sampleEmails.filter((email) => {
    const matchesTag =
      selectedTag === "전체 메일" ||
      email.tag === selectedTag.replace(" 메일함", "");
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="app-container">
      <Sidebar selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
      <div className="main-panel">
        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
        <MailList emails={filteredEmails} onSelectEmail={setSelectedEmail} />
      </div>
      <MailDetail email={selectedEmail} />
    </div>
  );
};

export default App;
