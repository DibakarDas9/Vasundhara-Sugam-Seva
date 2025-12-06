"""
Authentication utilities for ML service
"""

import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        raise ValueError("Invalid token")
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise ValueError("Token verification failed")

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    # Refresh tokens typically have longer expiration
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire, "type": "refresh"})
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_refresh_token(token: str) -> Dict[str, Any]:
    """Verify refresh token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type")
        
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Refresh token has expired")
        raise ValueError("Refresh token has expired")
    except jwt.InvalidTokenError:
        logger.warning("Invalid refresh token")
        raise ValueError("Invalid refresh token")
    except Exception as e:
        logger.error(f"Refresh token verification error: {e}")
        raise ValueError("Refresh token verification failed")

def extract_user_id_from_token(token: str) -> Optional[str]:
    """Extract user ID from token"""
    try:
        payload = verify_token(token)
        return payload.get("user_id")
    except Exception as e:
        logger.error(f"Error extracting user ID from token: {e}")
        return None

def is_token_expired(token: str) -> bool:
    """Check if token is expired without raising exception"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": False})
        exp = payload.get("exp")
        if exp:
            return datetime.utcnow() > datetime.fromtimestamp(exp)
        return True
    except Exception:
        return True

def get_token_remaining_time(token: str) -> Optional[timedelta]:
    """Get remaining time until token expires"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": False})
        exp = payload.get("exp")
        if exp:
            expire_time = datetime.fromtimestamp(exp)
            remaining = expire_time - datetime.utcnow()
            return remaining if remaining.total_seconds() > 0 else None
        return None
    except Exception:
        return None
