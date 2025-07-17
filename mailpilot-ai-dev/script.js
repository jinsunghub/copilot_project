const sampleEmails = [
  {
    id: 1,
    subject: "🔔 새로운 과제 안내",
    from: "professor@university.edu",
    date: "2025-07-15",
    body: "안녕하세요, 이번 주 과제는 3장 읽고 요약 제출입니다.",
    tag: "받은",
  },
  {
    id: 2,
    subject: "📦 배송 완료 안내",
    from: "shop@naver.com",
    date: "2025-07-14",
    body: "주문하신 상품이 오늘 도착 예정입니다. 확인 부탁드립니다.",
    tag: "스팸",
  },
  {
    id: 3,
    subject: "💡 AI 프로젝트 미팅 정리",
    from: "teamlead@copilotai.com",
    date: "2025-07-13",
    body: "어제 논의한 AI 비서의 기능 세부사항을 정리해 보냈습니다.",
    tag: "중요",
  },
];

// ✅ 현재 보여지는 메일 목록을 추적하는 전역 변수
let currentMailList = sampleEmails;

function renderMailList(emails) {
  const mailList = document.getElementById("mailList");
  const mailCount = document.getElementById("mailCount");

  mailList.innerHTML = "";
  mailCount.textContent = `총 ${emails.length}건`;

  emails.forEach((email) => {
    const card = document.createElement("div");
    card.className = "mail-card";
    card.innerHTML = `
      <div class="subject">${email.subject}</div>
      <div class="from">보낸사람: ${email.from}</div>
      <div class="date">${email.date}</div>
    `;

    card.addEventListener("click", () => {
      showMailDetail(email);
    });

    mailList.appendChild(card);
  });
}

function showMailDetail(email) {
  document.getElementById("emailSubject").textContent = email.subject;
  document.getElementById("emailFrom").textContent = `보낸 사람: ${email.from}`;
  document.getElementById("emailDate").textContent = `받은 날짜: ${email.date}`;
  document.getElementById("emailBody").textContent = email.body;
}

window.onload = () => {
  renderMailList(sampleEmails);
};

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");

    const selected = item.textContent.trim();

    const tabMap = {
      "전체 메일": "ALL",
      "중요 메일": "중요",
      "받은 메일함": "받은",
      "보낸 메일함": "보낸",
      "내게 쓴 메일": "내게쓴",
      스팸: "스팸",
      "키워드 필터": "키워드",
    };

    const tagToFilter = tabMap[selected];

    if (tagToFilter === "ALL") {
      currentMailList = sampleEmails;
    } else {
      currentMailList = sampleEmails.filter((mail) => mail.tag === tagToFilter);
    }

    renderMailList(currentMailList);

    // 상세보기 초기화
    document.getElementById("emailSubject").textContent = "";
    document.getElementById("emailFrom").textContent = "";
    document.getElementById("emailDate").textContent = "";
    document.getElementById("emailBody").textContent = "";

    // 검색창 초기화
    document.getElementById("searchInput").value = "";
  });
});

// 🔍 검색 기능
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = currentMailList.filter(
    (mail) =>
      mail.subject.toLowerCase().includes(keyword) ||
      mail.from.toLowerCase().includes(keyword)
  );
  renderMailList(filtered);
});
