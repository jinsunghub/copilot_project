// components/Sidebar.jsx (필터링 기능 추가된 버전)
import React, { useState, useEffect } from "react";
import "./Sidebar.css";

// ✅ "할일 관리" 태그 추가
const tags = [
  "전체 메일",
  "중요 메일",
  "스팸",
  "보안 경고",
  "할일 관리",
  "챗봇 AI",
];

// ✅ 태그별 아이콘 매핑 (할일 관리 추가)
const getTagIcon = (tag) => {
  switch (tag) {
    case "전체 메일":
      return "📬";
    case "중요 메일":
      return "⭐";
    case "스팸":
      return "🚫";
    case "보안 경고":
      return "🔒";
    case "할일 관리": // ✅ 새로 추가
      return "📋";
    case "챗봇 AI":
      return "🤖";
    default:
      return "📁";
  }
};

// ✅ 태그를 필터 타입으로 변환
const getFilterType = (tag) => {
  switch (tag) {
    case "전체 메일":
      return "all";
    case "중요 메일":
      return "important";
    case "스팸":
      return "spam";
    case "보안 경고":
      return "security";
    default:
      return "all";
  }
};

const Sidebar = ({
  selectedTag,
  setSelectedTag,
  onCompose,
  onLogout,
  userEmail,
  onFilterChange, // ✅ 필터 변경 콜백 추가 (선택사항)
}) => {
  // ✅ 필터별 메일 개수 상태
  const [filterStats, setFilterStats] = useState({
    all: 0,
    important: 0,
    spam: 0,
    security: 0,
  });

  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // ✅ 필터 통계 로드
  const loadFilterStats = async () => {
    try {
      if (!userEmail) return;

      setIsLoadingStats(true);
      console.log("[📊 필터 통계 로드 시작]");

      const response = await fetch(
        `http://localhost:5001/api/emails/filter-stats?email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFilterStats(data.stats);
          console.log("[✅ 필터 통계 로드 완료]", data.stats);
        }
      } else {
        console.error("[❗필터 통계 로드 실패]", response.status);
      }
    } catch (error) {
      console.error("[❗필터 통계 오류]", error);
      // 오류 시 기본값 유지
    } finally {
      setIsLoadingStats(false);
    }
  };

  // ✅ 컴포넌트 마운트 시 통계 로드 (조건부)
  useEffect(() => {
    if (userEmail) {
      // 백엔드에 필터링 API가 있을 때만 로드
      loadFilterStats();
    }
  }, [userEmail]);

  // ✅ 태그별 개수 가져오기
  const getTagCount = (tag) => {
    const filterType = getFilterType(tag);
    return filterStats[filterType] || 0;
  };

  // ✅ 로그아웃 핸들러
  const handleLogoutClick = () => {
    const isConfirmed = window.confirm(
      `정말로 로그아웃하시겠습니까?\n\n현재 계정: ${userEmail}\n\n로그아웃하면 모든 데이터가 초기화됩니다.`
    );

    if (isConfirmed) {
      console.log("[🚪 로그아웃 확인] 사용자가 로그아웃을 확인했습니다.");
      onLogout();
    }
  };

  // ✅ 태그 클릭 핸들러 (필터링 기능 포함)
  const handleTagClick = (tag) => {
    console.log("[🏷️ 태그 클릭]", tag);
    setSelectedTag(tag);

    // 메일 관련 태그이고 onFilterChange가 있을 때만 필터 적용
    if (
      ["전체 메일", "중요 메일", "스팸", "보안 경고"].includes(tag) &&
      onFilterChange
    ) {
      const filterType = getFilterType(tag);
      console.log(`[🔍 필터 적용] ${tag} -> ${filterType}`);
      onFilterChange(filterType);
    }
  };

  // ✅ 새로고침 핸들러
  const handleRefreshStats = () => {
    console.log("[🔄 통계 새로고침]");
    loadFilterStats();
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </div>
        <span className="logo-text">MailPilot</span>
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

      <button
        className="setting-button"
        onClick={onCompose}
        style={{ width: "100%", marginBottom: "20px" }}
      >
        ✏️ 메일 쓰기
      </button>

      {/* ✅ 태그 리스트 - "할일 관리" 포함 */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tags.map((tag) => {
          const count = getTagCount(tag);
          const isActive = selectedTag === tag;
          const isMailTag = [
            "전체 메일",
            "중요 메일",
            "스팸",
            "보안 경고",
          ].includes(tag);

          return (
            <li
              key={tag}
              className={isActive ? "active" : ""}
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
                color: isActive ? "white" : "#333",
                backgroundColor: isActive ? "#007bff" : "transparent",
                transition: "all 0.2s ease",
                userSelect: "none", // ✅ 텍스트 선택 방지
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#e0e0e0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {/* 왼쪽: 아이콘 + 라벨 */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "16px" }}>{getTagIcon(tag)}</span>
                <span>{tag}</span>
              </div>

              {/* 오른쪽: 개수 배지 (메일 관련 태그만, 개수가 있을 때만) */}
              {isMailTag && onFilterChange && count > 0 && (
                <span
                  style={{
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.3)"
                      : "#007bff",
                    color: "white",
                    borderRadius: "10px",
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontWeight: "600",
                    minWidth: "18px",
                    textAlign: "center",
                    border: isActive
                      ? "1px solid rgba(255, 255, 255, 0.5)"
                      : "none",
                  }}
                >
                  {count}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* ✅ 메일 통계 요약 (필터링 기능이 있을 때만 표시) */}
      {onFilterChange &&
        (filterStats.all > 0 ||
          filterStats.important > 0 ||
          filterStats.spam > 0 ||
          filterStats.security > 0) && (
          <div
            style={{
              margin: "20px 0",
              padding: "12px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                marginBottom: "8px",
                color: "#495057",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              📊 메일 현황
            </div>
            <div style={{ color: "#6c757d", lineHeight: "1.4" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                }}
              >
                <span>📬 전체:</span>
                <span style={{ fontWeight: "600", color: "#495057" }}>
                  {filterStats.all}개
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                }}
              >
                <span>⭐ 중요:</span>
                <span style={{ fontWeight: "600", color: "#ffc107" }}>
                  {filterStats.important}개
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                }}
              >
                <span>🔒 보안:</span>
                <span style={{ fontWeight: "600", color: "#dc3545" }}>
                  {filterStats.security}개
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>🚫 스팸:</span>
                <span style={{ fontWeight: "600", color: "#6c757d" }}>
                  {filterStats.spam}개
                </span>
              </div>
            </div>
          </div>
        )}

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

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
