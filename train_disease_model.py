from ultralytics import YOLO
import os

def train_custom_disease_model():
    """
    Instructions for the USER to train their own 'very welling' model:
    1. Organize your data in YOLO format:
       dataset/
         images/ (train, val)
         labels/ (train, val)
         data.yaml (defining your disease classes)
    2. Ensure you have ultralytics installed.
    """
    
    # Load a pretrained YOLOv8 model (Nano is fastest, Large is most accurate)
    model = YOLO('yolov8n.pt') 

    # Train the model
    # Replace 'path/to/data.yaml' with your actual data config path
    print("🚀 Starting training for AgriGita Disease Detection Engine...")
    
    results = model.train(
        data='path/to/data.yaml', 
        epochs=100,                # Train for 100 epochs for better accuracy
        imgsz=640,                 # Standard YOLO image size
        batch=16,                  # Adjust based on GPU memory
        name='agrigita_disease_v1' # Name of your experiment
    )

    # Save the trained weights to the backend models folder
    print("✅ Training complete! Saving model to backend/models/")
    model.save('backend/models/crop_disease_yolov8.pt')

if __name__ == "__main__":
    train_custom_disease_model()
