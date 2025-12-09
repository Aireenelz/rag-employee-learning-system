from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from auth import UserContext, get_current_user

load_dotenv()
router = APIRouter()

# Supabase client setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_secret_key = os.getenv("SUPABASE_SECRET_KEY")
supabase: Client = create_client(supabase_url, supabase_secret_key)

# Pydantic models for analytics
class OverviewKPIResponse(BaseModel):
    total_questions: int
    documents_viewed: int
    total_users: int
    previous_total_questions: int
    previous_documents_viewed: int
    previous_total_users: int

class OverviewDailyTrendData(BaseModel):
    label: str
    searches: int
    documentViews: int
    activeUsers: int

class OverviewResponse(BaseModel):
    kpis: OverviewKPIResponse
    # daily_trends: List[OverviewDailyTrendData]

# Helper function to get date range
def get_date_range(days: int):
    end_date = datetime.utcnow().date() + timedelta(days=1)
    start_date = end_date - timedelta(days=days)
    return start_date, end_date

def get_role_filter(user_role: str):
    if user_role == "all":
        return None
    return user_role

# Endpoint to get overview data
@router.get("/api/analytics/overview", response_model=OverviewResponse)
async def get_overview_analytics(user_role: str = "all", time_range: int = 30, current_user: UserContext = Depends(get_current_user)):
    try:
        # Only admin can view analytics
        if current_user.role not in ["admin"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        start_date, end_date = get_date_range(time_range)
        role_filter = get_role_filter(user_role)

        # Build query for current period
        query = supabase.table("daily_analytics").select("*").gte("date", start_date.isoformat()).lte("date", end_date.isoformat())
        if role_filter:
            query = query.eq("user_role", role_filter)
        current_data = query.execute()

        users_query = supabase.table("profiles").select("id", count="exact").gte("created_at", start_date.isoformat()).lte("created_at", end_date.isoformat())
        if role_filter:
            users_query = users_query.eq("role", role_filter)
        users_data = users_query.execute()

        # Build query for previous period
        prev_start_date = start_date - timedelta(days=time_range)
        prev_end_date = start_date - timedelta(days=1)

        prev_query = supabase.table("daily_analytics").select("*").gte("date", prev_start_date.isoformat()).lte("date", prev_end_date.isoformat())
        if role_filter:
            prev_query = prev_query.eq("user_role", role_filter)
        previous_data = prev_query.execute()

        prev_users_query = supabase.table("profiles").select("id", count="exact").gte("created_at", prev_start_date.isoformat()).lte("created_at", prev_end_date.isoformat())
        if role_filter:
            prev_users_query = prev_users_query.eq("role", role_filter)
        previous_users_data = prev_users_query.execute()

        # Aggregate current period KPIs
        total_questions = sum(row["total_questions"] for row in current_data.data)
        documents_viewed = sum(row["total_documents_viewed"] for row in current_data.data)
        total_users = users_data.count or 0

        # Aggregate previous period KPIs
        previous_total_questions = sum(row["total_questions"] for row in previous_data.data)
        previous_documents_viewed = sum(row["total_documents_viewed"] for row in previous_data.data)
        previous_total_users = previous_users_data.count or 0

        # Build KPI response
        kpis = OverviewKPIResponse(
            total_questions=total_questions,
            documents_viewed=documents_viewed,
            total_users=total_users,
            previous_total_questions=previous_total_questions,
            previous_documents_viewed=previous_documents_viewed,
            previous_total_users=previous_total_users
        )

        # Build daily usage trends

        return OverviewResponse(kpis=kpis)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics data")