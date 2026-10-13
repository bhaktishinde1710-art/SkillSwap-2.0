def test_admin_overview_and_analytics(client, admin_auth_headers):
    res = client.get("/api/v1/admin/overview", headers=admin_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_students" in data
    assert "active_mentors" in data
    assert "total_sessions" in data

    analytics_res = client.get("/api/v1/admin/analytics", headers=admin_auth_headers)
    assert analytics_res.status_code == 200
    adata = analytics_res.json()
    assert "departments" in adata
    assert "popular_skills" in adata

def test_admin_user_status_management(client, admin_auth_headers, test_student):
    # Reject status
    res = client.patch(f"/api/v1/admin/users/{test_student.id}/status?status_action=reject", headers=admin_auth_headers)
    assert res.status_code == 200
    assert "rejected" in res.json()["message"]

    # Suspend status
    res = client.patch(f"/api/v1/admin/users/{test_student.id}/status?status_action=suspend", headers=admin_auth_headers)
    assert res.status_code == 200
    assert "suspended" in res.json()["message"]

    # Verify status
    res = client.patch(f"/api/v1/admin/users/{test_student.id}/status?status_action=verify", headers=admin_auth_headers)
    assert res.status_code == 200
    assert "verified" in res.json()["message"]

def test_admin_skills_crud(client, admin_auth_headers):
    # Create skill
    create_res = client.post("/api/v1/admin/skills", json={
        "name": "Kubernetes Architecture",
        "category": "DevOps & Cloud",
        "description": "Production container orchestration at scale"
    }, headers=admin_auth_headers)
    assert create_res.status_code == 201
    skill_id = create_res.json()["id"]

    # Update skill
    up_res = client.put(f"/api/v1/admin/skills/{skill_id}", json={
        "name": "Kubernetes Cluster Architecture"
    }, headers=admin_auth_headers)
    assert up_res.status_code == 200
    assert up_res.json()["name"] == "Kubernetes Cluster Architecture"

    # Delete skill
    del_res = client.delete(f"/api/v1/admin/skills/{skill_id}", headers=admin_auth_headers)
    assert del_res.status_code == 204

def test_admin_review_moderation(client, admin_auth_headers, student_auth_headers, test_student, test_mentor, db_session):
    import datetime
    from app.models.skill import Skill
    from app.models.session import Session as LearningSession
    from app.models.review import Review

    skill = db_session.query(Skill).first()
    if not skill:
        skill = Skill(name="Python Programming", category="Programming", description="Test skill")
        db_session.add(skill)
        db_session.commit()
        db_session.refresh(skill)
    sess = LearningSession(
        learner_id=test_student.id,
        mentor_id=test_mentor.id,
        skill_id=skill.id,
        scheduled_date=datetime.date.today() - datetime.timedelta(days=2),
        start_time="10:00",
        end_time="11:00",
        mode="Online",
        status="Completed"
    )
    db_session.add(sess)
    db_session.commit()
    db_session.refresh(sess)

    # Learner reviews
    client.post("/api/v1/reviews", json={
        "session_id": sess.id,
        "rating": 1,
        "comment": "Inappropriate comment with spam link to external site http://spam.xyz"
    }, headers=student_auth_headers)

    # Admin lists reviews
    revs_res = client.get("/api/v1/admin/reviews", headers=admin_auth_headers)
    assert revs_res.status_code == 200
    revs = revs_res.json()
    assert len(revs) > 0
    target_rev = next((r for r in revs if r["session_id"] == sess.id), None)
    assert target_rev is not None

    # Admin deletes inappropriate review
    del_res = client.delete(f"/api/v1/admin/reviews/{target_rev['id']}", headers=admin_auth_headers)
    assert del_res.status_code == 204

    # Verify review is gone
    check_rev = db_session.query(Review).filter(Review.id == target_rev["id"]).first()
    assert check_rev is None

def test_admin_settings(client, admin_auth_headers):
    res = client.get("/api/v1/admin/settings", headers=admin_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "default_college" in data
    assert "algorithm_weights" in data
