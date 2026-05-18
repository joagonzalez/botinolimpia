document.addEventListener('DOMContentLoaded', () => {
    loadLogs();
    loadGallery();
});

function updateManifesto(logs) {
    const startDate = new Date(2026, 0, 27);
    const now = new Date();

    let months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    let days = now.getDate() - startDate.getDate();
    if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }

    const parts = [];
    if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);
    const elapsedText = parts.join(' y ');

    const claimCount = logs.filter(log => {
        if (!log.ticket || log.ticket === 'N/A') return false;
        const [d, m, y] = log.date.split('/').map(Number);
        return new Date(y, m - 1, d) >= startDate;
    }).length;

    const elapsedEl = document.getElementById('elapsed-time');
    const countEl = document.getElementById('claim-count');
    if (elapsedEl) elapsedEl.textContent = elapsedText;
    if (countEl) countEl.textContent = claimCount;
}

async function loadLogs() {
    try {
        const response = await fetch('data/logs.json');
        const logs = await response.json();

        updateManifesto(logs);

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
    const images = [
        "colchon1.jpeg",
        "colchon2.jpeg",
        "meo.jpeg",
        "20260410_202250.jpg",
        "20260429_200636.jpg",
        "IMG-20260219-WA0011.jpg",
        "IMG-20260404-WA0006.jpg",
        "IMG-20260404-WA0010.jpg"
    ];

    // Duplicamos el array para el efecto de scroll infinito (circular)
    const displayImages = [...images, ...images];

    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    displayImages.forEach(img => {
        const a = document.createElement('a');
        a.href = `assets/img/logs/${img}`;
        a.target = "_blank"; // open full image in new tab

        const imgEl = document.createElement('img');
        imgEl.src = `assets/img/logs/thumb_${img}`;
        imgEl.alt = "Evidencia de contenedores desbordados";
        imgEl.loading = "lazy";

        // Fallback just in case thumbnail generation failed or wasn't run
        imgEl.onerror = function () {
            this.onerror = null;
            this.src = `assets/img/logs/${img}`;
        };

        a.appendChild(imgEl);
        grid.appendChild(a);
    });
}
