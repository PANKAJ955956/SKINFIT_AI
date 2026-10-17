from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class QualityCheckResponse(BaseModel):
    is_valid: bool
    face_detected: bool
    face_count: int
    face_bounding_box: Optional[BoundingBox] = None
    lighting_condition: str  # "good", "adequate", "underexposed", "overexposed", "harsh_shadows"
    brightness_mean: float
    sharpness_score: float
    is_blurry: bool
    feedback_messages: List[str] = Field(default_factory=list)


class SkinFindingResponse(BaseModel):
    id: Optional[str] = None
    feature_type: str  # "acne_lesion", "pigmentation_spot", "fine_line_wrinkle", "texture_roughness"
    anatomical_region: str  # "forehead", "left_cheek", "right_cheek", "chin", "nose"
    bounding_box: BoundingBox
    severity: str  # "mild", "moderate", "pronounced"
    confidence: float

    class Config:
        from_attributes = True


class SkinAssessmentResponse(BaseModel):
    id: str
    user_id: str
    image_id: Optional[str] = None
    overall_clarity_score: float
    estimated_skin_type: Optional[str] = None
    ita_angle: Optional[float] = None
    skin_tone_label: Optional[str] = None
    lighting_quality: str
    sharpness_score: float
    confidence_score: float
    acne_count: int
    pigmentation_count: int
    wrinkle_score: float
    texture_score: float
    summary: Optional[str] = None
    limitations: List[str] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


class SkinAssessmentDetailResponse(SkinAssessmentResponse):
    findings: List[SkinFindingResponse] = Field(default_factory=list)
    annotated_image_url: Optional[str] = None
