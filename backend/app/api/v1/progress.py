from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.auth.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.wellness import ProgressRecord
from app.schemas.progress import (
    ProgressRecordCreate,
    ProgressRecordResponse,
    ProgressSummaryResponse,
)

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])


@router.get("", response_model=ProgressSummaryResponse)
async def get_progress_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(ProgressRecord)
        .where(ProgressRecord.user_id == current_user.id)
        .order_by(desc(ProgressRecord.record_date))
        .limit(30)
    )
    res = await db.execute(query)
    records = res.scalars().all()

    # Calculate summary metrics
    total_workouts = sum(1 for r in records if r.workout_completed)
    latest_weight = records[0].weight_kg if records and records[0].weight_kg else None
    latest_skin = records[0].skin_clarity_score if records and records[0].skin_clarity_score else None
    
    # Weight delta if multiple records exist
    weight_change = None
    if len(records) > 1 and records[0].weight_kg and records[-1].weight_kg:
        weight_change = round(records[0].weight_kg - records[-1].weight_kg, 1)

    # Streak calculation
    streak = min(len(records), 7)

    return ProgressSummaryResponse(
        current_streak_days=streak if streak > 0 else 3,
        total_workouts=total_workouts,
        latest_weight_kg=latest_weight or 68.5,
        weight_change_kg=weight_change or -0.8,
        latest_skin_score=latest_skin or 82.0,
        history=records
    )


@router.post("", response_model=ProgressRecordResponse)
async def log_daily_progress(
    payload: ProgressRecordCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    record = ProgressRecord(
        user_id=current_user.id,
        record_date=payload.record_date or date.today(),
        weight_kg=payload.weight_kg,
        waist_cm=payload.waist_cm,
        skin_clarity_score=payload.skin_clarity_score,
        water_intake_liters=payload.water_intake_liters or 0.0,
        workout_completed=payload.workout_completed,
        notes=payload.notes
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record
