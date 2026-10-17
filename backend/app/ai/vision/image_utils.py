import io
import math
import os
from typing import Tuple, Optional, Dict, Any, List
import numpy as np
from PIL import Image
import cv2

# Maximum dimensions for processing to preserve speed and memory
MAX_PROCESS_DIM = 1200


def load_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    """Safely decode image bytes into an OpenCV BGR numpy array."""
    try:
        pil_image = Image.open(io.BytesIO(image_bytes))
        # Handle EXIF orientation if present
        if hasattr(pil_image, "_getexif"):
            exif = pil_image._getexif()
            if exif:
                orientation = exif.get(0x0112)
                if orientation == 3:
                    pil_image = pil_image.rotate(180, expand=True)
                elif orientation == 6:
                    pil_image = pil_image.rotate(270, expand=True)
                elif orientation == 8:
                    pil_image = pil_image.rotate(90, expand=True)
        
        # Convert to RGB then BGR
        rgb_image = np.array(pil_image.convert("RGB"))
        bgr_image = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)
        
        # Resize if overly large
        h, w = bgr_image.shape[:2]
        if max(h, w) > MAX_PROCESS_DIM:
            scale = MAX_PROCESS_DIM / max(h, w)
            bgr_image = cv2.resize(bgr_image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        
        return bgr_image
    except Exception as e:
        raise ValueError(f"Failed to decode image: {str(e)}")


def compute_image_metrics(image: np.ndarray) -> Dict[str, Any]:
    """Calculates illumination and sharpness statistics."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Brightness (mean grayscale pixel value)
    mean_val = float(np.mean(gray))
    std_val = float(np.std(gray))
    
    # Sharpness (Laplacian variance)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    
    # Lighting condition diagnosis
    if mean_val < 50:
        lighting = "underexposed"
    elif mean_val > 210:
        lighting = "overexposed"
    elif std_val < 25:
        lighting = "flat_contrast"
    else:
        lighting = "good"
    
    is_blurry = laplacian_var < 70.0
    
    return {
        "brightness_mean": round(mean_val, 2),
        "brightness_std": round(std_val, 2),
        "sharpness_score": round(laplacian_var, 2),
        "lighting_condition": lighting,
        "is_blurry": is_blurry
    }


def detect_face_opencv(image: np.ndarray) -> List[Dict[str, int]]:
    """Detects frontal faces using OpenCV Haar Cascades."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(60, 60)
    )
    
    results = []
    for (x, y, w, h) in faces:
        results.append({"x": int(x), "y": int(y), "width": int(w), "height": int(h)})
    return results


def calculate_ita_and_skin_tone(face_crop: np.ndarray) -> Tuple[float, str]:
    """
    Computes Individual Typology Angle (ITA) in CIE L*a*b* space.
    ITA = arctan((L* - 50) / b*) * (180 / pi)
    ITA is an objective optical colorimetric classification, NOT a medical melanin measure.
    """
    lab = cv2.cvtColor(face_crop, cv2.COLOR_BGR2LAB)
    # L ranges from 0 to 255 in OpenCV (rescale to 0-100)
    # b ranges from 0 to 255 with 128 as neutral in OpenCV (rescale to b* [-127, 127])
    l_chan = lab[:, :, 0].astype(np.float32) * (100.0 / 255.0)
    b_chan = lab[:, :, 2].astype(np.float32) - 128.0
    
    # Mask out extreme highlights or deep shadows (e.g. hair or glints)
    valid_mask = (l_chan > 15) & (l_chan < 95)
    if not np.any(valid_mask):
        return 20.0, "intermediate"
        
    mean_l = float(np.mean(l_chan[valid_mask]))
    mean_b = float(np.mean(b_chan[valid_mask]))
    
    if abs(mean_b) < 0.001:
        mean_b = 0.001
        
    ita = math.atan2((mean_l - 50.0), mean_b) * (180.0 / math.pi)
    ita = round(ita, 1)
    
    # Standard ITA brackets (Del Bino & Bernerd, 2013)
    if ita > 55:
        tone = "very_light"
    elif ita > 41:
        tone = "light"
    elif ita > 28:
        tone = "intermediate"
    elif ita > 10:
        tone = "tan"
    elif ita > -30:
        tone = "brown"
    else:
        tone = "deep_dark"
        
    return ita, tone
