import os
import re
import json
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
PROMPTS_DATA_DIR = os.path.join(BASE_DIR, 'prompts', 'data')
IMG_LOGS_DIR = os.path.join(BASE_DIR, 'assets', 'img', 'logs')
PENDING_VIDEOS_DIR = os.path.join(BASE_DIR, 'pending_videos')
CSS_DIR = os.path.join(BASE_DIR, 'css')
JS_DIR = os.path.join(BASE_DIR, 'js')

def create_dirs():
    for d in [DATA_DIR, IMG_LOGS_DIR, PENDING_VIDEOS_DIR, CSS_DIR, JS_DIR]:
        os.makedirs(d, exist_ok=True)

def create_gitignore():
    gitignore_path = os.path.join(BASE_DIR, '.gitignore')
    with open(gitignore_path, 'w') as f:
        f.write("pending_videos/\n")
        f.write("__pycache__/\n")
        f.write("*.pyc\n")

def move_videos():
    videos = ['130am.mp4', '530am.mp4', 'decibeles.mp4']
    for v in videos:
        src = os.path.join(PROMPTS_DATA_DIR, v)
        dst = os.path.join(PENDING_VIDEOS_DIR, v)
        if os.path.exists(src):
            shutil.move(src, dst)
            print(f"Moved video: {v} to pending_videos/")

def organize_images():
    # Pick the 4 largest jpg images from prompts/data to assets/img/logs
    if not os.path.exists(PROMPTS_DATA_DIR):
        return
        
    images = [f for f in os.listdir(PROMPTS_DATA_DIR) if f.lower().endswith('.jpg')]
    images_with_size = []
    for img in images:
        path = os.path.join(PROMPTS_DATA_DIR, img)
        images_with_size.append((img, os.path.getsize(path)))
    
    # Sort by size descending
    images_with_size.sort(key=lambda x: x[1], reverse=True)
    top_images = [x[0] for x in images_with_size[:2]]
    
    for img in top_images:
        src = os.path.join(PROMPTS_DATA_DIR, img)
        dst = os.path.join(IMG_LOGS_DIR, img)
        shutil.copy(src, dst)
        print(f"Copied image: {img} to assets/img/logs/")

    # Also copy specific images from WhatsApp folder
    specific_images = [
        "IMG-20260219-WA0011.jpg",
        "IMG-20260404-WA0006.jpg",
        "IMG-20260404-WA0010.jpg"
    ]
    whatsapp_dir = os.path.join(PROMPTS_DATA_DIR, 'Chat de WhatsApp con Boti CABA')
    for img in specific_images:
        src = os.path.join(whatsapp_dir, img)
        dst = os.path.join(IMG_LOGS_DIR, img)
        if os.path.exists(src):
            shutil.copy(src, dst)
            print(f"Copied specific image: {img} to assets/img/logs/")

def parse_whatsapp_chat():
    chat_file = os.path.join(PROMPTS_DATA_DIR, 'Chat de WhatsApp con Boti CABA', 'Chat de WhatsApp con Boti CABA.txt')
    logs = []
    
    # Regex para detectar fecha y hora
    # Ej: 18/4/2026, 01:35 - Boti CABA: ...
    # Ej: 26/3/2026, 12:37 - Boti CABA: ...
    date_regex = re.compile(r'^(\d{1,2}/\d{1,2}/\d{4}), (\d{2}:\d{2}) -')
    
    # Regex para extraer el número de trámite / solicitud
    # "Este es el número de trámite: 00503976/26."
    # "Número de solicitud: *00503976/26*"
    # "Podés seguirla con este número: *00114830/26*."
    ticket_regex = re.compile(r'(?:número de trámite:|Número de solicitud:|con este número:) [\*]?(\d{6,8}/\d{2})[\*\.]?', re.IGNORECASE)
    
    last_date = ""
    last_time = ""
    
    if not os.path.exists(chat_file):
        print(f"Chat file not found: {chat_file}")
        return logs
        
    with open(chat_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            date_match = date_regex.match(line)
            if date_match:
                last_date = date_match.group(1)
                last_time = date_match.group(2)
                
            ticket_match = ticket_regex.search(line)
            if ticket_match and last_date:
                ticket_number = ticket_match.group(1)
                
                # Check for duplicates (Boti might repeat the number in the same minute)
                is_duplicate = False
                for log in logs:
                    if log['ticket'] == ticket_number:
                        is_duplicate = True
                        break
                
                if not is_duplicate:
                    logs.append({
                        "id": f"evt-{len(logs)+1}",
                        "date": last_date,
                        "time": last_time,
                        "ticket": ticket_number,
                        "dba": None,
                        "youtube_id": None,
                        "description": "Reclamo reportado vía Boti"
                    })

    # Add specific manual entries for April 18 videos
    # 130am.mp4 and 530am.mp4
    # Sabado 18 de Abril de 2026
    logs.append({
        "id": "evt-vid-1",
        "date": "18/4/2026",
        "time": "01:30",
        "ticket": "N/A", 
        "dba": 95,
        "youtube_id": "eZNkS6g_VSM",
        "description": "El camión compactador pasó a vaciar los contenedores en medio de la madrugada."
    })
    
    logs.append({
        "id": "evt-vid-2",
        "date": "18/4/2026",
        "time": "05:30",
        "ticket": "N/A",
        "dba": 95,
        "youtube_id": "OXpXjX4af_0",
        "description": "El camión compactador volvió a pasar, sin dejar 4 horas seguidas de descanso."
    })

    logs.append({
        "id": "evt-vid-3",
        "date": "30/4/2026",
        "time": "21:20",
        "ticket": "N/A",
        "dba": 85.6,
        "youtube_id": "PfhZFV5p7kc",
        "description": "Medición de decibeles del camión compactador (85.6 dBA)."
    })
    
    # Sort logs by date (rudimentary sort, assumes format DD/MM/YYYY)
    def parse_date(d_str):
        parts = d_str.split('/')
        return f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
        
    logs.sort(key=lambda x: (parse_date(x['date']), x['time']), reverse=True)
    
    logs_file = os.path.join(DATA_DIR, 'logs.json')
    with open(logs_file, 'w', encoding='utf-8') as f:
        json.dump(logs, f, indent=4, ensure_ascii=False)
        
    print(f"Generated data/logs.json with {len(logs)} entries.")

def main():
    print("Setting up assets and folders...")
    create_dirs()
    create_gitignore()
    move_videos()
    organize_images()
    parse_whatsapp_chat()
    print("Done!")

if __name__ == "__main__":
    main()
