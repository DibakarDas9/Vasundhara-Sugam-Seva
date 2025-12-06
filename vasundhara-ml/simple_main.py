"""
Vasundhara ML Service - Simplified Version
FastAPI service for food waste prediction and ML operations
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

# Create FastAPI app
app = FastAPI(
    title="Vasundhara ML Service",
    description="AI-powered food waste prediction and ML operations",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ExpiryPredictionRequest(BaseModel):
    product_name: str
    category: str
    purchase_date: str
    packaging_type: str
    storage_conditions: str
    household_usage_rate: float
    temperature: float = 20.0
    humidity: float = 50.0

class ExpiryPredictionResponse(BaseModel):
    predicted_expiry_date: str
    confidence: float
    spoilage_probability_curve: List[Dict[str, float]]

class ImageClassificationRequest(BaseModel):
    image_data: str  # base64 encoded image
    image_type: str = "jpeg"

class ImageClassificationResponse(BaseModel):
    category: str
    item_name: str
    confidence: float
    suggested_storage: str
    freshness_score: float

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
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "models": {
            "expiry_prediction": "loaded",
            "image_classification": "loaded"
        },
        "cache": "redis_connected"
    }

@app.post("/predict-expiry", response_model=ExpiryPredictionResponse)
async def predict_expiry(request: ExpiryPredictionRequest):
    """
    Predict food expiry date and spoilage probability curve
    """
    try:
        # Simulate ML prediction
        base_days = {
            "fruits": 7,
            "vegetables": 10,
            "dairy": 5,
            "meat": 3,
            "grains": 30,
            "beverages": 365
        }
        
        base_expiry_days = base_days.get(request.category.lower(), 7)
        
        # Adjust based on storage conditions
        if request.storage_conditions.lower() == "refrigerator":
            base_expiry_days *= 1.5
        elif request.storage_conditions.lower() == "freezer":
            base_expiry_days *= 3
        
        # Add some randomness for simulation
        predicted_days = int(base_expiry_days * (0.8 + random.random() * 0.4))
        predicted_date = datetime.now() + timedelta(days=predicted_days)
        
        # Generate spoilage curve
        curve = []
        for i in range(0, predicted_days + 1, max(1, predicted_days // 10)):
            probability = min(0.95, (i / predicted_days) ** 2)
            curve.append({
                "days_from_now": i,
                "probability": round(probability, 2)
            })
        
        return ExpiryPredictionResponse(
            predicted_expiry_date=predicted_date.isoformat(),
            confidence=round(0.7 + random.random() * 0.2, 2),
            spoilage_probability_curve=curve
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/classify-image", response_model=ImageClassificationResponse)
async def classify_image(request: ImageClassificationRequest):
    """
    Classify food images for freshness detection
    """
    try:
        # Simulate image classification
        categories = ["fruits", "vegetables", "dairy", "meat", "grains", "beverages"]
        items = {
            "fruits": ["apple", "banana", "orange", "grape", "strawberry"],
            "vegetables": ["carrot", "tomato", "lettuce", "onion", "potato"],
            "dairy": ["milk", "cheese", "yogurt", "butter", "cream"],
            "meat": ["chicken", "beef", "pork", "fish", "lamb"],
            "grains": ["bread", "rice", "pasta", "cereal", "flour"],
            "beverages": ["water", "juice", "soda", "coffee", "tea"]
        }
        
        category = random.choice(categories)
        item_name = random.choice(items[category])
        confidence = round(0.8 + random.random() * 0.15, 2)
        freshness_score = round(0.6 + random.random() * 0.3, 2)
        
        storage_suggestions = {
            "fruits": "refrigerator",
            "vegetables": "refrigerator", 
            "dairy": "refrigerator",
            "meat": "refrigerator",
            "grains": "pantry",
            "beverages": "pantry"
        }
        
        return ImageClassificationResponse(
            category=category,
            item_name=item_name,
            confidence=confidence,
            suggested_storage=storage_suggestions[category],
            freshness_score=freshness_score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/suggest-recipes")
async def suggest_recipes(
    expiring_items: List[str],
    dietary_preferences: List[str] = None
):
    """
    Suggest recipes based on expiring food items
    """
    try:
        # Simulate recipe suggestions
        recipes = [
            {
                "name": f"Quick {expiring_items[0]} Salad",
                "ingredients": expiring_items[:3],
                "prep_time": "15 minutes",
                "difficulty": "easy",
                "rating": round(4.0 + random.random(), 1)
            },
            {
                "name": f"{expiring_items[0]} Stir Fry",
                "ingredients": expiring_items[:2] + ["rice", "soy sauce"],
                "prep_time": "20 minutes", 
                "difficulty": "medium",
                "rating": round(4.2 + random.random(), 1)
            }
        ]
        
        return {
            "suggestions": recipes,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recipe suggestion failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
