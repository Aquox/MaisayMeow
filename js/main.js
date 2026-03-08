// ── Custom Cursor (solo activo si los elementos existen en el HTML) ──
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

if (cursor && ring) {
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
    });

    (function animateRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(animateRing);
    })();
}

// ── Scroll Reveal ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));

// ── Active Nav Link on Scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

let ticking = false;
window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        let current = '';
        const scrollBottom = window.scrollY + window.innerHeight;
        const pageHeight = document.body.scrollHeight;

        // Si estamos cerca del final, forzar la última sección activa
        if (scrollBottom >= pageHeight - 50) {
            current = sections[sections.length - 1].getAttribute('id');
        } else {
            sections.forEach(s => {
                if (window.scrollY >= s.offsetTop - window.innerHeight / 3) {
                    current = s.getAttribute('id');
                }
            });
        }

        navLinks.forEach(a => {
            a.style.color = '';
            a.classList.toggle('nav-active', a.getAttribute('href') === '#' + current);
        });
        ticking = false;
    });
});

// ── TikTok Thumbnails via oEmbed ──
async function loadTikTokThumbnails() {
    const cards = document.querySelectorAll('.video-card');

    for (const card of cards) {
        const url = card.getAttribute('href');
        if (!url || !url.includes('tiktok.com')) continue;

        const thumb = card.querySelector('.video-card-thumb');
        if (!thumb) continue;

        try {
            // oEmbed devuelve JSON con thumbnail_url
            const apiUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
            const res = await fetch(apiUrl);
            if (!res.ok) continue;
            const data = await res.json();

            if (data.thumbnail_url) {
                thumb.style.backgroundImage = `url('${data.thumbnail_url}')`;
                thumb.style.backgroundSize = 'cover';
                thumb.style.backgroundPosition = 'center';
                // Oscurecer un poco para que el overlay se vea bien
                thumb.style.setProperty('--has-thumb', '1');
                card.classList.add('has-thumbnail');
            }
        } catch (e) {
            // Si falla el fetch, la tarjeta se queda con el fondo degradado
            console.warn('No se pudo cargar miniatura para:', url);
        }
    }
}

loadTikTokThumbnails();


// ── Hero Particles ──
(function () {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Shapes: star ✦, dot, sparkle ✧, heart ♡
    const SHAPES = ['star', 'dot', 'sparkle', 'heart'];
    const COLORS = ['#e8607a', '#f0a0b0', '#f5c8d0', '#ffffff', '#c94060'];
    const COUNT  = 120;

    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function createParticle() {
        return {
            x: rand(0, W),
            y: rand(0, H),
            size: rand(2, 7),
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: rand(0.1, 0.7),
            alphaDir: rand(0.003, 0.008) * (Math.random() > 0.5 ? 1 : -1),
            vx: rand(-0.25, 0.25),
            vy: rand(-0.4, -0.08),
            rotation: rand(0, Math.PI * 2),
            rotSpeed: rand(-0.015, 0.015),
        };
    }

    function drawStar(ctx, x, y, r) {
        const spikes = 4, inner = r * 0.4;
        let rot = (Math.PI / spikes);
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const rr = i % 2 === 0 ? r : inner;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            i === 0 ? ctx.moveTo(x + rr * Math.cos(angle), y + rr * Math.sin(angle))
                     : ctx.lineTo(x + rr * Math.cos(angle), y + rr * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
    }

    function drawSparkle(ctx, x, y, r) {
        // thin 4-point cross
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.lineTo(x, y + r);
        ctx.moveTo(x - r, y);
        ctx.lineTo(x + r, y);
        // diagonals shorter
        const d = r * 0.45;
        ctx.moveTo(x - d, y - d);
        ctx.lineTo(x + d, y + d);
        ctx.moveTo(x + d, y - d);
        ctx.lineTo(x - d, y + d);
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = r * 0.28;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function drawHeart(ctx, x, y, r) {
        ctx.beginPath();
        ctx.moveTo(x, y + r * 0.3);
        ctx.bezierCurveTo(x, y - r * 0.3, x - r, y - r * 0.3, x - r, y);
        ctx.bezierCurveTo(x - r, y + r * 0.6, x, y + r, x, y + r);
        ctx.bezierCurveTo(x, y + r, x + r, y + r * 0.6, x + r, y);
        ctx.bezierCurveTo(x + r, y - r * 0.3, x, y - r * 0.3, x, y + r * 0.3);
        ctx.closePath();
        ctx.fill();
    }

    function draw(p) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        switch (p.shape) {
            case 'star':    drawStar(ctx, 0, 0, p.size); break;
            case 'sparkle': drawSparkle(ctx, 0, 0, p.size * 1.4); break;
            case 'heart':   drawHeart(ctx, 0, 0, p.size * 0.7); break;
            default:
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
        }
        ctx.restore();
    }

    function update(p) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.alpha += p.alphaDir;
        if (p.alpha <= 0.05 || p.alpha >= 0.75) p.alphaDir *= -1;
        // recycle when off-screen
        if (p.y < -20 || p.x < -20 || p.x > W + 20) {
            Object.assign(p, createParticle(), { y: H + 10, x: rand(0, W) });
        }
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { update(p); draw(p); });
        requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    particles = Array.from({ length: COUNT }, (_, i) => {
        const p = createParticle();
        // Distribuir uniformemente en Y al inicio para que no se vea vacío
        p.y = (i / COUNT) * H + rand(-50, 50);
        return p;
    });
    loop();
})();