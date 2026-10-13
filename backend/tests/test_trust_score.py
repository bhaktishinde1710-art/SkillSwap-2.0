import datetime
from app.models.skill import Skill
from app.models.session import Session as LearningSession

def test_review_and_trust_score_update(client, student_auth_headers, test_student, test_mentor, db_session):
    skill = db_session.query(Skill).first()
    
    # Create an already completed session
    completed_sess = LearningSession(
        learner_id=test_student.id,
        mentor_id=test_mentor.id,
        skill_id=skill.id,
        scheduled_date=datetime.date.today() - datetime.timedelta(days=1),
        start_time="14:00",
        end_time="15:00",
        mode="Online",
        status="Completed"
    )
    db_session.add(completed_sess)
    db_session.commit()
    db_session.refresh(completed_sess)

    # Submit review
    review_payload = {
        "session_id": completed_sess.id,
        "rating": 5,
        "comment": "Outstanding session on campus! Explained concepts with crystal clear examples."
    }
    review_res = client.post("/api/v1/reviews", json=review_payload, headers=student_auth_headers)
    assert review_res.status_code == 201
    assert review_res.json()["rating"] == 5

    # Check that mentor's profile reflects the updated trust score and review
    mentor_res = client.get(f"/api/v1/users/mentors/{test_mentor.id}")
    assert mentor_res.status_code == 200
    mentor_data = mentor_res.json()
    assert mentor_data["trust_score"] is not None
    assert mentor_data["trust_score"]["score"] > 0
    assert mentor_data["average_rating"] == 5.0
