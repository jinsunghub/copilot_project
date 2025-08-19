import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const GmailSummaryForm = forwardRef(
  ({ email, appPassword, after, setEmails, selectedTag }, ref) => {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [gmailFetchCountCache, setGmailFetchCountCache] = useState(5); // 캐시된 설정값

    // 설정 업데이트 감지
    useEffect(() => {
      const handleSettingsUpdate = () => {
        console.log('[📧 GmailSummaryForm] 설정 업데이트 이벤트 수신, Gmail 설정 갱신');
        fetchGmailSettings();
      };
      
      window.addEventListener('settingsUpdated', handleSettingsUpdate);
      
      return () => {
        window.removeEventListener('settingsUpdated', handleSettingsUpdate);
      };
    }, [email]);

    // Gmail 설정 가져오기 (별도 함수로 분리)
    const fetchGmailSettings = async () => {
      if (!email) return;
      
      try {
        const settingsRes = await fetch(`http://localhost:5001/api/settings/GENERAL/READ?email=${encodeURIComponent(email)}`, {
          credentials: 'include'
        });
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          const newGmailFetchCount = settingsData.settings.gmailFetchCount || 5;
          setGmailFetchCountCache(newGmailFetchCount);
          console.log("[⚙️ Gmail 가져오기 개수 갱신]", newGmailFetchCount);
        }
      } catch (settingsErr) {
        console.warn("[⚠️ Gmail 설정 조회 실패]", settingsErr);
      }
    };

    // 초기 설정 로드
    useEffect(() => {
      fetchGmailSettings();
    }, [email]);

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

        // 캐시된 Gmail 가져오기 개수 사용
        const gmailFetchCount = gmailFetchCountCache;
        console.log("[⚙️ Gmail 가져오기 개수 (캐시됨)]", gmailFetchCount);

        // 태그와 관계없이 항상 받은메일 + 보낸메일 가져오기
        // 로그인/새로고침 시에만 호출되므로 항상 둘 다 가져옴
        console.log("[📧 보낸메일 먼저 요청]");
          
          // 1. 보낸메일 먼저 가져오기
          const sentRes = await fetch("http://localhost:5001/api/emails/sent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, count: gmailFetchCount, app_password: appPassword }),
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
              count: gmailFetchCount,
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
