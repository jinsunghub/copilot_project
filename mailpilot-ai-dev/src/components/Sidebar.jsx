// components/Sidebar.jsx (수정된 버전)
import React, { useState, useEffect } from "react";
import "./Sidebar.css";

// ✅ "할일 관리" 태그 추가
const tags = ["받은 메일", "보낸 메일", "중요 메일", "스팸", "보안 경고", "할일 관리", "챗봇 AI"];

// ✅ 태그별 아이콘 매핑 (할일 관리 추가)
const getTagIcon = (tag) => {
  switch (tag) {
    case "받은 메일":
      return "📬";
    case "보낸 메일":
      return "📤";
    case "중요 메일":
      return "⭐";
    case "스팸":
      return "🚫";
    case "보안 경고":
      return "🔒";
    case "할일 관리":  // ✅ 새로 추가
      return "📋";
    case "챗봇 AI":
      return "🤖";
    default:
      return "📁";
  }
};

const Sidebar = ({
  selectedTag,
  setSelectedTag,
  onCompose,
  onLogout,
  userEmail,
}) => {
  // 사용량 표시 관련 상태
  const [showUsageBar, setShowUsageBar] = useState(true);
  const [quotaWarning, setQuotaWarning] = useState(80);
  const [emailCount, setEmailCount] = useState(0);
  const [estimatedQuota, setEstimatedQuota] = useState(15000); // Gmail 기본 15GB를 메일 개수로 환산

  // 사용량 설정 불러오기
  useEffect(() => {
    fetchUsageSettings();
    fetchEmailCount();
  }, []);

  const fetchUsageSettings = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        console.error('[Sidebar] 사용자 이메일이 없습니다.');
        return;
      }
      
      // 사용량 설정이 새 설정 구조에서 제거되었으므로 기본값 사용
      console.log('[📊 Sidebar] 사용량 설정: 기본값 사용 (새 설정 구조에서 제거됨)');
      
      // 기본값 설정
      setShowUsageBar(false); // 사용량 표시 비활성화
      setQuotaWarning(80);    // 기본 할당량 경고 80%
    } catch (error) {
      console.error('[Sidebar] 사용량 설정 불러오기 실패:', error);
    }
  };

  const fetchEmailCount = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/emails/stored', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      });
      
      const data = await response.json();
      if (data.emails) {
        setEmailCount(data.emails.length);
      }
    } catch (error) {
      console.error('[Sidebar] 메일 개수 조회 실패:', error);
    }
  };

  const handleLogoutClick = () => {
    const isConfirmed = window.confirm(
      `정말로 로그아웃하시겠습니까?\n\n현재 계정: ${userEmail}\n\n로그아웃하면 모든 데이터가 초기화됩니다.`
    );

    if (isConfirmed) {
      console.log("[🚪 로그아웃 확인] 사용자가 로그아웃을 확인했습니다.");
      onLogout();
    }
  };

  // 사용량 계산
  const usagePercentage = Math.min((emailCount / estimatedQuota) * 100, 100);
  const isWarningLevel = usagePercentage >= quotaWarning;
  
  const getUsageColor = () => {
    if (usagePercentage >= 90) return '#dc3545'; // 빨강
    if (usagePercentage >= quotaWarning) return '#fd7e14'; // 주황
    return '#28a745'; // 초록
  };

  // ✅ 태그 클릭 핸들러 (명시적으로 함수 생성)
  const handleTagClick = (tag) => {
    console.log("[🏷️ 태그 클릭]", tag);
    setSelectedTag(tag);
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </div>
        <span className="logo-text">E.M.Pilot</span>
      </div>

      {/* ✅ 사용자 정보 표시 */}
      <div
        style={{
          padding: "8px 12px",
          backgroundColor: "#e8f4fd",
          border: "1px solid #bee5eb",
          borderRadius: "6px",
          marginBottom: "15px",
          fontSize: "12px",
          color: "#495057",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "500",
          }}
        >
          <span>👤</span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userEmail}
          </span>
        </div>
        <div
          style={{
            marginTop: "4px",
            fontSize: "11px",
            color: "#28a745",
            fontWeight: "500",
          }}
        >
          🟢 온라인
        </div>
      </div>

      {/* 사용량 표시 바 */}
      {showUsageBar && (
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "6px",
            marginBottom: "15px",
            fontSize: "12px"
          }}
        >
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "6px"
          }}>
            <span style={{ fontWeight: "500", color: "#495057" }}>
              📊 메일 사용량
            </span>
            <span style={{ 
              fontSize: "11px", 
              color: isWarningLevel ? getUsageColor() : "#6c757d",
              fontWeight: isWarningLevel ? "600" : "normal"
            }}>
              {emailCount.toLocaleString()}/{estimatedQuota.toLocaleString()}
            </span>
          </div>
          
          <div style={{
            width: "100%",
            height: "6px",
            backgroundColor: "#e9ecef",
            borderRadius: "3px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${usagePercentage}%`,
              height: "100%",
              backgroundColor: getUsageColor(),
              transition: "width 0.3s ease"
            }} />
          </div>
          
          <div style={{
            marginTop: "4px",
            fontSize: "10px",
            color: "#6c757d",
            textAlign: "center"
          }}>
            {usagePercentage.toFixed(1)}% 사용 중
            {isWarningLevel && (
              <span style={{ color: getUsageColor(), fontWeight: "600" }}>
                {" "}⚠️ 경고
              </span>
            )}
          </div>
        </div>
      )}

      <button
        className="setting-button"
        onClick={onCompose}
        style={{ width: "100%", marginBottom: "20px" }}
      >
        ✏️ 메일 쓰기
      </button>

      {/* ✅ 태그 리스트 - "할일 관리" 포함 */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tags.map((tag) => (
          <li
            key={tag}
            className={selectedTag === tag ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTagClick(tag);
            }}
            style={{
              padding: "8px 12px",
              margin: "0 0 8px 0",
              cursor: "pointer",
              borderRadius: "6px",
              color: selectedTag === tag ? "white" : "#333",
              backgroundColor: selectedTag === tag ? "#007bff" : "transparent",
              transition: "all 0.2s ease",
              userSelect: "none", // ✅ 텍스트 선택 방지
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (selectedTag !== tag) {
                e.target.style.backgroundColor = "#e0e0e0";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTag !== tag) {
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            <span style={{ fontSize: "16px" }}>{getTagIcon(tag)}</span>
            <span>{tag}</span>
          </li>
        ))}
      </ul>

      {/* ✅ 하단 로그아웃 섹션 */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          right: "20px",
          paddingTop: "15px",
          borderTop: "1px solid #dee2e6",
        }}
      >
        {/* 로그아웃 버튼 */}
        <button
          className="setting-button"
          onClick={handleLogoutClick}
          style={{
            width: "100%",
            backgroundColor: "#dc3545",
            color: "white",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          🚪 로그아웃
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
