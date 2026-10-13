from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered with Base.metadata
from app.routers import (
    auth_router,
    users_router,
    skills_router,
    matching_router,
    sessions_router,
    reviews_router,
    notifications_router,
    admin_router,
)

# Auto-create tables if running directly / SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="SkillSwap 2.0 – Campus Peer Learning Platform for Vishwakarma Institute of Technology (VIT), Pune. AI-assisted mentor matching, session booking, and Trust Score verification.",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local and network testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Backwards compatibility redirects for prefixed docs routes
@app.get(f"{settings.API_V1_PREFIX}/docs", include_in_schema=False)
def redirect_api_docs():
    return RedirectResponse(url="/docs")

@app.get(f"{settings.API_V1_PREFIX}/redoc", include_in_schema=False)
def redirect_api_redoc():
    return RedirectResponse(url="/redoc")

@app.get(f"{settings.API_V1_PREFIX}/openapi.json", include_in_schema=False)
def redirect_api_openapi():
    return RedirectResponse(url="/openapi.json")

# Include API v1 Routers
api_prefix = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=api_prefix)
app.include_router(users_router, prefix=api_prefix)
app.include_router(skills_router, prefix=api_prefix)
app.include_router(matching_router, prefix=api_prefix)
app.include_router(sessions_router, prefix=api_prefix)
app.include_router(reviews_router, prefix=api_prefix)
app.include_router(notifications_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "college": settings.DEFAULT_COLLEGE,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get(f"{settings.API_V1_PREFIX}/health")
def health_check():
    return {
        "status": "healthy",
        "college": settings.DEFAULT_COLLEGE,
        "version": settings.PROJECT_VERSION
    }

