from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from auth import UserContext, get_current_user
from bson import ObjectId
from pymongo import MongoClient

load_dotenv()
router = APIRouter()

# Supabase client setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_secret_key = os.getenv("SUPABASE_SECRET_KEY")
supabase: Client = create_client(supabase_url, supabase_secret_key)

# Mongodb
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
mongodb_client = MongoClient(mongodb_uri, tls=True, tlsAllowInvalidCertificates=True)
db = mongodb_client["els_db"]
company_documents_collection = db["company_documents"]

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
    daily_trends: List[OverviewDailyTrendData]

class DocumentAnalyticsKPIResponse(BaseModel):
    total_documents: int
    # documents_accessed_percentage: float
    storage_used_mb: float
    storage_limit_mb: float
    previous_total_documents: int
    # previous_documents_accessed_percentage: float

class DocumentAnalyticsMostViewedDocument(BaseModel):
    filename: str
    total_views: int

class DocumentAnalyticsCategoryDistribution(BaseModel):
    category: str
    count: int

class DocumentAnalyticsResponse(BaseModel):
    kpis: DocumentAnalyticsKPIResponse
    most_viewed_documents: List[DocumentAnalyticsMostViewedDocument]
    category_distribution: List[DocumentAnalyticsCategoryDistribution]

class UserActivityKPIResponse(BaseModel):
    daily_active_users: float
    average_badges_per_user: int
    user_retention_rate: float
    previous_daily_active_users: float
    previous_user_retention_rate: float

class UserActivityMostActiveUser(BaseModel):
    user_id: str
    name: str
    role: str
    total_exp: int

class UserActivityRoleDistribution(BaseModel):
    role: str
    count: int

class UserActivityResponse(BaseModel):
    kpis: UserActivityKPIResponse
    most_active_users: List[UserActivityMostActiveUser]
    role_distribution: List[UserActivityRoleDistribution]

# Helper function to get date range
def get_date_range(days: int):
    end_date = datetime.utcnow().date() + timedelta(days=1)
    start_date = end_date - timedelta(days=days + 1)
    return start_date, end_date

# Helper function for user role
def get_role_filter(user_role: str):
    if user_role == "all":
        return None
    return user_role

# Helper function to format bytes to MB
def format_bytes_to_mb(bytes_value: int) -> float:
    return round(bytes_value / (1024 ** 2), 2)

# Endpoint to get overview data
@router.get("/api/analytics/overview", response_model=OverviewResponse)
async def get_overview_analytics(user_role: str = "all", time_range: int = 30, current_user: UserContext = Depends(get_current_user)):
    try:
        # Only admin can view analytics
        if current_user.role not in ["admin"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        start_date, end_date = get_date_range(time_range)
        role_filter = get_role_filter(user_role)
        prev_start_date = start_date - timedelta(days=time_range)
        prev_end_date = start_date - timedelta(days=1)

        print(f"Fetching analytics from {start_date} to {end_date} for role: {user_role}")

        # KPIS ==========================================================================================
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

        # DAILY USAGE TRENDS ==========================================================================================
        # Initialise counters for each day of week (0=Monday, 6=Sunday)
        day_of_week_aggregates = {
            i: {"searches": 0, "documentViews": 0, "activeUsers": 0}
            for i in range(7)
        }

        # Aggregate all data from chosen timeRange, by day of week
        for row in current_data.data:
            date_obj = datetime.fromisoformat(row["date"]).date()
            day_of_week = date_obj.weekday()

            day_of_week_aggregates[day_of_week]["searches"] += row["total_questions"]
            day_of_week_aggregates[day_of_week]["documentViews"] += row["total_documents_viewed"]
            day_of_week_aggregates[day_of_week]["activeUsers"] += row["active_users"]
        
        # Build daily usage trends response
        daily_trends = []
        day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        
        for day_index, label in enumerate(day_labels):
            daily_trends.append(OverviewDailyTrendData(
                label=label,
                searches=day_of_week_aggregates[day_index]["searches"],
                documentViews=day_of_week_aggregates[day_index]["documentViews"],
                activeUsers=day_of_week_aggregates[day_index]["activeUsers"]
            ))

        return OverviewResponse(kpis=kpis, daily_trends=daily_trends)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics data")

# Endpoint to get document analytics data
@router.get("/api/analytics/document-analytics", response_model=DocumentAnalyticsResponse)
async def get_document_analytics(user_role: str = "all", time_range: int = 30, current_user: UserContext = Depends(get_current_user)):
    try:
        # Only admin can view analytics
        if current_user.role not in ["admin"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        start_date, end_date = get_date_range(time_range)
        role_filter = get_role_filter(user_role)
        prev_start_date = start_date - timedelta(days=time_range)
        prev_end_date = start_date - timedelta(days=1)

        print(f"Fetching document analytics from {start_date} to {end_date} for role: {user_role}")

        # KPI 1: TOTAL DOCUMENTS (MONGODB) ==========================================================================================
        total_documents = company_documents_collection.count_documents({})

        previous_total_documents = company_documents_collection.count_documents({
            "upload_date": {"$lt": start_date.isoformat()}
        })

        # # KPI 2: % DOCUMENTS ACCESSED (SUPABASE) ==========================================================================================
        # # Current period
        # unique_docs_result = supabase.rpc(
        #     "count_unique_documents_accessed",
        #     {
        #         "start_date": start_date.isoformat(),
        #         "end_date": end_date.isoformat(),
        #         "user_role": role_filter
        #     }
        # ).execute()

        # unique_documents_accessed = unique_docs_result.data[0]["unique_documents_accessed"] if unique_docs_result.data else 0

        # documents_accessed_percentage = round((unique_documents_accessed / total_documents * 100) if total_documents > 0 else 0, 2)

        # # Previous period
        # prev_unique_docs_result = supabase.rpc(
        #     "count_unique_documents_accessed",
        #     {
        #         "start_date": prev_start_date.isoformat(),
        #         "end_date": prev_end_date.isoformat(),
        #         "user_role": role_filter
        #     }
        # ).execute()

        # prev_unique_documents_accessed = prev_unique_docs_result.data[0]["unique_documents_accessed"] if prev_unique_docs_result.data else 0

        # previous_documents_accessed_percentage = round((prev_unique_documents_accessed / previous_total_documents * 100) if previous_total_documents > 0 else 0, 2)

        # KPI 3: STORAGE USED (MONGODB) ==========================================================================================
        db_stats = db.command("dbStats")
        #print(db_stats)
        storage_used_bytes = db_stats.get("dataSize", 0) + db_stats.get("indexSize", 0)
        storage_used_mb = format_bytes_to_mb(storage_used_bytes)

        storage_limit_mb = 512.00

        # Build KPI response
        kpis = DocumentAnalyticsKPIResponse(
            total_documents=total_documents,
            # documents_accessed_percentage=documents_accessed_percentage,
            storage_used_mb=storage_used_mb,
            storage_limit_mb=storage_limit_mb,
            previous_total_documents=previous_total_documents,
            # previous_documents_accessed_percentage=previous_documents_accessed_percentage
        )

        # MOST VIEWED DOCUMENTS (SUPABASE) ==========================================================================================
        most_viewed_result = supabase.rpc(
            "get_most_viewed_documents",
            {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "user_role": role_filter,
                "limit_count": 5
            }
        ).execute()

        most_viewed_documents = []
        for row in most_viewed_result.data:
            most_viewed_documents.append(DocumentAnalyticsMostViewedDocument(
                filename=row["filename"] or "Unknown",
                total_views=int(row["total_views"])
            ))
        
        # CATEGORY DISTRIBUTION (MONGODB) ==========================================================================================
        # Aggregate documents by tags
        pipeline = [
            {"$unwind": "$tags"},
            {"$group": {
                "_id": "$tags",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]

        category_aggregation = list(company_documents_collection.aggregate(pipeline))

        category_distribution = []
        for cat in category_aggregation:
            category_distribution.append(DocumentAnalyticsCategoryDistribution(
                category=cat["_id"],
                count=cat["count"]
            ))

        return DocumentAnalyticsResponse(kpis=kpis, most_viewed_documents=most_viewed_documents, category_distribution=category_distribution)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Document analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch document analytics data")

# Endpoint to get user activity data
@router.get("/api/analytics/user-activity", response_model=UserActivityResponse)
async def get_user_activity_analytics(user_role: str = "all", time_range: int = 30, current_user: UserContext = Depends(get_current_user)):
    try:
        # Only admin can view analytics
        if current_user.role not in ["admin"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        start_date, end_date = get_date_range(time_range)
        role_filter = get_role_filter(user_role)

        print(f"Fetching user activity analytics from {start_date} to {end_date} for role: {user_role}")

        # KPI 1: DAILY ACTIVE USERS ==========================================================================================
        # Current period
        dau_query = supabase.table("daily_analytics").select("active_users, date").gte("date", start_date.isoformat()).lte("date", end_date.isoformat())
        if role_filter:
            dau_query = dau_query.eq("user_role", role_filter)
        dau_data = dau_query.execute()

        if dau_data.data:
            total_active = sum(row["active_users"] for row in dau_data.data)
            num_days = len(set(row["date"] for row in dau_data.data))
            daily_active_users = round(total_active / num_days, 2) if num_days > 0 else 0
        else:
            daily_active_users = 0

        # Previous period
        prev_start_date = start_date - timedelta(days=time_range)
        prev_end_date = start_date - timedelta(days=1)

        prev_dau_query = supabase.table("daily_analytics").select("active_users, date").gte("date", prev_start_date.isoformat()).lte("date", prev_end_date.isoformat())
        if role_filter:
            prev_dau_query = prev_dau_query.eq("user_role", role_filter)
        previous_dau_data = prev_dau_query.execute()

        if previous_dau_data.data:
            prev_total_active = sum(row["active_users"] for row in previous_dau_data.data)
            prev_num_days = len(set(row["date"] for row in previous_dau_data.data))
            previous_daily_active_users = round(prev_total_active / prev_num_days, 2) if prev_num_days > 0 else 0
        else:
            previous_daily_active_users = 0
        
        # KPI 2: AVERAGE BADGES PER USER ==========================================================================================
        users_query = supabase.table("user_activity_summary").select("*")
        if role_filter:
            users_query = users_query.eq("role", role_filter)
        users_data = users_query.execute()

        users = users_data.data or []
        total_users_count = len(users)

        if total_users_count > 0:
            total_badges = sum(user.get("badges_earned", 0) for user in users)
            average_badges_per_user = round(total_badges / total_users_count)
        else:
            average_badges_per_user = 0
        
        # KPI 3: USER RETENTION RATE ==========================================================================================
        # Current period
        retention_result = supabase.rpc(
            "calculate_user_retention",
            {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "user_role": role_filter
            }
        ).execute()

        if retention_result.data and len(retention_result.data) > 0:
            user_retention_rate = float(retention_result.data[0]["retention_rate"] or 0)
        else:
            user_retention_rate = 0.0
        
        # Previous period
        prev_retention_result = supabase.rpc(
            "calculate_user_retention",
            {
                "start_date": prev_start_date.isoformat(),
                "end_date": prev_end_date.isoformat(),
                "user_role": role_filter
            }
        ).execute()

        if prev_retention_result.data and len(prev_retention_result.data) > 0:
            previous_user_retention_rate = float(prev_retention_result.data[0]["retention_rate"] or 0)
        else:
            previous_user_retention_rate = 0.0
        
        # Build KPI response
        kpis = UserActivityKPIResponse(
            daily_active_users=daily_active_users,
            average_badges_per_user=average_badges_per_user,
            user_retention_rate=user_retention_rate,
            previous_daily_active_users=previous_daily_active_users,
            previous_user_retention_rate=previous_user_retention_rate
        )
        
        # MOST ACTIVE USERS ==========================================================================================
        most_active_users = [
            UserActivityMostActiveUser(
                user_id=user["user_id"],
                name=f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "Unknown User",
                role=user.get("role", "Unknown"),
                total_exp=user.get("total_exp", 0)
            )
            for user in sorted(
                users,
                key=lambda u: u.get("total_exp", 0),
                reverse=True
            )[:5]
        ]

        # ROLE DISTRIBUTION ==========================================================================================
        if role_filter:
            role_distribution = [
                UserActivityRoleDistribution(
                    role=role_filter,
                    count=total_users_count
                )
            ]
        else:
            role_counts = {}
            for user in users:
                role = user.get("role", "Unknown")
                role_counts[role] = role_counts.get(role, 0) + 1
            
            role_distribution = sorted(
                [
                    UserActivityRoleDistribution(
                        role=role,
                        count=count
                    )
                    for role, count in role_counts.items()
                ],
                key=lambda x:x.count,
                reverse=True
            )

        return UserActivityResponse(kpis=kpis, most_active_users=most_active_users, role_distribution=role_distribution)
    except HTTPException:
        raise
    except Exception as e:
        print(f"User activity analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user activity analytics data")