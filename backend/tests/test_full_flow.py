import datetime
from app.models.skill import Skill
from app.models.user import User

def test_full_campus_peer_learning_flow(client, test_admin, db_session):
    # 1. COLLEGE LOGIN AND VERIFICATION
    # External email rejected
    reg_fail = client.post("/api/v1/auth/register", json={
        "college_email": "intruder@gmail.com",
        "password": "Password123!",
        "first_name": "Invalid",
        "last_name": "Student",
        "department": "Computer Science Engineering (CSE)",
        "year": "First Year"
    })
    assert reg_fail.status_code == 400
    assert "vit.edu" in reg_fail.json()["detail"]

    # Valid college student registers
    reg_student = client.post("/api/v1/auth/register", json={
        "college_email": "tanmay.kulkarni@vit.edu",
        "password": "Password123!",
        "first_name": "Tanmay",
        "last_name": "Kulkarni",
        "department": "Computer Science Engineering (CSE)",
        "year": "Second Year"
    })
    assert reg_student.status_code == 201
    s_token = reg_student.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {s_token}"}
    student_id = reg_student.json()["user"]["id"]

    # Valid college mentor registers
    reg_mentor = client.post("/api/v1/auth/register", json={
        "college_email": "pooja.joshi@vit.edu",
        "password": "Password123!",
        "first_name": "Pooja",
        "last_name": "Joshi",
        "department": "Artificial Intelligence & Data Science (AI&DS)",
        "year": "Fourth Year"
    })
    assert reg_mentor.status_code == 201
    m_token = reg_mentor.json()["access_token"]
    mentor_headers = {"Authorization": f"Bearer {m_token}"}
    mentor_id = reg_mentor.json()["user"]["id"]

    # 2. PROFILE & ONBOARDING
    # Student completes onboarding
    prof_update = client.put("/api/v1/users/me", json={
        "bio": "Sophomore learning machine learning and systems programming.",
        "learning_preferences": "VIT Library Discussion Room & Online"
    }, headers=student_headers)
    assert prof_update.status_code == 200
    assert prof_update.json()["bio"] == "Sophomore learning machine learning and systems programming."

    # 3. TEACHING SKILLS & LEARNING INTERESTS
    skill = db_session.query(Skill).filter(Skill.name.ilike("%Machine Learning%")).first()
    if not skill:
        skill = Skill(name="Machine Learning", category="Artificial Intelligence", description="ML models")
        db_session.add(skill)
        db_session.commit()
        db_session.refresh(skill)

    # Mentor adds teaching skill
    add_teach = client.post("/api/v1/skills/teaching", json={
        "skill_id": skill.id,
        "proficiency_level": "Expert",
        "years_of_experience": 2.5
    }, headers=mentor_headers)
    assert add_teach.status_code == 201

    # Learner adds learning interest
    add_learn = client.post("/api/v1/skills/interests", json={
        "skill_id": skill.id,
        "desired_level": "Intermediate",
        "priority": "High"
    }, headers=student_headers)
    assert add_learn.status_code == 201

    # 4. MENTOR AVAILABILITY
    set_avail = client.post("/api/v1/users/me/availability", json=[
        {"day": "Wednesday", "start_time": "16:00", "end_time": "18:00", "available": True},
        {"day": "Friday", "start_time": "17:00", "end_time": "19:00", "available": True}
    ], headers=mentor_headers)
    assert set_avail.status_code == 200
    assert len(set_avail.json()) == 2

    # 5. AI MENTOR MATCHING & RECOMMENDATION
    rec_res = client.post("/api/v1/matching/recommend", json={
        "skill_id": skill.id,
        "desired_level": "Intermediate",
        "preferred_days": ["Wednesday"]
    }, headers=student_headers)
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) > 0
    matched_mentor = next((r for r in recs if r["mentor"]["id"] == mentor_id), None)
    assert matched_mentor is not None
    assert matched_mentor["match_score"] > 60
    assert "explanation" in matched_mentor

    # 6. MENTOR PROFILE INSPECTION
    mentor_prof = client.get(f"/api/v1/users/mentors/{mentor_id}")
    assert mentor_prof.status_code == 200
    assert mentor_prof.json()["first_name"] == "Pooja"
    assert len(mentor_prof.json()["teaching_skills"]) > 0

    # 7. SESSION BOOKING
    booking_date = (datetime.date.today() + datetime.timedelta(days=5)).isoformat()
    book_res = client.post("/api/v1/sessions", json={
        "mentor_id": mentor_id,
        "skill_id": skill.id,
        "scheduled_date": booking_date,
        "start_time": "16:00",
        "end_time": "17:00",
        "mode": "Online",
        "notes": "Session on scikit-learn models and confusion matrices"
    }, headers=student_headers)
    assert book_res.status_code == 201
    session_id = book_res.json()["id"]
    assert book_res.json()["status"] == "Pending"

    # 8. DOUBLE-BOOKING PREVENTION
    # Conflict 1: Overlapping slot for same mentor by another request
    double_book = client.post("/api/v1/sessions", json={
        "mentor_id": mentor_id,
        "skill_id": skill.id,
        "scheduled_date": booking_date,
        "start_time": "16:30",  # Overlaps with 16:00 - 17:00
        "end_time": "17:30",
        "mode": "Online",
        "notes": "Overlapping booking attempt"
    }, headers=student_headers)
    assert double_book.status_code == 409
    assert "conflicting" in double_book.json()["detail"].lower()

    # 9. MENTOR ACCEPT
    accept_res = client.patch(f"/api/v1/sessions/{session_id}/status", json={
        "status": "Accepted",
        "meeting_link": "https://meet.google.com/ssw-vit-ml-session"
    }, headers=mentor_headers)
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "Scheduled"
    assert "meet.google.com" in accept_res.json()["meeting_link"]

    # 10. SESSION COMPLETION
    comp_res = client.patch(f"/api/v1/sessions/{session_id}/status", json={
        "status": "Completed"
    }, headers=mentor_headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "Completed"

    # 11. RATINGS AND REVIEWS
    rev_res = client.post("/api/v1/reviews", json={
        "session_id": session_id,
        "rating": 5,
        "comment": "Pooja explained hyperparameter tuning brilliantly with code samples in Google Colab."
    }, headers=student_headers)
    assert rev_res.status_code == 201
    assert rev_res.json()["rating"] == 5

    # Prevent duplicate review on same session
    dup_rev = client.post("/api/v1/reviews", json={
        "session_id": session_id,
        "rating": 4,
        "comment": "Trying to review again"
    }, headers=student_headers)
    assert dup_rev.status_code == 400
    assert "already been submitted" in dup_rev.json()["detail"].lower()

    # 12. TRUST SCORE UPDATE
    mentor_after = client.get(f"/api/v1/users/mentors/{mentor_id}")
    assert mentor_after.status_code == 200
    assert mentor_after.json()["trust_score"]["score"] > 80.0
    assert mentor_after.json()["completed_sessions_count"] == 1

    # 13. NOTIFICATIONS
    notif_res = client.get("/api/v1/notifications", headers=student_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert len(notifs) > 0

    # 14. ADMIN MANAGEMENT & SECURITY
    # Student cannot access admin endpoints
    forbidden_res = client.get("/api/v1/admin/overview", headers=student_headers)
    assert forbidden_res.status_code == 403

    # Admin login & access
    admin_login = client.post("/api/v1/auth/login", json={
        "college_email": test_admin.college_email,
        "password": "AdminPass123!"
    })
    assert admin_login.status_code == 200
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    overview = client.get("/api/v1/admin/overview", headers=admin_headers)
    assert overview.status_code == 200
    assert overview.json()["total_sessions"] >= 1
