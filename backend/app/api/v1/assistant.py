from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.auth.deps import get_current_user, get_optional_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.chat import ChatConversation, ChatMessage
from app.schemas.assistant import ChatRequest, ChatResponse, ChatMessageSchema, RAGIngestResponse
from app.rag.retriever import retriever
from app.llm.provider import get_llm_provider

router = APIRouter(prefix="", tags=["Conversational Assistant & RAG"])

SYSTEM_INSTRUCTION = (
    "You are SkinFit AI, an evidence-based digital health, skin analysis, and wellness coach. "
    "Provide clear, grounded, supportive advice based on dermatology science, posture ergonomics, and balanced nutrition. "
    "Do NOT prescribe prescription pharmaceuticals, fabricate lab values, or provide clinical diagnoses. "
    "Always highlight barrier restoration, sun protection, and ergonomic movement habits."
)


@router.post("/assistant/chat", response_model=ChatResponse)
async def chat_with_assistant(
    payload: ChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a user prompt to the RAG conversational assistant.
    Retrieves grounded evidence from clinical knowledge documents,
    calls the configured LLM provider, and appends citations.
    """
    # Find or create conversation
    conv_id = payload.conversation_id
    history_messages = []

    if current_user and conv_id:
        q = select(ChatConversation).where(
            ChatConversation.id == conv_id,
            ChatConversation.user_id == current_user.id
        ).options(selectinload(ChatConversation.messages))
        res = await db.execute(q)
        conv = res.scalar_one_or_none()
        if conv:
            for m in conv.messages:
                history_messages.append({"role": m.role, "content": m.content})
    elif current_user:
        conv = ChatConversation(user_id=current_user.id, title=payload.message[:50])
        db.add(conv)
        await db.flush()
        conv_id = conv.id
    else:
        conv_id = "guest-session"

    # RAG Retrieval
    passages = []
    citations = []
    if payload.include_rag:
        try:
            passages, citations = retriever.retrieve(payload.message, top_k=2)
        except Exception:
            passages, citations = [], []

    # Generate response
    provider = get_llm_provider()
    assistant_content = await provider.generate_response(
        prompt=payload.message,
        system_instruction=SYSTEM_INSTRUCTION,
        conversation_history=history_messages,
        rag_context=passages
    )

    # Persist messages if user is logged in
    if current_user and conv_id != "guest-session":
        user_msg = ChatMessage(conversation_id=conv_id, role="user", content=payload.message)
        bot_msg = ChatMessage(
            conversation_id=conv_id,
            role="assistant",
            content=assistant_content,
            citations=citations
        )
        db.add(user_msg)
        db.add(bot_msg)
        await db.commit()

    return ChatResponse(
        conversation_id=conv_id,
        message=ChatMessageSchema(
            role="assistant",
            content=assistant_content,
            citations=citations
        )
    )


@router.post("/rag/ingest", response_model=RAGIngestResponse)
async def trigger_rag_ingest():
    """Triggers indexing of approved markdown knowledge documents."""
    result = retriever.ingest_documents()
    return RAGIngestResponse(
        status=result["status"],
        documents_ingested=result["documents_ingested"],
        chunks_created=result["chunks_created"],
        vector_store=result.get("vector_store", "memory"),
        message="Knowledge repository successfully synchronized and embedded."
    )
