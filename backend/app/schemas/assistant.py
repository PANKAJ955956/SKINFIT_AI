from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class Citation(BaseModel):
    source: str
    snippet: str
    relevance_score: Optional[float] = None


class ChatMessageSchema(BaseModel):
    id: Optional[str] = None
    role: str  # "user", "assistant", "system"
    content: str
    citations: List[Citation] = Field(default_factory=list)
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None
    include_rag: bool = True


class ChatResponse(BaseModel):
    conversation_id: str
    message: ChatMessageSchema
    disclaimer: str = "SkinFit AI provides educational wellness guidance, not clinical medical diagnoses."


class RAGIngestResponse(BaseModel):
    status: str
    documents_ingested: int
    chunks_created: int
    vector_store: str
    message: str
