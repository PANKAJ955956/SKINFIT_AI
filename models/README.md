# AI Model Weights & Pretrained Checkpoints

This directory is designated for local ML/CV model weight files:
- Pretrained YOLOv8 / YOLOv11 weights (e.g. `yolov8n-face.pt` or `yolov8n-pose.pt`)
- PyTorch fine-tuned EfficientNet / MobileNet weights for skin feature classification
- MediaPipe pose & face landmark graph assets

## Default Behavior
By default, SkinFit AI loads lightweight computer vision analyzers (OpenCV cascade / Haar / DNN / CLAHE / morphology filters and MediaPipe) which run locally without requiring multi-gigabyte downloads. When PyTorch or YOLO checkpoints are placed in this directory, the modular analyzer interfaces automatically detect and leverage them.
