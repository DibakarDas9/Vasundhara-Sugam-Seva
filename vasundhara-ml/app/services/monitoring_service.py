"""
Monitoring service for inference metrics and retraining events.
"""

from __future__ import annotations

import asyncio
from collections import defaultdict, deque
from datetime import datetime
from statistics import mean
from typing import Deque, Dict, Optional


class MonitoringService:
    """Capture lightweight metrics for ML inferences and retraining."""

    def __init__(self, max_inference_events: int = 250, max_retraining_events: int = 50):
        self._lock = asyncio.Lock()
        self._inference_events: Deque[Dict[str, object]] = deque(maxlen=max_inference_events)
        self._retraining_events: Deque[Dict[str, object]] = deque(maxlen=max_retraining_events)
        self._model_counts: Dict[str, int] = defaultdict(int)
        self._model_success: Dict[str, int] = defaultdict(int)
        self._model_failure: Dict[str, int] = defaultdict(int)
        self._latency_totals: Dict[str, float] = defaultdict(float)

    async def record_inference(
        self,
        model_name: str,
        operation: str,
        latency_ms: float,
        status: str,
        metadata: Optional[Dict[str, object]] = None,
    ) -> None:
        """Record an inference event for later aggregation."""

        event = {
            "model": model_name,
            "operation": operation,
            "latency_ms": round(latency_ms, 2),
            "status": status,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow().isoformat(),
        }

        async with self._lock:
            self._inference_events.append(event)
            self._model_counts[model_name] += 1
            self._latency_totals[model_name] += latency_ms
            if status == "success":
                self._model_success[model_name] += 1
            else:
                self._model_failure[model_name] += 1

    async def record_retraining_event(
        self,
        status: str,
        initiated_by: Optional[str] = None,
        details: Optional[Dict[str, object]] = None,
    ) -> None:
        """Record a retraining lifecycle event."""

        event = {
            "status": status,
            "initiated_by": initiated_by,
            "details": details or {},
            "timestamp": datetime.utcnow().isoformat(),
        }

        async with self._lock:
            self._retraining_events.append(event)

    async def get_metrics(self) -> Dict[str, object]:
        """Return aggregated metrics snapshot."""

        async with self._lock:
            model_metrics = {}
            for model, count in self._model_counts.items():
                latency_list = [evt["latency_ms"] for evt in self._inference_events if evt["model"] == model]
                avg_latency = round(mean(latency_list), 2) if latency_list else 0.0
                success = self._model_success.get(model, 0)
                failure = self._model_failure.get(model, 0)
                total = count or 1
                success_rate = round(success / total, 3)
                model_metrics[model] = {
                    "count": count,
                    "success": success,
                    "failure": failure,
                    "success_rate": success_rate,
                    "avg_latency_ms": avg_latency,
                }

            return {
                "models": model_metrics,
                "recent_inferences": list(self._inference_events),
                "recent_retraining_events": list(self._retraining_events),
            }
