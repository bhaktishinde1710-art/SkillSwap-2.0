import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillSwap – Campus Peer Learning Platform"
    PROJECT_VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Campus Information (Vishwakarma Institute of Technology, Pune)
    DEFAULT_COLLEGE: str = "Vishwakarma Institute of Technology (VIT), Pune"
    ALLOWED_EMAIL_DOMAINS: str = "vit.edu,campus.edu,edu"
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-skillswap-vit-pune-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    _DEFAULT_DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "skillswap.db").replace("\\", "/")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB_FILE}")
    
    # CORS
    BACKEND_CORS_ORIGINS: str = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
    
    # AI Matching Weights (must sum to 1.0)
    WEIGHT_SKILL_MATCH: float = 0.35
    WEIGHT_PROFICIENCY: float = 0.20
    WEIGHT_AVAILABILITY: float = 0.15
    WEIGHT_TRUST_SCORE: float = 0.10
    WEIGHT_RATING: float = 0.10
    WEIGHT_PREFERENCES: float = 0.10
    
    @property
    def allowed_domains_list(self) -> List[str]:
        return [d.strip().lower() for d in self.ALLOWED_EMAIL_DOMAINS.split(",") if d.strip()]

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
