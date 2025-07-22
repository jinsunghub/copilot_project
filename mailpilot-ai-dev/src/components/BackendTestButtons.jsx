import { useState } from "react";

function BackendTestButton() {
  const [result, setResult] = useState("");

  const testBackend = () => {
    fetch("http://127.0.0.1:5001/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "React에서 보낸 테스트 요청입니다." }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("백엔드 응답:", data);
        setResult(data.message);
      })
      .catch((err) => {
        console.error("백엔드 요청 실패:", err);
        setResult("❌ 요청 실패");
      });
  };

  return (
    <div>
      <button onClick={testBackend}>✅ 백엔드 연결 테스트</button>
      {result && <p>👉 백엔드 응답: {result}</p>}
    </div>
  );
}

export default BackendTestButton;
