# E.M.Pilot 

**로컬 NPU 기반 AI 이메일 관리 데스크탑 애플리케이션**

Tauri + React 기반의 on-device AI 이메일 클라이언트로, Gmail과 연동하여 스마트한 이메일 관리 환경을 제공합니다.

---

## 주요 특징

### AI 기반 핵심 기능
- **AI 이메일 요약**: 각 메일의 핵심 내용을 자동 요약
- **스마트 분류**: AI가 메일을 자동으로 카테고리별 분류
- **AI 자동 답장 생성**: 의도 기반 맞춤형 답장 생성
- **할일 자동 추출**: 이메일에서 회의, 마감일, 업무 자동 감지
- **대화형 AI 검색**: 자연어로 메일 검색 및 관리

### 첨부파일 고급 분석
- **문서 내용 요약**: PDF, Word, PPT, Excel 파일 자동 분석
- **이미지 OCR**: 이미지 내 텍스트 자동 추출
- **객체 인식**: YOLO 기반 이미지 내 객체 탐지
- **통합 첨부파일 관리**: 모든 첨부파일 요약 및 분류

### 사용자 경험
- **다크/라이트 테마**: 시스템 설정 연동 지원
- **다국어 지원**: 한국어/English 지원
- **상세 설정**: 글꼴, 테마, 메일 동작 등 세부 커스터마이징

---

## 기술 스택

### Frontend
- **Tauri**: 크로스 플랫폼 데스크탑 앱 프레임워크
- **React**: 모던 웹 프레임워크
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **CSS3**: 고급 애니메이션 및 그래디언트 디자인

### AI & Backend 연동
- **Qualcomm NPU**: 로컬 AI 모델 실행 
- **Hugging Face**: 현재 클라우드 AI 모델 활용
- **YOLO**: 실시간 객체 탐지
- **Tesseract OCR**: 이미지 텍스트 추출

---

## 상세 기능

### 이메일 관리

**Gmail 연동**
- 2단계 인증 안전한 연결
- 받은/보낸메일 분리 표시
- 스마트 필터링 (중요/스팸/보안경고 자동 분류)
- 실시간 새로고침 버튼
- 페이지 갯수 설정

### AI 기능

**메일 요약**
- 긴 메일의 핵심 내용 추출
- 첨부파일 내용 자동 분석
- AI 답장 생성 (맥락 인식)
- 의도 기반 답장 (사용자 의도에 맞는 스타일 적용)
- 챗봇 어시스턴트 (자연어 메일 관리)

### 할일 관리

**자동 할일 추출**
- 메일에서 회의/마감일 감지
- 우선순위별 할일 관리
- 캘린더 뷰 (월간 할일 시각화)
- 완료/삭제 관리
- 중복 정리 (중복 할일 자동 제거)

### 고급 검색

**자연어 검색**
- "김철수님 어제 메일" 형태 검색 지원
- 날짜 범위 검색 (특정 기간 메일 검색)
- 발신자별 검색 (이름/이메일 기반)
- 키워드 검색 (제목/내용 통합)
- 메일 통계 (개수/트렌드 분석)

---

## 설치 및 실행

### 사전 요구사항

1. **Node.js 18+** 설치
2. **Rust** 및 **Tauri CLI** 설치
3. **Gmail 계정 설정**:
   - 2단계 인증 활성화
   - 앱 비밀번호 생성 (https://myaccount.google.com/apppasswords)
4. **백엔드 서버** 실행 (별도 저장소)

### 설치 과정

```bash
# 1. 프로젝트 클론
git clone https://github.com/jinsunghub/copilot_project.git
cd copilot_project/mailpilot-ai-dev

# 2. 의존성 설치
npm install

# 3. Tauri 환경 설정 (최초 1회)
npm install -g @tauri-apps/cli
npm install @tauri-apps/api
```

### 개발 모드 실행

```bash
# 웹 개발 서버 (브라우저에서 테스트)
npm run dev

# Tauri 데스크탑 앱 (개발 모드)
npm run tauri dev
```

### 프로덕션 빌드

```bash
# 배포용 앱 빌드
npm run tauri build

# 빌드된 앱 위치
# Windows: src-tauri/target/release/E.M.Pilot.exe
# macOS: src-tauri/target/release/bundle/macos/E.M.Pilot.app
# Linux: src-tauri/target/release/e-m-pilot
```

---

## 사용 방법

### 초기 로그인
1. 애플리케이션 실행
2. Gmail 주소 입력
3. **Gmail 앱 비밀번호** 입력 (일반 비밀번호 아님!)
4. 로그인 완료

### 메일 관리
- **새로고침**: 우상단 새로고침 버튼으로 새 메일 가져오기
- **탭 전환**: 좌측 사이드바에서 받은메일/보낸메일/중요메일 등 선택
- **검색**: 상단 검색창에서 키워드 입력
- **상세보기**: 우측 패널에서 선택된 메일의 AI 요약본 확인

### AI 기능 활용
- **답장 생성**: 메일 상세보기에서 "AI 답장" 버튼
- **의도 설정**: 답장 생성 시 "정중하게 거절", "회의 일정 조율" 등 입력
- **챗봇 사용**: 사이드바 "챗봇 AI" 탭에서 자연어로 질문

### 할일 관리
- **자동 추출**: 사이드바 "할일 관리" 탭에서 "메일에서 할일 추출"
- **수동 추가**: "할일 추가" 버튼으로 직접 추가
- **상태 관리**: 체크박스로 완료/미완료 전환
- **뷰 전환**: 목록/캘린더 뷰 선택 가능

### 설정 커스터마이징
- **테마**: 설정 > 테마 > 라이트/다크/자동
- **글꼴**: 설정 > 쓰기 > 글꼴 종류/크기
- **서명**: 설정 > 서명 관리 > HTML/텍스트 서명 설정
- **동작**: 페이지당 메일 수, 자동 새로고침 등

---

## 설정 옵션

### 외관 설정
- **테마 모드**: 라이트/다크/시스템 따르기
- **글꼴 설정**: 종류(맑은고딕, Arial 등) 및 크기(10px~22px)
- **UI 언어**: 한국어/English

### 메일 동작
- **가져오기 개수**: Gmail에서 가져올 메일 수 (기본 5개)
- **페이지당 표시**: 한 페이지에 표시할 메일 수 (기본 50개)
- **외부 콘텐츠**: 이미지/링크 자동 로딩 설정

### 작성 설정
- **서명 관리**: HTML/텍스트 서명 설정
- **발송인 이름**: 메일 발송 시 표시될 이름
- **나를 포함**: CC/BCC에 자동 포함 설정
- **미리보기**: 발송 전 미리보기 활성화

---

## 고급 기능

### AI 챗봇 명령어

**문법 교정**
```
"안녕하세요. 제가 오늘 회의에 참석못할것 같습니다" 교정해주세요
```

**메일 검색**
```
김철수님 어제 메일 보여줘
회의 관련 메일 최신 5개
프로젝트 업데이트 검색
```

**통계 확인**
```
오늘 메일 몇 개?
이번주 받은 메일 개수
```

**설정 변경**
```
다크모드로 바꿔줘
폰트 크기를 18px로 변경해줘
```

### 첨부파일 분석
- **PDF**: 문서 요약 및 텍스트 추출
- **Word/PPT**: 내용 요약 및 키워드 추출
- **Excel**: 시트별 데이터 요약
- **이미지**: OCR 텍스트 추출 + 객체 인식

### 캘린더 연동
- 메일에서 추출된 일정을 캘린더 뷰로 시각화
- 월간/주간 뷰 지원
- 마감일별 색상 구분 (오늘/지남/여유)

---

## 주의사항

### 보안
- **Gmail 일반 비밀번호 절대 사용 금지**
- 반드시 Gmail 앱 비밀번호 생성 후 사용
- 2단계 인증 활성화 필수

### 시스템 요구사항
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **RAM**: 최소 4GB (권장 8GB)
- **저장공간**: 500MB 이상
- **네트워크**: 안정적인 인터넷 연결

### 백엔드 연동
- **포트**: 백엔드 서버가 `localhost:5001`에서 실행되어야 함
- **CORS**: 프론트엔드와 백엔드 간 CORS 설정 확인
- **세션**: 로그인 세션 관리를 위한 쿠키 지원 필요

---

## 성능 최적화

### 메모리 관리
- 메일 목록 페이지네이션으로 메모리 사용량 최적화
- 첨부파일 지연 로딩으로 초기 로딩 속도 개선
- 이미지 압축 및 캐싱 시스템

### 네트워크 최적화
- Gmail API 호출 최소화
- 배치 요청을 통한 효율적 데이터 전송
- 오프라인 캐싱 지원 (부분적)

---

## 향후 개발 계획

### v2.0 예정 기능
- 모바일 앱 (React Native)
- NAVER Mail 연동
- 음성 명령 지원
- 팀 협업 기능

### v1.5 예정 기능
- 더 많은 파일 형식 지원 (HWP, Pages 등)
- 고급 검색 필터
- 상세 메일 분석 리포트
- 커스텀 테마 제작 도구

---

## 문제 해결

### 일반적인 문제

**Q: 로그인이 안돼요**
```
A: 1. Gmail 2단계 인증 활성화 확인
   2. 앱 비밀번호 (16자리) 사용 확인
   3. 백엔드 서버 실행 상태 확인
```

**Q: AI 기능이 작동하지 않아요**
```
A: 1. 인터넷 연결 확인
   2. 백엔드 서버의 AI 모델 상태 확인
   3. Hugging Face API 토큰 설정 확인
   4. Nomic 토큰 설정 확인
```

**Q: 메일이 로딩되지 않아요**
```
A: 1. 새로고침 버튼 클릭
   2. 로그아웃 후 재로그인
   3. 백엔드 서버 재시작
```

**Q: 첨부파일 분석이 안돼요**
```
A: 1. 파일 형식 지원 여부 확인
   2. 파일 크기 제한 (10MB 이하)
   3. OCR/YOLO 서비스 상태 확인


---

## 라이선스

```
MIT License

Copyright (c) 2024 MailPilot AI Team
| 이름   | 이메일                     | 퀄컴ID                     |
|--------|----------------------------|----------------------------|
| 최수운 | csw21c915@gmail.com        | csw21c915@gmail.com        |
| 강인태 | rkddlsxo12345@naver.com    | rkddlsxo12345@naver.com    |
| 김관영 | kwandol02@naver.com        | kwandol02@naver.com        |
| 김진성 | jinsung030405@gmail.com    | jinsung030405@gmail.com    |
| 이상민 | haleeho2@naver.com         | haleeho2@naver.com         |

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

---

기타 오픈소스 라이선스
이 프로젝트는 다음 오픈소스 라이브러리들을 사용합니다:

Frontend

Tauri: MIT License
Bootstrap: MIT License
Font Awesome: Font Awesome Free License
Backend

자세한 백엔드 라이선스 정보는 백엔드 저장소를 참조하세요:

각 라이브러리의 전체 라이선스 텍스트는 해당 프로젝트의 공식 저장소에서 확인할 수 있습니다.
