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

    /* ── Grid 클릭 ── */
    gridContainer.addEventListener('click', (e) => {
        const el = e.target.closest('[data-link]');
        if (el) window.location.href = el.dataset.link;
    });

    /* ── Shelf: drag + click ── */
    let startX       = 0;
    let startY       = 0;
    let scrollOrigin = 0;
    let velX         = 0;
    let prevX        = 0;
    let prevTime     = 0;
    let pressing     = false;
    let moved        = false;
    let rafId        = null;

    const MOVE_THRESHOLD = 5;
    const FRICTION       = 0.92;
    const STOP_VEL       = 0.5;

    const stopMomentum = () => { cancelAnimationFrame(rafId); rafId = null; };

    const momentum = () => {
        velX *= FRICTION;
        container.scrollLeft -= velX;
        if (Math.abs(velX) > STOP_VEL) {
            rafId = requestAnimationFrame(momentum);
        } else {
            rafId = null;
        }
    };

    /* mousedown */
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
        e.preventDefault();
    });

    /* mousemove */
    window.addEventListener('mousemove', (e) => {
        if (!pressing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!moved && (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)) {
            moved = true;
        }
        container.scrollLeft = scrollOrigin - dx;

        const now = performance.now();
        const dt  = now - prevTime;
        if (dt > 0) velX = ((e.clientX - prevX) / dt) * 16;
        prevX    = e.clientX;
        prevTime = now;
    });

    /* mouseup */
    window.addEventListener('mouseup', (e) => {
        if (!pressing) return;
        pressing = false;

        if (!moved) {
            // 클릭 판정 — data-link 찾아서 이동
            const el = e.target.closest('[data-link]');
            if (el) {
                window.location.href = el.dataset.link;
                return;
            }
        }

        if (Math.abs(velX) > STOP_VEL) momentum();
    });

    /* wheel */
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        stopMomentum();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        container.scrollLeft += delta * 0.9;
    }, { passive: false });

    /* touch */
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
        if (!moved && Math.abs(dx) > MOVE_THRESHOLD) moved = true;
        container.scrollLeft = scrollOrigin - dx;

        const now = performance.now();
        const dt  = now - prevTime;
        if (dt > 0) velX = ((e.touches[0].clientX - prevX) / dt) * 16;
        prevX    = e.touches[0].clientX;
        prevTime = now;
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (!pressing) return;
        pressing = false;
        if (!moved) {
            const t = e.changedTouches[0];
            const el = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-link]');
            if (el) { window.location.href = el.dataset.link; return; }
        }
        if (Math.abs(velX) > STOP_VEL) momentum();
    });

    /* instruction fade */
    const hideHint = () => instruction?.classList.add('fade-out');
    container.addEventListener('mousedown', hideHint, { once: true });
    setTimeout(hideHint, 3000);

});
