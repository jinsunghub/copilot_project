const translations = {
  ko: {
    // 사이드바
    sidebar: {
      inbox: '받은 메일',
      sent: '보낸 메일',
      important: '중요',
      starred: '별표',
      trash: '휴지통',
      compose: '메일 쓰기',
      todo: '할일 관리',
      chatbot: '챗봇 AI',
      logout: '로그아웃'
    },
    
    // 메일 리스트
    mailList: {
      noEmails: '이메일이 없습니다',
      previous: '이전',
      next: '다음',
      page: '페이지',
      of: '중',
      summary: '요약',
      attachments: '첨부',
      objects: '감지된 객체'
    },
    
    // 메일 상세
    mailDetail: {
      from: '보낸사람',
      to: '받는사람',
      date: '날짜',
      subject: '제목',
      reply: '답장',
      replyAll: '전체 답장',
      forward: '전달',
      delete: '삭제',
      aiReply: 'AI 답장',
      generateReply: 'AI 답장 생성',
      userIntent: '어떤 스타일의 답장을 원하시나요?',
      generating: '생성 중...',
      cancel: '취소'
    },
    
    // 메일 작성
    compose: {
      title: '새 메일',
      to: '받는사람',
      subject: '제목',
      body: '내용',
      send: '전송',
      cancel: '취소',
      sending: '전송 중...',
      attachFile: '파일 첨부'
    },
    
    // 설정
    settings: {
      title: '설정',
      general: '일반',
      notifications: '알림',
      ai: 'AI 모델',
      email: '이메일',
      security: '보안',
      language: '언어',
      theme: '테마',
      light: '라이트',
      dark: '다크',
      auto: '시스템 설정 따르기',
      autoRefresh: '자동 새로고침',
      refreshInterval: '새로고침 간격 (분)',
      emailsPerPage: '페이지당 이메일 수',
      autoMarkRead: '열람 시 자동으로 읽음 표시',
      confirmDelete: '삭제 시 확인 메시지 표시',
      save: '저장',
      cancel: '취소',
      reset: '초기화',
      resetCurrentTab: '현재 탭 초기화'
    },
    
    // 챗봇
    chatbot: {
      title: '챗봇 AI',
      placeholder: '메시지를 입력하세요...',
      send: '전송',
      thinking: '생각 중...',
      error: '오류가 발생했습니다',
      retry: '다시 시도'
    },
    
    // 할일 관리
    todo: {
      title: '할일 관리',
      addTask: '할일 추가',
      pending: '대기중',
      inProgress: '진행중',
      completed: '완료',
      high: '높음',
      medium: '보통',
      low: '낮음',
      priority: '우선순위',
      dueDate: '마감일',
      noTasks: '할일이 없습니다'
    },
    
    // 공통
    common: {
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      confirm: '확인',
      cancel: '취소',
      delete: '삭제',
      edit: '수정',
      save: '저장',
      search: '검색',
      filter: '필터',
      refresh: '새로고침',
      mailRefresh: '메일 새로고침',
      settings: '설정'
    },
    
    // 로그인
    login: {
      title: 'MailPilot AI 로그인',
      email: '이메일',
      password: '앱 비밀번호',
      login: '로그인',
      loggingIn: '로그인 중...',
      error: '로그인 실패',
      invalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다'
    }
  },
  
  en: {
    // Sidebar
    sidebar: {
      inbox: 'Inbox',
      sent: 'Sent',
      important: 'Important',
      starred: 'Starred',
      trash: 'Trash',
      compose: 'Compose',
      todo: 'Todo',
      chatbot: 'Chatbot AI',
      logout: 'Logout'
    },
    
    // Mail List
    mailList: {
      noEmails: 'No emails',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      summary: 'Summary',
      attachments: 'Attachments',
      objects: 'Detected Objects'
    },
    
    // Mail Detail
    mailDetail: {
      from: 'From',
      to: 'To',
      date: 'Date',
      subject: 'Subject',
      reply: 'Reply',
      replyAll: 'Reply All',
      forward: 'Forward',
      delete: 'Delete',
      aiReply: 'AI Reply',
      generateReply: 'Generate AI Reply',
      userIntent: 'What style of reply would you like?',
      generating: 'Generating...',
      cancel: 'Cancel'
    },
    
    // Compose
    compose: {
      title: 'New Mail',
      to: 'To',
      subject: 'Subject',
      body: 'Body',
      send: 'Send',
      cancel: 'Cancel',
      sending: 'Sending...',
      attachFile: 'Attach File'
    },
    
    // Settings
    settings: {
      title: 'Settings',
      general: 'General',
      notifications: 'Notifications',
      ai: 'AI Model',
      email: 'Email',
      security: 'Security',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      auto: 'Follow System',
      autoRefresh: 'Auto Refresh',
      refreshInterval: 'Refresh Interval (minutes)',
      emailsPerPage: 'Emails per page',
      autoMarkRead: 'Auto mark as read when opened',
      confirmDelete: 'Show confirmation on delete',
      save: 'Save',
      cancel: 'Cancel',
      reset: 'Reset',
      resetCurrentTab: 'Reset Current Tab'
    },
    
    // Chatbot
    chatbot: {
      title: 'Chatbot AI',
      placeholder: 'Type your message...',
      send: 'Send',
      thinking: 'Thinking...',
      error: 'An error occurred',
      retry: 'Retry'
    },
    
    // Todo
    todo: {
      title: 'Todo Management',
      addTask: 'Add Task',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      priority: 'Priority',
      dueDate: 'Due Date',
      noTasks: 'No tasks'
    },
    
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      search: 'Search',
      filter: 'Filter',
      refresh: 'Refresh',
      mailRefresh: 'Refresh Mail',
      settings: 'Settings'
    },
    
    // Login
    login: {
      title: 'MailPilot AI Login',
      email: 'Email',
      password: 'App Password',
      login: 'Login',
      loggingIn: 'Logging in...',
      error: 'Login failed',
      invalidCredentials: 'Invalid email or password'
    }
  }
};

export default translations;