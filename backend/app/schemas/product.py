from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ProductResponse(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    subcategory: str
    price: float
    currency: str
    rating: float
    review_count: int
    description: str
    ingredients: List[str] = Field(default_factory=list)
    skin_types: List[str] = Field(default_factory=list)
    target_concerns: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    affiliate_url: str
    image_url: str
    is_demo: bool

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    match_score: float
    rationale: str
    routine_step: Optional[str] = None
    category: str
    safety_notes: List[str] = Field(default_factory=list)
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class RecommendationFeedbackRequest(BaseModel):
    recommendation_id: str
    rating: Optional[int] = Field(None, ge=1, le=5)
    is_helpful: bool = True
    feedback_text: Optional[str] = None
