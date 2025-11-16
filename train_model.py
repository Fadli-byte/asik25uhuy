from ultralytics import YOLO
import os

# Buat file dataset.yaml untuk training
dataset_yaml = """
path: ./fish_dataset  # path ke root dataset
train: images/train
val: images/val
test: images/test

# Classes
nc: 2  # number of classes
names: ['Ikan Segar', 'Ikan Tidak Segar']
"""

with open('dataset.yaml', 'w') as f:
    f.write(dataset_yaml)

# Load model YOLOv8
model = YOLO('yolov8n.pt')  # nano model untuk kecepatan

# Training
results = model.train(
    data='dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    name='fish_freshness_detector',
    patience=20,
    save=True,
    plots=True,
    # Augmentasi untuk meningkatkan akurasi
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    degrees=10,
    translate=0.1,
    scale=0.5,
    fliplr=0.5,
    mosaic=1.0,
)

# Export model
model.export(format='onnx')  # Optional: export ke format lain

print("Training selesai! Model tersimpan di runs/detect/fish_freshness_detector/weights/best.pt")
