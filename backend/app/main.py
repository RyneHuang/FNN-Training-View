"""FastAPI main application."""
import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.datasets import router as datasets_router
from app.api.training import router as training_router
from app.api.inference import router as inference_router
from app.middleware.session import SessionMiddleware

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 离线模式检查
OFFLINE_MODE = os.getenv('FNN_OFFLINE_MODE', 'true').lower() == 'true'
if OFFLINE_MODE:
    logger.info("Running in OFFLINE MODE - datasets will only load from cache")
else:
    logger.info("Running in ONLINE MODE - datasets will be downloaded if cache is missing")

# Create FastAPI app
app = FastAPI(
    title="FNN Training View API",
    description="Backend API for FNN Training and Inference Visualization",
    version="2.0.0"
)

# Add Session Middleware (必须在 CORS 之前添加)
app.add_middleware(SessionMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,  # 重要：允许 cookie
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(datasets_router)
app.include_router(training_router)
app.include_router(inference_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "FNN Training View API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
