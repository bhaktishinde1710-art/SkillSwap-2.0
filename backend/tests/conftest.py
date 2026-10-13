import pytest
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.config import settings
from app.models.user import User
from app.auth.jwt import get_password_hash, create_access_token

TEST_DATABASE_URL = "sqlite:///./test_skillswap.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_skillswap.db"):
        try:
            os.remove("./test_skillswap.db")
        except Exception:
            pass

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def test_student(db_session):
    user = db_session.query(User).filter(User.college_email == "student.test@vit.edu").first()
    if not user:
        user = User(
            college_email="student.test@vit.edu",
            password_hash=get_password_hash("Password123!"),
            first_name="Test",
            last_name="Student",
            college="Vishwakarma Institute of Technology (VIT), Pune",
            department="Computer Science Engineering (CSE)",
            year="Third Year",
            role="student",
            verification_status="verified",
            onboarding_completed=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user

@pytest.fixture
def test_mentor(db_session):
    user = db_session.query(User).filter(User.college_email == "mentor.test@vit.edu").first()
    if not user:
        user = User(
            college_email="mentor.test@vit.edu",
            password_hash=get_password_hash("Password123!"),
            first_name="Test",
            last_name="Mentor",
            college="Vishwakarma Institute of Technology (VIT), Pune",
            department="Information Technology (IT)",
            year="Fourth Year",
            role="student",
            verification_status="verified",
            onboarding_completed=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user

@pytest.fixture
def test_admin(db_session):
    user = db_session.query(User).filter(User.college_email == "admin.test@vit.edu").first()
    if not user:
        user = User(
            college_email="admin.test@vit.edu",
            password_hash=get_password_hash("AdminPass123!"),
            first_name="Admin",
            last_name="Tester",
            college="Vishwakarma Institute of Technology (VIT), Pune",
            department="Computer Science Engineering (CSE)",
            year="Fourth Year",
            role="admin",
            verification_status="verified",
            onboarding_completed=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user

@pytest.fixture
def student_auth_headers(test_student):
    token = create_access_token({"sub": str(test_student.id), "email": test_student.college_email, "role": test_student.role})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def mentor_auth_headers(test_mentor):
    token = create_access_token({"sub": str(test_mentor.id), "email": test_mentor.college_email, "role": test_mentor.role})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_auth_headers(test_admin):
    token = create_access_token({"sub": str(test_admin.id), "email": test_admin.college_email, "role": test_admin.role})
    return {"Authorization": f"Bearer {token}"}
