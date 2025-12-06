"""
Pydantic models for image classification
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class FreshnessLevel(str, Enum):
    """Food freshness levels"""
    FRESH = "fresh"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    SPOILED = "spoiled"

class FoodCategory(str, Enum):
    """Food categories for classification"""
    FRUITS = "fruits"
    VEGETABLES = "vegetables"
    DAIRY = "dairy"
    MEAT = "meat"
    SEAFOOD = "seafood"
    BAKERY = "bakery"
    GRAINS = "grains"
    BEVERAGES = "beverages"
    SNACKS = "snacks"
    OTHER = "other"

class ImageClassificationRequest(BaseModel):
    """Request model for image classification"""
    
    image_data: str = Field(
        ..., 
        description="Base64 encoded image data or image URL"
    )
    image_type: str = Field(
        "base64", 
        description="Type of image data (base64, url, file_path)"
    )
    expected_category: Optional[FoodCategory] = Field(
        None, 
        description="Expected food category for validation"
    )
    include_confidence_scores: bool = Field(
        True, 
        description="Whether to include confidence scores for all categories"
    )
    include_freshness_analysis: bool = Field(
        True, 
        description="Whether to include detailed freshness analysis"
    )
    
    @validator('image_data')
    def validate_image_data(cls, v):
        """Validate image data is not empty"""
        if not v or not v.strip():
            raise ValueError('Image data cannot be empty')
        return v.strip()

class CategoryConfidence(BaseModel):
    """Confidence score for a food category"""
    
    category: FoodCategory = Field(..., description="Food category")
    confidence: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Confidence score for this category"
    )

class FreshnessAnalysis(BaseModel):
    """Detailed freshness analysis"""
    
    overall_freshness: FreshnessLevel = Field(..., description="Overall freshness level")
    freshness_score: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Numerical freshness score (0-1)"
    )
    spoilage_indicators: List[str] = Field(
        ..., 
        description="List of spoilage indicators detected"
    )
    quality_indicators: List[str] = Field(
        ..., 
        description="List of quality indicators detected"
    )
    estimated_days_remaining: Optional[int] = Field(
        None, 
        ge=0, 
        description="Estimated days until spoilage"
    )
    storage_recommendations: List[str] = Field(
        ..., 
        description="Storage recommendations based on analysis"
    )

class ImageClassificationResponse(BaseModel):
    """Response model for image classification"""
    
    predicted_category: FoodCategory = Field(..., description="Predicted food category")
    category_confidence: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Confidence score for the predicted category"
    )
    all_category_scores: Optional[List[CategoryConfidence]] = Field(
        None, 
        description="Confidence scores for all categories"
    )
    freshness_analysis: Optional[FreshnessAnalysis] = Field(
        None, 
        description="Detailed freshness analysis"
    )
    detected_objects: List[str] = Field(
        ..., 
        description="List of objects detected in the image"
    )
    image_quality: Dict[str, Any] = Field(
        ..., 
        description="Image quality metrics (brightness, contrast, etc.)"
    )
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")
    model_version: str = Field(..., description="Version of the ML model used")
    timestamp: datetime = Field(..., description="When this classification was generated")
    
    @validator('category_confidence')
    def validate_confidence(cls, v):
        """Validate confidence is between 0 and 1"""
        if not 0 <= v <= 1:
            raise ValueError('Category confidence must be between 0 and 1')
        return v

class BatchImageClassificationRequest(BaseModel):
    """Request model for batch image classification"""
    
    images: List[ImageClassificationRequest] = Field(
        ..., 
        min_items=1, 
        max_items=50,
        description="List of images to classify"
    )
    include_freshness_analysis: bool = Field(
        True, 
        description="Whether to include freshness analysis for all images"
    )

class BatchImageClassificationResponse(BaseModel):
    """Response model for batch image classification"""
    
    classifications: List[ImageClassificationResponse] = Field(
        ..., 
        description="List of classifications for each image"
    )
    batch_id: str = Field(..., description="Unique identifier for this batch")
    total_processing_time_ms: int = Field(..., description="Total processing time in milliseconds")
    timestamp: datetime = Field(..., description="When this batch was processed")
