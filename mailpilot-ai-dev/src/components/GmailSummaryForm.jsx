import { useEffect, useState } from "react";

function GmailSummaryForm({ email, appPassword, setEmails }) {
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email || !appPassword) return;

    const fetchData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, app_password: appPassword }),
        });

        const data = await res.json();

        if (data.emails) {
          setSummaries(data.emails.map((e) => e.summary));
          setEmails(data.emails);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("예상치 못한 응답");
        }
      } catch (err) {
        setError("요청 실패: " + err.message);
      }
    };

    fetchData();
  }, [email, appPassword, setEmails]);

  return (
    <div>
      <h2>📨 Gmail 요약 요청 결과</h2>
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
