import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.auth.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.product import Recommendation, RecommendationFeedback
from app.schemas.product import RecommendationResponse, RecommendationFeedbackRequest
from app.ai.recommendation.engine import recommendation_engine

router = APIRouter(prefix="/recommendations", tags=["Recommendation Engine"])


@router.post("", response_model=List[RecommendationResponse])
async def get_or_generate_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Computes personalized product recommendations using hybrid deterministic rules
    and content-based matching on user profile & concerns.
    """
    profile = current_user.profile
    skin_type = profile.self_reported_skin_type if profile and profile.self_reported_skin_type else "combination"
    concerns = profile.skin_concerns if profile and profile.skin_concerns else ["acne", "pigmentation"]
    allergies = profile.known_allergies if profile else []
    budget = profile.budget_tier if profile else "moderate"
    dietary_prefs = profile.dietary_preferences if profile else []

    recs = recommendation_engine.recommend_skincare(
        skin_type=skin_type,
        detected_concerns=concerns,
        user_allergies=allergies,
        budget_tier=budget,
        dietary_prefs=dietary_prefs
    )

    persisted_recs = []
    for r in recs:
        # Save to database
        db_rec = Recommendation(
            user_id=current_user.id,
            product_id=r["product_id"],
            match_score=r["match_score"],
            rationale=r["rationale"],
            routine_step=r["routine_step"],
            category=r["category"],
            safety_notes=r["safety_notes"]
        )
        db.add(db_rec)
        persisted_recs.append({
            "id": db_rec.id,
            "user_id": current_user.id,
            "product_id": r["product_id"],
            "match_score": r["match_score"],
            "rationale": r["rationale"],
            "routine_step": r["routine_step"],
            "category": r["category"],
            "safety_notes": r["safety_notes"],
            "created_at": db_rec.created_at,
            "product": r["product"]
        })

    await db.commit()
    return persisted_recs


@router.post("/feedback")
async def submit_recommendation_feedback(
    payload: RecommendationFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Stores user evaluation on recommendation utility."""
    feedback = RecommendationFeedback(
        recommendation_id=payload.recommendation_id,
        user_id=current_user.id,
        rating=payload.rating,
        is_helpful=payload.is_helpful,
        feedback_text=payload.feedback_text
    )
    db.add(feedback)
    await db.commit()
    return {"status": "success", "message": "Feedback recorded. Thank you for helping refine the recommendation models."}
