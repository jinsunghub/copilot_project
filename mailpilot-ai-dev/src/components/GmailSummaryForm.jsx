import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const GmailSummaryForm = forwardRef(
  ({ email, appPassword, setEmails, after = null }, ref) => {
    const [summaries, setSummaries] = useState([]);
    const [error, setError] = useState("");

    const fetchData = async () => {
      if (!email || !appPassword) return;

      try {
        const res = await fetch("http://localhost:5001/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            app_password: appPassword,
            ...(after && { after }), // ✅ after가 존재할 때만 추가
          }),
        });

        const data = await res.json();

        if (data.emails) {
          const sorted = data.emails.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setSummaries(sorted.map((e) => e.summary));
          setEmails(sorted);
          setError("");
        } else {
          setError(data.error || "예상치 못한 응답");
        }
      } catch (err) {
        setError("요청 실패: " + err.message);
      }
    };

    useEffect(() => {
      fetchData();
    }, [email, appPassword, after]); // ✅ after가 변경되면 다시 fetch

    useImperativeHandle(ref, () => ({
      refetch: fetchData,
    }));

    return error ? <div style={{ color: "red" }}>{error}</div> : null;
  }
);

export default GmailSummaryForm;
