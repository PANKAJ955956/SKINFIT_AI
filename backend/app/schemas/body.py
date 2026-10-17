from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BMICalculateRequest(BaseModel):
    height_cm: float = Field(..., ge=60, le=260, description="Height in centimeters")
    weight_kg: float = Field(..., ge=25, le=350, description="Weight in kilograms")
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[str] = "unspecified"


class BMICalculateResponse(BaseModel):
    bmi: float
    category: str
    healthy_weight_range_kg: Dict[str, float]
    safeguards: List[str] = Field(default_factory=list)
    bmr_calories_est: Optional[float] = None
    tdee_sedentary_est: Optional[float] = None


class PoseKeypoint(BaseModel):
    name: str
    x: float
    y: float
    z: Optional[float] = None
    visibility: float


class PoseAnalysisResponse(BaseModel):
    is_valid_pose: bool
    posture_score: float
    neck_inclination_deg: Optional[float] = None
    shoulder_tilt_deg: Optional[float] = None
    torso_inclination_deg: Optional[float] = None
    deviations_detected: List[str] = Field(default_factory=list)
    keypoints: List[PoseKeypoint] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


class BodyAssessmentRequest(BaseModel):
    height_cm: float = Field(..., ge=60, le=260)
    weight_kg: float = Field(..., ge=25, le=350)
    activity_level: Optional[str] = "moderate"
    fitness_goal: Optional[str] = "maintain_health"


class BodyAssessmentResponse(BaseModel):
    id: str
    user_id: str
    image_id: Optional[str] = None
    height_cm: float
    weight_kg: float
    bmi_value: float
    bmi_category: str
    posture_score: float
    neck_inclination_deg: Optional[float] = None
    shoulder_tilt_deg: Optional[float] = None
    torso_inclination_deg: Optional[float] = None
    detected_deviations: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True
