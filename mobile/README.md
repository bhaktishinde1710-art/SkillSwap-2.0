# SkillSwap 2.0 Mobile App (Android / Expo)

AI-Powered Campus Peer Learning Platform — React Native & Expo Mobile Application for Android.

The mobile app connects to the existing SkillSwap FastAPI backend and sqlite database without altering web functionality.

---

## Architecture & Technology Stack

- **Framework**: React Native 0.86, Expo SDK 57
- **Routing**: Expo Router (file-based navigation, typed routes)
- **Language**: TypeScript (Strict typing, zero emit errors)
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Secure Token Storage**: `expo-secure-store`
- **Networking**: `axios` with Bearer auth interceptors & automatic session invalidation
- **State Management**: React Context (`AuthContext`, `NotificationContext`)

---

## Screen Inventory (18 Complete Screens)

1. **Welcome / Landing (`app/(auth)/welcome.tsx`)**:
   - SkillSwap branding & VIT Pune campus verification highlight
   - Peer learning value propositions
   - Quick sign-in navigation & demo account hints
2. **Login Screen (`app/(auth)/login.tsx`)**:
   - Official college credentials login
   - Quick one-tap fill buttons for Demo Student (`aarav.sharma@vit.edu`) & Admin (`admin@vit.edu`)
   - Secure password toggle and field validation
3. **Registration Screen (`app/(auth)/register.tsx`)**:
   - First / Last Name, `@vit.edu` college email
   - Department selector (Computer Engg, IT, AI & DS, ENTC, Mech)
   - Academic Year picker (First to Final Year)
   - Password confirmation and validation
4. **Forgot Password Screen (`app/(auth)/forgot-password.tsx`)**:
   - Reset email submission with feedback states
5. **Student Dashboard (`app/(tabs)/index.tsx`)**:
   - Personalized welcome header & VIT verification status banner
   - Active sessions, teaching skills, and completion counters
   - Quick action grid (Find Mentor, AI Match, Schedule, My Skills)
   - Upcoming sessions cards with meeting link launcher
   - AI Recommended Mentors horizontal preview carousel
6. **Mentor Discovery & Exploration (`app/(tabs)/explore.tsx`)**:
   - Real-time search by mentor name or skill
   - Category filtering chips (Programming, Data Science, Web, etc.)
   - Verified student badges, star ratings, and Trust Score badges
   - Instant "Book Session" CTA
7. **Mentor Profile Screen (`app/mentor/[id].tsx`)**:
   - Full student bio, department, and academic year
   - Trust Score breakdown (Reliability %, Teaching %, Completion %)
   - Teaching skills with proficiency levels & years of experience
   - Weekly availability schedule
   - Authentic student reviews with star ratings and comments
8. **AI Recommendations Screen (`app/recommendations.tsx`)**:
   - Target skill selector
   - Match score percentages (e.g., 95% Match)
   - AI match explanations (scheduling alignment + skill proficiency)
   - Instant booking flow
9. **Session Booking Screen (`app/booking/new.tsx`)**:
   - Skill selection from mentor's teaching portfolio
   - Date and time slot inputs
   - Online (Google Meet) or Offline (Campus reading hall/lab) mode switcher
   - Double-booking conflict detection (Graceful handling of HTTP 409 Conflict)
10. **My Bookings (`app/(tabs)/bookings.tsx`)**:
    - Status tabs (All, Upcoming, Pending, Completed, Cancelled)
    - Role filter (All, As Learner, As Mentor)
    - In-line actions: Accept/Decline requests, Leave Review, View Details
11. **Booking Details Screen (`app/booking/[id].tsx`)**:
    - Full schedule, location/online link opener
    - Lifecycle action buttons (Accept, Decline, Mark Completed, Cancel with reason)
12. **Review & Feedback Modal (`app/booking/review.tsx`)**:
    - Interactive 5-star rating picker
    - Written feedback commentary
    - Dynamic trust score recalculation upon submission
13. **Mentor Hub (`app/(tabs)/mentor.tsx`)**:
    - Incoming student booking requests with Accept/Decline
    - Weekly availability schedule editor (Monday - Sunday toggles and time ranges)
    - Teaching performance and reliability metrics
14. **Student Profile (`app/(tabs)/profile.tsx`)**:
    - User details, campus verification status, trust score tier
    - Reputation metrics (Completed sessions, teaching skills, average rating)
    - Navigation menu to Edit Profile, Manage Skills, Notifications, and Admin Suite
15. **Edit Profile Screen (`app/profile/edit.tsx`)**:
    - Update name, bio, department, and academic year
16. **Skills & Interests Management (`app/profile/skills.tsx`)**:
    - Teaching skills list with add/delete modals (proficiency level & years of experience)
    - Learning goals list with desired level and priority
17. **Notifications Screen (`app/notifications.tsx`)**:
    - List of session updates, acceptance alerts, and review notifications
    - Unread indicator badge and "Mark All as Read" action
18. **Admin Suite Suite (`app/admin/`)**:
    - **Overview (`admin/index.tsx`)**: Campus platform analytics (Students, Sessions, Mentors, Completion rate)
    - **User Verification (`admin/users.tsx`)**: Verify pending students, suspend, or reinstate accounts
    - **Sessions Oversight (`admin/sessions.tsx`)**: View all campus peer sessions
    - **Skills Catalog (`admin/skills.tsx`)**: Add and publish new platform skills
    - **Reports & Moderation (`admin/reports.tsx`)**: Investigate flagged student issues

---

## Backend Connectivity & Networking Setup

The mobile app accesses the live FastAPI backend (`/api/v1`).

### Environment Configuration

Create a `.env` file in `mobile/` (or copy from `.env.example`):

```bash
# For Android Emulator:
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1

# For Physical Android Device via Expo Go on the same Wi-Fi:
# EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LOCAL_IP>:8000/api/v1
```

### Running the Backend

Make sure the backend is running at root:
```bash
cd backend
venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running the Mobile App

In the `mobile` directory:
```bash
cd mobile
npm start
```

Press:
- `a` to open on an Android emulator or connected device via ADB.
- Scan the QR code using the **Expo Go** app on an Android phone on the same Wi-Fi network.
- `w` to open web preview.

---

## Test Accounts (VIT Pune)

- **Demo Student**: `aarav.sharma@vit.edu` / `Password123!`
- **Demo Admin**: `admin@vit.edu` / `AdminPass123!`
