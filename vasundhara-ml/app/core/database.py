"""
Database connection and configuration
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import MongoClient
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    """Database connection manager"""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.database: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            self.database = self.client[settings.MONGODB_DATABASE]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.MONGODB_DATABASE}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    def get_database(self) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if not self.database:
            raise RuntimeError("Database not connected")
        return self.database

# Global database instance
database = Database()

async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance"""
    return database.get_database()

# Synchronous client for ML operations
def get_sync_client() -> MongoClient:
    """Get synchronous MongoDB client for ML operations"""
    return MongoClient(settings.MONGODB_URL)

def get_sync_database():
    """Get synchronous database instance"""
    client = get_sync_client()
    return client[settings.MONGODB_DATABASE]
