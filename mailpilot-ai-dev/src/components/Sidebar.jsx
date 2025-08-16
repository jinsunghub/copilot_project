// components/Sidebar.jsx (수정된 버전)
import React from "react";
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
  const handleLogoutClick = () => {
    const isConfirmed = window.confirm(
      `정말로 로그아웃하시겠습니까?\n\n현재 계정: ${userEmail}\n\n로그아웃하면 모든 데이터가 초기화됩니다.`
    );

    if (isConfirmed) {
      console.log("[🚪 로그아웃 확인] 사용자가 로그아웃을 확인했습니다.");
      onLogout();
    }
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
        <span className="logo-text">E.M.pilot</span>
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
