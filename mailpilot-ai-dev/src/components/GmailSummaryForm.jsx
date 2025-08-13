import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const GmailSummaryForm = forwardRef(
  ({ email, appPassword, after, setEmails, selectedTag }, ref) => {
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

        if (selectedTag === "보낸 메일") {
          // 보낸메일만 가져오기 (기존 로직)
          const res = await fetch("http://localhost:5001/api/emails/sent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, count: 5, app_password: appPassword }),
          });

          const data = await res.json();

          if (res.ok && data.emails) {
            console.log("[✅ 보낸메일 응답 성공]", data.emails.length, "개");
            setEmails(data.emails);
            setError("");
          } else {
            console.error("[❗보낸메일 응답 오류]", data.error);
            setError(data.error || "❗보낸메일 요청 실패");
          }
        } else {
          // 보낸메일 먼저, 그 다음 받은메일 순차 가져오기
          console.log("[📧 보낸메일 먼저 요청]");
          
          // 1. 보낸메일 먼저 가져오기
          const sentRes = await fetch("http://localhost:5001/api/emails/sent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, count: 5, app_password: appPassword }),
          });
          
          const sentData = await sentRes.json();
          console.log("[📤 보낸메일 응답 완료]", sentData.emails?.length || 0, "개");
          
          // 2. 받은메일 가져오기
          console.log("[📧 받은메일 요청]");
          const inboxRes = await fetch("http://localhost:5001/api/summary", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              email,
              app_password: appPassword,
              after: after || null,
            }),
          });
          
          const inboxData = await inboxRes.json();

          // 받은메일 결과 처리
          if (inboxRes.ok && inboxData.emails) {
            console.log("[✅ 받은메일 응답 성공]", inboxData.emails.length, "개");
            
            // 보낸메일도 성공했으면 합치기
            if (sentRes.ok && sentData.emails) {
              console.log("[✅ 보낸메일 응답 성공]", sentData.emails.length, "개");
              
              // 받은메일과 보낸메일 합치기 (받은메일 우선 표시)
              const allEmails = [...inboxData.emails, ...sentData.emails];
              console.log("[📧 전체 메일]", allEmails.length, "개 (받은메일 + 보낸메일)");
              setEmails(allEmails);
            } else {
              console.log("[⚠️ 보낸메일 실패, 받은메일만 표시]");
              setEmails(inboxData.emails);
            }
            
            setError("");

            // 디버그 정보 출력 (개발 모드에서만)
            if (process.env.NODE_ENV === "development" && inboxData.user_session) {
              console.log("[🔑 세션 정보]", inboxData.user_session);
            }
          } else {
            console.error("[❗받은메일 응답 오류]", inboxData.error);

            // 401 오류 (인증 실패) 처리
            if (inboxRes.status === 401) {
              setError("❗ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");

              // 3초 후 페이지 새로고침으로 로그인 화면으로 이동
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            } else {
              setError(inboxData.error || "❗예상치 못한 응답");
            }
          }
        }
      } catch (err) {
        console.error("[❗메일 요청 실패]", err);
        setError("❗요청 실패: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ 자동 호출 제거 - 오직 수동 새로고침 버튼으로만 호출
    // useEffect(() => {
    //   fetchData();
    // }, []);

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
