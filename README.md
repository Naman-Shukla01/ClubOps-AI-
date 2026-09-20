<div align="center">
  <img src="https://raw.githubusercontent.com/Naman-Shukla01/ClubOps-AI-/main/client/src/assets/logo.jpeg" alt="ClubOps AI Logo" width="150" height="150" style="border-radius: 50%;"/>
  <h1>🚀 ClubOps AI</h1>
  <p><strong>The Intelligent Copilot for College Clubs and Events</strong></p>
  <p>
    An all-in-one, AI-powered platform to manage events, automate tasks, analyze documents, and proactively mitigate logistical risks.
  </p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/-React-45b8d8?style=flat-square&logo=react&logoColor=white" />
    <img alt="Nodejs" src="https://img.shields.io/badge/-Nodejs-43853d?style=flat-square&logo=Node.js&logoColor=white" />
    <img alt="MongoDB" src="https://img.shields.io/badge/-MongoDB-13aa52?style=flat-square&logo=mongodb&logoColor=white" />
    <img alt="TailwindCSS" src="https://img.shields.io/badge/-TailwindCSS-38b2ac?style=flat-square&logo=tailwind-css&logoColor=white" />
    <img alt="Gemini" src="https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white" />
  </p>
</div>

---

## 🏆 Built for BIT N BUILD 2026 (Gujarat Round)
We're incredibly proud to present **ClubOps AI**, developed by **Team Vortex** (led by Shukla Naman) representing **L.D. College of Engineering, Ahmedabad** for Problem Statement **PS-3**. 

---

## 🛑 The Chaos of Club Management
If you've ever run a college club or organized a hackathon, you know the struggle. You're juggling a chaotic mix of WhatsApp groups for announcements, Google Sheets for volunteer rosters, scattered PDFs for event permits, and endless meetings just to figure out who is doing what. As your club scales, this fragmented approach leads to miscommunication, dropped responsibilities, and overwhelming stress for student leaders.

## 💡 Enter ClubOps AI
We built **ClubOps AI** to bring order to the chaos. It isn't just another task manager; it's a **centralized, AI-native club operations platform**. By bringing your entire club's workflow—tasks, events, volunteers, documents, and announcements—under one roof, ClubOps AI gives you unparalleled visibility and control. But we didn't stop there. We integrated deep AI capabilities that actively assist you, parse your documents, and predict risks before they become disasters.

---

## ✨ What Makes ClubOps AI Special?

### 🧠 Your AI Co-Founder (Powered by Gemini)
We've woven Google's Gemini AI directly into the fabric of the application to automate the heavy lifting:
- **Conversational Action Copilot**: Don't waste time clicking through menus. Just tell the Copilot, *"Create a high-priority task to finalize the catering contract and assign it to Sarah,"* and watch it execute multiple database operations instantly.
- **Deep Document Intelligence**: Upload a 10-page event guideline PDF. Our AI reads it, extracts a concise summary, identifies key dates, and pulls out actionable tasks for your team.
- **Proactive Risk Radar (Under Development)**: This is our secret weapon. The AI cross-references your uploaded documents with your current tasks. If a venue permit requires "on-site security," but you haven't assigned a security task to anyone, the Risk Radar flags this strategic gap immediately!
- **Context-Aware Global Search**: Hit `Cmd+K` and ask natural questions. The AI (via RAG-lite) fetches context from your active tasks, risks, and volunteer data to give you exact, real-time answers.
- **Smart Date Parsing**: Type like you talk. The system natively understands temporal commands like *"tomorrow"* or *"in 3 weeks"*.

### 📊 A Unified Command Center
- **Seamless Multi-Club Workspaces**: Running the Tech Club and the Cultural Society? Switch between completely isolated club workspaces with a single click.
- **End-to-End Event & Task Management**: Organize massive upcoming events and track every granular task via an intuitive interface. Prioritize tasks and follow them through their lifecycle.
- **Volunteer Rosters & Announcements**: Know exactly who your active members are, what their workload looks like, and blast important updates to everyone seamlessly.
- **Analytics & Health Tracking**: Get a bird's-eye view of your event's health, task completion rates, and volunteer bandwidth at a glance.

### 🔐 Enterprise-Grade Access
- **Role-Based Views**: Team Leads get the full command center to orchestrate activities, while Volunteers get a focused, distraction-free view of their assigned tasks.
- **Secure Authentication**: Frictionless login via Google OAuth alongside standard Email/Password authentication, backed by JWT and Passport.js.

---

## 💻 The Engine Under the Hood

We built ClubOps AI using a modern, scalable, and robust technology stack:

| Layer | Technologies |
|----------|--------------|
| **Frontend** | React 18, JSX, Vite, Tailwind CSS, React Router DOM |
| **Backend API** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **AI Brain & NLP** | Google Gemini API, LangChain |
| **Vector DB / RAG** | Pinecone, ChromaDB |
| **Auth & Security** | JWT, Passport.js, bcryptjs, Google OAuth 2.0 |
| **File Processing** | Multer, pdf-parse |

---

## 🚀 Where We're Going (Future Scope)
ClubOps AI is just getting started. Our roadmap for the future includes:
- **Advanced AI Copilot**: Moving from executing commands to autonomously suggesting optimal event plans based on past successes.
- **Real-Time WebSockets**: Instantaneous, live updates for tasks, meetings, and announcements without refreshing.
- **Predictive Risk Machine Learning**: Training custom models to identify potential event bottlenecks weeks before they happen.
- **Deep Analytics Reports**: Generating beautiful, exportable data insights to measure member participation and club impact.

---

## 👥 The Builders (Team Vortex)
- **Shukla Naman** (Team Leader) - Database Architecture, UI/UX & Testing
- **Yogesh** - Backend Engineering & REST APIs
- **Drishti** - Backend / AI Integration & Generative Workflows
- **Diya** - Frontend Development & Component Architecture

---

## 🛠️ Get It Running Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Naman-Shukla01/ClubOps-AI-.git
cd ClubOps-AI-
```

### 2. Ignite the Backend
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
# Optional for Google Auth:
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start the backend server:
```bash
npm run dev
```
*The backend will run on `http://localhost:5000`.*

### 3. Spin Up the Frontend
Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory (optional if relying on defaults):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 🧪 Experience the Magic (Testing AI Features)

1. **Talk to the Copilot**: Open the Action Copilot and type a complex command like *"Create a task for finalizing venue contract and assign it to Sarah"*.
2. **Test Document Intelligence**: Navigate to the Document Center, upload a `.pdf` file containing event requirements, and watch the AI instantly extract summaries, action items, and hidden risks!
3. **Conversational Search**: Press `Cmd+K` anywhere in the app and ask a natural question about your club's data.

---

<div align="center">
  <p>Built with ❤️ by Team Vortex for Bit N Build 2026</p>
</div>
