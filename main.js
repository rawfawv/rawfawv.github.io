/**
 * "the play ground" — Gallery Engine
 *
 * Features:
 *  - Shelf view: mouse drag + touch swipe with momentum / inertia
 *  - Grid view: all items visible at once
 *  - View toggle with smooth crossfade
 *  - Vertical wheel → horizontal scroll (shelf mode)
 *  - Hover suppression while dragging
 *  - Instruction hint auto-fade
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ── 4.png 클릭 → fish-game 이동 ── */
    document.querySelectorAll('img[src="assets/4.png"]').forEach(img => {
        const item = img.closest('.gallery-item, .grid-item');
        if (item) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                // 드래그 중에는 무시
                if (document.body.hasAttribute('data-dragging')) return;
                window.location.href = 'fish-game/index.html';
            });
        }
    });

    /* ── Elements ── */
    const container   = document.getElementById('gallery-container');
    const gridContainer = document.getElementById('grid-container');
    const btnShelf    = document.getElementById('btn-shelf');
    const btnGrid     = document.getElementById('btn-grid');
    const instruction = document.querySelector('.gallery-instruction');

    if (!container) return;

    /* ── Drag state ── */
    let isDragging   = false;
    let startX       = 0;
    let scrollOrigin = 0;
    let velX         = 0;
    let lastX        = 0;
    let lastTime     = 0;
    let rafId        = null;

    const FRICTION       = 0.92;
    const STOP_THRESHOLD = 0.4;

    /* ── Helpers ── */
    const cancelMomentum = () => { cancelAnimationFrame(rafId); rafId = null; };
    const hideInstruction = () => instruction?.classList.add('fade-out');
    const getPageX = (e) => e.touches ? e.touches[0].pageX : e.pageX;

    /* ── View toggle ── */
    let currentView = 'shelf'; // 'shelf' | 'grid'

    const switchToShelf = () => {
        currentView = 'shelf';
        container.classList.remove('hidden');
        gridContainer.classList.remove('visible');
        gridContainer.setAttribute('aria-hidden', 'true');
        btnShelf.classList.add('active');
        btnGrid.classList.remove('active');
    };

    const switchToGrid = () => {
        currentView = 'grid';
        container.classList.add('hidden');
        gridContainer.classList.add('visible');
        gridContainer.removeAttribute('aria-hidden');
        btnGrid.classList.add('active');
        btnShelf.classList.remove('active');
        cancelMomentum();
        hideInstruction();
    };

    btnShelf.addEventListener('click', switchToShelf);
    btnGrid.addEventListener('click',  switchToGrid);

    /* ── Drag start ── */
    const onDragStart = (e) => {
        if (currentView !== 'shelf') return;
        cancelMomentum();
        isDragging   = true;
        startX       = getPageX(e) - container.offsetLeft;
        scrollOrigin = container.scrollLeft;
        lastX        = getPageX(e);
        lastTime     = performance.now();
        velX         = 0;

        document.body.setAttribute('data-dragging', '');
        hideInstruction();
    };

    /* ── Drag move ── */
    const onDragMove = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();

        const cx   = getPageX(e);
        const walk = cx - container.offsetLeft - startX;
        container.scrollLeft = scrollOrigin - walk;

        const now = performance.now();
        const dt  = now - lastTime;
        if (dt > 0) velX = ((cx - lastX) / dt) * 16;
        lastX    = cx;
        lastTime = now;
    };

    /* ── Drag end ── */
    const onDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        document.body.removeAttribute('data-dragging');
        if (Math.abs(velX) > STOP_THRESHOLD) applyMomentum();
    };

    /* ── Momentum loop ── */
    const applyMomentum = () => {
        velX *= FRICTION;
        container.scrollLeft -= velX;
        if (Math.abs(velX) > STOP_THRESHOLD) {
            rafId = requestAnimationFrame(applyMomentum);
        } else {
            rafId = null;
        }
    };

    /* ── Wheel → horizontal (shelf only) ── */
    container.addEventListener('wheel', (e) => {
        if (currentView !== 'shelf') return;
        e.preventDefault();
        cancelMomentum();
        hideInstruction();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        container.scrollLeft += delta * 0.9;
    }, { passive: false });

    /* ── Mouse events ── */
    container.addEventListener('mousedown',  onDragStart);
    window.addEventListener   ('mousemove',  onDragMove);
    window.addEventListener   ('mouseup',    onDragEnd);
    container.addEventListener('mouseleave', onDragEnd);

    /* ── Touch events ── */
    container.addEventListener('touchstart', onDragStart, { passive: true  });
    container.addEventListener('touchmove',  onDragMove,  { passive: false });
    window.addEventListener   ('touchend',   onDragEnd);

    /* ── Auto-fade instruction after 3s ── */
    setTimeout(hideInstruction, 3000);

});
