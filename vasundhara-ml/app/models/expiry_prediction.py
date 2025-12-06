"""
Pydantic models for expiry prediction
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from enum import Enum

class StorageType(str, Enum):
    """Food storage types"""
    FRIDGE = "fridge"
    FREEZER = "freezer"
    PANTRY = "pantry"
    COUNTER = "counter"
    OUTSIDE = "outside"

class PackagingType(str, Enum):
    """Food packaging types"""
    PLASTIC = "plastic"
    GLASS = "glass"
    METAL = "metal"
    PAPER = "paper"
    CLAMSHELL = "clamshell"
    VACUUM = "vacuum"
    NONE = "none"

class ExpiryPredictionRequest(BaseModel):
    """Request model for expiry prediction"""
    
    product_name: str = Field(..., description="Name of the food product")
    category: str = Field(..., description="Food category (e.g., fruits, vegetables, dairy)")
    purchase_date: date = Field(..., description="Date when the product was purchased")
    storage: StorageType = Field(..., description="Storage method")
    packaging: PackagingType = Field(..., description="Packaging type")
    household_usage_rate_per_week: float = Field(
        ..., 
        ge=0.0, 
        le=7.0, 
        description="Expected usage rate per week (0-7 times)"
    )
    temperature_c: Optional[float] = Field(
        None, 
        ge=-20, 
        le=50, 
        description="Storage temperature in Celsius"
    )
    humidity_percent: Optional[float] = Field(
        None, 
        ge=0, 
        le=100, 
        description="Storage humidity percentage"
    )
    brand: Optional[str] = Field(None, description="Product brand")
    origin_country: Optional[str] = Field(None, description="Country of origin")
    organic: Optional[bool] = Field(None, description="Whether the product is organic")
    processing_level: Optional[str] = Field(
        None, 
        description="Processing level (raw, processed, cooked, etc.)"
    )
    
    @validator('purchase_date')
    def validate_purchase_date(cls, v):
        """Validate purchase date is not in the future"""
        if v > date.today():
            raise ValueError('Purchase date cannot be in the future')
        return v
    
    @validator('household_usage_rate_per_week')
    def validate_usage_rate(cls, v):
        """Validate usage rate is reasonable"""
        if v < 0:
            raise ValueError('Usage rate cannot be negative')
        if v > 7:
            raise ValueError('Usage rate cannot exceed 7 times per week')
        return v

class SpoilageDataPoint(BaseModel):
    """Single data point in spoilage curve"""
    
    date: date = Field(..., description="Date for this prediction")
    prob_spoiled: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Probability of being spoiled on this date"
    )

class ExpiryPredictionResponse(BaseModel):
    """Response model for expiry prediction"""
    
    predicted_expiry_date: date = Field(..., description="Predicted expiry date")
    confidence: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Confidence score for the prediction"
    )
    spoilage_curve: List[SpoilageDataPoint] = Field(
        ..., 
        description="Probability curve of spoilage over time"
    )
    factors: Dict[str, Any] = Field(
        ..., 
        description="Key factors influencing the prediction"
    )
    recommendations: List[str] = Field(
        ..., 
        description="Recommendations to extend shelf life"
    )
    model_version: str = Field(..., description="Version of the ML model used")
    prediction_timestamp: datetime = Field(
        ..., 
        description="When this prediction was generated"
    )
    
    @validator('confidence')
    def validate_confidence(cls, v):
        """Validate confidence is between 0 and 1"""
        if not 0 <= v <= 1:
            raise ValueError('Confidence must be between 0 and 1')
        return v
    
    @validator('spoilage_curve')
    def validate_spoilage_curve(cls, v):
        """Validate spoilage curve is properly ordered"""
        if not v:
            raise ValueError('Spoilage curve cannot be empty')
        
        # Check that dates are in ascending order
        dates = [point.date for point in v]
        if dates != sorted(dates):
            raise ValueError('Spoilage curve dates must be in ascending order')
        
        # Check that probabilities are non-decreasing
        probs = [point.prob_spoiled for point in v]
        for i in range(1, len(probs)):
            if probs[i] < probs[i-1]:
                raise ValueError('Spoilage probabilities must be non-decreasing')
        
        return v

class BatchExpiryPredictionRequest(BaseModel):
    """Request model for batch expiry predictions"""
    
    items: List[ExpiryPredictionRequest] = Field(
        ..., 
        min_items=1, 
        max_items=100,
        description="List of items to predict"
    )
    include_recommendations: bool = Field(
        True, 
        description="Whether to include recommendations"
    )

class BatchExpiryPredictionResponse(BaseModel):
    """Response model for batch expiry predictions"""
    
    predictions: List[ExpiryPredictionResponse] = Field(
        ..., 
        description="List of predictions for each item"
    )
    batch_id: str = Field(..., description="Unique identifier for this batch")
    processing_time_ms: int = Field(..., description="Total processing time in milliseconds")
    timestamp: datetime = Field(..., description="When this batch was processed")
