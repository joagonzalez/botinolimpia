import json

with open('data/logs.json', 'r') as f:
    logs = json.load(f)

for log in logs:
    if log.get('dba') == 95:
        log['dba'] = 89
    
    if log.get('ticket') == 'N/A' or not log.get('ticket'):
        log['description'] = "Evento de ruido o recolección indebida registrado con video."

new_entries = [
    {
        "id": "evt-vid-5",
        "date": "2/5/2026",
        "time": "05:33",
        "ticket": "N/A",
        "dba": 89,
        "youtube_id": "ep6idf3lxIA",
        "description": "Evento de ruido o recolección indebida registrado con video."
    },
    {
        "id": "evt-vid-4",
        "date": "2/5/2026",
        "time": "00:08",
        "ticket": "N/A",
        "dba": 80,
        "youtube_id": "-6nCp3dBhEA",
        "description": "Evento de ruido o recolección indebida registrado con video."
    }
]

logs = new_entries + logs

with open('data/logs.json', 'w', encoding='utf-8') as f:
    json.dump(logs, f, indent=4, ensure_ascii=False)
