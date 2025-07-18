import { useState } from "react";

function GmailSummaryForm({ setEmails }) {
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSummaries([]);
    setEmails([]); // 이메일 리스트 초기화
  
    try {
      const res = await fetch("http://127.0.0.1:5000/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, app_password: appPassword }),
      });
  
      const data = await res.json();
  
      if (data.emails) {
        // 📌 여기!
        setSummaries(data.emails.map((e) => e.summary)); // 요약 리스트
        console.log("✅ 받은 이메일들:", data.emails);
        setEmails(data.emails); // 전체 이메일 리스트
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("예상치 못한 응답");
      }
    } catch (err) {
      setError("요청 실패: " + err.message);
    }
  };
  

  return (
    <div>
      <h2>📨 Gmail 요약 요청</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Gmail 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="앱 비밀번호"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          required
        />
        <button type="submit">요약 요청</button>
      </form>

      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {summaries.length > 0 && (
        <div>
          <h3>✅ 요약 결과</h3>
          <ul>
            {summaries.map((s, i) => (
              <li key={i} style={{ marginBottom: "10px" }}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GmailSummaryForm;
