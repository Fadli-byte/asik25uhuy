from flask import Flask, Response, request, jsonify, send_file
from ultralytics import YOLO
from datetime import datetime
import cv2
import numpy as np
import base64
import os
import warnings
import threading

# Suppress warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

print("=" * 70)
print("⏳ Loading Fish Detection Models...")
print("📦 Loading Freshness Model (best.pt)...")
model_freshness = YOLO('best.pt')
print(f"✅ Freshness Model loaded! Classes: {model_freshness.names}")

print("📦 Loading Reef Fish Species Model (reef_fish.pt)...")
model_species = YOLO('reef_fish.pt')
print(f"✅ Species Model loaded! Classes: {model_species.names}")
print("=" * 70)

UPLOAD_FOLDER = 'captured_images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DETECTION_CRITERIA = {
    'mata': {'segar': 'Jernih, menonjol, bening', 'tidak_segar': 'Kusam, cekung, keruh'},
    'insang': {'segar': 'Merah cerah, berbau segar', 'tidak_segar': 'Coklat, berlendir, bau busuk'},
    'kulit_sisik': {'segar': 'Mengkilap, sisik kuat', 'tidak_segar': 'Kusam, sisik mudah lepas'},
    'warna_tubuh': {'segar': 'Cerah dan khas', 'tidak_segar': 'Pucat, keabu-abuan'},
    'perut': {'segar': 'Kencang', 'tidak_segar': 'Lembek, menggembung'}
}

REEF_FISH_INFO = {
    'Ctenochaetus_cyanocheilus': {
        'nama_indonesia': 'Ikan Botana Ekor Pendek',
        'habitat': 'Terumbu karang Indo-Pasifik (3-60m)',
        'ciri': 'Tubuh oval, warna hijau-biru dengan bintik kuning',
        'konservasi': 'Least Concern'
    },
    'Anthias': {
        'nama_indonesia': 'Ikan Anthias',
        'habitat': 'Terumbu karang dalam (10-30m)',
        'ciri': 'Warna oranye-pink cerah, hidup berkelompok',
        'konservasi': 'Least Concern'
    },
    'Labridae': {
        'nama_indonesia': 'Ikan Kakatua / Wrasse',
        'habitat': 'Terumbu karang dangkal',
        'ciri': 'Warna cerah, bentuk beragam, beberapa berparuh keras',
        'konservasi': 'Least Concern'
    },
    'Pomacentridae': {
        'nama_indonesia': 'Ikan Betok Laut / Damsel',
        'habitat': 'Terumbu karang',
        'ciri': 'Ukuran kecil, warna cerah, agresif',
        'konservasi': 'Least Concern'
    },

    # ——————————————————————————————————————
    # Tambahan dari daftar Anda
    # ——————————————————————————————————————

    'Abudefduf': {
        'nama_indonesia': 'Ikan Sergeant Major',
        'habitat': 'Terumbu karang dangkal',
        'ciri': 'Garis-garis vertikal hitam, tubuh kekuningan',
        'konservasi': 'Least Concern'
    },
    'Apogonodiae': {
        'nama_indonesia': 'Ikan Kardinal',
        'habitat': 'Terumbu karang berlubang / celah batu',
        'ciri': 'Ukuran kecil, sering aktif malam hari',
        'konservasi': 'Least Concern'
    },
    'Botana': {
        'nama_indonesia': 'Ikan Botana / Surgeonfish',
        'habitat': 'Terumbu karang Indo-Pasifik',
        'ciri': 'Bentuk pipih, memiliki duri tajam di pangkal ekor',
        'konservasi': 'Least Concern'
    },
    'Caesionidae': {
        'nama_indonesia': 'Ikan Ekor Kuning / Fusilier',
        'habitat': 'Perairan karang terbuka',
        'ciri': 'Tubuh ramping, sering membentuk gerombolan besar',
        'konservasi': 'Least Concern'
    },
    'Carangidae': {
        'nama_indonesia': 'Ikan Selar / Jack',
        'habitat': 'Perairan dangkal hingga dalam',
        'ciri': 'Tubuh torpedo, perenang cepat',
        'konservasi': 'Least Concern'
    },
    'Chaetodontidae': {
        'nama_indonesia': 'Ikan Kepe-kepe / Butterflyfish',
        'habitat': 'Terumbu karang dangkal',
        'ciri': 'Warna kontras, moncong panjang',
        'konservasi': 'Least Concern'
    },
    'Ephipidae': {
        'nama_indonesia': 'Ikan Daun / Batfish',
        'habitat': 'Terumbu karang dan pesisir',
        'ciri': 'Bentuk pipih tinggi, sirip lebar',
        'konservasi': 'Least Concern'
    },
    'Helocentridea': {
        'nama_indonesia': 'Ikan Api-api (Holocentridae/Squirrelfish)',
        'habitat': 'Terumbu karang bersembunyi di siang hari',
        'ciri': 'Mata besar, warna merah cerah',
        'konservasi': 'Least Concern'
    },
    'Holocentridea': {
        'nama_indonesia': 'Ikan Api-api',
        'habitat': 'Terumbu karang',
        'ciri': 'Aktif malam hari, tubuh merah terang',
        'konservasi': 'Least Concern'
    },
    'Lethrinidae': {
        'nama_indonesia': 'Ikan Emperor',
        'habitat': 'Terumbu karang dan padang lamun',
        'ciri': 'Tubuh panjang, warna keperakan',
        'konservasi': 'Least Concern'
    },
    'Lutjanidae': {
        'nama_indonesia': 'Ikan Kakap',
        'habitat': 'Terumbu karang dan perairan pesisir',
        'ciri': 'Tubuh kokoh, warna merah/kekuningan',
        'konservasi': 'Least Concern'
    },
    'Mooraynidae': {
        'nama_indonesia': 'Ikan Belut Moray',
        'habitat': 'Celah batu dan karang',
        'ciri': 'Tubuh panjang menyerupai ular, gigi tajam',
        'konservasi': 'Least Concern'
    },
    'Mullidae': {
        'nama_indonesia': 'Ikan Kiper / Goatfish',
        'habitat': 'Dasar pasir dekat karang',
        'ciri': 'Memiliki dua sungut dagu',
        'konservasi': 'Least Concern'
    },
    'Nemipteridae': {
        'nama_indonesia': 'Ikan Kurisi / Threadfin Bream',
        'habitat': 'Perairan dasar berpasir dan karang',
        'ciri': 'Tubuh merah muda, sirip ekor memanjang',
        'konservasi': 'Least Concern'
    },
    'Pempheridae': {
        'nama_indonesia': 'Ikan Sweepers',
        'habitat': 'Gua-gua karang',
        'ciri': 'Tubuh pipih, sering berkelompok rapat',
        'konservasi': 'Least Concern'
    },
    'Serranidae': {
        'nama_indonesia': 'Kerapu',
        'habitat': 'Terumbu karang',
        'ciri': 'Tubuh besar dan tebal, predator puncak karang',
        'konservasi': 'Bervariasi menurut spesies'
    },
    'Zancilidae': {
        'nama_indonesia': 'Ikan Bendera / Bannerfish',
        'habitat': 'Terumbu karang',
        'ciri': 'Mirip kepe-kepe namun sirip punggung sangat panjang',
        'konservasi': 'Least Concern'
    },
    'cathedon': {
        'nama_indonesia': 'Tidak diketahui (perlu verifikasi)',
        'habitat': '-',
        'ciri': '-',
        'konservasi': '-'
    },
    'lutjanus seabe': {
        'nama_indonesia': 'Kakap (spesifik tidak dikenali)',
        'habitat': 'Terumbu karang',
        'ciri': 'Ciri khusus tidak ditemukan, kemungkinan salah ejaan',
        'konservasi': 'Least Concern'
    }
}


class FishDetector:
    def __init__(self):
        self.is_detecting = True
        self.last_detections = []
        self.fps = 0
        self.current_mode = 'freshness'  # 'freshness' or 'species'
    
    def process_frame(self, frame, show_stats=True, mode='freshness'):
        """Process frame dengan overlay info - support kedua mode"""
        try:
            # Pilih model berdasarkan mode
            if mode == 'species':
                current_model = model_species
                conf_threshold = 0.25  # Lebih tinggi untuk species detection
                iou_threshold = 0.45
                max_det = 10  # Bisa lebih banyak species
            else:  # freshness mode
                current_model = model_freshness
                conf_threshold = 0.001
                iou_threshold = 0.30
                max_det = 2
            
            # Run detection
            results = current_model(frame, conf=conf_threshold, iou=iou_threshold, verbose=False, max_det=max_det)
            
            annotated_frame = frame.copy()
            detections = []
            fish_detected = False
            
            # Process detections
            for result in results:
                for box in result.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    label = current_model.names[cls]
                    
                    fish_detected = True
                    
                    # Color coding berdasarkan mode
                    if mode == 'species':
                        # Untuk species, gunakan warna berbeda per species
                        color = (0, 200, 255)  # Orange-cyan untuk species
                        # Bisa ditambahkan mapping warna per species jika perlu
                    else:
                        # Freshness mode - warna berdasarkan segar/tidak segar
                        if "segar" in label.lower() and "tidak" not in label.lower():
                            color = (0, 255, 0)  # Green
                        elif "tidak" in label.lower():
                            color = (0, 0, 255)  # Red
                        else:
                            color = (255, 165, 0)  # Orange
                    
                    # Draw bounding box
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 3)
                    
                    # Label
                    text = f'{label}: {conf:.3f}'
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    (tw, th), _ = cv2.getTextSize(text, font, 0.6, 2)
                    cv2.rectangle(annotated_frame, (x1, y1-th-10), (x1+tw+5, y1), color, -1)
                    cv2.putText(annotated_frame, text, (x1+3, y1-5), font, 0.6, (255,255,255), 2)
                    
                    # Prepare detection data
                    detection_data = {
                        'class': label,
                        'confidence': conf,
                        'bbox': [x1, y1, x2, y2],
                        'is_fish': True
                    }
                    
                    # Tambahkan info spesies jika mode species
                    if mode == 'species' and label in REEF_FISH_INFO:
                        detection_data['species_info'] = REEF_FISH_INFO[label]
                    
                    detections.append(detection_data)
            
            # ✅ Overlay statistics di live stream
            if show_stats:
                h, w = frame.shape[:2]
                
                # Background untuk stats
                cv2.rectangle(annotated_frame, (10, 10), (350, 150), (0, 0, 0), -1)
                cv2.rectangle(annotated_frame, (10, 10), (350, 150), (255, 255, 255), 2)
                
                # Stats text
                font = cv2.FONT_HERSHEY_SIMPLEX
                y_offset = 35
                
                # Title berdasarkan mode
                if mode == 'species':
                    title = "🐠 SPECIES DETECTION"
                else:
                    title = "🐟 FRESHNESS DETECTION"
                
                cv2.putText(annotated_frame, title, (20, y_offset), font, 0.7, (255, 255, 255), 2)
                y_offset += 30
                
                if mode == 'species':
                    # Stats untuk species mode
                    unique_species = len(set(d['class'] for d in detections))
                    cv2.putText(annotated_frame, f"Total: {len(detections)}", (20, y_offset), font, 0.6, (255, 255, 255), 2)
                    y_offset += 25
                    cv2.putText(annotated_frame, f"Species: {unique_species}", (20, y_offset), font, 0.6, (0, 200, 255), 2)
                else:
                    # Stats untuk freshness mode
                    fresh_count = sum(1 for d in detections if "segar" in d['class'].lower() and "tidak" not in d['class'].lower())
                    not_fresh_count = sum(1 for d in detections if "tidak" in d['class'].lower())
                    
                    cv2.putText(annotated_frame, f"Total: {len(detections)}", (20, y_offset), font, 0.6, (255, 255, 255), 2)
                    y_offset += 25
                    cv2.putText(annotated_frame, f"Fresh: {fresh_count}", (20, y_offset), font, 0.6, (0, 255, 0), 2)
                    y_offset += 25
                    cv2.putText(annotated_frame, f"Not Fresh: {not_fresh_count}", (20, y_offset), font, 0.6, (0, 0, 255), 2)
                
                # Status indicator
                status_text = "DETECTING..." if self.is_detecting else "PAUSED"
                status_color = (0, 255, 0) if self.is_detecting else (128, 128, 128)
                cv2.putText(annotated_frame, status_text, (w - 200, 35), font, 0.7, status_color, 2)
            
            self.last_detections = detections
            self.current_mode = mode
            return annotated_frame, detections, fish_detected
        
        except Exception as e:
            print(f"❌ Error: {e}")
            return frame, [], False

detector = FishDetector()

@app.route('/')
def index():
    return jsonify({
        'message': 'Fish Detection API - Dual Mode',
        'status': 'running',
        'models': {
            'freshness': 'best.pt',
            'species': 'reef_fish.pt'
        },
        'freshness_classes': model_freshness.names,
        'species_classes': model_species.names,
        'current_mode': detector.current_mode
    })

@app.route('/video_feed')
def video_feed():
    """✅ Live detection stream dengan overlay stats - support dual mode"""
    mode = request.args.get('mode', 'freshness')  # Default freshness
    if mode not in ['freshness', 'species']:
        mode = 'freshness'
    
    def generate():
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Cannot open camera")
            return
        
        print(f"📹 Camera opened - Live detection active! Mode: {mode}")
        
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            # ✅ Process dengan deteksi (selalu aktif untuk live view)
            processed_frame, _, _ = detector.process_frame(frame, show_stats=True, mode=mode)
            
            # Encode
            ret, buffer = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if not ret:
                continue
            
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        cap.release()
        print("📹 Camera closed")
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/capture_snapshot', methods=['POST'])
def capture_snapshot():
    try:
        print("\n📸 SNAPSHOT REQUEST")
        mode = request.json.get('mode', 'freshness') if request.is_json else request.form.get('mode', 'freshness')
        if mode not in ['freshness', 'species']:
            mode = 'freshness'
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return jsonify({'error': 'Kamera tidak tersedia'}), 500
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return jsonify({'error': 'Gagal capture'}), 500
        
        # Process frame (tanpa overlay stats untuk hasil bersih)
        annotated_frame, detections, fish_detected = detector.process_frame(frame, show_stats=False, mode=mode)
        
        # Generate message berdasarkan mode
        if not detections:
            message = "⚠️ Tidak ada ikan terdeteksi"
        else:
            if mode == 'species':
                unique_species = len(set(d['class'] for d in detections))
                message = f"🐠 Terdeteksi {len(detections)} ikan dari {unique_species} spesies!"
            else:
                fresh = sum(1 for d in detections if "segar" in d['class'].lower() and "tidak" not in d['class'].lower())
                not_fresh = sum(1 for d in detections if "tidak" in d['class'].lower())
                if fresh > 0 and not_fresh == 0:
                    message = f"✅ Terdeteksi {fresh} Ikan SEGAR!"
                elif not_fresh > 0 and fresh == 0:
                    message = f"⚠️ Terdeteksi {not_fresh} Ikan TIDAK SEGAR!"
                else:
                    message = f"📊 Terdeteksi: {fresh} segar, {not_fresh} tidak segar"
        
        # Save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'fish_{mode}_{timestamp}.jpg'
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        cv2.imwrite(filepath, annotated_frame)
        
        # Encode
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        print(f"✅ Saved: {filename} ({len(detections)} detections) - Mode: {mode}")
        
        response_data = {
            'success': True,
            'filename': filename,
            'image': img_base64,
            'detections': detections,
            'fish_detected': fish_detected,
            'mode': mode,
            'message': message
        }
        
        # Tambahkan criteria untuk freshness mode
        if mode == 'freshness' and fish_detected:
            response_data['criteria'] = DETECTION_CRITERIA
        
        return jsonify(response_data)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/detect_image', methods=['POST'])
def detect_image():
    try:
        print("\n📤 IMAGE UPLOAD")
        if 'image' not in request.files:
            return jsonify({'error': 'No image'}), 400
        
        # Get mode from form data or default to freshness
        mode = request.form.get('mode', 'freshness')
        if mode not in ['freshness', 'species']:
            mode = 'freshness'
        
        file = request.files['image']
        nparr = np.frombuffer(file.read(), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image'}), 400
        
        annotated_frame, detections, fish_detected = detector.process_frame(frame, show_stats=False, mode=mode)
        
        # Generate message berdasarkan mode
        if not detections:
            message = "⚠️ Tidak ada ikan terdeteksi"
        else:
            if mode == 'species':
                unique_species = len(set(d['class'] for d in detections))
                message = f"🐠 Terdeteksi {len(detections)} ikan dari {unique_species} spesies!"
            else:
                fresh = sum(1 for d in detections if "segar" in d['class'].lower() and "tidak" not in d['class'].lower())
                not_fresh = sum(1 for d in detections if "tidak" in d['class'].lower())
                if fresh > 0 and not_fresh == 0:
                    message = f"✅ {fresh} Ikan SEGAR!"
                elif not_fresh > 0 and fresh == 0:
                    message = f"⚠️ {not_fresh} Ikan TIDAK SEGAR!"
                else:
                    message = f"📊 {fresh} segar, {not_fresh} tidak segar"
        
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        print(f"✅ Processed: {len(detections)} detections - Mode: {mode}")
        
        response_data = {
            'success': True,
            'image': img_base64,
            'detections': detections,
            'fish_detected': fish_detected,
            'mode': mode,
            'message': message
        }
        
        # Tambahkan criteria untuk freshness mode
        if mode == 'freshness' and fish_detected:
            response_data['criteria'] = DETECTION_CRITERIA
        
        return jsonify(response_data)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/toggle_detection', methods=['POST'])
def toggle_detection():
    detector.is_detecting = not detector.is_detecting
    status = "ON" if detector.is_detecting else "OFF"
    print(f"🔍 Detection: {status}")
    return jsonify({'detecting': detector.is_detecting})

@app.route('/download/<filename>')
def download(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'Not found'}), 404
    return send_file(filepath, as_attachment=True)

@app.route('/delete/<filename>', methods=['DELETE'])
def delete(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return jsonify({'success': True})
    return jsonify({'error': 'Not found'}), 404

@app.route('/list_images')
def list_images():
    images = []
    if os.path.exists(UPLOAD_FOLDER):
        for f in os.listdir(UPLOAD_FOLDER):
            if f.endswith(('.jpg', '.jpeg', '.png')):
                images.append({'filename': f, 'path': f'/download/{f}'})
    return jsonify({'images': images})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,DELETE')
    return response

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🐟 FLASK - DUAL MODE FISH DETECTION")
    print("=" * 70)
    print(f"📂 Freshness Model: best.pt")
    print(f"📋 Freshness Classes: {model_freshness.names}")
    print(f"📂 Species Model: reef_fish.pt")
    print(f"📋 Species Classes: {model_species.names}")
    print(f"🎯 Freshness Settings: Conf=0.1% | IoU=30% | Max=2")
    print(f"🎯 Species Settings: Conf=25% | IoU=45% | Max=10")
    print(f"📹 Live Detection: ENABLED (Dual Mode)")
    print("=" * 70 + "\n")
    
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port, threaded=True)
