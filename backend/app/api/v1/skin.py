import hashlib
import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.auth.deps import get_current_user, get_optional_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.assessment import ImageMetadata, SkinAssessment, SkinFinding
from app.schemas.skin import (
    QualityCheckResponse,
    SkinAssessmentResponse,
    SkinAssessmentDetailResponse,
    SkinFindingResponse,
)
from app.ai.skin.analyzer import skin_analyzer
from app.core.config import settings

router = APIRouter(prefix="/skin", tags=["Facial Skin Analysis"])


@router.post("/quality-check", response_model=QualityCheckResponse)
async def check_image_quality(
    file: UploadFile = File(...)
):
    """Validates that a facial photo has acceptable illumination, sharpness, and frontality."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image format (JPEG, PNG, WEBP)"
        )

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds maximum permitted size of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )

    try:
        report = skin_analyzer.check_quality(contents)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process image quality: {str(e)}"
        )


@router.post("/analyze", response_model=SkinAssessmentDetailResponse)
async def analyze_facial_skin(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Performs full facial skin assessment:
    - Blemish, acneiform lesion & erythema localization
    - CIE L*a*b* Individual Typology Angle (ITA) skin tone classification
    - Visible hyperpigmentation & dark spot contouring
    - Forehead & periorbital fine line / texture variance
    - Saves encrypted metadata and structured findings
    """
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

    checksum = hashlib.sha256(contents).hexdigest()

    # Save original image to secure private storage
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    safe_filename = f"skin_{uuid.uuid4().hex}{ext}"
    storage_path = os.path.join(settings.IMAGE_STORAGE_PATH, safe_filename)
    
    with open(storage_path, "wb") as f:
        f.write(contents)

    # Record ImageMetadata in database
    image_meta = ImageMetadata(
        user_id=current_user.id,
        filename=safe_filename,
        file_path=storage_path,
        file_size_bytes=len(contents),
        mime_type=file.content_type,
        image_type="skin",
        checksum=checksum
    )
    db.add(image_meta)
    await db.flush()

    # Perform CV Analysis
    try:
        analysis = skin_analyzer.analyze_skin(contents, current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Computer vision feature extraction failed: {str(e)}"
        )

    # Persist SkinAssessment
    assessment = SkinAssessment(
        user_id=current_user.id,
        image_id=image_meta.id,
        overall_clarity_score=analysis["overall_clarity_score"],
        estimated_skin_type=analysis["estimated_skin_type"],
        ita_angle=analysis["ita_angle"],
        skin_tone_label=analysis["skin_tone_label"],
        lighting_quality=analysis["lighting_quality"],
        sharpness_score=analysis["sharpness_score"],
        confidence_score=analysis["confidence_score"],
        acne_count=analysis["acne_count"],
        pigmentation_count=analysis["pigmentation_count"],
        wrinkle_score=analysis["wrinkle_score"],
        texture_score=analysis["texture_score"],
        summary=analysis["summary"],
        limitations=analysis["limitations"]
    )
    db.add(assessment)
    await db.flush()

    # Persist individual SkinFindings
    findings_response = []
    for f in analysis["findings"]:
        finding = SkinFinding(
            assessment_id=assessment.id,
            feature_type=f["feature_type"],
            anatomical_region=f["anatomical_region"],
            bounding_box=f["bounding_box"],
            severity=f["severity"],
            confidence=f["confidence"]
        )
        db.add(finding)
        findings_response.append(f)

    await db.commit()
    await db.refresh(assessment)

    return {
        **assessment.__dict__,
        "findings": findings_response,
        "annotated_image_url": analysis["annotated_image_url"]
    }


@router.get("/assessments", response_model=List[SkinAssessmentResponse])
async def get_skin_assessments_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(SkinAssessment)
        .where(SkinAssessment.user_id == current_user.id)
        .order_by(desc(SkinAssessment.created_at))
        .limit(20)
    )
    res = await db.execute(query)
    records = res.scalars().all()
    return records


@router.get("/assessments/{id}", response_model=SkinAssessmentDetailResponse)
async def get_skin_assessment_detail(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(SkinAssessment)
        .where(SkinAssessment.id == id, SkinAssessment.user_id == current_user.id)
        .options(selectinload(SkinAssessment.findings))
    )
    res = await db.execute(query)
    assessment = res.scalar_one_or_none()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment record not found or unauthorized access"
        )

    findings = [
        SkinFindingResponse(
            id=f.id,
            feature_type=f.feature_type,
            anatomical_region=f.anatomical_region,
            bounding_box=f.bounding_box,
            severity=f.severity,
            confidence=f.confidence
        )
        for f in assessment.findings
    ]

    return {
        **assessment.__dict__,
        "findings": findings,
        "annotated_image_url": None
    }
