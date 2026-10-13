import pytest

def test_registration_with_non_college_email(client):
    payload = {
        "college_email": "student@gmail.com",
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "User",
        "department": "Computer Science Engineering (CSE)",
        "year": "First Year"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Only college emails" in response.json()["detail"]

def test_registration_with_valid_college_email(client):
    payload = {
        "college_email": "new.student@vit.edu",
        "password": "Password123!",
        "first_name": "Rohan",
        "last_name": "Patil",
        "department": "Information Technology (IT)",
        "year": "Second Year"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["college_email"] == "new.student@vit.edu"
    assert data["user"]["role"] == "student"

def test_duplicate_registration_rejected(client):
    payload = {
        "college_email": "new.student@vit.edu",
        "password": "AnotherPassword123!",
        "first_name": "Rohan",
        "last_name": "Patil",
        "department": "Information Technology (IT)",
        "year": "Second Year"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client):
    payload = {
        "college_email": "new.student@vit.edu",
        "password": "Password123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["college_email"] == "new.student@vit.edu"

def test_login_invalid_password(client):
    payload = {
        "college_email": "new.student@vit.edu",
        "password": "WrongPassword!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid college email or password" in response.json()["detail"]

def test_auth_me_endpoint(client, student_auth_headers, test_student):
    response = client.get("/api/v1/auth/me", headers=student_auth_headers)
    assert response.status_code == 200
    assert response.json()["college_email"] == test_student.college_email
