import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import Base, async_engine
from app.api.v1 import (
    auth,
    users,
    skin,
    body,
    wellness,
    products,
    recommendations,
    assistant,
    progress,
    account,
)
from app.rag.retriever import retriever


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables exist
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Auto-index knowledge documents on startup
    try:
        retriever.ingest_documents()
    except Exception as e:
        print(f"Warning: RAG auto-ingest deferred: {e}")

    yield

    # Shutdown
    await async_engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SkinFit AI: Comprehensive Skin, Body & Wellness Analysis and Recommendation System",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve storage files securely
os.makedirs(settings.IMAGE_STORAGE_PATH, exist_ok=True)
app.mount("/storage", StaticFiles(directory=settings.IMAGE_STORAGE_PATH), name="storage")

# Include Routers under API_V1_STR
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(users.router, prefix=api_v1)
app.include_router(skin.router, prefix=api_v1)
app.include_router(body.router, prefix=api_v1)
app.include_router(wellness.router, prefix=api_v1)
app.include_router(products.router, prefix=api_v1)
app.include_router(recommendations.router, prefix=api_v1)
app.include_router(assistant.router, prefix=api_v1)
app.include_router(progress.router, prefix=api_v1)
app.include_router(account.router, prefix=api_v1)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "vector_store": settings.VECTOR_STORE
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to SkinFit AI API",
        "docs": "/docs",
        "health": "/health",
        "version": settings.VERSION
    }
