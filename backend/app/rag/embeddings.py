import hashlib
import math
import numpy as np
from typing import List, Optional
from app.core.config import settings


class BaseEmbeddingProvider:
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError

    def embed_query(self, text: str) -> List[float]:
        raise NotImplementedError


class DeterministicLocalEmbeddingProvider(BaseEmbeddingProvider):
    """
    High-speed deterministic semantic hashing embedding generator (dim=128).
    Requires zero external network calls or heavy weights, guaranteeing instant local offline execution.
    Computes character n-grams and token hash bins normalized via L2 norm.
    """
    def __init__(self, dim: int = 128):
        self.dim = dim

    def _embed_single(self, text: str) -> List[float]:
        tokens = text.lower().split()
        vec = np.zeros(self.dim, dtype=np.float32)
        if not tokens:
            return vec.tolist()
            
        for i, token in enumerate(tokens):
            # Token hash binning
            h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dim
            val = (h % 100) / 50.0 - 1.0
            vec[idx] += val
            
            # Bigram hashing for local syntax
            if i > 0:
                bi = f"{tokens[i-1]}_{token}"
                bi_h = int(hashlib.sha256(bi.encode("utf-8")).hexdigest(), 16)
                bi_idx = bi_h % self.dim
                vec[bi_idx] += 0.5
                
        # L2 normalize
        norm = np.linalg.norm(vec)
        if norm > 1e-6:
            vec = vec / norm
        return [float(x) for x in vec]

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_single(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed_single(text)


class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        try:
            import httpx
            res = httpx.post(
                "https://api.openai.com/v1/embeddings",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"input": texts, "model": "text-embedding-3-small"},
                timeout=30.0
            )
            data = res.json()
            return [item["embedding"] for item in data["data"]]
        except Exception:
            # Fallback on failure
            return DeterministicLocalEmbeddingProvider().embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        docs = self.embed_documents([text])
        return docs[0] if docs else [0.0] * 128


def get_embedding_provider() -> BaseEmbeddingProvider:
    if settings.EMBEDDING_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return OpenAIEmbeddingProvider(settings.OPENAI_API_KEY)
    return DeterministicLocalEmbeddingProvider()
