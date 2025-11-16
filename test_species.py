from ultralytics import YOLO

# Database info spesies ikan karang (sama seperti di app.py)
REEF_FISH_INFO = {
    'Ctenochaetus_cyanocheilus': {
        'nama_indonesia': 'Ikan Botana Ekor Pendek',
        'habitat': 'Terumbu karang Indo-Pasifik (3-60m)',
        'ciri': 'Tubuh oval, warna hijau-biru dengan bintik kuning'
    },
    'Anthias': {
        'nama_indonesia': 'Ikan Anthias',
        'habitat': 'Terumbu karang dalam (10-30m)',
        'ciri': 'Warna oranye-pink cerah'
    },
    'Labridae': {
        'nama_indonesia': 'Ikan Kakatua',
        'habitat': 'Terumbu karang dangkal',
        'ciri': 'Warna biru-hijau'
    },
    'Pomacentridae': {
        'nama_indonesia': 'Ikan Betok Laut',
        'habitat': 'Terumbu karang',
        'ciri': 'Ukuran kecil, warna cerah'
    }
    # Tambahkan species lain sesuai dataset Anda
}

print("⏳ Loading reef fish model...")
model = YOLO('reef_fish.pt')
print(f"✅ Model loaded: {model.names}\n")

image_path = input("Masukkan path gambar ikan karang: ").strip()

print(f"\n🔍 Testing species detection on: {image_path}\n")
results = model(image_path, conf=0.05)  # Confidence rendah untuk sensitif

print("\n📊 Hasil Deteksi:")
print("=" * 60)

detected_count = 0
for r in results:
    if len(r.boxes) == 0:
        print("❌ Tidak ada spesies ikan terdeteksi pada gambar ini.")
        print("\n💡 Tips:")
        print("   - Pastikan gambar berisi ikan karang yang jelas")
        print("   - Model dilatih untuk spesies:", list(model.names.values()))
        print("   - Coba gambar dengan pencahayaan dan fokus yang baik")
    else:
        detected_count = len(r.boxes)
        print(f"✅ Terdeteksi {detected_count} spesies ikan karang:\n")
        
        for i, box in enumerate(r.boxes):
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            species = model.names[cls]
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            print(f"🐠 Deteksi #{i+1}:")
            print(f"   Spesies: {species}")
            print(f"   Confidence: {conf:.2%}")
            print(f"   Bounding Box: [{x1}, {y1}, {x2}, {y2}]")
            
            # Info tambahan dari database
            if species in REEF_FISH_INFO:
                info = REEF_FISH_INFO[species]
                print(f"   📖 Info:")
                print(f"      - Nama Indonesia: {info['nama_indonesia']}")
                print(f"      - Habitat: {info['habitat']}")
                print(f"      - Ciri-ciri: {info['ciri']}")
            print()
        
        # Tampilkan gambar dengan bounding box
        print("🖼️  Menampilkan gambar hasil deteksi...")
        r.show()

print("=" * 60)
print(f"\n✅ Total terdeteksi: {detected_count} spesies")
print("🔚 Selesai.")
