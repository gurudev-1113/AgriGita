import os

os.environ['YOLO_CONFIG_DIR'] = '/tmp/Ultralytics'
os.environ['YOLO_VERBOSE'] = 'False'

try:
    import torch
    from ultralytics import YOLO
    import cv2
    import numpy as np
    ML_SUPPORTED = True
except ImportError:
    ML_SUPPORTED = False
    print("⚠️ Machine Learning libraries (Torch/Ultralytics) not found. AI Detection will be in Mock Mode.")

class DiseaseDetector:
    def __init__(self, model_path='models/crop_disease_yolov8.pt'):
        self.model_path = model_path
        self.model = None
        if ML_SUPPORTED:
            try:
                if os.path.exists(model_path):
                    self.model = YOLO(model_path)
                else:
                    self.model = None
            except Exception as e:
                self.model = None
                
    def analyze_image(self, image_path):
        if not ML_SUPPORTED or not self.model:
            # Mock Result for Demonstration
            return [
                {'class': 'rust', 'confidence': 0.85, 'is_disease': True},
                {'class': 'blight', 'confidence': 0.72, 'is_disease': True}
            ]
        
        results = self.model(image_path)
        
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Get class name
                cls = int(box.cls[0])
                name = r.names[cls]
                conf = float(box.conf[0])
                
                # Filter for demonstration (actual models would have specifically disease classes)
                detections.append({
                    'class': name,
                    'confidence': conf,
                    'is_disease': self._is_disease_class(name)
                })
        
        return detections

    def _is_disease_class(self, class_name):
        # Placeholder logic for identifying if a detected class is a disease
        diseases = ['rust', 'blight', 'mildew', 'spot', 'mold']
        return any(d in class_name.lower() for d in diseases)

# Singleton instance
detector = DiseaseDetector()
