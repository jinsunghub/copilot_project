import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const GmailSummaryForm = forwardRef(
  ({ email, appPassword, setEmails }, ref) => {
    const [summaries, setSummaries] = useState([]);
    const [error, setError] = useState("");

    const fetchData = async () => {
      if (!email || !appPassword) return;

      try {
        const res = await fetch("http://localhost:5001/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, app_password: appPassword }),
        });

        const data = await res.json();

        if (data.emails) {
          setSummaries(data.emails.map((e) => e.summary));
          setEmails(
            data.emails.sort((a, b) => new Date(b.date) - new Date(a.date))
          );
          setError("");
        } else {
          setError(data.error || "예상치 못한 응답");
        }
      } catch (err) {
        setError("요청 실패: " + err.message);
      }
    };

    useEffect(() => {
      fetchData(); // 첫 마운트 시 자동 실행
    }, []);

    useImperativeHandle(ref, () => ({
      refetch: fetchData,
    }));

    return error ? <div style={{ color: "red" }}>{error}</div> : null;
  }
);

export default GmailSummaryForm;
