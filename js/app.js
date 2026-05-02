document.addEventListener('DOMContentLoaded', () => {
    loadLogs();
    loadGallery();
});

async function loadLogs() {
    try {
        const response = await fetch('data/logs.json');
        const logs = await response.json();
        
        const tbody = document.getElementById('logs-body');
        
        logs.forEach(log => {
            const tr = document.createElement('tr');
            
            // Fecha
            const tdDate = document.createElement('td');
            tdDate.textContent = log.date;
            tr.appendChild(tdDate);
            
            // Hora
            const tdTime = document.createElement('td');
            tdTime.textContent = log.time;
            tr.appendChild(tdTime);
            
            // Ticket
            const tdTicket = document.createElement('td');
            tdTicket.innerHTML = log.ticket !== "N/A" ? `<strong>${log.ticket}</strong>` : `<span class="empty">N/A</span>`;
            tr.appendChild(tdTicket);
            
            // dBA
            const tdDba = document.createElement('td');
            if (log.dba) {
                tdDba.innerHTML = `<span class="badge badge-danger">${log.dba} dBA</span>`;
            } else {
                tdDba.innerHTML = `<span class="empty">-</span>`;
            }
            tr.appendChild(tdDba);
            
            // Evidencia / Youtube
            const tdYoutube = document.createElement('td');
            if (log.youtube_id && log.youtube_id.startsWith('PENDING')) {
                tdYoutube.innerHTML = `<span class="badge badge-warning">Pendiente de Subida</span>`;
            } else if (log.youtube_id) {
                tdYoutube.innerHTML = `<a href="https://youtu.be/${log.youtube_id}" target="_blank" style="color: var(--caba-yellow)">Ver Video</a>`;
            } else {
                tdYoutube.innerHTML = `<span class="empty">Sin Video</span>`;
            }
            tr.appendChild(tdYoutube);
            
            // Descripción
            const tdDesc = document.createElement('td');
            tdDesc.textContent = log.description || "";
            tr.appendChild(tdDesc);
            
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error cargando logs:', error);
    }
}

function loadGallery() {
    // Para simplificar, inyectamos los nombres de los archivos que sabemos que se copiaron
    const images = [
        "20260423_163719.jpg",
        "20260411_201514.jpg",
        "20260410_202250.jpg",
        "20260429_200636.jpg"
    ];
    
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    images.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = `assets/img/logs/${img}`;
        imgEl.alt = "Evidencia de contenedores desbordados";
        imgEl.loading = "lazy";
        grid.appendChild(imgEl);
    });
}
