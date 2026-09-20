<div align="center">

# 🚀 ClubOps AI
### *The Intelligent Autonomous Operating System for Campus Clubs, Student Organizations & Hackathons*

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

<p align="center">
  <strong>ClubOps AI</strong> is a modern, full-stack, AI-powered club operations platform designed to eliminate organizational chaos. From automated meeting minutes parsing and task extraction to real-time risk radar monitoring and contextual AI document Q&A, ClubOps AI transforms how student leaders manage events, volunteers, announcements, and compliance.
</p>

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Module Walkthrough](#-module-walkthrough) • [Tech Stack](#-tech-stack) • [Quickstart Guide](#-quickstart-guide) • [API Reference](#-api-reference)

---

</div>

## 🌟 Why ClubOps AI?

Campus clubs and hackathon organizing teams run on fragmented tools: WhatsApp group chats for decisions, Google Drive folders full of unread PDFs, chaotic spreadsheets for volunteer assignments, and forgotten deadlines. 

**ClubOps AI brings everything into a unified, intelligent workspace:**
1. **Never lose a decision**: Paste raw transcripts or WhatsApp meeting exports and let Gemini extract tasks, owners, and deadlines directly into MongoDB.
2. **Proactive risk prevention**: Automated early-warning algorithms detect scheduling conflicts, safety issues, and missing operational requirements before they cause delays.
3. **Chat with your documents**: Upload PDFs or paste guidelines and ask questions directly to get answers with grounded citations.
4. **Natural language operations**: Speak or type actions like *"Assign Alex to stage lighting with high priority and announce tickets live"* and watch the AI execute database operations instantly.

---

## ✨ Key Features

### 🧠 1. Supercharged AI Engine (Powered by Google Gemini)
- **Natural Language Action Copilot**: Multi-intent conversational executor that creates tasks, schedules meetings, updates events, and assigns roles in a single command.
- **Deep Document Parser & Q&A**: Ingests PDF, DOCX, and TXT files, extracts key takeaways, creates tasks and risks, and powers interactive conversational chat over document content.
- **Global AI Search (RAG-Lite / Cmd+K)**: Instant fuzzy and semantic search across clubs, tasks, risks, and volunteers with AI-generated summary answers.
- **AI Broadcast Generator**: Auto-generates high-converting announcement copy tailored for Discord, WhatsApp, Email, or Slack with configurable tone settings.

### 📋 2. Comprehensive Club Operations
- **Kanban Task Engine**: Drag-and-drop workflow tracking with status lanes (`Todo`, `In Progress`, `Review`, `Done`), priorities (`Low`, `Medium`, `High`, `Critical`), deadlines, and member assignments.
- **4-Column Risk Radar**: Real-time risk detection grid (`Critical`, `High`, `Medium`, `Low`) with severity scoring and mitigation guidance.
- **Meeting Intelligence Workbench**: 3-column interactive layout for transcripts, extracted action items, and live AI automation assistance.
- **Multi-Channel Announcements**: Rich editor with channel targeting, live broadcast previews, publish scheduling, and MongoDB persistence.
- **Volunteer Roster & Skill Tracking**: Manage member profiles, club allocations, workload metrics, and availability.
- **Multi-Club Workspace**: Seamlessly switch between multiple campus clubs with scoped data isolation and club-level RBAC.

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Client (React/Vite)    │
                                  │  • Dark Theme UI (Tailwind) │
                                  │  • Role-Based Views & State │
                                  │  • Cmd+K Global AI Search   │
                                  └──────────────┬──────────────┘
                                                 │ REST API (JWT Auth)
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │   Express & Node.js Server  │
                                  │  • Route Controllers & RBAC │
                                  │  • Upload Multi-part Multer │
                                  │  • Meeting/Doc Processors   │
                                  └───────┬─────────────┬───────┘
                                          │             │
                    ┌─────────────────────┘             └─────────────────────┐
                    ▼                                                         ▼
       ┌─────────────────────────┐                               ┌─────────────────────────┐
       │   MongoDB Atlas / Local │                               │    Google Gemini API    │
       │  • Users & RBAC Roles   │                               │  • gemini-1.5-flash     │
       │  • Clubs & Events       │                               │  • Structured Outputs   │
       │  • Tasks & Risks        │                               │  • Semantic Q&A / RAG   │
       │  • Documents & Meetings │                               │  • Risk Scanning Engine │
       └─────────────────────────┘                               └─────────────────────────┘
```

---

## 🧭 Module Walkthrough

### 📁 Document Center & Q&A
- **Multi-Format Ingestion**: Upload PDF, Word (.docx), or plain text files, or switch to **"Paste Text"** mode for direct note ingestion.
- **Category Filter Folders**: Automatic organization into `PDF`, `DOCX`, `TXT` folders with live count badges.
- **5-Tab Document Inspector**:
  - `Summary & Key Points`: Executive bullet points and key decisions.
  - `Extracted Tasks`: Generated action items with assignees and priorities.
  - `Identified Risks`: Proactive compliance and safety flags.
  - `Interactive Q&A Chat`: Grounded AI question answering over the document.
  - `Raw Text Preview`: Complete readable text with quick copy-to-clipboard.

### ⚠️ Risk Radar & Threat Detection
- **4-Column Priority Matrix**: Visual separation of `Critical`, `High`, `Medium`, and `Low` risks.
- **Automated AI Risk Scan**: Scans active club events, deadlines, and documents for operational bottlenecks and unassigned dependencies.
- **Early Warning Banner**: Real-time status indicator showing threat detection health.

### 🗣️ Meetings & AI Copilot
- **Transcript Parsing**: Paste raw meeting notes or upload exports to automatically extract actionable deliverables.
- **One-Click Task Sync**: Sync extracted tasks directly to the Kanban board with `clubId` and `eventId` tags.
- **Meeting History Archive**: Search and inspect past meeting transcripts and summaries.

### 📢 Broadcast & Announcement Hub
- **Channel Optimization**: Format announcements for Discord, Slack, WhatsApp, and Email.
- **Real-Time Live Preview**: Instant visual preview before broadcasting to the club.
- **AI Copywriter**: Generate announcements from brief bullet points with custom tone selection.

---

## 🔒 Role-Based Access Control (RBAC)

ClubOps AI enforces strict role permissions across the stack:

| Action / Capability | Club Head / Admin | Event Manager | Volunteer / Member |
|:-------------------|:-----------------:|:-------------:|:------------------:|
| View Dashboard, Tasks & Events | ✅ | ✅ | ✅ |
| AI Document Q&A & Search | ✅ | ✅ | ✅ |
| Update Assigned Task Status | ✅ | ✅ | ✅ |
| Create / Edit / Delete Tasks | ✅ | ✅ | ❌ *(Read-only)* |
| Upload Documents & Trigger Scans | ✅ | ✅ | ❌ *(Read-only)* |
| Schedule Meetings & Events | ✅ | ✅ | ❌ *(Read-only)* |
| Post Announcements & Broadcasts | ✅ | ✅ | ❌ *(Read-only)* |
| Manage Club Settings & Volunteers | ✅ | ❌ | ❌ |

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 (Vite SPA)
- **Routing**: React Router v7
- **Styling**: Tailwind CSS, CSS Custom Properties (Dark Slate Palette)
- **Icons**: Lucide React
- **Build Tool**: Vite 5

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express 5 (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **AI Service**: Google GenAI SDK (`@google/genai` with `gemini-1.5-flash`)
- **Authentication**: JWT (JSON Web Tokens) & Passport.js (Google OAuth 2.0)
- **File Parsing**: `multer`, `pdf-parse`

---

## 🛠️ Quickstart Guide

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI
- **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Naman-Shukla01/ClubOps-AI-.git
cd ClubOps-AI-
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clubops-ai
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
CLIENT_URL=http://localhost:5173

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

Seed initial development data (optional):
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🌐 Production Deployment Guide

### Deploy Backend (Render / Railway)
1. **Root Directory**: `backend`
2. **Build Command**: `npm install`
3. **Start Command**: `node server.js`
4. **Environment Variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-1.5-flash`
   - `CLIENT_URL=https://your-frontend-domain.vercel.app`

### Deploy Frontend (Vercel / Netlify / Render Static)
1. **Root Directory**: `client`
2. **Build Command**: `npm run build`
3. **Publish Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL=https://your-backend-domain.onrender.com/api`

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Authenticate & retrieve JWT token | Public |
| `GET` | `/api/clubs` | List user clubs & member counts | Authenticated |
| `GET` | `/api/events` | List events with club filter | Authenticated |
| `POST` | `/api/events` | Create new club event | Club Head / Admin |
| `GET` | `/api/tasks` | Get tasks for Kanban board | Authenticated |
| `POST` | `/api/tasks` | Create task with priority & deadline | Club Head / Admin |
| `PATCH` | `/api/tasks/:id` | Update task status or assignee | Authenticated |
| `GET` | `/api/documents` | List documents for club/event | Authenticated |
| `POST` | `/api/documents` | Upload and parse document with AI | Club Head / Admin |
| `POST` | `/api/documents/:id/ask` | Interactive Q&A over document | Authenticated |
| `POST` | `/api/documents/:id/summarize` | Generate on-demand AI summary | Authenticated |
| `GET` | `/api/risks` | List detected risks for club | Authenticated |
| `POST` | `/api/ai/risk-scan` | Run automated AI risk scan | Club Head / Admin |
| `GET` | `/api/meetings` | Get past meetings & summaries | Authenticated |
| `POST` | `/api/meetings/process` | Parse transcript & extract tasks | Club Head / Admin |
| `POST` | `/api/ai/chat` | Conversational action executor | Authenticated |
| `POST` | `/api/ai/search` | Global semantic AI search (Cmd+K) | Authenticated |
| `POST` | `/api/ai/announcement` | Generate AI broadcast copy | Club Head / Admin |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <p>Built with ❤️ by the ClubOps AI Team to make student leadership seamless and intelligent.</p>
</div>
