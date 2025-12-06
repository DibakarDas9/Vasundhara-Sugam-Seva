"""
Cache service for ML predictions and data
"""

from typing import Any, Optional, Dict
import json
import logging
from datetime import datetime, timedelta

from app.core.redis_client import get_redis

logger = logging.getLogger(__name__)

class CacheService:
    """Service for caching ML predictions and data"""
    
    def __init__(self):
        self.redis = None
    
    async def initialize(self):
        """Initialize cache service"""
        self.redis = await get_redis()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis:
            return None
        
        try:
            return await self.redis.get(key)
        except Exception as e:
            logger.error(f"Cache GET error for key {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache"""
        if not self.redis:
            return False
        
        try:
            return await self.redis.set(key, value, ttl)
        except Exception as e:
            logger.error(f"Cache SET error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.redis:
            return False
        
        try:
            return await self.redis.delete(key)
        except Exception as e:
            logger.error(f"Cache DELETE error for key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.redis:
            return False
        
        try:
            return await self.redis.exists(key)
        except Exception as e:
            logger.error(f"Cache EXISTS error for key {key}: {e}")
            return False
    
    async def health_check(self) -> Dict[str, Any]:
        """Check cache health"""
        if not self.redis:
            return {"status": "disconnected", "error": "Redis not initialized"}
        
        try:
            return await self.redis.health_check()
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def generate_cache_key(self, prefix: str, **kwargs) -> str:
        """Generate cache key from parameters"""
        # Sort kwargs to ensure consistent key generation
        sorted_items = sorted(kwargs.items())
        key_parts = [f"{k}:{v}" for k, v in sorted_items]
        return f"{prefix}:{':'.join(key_parts)}"
    
    async def cache_prediction(self, request_hash: str, prediction: Any, ttl: int = 3600) -> bool:
        """Cache ML prediction result"""
        key = f"prediction:{request_hash}"
        return await self.set(key, prediction, ttl)
    
    async def get_cached_prediction(self, request_hash: str) -> Optional[Any]:
        """Get cached ML prediction"""
        key = f"prediction:{request_hash}"
        return await self.get(key)
    
    async def cache_model_output(self, model_name: str, input_hash: str, output: Any, ttl: int = 1800) -> bool:
        """Cache model output"""
        key = f"model:{model_name}:{input_hash}"
        return await self.set(key, output, ttl)
    
    async def get_cached_model_output(self, model_name: str, input_hash: str) -> Optional[Any]:
        """Get cached model output"""
        key = f"model:{model_name}:{input_hash}"
        return await self.get(key)
    
    async def invalidate_user_cache(self, user_id: str) -> bool:
        """Invalidate all cache entries for a user"""
        if not self.redis:
            return False
        
        try:
            # This would need to be implemented based on your cache key structure
            # For now, we'll just return True
            logger.info(f"Invalidating cache for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error invalidating user cache: {e}")
            return False
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.redis:
            return {"status": "disconnected"}
        
        try:
            # This would return actual cache statistics
            return {
                "status": "connected",
                "total_keys": 0,  # Would be actual count
                "memory_usage": "0MB",  # Would be actual usage
                "hit_rate": 0.0  # Would be actual hit rate
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"status": "error", "error": str(e)}
