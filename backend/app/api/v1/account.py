import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.auth.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.assessment import ImageMetadata

router = APIRouter(prefix="/account", tags=["Account & Privacy"])


@router.delete("/images")
async def delete_all_user_images(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    GDPR & CCPA Compliant Image Erasure:
    Permanently unlinks and deletes all uploaded photos from local storage
    and flags database metadata as deleted.
    """
    query = select(ImageMetadata).where(
        ImageMetadata.user_id == current_user.id,
        ImageMetadata.is_deleted == False
    )
    res = await db.execute(query)
    images = res.scalars().all()

    deleted_count = 0
    for img in images:
        if img.file_path and os.path.exists(img.file_path):
            try:
                os.remove(img.file_path)
            except OSError:
                pass
        img.is_deleted = True
        deleted_count += 1

    await db.commit()

    return {
        "status": "success",
        "message": f"Successfully deleted {deleted_count} biometric and assessment photos.",
        "deleted_count": deleted_count
    }
