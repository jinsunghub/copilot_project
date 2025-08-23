# E.M.Pilot 

**Local NPU-based AI Email Management Desktop Application**

A Tauri + React based on-device AI email client that provides smart email management environment by integrating with Gmail.

---

## Key Features

### AI-Powered Core Functions
- **AI Email Summarization**: Automatically summarizes key content of each email
- **Smart Classification**: AI automatically categorizes emails by category
- **AI Auto Reply Generation**: Intent-based customized reply generation
- **Automatic Task Extraction**: Automatically detects meetings, deadlines, and tasks from emails
- **Conversational AI Search**: Natural language email search and management

### Advanced Attachment Analysis
- **Document Content Summarization**: Automatic analysis of PDF, Word, PPT, Excel files
- **Image OCR**: Automatic text extraction from images
- **Object Recognition**: YOLO-based object detection in images
- **Integrated Attachment Management**: Summary and classification of all attachments

### User Experience
- **Dark/Light Theme**: System settings integration support
- **Multi-language Support**: Korean/English support
- **Detailed Settings**: Fine customization of fonts, themes, email behavior, etc.

---

## Technology Stack

### Frontend
- **Tauri**: Cross-platform desktop app framework
- **React**: Modern web framework
- **Vite**: Fast development server and build tool
- **CSS3**: Advanced animations and gradient design

### AI & Backend Integration
- **Qualcomm NPU**: Local AI model execution 
- **Hugging Face**: Current cloud AI model utilization
- **YOLO**: Real-time object detection
- **Tesseract OCR**: Image text extraction

---

## Detailed Features

### Email Management

**Gmail Integration**
- Two-factor authentication secure connection
- Separate display of inbox/sent emails
- Smart filtering (automatic classification of important/spam/security alerts)
- Real-time refresh button
- Page count configuration

### AI Functions

**Email Summarization**
- Extract key content from long emails
- Automatic analysis of attachment content
- AI reply generation (context awareness)
- Intent-based replies (style adapted to user intent)
- Chatbot assistant (natural language email management)

### Task Management

**Automatic Task Extraction**
- Detection of meetings/deadlines from emails
- Priority-based task management
- Calendar view (monthly task visualization)
- Completion/deletion management
- Duplicate cleanup (automatic removal of duplicate tasks)

### Advanced Search

**Natural Language Search**
- Support for searches like "Mr. Kim's email from yesterday"
- Date range search (specific period email search)
- Sender-based search (name/email based)
- Keyword search (subject/content integrated)
- Email statistics (count/trend analysis)

---

## Installation and Execution

### Prerequisites

1. **Node.js 18+** installation
2. **Rust** and **Tauri CLI** installation
3. **Gmail Account Setup**:
   - Enable two-factor authentication
   - Generate app password (https://myaccount.google.com/apppasswords)
4. **Backend Server** execution (separate repository)

### Installation Process

```bash
# 1. Clone project
git clone https://github.com/jinsunghub/copilot_project.git
cd copilot_project/mailpilot-ai-dev

# 2. Install dependencies
npm install

# 3. Tauri environment setup (first time only)
npm install -g @tauri-apps/cli
npm install @tauri-apps/api
```

### Development Mode Execution

```bash
# Web development server (test in browser)
npm run dev

# Tauri desktop app (development mode)
npm run tauri dev
```

### Production Build

```bash
# Build deployment app
npm run tauri build

# Built app location
# Windows: src-tauri/target/release/E.M.Pilot.exe
# macOS: src-tauri/target/release/bundle/macos/E.M.Pilot.app
# Linux: src-tauri/target/release/e-m-pilot
```

---

## Usage Guide

### Initial Login
1. Launch application
2. Enter Gmail address
3. Enter **Gmail app password** (not regular password!)
4. Complete login

### Email Management
- **Refresh**: Get new emails with refresh button in top right
- **Tab Switching**: Select inbox/sent/important emails from left sidebar
- **Search**: Enter keywords in top search bar
- **Detail View**: Check AI summary of selected email in right panel

### AI Feature Utilization
- **Reply Generation**: "AI Reply" button in email detail view
- **Intent Setting**: Enter "politely decline", "schedule meeting" etc. when generating reply
- **Chatbot Usage**: Ask questions in natural language in "Chatbot AI" tab in sidebar

### Task Management
- **Auto Extraction**: "Extract tasks from emails" in "Task Management" tab in sidebar
- **Manual Addition**: Add directly with "Add Task" button
- **Status Management**: Toggle complete/incomplete with checkboxes
- **View Switching**: Choose between list/calendar view

### Settings Customization
- **Theme**: Settings > Theme > Light/Dark/Auto
- **Font**: Settings > Writing > Font type/size
- **Signature**: Settings > Signature Management > HTML/Text signature setup
- **Behavior**: Emails per page, auto refresh, etc.

---

## Settings Options

### Appearance Settings
- **Theme Mode**: Light/Dark/Follow System
- **Font Settings**: Type (Malgun Gothic, Arial, etc.) and size (10px~22px)
- **UI Language**: Korean/English

### Email Behavior
- **Import Count**: Number of emails to fetch from Gmail (default 5)
- **Display Per Page**: Number of emails to show per page (default 50)
- **External Content**: Auto-loading settings for images/links

### Composition Settings
- **Signature Management**: HTML/Text signature setup
- **Sender Name**: Name to display when sending emails
- **Include Me**: Auto-include in CC/BCC settings
- **Preview**: Enable preview before sending

---

## Advanced Features

### AI Chatbot Commands

**Grammar Correction**
```
Please correct "Hello. I think I can't attend the meeting today"
```

**Email Search**
```
Show me Mr. Kim's emails from yesterday
Latest 5 emails about meetings
Search for project updates
```

**Statistics Check**
```
How many emails today?
Number of emails received this week
```

**Settings Change**
```
Switch to dark mode
Change font size to 18px
```

### Attachment Analysis
- **PDF**: Document summary and text extraction
- **Word/PPT**: Content summary and keyword extraction
- **Excel**: Sheet-wise data summary
- **Images**: OCR text extraction + object recognition

### Calendar Integration
- Visualize schedules extracted from emails in calendar view
- Monthly/weekly view support
- Color coding by deadline (today/overdue/upcoming)

---

## Important Notes

### Security
- **Absolutely prohibit using regular Gmail password**
- Must generate and use Gmail app password
- Two-factor authentication activation required

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB (recommended 8GB)
- **Storage**: 500MB or more
- **Network**: Stable internet connection

### Backend Integration
- **Port**: Backend server must run on `localhost:5001`
- **CORS**: Confirm CORS settings between frontend and backend
- **Session**: Cookie support required for login session management

---

## Performance Optimization

### Memory Management
- Optimize memory usage with email list pagination
- Improve initial loading speed with lazy loading of attachments
- Image compression and caching system

### Network Optimization
- Minimize Gmail API calls
- Efficient data transfer through batch requests
- Partial offline caching support

---

## Future Development Plans

### v2.0 Planned Features
- Mobile app (React Native)
- NAVER Mail integration
- Voice command support
- Team collaboration features

### v1.5 Planned Features
- Support for more file formats (HWP, Pages, etc.)
- Advanced search filters
- Detailed email analysis reports
- Custom theme creation tools

---

## Troubleshooting

### Common Issues

**Q: Can't log in**
```
A: 1. Confirm Gmail two-factor authentication activation
   2. Confirm use of app password (16 digits)
   3. Check backend server execution status
```

**Q: AI features not working**
```
A: 1. Check internet connection
   2. Check AI model status on backend server
   3. Confirm Hugging Face API token settings
   4. Confirm Nomic token settings
```

**Q: Emails not loading**
```
A: 1. Click refresh button
   2. Logout and re-login
   3. Restart backend server
```

**Q: Attachment analysis not working**
```
A: 1. Check file format support
   2. File size limit (under 10MB)
   3. Check OCR/YOLO service status
```

## License

```
MIT License

Copyright (c) 2024 MailPilot AI Team
| Name          | Email                      | Qualcomm ID                |
|---------------|----------------------------|----------------------------|
| Choi Suwoon   | csw21c915@gmail.com        | csw21c915@gmail.com        |
| Kang Intae    | rkddlsxo12345@naver.com    | rkddlsxo12345@naver.com    |
| Kim Gwanyoung | kwandol02@naver.com        | kwandol02@naver.com        |
| Kim Jinsung   | jinsung030405@gmail.com    | jinsung030405@gmail.com    |
| Lee Sangmin   | haleeho2@naver.com         | haleeho2@naver.com         |

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

## Other Open Source Licenses
This project uses the following open source libraries:

**Frontend**
- Tauri: MIT License
- Bootstrap: MIT License
- Font Awesome: Font Awesome Free License

**Backend**
For detailed backend license information, please refer to the backend repository.

The full license text for each library can be found in the official repository of each project.
