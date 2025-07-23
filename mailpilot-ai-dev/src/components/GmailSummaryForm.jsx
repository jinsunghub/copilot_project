import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const GmailSummaryForm = forwardRef(
  ({ email, appPassword, after, setEmails }, ref) => {
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
            after: after || null,
          }),
        });

        const data = await res.json();

        if (data.emails) {
          setEmails(data.emails); // ✅ 정렬은 App.jsx에서만!
          setError("");
        } else {
          setError(data.error || "❗예상치 못한 응답");
        }
      } catch (err) {
        setError("❗요청 실패: " + err.message);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    useImperativeHandle(ref, () => ({
      refetch: fetchData,
    }));

    return error ? <div style={{ color: "red" }}>{error}</div> : null;
  }
);

export default GmailSummaryForm;
