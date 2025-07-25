import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const GmailSummaryForm = forwardRef(
  ({ email, appPassword, after, setEmails }, ref) => {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
      if (!email || !appPassword) {
        console.log("[⚠️ GmailSummaryForm] 이메일 또는 비밀번호 없음");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        console.log(
          "[📧 메일 요청 시작]",
          email,
          after ? "새로고침" : "첫 로딩"
        );

        const res = await fetch("http://localhost:5001/api/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // ✅ 세션 쿠키 포함
          body: JSON.stringify({
            email,
            app_password: appPassword,
            after: after || null,
          }),
        });

        const data = await res.json();

        if (res.ok && data.emails) {
          console.log("[✅ 메일 응답 성공]", data.emails.length, "개");
          setEmails(data.emails); // ✅ 정렬은 App.jsx에서만!
          setError("");

          // 디버그 정보 출력 (개발 모드에서만)
          if (process.env.NODE_ENV === "development" && data.user_session) {
            console.log("[🔑 세션 정보]", data.user_session);
          }
        } else {
          console.error("[❗메일 응답 오류]", data.error);

          // 401 오류 (인증 실패) 처리
          if (res.status === 401) {
            setError("❗ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");

            // 3초 후 페이지 새로고침으로 로그인 화면으로 이동
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else {
            setError(data.error || "❗예상치 못한 응답");
          }
        }
      } catch (err) {
        console.error("[❗메일 요청 실패]", err);
        setError("❗요청 실패: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    useImperativeHandle(ref, () => ({
      refetch: fetchData,
    }));

    // ✅ 로딩 상태는 표시하지 않음 (조용히 처리)

    if (error) {
      return (
        <div
          style={{
            color: "red",
            padding: "10px",
            backgroundColor: "#fee",
            borderRadius: "4px",
            margin: "10px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      );
    }

    // 정상적으로 로딩 완료된 경우 아무것도 렌더링하지 않음
    return null;
  }
);

export default GmailSummaryForm;
