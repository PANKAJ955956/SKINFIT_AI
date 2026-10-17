from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.auth.deps import get_current_user
from app.database.session import get_db
from app.models.user import User, UserProfile, ConsentRecord
from app.schemas.user import UserResponse, UserProfileUpdate, UserProfileResponse, ConsentRequest, ConsentResponse

router = APIRouter(prefix="/users", tags=["Users & Profiles"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(User).where(User.id == current_user.id).options(selectinload(User.profile))
    res = await db.execute(query)
    user = res.scalar_one()
    return user


@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(UserProfile).where(UserProfile.user_id == current_user.id)
    res = await db.execute(query)
    profile = res.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    # Update profile fields
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    profile.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.post("/consent", response_model=ConsentResponse)
async def manage_consent(
    payload: ConsentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(ConsentRecord).where(
        ConsentRecord.user_id == current_user.id,
        ConsentRecord.consent_type == payload.consent_type
    )
    res = await db.execute(query)
    existing = res.scalar_one_or_none()

    if existing:
        existing.is_granted = payload.is_granted
        if not payload.is_granted:
            existing.revoked_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(existing)
        return existing

    new_consent = ConsentRecord(
        user_id=current_user.id,
        consent_type=payload.consent_type,
        is_granted=payload.is_granted
    )
    db.add(new_consent)
    await db.commit()
    await db.refresh(new_consent)
    return new_consent
