document.addEventListener('DOMContentLoaded', () => {

    const container     = document.getElementById('gallery-container');
    const gridContainer = document.getElementById('grid-container');
    const btnShelf      = document.getElementById('btn-shelf');
    const btnGrid       = document.getElementById('btn-grid');
    const instruction   = document.querySelector('.gallery-instruction');

    if (!container) return;

    /* ── View toggle ── */
    let currentView = 'shelf';

    btnShelf.addEventListener('click', () => {
        currentView = 'shelf';
        container.classList.remove('hidden');
        gridContainer.classList.remove('visible');
        gridContainer.setAttribute('aria-hidden', 'true');
        btnShelf.classList.add('active');
        btnGrid.classList.remove('active');
    });

    btnGrid.addEventListener('click', () => {
        currentView = 'grid';
        container.classList.add('hidden');
        gridContainer.classList.add('visible');
        gridContainer.removeAttribute('aria-hidden');
        btnGrid.classList.add('active');
        btnShelf.classList.remove('active');
    });

    /* ── Drag ── */
    let startX       = 0;
    let startY       = 0;
    let scrollOrigin = 0;
    let velX         = 0;
    let prevX        = 0;
    let prevTime     = 0;
    let pressing     = false;
    let moved        = false;
    let rafId        = null;

    const MOVE_THRESHOLD = 6;
    const FRICTION       = 0.92;

    const stopMomentum = () => { cancelAnimationFrame(rafId); rafId = null; };

    const momentum = () => {
        velX *= FRICTION;
        container.scrollLeft -= velX;
        if (Math.abs(velX) > 0.5) rafId = requestAnimationFrame(momentum);
        else rafId = null;
    };

    container.addEventListener('mousedown', (e) => {
        stopMomentum();
        pressing     = true;
        moved        = false;
        startX       = e.clientX;
        startY       = e.clientY;
        scrollOrigin = container.scrollLeft;
        prevX        = e.clientX;
        prevTime     = performance.now();
        velX         = 0;
        // preventDefault 제거 — click 이벤트가 정상 발생해야 함
    });

    window.addEventListener('mousemove', (e) => {
        if (!pressing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
            moved = true;
        }
        if (moved) {
            container.scrollLeft = scrollOrigin - dx;
            const now = performance.now();
            const dt  = now - prevTime;
            if (dt > 0) velX = ((e.clientX - prevX) / dt) * 16;
            prevX    = e.clientX;
            prevTime = now;
        }
    });

    window.addEventListener('mouseup', () => {
        if (!pressing) return;
        pressing = false;
        if (moved && Math.abs(velX) > 0.5) momentum();
    });

    /* ── click → 링크 이동 (드래그 아닐 때만) ── */
    container.addEventListener('click', (e) => {
        if (moved) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        const el = e.target.closest('[data-link]');
        if (el) window.location.href = el.dataset.link;
    });

    gridContainer.addEventListener('click', (e) => {
        const el = e.target.closest('[data-link]');
        if (el) window.location.href = el.dataset.link;
    });

    /* ── wheel ── */
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        stopMomentum();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        container.scrollLeft += delta * 0.9;
    }, { passive: false });

    /* ── touch ── */
    container.addEventListener('touchstart', (e) => {
        stopMomentum();
        pressing     = true;
        moved        = false;
        startX       = e.touches[0].clientX;
        startY       = e.touches[0].clientY;
        scrollOrigin = container.scrollLeft;
        prevX        = e.touches[0].clientX;
        prevTime     = performance.now();
        velX         = 0;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!pressing) return;
        e.preventDefault();
        const dx = e.touches[0].clientX - startX;
        if (Math.abs(dx) > MOVE_THRESHOLD) moved = true;
        if (moved) {
            container.scrollLeft = scrollOrigin - dx;
            const now = performance.now();
            const dt  = now - prevTime;
            if (dt > 0) velX = ((e.touches[0].clientX - prevX) / dt) * 16;
            prevX    = e.touches[0].clientX;
            prevTime = now;
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (!pressing) return;
        pressing = false;
        if (!moved) {
            const t  = e.changedTouches[0];
            const el = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-link]');
            if (el) { window.location.href = el.dataset.link; return; }
        }
        if (Math.abs(velX) > 0.5) momentum();
    });

    /* ── cursor style ── */
    container.addEventListener('mousedown', () => container.style.cursor = 'grabbing');
    window.addEventListener('mouseup', () => container.style.cursor = 'grab');

    /* ── instruction fade ── */
    setTimeout(() => instruction?.classList.add('fade-out'), 3000);

});
