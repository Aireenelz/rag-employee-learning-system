from dotenv import load_dotenv
import os
from pydantic import BaseModel
from fastapi import Header, HTTPException
from typing import Optional
import jwt

# Load environment variables
load_dotenv()
supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

# Access level hierarchy
ACCESS_HIERARCHY = {
    "public": 0,
    "partner": 1,
    "internal": 2,
    "admin": 3
}

# Mapping the role to minimum access level. Can access its level and below
ROLE_MIN_ACCESS = {
    "partner": 1,
    "internal-employee": 2,
    "admin": 3
}

class UserContext(BaseModel):
    user_id: str
    email: str
    role: str
    min_access_level: int

# Authentication dependency
async def get_current_user(authorization: Optional[str] = Header(None)) -> UserContext:
    """ Extract and verify JWT token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.split(" ")[1] if " " in authorization else authorization

        # Decode JWT token
        payload = jwt.decode(token, supabase_jwt_secret, algorithms=["HS256"], audience="authenticated")

        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("user_metadata", {}).get("role", "partner")

        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Get minimum access level for this role
        min_access_level = ROLE_MIN_ACCESS.get(role, 1)

        return UserContext(
            user_id=user_id,
            email=email,
            role=role,
            min_access_level=min_access_level
        )
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
