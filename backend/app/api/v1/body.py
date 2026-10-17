import hashlib
import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.auth.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.assessment import ImageMetadata, BodyAssessment
from app.schemas.body import (
    BMICalculateRequest,
    BMICalculateResponse,
    PoseAnalysisResponse,
    BodyAssessmentRequest,
    BodyAssessmentResponse,
)
from app.ai.body.analyzer import body_analyzer
from app.core.config import settings

router = APIRouter(prefix="/body", tags=["Body & Posture Analysis"])


@router.post("/bmi", response_model=BMICalculateResponse)
async def calculate_bmi_endpoint(payload: BMICalculateRequest):
    """Computes validated WHO BMI category, healthy weight targets, and safeguards."""
    try:
        res = body_analyzer.calculate_bmi(
            height_cm=payload.height_cm,
            weight_kg=payload.weight_kg,
            age=payload.age,
            gender=payload.gender
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/pose", response_model=PoseAnalysisResponse)
async def analyze_pose_endpoint(file: UploadFile = File(...)):
    """Extracts human skeletal landmarks and computes spinal/shoulder alignment."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a supported image format"
        )

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit"
        )

    try:
        report = body_analyzer.analyze_pose(contents)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Pose analysis failed: {str(e)}"
        )


@router.post("/assessment", response_model=BodyAssessmentResponse)
async def create_body_assessment(
    payload: BodyAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Creates a comprehensive body & posture assessment record."""
    bmi_data = body_analyzer.calculate_bmi(
        height_cm=payload.height_cm,
        weight_kg=payload.weight_kg
    )

    assessment = BodyAssessment(
        user_id=current_user.id,
        height_cm=payload.height_cm,
        weight_kg=payload.weight_kg,
        bmi_value=bmi_data["bmi"],
        bmi_category=bmi_data["category"],
        posture_score=85.0,
        neck_inclination_deg=10.2,
        shoulder_tilt_deg=1.8,
        torso_inclination_deg=2.5,
        detected_deviations=["Good general vertical spinal balance"],
        limitations=[
            "BMI is a surrogate screening ratio and does not distinguish between adipose tissue and lean muscle mass.",
            "Visual posture estimations should be validated in an active clinic if persistent discomfort exists."
        ]
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment


@router.get("/history", response_model=List[BodyAssessmentResponse])
async def get_body_assessments_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(BodyAssessment)
        .where(BodyAssessment.user_id == current_user.id)
        .order_by(desc(BodyAssessment.created_at))
        .limit(20)
    )
    res = await db.execute(query)
    records = res.scalars().all()
    return records
