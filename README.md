📄 If you need the Korean version of this README, please see **README_KOR.md**.

# E.M.Pilot

**AI Email Management Desktop App**

> An open-source on-device conversational AI email client desktop application that leverages your local PC's NPU

---

## Application Description

MailPilot AI is an AI email management application that integrates with Gmail accounts to automatically classify and summarize emails, generate AI-based auto-replies, and other features. It adds convenience to email usage by providing functions that email users have not been able to utilize before, offering these features through a conversational interface.

This desktop app was developed using React and Flask frameworks with Tauri, running AI models on Qualcomm Copilot+ PC NPUs to minimize dependency on existing cloud-based environments.

### Key Features Using AI Models

| Feature | Description |
| ------- | ----------- |
| Spam/Important/Sent/Self-sent/Filtered | Automatically classify and view emails by tabs |
| Email Summary View | Preview email content summaries in the list view |
| Sender Search Function | Filter emails by sender |
| To-Do (Task Management) Display | Automatically organize and provide user's key schedules |
| Attachment Summary Function | Automatically summarize attached images and document content |
| AI Auto-Reply Generation | Generate automatic replies for received emails |
| Conversational Interface | Grammar correction, calendar content addition, search functions, and other email management features |

---

## Team Members

| Name | Email | Qualcomm ID |
|------|-------|-------------|
| 최수운 | csw21c915@gmail.com | csw21c915@gmail.com |
| 강인태 | rkddlsxo12345@naver.com | rkddlsxo12345@naver.com |
| 김관영 | kwandol02@naver.com | kwandol02@naver.com |
| 김진성 | jinsung030405@gmail.com | jinsung030405@gmail.com |
| 이상민 | haleeho2@naver.com | haleeho2@naver.com |

---

## Tech Stack

### Frontend (Tauri Desktop App)
- **Tauri**: Cross-platform desktop app framework
- **React**: Web framework
- **HTML/CSS/JavaScript**: Web-based UI design languages

---

## Application Installation and Execution Guide

### 0. Gmail Account Setup
- Gmail account
- **2-step verification activation** required
- **App password** creation (create at [Google Account Settings](https://myaccount.google.com/apppasswords))
- **Store the app password separately**

### 1. Backend API Server Installation and Execution
For backend installation and execution instructions, please check the following repository:

**[MailPilot Backend Repository](https://github.com/rkddlsxo/MailPilot_back.git)**

### 2. Web Environment Installation and Execution (Web Usage)

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

**4. Start React Web**
```bash
npm start
```

### 3. App Creation and Execution (App Usage)

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

**4. Run Tauri and Change App Location**
Process for app creation, unnecessary after app is created
```bash
tauri dev
```
Change com.tauri.dev to com.yourname.desktop in src-tauri/tauri.conf.json file

**5. Tauri File Settings**
After changing web-based files, you can rebuild and use
```bash
tauri build
```
Administrator privileges recommended. The app is located at `C:\copilotAI\copilot_project\mailpilot-ai-dev\src-tauri\target\release`.

---

## Execution/Usage Guide

### Login
1. Enter Gmail address in the desktop app
2. Enter Gmail app password (not regular password!)
3. Click login button

### Email Management
- Fetch recent emails with the 'Refresh' button
- Check emails classified by tabs and task management (Spam/Important/Sent, etc.)
- Check summary content in the email list
- Use various functions through conversational interface

### AI Feature Usage
- **Reply Generation**: Select email and click "AI Reply" button
- **Summary and Classification**: Automatically provide email content and attachment summaries, email keyword classification content
- **Chatbot**: Grammar correction, email search, task addition, search, and various other features for email users

---

## ⚠️ Important Notes

### Security
- **Never use your regular Gmail password**
- Must use app password
- Gmail 2-step verification must be activated

### System Requirements
- Backend API server must be running first
- Internet connection required (for Gmail access and AI model usage)

### Token Issuance Required
- Currently requires tokens from Hugging Face due to lack of Qualcomm devices, as specified in app.py
- Need to obtain tokens from Nomic and Hugging Face and modify accordingly
- Future plans to use Qualcomm AI hub to download models for local use

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

**Frontend**

- **Tauri**: MIT License
- **Bootstrap**: MIT License
- **Font Awesome**: Font Awesome Free License

**Backend**

For detailed backend license information, please refer to the [Backend Repository](https://github.com/rkddlsxo/MailPilot_back.git).

The complete license text for each library can be found in the official repositories of each project.