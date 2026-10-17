import io
import numpy as np
from PIL import Image
import cv2
from app.ai.skin.analyzer import skin_analyzer
from app.ai.vision.image_utils import compute_image_metrics, calculate_ita_and_skin_tone


def generate_synthetic_face_image() -> bytes:
    """Generates an in-memory synthetic facial representation for computer vision testing."""
    # Create an RGB image (400x400)
    img = np.ones((400, 400, 3), dtype=np.uint8) * 220
    # Add face circle
    cv2.circle(img, (200, 200), 120, (180, 200, 240), -1)
    # Add eyes
    cv2.circle(img, (160, 170), 15, (50, 50, 50), -1)
    cv2.circle(img, (240, 170), 15, (50, 50, 50), -1)
    # Add nose
    cv2.ellipse(img, (200, 210), (10, 20), 0, 0, 360, (100, 120, 180), -1)
    # Add mouth
    cv2.ellipse(img, (200, 260), (30, 12), 0, 0, 180, (50, 50, 180), 2)
    # Add simulated blemish
    cv2.circle(img, (180, 240), 5, (20, 20, 220), -1)
    
    pil_img = Image.fromarray(img)
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG")
    return buf.getvalue()


def test_skin_analyzer_quality_and_metrics():
    img_bytes = generate_synthetic_face_image()
    quality = skin_analyzer.check_quality(img_bytes)
    assert "brightness_mean" in quality
    assert "sharpness_score" in quality
    assert quality["brightness_mean"] > 0


def test_skin_analyzer_feature_extraction():
    img_bytes = generate_synthetic_face_image()
    analysis = skin_analyzer.analyze_skin(img_bytes, user_id="test-user")
    
    assert 0.0 <= analysis["overall_clarity_score"] <= 100.0
    assert analysis["skin_tone_label"] in ["very_light", "light", "intermediate", "tan", "brown", "deep_dark"]
    assert len(analysis["limitations"]) > 0
    assert "annotated_image_url" in analysis
