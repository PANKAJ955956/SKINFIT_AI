import os
import json
from typing import List, Dict, Any, Optional
import numpy as np
from app.rag.embeddings import BaseEmbeddingProvider, get_embedding_provider
from app.core.config import settings


class BaseVectorStore:
    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        raise NotImplementedError

    def similarity_search_with_score(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        raise NotImplementedError


class InMemoryVectorStore(BaseVectorStore):
    """Zero-dependency robust in-memory vector store with cosine similarity."""
    def __init__(self, embedding_provider: BaseEmbeddingProvider):
        self.embedding_provider = embedding_provider
        self.vectors: List[np.ndarray] = []
        self.texts: List[str] = []
        self.metadatas: List[Dict[str, Any]] = []
        self.ids: List[str] = []

    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        embeddings = self.embedding_provider.embed_documents(texts)
        for doc_id, text, meta, emb in zip(ids, texts, metadatas, embeddings):
            self.ids.append(doc_id)
            self.texts.append(text)
            self.metadatas.append(meta)
            self.vectors.append(np.array(emb, dtype=np.float32))

    def similarity_search_with_score(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        if not self.vectors:
            return []
            
        q_emb = np.array(self.embedding_provider.embed_query(query), dtype=np.float32)
        q_norm = np.linalg.norm(q_emb)
        if q_norm < 1e-6:
            return []
            
        scores = []
        for i, doc_vec in enumerate(self.vectors):
            d_norm = np.linalg.norm(doc_vec)
            if d_norm < 1e-6:
                cos_sim = 0.0
            else:
                cos_sim = float(np.dot(q_emb, doc_vec) / (q_norm * d_norm))
            scores.append((cos_sim, i))

        # Sort descending by cosine similarity
        scores.sort(key=lambda x: x[0], reverse=True)
        top_k = scores[:k]

        results = []
        for score, idx in top_k:
            results.append({
                "id": self.ids[idx],
                "text": self.texts[idx],
                "metadata": self.metadatas[idx],
                "score": round(score, 4)
            })
        return results


class ChromaVectorStore(BaseVectorStore):
    """Persistent or remote ChromaDB vector store with in-memory fallback."""
    def __init__(self, embedding_provider: BaseEmbeddingProvider):
        self.embedding_provider = embedding_provider
        self._fallback = InMemoryVectorStore(embedding_provider)
        self.client = None
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            if settings.CHROMA_HOST:
                self.client = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
            else:
                self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)
            self.collection = self.client.get_or_create_collection("skinfit_knowledge")
        except Exception as e:
            # Fall back to in-memory store smoothly
            self.client = None
            self.collection = None

    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        # Keep fallback updated
        self._fallback.add_documents(texts, metadatas, ids)
        if self.collection:
            try:
                embeddings = self.embedding_provider.embed_documents(texts)
                self.collection.upsert(
                    ids=ids,
                    documents=texts,
                    metadatas=metadatas,
                    embeddings=embeddings
                )
            except Exception:
                pass

    def similarity_search_with_score(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        if self.collection:
            try:
                q_emb = self.embedding_provider.embed_query(query)
                results = self.collection.query(
                    query_embeddings=[q_emb],
                    n_results=k
                )
                formatted = []
                if results and "documents" in results and results["documents"]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
                    ids = results["ids"][0] if "ids" in results else [""] * len(docs)
                    distances = results["distances"][0] if "distances" in results and results["distances"] else [0.0] * len(docs)
                    
                    for doc, meta, doc_id, dist in zip(docs, metas, ids, distances):
                        # Convert distance to similarity score
                        sim = max(0.0, 1.0 - dist)
                        formatted.append({
                            "id": doc_id,
                            "text": doc,
                            "metadata": meta,
                            "score": round(sim, 4)
                        })
                    return formatted
            except Exception:
                pass
                
        return self._fallback.similarity_search_with_score(query, k=k)


_vector_store_instance: Optional[BaseVectorStore] = None


def get_vector_store() -> BaseVectorStore:
    global _vector_store_instance
    if _vector_store_instance is None:
        emb = get_embedding_provider()
        if settings.VECTOR_STORE == "chroma":
            _vector_store_instance = ChromaVectorStore(emb)
        else:
            _vector_store_instance = InMemoryVectorStore(emb)
    return _vector_store_instance
