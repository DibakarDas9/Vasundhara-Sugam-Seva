"""
Logging configuration for ML service
"""

import logging
import sys
from pathlib import Path
from datetime import datetime

from app.core.config import settings

def setup_logging():
    """Setup logging configuration"""
    
    # Create logs directory
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure logging format
    log_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(log_format)
    root_logger.addHandler(console_handler)
    
    # File handler for all logs
    file_handler = logging.FileHandler(
        log_dir / f"vasundhara-ml-{datetime.now().strftime('%Y%m%d')}.log"
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(log_format)
    root_logger.addHandler(file_handler)
    
    # Error file handler
    error_handler = logging.FileHandler(
        log_dir / f"vasundhara-ml-errors-{datetime.now().strftime('%Y%m%d')}.log"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(log_format)
    root_logger.addHandler(error_handler)
    
    # ML specific logger
    ml_logger = logging.getLogger("vasundhara.ml")
    ml_logger.setLevel(logging.DEBUG)
    
    # ML model training logger
    training_handler = logging.FileHandler(
        log_dir / f"model-training-{datetime.now().strftime('%Y%m%d')}.log"
    )
    training_handler.setLevel(logging.INFO)
    training_handler.setFormatter(log_format)
    
    training_logger = logging.getLogger("vasundhara.ml.training")
    training_logger.addHandler(training_handler)
    training_logger.setLevel(logging.INFO)
    
    # Prediction logger
    prediction_handler = logging.FileHandler(
        log_dir / f"predictions-{datetime.now().strftime('%Y%m%d')}.log"
    )
    prediction_handler.setLevel(logging.INFO)
    prediction_handler.setFormatter(log_format)
    
    prediction_logger = logging.getLogger("vasundhara.ml.predictions")
    prediction_logger.addHandler(prediction_handler)
    prediction_logger.setLevel(logging.INFO)
    
    # Suppress some noisy loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("matplotlib").setLevel(logging.WARNING)
    
    # Log startup
    logger = logging.getLogger(__name__)
    logger.info("Logging configured successfully")
    logger.info(f"Log level: {settings.LOG_LEVEL}")
    logger.info(f"Log directory: {log_dir.absolute()}")

def get_logger(name: str) -> logging.Logger:
    """Get logger instance"""
    return logging.getLogger(f"vasundhara.ml.{name}")

class MLMetricsLogger:
    """Logger for ML metrics and performance"""
    
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.logger = get_logger(f"metrics.{model_name}")
    
    def log_prediction(self, input_data: dict, prediction: dict, processing_time_ms: int):
        """Log prediction details"""
        self.logger.info(
            f"Prediction - Model: {self.model_name}, "
            f"Processing time: {processing_time_ms}ms, "
            f"Input: {input_data}, "
            f"Output: {prediction}"
        )
    
    def log_training_metrics(self, epoch: int, metrics: dict):
        """Log training metrics"""
        self.logger.info(
            f"Training - Model: {self.model_name}, "
            f"Epoch: {epoch}, "
            f"Metrics: {metrics}"
        )
    
    def log_model_performance(self, test_metrics: dict):
        """Log model performance on test data"""
        self.logger.info(
            f"Performance - Model: {self.model_name}, "
            f"Test metrics: {test_metrics}"
        )
    
    def log_error(self, error: Exception, context: dict = None):
        """Log ML model errors"""
        self.logger.error(
            f"Error - Model: {self.model_name}, "
            f"Error: {str(error)}, "
            f"Context: {context or {}}"
        )
