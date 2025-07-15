// renderer.js

let emails = []; // 전체 메일 저장용

// 초기 로딩
fetch("summary.json")
  .then((response) => response.json())
  .then((data) => {
    emails = data;
    renderEmails(emails);
  });

// 메일 렌더링 함수
function renderEmails(filteredEmails) {
  const list = document.getElementById("email-list");
  list.innerHTML = ""; // 기존 목록 초기화

  filteredEmails.forEach((mail) => {
    const el = document.createElement("div");
    el.className = "email-item";

    const spamStyle = mail.isSpam ? "opacity: 0.5;" : "";
    el.innerHTML = `
      <div style="${spamStyle} border:1px solid #ccc; padding:10px; margin-bottom:10px;">
        <span class="badge">${mail.category}</span>
        <strong>${mail.sender}</strong> - ${mail.subject}<br/>
        <p>${mail.summary}</p>
        <small>${mail.time}</small>
        ${
          mail.priority === "High"
            ? '<span style="color:red;">⚠️ High Priority</span>'
            : ""
        }
      </div>
    `;
    list.appendChild(el);
  });
}

// 필터 기능
function filterEmails(category) {
  if (category === "All") {
    renderEmails(emails);
  } else if (category === "Spam") {
    renderEmails(emails.filter((mail) => mail.isSpam));
  } else {
    renderEmails(
      emails.filter((mail) => mail.category === category && !mail.isSpam)
    );
  }
}
