/* Grafico acumulado de reclamos y llamadas al 911.
   SVG inline, sin dependencias externas. Datos: data/logs.json */

const NS = 'http://www.w3.org/2000/svg';
const DAY = 86400000;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const SERIES = [
    { key: 'reclamo', label: 'Reclamos ingresados', cls: 's1', unit: ['reclamo', 'reclamos'] },
    { key: '911', label: 'Llamadas al 911', cls: 's2', unit: ['llamada al 911', 'llamadas al 911'] }
];

// Hitos anotados sobre el eje temporal
const MILESTONES = [
    { date: '17/5/2026', label: 'Carta formal ampliada' }
];

const W = 960, H = 440;
const M = { top: 34, right: 176, bottom: 56, left: 54 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

let chart = null;

document.addEventListener('DOMContentLoaded', init);

function parseDate(s) {
    const [d, m, y] = s.split('/').map(Number);
    return new Date(y, m - 1, d);
}

function el(tag, attrs) {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
}

function plural(n, [one, many]) {
    return `${n} ${n === 1 ? one : many}`;
}

async function init() {
    let logs;
    try {
        const res = await fetch(`data/logs.json?v=${Date.now()}`, { cache: 'no-store' });
        logs = await res.json();
    } catch (err) {
        console.error('Error cargando logs:', err);
        document.getElementById('chart-error').hidden = false;
        return;
    }

    const model = buildModel(logs);
    renderStats(logs, model);
    renderChart(model);
    renderTable(model);
}

function buildModel(logs) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = logs.map(l => ({ t: parseDate(l.date).getTime(), type: l.type }));
    const t0 = Math.min(...events.map(e => e.t));
    const t1 = Math.max(today.getTime(), ...events.map(e => e.t));

    const series = SERIES.map(s => {
        const times = events.filter(e => e.type === s.key).map(e => e.t).sort((a, b) => a - b);
        const pts = [{ t: t0, v: 0 }];
        times.forEach((t, i) => pts.push({ t, v: i + 1 }));
        pts.push({ t: t1, v: times.length });
        return Object.assign({}, s, { times, pts, total: times.length });
    });

    const yMax = Math.max(10, Math.ceil(Math.max(...series.map(s => s.total)) / 10) * 10);
    return { t0, t1, series, yMax, logs };
}

const x = (m, t) => M.left + ((t - m.t0) / (m.t1 - m.t0)) * PLOT_W;
const y = (m, v) => M.top + PLOT_H - (v / m.yMax) * PLOT_H;

// Cuantos eventos de la serie ocurrieron hasta el instante t (inclusive)
function valueAt(serie, t) {
    let n = 0;
    while (n < serie.times.length && serie.times[n] <= t) n++;
    return n;
}

function monthTicks(t0, t1) {
    const ticks = [];
    const d = new Date(t0);
    d.setDate(1);
    if (d.getTime() < t0) d.setMonth(d.getMonth() + 1);
    while (d.getTime() <= t1) {
        ticks.push({ t: d.getTime(), label: MONTHS[d.getMonth()], year: d.getFullYear(), month: d.getMonth() });
        d.setMonth(d.getMonth() + 1);
    }
    return ticks;
}

function renderStats(logs, m) {
    const reclamos = m.series[0].total;
    const llamadas = m.series[1].total;
    const dias = Math.round((m.t1 - m.t0) / DAY);
    const dbas = logs.filter(l => l.dba).map(l => l.dba);

    document.getElementById('hero-value').textContent = reclamos;
    document.getElementById('stat-911').textContent = llamadas;
    document.getElementById('stat-dias').textContent = dias;
    document.getElementById('stat-dba').textContent = dbas.length
        ? `${Math.max(...dbas)} dBA`
        : '—';
    document.getElementById('stat-dba-label').textContent = dbas.length === 1
        ? 'Pico registrado en 1 medición con decibelímetro'
        : `Pico registrado en ${dbas.length} mediciones con decibelímetro`;
}

function renderChart(m) {
    const svg = document.getElementById('chart');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const yTickStep = m.yMax / 4;

    // Grilla horizontal + ticks del eje Y
    for (let v = 0; v <= m.yMax; v += yTickStep) {
        const yy = y(m, v);
        svg.appendChild(el('line', {
            x1: M.left, x2: M.left + PLOT_W, y1: yy, y2: yy,
            class: v === 0 ? 'axis-rule' : 'grid-line'
        }));
        const t = el('text', { x: M.left - 12, y: yy + 4, class: 'tick tick-y' });
        t.textContent = v;
        svg.appendChild(t);
    }

    // Ticks del eje X (un mes por tick)
    monthTicks(m.t0, m.t1).forEach(tick => {
        const xx = x(m, tick.t);
        svg.appendChild(el('line', {
            x1: xx, x2: xx, y1: M.top + PLOT_H, y2: M.top + PLOT_H + 6, class: 'axis-rule'
        }));
        const t = el('text', { x: xx, y: M.top + PLOT_H + 22, class: 'tick tick-x' });
        t.textContent = tick.label;
        svg.appendChild(t);
        if (tick.month === 0 || tick.t === monthTicks(m.t0, m.t1)[0].t) {
            const yr = el('text', { x: xx, y: M.top + PLOT_H + 38, class: 'tick tick-x tick-year' });
            yr.textContent = tick.year;
            svg.appendChild(yr);
        }
    });

    // Hitos
    MILESTONES.forEach(ms => {
        const t = parseDate(ms.date).getTime();
        if (t < m.t0 || t > m.t1) return;
        const xx = x(m, t);
        svg.appendChild(el('line', {
            x1: xx, x2: xx, y1: M.top - 8, y2: M.top + PLOT_H, class: 'milestone-rule'
        }));
        const label = el('text', { x: xx + 6, y: M.top - 14, class: 'milestone-label' });
        label.textContent = ms.label;
        svg.appendChild(label);
    });

    // Series: linea escalonada (el valor cambia el dia del evento y se mantiene)
    m.series.forEach(s => {
        let d = `M ${x(m, s.pts[0].t).toFixed(2)} ${y(m, s.pts[0].v).toFixed(2)}`;
        for (let i = 1; i < s.pts.length; i++) {
            d += ` H ${x(m, s.pts[i].t).toFixed(2)} V ${y(m, s.pts[i].v).toFixed(2)}`;
        }
        svg.appendChild(el('path', { d, class: `serie-line ${s.cls}` }));

        const last = s.pts[s.pts.length - 1];
        const ex = x(m, last.t), ey = y(m, last.v);
        svg.appendChild(el('circle', { cx: ex, cy: ey, r: 4.5, class: `serie-dot ${s.cls}` }));

        // Etiqueta directa en el extremo
        const val = el('text', { x: ex + 16, y: ey + 1, class: 'end-value' });
        val.textContent = s.total;
        svg.appendChild(val);
        const lbl = el('text', { x: ex + 16, y: ey + 18, class: 'end-label' });
        lbl.textContent = s.label;
        svg.appendChild(lbl);
    });

    buildLegend();
    attachHover(svg, m);
}

function buildLegend() {
    const legend = document.getElementById('legend');
    SERIES.forEach(s => {
        const item = document.createElement('span');
        item.className = 'legend-item';
        const key = document.createElementNS(NS, 'svg');
        key.setAttribute('width', '18');
        key.setAttribute('height', '10');
        key.setAttribute('aria-hidden', 'true');
        key.appendChild(el('line', { x1: 1, x2: 17, y1: 5, y2: 5, class: `serie-line ${s.cls}` }));
        item.appendChild(key);
        const text = document.createElement('span');
        text.textContent = s.label;
        item.appendChild(text);
        legend.appendChild(item);
    });
}

function attachHover(svg, m) {
    const crosshair = el('line', {
        y1: M.top - 8, y2: M.top + PLOT_H, class: 'crosshair', visibility: 'hidden'
    });
    svg.appendChild(crosshair);

    const dots = m.series.map(s => {
        const c = el('circle', { r: 5, class: `hover-dot ${s.cls}`, visibility: 'hidden' });
        svg.appendChild(c);
        return c;
    });

    const hit = el('rect', {
        x: M.left, y: M.top, width: PLOT_W, height: PLOT_H,
        fill: 'transparent', class: 'hit-area'
    });
    svg.appendChild(hit);

    const tooltip = document.getElementById('tooltip');
    let cursorT = m.t1;

    function show(t) {
        cursorT = Math.min(m.t1, Math.max(m.t0, t));
        const xx = x(m, cursorT);
        crosshair.setAttribute('x1', xx);
        crosshair.setAttribute('x2', xx);
        crosshair.setAttribute('visibility', 'visible');

        const values = m.series.map(s => valueAt(s, cursorT));
        m.series.forEach((s, i) => {
            dots[i].setAttribute('cx', xx);
            dots[i].setAttribute('cy', y(m, values[i]));
            dots[i].setAttribute('visibility', 'visible');
        });

        const d = new Date(cursorT);
        tooltip.replaceChildren();
        const head = document.createElement('div');
        head.className = 'tt-date';
        head.textContent = `${d.getDate()} de ${MONTHS_LONG[d.getMonth()]} de ${d.getFullYear()}`;
        tooltip.appendChild(head);
        m.series.forEach((s, i) => {
            const row = document.createElement('div');
            row.className = 'tt-row';
            const key = document.createElementNS(NS, 'svg');
            key.setAttribute('width', '14');
            key.setAttribute('height', '10');
            key.setAttribute('aria-hidden', 'true');
            key.appendChild(el('line', { x1: 1, x2: 13, y1: 5, y2: 5, class: `serie-line ${s.cls}` }));
            row.appendChild(key);
            const val = document.createElement('strong');
            val.textContent = values[i];
            row.appendChild(val);
            const name = document.createElement('span');
            name.textContent = values[i] === 1 ? s.unit[0] : s.unit[1];
            row.appendChild(name);
            tooltip.appendChild(row);
        });

        const rect = svg.getBoundingClientRect();
        const px = (xx / W) * rect.width;
        tooltip.hidden = false;
        const flip = px > rect.width * 0.6;
        tooltip.style.left = `${px + (flip ? -12 : 12)}px`;
        tooltip.style.transform = flip ? 'translateX(-100%)' : 'none';
        tooltip.setAttribute('aria-hidden', 'false');
    }

    function hide() {
        crosshair.setAttribute('visibility', 'hidden');
        dots.forEach(d => d.setAttribute('visibility', 'hidden'));
        tooltip.hidden = true;
        tooltip.setAttribute('aria-hidden', 'true');
    }

    function tFromEvent(ev) {
        const rect = svg.getBoundingClientRect();
        const ratio = (ev.clientX - rect.left) / rect.width;
        const svgX = ratio * W;
        return m.t0 + ((svgX - M.left) / PLOT_W) * (m.t1 - m.t0);
    }

    hit.addEventListener('pointermove', ev => show(tFromEvent(ev)));
    hit.addEventListener('pointerleave', hide);

    // Mismo detalle por teclado que por hover
    svg.addEventListener('focus', () => show(cursorT));
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', ev => {
        const step = (ev.shiftKey ? 7 : 1) * DAY;
        if (ev.key === 'ArrowRight') { show(cursorT + step); ev.preventDefault(); }
        else if (ev.key === 'ArrowLeft') { show(cursorT - step); ev.preventDefault(); }
        else if (ev.key === 'Home') { show(m.t0); ev.preventDefault(); }
        else if (ev.key === 'End') { show(m.t1); ev.preventDefault(); }
        else if (ev.key === 'Escape') hide();
    });
}

function renderTable(m) {
    const tbody = document.getElementById('evolucion-body');
    const buckets = new Map();

    m.series.forEach((s, si) => {
        s.times.forEach(t => {
            const d = new Date(t);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!buckets.has(key)) buckets.set(key, { key, d: new Date(d.getFullYear(), d.getMonth(), 1), n: [0, 0] });
            buckets.get(key).n[si]++;
        });
    });

    const rows = [...buckets.values()].sort((a, b) => a.d - b.d);
    const acc = [0, 0];
    rows.forEach(r => {
        acc[0] += r.n[0];
        acc[1] += r.n[1];
        const tr = document.createElement('tr');
        const cells = [
            `${MONTHS_LONG[r.d.getMonth()]} ${r.d.getFullYear()}`,
            r.n[0] || '—',
            acc[0],
            r.n[1] || '—',
            acc[1]
        ];
        cells.forEach((c, i) => {
            const td = document.createElement('td');
            td.textContent = c;
            if (i > 0) td.className = 'num';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}
