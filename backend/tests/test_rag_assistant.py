import pytest
from app.rag.retriever import retriever
from app.llm.provider import DeterministicLocalLLMProvider


def test_rag_document_ingestion():
    result = retriever.ingest_documents()
    assert result["status"] == "success"
    assert result["documents_ingested"] >= 4
    assert result["chunks_created"] >= 4


def test_rag_retrieval():
    passages, citations = retriever.retrieve("What is the function of ceramides and the skin barrier?", top_k=2)
    assert len(passages) > 0
    assert len(citations) > 0
    assert "source" in citations[0]


@pytest.mark.asyncio
async def test_assistant_local_fallback_safe():
    provider = DeterministicLocalLLMProvider()
    response = await provider.generate_response(
        prompt="Can you diagnose this skin disease?",
        system_instruction="You are SkinFit AI.",
        conversation_history=[],
        rag_context=[]
    )
    assert "diagnos" in response.lower()
    assert "disclaimer" in response.lower()
