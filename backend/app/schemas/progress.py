from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ProgressRecordCreate(BaseModel):
    record_date: Optional[date] = None
    weight_kg: Optional[float] = Field(None, ge=25, le=350)
    waist_cm: Optional[float] = Field(None, ge=30, le=200)
    skin_clarity_score: Optional[float] = Field(None, ge=0, le=100)
    water_intake_liters: Optional[float] = Field(0.0, ge=0, le=15)
    workout_completed: bool = False
    notes: Optional[str] = None


class ProgressRecordResponse(BaseModel):
    id: str
    user_id: str
    record_date: date
    weight_kg: Optional[float] = None
    waist_cm: Optional[float] = None
    skin_clarity_score: Optional[float] = None
    water_intake_liters: float
    workout_completed: bool
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProgressSummaryResponse(BaseModel):
    current_streak_days: int
    total_workouts: int
    latest_weight_kg: Optional[float] = None
    weight_change_kg: Optional[float] = None
    latest_skin_score: Optional[float] = None
    history: List[ProgressRecordResponse] = Field(default_factory=list)
