from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.skills import router as skills_router
from app.routers.matching import router as matching_router
from app.routers.sessions import router as sessions_router
from app.routers.reviews import router as reviews_router
from app.routers.notifications import router as notifications_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "users_router",
    "skills_router",
    "matching_router",
    "sessions_router",
    "reviews_router",
    "notifications_router",
    "admin_router",
]
