# E.M.Pilot

**AI 기반 이메일 관리 데스크탑 앱 (Tauri 기반)**

> 로컬 PC NPU를 활용한, 오픈소스 on-device 대화형 AI 이메일 클라이언트

---

## 응용 프로그램에 대한 설명

E.M.Pilot는 Gmail 계정과 연동하여 이메일을 자동으로 분류, 요약하고 AI 기반 답장을 생성하고, 이메일 사용자들이 지금까지 활용하지 못했던 기능이나, 활용에 편의를 더할 기능을 대화형 인터페이스를 활용하여 제공해주는 스마트 이메일 관리 데스크탑 애플리케이션입니다. React, Flask 프레임워크를 기반으로 Tauri을 활용하여 개발한 데스크탑 앱으로, 로컬 PC의 NPU를 활용하여 AI 모델을 실행하여 클라우드 의존성을 최소화했습니다.

### AI 모델을 활용한 주요 기능

| 기능                         | 설명                                      |
| ---------------------------- | ----------------------------------------- |
| 스팸/중요/보낸/내게쓴/필터링  | 탭 별로 메일을 자동 분류하여 확인 가능    |
| 메일 요약 보기               | 리스트에서 메일 내용을 요약으로 미리 확인 |
| 보낸 사람 검색 기능          | 보낸 사람 기준 해당 메일 필터링           |
| To-do 표시                  | 사용자의 주요 일정을 자동으로 정리하여 제공 |
| 데스크탑 앱                  | Tauri 기반의 독립 실행형 앱 구성       |
| AI 답장 생성                 | 수신된 이메일에 대한 자동 답장 생성       |
| 대화형 인퍼페이스            | 문법 교정, 캘린더 생성, 검색 기능 요청  |

---

## 팀 구성원

| 이름   | 이메일                     | 퀄컴ID                     |
|--------|----------------------------|----------------------------|
| 최수운 | csw21c915@gmail.com        | csw21c915@gmail.com        |
| 강인태 | rkddlsxo12345@naver.com    | rkddlsxo12345@naver.com    |
| 김관영 | kwandol02@naver.com        | kwandol02@naver.com        |
| 김진성 | jinsung030405@gmail.com    | jinsung030405@gmail.com    |
| 이상민 | haleeho2@naver.com         | haleeho2@naver.com         |

---

## 기술 스택

### Backend (Python Flask API)
- **Flask**: RESTful API 서버
- **Transformers**: Hugging Face 모델 (BART, Qwen)
- **Nomic**: 임베딩 및 분류
- **scikit-learn**: 코사인 유사도 계산
- **imaplib/smtplib**: Gmail 연동

### Frontend (Tauri Desktop App)
- **Tauri**: 크로스 플랫폼 데스크탑 앱 프레임워크
- **HTML/CSS/JavaScript**: 웹 기반 UI

---

## 응용 프로그램 설치 방법

### 0. Gmail 계정 설정
- Gmail 계정
- **2단계 인증 활성화** 필수
- **앱 비밀번호** 생성 ([Google 계정 설정](https://myaccount.google.com/apppasswords)에서 생성)
- **앱 비밀번호는 따로 저장해두기**

### 1. 백엔드 API 서버 설정
백엔드 설치 및 실행 방법은 다음 저장소에서 확인하세요:

**🔗 [MailPilot 백엔드 저장소](https://github.com/rkddlsxo/MailPilot_back.git)**

### 2-1. 웹 환경 설치

**1. 프로젝트 클론**
```bash
git clone https://github.com/jinsunghub/copilot_project.git
cd copilot_project
cd mailpilot-ai-dev
```

**2. 의존성 설치**
```bash
npm install
```

**3. 개발 서버 실행**
```bash
npm run dev
```

**4. REACT 웹 실행**
```bash
npm start
```

### 2-2. 앱 환경 설치(아직 정리 안함)

**1. 프로젝트 클론**
```bash
git clone https://github.com/jinsunghub/copilot_project.git
cd copilot_project
cd mailpilot-ai-dev
```

**2. 의존성 설치**
```bash
npm install
```

**3. Tauri 설치**
```bash
rustup-init.exe
npm install -g @tauri-apps/cli
npm install @tauri-apps/api
tauri init
```
- App name: E.M.PILOT
- Window title: E.M.PILOT
- Web assets location: ../dist
- Dev server URL: http://localhost:5173
- Frontend run command: npm run dev
- Frontend build command: npm run build

**4. Tauri 실행 및 파일 변경**
```bash
tauri dev
```
src-tauri/tauri.conf.json 파일에서 com.tauri.dev를 com.yourname.desktop로 변경

**5. Tauri 파일 설정**
```bash
관리자 권한 실행
tauri build
```
앱은 `C:\copilotAI\copilot_project\mailpilot-ai-dev\src-tauri\target\release`에 있음

---

## 실행/사용 방법

### 로그인
1. 데스크탑 앱에서 Gmail 주소 입력
2. Gmail 앱 비밀번호 입력 (일반 비밀번호 아님!)
3. 로그인 버튼 클릭

### 이메일 관리
- **새로고침** 버튼으로 최근 이메일 가져오기
- 탭별로 자동 분류된 이메일 확인 (스팸/중요/보낸함 등)
- 이메일 리스트에서 자동 생성된 요약 확인
- 대화형 인터페이스를 활용하여 원하는 기능 사용 가능

### AI 기능 활용
- **답장 생성**: 이메일 선택 후 "AI 답장" 버튼
- **요약 및 분류**: 자동으로 이메일 요약 및 분류 내용 제공
- **챗봇**: 맞춤법 교정, 메일 찾기 등

---

## ⚠️ 주의사항

### 보안
- **절대 일반 Gmail 비밀번호를 사용하지 마세요**
- 반드시 앱 비밀번호를 생성하여 사용
- Gmail 2단계 인증이 활성화되어 있어야 함

### 시스템 요구사항
- 백엔드 API 서버가 먼저 실행되어 있어야 함
- 인터넷 연결 필수 (Gmail 접속 및 AI 모델 사용)

---

## 라이선스

### MIT 라이선스

```
MIT License

Copyright (c) 2024 MailPilot AI Team

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
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 기타 오픈소스 라이선스

이 프로젝트는 다음 오픈소스 라이브러리들을 사용합니다:

**Frontend Dependencies**
- **Electron**: MIT License
- **Bootstrap**: MIT License
- **Font Awesome**: Font Awesome Free License

**Backend Dependencies (API 서버)**

자세한 백엔드 의존성 및 라이선스 정보는 [백엔드 저장소](https://github.com/rkddlsxo/MailPilot_back.git)를 참조하세요:
- **Flask**: BSD License
- **Transformers (Hugging Face)**: Apache License 2.0
- **PyTorch**: BSD License
- **scikit-learn**: BSD License
- **Nomic**: Proprietary License (API 서비스)

각 라이브러리의 전체 라이선스 텍스트는 해당 프로젝트의 공식 저장소에서 확인할 수 있습니다.
