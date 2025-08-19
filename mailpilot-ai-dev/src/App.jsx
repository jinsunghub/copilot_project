// App.jsx (TodoDashboard 통합된 버전)
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import MailList from "./components/MailList";
import MailDetail from "./components/MailDetail";
import BackendTestButton from "./components/BackendTestButtons";
import GmailSummaryForm from "./components/GmailSummaryForm";
import Login from "./components/Login";
import WriteMail from "./components/WriteMail";
import Chatbot from "./components/Chatbot";
import TodoDashboard from "./components/TodoDashboard";  // ✅ 새로 추가
import DetailedSettings from "./components/DetailedSettings";  // 상세 설정 컴포넌트
import { useLanguage } from "./contexts/LanguageContext";

// ✅ 날짜 파싱 함수를 App 레벨로 이동하여 일관성 확보
const parseDate = (dateStr) => {
  const parsed = new Date(dateStr);
  if (!isNaN(parsed)) return parsed;

  const koreanMatch = dateStr.match(
    /(?:(\d{4})년)?\s*(\d{1,2})월\s*(\d{1,2})일/
  );
  if (koreanMatch) {
    const year = koreanMatch[1] || new Date().getFullYear();
    const month = koreanMatch[2].padStart(2, "0");
    const day = koreanMatch[3].padStart(2, "0");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date();
};

const App = ({ email, appPassword, onLogout }) => {
  const { t, changeLanguage } = useLanguage();
  const [emails, setEmails] = useState([]);
  const [selectedTag, setSelectedTag] = useState("받은 메일");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [viewingEmail, setViewingEmail] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); //체크박스
  const [isGeneratingAI, setIsGeneratingAI] = useState(false); // AI 답장 생성 상태
  const [showAIModal, setShowAIModal] = useState(false); // AI 답장 모달 표시 상태
  const [aiModalEmail, setAiModalEmail] = useState(null); // AI 모달에서 사용할 이메일
  const [userIntent, setUserIntent] = useState(""); // 사용자 의도
  const [showSettings, setShowSettings] = useState(false); // 설정 화면 표시 상태
  const [theme, setTheme] = useState('light'); // 테마 설정 (light/dark)
  const [uiFontSettings, setUiFontSettings] = useState({
    uiFontFamily: 'system',
    uiFontSize: '14px'
  }); // UI 글꼴 설정

  const gmailRef = useRef(null); // ✅ 새로고침 버튼용 ref
  
  // 설정 가져오기 및 적용 
  useEffect(() => {
    if (email) {
      fetchUIFontSettings();
      fetchThemeSettings(); // 테마 설정도 가져오기
    }
    
    // 설정 업데이트 이벤트 리스너
    const handleSettingsUpdate = () => {
      console.log('[🎨 설정] 설정 업데이트 이벤트 수신');
      fetchUIFontSettings();
      fetchThemeSettings(); // 테마 설정도 새로고침
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, [email]); // email 의존성 추가
  
  
  const fetchUIFontSettings = async () => {
    try {
      const userEmail = email || localStorage.getItem('email');
      if (!userEmail) {
        console.log('[🎨 글꼴] 사용자 이메일 없음');
        return;
      }
      
      console.log('[🎨 글꼴] API 요청:', `http://localhost:5001/api/settings/GENERAL/WRITE?email=${encodeURIComponent(userEmail)}`);
      
      const response = await fetch(`http://localhost:5001/api/settings/GENERAL/WRITE?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('[🎨 글꼴] API 응답 전체:', data);
      
      if (data.success && data.settings) {
        console.log('[🎨 글꼴] 실제 설정 데이터:', data.settings);
        const fontFamily = data.settings.fontFamily || 'system';
        const fontSize = data.settings.fontSize || '14px';
        
        console.log('[🎨 글꼴] 추출된 값:', { fontFamily, fontSize });
        
        setUiFontSettings({ uiFontFamily: fontFamily, uiFontSize: fontSize });
        applyUIFontSettings(fontFamily, fontSize);
        
        console.log('[🎨 글꼴] UI 글꼴 적용:', fontFamily, fontSize);
      } else {
        console.error('[🎨 글꼴] 설정 데이터 없음 또는 실패:', data);
      }
    } catch (error) {
      console.error('[🎨 글꼴] 설정 불러오기 실패:', error);
    }
  };
  
  const applyUIFontSettings = (fontFamily, fontSize) => {
    console.log('[🎨 글꼴 디버그] 설정 적용:', fontFamily, fontSize);
    
    // 글꼴 이름을 CSS 클래스명으로 매핑
    const fontClassMap = {
      'system': 'font-system',
      'Arial': 'font-arial',
      '돋움': 'font-dotum',
      '맑은 고딕': 'font-malgun',
      '굴림': 'font-gulim',
      '바탕': 'font-batang',
      '궁서': 'font-gungsuh',
      'Times New Roman': 'font-times',
      'Helvetica': 'font-helvetica',
      'Verdana': 'font-verdana',
      'Georgia': 'font-georgia',
      'Courier New': 'font-courier'
    };
    
    const fontClass = fontClassMap[fontFamily] || 'font-system';
    const sizeClass = `size-${fontSize}`;
    
    // 기존 글꼴/크기 클래스 제거
    document.body.classList.remove(
      ...Object.values(fontClassMap),
      'size-10px', 'size-11px', 'size-12px', 'size-13px', 'size-14px',
      'size-15px', 'size-16px', 'size-18px', 'size-20px', 'size-22px'
    );
    
    // 새 클래스 추가
    document.body.classList.add(fontClass, sizeClass);
    
    console.log('[🎨 글꼴 적용 완료] 클래스:', fontClass, sizeClass);
  };

  // 테마 설정 가져오기
  const fetchThemeSettings = async () => {
    try {
      const userEmail = email || localStorage.getItem('email');
      if (!userEmail) {
        console.log('[🌙 테마] 사용자 이메일 없음');
        return;
      }
      
      console.log('[🌙 테마] API 요청:', `http://localhost:5001/api/settings/GENERAL/THEME?email=${encodeURIComponent(userEmail)}`);
      
      const response = await fetch(`http://localhost:5001/api/settings/GENERAL/THEME?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('[🌙 테마] API 응답:', data);
      
      if (data.success && data.settings && data.settings.appearance) {
        const themeValue = data.settings.appearance;
        console.log('[🌙 테마] 저장된 테마:', themeValue);
        
        // auto 모드인 경우 시스템 설정 확인
        let actualTheme = themeValue;
        if (themeValue === 'auto') {
          actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          console.log('[🌙 테마] 시스템 테마 감지:', actualTheme);
        }
        
        setTheme(actualTheme);
        applyTheme(actualTheme);
        
        console.log('[🌙 테마] 테마 적용 완료:', actualTheme);
      } else {
        console.log('[🌙 테마] 저장된 테마 없음, 기본값(light) 사용');
        setTheme('light');
        applyTheme('light');
      }
    } catch (error) {
      console.error('[🌙 테마] 설정 불러오기 실패:', error);
    }
  };
  
  
  // 테마 적용 함수
  const applyTheme = (themeValue) => {
    const root = document.documentElement;
    if (themeValue === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
    console.log(`[🌙 테마] ${themeValue} 모드 적용`);
  };
  

  // ✅ 로그인 후 자동 새로고침 (새 메일 가져오기) - 로그인 시에만
  useEffect(() => {
    if (email && appPassword) {
      console.log(`[🔄 로그인 후 메일 가져오기] 로그인: ${!!email}`);
      
      // 중복 방지를 위한 지연
      const timer = setTimeout(() => {
        gmailRef.current?.refetch();
      }, 300); // 0.3초 후 실행
      
      // 클린업: 컴포넌트 언마운트나 의존성 변경 시 타이머 취소
      return () => clearTimeout(timer);
    }
  }, [email, appPassword]); // selectedTag 의존성 제거 - 로그인 시에만 실행

  // AI 답장 생성 함수
  const generateAIReply = async (originalEmail, userIntent = "") => {
    setIsGeneratingAI(true);
    try {
      console.log("[🤖 AI 답장 생성 시작]", originalEmail.subject, userIntent ? `의도: ${userIntent}` : "");

      const response = await fetch(
        "http://localhost:5001/api/generate-ai-reply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // ✅ 세션 쿠키 포함
          body: JSON.stringify({
            sender: originalEmail.from,
            subject: originalEmail.subject,
            body: originalEmail.body,
            email: email, // ✅ 현재 사용자 이메일 추가
            user_intent: userIntent, // ✅ 사용자 의도 추가
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("[✅ AI 답장 생성 완료]");

        // 발신자 이메일 추출
        const sender =
          originalEmail.from.match(/<(.+?)>/)?.[1] || originalEmail.from;

        // 원본 메일 인용 헤더
        const replyHeader = `\n\n---------------------------------------------------\n${originalEmail.date}에, 작성자 <${sender}>님이 작성:\n${originalEmail.body}`;

        // AI가 생성한 답장과 원본 메일 결합
        const aiReplyWithOriginal = data.ai_reply + replyHeader;

        // 메일 작성 폼에 AI 답장 설정
        setSelectedEmail({
          to: sender,
          subject: `RE: ${originalEmail.subject}`,
          body: aiReplyWithOriginal,
          isAIGenerated: true, // AI 생성 표시용
        });

        // 작성 모드로 전환
        setTimeout(() => {
          setIsComposing(true);
          setViewingEmail(null);
        }, 10);

        alert("🤖 AI 답장이 생성되었습니다!");
      } else {
        console.error("[❗AI 답장 생성 실패]", data.error);
        alert(`AI 답장 생성 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("[❗AI 답장 요청 오류]", error);
      alert("AI 답장 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // AI 답장 모달 열기
  const openAIModal = (emailToReply) => {
    setAiModalEmail(emailToReply);
    setUserIntent("");
    setShowAIModal(true);
  };

  // AI 답장 모달 닫기
  const closeAIModal = () => {
    setShowAIModal(false);
    setAiModalEmail(null);
    setUserIntent("");
  };

  // 모달에서 AI 답장 생성 실행
  const handleAIModalSubmit = async () => {
    if (aiModalEmail) {
      closeAIModal();
      await generateAIReply(aiModalEmail, userIntent);
    }
  };

  // ✅ 태그 매핑 (받은메일/보낸메일 추가)
  const tagMap = {
    "받은 메일": "inbox", 
    "보낸 메일": "sent",
    "중요 메일": ["university.", "company."], // 대학교 + 회사기업
    스팸: "spam mail.",
    "보안 경고": "security alert.",
    "할일 관리": "todo_dashboard", // ✅ 새로 추가
    "챗봇 AI": "chatbot", // 챗봇 추가
  };

  const requiredTag = tagMap[selectedTag];

  const filteredEmails = emails.filter((emailItem) => {
    let matchesTag = true;

    if (requiredTag) {
      if (selectedTag === "받은 메일") {
        // 받은메일만: classification이 "sent"가 아닌 것들
        matchesTag = emailItem.classification !== "sent";
      } else if (selectedTag === "보낸 메일") {
        // 보낸메일만: classification이 "sent"인 것들
        matchesTag = emailItem.classification === "sent";
      } else if (selectedTag === "중요 메일") {
        // 중요 메일: university. 또는 company. 분류 (받은메일만)
        matchesTag =
          emailItem.classification !== "sent" && 
          (emailItem.classification?.toLowerCase() === "university." ||
           emailItem.classification?.toLowerCase() === "company.");
      } else if (selectedTag === "스팸") {
        // 스팸: spam mail. 분류 (받은메일만)
        matchesTag = 
          emailItem.classification !== "sent" &&
          emailItem.classification?.toLowerCase() === "spam mail.";
      } else if (selectedTag === "보안 경고") {
        // 보안 경고: security alert. 분류 (받은메일만)
        matchesTag =
          emailItem.classification !== "sent" &&
          emailItem.classification?.toLowerCase() === "security alert.";
      }
    }

    const matchesSearch =
      emailItem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailItem.from.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTag && matchesSearch;
  });

  // 로그인 상태는 main.jsx에서 관리되므로 여기서는 제거

  return (
    <div className="app-container">
      <Sidebar
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        onCompose={() => {
          setIsComposing(true);
          setSelectedEmail(null);
        }}
        onLogout={onLogout} // ✅ 로그아웃 함수 전달
        userEmail={email} // ✅ 현재 사용자 이메일 전달
      />

      <div className="main-panel">
        {/* ✅ 할일 관리와 챗봇이 아닐 때만 검색바와 새로고침 버튼 표시 */}
        {selectedTag !== "할일 관리" && selectedTag !== "챗봇 AI" && (
          <>
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
            
            {/* ✅ 새로고침 버튼과 설정 버튼 */}
            <div style={{ padding: "8px 16px", display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                className="setting-button"
                onClick={() => gmailRef.current?.refetch()}
              >
                🔄 {t.common.mailRefresh}
              </button>
              
              
              <button
                className="setting-button"
                onClick={() => setShowSettings(true)}
                style={{ marginLeft: "auto" }}
              >
                ⚙️ {t.common.settings}
              </button>
            </div>
          </>
        )}

        {/* ✅ 메인 컨텐츠 렌더링 */}
        {isComposing ? (
          <WriteMail
            onBack={() => setIsComposing(false)}
            email={email}
            appPassword={appPassword}
            selectedEmail={selectedEmail}
          />
        ) : selectedTag === "할일 관리" ? (
          // ✅ 할일 관리 대시보드
          <TodoDashboard 
            email={email} 
            appPassword={appPassword} 
          />
        ) : selectedTag === "챗봇 AI" ? (
          // 챗봇
          <Chatbot email={email} appPassword={appPassword} />
        ) : viewingEmail ? (
          <div className="mail-content">
            <h2>{viewingEmail.subject}</h2>
            <p>
              <strong>보낸 사람:</strong> {viewingEmail.from}
            </p>
            <p>
              <strong>받은 날짜:</strong> {viewingEmail.date}
            </p>
            <hr />
            <pre className="mail-body">{viewingEmail.body}</pre>
            <br />
            <button
              className="setting-button"
              onClick={() => setViewingEmail(null)}
            >
              뒤로가기
            </button>
            <button
              className="setting-button"
              style={{ marginLeft: "10px" }}
              onClick={() => {
                const original = viewingEmail;
                const sender =
                  original.from.match(/<(.+?)>/)?.[1] || original.from;
                const replyHeader = `\n---------------------------------------------------
                \n${original.date}에, 작성자 <${sender}>님이 작성:\n${original.body}`;

                setSelectedEmail({
                  to: sender,
                  subject: `RE: ${original.subject}`,
                  body: replyHeader,
                });
                // 2️⃣ 그리고 10ms 후에 작성 모드로 전환
                setTimeout(() => {
                  setIsComposing(true);
                  setViewingEmail(null);
                }, 10);
              }}
            >
              답장
            </button>

            <button
              className="setting-button"
              style={{
                marginLeft: "10px",
                backgroundColor: isGeneratingAI ? "#ccc" : "#4CAF50",
                cursor: isGeneratingAI ? "not-allowed" : "pointer",
              }}
              onClick={() => openAIModal(viewingEmail)}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? "🤖 AI 답장 생성 중..." : "🤖 AI 답장"}
            </button>
          </div>
        ) : (
          // 메일 리스트
          <MailList
            emails={filteredEmails}
            onSelectEmail={(emailItem) => {
              setViewingEmail(emailItem);
              setSelectedEmail(emailItem); // 단일 메일로 설정
            }}
            selectedIds={selectedIds} //체크박스
            setSelectedIds={setSelectedIds} //체크박스
            onEmailDeleted={(deletedEmail) => {
              // 삭제된 메일을 목록에서 제거
              setEmails(prev => prev.filter(email => 
                !(email.subject === deletedEmail.subject && 
                  email.from === deletedEmail.from && 
                  email.date === deletedEmail.date)
              ));
              
              // 현재 보고 있는 메일이 삭제된 메일이면 선택 해제
              if (viewingEmail && 
                  viewingEmail.subject === deletedEmail.subject && 
                  viewingEmail.from === deletedEmail.from) {
                setViewingEmail(null);
                setSelectedEmail(null);
              }
            }}
          />
        )}
      </div>

      {/* ✅ MailDetail은 할일 관리와 챗봇이 아닐 때만 표시 */}
      {selectedTag !== "할일 관리" && selectedTag !== "챗봇 AI" && (
        <MailDetail 
          email={selectedEmail}
          onDeleteEmail={(emailId) => {
            // 메일 삭제 후 다음 메일 자동 선택 로직
            const currentIndex = filteredEmails.findIndex(e => e.id === emailId);
            if (currentIndex !== -1 && currentIndex < filteredEmails.length - 1) {
              setSelectedEmail(filteredEmails[currentIndex + 1]);
            } else if (currentIndex > 0) {
              setSelectedEmail(filteredEmails[currentIndex - 1]);
            } else {
              setSelectedEmail(null);
            }
          }}
          onNextEmail={() => {
            // 다음 메일로 이동
            const currentIndex = filteredEmails.findIndex(e => e.id === selectedEmail?.id);
            if (currentIndex !== -1 && currentIndex < filteredEmails.length - 1) {
              setSelectedEmail(filteredEmails[currentIndex + 1]);
            }
          }}
          emailList={filteredEmails}
        />
      )}

      {/* ✅ GmailSummaryForm은 항상 렌더링 (태그 전환으로 인한 재마운트 방지) */}
      <div className="right-panel" style={{ display: 'none' }}>
        <GmailSummaryForm
          ref={gmailRef}
          email={email}
          appPassword={appPassword}
          after={lastFetchTime}
          selectedTag={selectedTag}
          setEmails={(newMails) => {
              setEmails((prev) => {
                console.log("새로운 메일:", newMails.length, "개");
                console.log("기존 메일:", prev.length, "개");

                // 첫 로딩인지 확인
                const isFirstLoad = prev.length === 0;

                if (isFirstLoad) {
                  // ✅ 첫 로딩: 새 메일들만 날짜순 정렬해서 반환하고 모든 메일을 MailDetail에 표시
                  console.log("첫 로딩 - 새 메일들을 날짜순 정렬");
                  const sorted = newMails.sort((a, b) => {
                    const dateA = parseDate(a.date);
                    const dateB = parseDate(b.date);
                    return dateB - dateA; // 내림차순: 최신이 위로
                  });
                  console.log("첫 로딩 정렬 완료:", sorted.length, "개");
                  // 첫 로딩 시에는 모든 메일을 MailDetail에 표시
                  setSelectedEmail(sorted);
                  return sorted;
                } else {
                  // ✅ 새로고침: 기존 메일보다 더 최신인 메일만 필터링
                  console.log("새로고침 - 기존 메일보다 최신인 메일만 필터링");

                  // 기존 메일 중 가장 최신 날짜 찾기
                  const latestExistingDate =
                    prev.length > 0
                      ? Math.max(
                          ...prev.map((mail) => parseDate(mail.date).getTime())
                        )
                      : 0;

                  console.log(
                    "기존 메일 중 최신 날짜:",
                    new Date(latestExistingDate)
                  );

                  // 기존 메일보다 더 최신인 메일만 필터링
                  const reallyNewMails = newMails.filter((mail) => {
                    const mailDate = parseDate(mail.date).getTime();
                    return mailDate > latestExistingDate;
                  });

                  console.log("진짜 새로운 메일:", reallyNewMails.length, "개");

                  if (reallyNewMails.length > 0) {
                    // 1. 진짜 새로운 메일들을 날짜순으로 정렬 (최신 먼저)
                    const sortedNewMails = reallyNewMails.sort((a, b) => {
                      const dateA = parseDate(a.date);
                      const dateB = parseDate(b.date);
                      return dateB - dateA;
                    });

                    // 2. 새 메일을 기존 메일 앞에 추가
                    const combined = [...sortedNewMails, ...prev];

                    // 3. 중복 제거 (subject + from + date 기준)
                    const seen = new Set();
                    const unique = combined.filter((mail) => {
                      const key = `${mail.subject}-${mail.from}-${mail.date}`;
                      if (seen.has(key)) return false;
                      seen.add(key);
                      return true;
                    });

                    console.log("새로고침 완료:", unique.length, "개");
                    console.log("맨 위 메일 날짜:", unique[0]?.date);

                    // ✅ 진짜 새로운 메일들만 MailDetail에 표시
                    setSelectedEmail(sortedNewMails);

                    return unique;
                  } else {
                    console.log("새로운 메일이 없습니다.");
                    // 새로운 메일이 없으면 기존 상태 유지
                    return prev;
                  }
                }
              });

              // ✅ 4. 메일 선택 상태 갱신은 위에서 이미 처리됨
              if (newMails.length > 0) {
                // 이미 위 로직에서 setSelectedEmail 처리됨
              }

              // ✅ 5. 새로고침 시점 저장
              setLastFetchTime(new Date().toISOString());
            }}
          />
        </div>
        
        {/* ✅ AI 답장 의도 입력 모달 */}
        {showAIModal && (
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={closeAIModal}
          >
            <div 
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "500px",
                width: "90%",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>
                🤖 AI 답장 생성
              </h3>
              
              <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}>
                어떤 스타일의 답장을 원하시나요? 의도를 입력해주세요.
              </p>
              
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="예: 정중하게 거절, 회의 일정 조율, 감사 인사, 간단한 확인..."
                  value={userIntent}
                  onChange={(e) => setUserIntent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAIModalSubmit();
                    }
                  }}
                  autoFocus
                />
              </div>
              
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={closeAIModal}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#333",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  취소
                </button>
                
                <button
                  onClick={handleAIModalSubmit}
                  disabled={isGeneratingAI}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: isGeneratingAI ? "#ccc" : "#4CAF50",
                    color: "white",
                    cursor: isGeneratingAI ? "not-allowed" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  {isGeneratingAI ? "생성 중..." : "🤖 답장 생성"}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* ✅ 설정 화면 모달 */}
        {showSettings && (
          <DetailedSettings onClose={() => {
            setShowSettings(false);
            // 설정 닫기만 하고 추가 API 호출 제거 (404 에러 방지)
          }} />
        )}
    </div>
  );
};

export default App;
