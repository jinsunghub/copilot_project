# MailPilot AI

**AI-powered Email Management Desktop App (Electron-based)**

> Local PC NPU-powered, open-source on-device conversational AI email client

---

## Application Description

MailPilot AI is a smart email management desktop application that integrates with Gmail accounts to automatically classify and summarize emails, generate AI-based replies, and provides features that email users haven't been able to utilize before or adds convenience to their usage through a conversational interface. It's a desktop app developed using React and Flask frameworks with Electron, utilizing local PC NPU to run AI models, minimizing cloud dependency.

### Key Features Using AI Models

| Feature                          | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| Spam/Important/Sent/To Me/Filter | Automatically categorize emails by tabs           |
| Email Summary View               | Preview email content summaries in the list       |
| Sender Search Function           | Filter emails by sender                            |
| To-do Display                   | Automatically organize and provide user's key schedules |
| Desktop App                      | Standalone app built with Electron                |
| AI Reply Generation              | Generate automatic replies to received emails     |
| Conversational Interface         | Grammar correction, calendar creation, search features |

---

## Team Members

| Name      | Email                       | Qualcomm ID                |
|-----------|-----------------------------|-----------------------------|
| Choi Sooun| csw21c915@gmail.com        | csw21c915@gmail.com        |
| Kang Intae| rkddlsxo12345@naver.com    | rkddlsxo12345@naver.com    |
| Kim Kwanyoung| kwandol02@naver.com     | kwandol02@naver.com        |
| Kim Jinsung| jinsung030405@gmail.com   | jinsung030405@gmail.com    |
| Lee Sangmin| haleeho2@naver.com        | haleeho2@naver.com         |

---

## Technology Stack

### Backend (Python Flask API)
- **Flask**: RESTful API server
- **Transformers**: Hugging Face models (BART, Qwen)
- **Nomic**: Embedding and classification
- **scikit-learn**: Cosine similarity calculation
- **imaplib/smtplib**: Gmail integration

### Frontend (Electron Desktop App)
- **Electron**: Cross-platform desktop app framework
- **HTML/CSS/JavaScript**: Web-based UI

---

## Application Installation Guide

### 0. Gmail Account Setup
- Gmail account
- **2-step verification activation** required
- **App password** generation (create at [Google Account Settings](https://myaccount.google.com/apppasswords))
- **Save the app password separately**

### 1. Backend API Server Setup
For backend installation and execution instructions, check the following repository:

**🔗 [MailPilot Backend Repository](https://github.com/rkddlsxo/MailPilot_back.git)**

### 2-1. Web Environment Installation

**1. Clone Project**
```bash
git clone https://github.com/jinsunghub/copilot_project.git
cd copilot_project
cd mailpilot-ai-dev
```

**2. Install Dependencies**
```bash
npm install
```

**3. Run Development Server**
```bash
npm run dev
```

**4. Run REACT Web**
```bash
npm start
```

### 2-2. App Environment Installation (Not yet organized)

**1. Clone Project**
```bash
git clone https://github.com/jinsunghub/copilot_project.git
cd copilot_project
cd mailpilot-ai-dev
```

**2. Install Dependencies**
```bash
npm install
```

**3. Install Tauri**
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

**4. Run Tauri and Change Files**
```bash
tauri dev
```
Change com.tauri.dev to com.yourname.desktop in src-tauri/tauri.conf.json file

**5. Tauri File Configuration**
```bash
tauri build
```
Run with administrator privileges, app is located at `C:\copilotAI\copilot_project\mailpilot-ai-dev\src-tauri\target\release`

---

## Execution/Usage Instructions

### Login
1. Enter Gmail address in the desktop app
2. Enter Gmail app password (not your regular password!)
3. Click login button

### Email Management
- Use **Refresh** button to fetch recent emails
- Check automatically categorized emails by tabs (Spam/Important/Sent, etc.)
- View auto-generated summaries in email list
- Use conversational interface for desired features

### AI Feature Utilization
- **Reply Generation**: Select email and click "AI Reply" button
- **Summary and Classification**: Automatically provides email summary and classification content
- **Chatbot**: Grammar correction, email search, etc.

---

## ⚠️ Important Notes

### Security
- **Never use your regular Gmail password**
- Must create and use an app password
- Gmail 2-step verification must be enabled

### System Requirements
- Backend API server must be running first
- Internet connection required (for Gmail access and AI model usage)

---

## License

### MIT License

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

### Other Open Source Licenses

This project uses the following open source libraries:

**Frontend Dependencies**
- **Electron**: MIT License
- **Bootstrap**: MIT License
- **Font Awesome**: Font Awesome Free License

**Backend Dependencies (API Server)**

For detailed backend dependencies and license information, refer to the [backend repository](https://github.com/rkddlsxo/MailPilot_back.git):
- **Flask**: BSD License
- **Transformers (Hugging Face)**: Apache License 2.0
- **PyTorch**: BSD License
- **scikit-learn**: BSD License
- **Nomic**: Proprietary License (API service)

Full license text for each library can be found in their respective official repositories.
