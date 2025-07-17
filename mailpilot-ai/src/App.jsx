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
  const [result, setResult] = useState("");

  const getFilteredEmails = () => {
    if (filter === "All") return emails;
    if (filter === "Spam") return emails.filter((e) => e.isSpam);
    return emails.filter((e) => e.category === filter && !e.isSpam);
  };

  const testBackend = () => {
    fetch("http://127.0.0.1:5000/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "React에서 보낸 테스트 요청입니다." }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("백엔드 응답:", data);
        setResult(data.summary);
      })
      .catch((err) => {
        console.error("백엔드 요청 실패:", err);
        setResult("❌ 요청 실패");
      });
  };

  return (
    <div className="app">
      <h1>📬 MailPilot AI</h1>
      <p>AI 비서가 요약한 메일입니다.</p>

      {/* 🔘 백엔드 연결 테스트 버튼 */}
      <button onClick={testBackend}>✅ 백엔드 연결 테스트</button>
      {result && <p>👉 백엔드 응답: {result}</p>}

      <FilterTabs setFilter={setFilter} />
      <EmailList emails={getFilteredEmails()} />
    </div>
  );
}

export default App;
