"""
Redis client configuration and utilities
"""

import redis.asyncio as redis
from typing import Optional, Any, Union
import json
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    """Redis client manager"""
    
    def __init__(self):
        self.client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.client = redis.from_url(
                settings.REDIS_URL,
                db=settings.REDIS_DB,
                decode_responses=True
            )
            
            # Test connection
            await self.client.ping()
            logger.info(f"Connected to Redis: {settings.REDIS_URL}")
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.client:
            await self.client.close()
            logger.info("Disconnected from Redis")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from Redis"""
        if not self.client:
            return None
        
        try:
            value = await self.client.get(f"{settings.CACHE_PREFIX}{key}")
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis GET error for key {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in Redis"""
        if not self.client:
            return False
        
        try:
            serialized_value = json.dumps(value, default=str)
            ttl = ttl or settings.CACHE_TTL
            await self.client.setex(
                f"{settings.CACHE_PREFIX}{key}",
                ttl,
                serialized_value
            )
            return True
        except Exception as e:
            logger.error(f"Redis SET error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from Redis"""
        if not self.client:
            return False
        
        try:
            result = await self.client.delete(f"{settings.CACHE_PREFIX}{key}")
            return bool(result)
        except Exception as e:
            logger.error(f"Redis DELETE error for key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis"""
        if not self.client:
            return False
        
        try:
            result = await self.client.exists(f"{settings.CACHE_PREFIX}{key}")
            return bool(result)
        except Exception as e:
            logger.error(f"Redis EXISTS error for key {key}: {e}")
            return False
    
    async def health_check(self) -> dict:
        """Check Redis health"""
        if not self.client:
            return {"status": "disconnected", "error": "Client not initialized"}
        
        try:
            info = await self.client.info()
            return {
                "status": "connected",
                "version": info.get("redis_version"),
                "used_memory": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients")
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Global Redis client instance
redis_client = RedisClient()

async def get_redis() -> RedisClient:
    """Dependency to get Redis client"""
    return redis_client
