from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class MealPlanResponse(BaseModel):
    id: str
    day_of_week: str
    meal_type: str
    title: str
    description: Optional[str] = None
    calories: int
    protein_g: float
    carbs_g: float
    fats_g: float
    dietary_tags: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True


class WellnessPlanResponse(BaseModel):
    id: str
    user_id: str
    title: str
    goal: str
    daily_calorie_target: int
    protein_grams: float
    carbs_grams: float
    fats_grams: float
    hydration_liters: float
    posture_focus_areas: List[str] = Field(default_factory=list)
    safety_guardrails: List[str] = Field(default_factory=list)
    is_active: bool
    created_at: datetime
    meals: List[MealPlanResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ExerciseResponse(BaseModel):
    id: str
    name: str
    category: str
    target_muscle: str
    difficulty: str
    equipment: str
    duration_seconds: int
    calories_burned_est: int
    instructions: List[str] = Field(default_factory=list)
    posture_benefit: Optional[str] = None

    class Config:
        from_attributes = True


class FoodItemResponse(BaseModel):
    id: str
    name: str
    category: str
    calories: int
    protein_g: float
    carbs_g: float
    fats_g: float
    fiber_g: float
    micronutrients: List[str] = Field(default_factory=list)
    dietary_flags: List[str] = Field(default_factory=list)
    skin_wellness_benefits: Optional[str] = None
    recipe_summary: Optional[str] = None
