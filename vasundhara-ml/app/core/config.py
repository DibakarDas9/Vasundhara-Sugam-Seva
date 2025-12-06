"""
Configuration settings for the ML service
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Vasundhara ML Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API
    API_V1_STR: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
        "https://vasundhara.app"
    ]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "vasundhara"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_DB: int = 0
    
    # ML Models
    MODEL_PATH: str = "./models"
    EXPIRY_MODEL_NAME: str = "expiry_prediction_model.pkl"
    IMAGE_MODEL_NAME: str = "image_classification_model.pkl"
    RECIPE_MODEL_NAME: str = "recipe_recommendation_model.pkl"
    
    # Model Training
    TRAINING_DATA_PATH: str = "./data/training"
    VALIDATION_DATA_PATH: str = "./data/validation"
    BATCH_SIZE: int = 32
    EPOCHS: int = 100
    LEARNING_RATE: float = 0.001
    
    # Cache
    CACHE_TTL: int = 3600  # 1 hour
    CACHE_PREFIX: str = "vasundhara:ml:"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # External Services
    API_SERVICE_URL: str = "http://localhost:5000"
    S3_BUCKET: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()
