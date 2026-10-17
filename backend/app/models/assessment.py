import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, Integer, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class ImageMetadata(Base):
    __tablename__ = "image_metadata"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    image_type = Column(String(50), nullable=False)  # "skin", "body", "progress"
    checksum = Column(String(64), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="images")
    skin_assessments = relationship("SkinAssessment", back_populates="image", cascade="all, delete-orphan")
    body_assessments = relationship("BodyAssessment", back_populates="image", cascade="all, delete-orphan")


class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_id = Column(String(36), ForeignKey("image_metadata.id", ondelete="SET NULL"), nullable=True)

    overall_clarity_score = Column(Float, nullable=False, default=75.0)  # 0 to 100
    estimated_skin_type = Column(String(50), nullable=True)  # oily, dry, combination, balanced
    ita_angle = Column(Float, nullable=True)  # Individual Typology Angle for skin tone approximation
    skin_tone_label = Column(String(50), nullable=True)  # very_light, light, intermediate, tan, dark, deep
    
    lighting_quality = Column(String(50), default="adequate")  # good, adequate, underexposed, overexposed, harsh_glare
    sharpness_score = Column(Float, default=1.0)  # Laplacian variance ratio
    confidence_score = Column(Float, default=0.85)

    acne_count = Column(Integer, default=0)
    pigmentation_count = Column(Integer, default=0)
    wrinkle_score = Column(Float, default=0.0)  # normalized 0.0 to 10.0
    texture_score = Column(Float, default=0.0)

    summary = Column(Text, nullable=True)
    limitations = Column(JSON, default=list)  # Educational disclaimer and optical capture caveats
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="skin_assessments")
    image = relationship("ImageMetadata", back_populates="skin_assessments")
    findings = relationship("SkinFinding", back_populates="assessment", cascade="all, delete-orphan")


class SkinFinding(Base):
    __tablename__ = "skin_findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=False, index=True)

    feature_type = Column(String(50), nullable=False)  # "acne_lesion", "pigmentation_spot", "fine_line_wrinkle", "texture_roughness"
    anatomical_region = Column(String(50), nullable=False)  # "forehead", "left_cheek", "right_cheek", "chin", "nose"
    bounding_box = Column(JSON, nullable=False)  # {"x": 100, "y": 150, "width": 40, "height": 40}
    severity = Column(String(50), default="mild")  # mild, moderate, pronounced
    confidence = Column(Float, default=0.80)

    assessment = relationship("SkinAssessment", back_populates="findings")


class BodyAssessment(Base):
    __tablename__ = "body_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_id = Column(String(36), ForeignKey("image_metadata.id", ondelete="SET NULL"), nullable=True)

    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    bmi_value = Column(Float, nullable=False)
    bmi_category = Column(String(50), nullable=False)  # underweight, normal_weight, overweight, obesity_class_1, obesity_class_2, obesity_class_3
    
    posture_score = Column(Float, default=80.0)  # 0 to 100
    neck_inclination_deg = Column(Float, nullable=True)
    shoulder_tilt_deg = Column(Float, nullable=True)
    torso_inclination_deg = Column(Float, nullable=True)
    
    detected_deviations = Column(JSON, default=list)  # ["forward_head", "rounded_shoulders", "anterior_pelvic_tilt"]
    keypoints_json = Column(JSON, nullable=True)
    limitations = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="body_assessments")
    image = relationship("ImageMetadata", back_populates="body_assessments")
