# SkillSwap 2.0 — AI-Powered Campus Peer Learning Platform

SkillSwap 2.0 is an AI-assisted peer learning ecosystem designed specifically for engineering colleges, connecting verified students who want to master a skill with peer mentors on campus who can guide them.

This implementation features authentic **Vishwakarma Institute of Technology (VIT), Pune** campus demo data.

---

## 🌟 Key Features

1. **College Login & Verification**: Exclusive `@vit.edu` institutional email domain verification to ensure trusted, verified campus participants.
2. **Dual-Role Profiles**: Students can simultaneously offer mentorship in engineering domains they excel in while learning other technologies from senior peers.
3. **Multi-Factor AI Mentor Matching**: Computes transparent match scores (0–100%) and natural language rationale evaluating skill requirements, proficiency, mutual availability, verified Trust Scores, and campus department synergies.
4. **Interactive Skill Discovery**: Full-text search and category filtering across 36 core technologies with real-time mentor listings.
5. **Conflict-Free Session Booking**: Server-side double-booking prevention rejecting overlapping time slots for both mentors and learners with HTTP 409 Conflict.
6. **Session Lifecycle & Google Meet Integration**: Complete workflow (`Pending` → `Scheduled` → `Completed`) with automated meeting link generation.
7. **Dynamic Trust Score**: Objective 0–100 score dynamically calculated from Teaching Quality (35%), Session Completion (25%), Reliability (25%), and Review Volume / Skill Verifications (15%).
8. **Automated Campus Notifications**: Real-time notifications for booking requests, status updates, reviews, and admin verifications.
9. **Admin Suite**:
   - Comprehensive Campus Overview & Real-Time Analytics
   - Student Directory & Verification Moderation (Verify / Suspend / Reject)
   - Skills Catalog Management (CRUD)
   - Session Auditing & Incident Logs
   - Peer Review Moderation & Deletion
   - Student Reports Resolution
   - Algorithm Hyperparameter Inspection

---

## 🛠️ Technology Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite / PostgreSQL, Uvicorn, Passlib (bcrypt), Python-Jose (JWT)
- **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, React Router v6, Axios, Recharts, Lucide React
- **Testing**: Pytest, FastAPI TestClient
- **Containerization**: Docker, Docker Compose, Nginx

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows (or source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt

# Seed the database with VIT Pune campus data
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API Base URL: `http://127.0.0.1:8000/api/v1`
- Interactive Swagger Docs: `http://127.0.0.1:8000/api/v1/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- Open: `http://localhost:5173`

### 3. Running with Docker Compose

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/v1`

---

## 🧪 Testing

Run all backend unit and end-to-end integration tests:

```bash
backend\venv\Scripts\pytest.exe backend\tests -v -p no:warnings
```

Run frontend production build & type checks:

```bash
cd frontend
npm run build
```

---

## 🔐 Demo Credentials (VIT Pune Campus)

### Campus Administrator
- **Email**: `admin@vit.edu`
- **Password**: `AdminPass123!`
- **Access**: Full Admin Control Suite (`/admin`)

### Student Peer Mentors & Learners
- **Password for all student accounts**: `Password123!`

| Student | Email | Department | Year | Highlights / Teaching Skills |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `aarav.sharma@vit.edu` | Computer Science (CSE) | Fourth Year | DSA, C++, Competitive Programming |
| **Ananya Deshmukh** | `ananya.deshmukh@vit.edu` | CSE (AI) | Third Year | Machine Learning, Deep Learning, PyTorch |
| **Rohan Kulkarni** | `rohan.kulkarni@vit.edu` | Information Tech (IT) | Fourth Year | Web Development, React, Node.js |
| **Snehal Patil** | `snehal.patil@vit.edu` | AI & Data Science | Third Year | Data Science, SQL, Python |
| **Ishita Gupta** | `ishita.gupta@vit.edu` | Information Tech (IT) | Fourth Year | Cloud (AWS), Docker, Linux |
| **Aditya Joshi** | `aditya.joshi@vit.edu` | E&TC | Fourth Year | Embedded Systems, IoT, Robotics |

---

## 📐 AI Matching Architecture

The recommendation engine scores mentors on a 0–100 scale using the following normalized formula:

$$\text{Score} = w_{\text{skill}} S_{\text{skill}} + w_{\text{prof}} S_{\text{prof}} + w_{\text{avail}} S_{\text{avail}} + w_{\text{trust}} S_{\text{trust}} + w_{\text{rating}} S_{\text{rating}} + w_{\text{pref}} S_{\text{pref}}$$

- **Skill Match** ($w=0.35$): 100% for target skill match.
- **Proficiency** ($w=0.20$): Evaluates mentor's depth (`Expert`, `Advanced`, `Intermediate`) relative to learner's target.
- **Availability** ($w=0.20$): Free weekly time slots overlapping with the learner's schedule preferences.
- **Trust Score** ($w=0.15$): Historical reliability and completion record on campus.
- **Ratings & Reviews** ($w=0.10$): Average stars given by students who completed sessions with the mentor.

---

## 🛡️ Trust Score Formula

The tamper-proof Trust Score updates dynamically upon session completion or peer review moderation:

$$\text{Trust Score} = 0.35 \times \text{Teaching Quality} + 0.25 \times \text{Completion Rate} + 0.25 \times \text{Reliability} + 0.15 \times \text{Volume \& Verification}$$

---

Developed for **Vishwakarma Institute of Technology (VIT), Pune**.
