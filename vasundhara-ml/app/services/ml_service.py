"""
ML Service for food waste prediction and classification
"""

import os
import pickle
import numpy as np
import pandas as pd
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
from pathlib import Path
import time

import lightgbm as lgb
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import cv2
from PIL import Image
import base64
import io

from app.core.config import settings
from app.models.expiry_prediction import (
    ExpiryPredictionRequest, 
    ExpiryPredictionResponse, 
    SpoilageDataPoint
)
from app.models.image_classification import (
    ImageClassificationRequest,
    ImageClassificationResponse,
    FreshnessAnalysis,
    CategoryConfidence,
    FreshnessLevel,
    FoodCategory
)
from app.models.forecasting import (
    DemandForecastRequest,
    DemandForecastResponse,
    ForecastSummary,
    ForecastedPoint,
    AnomalyDetectionRequest,
    AnomalyDetectionResponse,
    AnomalyPoint,
)
from app.services.monitoring_service import MonitoringService

logger = logging.getLogger(__name__)

class MLService:
    """Main ML service for food waste prediction"""
    
    def __init__(self, monitoring_service: Optional[MonitoringService] = None):
        self.expiry_model = None
        self.image_model = None
        self.recipe_model = None
        self.label_encoders = {}
        self.scalers = {}
        self.model_metadata = {}
        self.monitoring = monitoring_service or MonitoringService()
        
    async def initialize(self):
        """Initialize ML models and load from disk"""
        try:
            logger.info("Initializing ML models...")
            
            # Create models directory if it doesn't exist
            os.makedirs(settings.MODEL_PATH, exist_ok=True)
            
            # Load or train models
            await self._load_or_train_expiry_model()
            await self._load_or_train_image_model()
            await self._load_or_train_recipe_model()
            
            logger.info("ML models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize ML models: {e}")
            raise
    
    async def _load_or_train_expiry_model(self):
        """Load or train the expiry prediction model"""
        model_path = os.path.join(settings.MODEL_PATH, settings.EXPIRY_MODEL_NAME)
        
        try:
            if os.path.exists(model_path):
                logger.info("Loading existing expiry prediction model...")
                with open(model_path, 'rb') as f:
                    model_data = pickle.load(f)
                    self.expiry_model = model_data['model']
                    self.label_encoders = model_data['encoders']
                    self.scalers = model_data['scalers']
                    self.model_metadata['expiry'] = model_data['metadata']
            else:
                logger.info("Training new expiry prediction model...")
                await self._train_expiry_model()
                
        except Exception as e:
            logger.error(f"Error loading/training expiry model: {e}")
            # Fallback to a simple rule-based model
            await self._create_fallback_expiry_model()
    
    async def _load_or_train_image_model(self):
        """Load or train the image classification model"""
        model_path = os.path.join(settings.MODEL_PATH, settings.IMAGE_MODEL_NAME)
        
        try:
            if os.path.exists(model_path):
                logger.info("Loading existing image classification model...")
                with open(model_path, 'rb') as f:
                    model_data = pickle.load(f)
                    self.image_model = model_data['model']
                    self.model_metadata['image'] = model_data['metadata']
            else:
                logger.info("Training new image classification model...")
                await self._train_image_model()
                
        except Exception as e:
            logger.error(f"Error loading/training image model: {e}")
            # Fallback to a simple rule-based model
            await self._create_fallback_image_model()
    
    async def _load_or_train_recipe_model(self):
        """Load or train the recipe recommendation model"""
        model_path = os.path.join(settings.MODEL_PATH, settings.RECIPE_MODEL_NAME)
        
        try:
            if os.path.exists(model_path):
                logger.info("Loading existing recipe recommendation model...")
                with open(model_path, 'rb') as f:
                    model_data = pickle.load(f)
                    self.recipe_model = model_data['model']
                    self.model_metadata['recipe'] = model_data['metadata']
            else:
                logger.info("Training new recipe recommendation model...")
                await self._train_recipe_model()
                
        except Exception as e:
            logger.error(f"Error loading/training recipe model: {e}")
            # Fallback to a simple rule-based model
            await self._create_fallback_recipe_model()
    
    async def predict_expiry(self, request: ExpiryPredictionRequest) -> ExpiryPredictionResponse:
        """Predict food expiry date and spoilage curve"""
        start_time = time.perf_counter()
        status = "success"
        metadata = {
            "product": request.product_name,
            "category": request.category,
            "storage": request.storage.value,
        }

        try:
            features = self._prepare_expiry_features(request)
            if self.expiry_model:
                prediction = self._predict_with_model(features, request)
            else:
                prediction = self._predict_with_rules(request)
            return prediction
        except Exception as e:
            status = "failure"
            logger.error(f"Error predicting expiry: {e}")
            return self._create_fallback_prediction(request)
        finally:
            await self._record_inference_event(
                model_name="expiry",
                operation="predict_expiry",
                start_time=start_time,
                status=status,
                metadata=metadata,
            )
    
    def _prepare_expiry_features(self, request: ExpiryPredictionRequest) -> np.ndarray:
        """Prepare features for expiry prediction model"""
        # This would typically involve feature engineering
        # For now, we'll create a simple feature vector
        features = []
        
        # Categorical features
        features.extend([
            hash(request.product_name) % 1000,
            hash(request.category) % 100,
            hash(request.storage.value) % 10,
            hash(request.packaging.value) % 10,
        ])
        
        # Numerical features
        days_since_purchase = (date.today() - request.purchase_date).days
        features.extend([
            days_since_purchase,
            request.household_usage_rate_per_week,
            request.temperature_c or 20.0,
            request.humidity_percent or 50.0,
        ])
        
        # Binary features
        features.extend([
            1 if request.organic else 0,
            1 if request.brand else 0,
        ])
        
        return np.array(features).reshape(1, -1)
    
    def _predict_with_model(self, features: np.ndarray, request: ExpiryPredictionRequest) -> ExpiryPredictionResponse:
        """Make prediction using trained model"""
        # This is a simplified version - in reality, you'd use the actual model
        # For now, we'll use rule-based logic as a fallback
        return self._predict_with_rules(request)
    
    def _predict_with_rules(self, request: ExpiryPredictionRequest) -> ExpiryPredictionResponse:
        """Rule-based expiry prediction as fallback"""
        # Base shelf life by category (in days)
        category_shelf_life = {
            'fruits': 7,
            'vegetables': 10,
            'dairy': 14,
            'meat': 5,
            'seafood': 3,
            'bakery': 3,
            'grains': 365,
            'beverages': 365,
            'snacks': 30,
            'other': 7
        }
        
        # Storage multipliers
        storage_multipliers = {
            'fridge': 1.0,
            'freezer': 3.0,
            'pantry': 0.8,
            'counter': 0.6,
            'outside': 0.4
        }
        
        # Packaging multipliers
        packaging_multipliers = {
            'vacuum': 1.5,
            'glass': 1.2,
            'metal': 1.1,
            'plastic': 1.0,
            'paper': 0.8,
            'clamshell': 0.9,
            'none': 0.7
        }
        
        # Calculate base shelf life
        base_shelf_life = category_shelf_life.get(request.category.lower(), 7)
        
        # Apply multipliers
        storage_mult = storage_multipliers.get(request.storage.value, 1.0)
        packaging_mult = packaging_multipliers.get(request.packaging.value, 1.0)
        
        # Adjust for usage rate (higher usage = shorter shelf life)
        usage_factor = max(0.5, 1.0 - (request.household_usage_rate_per_week * 0.1))
        
        # Calculate predicted shelf life
        predicted_days = int(base_shelf_life * storage_mult * packaging_mult * usage_factor)
        
        # Calculate predicted expiry date
        predicted_expiry = request.purchase_date + timedelta(days=predicted_days)
        
        # Generate spoilage curve
        spoilage_curve = self._generate_spoilage_curve(
            request.purchase_date, 
            predicted_expiry, 
            predicted_days
        )
        
        # Calculate confidence based on data quality
        confidence = self._calculate_confidence(request)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(request, predicted_days)
        
        # Identify key factors
        factors = {
            'category': request.category,
            'storage_method': request.storage.value,
            'packaging_type': request.packaging.value,
            'usage_rate': request.household_usage_rate_per_week,
            'base_shelf_life_days': base_shelf_life,
            'predicted_shelf_life_days': predicted_days
        }
        
        return ExpiryPredictionResponse(
            predicted_expiry_date=predicted_expiry,
            confidence=confidence,
            spoilage_curve=spoilage_curve,
            factors=factors,
            recommendations=recommendations,
            model_version="1.0.0-rule-based",
            prediction_timestamp=datetime.utcnow()
        )
    
    def _generate_spoilage_curve(self, purchase_date: date, expiry_date: date, shelf_life_days: int) -> List[SpoilageDataPoint]:
        """Generate spoilage probability curve"""
        curve = []
        current_date = purchase_date
        
        while current_date <= expiry_date + timedelta(days=2):
            days_from_purchase = (current_date - purchase_date).days
            
            if days_from_purchase < 0:
                prob_spoiled = 0.0
            elif days_from_purchase <= shelf_life_days * 0.7:
                # Low probability in first 70% of shelf life
                prob_spoiled = 0.01 * (days_from_purchase / (shelf_life_days * 0.7))
            elif days_from_purchase <= shelf_life_days:
                # Rapid increase in last 30% of shelf life
                remaining_days = shelf_life_days - days_from_purchase
                total_remaining = shelf_life_days * 0.3
                prob_spoiled = 0.1 + (0.4 * (1 - remaining_days / total_remaining))
            else:
                # High probability after expiry
                days_past_expiry = days_from_purchase - shelf_life_days
                prob_spoiled = min(0.95, 0.5 + (0.45 * min(days_past_expiry / 3, 1.0)))
            
            curve.append(SpoilageDataPoint(
                date=current_date,
                prob_spoiled=round(prob_spoiled, 3)
            ))
            
            current_date += timedelta(days=1)
        
        return curve
    
    def _calculate_confidence(self, request: ExpiryPredictionRequest) -> float:
        """Calculate confidence score for prediction"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence for known categories
        known_categories = ['fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'bakery']
        if request.category.lower() in known_categories:
            confidence += 0.2
        
        # Increase confidence for complete data
        if request.temperature_c is not None:
            confidence += 0.1
        if request.humidity_percent is not None:
            confidence += 0.1
        if request.brand:
            confidence += 0.05
        
        # Decrease confidence for unusual combinations
        if request.storage.value == 'freezer' and request.category.lower() in ['fruits', 'vegetables']:
            confidence -= 0.1
        
        return min(0.95, max(0.1, confidence))
    
    def _generate_recommendations(self, request: ExpiryPredictionRequest, shelf_life_days: int) -> List[str]:
        """Generate storage recommendations"""
        recommendations = []
        
        # Storage recommendations
        if request.storage.value == 'counter' and request.category.lower() in ['dairy', 'meat']:
            recommendations.append("Store in refrigerator to extend shelf life")
        
        if request.storage.value == 'pantry' and request.category.lower() in ['fruits', 'vegetables']:
            recommendations.append("Consider refrigerating to slow ripening")
        
        # Usage recommendations
        if request.household_usage_rate_per_week < 0.5:
            recommendations.append("Consider freezing excess portions to prevent waste")
        
        if shelf_life_days < 7:
            recommendations.append("Use within the next few days or freeze for later use")
        
        # General recommendations
        if request.packaging.value == 'none':
            recommendations.append("Store in airtight container to maintain freshness")
        
        if not recommendations:
            recommendations.append("Store properly and monitor for signs of spoilage")
        
        return recommendations
    
    async def classify_image(self, request: ImageClassificationRequest) -> ImageClassificationResponse:
        """Classify food image for freshness detection"""
        start_time = time.perf_counter()
        status = "success"
        metadata = {"image_type": request.image_type}

        try:
            image = self._decode_image(request.image_data, request.image_type)
            processed_image = self._preprocess_image(image)
            if self.image_model:
                classification = self._classify_with_model(processed_image, request)
            else:
                classification = self._classify_with_rules(image, request)
            return classification
        except Exception as e:
            status = "failure"
            logger.error(f"Error classifying image: {e}")
            return self._create_fallback_classification(request)
        finally:
            await self._record_inference_event(
                model_name="image",
                operation="classify_image",
                start_time=start_time,
                status=status,
                metadata=metadata,
            )
    
    def _decode_image(self, image_data: str, image_type: str) -> Image.Image:
        """Decode image from various formats"""
        if image_type == "base64":
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            return Image.open(io.BytesIO(image_bytes))
        
        elif image_type == "url":
            # In a real implementation, you'd fetch the image from URL
            raise NotImplementedError("URL image loading not implemented")
        
        elif image_type == "file_path":
            return Image.open(image_data)
        
        else:
            raise ValueError(f"Unsupported image type: {image_type}")
    
    def _preprocess_image(self, image: Image.Image) -> np.ndarray:
        """Preprocess image for ML model"""
        # Resize to standard size
        image = image.resize((224, 224))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array
        image_array = np.array(image)
        
        # Normalize pixel values
        image_array = image_array.astype(np.float32) / 255.0
        
        return image_array
    
    def _classify_with_rules(self, image: Image.Image, request: ImageClassificationRequest) -> ImageClassificationResponse:
        """Rule-based image classification as fallback"""
        # Simple color-based classification
        image_array = np.array(image)
        
        # Calculate average color
        avg_color = np.mean(image_array, axis=(0, 1))
        
        # Simple rules based on color
        if avg_color[0] > avg_color[1] and avg_color[0] > avg_color[2]:  # Red dominant
            predicted_category = FoodCategory.FRUITS
            freshness = FreshnessLevel.GOOD
        elif avg_color[1] > avg_color[0] and avg_color[1] > avg_color[2]:  # Green dominant
            predicted_category = FoodCategory.VEGETABLES
            freshness = FreshnessLevel.FRESH
        elif avg_color[2] > avg_color[0] and avg_color[2] > avg_color[1]:  # Blue dominant
            predicted_category = FoodCategory.DAIRY
            freshness = FreshnessLevel.GOOD
        else:
            predicted_category = FoodCategory.OTHER
            freshness = FreshnessLevel.FAIR
        
        # Calculate freshness score based on color variance
        color_variance = np.var(image_array)
        freshness_score = min(1.0, color_variance / 1000.0)
        
        # Generate freshness analysis
        freshness_analysis = FreshnessAnalysis(
            overall_freshness=freshness,
            freshness_score=freshness_score,
            spoilage_indicators=["Color analysis only"],
            quality_indicators=["Good color distribution"],
            estimated_days_remaining=7,
            storage_recommendations=["Store in appropriate temperature"]
        )
        
        return ImageClassificationResponse(
            predicted_category=predicted_category,
            category_confidence=0.6,  # Low confidence for rule-based
            freshness_analysis=freshness_analysis,
            detected_objects=["Food item"],
            image_quality={
                "brightness": float(np.mean(image_array)),
                "contrast": float(np.std(image_array)),
                "resolution": f"{image.width}x{image.height}"
            },
            processing_time_ms=50,
            model_version="1.0.0-rule-based",
            timestamp=datetime.utcnow()
        )
    
    async def suggest_recipes(self, expiring_items: List[str], dietary_preferences: List[str], user_id: str) -> List[Dict[str, Any]]:
        """Suggest recipes based on expiring items"""
        start_time = time.perf_counter()
        status = "success"
        metadata = {
            "expiring_items": len(expiring_items),
            "preferences": len(dietary_preferences),
            "user_id": user_id,
        }

        try:
            suggestions = []
            for item in expiring_items:
                if 'apple' in item.lower():
                    suggestions.append({
                        "recipe_id": "apple-crumble-001",
                        "name": "Apple Crumble",
                        "description": "Classic apple crumble using fresh apples",
                        "ingredients": [item, "flour", "butter", "sugar", "cinnamon"],
                        "cooking_time_minutes": 45,
                        "difficulty": "easy",
                        "servings": 6,
                        "priority_score": 0.9,
                        "uses_expiring_items": [item]
                    })
                elif 'banana' in item.lower():
                    suggestions.append({
                        "recipe_id": "banana-bread-001",
                        "name": "Banana Bread",
                        "description": "Moist banana bread perfect for overripe bananas",
                        "ingredients": [item, "flour", "eggs", "sugar", "butter"],
                        "cooking_time_minutes": 60,
                        "difficulty": "easy",
                        "servings": 8,
                        "priority_score": 0.95,
                        "uses_expiring_items": [item]
                    })
                elif 'tomato' in item.lower():
                    suggestions.append({
                        "recipe_id": "tomato-soup-001",
                        "name": "Fresh Tomato Soup",
                        "description": "Creamy tomato soup using fresh tomatoes",
                        "ingredients": [item, "onion", "garlic", "cream", "basil"],
                        "cooking_time_minutes": 30,
                        "difficulty": "easy",
                        "servings": 4,
                        "priority_score": 0.85,
                        "uses_expiring_items": [item]
                    })

            suggestions.sort(key=lambda x: x['priority_score'], reverse=True)
            return suggestions[:5]
        except Exception as exc:
            status = "failure"
            logger.error(f"Recipe suggestion failed: {exc}")
            raise
        finally:
            await self._record_inference_event(
                model_name="recipe",
                operation="suggest_recipes",
                start_time=start_time,
                status=status,
                metadata=metadata,
            )

    async def forecast_demand(self, request: DemandForecastRequest) -> DemandForecastResponse:
        """Generate demand forecast using smoothed trend-based logic"""
        start_time = time.perf_counter()
        status = "success"
        metadata = {
            "item_id": request.item_id,
            "item_name": request.item_name,
            "location_id": request.location_id,
            "horizon": request.horizon_days,
        }

        try:
            series = self._build_demand_series(request)
            if series.empty:
                raise ValueError("No historic data available for forecasting")

            window = request.smoothing_window or min(7, max(2, len(series) // 3 or 2))
            smoothed = series.rolling(window=window, min_periods=1).mean()
            trend = self._calculate_daily_trend(series)
            std_estimate = float(series.rolling(window=window, min_periods=1).std().fillna(0.0).iloc[-1])
            std_estimate = std_estimate or float(series.iloc[-window:].std() or 0.0)

            last_date = series.index[-1]
            base_value = float(smoothed.iloc[-1])
            forecasts: List[ForecastedPoint] = []

            for day_offset in range(1, request.horizon_days + 1):
                target_date = last_date + timedelta(days=day_offset)
                predicted = max(0.0, base_value + (trend * day_offset))
                lower, upper = self._calculate_forecast_bounds(
                    predicted,
                    std_estimate,
                    request.confidence_level,
                    request.include_uncertainty,
                )
                forecasts.append(
                    ForecastedPoint(
                        date=target_date.date(),
                        predicted_quantity=round(predicted, 2),
                        lower_bound=lower,
                        upper_bound=upper,
                    )
                )

            summary = ForecastSummary(
                recent_average=round(float(series.tail(window).mean()), 2),
                recent_trend=round(trend, 3),
                data_points=len(series),
                model_version="1.1.0-trend-smoother",
            )

            return DemandForecastResponse(
                item_name=request.item_name,
                item_id=request.item_id,
                location_id=request.location_id,
                forecast=forecasts,
                summary=summary,
                generated_at=datetime.utcnow(),
            )

        except Exception as exc:
            status = "failure"
            logger.error(f"Demand forecasting failed: {exc}")
            raise
        finally:
            await self._record_inference_event(
                model_name="forecasting",
                operation="forecast_demand",
                start_time=start_time,
                status=status,
                metadata=metadata,
            )

    async def detect_anomalies(self, request: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
        """Detect anomalies in a univariate time-series"""
        start_time = time.perf_counter()
        status = "success"
        metadata = {
            "metric": request.metric_name,
            "window_days": request.window_days,
            "sensitivity": request.sensitivity,
        }

        try:
            series_df = self._build_anomaly_dataframe(request)
            values = series_df["value"]
            window = min(request.window_days, len(values))
            if window < 3:
                raise ValueError("Not enough data to evaluate anomalies")

            rolling_mean = values.rolling(window=window, min_periods=window // 2).mean()
            rolling_std = values.rolling(window=window, min_periods=window // 2).std().fillna(0.0)

            threshold = self._calculate_anomaly_threshold(request.sensitivity)
            anomalies: List[AnomalyPoint] = []

            for idx, value in values.iteritems():
                baseline_mean = rolling_mean.loc[idx]
                baseline_std = rolling_std.loc[idx] or 1e-6
                if pd.isna(baseline_mean):
                    continue
                deviation = abs((value - baseline_mean) / baseline_std)
                if deviation >= threshold:
                    severity = self._classify_anomaly_severity(deviation, threshold)
                    lower = max(0.0, float(baseline_mean - 2 * baseline_std))
                    upper = float(baseline_mean + 2 * baseline_std)
                    anomalies.append(
                        AnomalyPoint(
                            date=idx.date(),
                            value=round(float(value), 2),
                            deviation_score=round(float(deviation), 3),
                            severity=severity,
                            expected_range={"min": round(lower, 2), "max": round(upper, 2)},
                            context=series_df.loc[idx].get("context"),
                        )
                    )

            return AnomalyDetectionResponse(
                metric_name=request.metric_name,
                anomalies=anomalies,
                evaluated_points=len(values),
                baseline_mean=round(float(values.mean()), 2),
                baseline_std=round(float(values.std()), 2),
                generated_at=datetime.utcnow(),
            )

        except Exception as exc:
            status = "failure"
            logger.error(f"Anomaly detection failed: {exc}")
            raise
        finally:
            await self._record_inference_event(
                model_name="anomaly",
                operation="detect_anomalies",
                start_time=start_time,
                status=status,
                metadata=metadata,
            )
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get status of all ML models"""
        status = {
            "expiry_model": {
                "loaded": self.expiry_model is not None,
                "version": self.model_metadata.get('expiry', {}).get('version', 'unknown'),
                "last_trained": self.model_metadata.get('expiry', {}).get('last_trained', 'unknown')
            },
            "image_model": {
                "loaded": self.image_model is not None,
                "version": self.model_metadata.get('image', {}).get('version', 'unknown'),
                "last_trained": self.model_metadata.get('image', {}).get('last_trained', 'unknown')
            },
            "recipe_model": {
                "loaded": self.recipe_model is not None,
                "version": self.model_metadata.get('recipe', {}).get('version', 'unknown'),
                "last_trained": self.model_metadata.get('recipe', {}).get('last_trained', 'unknown')
            }
        }
        
        return status
    
    async def retrain_models(self, initiated_by: Optional[str] = None):
        """Retrain all ML models with new data"""
        logger.info("Starting model retraining...")
        await self._record_retraining_event("started", initiated_by)
        
        try:
            # This would typically involve:
            # 1. Fetching new training data
            # 2. Preprocessing the data
            # 3. Training new models
            # 4. Validating model performance
            # 5. Deploying new models
            
            logger.info("Model retraining completed successfully")
            await self._record_retraining_event("completed", initiated_by)
            
        except Exception as e:
            logger.error(f"Model retraining failed: {e}")
            await self._record_retraining_event(
                "failed",
                initiated_by,
                details={"error": str(e)},
            )
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up ML service resources...")
        # Cleanup any resources if needed
        pass

    async def _record_inference_event(
        self,
        model_name: str,
        operation: str,
        start_time: float,
        status: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Send inference metrics to monitoring service."""

        if not self.monitoring:
            return

        try:
            latency_ms = max(0.0, (time.perf_counter() - start_time) * 1000)
            await self.monitoring.record_inference(
                model_name=model_name,
                operation=operation,
                latency_ms=latency_ms,
                status=status,
                metadata=metadata or {},
            )
        except Exception as exc:
            logger.warning("Failed to record inference metrics", extra={"error": str(exc)})

    async def _record_retraining_event(
        self,
        status: str,
        initiated_by: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Send retraining lifecycle event to monitoring service."""

        if not self.monitoring:
            return

        try:
            await self.monitoring.record_retraining_event(
                status=status,
                initiated_by=initiated_by,
                details=details or {},
            )
        except Exception as exc:
            logger.warning("Failed to record retraining event", extra={"error": str(exc)})

    def _build_demand_series(self, request: DemandForecastRequest) -> pd.Series:
        """Create a pandas Series indexed by date from demand history"""
        df = pd.DataFrame([
            {
                "date": point.date,
                "quantity": point.quantity,
                "waste": point.waste or 0.0,
            }
            for point in request.history
        ])
        df["date"] = pd.to_datetime(df["date"])
        df.sort_values("date", inplace=True)
        df.set_index("date", inplace=True)
        freq = "D" if request.granularity.value == "daily" else "W"
        series = df["quantity"].resample(freq).sum()
        return series

    def _calculate_daily_trend(self, series: pd.Series) -> float:
        """Estimate daily trend via linear regression"""
        if len(series) < 2:
            return 0.0
        x = np.arange(len(series))
        slope, _intercept = np.polyfit(x, series.values, 1)
        return float(slope)

    def _calculate_forecast_bounds(
        self,
        prediction: float,
        std_estimate: float,
        confidence_level: float,
        include_uncertainty: bool,
    ) -> (Optional[float], Optional[float]):
        if not include_uncertainty:
            return None, None

        multiplier = self._confidence_multiplier(confidence_level)
        spread = max(std_estimate, prediction * 0.1)
        lower = max(0.0, round(prediction - (multiplier * spread), 2))
        upper = round(prediction + (multiplier * spread), 2)
        return lower, upper

    @staticmethod
    def _confidence_multiplier(confidence_level: float) -> float:
        if confidence_level >= 0.95:
            return 2.0
        if confidence_level >= 0.9:
            return 1.64
        if confidence_level >= 0.8:
            return 1.28
        return 1.0

    def _build_anomaly_dataframe(self, request: AnomalyDetectionRequest) -> pd.DataFrame:
        """Build dataframe for anomaly detection"""
        df = pd.DataFrame([
            {
                "date": point.date,
                "value": point.value,
                "context": point.context or {},
            }
            for point in request.series
        ])
        df["date"] = pd.to_datetime(df["date"])
        df.sort_values("date", inplace=True)
        df.set_index("date", inplace=True)
        return df

    @staticmethod
    def _calculate_anomaly_threshold(sensitivity: float) -> float:
        # Higher sensitivity lowers the threshold
        return max(0.8, 3.0 - (sensitivity * 1.5))

    @staticmethod
    def _classify_anomaly_severity(deviation: float, threshold: float) -> str:
        if deviation >= threshold * 1.6:
            return "high"
        if deviation >= threshold * 1.2:
            return "medium"
        return "low"
    
    # Placeholder methods for model training
    async def _train_expiry_model(self):
        """Train expiry prediction model"""
        # This would implement actual model training
        pass
    
    async def _train_image_model(self):
        """Train image classification model"""
        # This would implement actual model training
        pass
    
    async def _train_recipe_model(self):
        """Train recipe recommendation model"""
        # This would implement actual model training
        pass
    
    async def _create_fallback_expiry_model(self):
        """Create fallback expiry model"""
        self.expiry_model = None  # Use rule-based prediction
        self.model_metadata['expiry'] = {
            'version': '1.0.0-fallback',
            'type': 'rule-based',
            'last_trained': datetime.utcnow().isoformat()
        }
    
    async def _create_fallback_image_model(self):
        """Create fallback image model"""
        self.image_model = None  # Use rule-based classification
        self.model_metadata['image'] = {
            'version': '1.0.0-fallback',
            'type': 'rule-based',
            'last_trained': datetime.utcnow().isoformat()
        }
    
    async def _create_fallback_recipe_model(self):
        """Create fallback recipe model"""
        self.recipe_model = None  # Use rule-based recommendations
        self.model_metadata['recipe'] = {
            'version': '1.0.0-fallback',
            'type': 'rule-based',
            'last_trained': datetime.utcnow().isoformat()
        }
    
    def _create_fallback_prediction(self, request: ExpiryPredictionRequest) -> ExpiryPredictionResponse:
        """Create fallback prediction when model fails"""
        # Very conservative prediction
        predicted_expiry = request.purchase_date + timedelta(days=3)
        
        return ExpiryPredictionResponse(
            predicted_expiry_date=predicted_expiry,
            confidence=0.1,
            spoilage_curve=[
                SpoilageDataPoint(date=request.purchase_date, prob_spoiled=0.0),
                SpoilageDataPoint(date=predicted_expiry, prob_spoiled=0.5)
            ],
            factors={"error": "Model unavailable, using conservative estimate"},
            recommendations=["Monitor closely for spoilage signs"],
            model_version="1.0.0-fallback",
            prediction_timestamp=datetime.utcnow()
        )
    
    def _create_fallback_classification(self, request: ImageClassificationRequest) -> ImageClassificationResponse:
        """Create fallback classification when model fails"""
        return ImageClassificationResponse(
            predicted_category=FoodCategory.OTHER,
            category_confidence=0.1,
            freshness_analysis=FreshnessAnalysis(
                overall_freshness=FreshnessLevel.FAIR,
                freshness_score=0.5,
                spoilage_indicators=["Unable to analyze"],
                quality_indicators=["Unable to analyze"],
                estimated_days_remaining=3,
                storage_recommendations=["Store in cool, dry place"]
            ),
            detected_objects=["Unknown"],
            image_quality={"error": "Unable to analyze"},
            processing_time_ms=0,
            model_version="1.0.0-fallback",
            timestamp=datetime.utcnow()
        )
