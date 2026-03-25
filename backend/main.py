import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.quest import router as quest_router
from routers.chain import router as chain_router
from services.stats import get_stats

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title="Procedural Quest Writer API",
    description="AI-powered procedural quest generation for games",
    version="1.0.0",
)

# CORS middleware (allow all origins for demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Generation-Time-Ms", "X-Demo-Mode"],
)

# Include routers
app.include_router(quest_router)
app.include_router(chain_router)


@app.get("/")
async def root():
    return {"status": "ok", "message": "Procedural Quest Writer API"}


@app.get("/api/stats")
async def api_stats():
    """Return server-side generation statistics."""
    return get_stats()
