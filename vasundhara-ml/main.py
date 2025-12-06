"""
Vasundhara ML Service
FastAPI service for food waste prediction and ML operations
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import logging
import os
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import get_database
from app.core.redis_client import get_redis
from app.models.expiry_prediction import ExpiryPredictionRequest, ExpiryPredictionResponse
from app.models.image_classification import ImageClassificationRequest, ImageClassificationResponse
from app.models.forecasting import (
    DemandForecastRequest,
    DemandForecastResponse,
    AnomalyDetectionRequest,
    AnomalyDetectionResponse,
)
from app.services.ml_service import MLService
from app.services.cache_service import CacheService
from app.services.monitoring_service import MonitoringService
from app.utils.auth import verify_token
from app.utils.logging import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize services
monitoring_service = MonitoringService()
ml_service = MLService(monitoring_service=monitoring_service)
cache_service = CacheService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Vasundhara ML Service...")
    await ml_service.initialize()
    logger.info("ML Service initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ML Service...")
    await ml_service.cleanup()
    logger.info("ML Service shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="Vasundhara ML Service",
    description="AI-powered food waste prediction and ML operations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    try:
        payload = verify_token(credentials.credentials)
        return payload
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Vasundhara ML Service",
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check ML model status
        model_status = await ml_service.get_model_status()
        
        # Check Redis connection
        redis_status = await cache_service.health_check()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "models": model_status,
            "cache": redis_status
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.get("/metrics")
async def get_metrics(current_user: dict = Depends(get_current_user)):
    """Expose lightweight inference and retraining metrics (admin only)."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    metrics_snapshot = await monitoring_service.get_metrics()
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "metrics": metrics_snapshot,
    }

@app.post("/predict-expiry", response_model=ExpiryPredictionResponse)
async def predict_expiry(
    request: ExpiryPredictionRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Predict food expiry date and spoilage probability curve
    
    This endpoint uses ML models to predict when food items will expire
    based on various factors like storage conditions, usage patterns, etc.
    """
    try:
        # Check cache first
        cache_key = f"expiry_prediction:{hash(str(request.dict()))}"
        cached_result = await cache_service.get(cache_key)
        
        if cached_result:
            logger.info(f"Cache hit for prediction: {cache_key}")
            return ExpiryPredictionResponse(**cached_result)
        
        # Generate prediction
        logger.info(f"Generating expiry prediction for: {request.product_name}")
        prediction = await ml_service.predict_expiry(request)
        
        # Cache the result
        background_tasks.add_task(
            cache_service.set,
            cache_key,
            prediction.dict(),
            ttl=3600  # 1 hour cache
        )
        
        return prediction
        
    except Exception as e:
        logger.error(f"Expiry prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/classify-image", response_model=ImageClassificationResponse)
async def classify_image(
    request: ImageClassificationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Classify food images for freshness detection
    
    Uses computer vision models to determine if food items are fresh or spoiled
    """
    try:
        # Check cache first
        cache_key = f"image_classification:{hash(request.image_data)}"
        cached_result = await cache_service.get(cache_key)
        
        if cached_result:
            logger.info(f"Cache hit for image classification: {cache_key}")
            return ImageClassificationResponse(**cached_result)
        
        # Generate classification
        logger.info("Generating image classification")
        classification = await ml_service.classify_image(request)
        
        # Cache the result
        background_tasks.add_task(
            cache_service.set,
            cache_key,
            classification.dict(),
            ttl=1800  # 30 minutes cache
        )
        
        return classification
        
    except Exception as e:
        logger.error(f"Image classification error: {e}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/suggest-recipes")
async def suggest_recipes(
    expiring_items: List[str],
    dietary_preferences: Optional[List[str]] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Suggest recipes based on expiring food items
    
    Uses NLP and recipe databases to suggest meals that prioritize
    soon-to-expire ingredients
    """
    try:
        logger.info(f"Suggesting recipes for expiring items: {expiring_items}")
        
        suggestions = await ml_service.suggest_recipes(
            expiring_items=expiring_items,
            dietary_preferences=dietary_preferences or [],
            user_id=current_user.get("user_id")
        )
        
        return {
            "suggestions": suggestions,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Recipe suggestion error: {e}")
        raise HTTPException(status_code=500, detail=f"Recipe suggestion failed: {str(e)}")


@app.post("/forecast-demand", response_model=DemandForecastResponse)
async def forecast_demand(
    request: DemandForecastRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Forecast demand for a given item using historic consumption data"""
    try:
        cache_key = f"demand_forecast:{hash(str(request.dict(exclude={"history"})))}:{hash(str(request.history[-3:]))}"
        cached_result = await cache_service.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for demand forecast: {cache_key}")
            return DemandForecastResponse(**cached_result)

        logger.info(
            "Generating demand forecast",
            extra={"item": request.item_name, "horizon": request.horizon_days},
        )
        forecast = await ml_service.forecast_demand(request)

        background_tasks.add_task(
            cache_service.set,
            cache_key,
            forecast.dict(),
            ttl=1800,
        )

        return forecast
    except Exception as e:
        logger.error(f"Demand forecast error: {e}")
        raise HTTPException(status_code=500, detail=f"Demand forecast failed: {str(e)}")


@app.post("/detect-anomalies", response_model=AnomalyDetectionResponse)
async def detect_anomalies(
    request: AnomalyDetectionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Detect anomalies for a monitored metric"""
    try:
        logger.info("Running anomaly detection", extra={"metric": request.metric_name})
        response = await ml_service.detect_anomalies(request)
        return response
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@app.get("/models/status")
async def get_models_status(current_user: dict = Depends(get_current_user)):
    """Get status of all ML models"""
    try:
        status = await ml_service.get_model_status()
        return status
    except Exception as e:
        logger.error(f"Model status error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get model status: {str(e)}")

@app.post("/models/retrain")
async def retrain_models(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Trigger model retraining (admin only)
    
    This endpoint should be restricted to admin users only
    """
    try:
        # Check if user is admin
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Start retraining in background
        background_tasks.add_task(
            ml_service.retrain_models,
            current_user.get("user_id")
        )
        
        return {
            "message": "Model retraining started",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Model retraining error: {e}")
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
