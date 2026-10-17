import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, Integer, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Product(Base):
    __tablename__ = "products"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # "skincare", "nutrition", "fitness"
    subcategory = Column(String(100), nullable=False)  # "cleanser", "serum", "protein", "equipment"
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    description = Column(Text, nullable=False)
    ingredients = Column(JSON, default=list)
    skin_types = Column(JSON, default=list)
    target_concerns = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    affiliate_url = Column(String(500), nullable=False)
    image_url = Column(String(500), default="/products/placeholder.jpg")
    is_demo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    recommendations = relationship("Recommendation", back_populates="product", cascade="all, delete-orphan")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)

    match_score = Column(Float, nullable=False, default=0.85)  # 0.0 to 1.0
    rationale = Column(Text, nullable=False)
    routine_step = Column(String(50), nullable=True)  # "AM Step 1: Cleanse", "PM Step 2: Active Treatment"
    category = Column(String(50), default="skincare")
    safety_notes = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="recommendations")
    product = relationship("Product", back_populates="recommendations")
    feedbacks = relationship("RecommendationFeedback", back_populates="recommendation", cascade="all, delete-orphan")


class RecommendationFeedback(Base):
    __tablename__ = "recommendation_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recommendation_id = Column(String(36), ForeignKey("recommendations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    rating = Column(Integer, nullable=True)  # 1 to 5
    is_helpful = Column(Boolean, default=True)
    feedback_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    recommendation = relationship("Recommendation", back_populates="feedbacks")
