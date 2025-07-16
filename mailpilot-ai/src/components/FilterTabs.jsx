function FilterTabs({ setFilter }) {
    const filters = ["All", "Important", "Spam", "Professor"];
    return (
      <div id="filter-tabs">
        {filters.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}>
            {cat === "All" ? "전체" :
             cat === "Important" ? "중요" :
             cat === "Spam" ? "스팸" : "교수님"}
          </button>
        ))}
      </div>
    );
  }
  
  export default FilterTabs;
  