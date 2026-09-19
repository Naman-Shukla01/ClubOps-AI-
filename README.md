<div align="center">
  <h1>🚀 ClubOps AI</h1>
  <p><strong>The Intelligent Copilot for College Clubs & Hackathons</strong></p>
  <p>
    An all-in-one, AI-powered platform to manage events, automate tasks, analyze documents, and proactively mitigate logistical risks.
  </p>
</div>

---

## ✨ Key Features

### 🧠 Supercharged AI Capabilities (Powered by Gemini)
- **Multi-Intent Conversational Action Executor**: An AI Automation Assistant that understands complex, multi-part instructions. Tell the AI: *"Create a high priority task for catering and assign it to Sarah, then schedule a meeting for Friday"*, and it will execute all database actions simultaneously!
- **Intelligent Global Search (RAG-Lite)**: Press `Cmd+K` to search. Instead of basic keyword filtering, the AI fetches your recent tasks, risks, and volunteer data to generate conversational, context-aware answers to your questions in real-time.
- **Deep Document Intelligence**: Upload requirements, permits, or guidelines. The AI instantly extracts **Entities** (people, places), analyzes the **Sentiment**, pulls out Action Items, and identifies latent **Risks** right from the parser.
- **Proactive Risk Radar**: Upload a document and the Risk Radar will cross-reference it against your currently planned tasks. If a document mandates "security personnel" but you have no task for it, the AI automatically flags a **Strategic Gap** risk!

### 📊 Core Operations Management
- **Event Management**: Plan, schedule, and track the status of multiple club events and hackathons.
- **Task Kanban & Assignments**: Create tasks, set priorities (Low to Critical), track dependencies, and assign them to volunteers.
- **Volunteer Roster**: Manage club members, track roles, and oversee workloads.
- **Meeting Intelligence**: Store meeting transcripts and let the AI process them to automatically generate action items and updates.
- **Risk Dashboards**: Visual, categorized columns for Critical, High, Medium, and Low risks to keep your events running smoothly.

---

## 💻 Tech Stack

### Frontend
- **React.js** (Vite) for a blazing-fast UI.
- **Tailwind CSS** for modern, responsive, and beautiful styling.
- **Lucide React** for crisp iconography.

### Backend
- **Node.js & Express** for robust API endpoints.
- **MongoDB & Mongoose** for flexible data modeling (Tasks, Events, Risks, Users).
- **Google Gemini 1.5 Flash SDK** (`@google/genai`) for complex generative AI features and structured JSON data extraction.
- **JWT & Passport.js** (Google OAuth) for secure authentication.

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YourUsername/ClubOps-AI-.git
cd ClubOps-AI-
```

### 2. Setup the Backend
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

### 3. Setup the Frontend
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

## 🧪 How to Test the AI Features

1. **AI Chat**: Go to the **Meetings** page, open the right-side AI Automation Assistant panel, and type a complex command like *"Create a task for the venue and assign it to Alex, and create another task for catering."*
2. **AI Search**: Press `Cmd+K` anywhere in the app and ask a natural question like *"What risks do we have related to permits?"*
3. **Risk Radar & Documents**: Go to the **Documents** page, upload a `.txt` file containing event requirements, and watch the AI extract entities and flag missing tasks in the Risk Radar!

---

<div align="center">
  <p>Built with ❤️ to make organizing college clubs and hackathons stress-free.</p>
</div>
