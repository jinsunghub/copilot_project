import { useEffect, useState } from "react";

function GmailSummaryForm({ email, appPassword, setEmails }) {
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState("");
  console.log("📧 email in GmailSummaryForm:", email);
  console.log("🔐 appPassword in GmailSummaryForm:", appPassword);
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
}

export default GmailSummaryForm;
