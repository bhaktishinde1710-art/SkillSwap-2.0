import datetime
from app.models.skill import Skill
from app.models.user_skill import UserSkill

def test_ai_matching_recommendation(client, student_auth_headers, test_mentor, db_session):
    skill = db_session.query(Skill).filter(Skill.name == "Data Structures & Algorithms (DSA)").first()
    if not skill:
        skill = Skill(name="Data Structures & Algorithms (DSA)", category="Algorithms", description="DSA concepts")
        db_session.add(skill)
        db_session.commit()

    usk = db_session.query(UserSkill).filter(UserSkill.user_id == test_mentor.id, UserSkill.skill_id == skill.id).first()
    if not usk:
        usk = UserSkill(user_id=test_mentor.id, skill_id=skill.id, proficiency_level="Expert", years_of_experience=3.0, verification_status="verified")
        db_session.add(usk)
        db_session.commit()

    query_payload = {
        "skill_id": skill.id,
        "current_level": "Beginner",
        "desired_level": "Advanced",
        "preferred_mode": "Online"
    }

    response = client.post("/api/v1/matching/recommend", json=query_payload, headers=student_auth_headers)
    assert response.status_code == 200
    recommendations = response.json()
    assert len(recommendations) > 0
    top_match = recommendations[0]
    assert "match_score" in top_match
    assert 0 <= top_match["match_score"] <= 100
    assert "explanation" in top_match
    assert "Recommended because" in top_match["explanation"]
