import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Float, Integer, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class WellnessPlan(Base):
    __tablename__ = "wellness_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), default="Personalized Holistic Wellness Plan")
    goal = Column(String(100), default="healthy_vitality")
    daily_calorie_target = Column(Integer, nullable=False)
    protein_grams = Column(Float, nullable=False)
    carbs_grams = Column(Float, nullable=False)
    fats_grams = Column(Float, nullable=False)
    hydration_liters = Column(Float, default=2.5)

    posture_focus_areas = Column(JSON, default=list)  # ["thoracic_extension", "cervical_retraction"]
    safety_guardrails = Column(JSON, default=list)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="wellness_plans")
    meals = relationship("MealPlan", back_populates="wellness_plan", cascade="all, delete-orphan")


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wellness_plan_id = Column(String(36), ForeignKey("wellness_plans.id", ondelete="CASCADE"), nullable=False, index=True)

    day_of_week = Column(String(20), default="daily")  # monday, tuesday... or daily
    meal_type = Column(String(50), nullable=False)  # "breakfast", "lunch", "dinner", "snack"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    calories = Column(Integer, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fats_g = Column(Float, nullable=False)
    dietary_tags = Column(JSON, default=list)

    wellness_plan = relationship("WellnessPlan", back_populates="meals")


class ExerciseCatalogue(Base):
    __tablename__ = "exercise_catalogue"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # "posture", "core", "strength", "mobility"
    target_muscle = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="beginner")
    equipment = Column(String(100), default="none")
    duration_seconds = Column(Integer, default=180)
    calories_burned_est = Column(Integer, default=20)
    instructions = Column(JSON, default=list)
    posture_benefit = Column(Text, nullable=True)


class ProgressRecord(Base):
    __tablename__ = "progress_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    record_date = Column(Date, default=lambda: date.today(), nullable=False)
    weight_kg = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    skin_clarity_score = Column(Float, nullable=True)
    water_intake_liters = Column(Float, default=0.0)
    workout_completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="progress_records")
