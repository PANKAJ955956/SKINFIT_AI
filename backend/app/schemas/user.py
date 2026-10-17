from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class UserProfileBase(BaseModel):
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[str] = None
    height_cm: Optional[float] = Field(None, ge=50, le=260)
    weight_kg: Optional[float] = Field(None, ge=25, le=350)
    activity_level: Optional[str] = "moderate"
    fitness_goal: Optional[str] = "maintain_health"
    self_reported_skin_type: Optional[str] = "combination"
    skin_concerns: List[str] = Field(default_factory=list)
    known_allergies: List[str] = Field(default_factory=list)
    dietary_preferences: List[str] = Field(default_factory=list)
    budget_tier: Optional[str] = "moderate"


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileResponse(UserProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime
    profile: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True


class ConsentRequest(BaseModel):
    consent_type: str
    is_granted: bool


class ConsentResponse(BaseModel):
    id: str
    consent_type: str
    is_granted: bool
    granted_at: datetime
    revoked_at: Optional[datetime] = None

    class Config:
        from_attributes = True
