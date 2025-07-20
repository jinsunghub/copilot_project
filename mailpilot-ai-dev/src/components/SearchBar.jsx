import React from "react";

const SearchBar = ({ searchTerm, onSearch }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="🔍 메일 검색..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
      <button
        className="setting-button"
        onClick={() => alert("설정은 준비 중입니다")}
      >
        설정
      </button>
    </div>
  );
};

export default SearchBar;
