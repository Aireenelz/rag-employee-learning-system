from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from typing import Optional
import os
from datetime import datetime, timezone

router = APIRouter()

# Supabase client setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_secret_key = os.getenv("SUPABASE_SECRET_KEY")

from supabase import create_client
supabase: Client = create_client(supabase_url, supabase_secret_key)

# EXP rewards for different actions
EXP_REWARDS = {
    "question_asked": 10,
    "document_viewed": 5,
    "bookmark_created": 15
}

async def track_activity(user_id: str, activity_type: str, metadata: Optional[dict] = None):
    """
    Track user activity and award EXP
    """
    try:
        # Get current user stats
        result = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        if not result.data:
            # Initialise if doesnt exist
            supabase.table("user_gamification").insert({
                "user_id": user_id
            }).execute()
            result = supabase.table("user_gamification")\
                .select("*")\
                .eq("user_id", user_id)\
                .single()\
                .execute()
        
        current_stats = result.data
        exp_earned = EXP_REWARDS.get(activity_type, 0)

        # Update stats based on activity type
        updates = {
            "total_exp": current_stats["total_exp"] + exp_earned,
            "last_activity_at": datetime.now(timezone.utc).isoformat()
        }

        if activity_type == "question_asked":
            updates["questions_asked"] = current_stats["questions_asked"] + 1
        elif activity_type == "document_viewed":
            updates["documents_viewed"] = current_stats["documents_viewed"] + 1
        elif activity_type == "bookmark_created":
            updates["bookmarks_created"] = current_stats["bookmarks_created"] + 1
        
        # Update user stats
        supabase.table("user_gamification")\
            .update(updates)\
            .eq("user_id", user_id)\
            .execute()
        
        # Log activity
        supabase.table("activity_log").insert({
            "user_id": user_id,
            "activity_type": activity_type,
            "exp_earned": exp_earned,
            "metadata": metadata
        }).execute()

        # Check for new badges
        await check_and_award_badges(user_id)

        return {
            "success": True,
            "exp_earned": exp_earned,
            "new_stats": {**current_stats, **updates}
        }
    
    except Exception as e:
        print(f"Error tracking activity: {e}")
        return {"success": False, "error": str(e)}

async def check_and_award_badges(user_id: str):
    """
    Check if user has earned any new badges
    """
    try:
        # Get user stats
        stats_result = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        if not stats_result.data:
            return
        
        stats = stats_result.data

        # Get all badges
        badges_result = supabase.table("badges").select("*").execute()
        all_badges = badges_result.data

        # Get user's earned badges
        earned_result = supabase.table("user_badges")\
            .select("badge_id")\
            .eq("user_id", user_id)\
            .execute()
        
        earned_badge_ids = [b["badge_id"] for b in earned_result.data]

        # Check each badge
        for badge in all_badges:
            if badge["id"] in earned_badge_ids:
                continue

            requirement_met = False
            req_type = badge["requirement_type"]
            req_value = badge["requirement_value"]

            if req_type == "questions_asked":
                requirement_met = stats["questions_asked"] >= req_value
            elif req_type == "documents_viewed":
                requirement_met = stats["documents_viewed"] >= req_value
            elif req_type == "bookmarks_created":
                requirement_met = stats["bookmarks_created"] >= req_value
            elif req_type == "level_reached":
                requirement_met = stats["level"] >= req_value
            
            if requirement_met:
                # Award badge
                supabase.table("user_badges").insert({
                    "user_id": user_id,
                    "badge_id": badge["id"]
                }).execute()

                # Award bonus EXP if applicable
                if badge["exp_reward"] > 0:
                    supabase.table("user_gamification")\
                        .update({
                            "total_exp": stats["total_exp"] + badge["exp_reward"]
                        })\
                        .eq("user_id", user_id)\
                        .execute()
    
    except Exception as e:
        print(f"Error checking badges: {e}")

@router.get("/api/gamification/stats/{user_id}")
async def get_user_stats(user_id: str):
    """
    Endpoint to get user gamification stats
    """
    try:
        result = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        if not result.data:
            # Initialise if doesn't exist
            supabase.table("user_gamification").insert({
                "user_id": user_id
            }).execute()
            result = supabase.table("user_gamification")\
                .select("*")\
                .eq("user_id", user_id)\
                .single()\
                .execute()
        
        stats = result.data

        # Calculate progress to next level
        current_level_min_exp = (stats["level"] - 1) * 500
        next_level_exp = stats["level"] * 500
        exp_for_next_level = next_level_exp - stats["total_exp"]
        exp_progress = stats["total_exp"] - current_level_min_exp
        exp_progress_percentage = (exp_progress / 500) * 100

        return {
            **stats,
            "exp_for_next_level": exp_for_next_level,
            "exp_progress": exp_progress,
            "exp_progress_percentage": exp_progress_percentage
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/gamification/badges/{user_id}")
async def get_user_badges(user_id: str):
    """
    Endpoint to get available badges and user's earned badges
    """
    try:
        # Get all badges
        badges_result = supabase.table("badges")\
            .select("*")\
            .order("requirement_value")\
            .execute()
        
        all_badges = badges_result.data

        # Get user's earned badges
        earned_result = supabase.table("user_badges")\
            .select("badge_id, earned_at")\
            .eq("user_id", user_id)\
            .execute()
        
        earned_map = {b["badge_id"]: b["earned_at"] for b in earned_result.data}

        # Get user stats for progress calculation
        stats_result = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        stats = stats_result.data if stats_result.data else {}

        # Enrich badges with earned status and progress
        enriched_badges = []
        for badge in all_badges:
            earned_at = earned_map.get(badge["id"])
            is_earned = earned_at is not None

            # Calculate progress
            progress = 0
            if not is_earned and stats:
                req_type = badge["requirement_type"]
                req_value = badge["requirement_value"]

                if req_type == "questions_asked":
                    progress = min(100, (stats.get("questions_asked", 0) / req_value) * 100)
                elif req_type == "documents_viewed":
                    progress = min(100, (stats.get("documents_viewed", 0) / req_value) * 100)
                elif req_type == "bookmarks_created":
                    progress = min(100, (stats.get("bookmarks_created", 0) / req_value) * 100)
                elif req_type == "level_reached":
                    progress = min(100, (stats.get("level", 1) / req_value) * 100)
            elif is_earned:
                progress = 100
            
            enriched_badges.append({
                **badge,
                "earned": is_earned,
                "earned_at": earned_at,
                "progress": progress
            })
        
        return {
            "badges": enriched_badges,
            "total_earned": len(earned_map)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/gamification/track")
async def track_user_activity(data: dict):
    """
    Endpoint to track activity
    Expected data: {
        "user_id": str,
        "activity_type": str,
        "metadata": dict (optional)
    }
    """
    user_id = data.get("user_id")
    activity_type = data.get("activity_type")
    metadata = data.get("metadata", {})

    if not user_id or not activity_type:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    result = await track_activity(user_id, activity_type, metadata)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result