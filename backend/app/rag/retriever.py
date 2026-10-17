import glob
import os
import uuid
from typing import List, Dict, Any, Tuple
from app.rag.vector_store import get_vector_store
from app.core.config import settings

KNOWLEDGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data/knowledge"))


def split_text_into_chunks(text: str, chunk_size: int = 600, chunk_overlap: int = 100) -> List[str]:
    """Splits markdown text on section boundaries and paragraphs with overlap."""
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for p in paragraphs:
        p_clean = p.strip()
        if not p_clean:
            continue
        if len(current_chunk) + len(p_clean) < chunk_size:
            current_chunk = f"{current_chunk}\n\n{p_clean}".strip()
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = p_clean

    if current_chunk:
        chunks.append(current_chunk)

    # Handle rare cases of huge paragraphs
    refined_chunks = []
    for c in chunks:
        if len(c) > chunk_size * 1.5:
            start = 0
            while start < len(c):
                end = min(start + chunk_size, len(c))
                refined_chunks.append(c[start:end])
                start += chunk_size - chunk_overlap
        else:
            refined_chunks.append(c)

    return refined_chunks


class KnowledgeRetriever:
    """Manages document indexing and grounded knowledge retrieval for RAG."""

    def __init__(self):
        self.vector_store = get_vector_store()
        self.is_indexed = False

    def ingest_documents(self, knowledge_dir: str = KNOWLEDGE_DIR) -> Dict[str, Any]:
        """Ingests all markdown files from the approved knowledge directory."""
        if not os.path.exists(knowledge_dir):
            return {"documents_ingested": 0, "chunks_created": 0, "status": "directory_not_found"}

        md_files = glob.glob(os.path.join(knowledge_dir, "*.md"))
        all_texts = []
        all_metas = []
        all_ids = []

        total_chunks = 0
        for file_path in md_files:
            file_name = os.path.basename(file_path)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            chunks = split_text_into_chunks(content)
            for idx, chunk in enumerate(chunks):
                doc_id = f"{file_name}_chunk_{idx}_{uuid.uuid4().hex[:6]}"
                all_ids.append(doc_id)
                all_texts.append(chunk)
                all_metas.append({
                    "source": file_name,
                    "chunk_index": idx,
                    "char_count": len(chunk)
                })
                total_chunks += 1

        if all_texts:
            self.vector_store.add_documents(all_texts, all_metas, all_ids)
            self.is_indexed = True

        return {
            "documents_ingested": len(md_files),
            "chunks_created": total_chunks,
            "status": "success",
            "vector_store": settings.VECTOR_STORE
        }

    def retrieve(self, query: str, top_k: int = 3) -> Tuple[List[str], List[Dict[str, Any]]]:
        """
        Retrieves top relevant passages and extracts structured citations.
        Auto-ingests on first query if store is empty.
        """
        if not self.is_indexed:
            self.ingest_documents()

        matches = self.vector_store.similarity_search_with_score(query, k=top_k)
        passages = []
        citations = []

        for m in matches:
            passages.append(m["text"])
            citations.append({
                "source": m["metadata"].get("source", "SkinFit Clinical Knowledge"),
                "snippet": m["text"][:200] + ("..." if len(m["text"]) > 200 else ""),
                "relevance_score": m["score"]
            })

        return passages, citations


retriever = KnowledgeRetriever()
