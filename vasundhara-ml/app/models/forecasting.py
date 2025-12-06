"""
Pydantic models for demand forecasting and anomaly detection
"""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, validator


class ForecastGranularity(str, Enum):
    """Supported forecast granularities"""

    DAILY = "daily"
    WEEKLY = "weekly"


class DemandDataPoint(BaseModel):
    """Historical demand or consumption data"""

    date: date = Field(..., description="Date of the observation")
    quantity: float = Field(..., ge=0, description="Units consumed or demanded")
    waste: Optional[float] = Field(0, ge=0, description="Units wasted on this date")
    notes: Optional[str] = Field(None, description="Optional context for this measurement")


class DemandForecastRequest(BaseModel):
    """Request payload for demand forecasting"""

    item_id: Optional[str] = Field(None, description="Unique item identifier")
    item_name: str = Field(..., description="Human friendly name for the item")
    location_id: Optional[str] = Field(None, description="Inventory location identifier")
    history: List[DemandDataPoint] = Field(
        ..., min_items=5, description="Chronological demand history"
    )
    horizon_days: int = Field(7, ge=1, le=30, description="Number of future days to forecast")
    granularity: ForecastGranularity = Field(
        ForecastGranularity.DAILY, description="Forecast interval granularity"
    )
    smoothing_window: Optional[int] = Field(
        None, ge=2, le=14, description="Rolling window for smoothing historic data"
    )
    include_uncertainty: bool = Field(
        True, description="Whether to include confidence bounds"
    )
    confidence_level: float = Field(
        0.8, ge=0.5, le=0.99, description="Confidence level for the forecast bounds"
    )

    @validator("history")
    def validate_dates_sorted(cls, v: List[DemandDataPoint]) -> List[DemandDataPoint]:
        dates = [point.date for point in v]
        if dates != sorted(dates):
            raise ValueError("History must be sorted by ascending date")
        return v


class ForecastedPoint(BaseModel):
    """Single forecasted data point"""

    date: date = Field(..., description="Forecast date")
    predicted_quantity: float = Field(..., ge=0, description="Forecast quantity")
    lower_bound: Optional[float] = Field(
        None, ge=0, description="Lower confidence bound"
    )
    upper_bound: Optional[float] = Field(
        None, ge=0, description="Upper confidence bound"
    )


class ForecastSummary(BaseModel):
    """Aggregated stats for the forecast run"""

    recent_average: float = Field(..., ge=0, description="Average of recent history")
    recent_trend: float = Field(..., description="Daily change estimate")
    data_points: int = Field(..., ge=1, description="Number of historic data points")
    model_version: str = Field(..., description="Version identifier for the forecasting logic")


class DemandForecastResponse(BaseModel):
    """Response payload for demand forecasting"""

    item_name: str = Field(..., description="Item name echoed from request")
    item_id: Optional[str] = Field(None, description="Item identifier")
    location_id: Optional[str] = Field(None, description="Location identifier")
    forecast: List[ForecastedPoint] = Field(..., description="Forecasted quantities")
    summary: ForecastSummary = Field(..., description="Forecast metadata and stats")
    generated_at: datetime = Field(..., description="Timestamp of generation")


class AnomalyDataPoint(BaseModel):
    """Metric data point for anomaly detection"""

    date: date = Field(..., description="Date of the observation")
    value: float = Field(..., description="Metric value for the date")
    context: Optional[Dict[str, str]] = Field(
        None, description="Optional metadata about the observation"
    )


class AnomalyDetectionRequest(BaseModel):
    """Request payload for anomaly detection"""

    metric_name: str = Field(..., description="Name of the metric monitored")
    series: List[AnomalyDataPoint] = Field(
        ..., min_items=5, description="Historic metric values"
    )
    sensitivity: float = Field(
        0.8, ge=0.1, le=0.99, description="Higher = more sensitive to spikes"
    )
    window_days: int = Field(7, ge=3, le=30, description="Rolling window for baseline")

    @validator("series")
    def validate_series_sorted(cls, v: List[AnomalyDataPoint]) -> List[AnomalyDataPoint]:
        dates = [point.date for point in v]
        if dates != sorted(dates):
            raise ValueError("Series must be sorted by ascending date")
        return v


class AnomalyPoint(BaseModel):
    """Detected anomaly output"""

    date: date = Field(..., description="Date flagged as anomalous")
    value: float = Field(..., description="Observed value")
    deviation_score: float = Field(
        ..., ge=0, description="Absolute z-score like deviation"
    )
    severity: str = Field(..., description="low, medium, or high severity")
    expected_range: Dict[str, float] = Field(
        ..., description="Expected min/max range for the window"
    )
    context: Optional[Dict[str, str]] = Field(None, description="Additional metadata")


class AnomalyDetectionResponse(BaseModel):
    """Response payload for anomaly detection"""

    metric_name: str = Field(..., description="Metric name")
    anomalies: List[AnomalyPoint] = Field(..., description="Detected anomalies")
    evaluated_points: int = Field(..., ge=0, description="Total points evaluated")
    baseline_mean: float = Field(..., description="Mean of historic data")
    baseline_std: float = Field(..., ge=0, description="Std deviation of historic data")
    generated_at: datetime = Field(..., description="Timestamp of the evaluation")
