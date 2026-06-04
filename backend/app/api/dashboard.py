from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import User
from app.schemas.dashboard import DashboardStatsResponse
from app.api.auth import get_current_user
from app.services.analytics_service import get_dashboard_stats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_dashboard_stats(db, current_user.id)
