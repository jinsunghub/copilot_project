import { useState } from "react";
import FilterTabs from "./components/FilterTabs";
import EmailList from "./components/EmailList";
import "./App.css";

const emails = [
  {
    sender: "Prof. Kim",
    subject: "과제 피드백",
    summary: "보고서에 대한 피드백을 전달합니다.",
    category: "Professor",
    priority: "High",
    isSpam: false,
    time: "오늘 3:00PM",
  },
  {
    sender: "광고봇",
    subject: "초특가 세일!",
    summary: "지금 할인 중인 상품을 확인하세요.",
    category: "Spam",
    priority: "Low",
    isSpam: true,
    time: "오늘 9:00AM",
  },
  {
    sender: "팀장님",
    subject: "회의 일정 조율",
    summary: "수요일 오전 중 회의 일정 잡을 수 있을까요?",
    category: "Important",
    priority: "High",
    isSpam: false,
    time: "오늘 10:30AM",
  },
];

function App() {
  const [filter, setFilter] = useState("All");

  const getFilteredEmails = () => {
    if (filter === "All") return emails;
    if (filter === "Spam") return emails.filter((e) => e.isSpam);
    return emails.filter(
      (e) => e.category === filter && !e.isSpam
    );
  };

  return (
    <div className="app">
      <h1>📬 MailPilot AI</h1>
      <p>AI 비서가 요약한 메일입니다.</p>
      <FilterTabs setFilter={setFilter} />
      <EmailList emails={getFilteredEmails()} />
    </div>
  );
}

export default App;
