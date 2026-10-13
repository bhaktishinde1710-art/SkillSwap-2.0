from app.models.skill import Skill

def test_create_and_list_skills(client, admin_auth_headers, db_session):
    # Admin creates skill
    skill_payload = {
        "name": "Docker & Kubernetes",
        "category": "DevOps & Cloud",
        "description": "Containerization and orchestration"
    }
    response = client.post("/api/v1/admin/skills", json=skill_payload, headers=admin_auth_headers)
    assert response.status_code == 201
    created_id = response.json()["id"]

    # Public list skills
    list_res = client.get("/api/v1/skills")
    assert list_res.status_code == 200
    skills = list_res.json()
    assert any(s["name"] == "Docker & Kubernetes" for s in skills)

def test_add_teaching_skill(client, mentor_auth_headers, db_session):
    # Ensure a skill exists
    skill = db_session.query(Skill).first()
    if not skill:
        skill = Skill(name="Python", category="Programming", description="Python programming")
        db_session.add(skill)
        db_session.commit()

    payload = {
        "skill_id": skill.id,
        "proficiency_level": "Expert",
        "years_of_experience": 3.0
    }
    response = client.post("/api/v1/skills/my-teaching", json=payload, headers=mentor_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["proficiency_level"] == "Expert"
    assert data["years_of_experience"] == 3.0

def test_add_learning_interest(client, student_auth_headers, db_session):
    skill = db_session.query(Skill).first()
    payload = {
        "skill_id": skill.id,
        "desired_level": "Advanced",
        "priority": "High"
    }
    response = client.post("/api/v1/skills/my-interests", json=payload, headers=student_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["desired_level"] == "Advanced"
