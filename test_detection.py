from ultralytics import YOLO
import cv2

print("⏳ Loading model...")
model = YOLO('best.pt')
print(f"✅ Model loaded: {model.names}")

# Test dengan gambar ikan
image_path = input("Masukkan path gambar ikan: ")

print(f"\n🔍 Testing detection on: {image_path}")

# Deteksi dengan confidence rendah
results = model(image_path, conf=0.05)  # Sangat sensitif

print(f"\n📊 Results:")
for result in results:
    boxes = result.boxes
    print(f"Total detections: {len(boxes)}")
    
    for i, box in enumerate(boxes):
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        label = model.names[cls]
        
        print(f"  Detection #{i+1}: {label} ({conf:.2%})")
    
    # Tampilkan gambar hasil
    annotated = result.plot()
    cv2.imshow('Detection Result', annotated)
    cv2.waitKey(0)

cv2.destroyAllWindows()
