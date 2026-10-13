import httpx as requests
import datetime
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:5173/api/v1"

def print_step(title):
    print(f"\n========================================================")
    print(f"  {title}")
    print(f"========================================================")

def run_verification():
    print_step("1. HEALTH & CONNECTIVITY THROUGH VITE PROXY")
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✓ Vite proxy successfully routed /api/v1/health to backend:")
    print(" ", res.json())

    # ----------------------------------------------------
    print_step("2. STUDENT LOGIN (aarav.sharma@vit.edu)")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "college_email": "aarav.sharma@vit.edu",
        "password": "Password123!"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    aarav_token = login_res.json()["access_token"]
    aarav_headers = {"Authorization": f"Bearer {aarav_token}"}
    aarav_user = login_res.json()["user"]
    print(f"✓ Logged in: {aarav_user['full_name']} ({aarav_user['college_email']})")
    print(f"  Role: {aarav_user['role']} | Verified: {aarav_user['verification_status']}")

    # ----------------------------------------------------
    print_step("3. USER PROFILE & ACADEMIC INFO")
    me_res = requests.get(f"{BASE_URL}/auth/me", headers=aarav_headers)
    assert me_res.status_code == 200
    prof_res = requests.get(f"{BASE_URL}/users/profile", headers=aarav_headers)
    assert prof_res.status_code == 200
    prof = prof_res.json()
    print(f"✓ Profile retrieved for {prof['full_name']}:")
    print(f"  Department: {prof['department']} | Year: {prof['year']}")
    print(f"  Bio: {prof['bio'][:60]}...")
    print(f"  Trust Score: {prof['trust_score']['score']} (Reliability: {prof['trust_score']['reliability_score']}, Teaching: {prof['trust_score']['teaching_score']})")

    # ----------------------------------------------------
    print_step("4. TEACHING SKILLS & LEARNING INTERESTS")
    print(f"✓ Teaching Skills ({len(prof['teaching_skills'])}):")
    for ts in prof['teaching_skills']:
        print(f"  - {ts['skill']['name']}: {ts['proficiency_level']} ({ts['years_of_experience']} yrs)")
    
    print(f"✓ Learning Interests ({len(prof['learning_interests'])}):")
    for li in prof['learning_interests']:
        print(f"  - {li['skill']['name']}: Target {li['desired_level']} ({li['priority']} priority)")

    # ----------------------------------------------------
    print_step("5. MENTOR AVAILABILITY")
    avail_res = requests.get(f"{BASE_URL}/users/availability", headers=aarav_headers)
    assert avail_res.status_code == 200
    avails = avail_res.json()
    print(f"✓ Active Weekly Slots ({len(avails)}):")
    for a in avails:
        print(f"  - {a['day']}: {a['start_time']} - {a['end_time']}")

    # ----------------------------------------------------
    print_step("6. AI MENTOR MATCHING & DASHBOARD RECOMMENDATIONS")
    dash_rec_res = requests.get(f"{BASE_URL}/matching/dashboard-recommendations", headers=aarav_headers)
    assert dash_rec_res.status_code == 200
    dash_recs = dash_rec_res.json()
    print(f"✓ Personalized Recommendations for Aarav ({len(dash_recs)}):")
    for r in dash_recs[:3]:
        print(f"  - Mentor: {r['mentor']['first_name']} {r['mentor']['last_name']} for {r['matched_skill']['name']}")
        print(f"    Match Score: {r['match_score']}% | Rationale: {r['explanation']}")

    # ----------------------------------------------------
    print_step("7. LEARNER JOURNEY: TANVI BOOKS AARAV FOR C++")
    tanvi_login = requests.post(f"{BASE_URL}/auth/login", json={
        "college_email": "tanvi.shinde@vit.edu",
        "password": "Password123!"
    })
    assert tanvi_login.status_code == 200
    tanvi_token = tanvi_login.json()["access_token"]
    tanvi_headers = {"Authorization": f"Bearer {tanvi_token}"}
    print("✓ Tanvi Shinde logged in successfully")

    # Find C++ skill
    skills_res = requests.get(f"{BASE_URL}/skills?search=C%2B%2B")
    assert skills_res.status_code == 200
    cpp_skill = next((s for s in skills_res.json() if "C++" in s["name"]), skills_res.json()[0])
    print(f"✓ Target skill: {cpp_skill['name']} (ID: {cpp_skill['id']})")

    # AI Match search by Tanvi for C++
    match_search = requests.post(f"{BASE_URL}/matching/recommend", json={
        "skill_id": cpp_skill["id"],
        "desired_level": "Intermediate",
        "preferred_days": ["Monday"]
    }, headers=tanvi_headers)
    assert match_search.status_code == 200
    matched_mentors = match_search.json()
    print(f"✓ Found {len(matched_mentors)} mentors for C++:")
    for m in matched_mentors[:2]:
        print(f"  - {m['mentor']['first_name']} {m['mentor']['last_name']} | Match Score: {m['match_score']}%")

    # Inspect Aarav's mentor profile
    aarav_pub_prof = requests.get(f"{BASE_URL}/users/mentors/{aarav_user['id']}")
    assert aarav_pub_prof.status_code == 200
    print(f"✓ Inspected Mentor Profile: {aarav_pub_prof.json()['full_name']} | Trust Score: {aarav_pub_prof.json()['trust_score']['score']}")

    # Book Session
    booking_date = (datetime.date.today() + datetime.timedelta(days=14)).isoformat()
    book_payload = {
        "mentor_id": aarav_user["id"],
        "skill_id": cpp_skill["id"],
        "scheduled_date": booking_date,
        "start_time": "16:00",
        "end_time": "17:00",
        "mode": "Online",
        "notes": "Need help with C++ memory pointers, dynamic allocation, and vector capacity."
    }
    book_res = requests.post(f"{BASE_URL}/sessions", json=book_payload, headers=tanvi_headers)
    assert book_res.status_code == 201, f"Booking failed: {book_res.text}"
    session_id = book_res.json()["id"]
    print(f"✓ Session booked successfully! ID: {session_id} | Status: {book_res.json()['status']}")

    # ----------------------------------------------------
    print_step("8. DOUBLE-BOOKING CONFLICT PREVENTION")
    conflict_payload = {
        "mentor_id": aarav_user["id"],
        "skill_id": cpp_skill["id"],
        "scheduled_date": booking_date,
        "start_time": "16:30",  # Overlaps with 16:00 - 17:00!
        "end_time": "17:30",
        "mode": "Online",
        "notes": "Attempting conflicting booking on same mentor and time"
    }
    conflict_res = requests.post(f"{BASE_URL}/sessions", json=conflict_payload, headers=tanvi_headers)
    assert conflict_res.status_code == 409, f"Expected 409 Conflict, got {conflict_res.status_code}"
    print(f"✓ Conflicting double-booking correctly blocked by backend with HTTP 409:")
    print(f"  Detail: {conflict_res.json()['detail']}")

    # ----------------------------------------------------
    print_step("9. MENTOR ACCEPTS SESSION")
    accept_res = requests.patch(f"{BASE_URL}/sessions/{session_id}/status", json={
        "status": "Accepted",
        "meeting_link": "https://meet.google.com/ssw-vit-cpp-pointers"
    }, headers=aarav_headers)
    assert accept_res.status_code == 200
    print(f"✓ Mentor accepted session! New status: {accept_res.json()['status']}")
    print(f"  Meeting Link: {accept_res.json()['meeting_link']}")

    # ----------------------------------------------------
    print_step("10. SESSION COMPLETION")
    comp_res = requests.patch(f"{BASE_URL}/sessions/{session_id}/status", json={
        "status": "Completed"
    }, headers=aarav_headers)
    assert comp_res.status_code == 200
    print(f"✓ Session marked as Completed! New status: {comp_res.json()['status']}")

    # ----------------------------------------------------
    print_step("11. PEER REVIEW & TRUST SCORE DYNAMIC UPDATE")
    old_ts = aarav_pub_prof.json()['trust_score']['score']
    review_res = requests.post(f"{BASE_URL}/reviews", json={
        "session_id": session_id,
        "rating": 5,
        "comment": "Aarav is a great mentor! Clearly broke down pointers, heap memory, and custom destructors."
    }, headers=tanvi_headers)
    assert review_res.status_code == 201
    print(f"✓ Peer review submitted by Tanvi: 5.0★")

    # Verify duplicate review is rejected
    dup_res = requests.post(f"{BASE_URL}/reviews", json={
        "session_id": session_id,
        "rating": 4,
        "comment": "Duplicate review attempt"
    }, headers=tanvi_headers)
    assert dup_res.status_code == 400
    print(f"✓ Duplicate review prevented with HTTP 400:")
    print(f"  Detail: {dup_res.json()['detail']}")

    # Check updated Trust Score
    aarav_updated_prof = requests.get(f"{BASE_URL}/users/mentors/{aarav_user['id']}")
    new_ts = aarav_updated_prof.json()['trust_score']['score']
    print(f"✓ Mentor Trust Score dynamically updated: {old_ts} → {new_ts}")

    # ----------------------------------------------------
    print_step("12. NOTIFICATIONS VERIFICATION")
    aarav_notifs = requests.get(f"{BASE_URL}/notifications", headers=aarav_headers)
    assert aarav_notifs.status_code == 200
    print(f"✓ Aarav received {len(aarav_notifs.json())} notifications:")
    for n in aarav_notifs.json()[:2]:
        print(f"  - [{n['type']}] {n['title']}: {n['message']}")

    # ----------------------------------------------------
    print_step("13. ADMIN LOGIN & SUITE VERIFICATION")
    admin_login = requests.post(f"{BASE_URL}/auth/login", json={
        "college_email": "admin@vit.edu",
        "password": "AdminPass123!"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("✓ Campus Administrator logged in successfully (admin@vit.edu)")

    # Overview
    overview = requests.get(f"{BASE_URL}/admin/overview", headers=admin_headers)
    assert overview.status_code == 200
    print(f"✓ Admin Overview loaded:")
    for k, v in overview.json().items():
        print(f"  - {k}: {v}")

    # Analytics
    analytics = requests.get(f"{BASE_URL}/admin/analytics", headers=admin_headers)
    assert analytics.status_code == 200
    print(f"✓ Admin Analytics loaded:")
    print(f"  - Departments: {len(analytics.json()['departments'])}")
    print(f"  - Popular Skills: {len(analytics.json()['popular_skills'])}")
    print(f"  - Session Breakdown: {analytics.json()['sessions_breakdown']}")

    # Users & Verification Moderation
    users = requests.get(f"{BASE_URL}/admin/users", headers=admin_headers)
    if users.status_code != 200:
        print(f"FAILED /admin/users: status={users.status_code}, error={users.text}")
    assert users.status_code == 200
    print(f"✓ User Directory: {len(users.json())} campus students")

    # Skills Catalog CRUD
    new_skill_res = requests.post(f"{BASE_URL}/admin/skills", json={
        "name": "Generative AI & LLMs",
        "category": "Artificial Intelligence",
        "description": "RAG, prompt engineering, LangChain, and fine-tuning"
    }, headers=admin_headers)
    assert new_skill_res.status_code == 201
    new_skill_id = new_skill_res.json()["id"]
    print(f"✓ Admin created new skill: {new_skill_res.json()['name']} (ID: {new_skill_id})")

    # Sessions Audit Log
    sessions = requests.get(f"{BASE_URL}/admin/sessions", headers=admin_headers)
    assert sessions.status_code == 200
    print(f"✓ Session Audit Log: {len(sessions.json())} sessions tracked")

    # Review Moderation
    reviews = requests.get(f"{BASE_URL}/admin/reviews", headers=admin_headers)
    assert reviews.status_code == 200
    print(f"✓ Reviews Moderation Log: {len(reviews.json())} peer reviews audited")

    # Reports Management
    reports = requests.get(f"{BASE_URL}/admin/reports", headers=admin_headers)
    assert reports.status_code == 200
    print(f"✓ Student Reports Log: {len(reports.json())} reports managed")

    # System Settings
    settings = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers)
    assert settings.status_code == 200
    print(f"✓ Platform Governance Settings:")
    print(f"  - College: {settings.json()['default_college']}")
    print(f"  - Allowed Domains: {settings.json()['allowed_email_domains']}")
    print(f"  - Algorithm Weights: {settings.json()['algorithm_weights']}")

    # Cleanup test skill
    del_skill = requests.delete(f"{BASE_URL}/admin/skills/{new_skill_id}", headers=admin_headers)
    assert del_skill.status_code == 204
    print(f"✓ Cleaned up test skill {new_skill_id}")

    print_step("ALL 13 END-TO-END FLOWS VERIFIED SUCCESSFULLY WITH 0 ERRORS!")

if __name__ == "__main__":
    run_verification()
