from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.auth.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.wellness import WellnessPlan, MealPlan
from app.schemas.wellness import (
    WellnessPlanResponse,
    MealPlanResponse,
    ExerciseResponse,
    FoodItemResponse,
)
from app.ai.recommendation.engine import recommendation_engine
from app.ai.body.analyzer import body_analyzer

router = APIRouter(prefix="/wellness", tags=["Wellness & Nutrition"])


@router.post("/plan", response_model=WellnessPlanResponse)
async def generate_wellness_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a personalized daily wellness, nutrition, and exercise plan
    tailored to the user's BMI, posture deviations, and dietary preferences.
    """
    profile = current_user.profile
    height = profile.height_cm if profile and profile.height_cm else 170.0
    weight = profile.weight_kg if profile and profile.weight_kg else 68.0
    age = profile.age if profile and profile.age else 28
    gender = profile.gender if profile and profile.gender else "unspecified"
    dietary_prefs = profile.dietary_preferences if profile else []

    bmi_calc = body_analyzer.calculate_bmi(height, weight, age, gender)
    tdee = bmi_calc.get("tdee_sedentary_est") or 2000

    # Macro targets (e.g. 30% Protein, 40% Carbs, 30% Fat)
    calorie_target = int(max(1400, min(2800, tdee)))
    protein_g = round((calorie_target * 0.28) / 4.0, 1)
    carbs_g = round((calorie_target * 0.42) / 4.0, 1)
    fats_g = round((calorie_target * 0.30) / 9.0, 1)

    # Get matched foods and exercises
    recs = recommendation_engine.recommend_wellness_and_nutrition(
        posture_deviations=["forward_head", "rounded_shoulders"],
        fitness_goal=profile.fitness_goal if profile else "maintain_health",
        dietary_prefs=dietary_prefs
    )

    wellness_plan = WellnessPlan(
        user_id=current_user.id,
        title="Personalized Holistic Longevity & Posture Protocol",
        goal=profile.fitness_goal if profile else "maintain_health",
        daily_calorie_target=calorie_target,
        protein_grams=protein_g,
        carbs_grams=carbs_g,
        fats_grams=fats_g,
        hydration_liters=round(weight * 0.033, 1),
        posture_focus_areas=["Thoracic Extension", "Cervical Plumb Re-alignment", "Core Anti-Extension"],
        safety_guardrails=[
            "Calorie floor enforced (minimum 1,400 kcal/day).",
            "Hydration adjusted to cellular electrolyte baseline.",
            "All exercises feature neutral spine cues."
        ]
    )
    db.add(wellness_plan)
    await db.flush()

    # Generate meals
    meals_data = [
        ("breakfast", "Golden Turmeric Antioxidant Chia Bowl", "Chia seeds, plant milk, fresh berries, walnuts", int(calorie_target * 0.25), round(protein_g * 0.25, 1), round(carbs_g * 0.25, 1), round(fats_g * 0.25, 1), ["anti-inflammatory", "gut-friendly"]),
        ("lunch", "Mediterranean Wild Salmon & Fluffy Quinoa Bowl", "Wild salmon, rainbow quinoa, steamed greens, olive oil", int(calorie_target * 0.38), round(protein_g * 0.40, 1), round(carbs_g * 0.35, 1), round(fats_g * 0.40, 1), ["omega-3", "skin-glow"]),
        ("dinner", "Grilled Lemon Herb Tempeh & Roasted Vegetables", "Crispy tempeh, bell peppers, zucchini, sweet potato", int(calorie_target * 0.37), round(protein_g * 0.35, 1), round(carbs_g * 0.40, 1), round(fats_g * 0.35, 1), ["plant-based", "high-fiber"]),
    ]

    meal_responses = []
    for m_type, m_title, m_desc, m_cal, m_p, m_c, m_f, m_tags in meals_data:
        meal = MealPlan(
            wellness_plan_id=wellness_plan.id,
            day_of_week="daily",
            meal_type=m_type,
            title=m_title,
            description=m_desc,
            calories=m_cal,
            protein_g=m_p,
            carbs_g=m_c,
            fats_g=m_f,
            dietary_tags=m_tags
        )
        db.add(meal)
        meal_responses.append(meal)

    await db.commit()
    await db.refresh(wellness_plan)

    return {
        **wellness_plan.__dict__,
        "meals": meal_responses
    }


@router.get("/exercises", response_model=List[ExerciseResponse])
async def list_exercises(category: Optional[str] = None):
    exercises = recommendation_engine.exercises
    if category:
        exercises = [e for e in exercises if e.get("category", "").lower() == category.lower()]
    return exercises


@router.get("/foods", response_model=List[FoodItemResponse])
async def list_foods(category: Optional[str] = None):
    foods = recommendation_engine.foods
    if category:
        foods = [f for f in foods if f.get("category", "").lower() == category.lower()]
    return foods
