import datetime
from app.models.skill import Skill
from app.models.user_skill import UserSkill

def test_session_booking_and_double_booking_prevention(client, student_auth_headers, test_student, test_mentor, db_session):
    # Ensure skill exists
    skill = db_session.query(Skill).filter(Skill.name == "Python").first()
    if not skill:
        skill = Skill(name="Python", category="Programming", description="Python programming")
        db_session.add(skill)
        db_session.commit()

    # Mentor teaches this skill
    usk = db_session.query(UserSkill).filter(UserSkill.user_id == test_mentor.id, UserSkill.skill_id == skill.id).first()
    if not usk:
        usk = UserSkill(user_id=test_mentor.id, skill_id=skill.id, proficiency_level="Advanced", years_of_experience=2.0)
        db_session.add(usk)
        db_session.commit()

    booking_date = (datetime.date.today() + datetime.timedelta(days=7)).isoformat()

    booking_payload = {
        "mentor_id": test_mentor.id,
        "skill_id": skill.id,
        "scheduled_date": booking_date,
        "start_time": "15:00",
        "end_time": "16:00",
        "mode": "Online",
        "notes": "Understanding Python decorators and generator pipelines"
    }

    # 1. First booking should succeed
    response = client.post("/api/v1/sessions", json=booking_payload, headers=student_auth_headers)
    assert response.status_code == 201
    session_data = response.json()
    assert session_data["status"] == "Pending"
    session_id = session_data["id"]

    # 2. Duplicate/Conflicting booking at overlapping time should fail with 409 Conflict
    conflicting_payload = {
        "mentor_id": test_mentor.id,
        "skill_id": skill.id,
        "scheduled_date": booking_date,
        "start_time": "15:30",  # Overlaps with 15:00-16:00
        "end_time": "16:30",
        "mode": "Online",
        "notes": "Another learner trying to book the same mentor at the same time"
    }
    conflict_res = client.post("/api/v1/sessions", json=conflicting_payload, headers=student_auth_headers)
    assert conflict_res.status_code == 409
    assert "conflicting session" in conflict_res.json()["detail"].lower()

def test_session_lifecycle(client, student_auth_headers, mentor_auth_headers, test_student, test_mentor, db_session):
    skill = db_session.query(Skill).first()
    booking_date = (datetime.date.today() + datetime.timedelta(days=10)).isoformat()

    # Create session
    req_res = client.post("/api/v1/sessions", json={
        "mentor_id": test_mentor.id,
        "skill_id": skill.id,
        "scheduled_date": booking_date,
        "start_time": "17:00",
        "end_time": "18:00",
        "mode": "Online",
        "notes": "Test lifecycle"
    }, headers=student_auth_headers)
    assert req_res.status_code == 201
    sess_id = req_res.json()["id"]

    # Mentor accepts
    accept_res = client.patch(f"/api/v1/sessions/{sess_id}/status", json={"status": "Accepted"}, headers=mentor_auth_headers)
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "Scheduled"

    # Mark completed
    complete_res = client.patch(f"/api/v1/sessions/{sess_id}/status", json={"status": "Completed"}, headers=mentor_auth_headers)
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "Completed"
