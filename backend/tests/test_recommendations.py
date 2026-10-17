from app.ai.recommendation.engine import recommendation_engine


def test_recommend_skincare_concerns_match():
    recs = recommendation_engine.recommend_skincare(
        skin_type="oily",
        detected_concerns=["acne", "clogged_pores"],
        budget_tier="moderate"
    )
    assert len(recs) > 0
    # Top recommendation should have high match score and rationale
    top = recs[0]
    assert top["match_score"] >= 0.70
    assert "routine_step" in top
    assert len(top["rationale"]) > 0


def test_recommend_skincare_allergy_exclusion():
    # If user has allergy to salicylic acid, prod-002 should not be recommended
    recs = recommendation_engine.recommend_skincare(
        skin_type="oily",
        detected_concerns=["acne"],
        user_allergies=["salicylic acid"]
    )
    recommended_ids = [r["product_id"] for r in recs]
    assert "prod-002" not in recommended_ids


def test_recommend_wellness_posture():
    recs = recommendation_engine.recommend_wellness_and_nutrition(
        posture_deviations=["forward head posture", "rounded shoulders"],
        fitness_goal="posture_correction"
    )
    assert len(recs["corrective_exercises"]) > 0
    assert len(recs["recommended_foods"]) > 0
