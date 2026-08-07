/**
 * "the play ground" — Gallery Engine
 */

document.addEventListener('DOMContentLoaded', () => {

    const container     = document.getElementById('gallery-container');
    const gridContainer = document.getElementById('grid-container');
    const btnShelf      = document.getElementById('btn-shelf');
    const btnGrid       = document.getElementById('btn-grid');
    const instruction   = document.querySelector('.gallery-instruction');

    if (!container) return;

    /* ── Drag state ── */
    let isDragging   = false;
    let didDrag      = false;
    let startX       = 0;
    let startY       = 0;
    let scrollOrigin = 0;
    let velX         = 0;
    let lastX        = 0;
    let lastTime     = 0;
    let rafId        = null;

    const FRICTION       = 0.92;
    const STOP_THRESHOLD = 0.4;
    const DRAG_THRESHOLD = 5;   // px 이상 움직이면 드래그

    const cancelMomentum  = () => { cancelAnimationFrame(rafId); rafId = null; };
    const hideInstruction = () => instruction?.classList.add('fade-out');
    const getPageX        = (e) => e.touches ? e.touches[0].pageX : e.pageX;

    /* ── View toggle ── */
    let currentView = 'shelf';

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
    btnGrid.addEventListener ('click', switchToGrid);

    /* ── Drag start ── */
    const onDragStart = (e) => {
        if (currentView !== 'shelf') return;
        cancelMomentum();
        isDragging   = true;
        didDrag      = false;
        startX       = e.clientX ?? e.touches?.[0].clientX;
        startY       = e.clientY ?? e.touches?.[0].clientY;
        scrollOrigin = container.scrollLeft;
        lastX        = getPageX(e);
        lastTime     = performance.now();
        velX         = 0;
        hideInstruction();
    };

    /* ── Drag move ── */
    const onDragMove = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();

        const cx   = getPageX(e);
        const walk = cx - getPageX({ clientX: startX }) - 0;
        // scrollLeft 직접 계산
        container.scrollLeft = scrollOrigin - (cx - (startX + container.getBoundingClientRect().left));

        const dx = Math.abs((e.clientX ?? e.touches?.[0].clientX) - startX);
        const dy = Math.abs((e.clientY ?? e.touches?.[0].clientY) - startY);
        if (!didDrag && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
            didDrag = true;
        }

        const now = performance.now();
        const dt  = now - lastTime;
        if (dt > 0) velX = ((cx - lastX) / dt) * 16;
        lastX    = cx;
        lastTime = now;
    };

    /* ── Drag end + click 판정 ── */
    const onDragEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;

        // 드래그하지 않았으면 → 클릭으로 판정
        if (!didDrag) {
            const target = e.target ?? e.changedTouches?.[0];
            const el = (e.target || document.elementFromPoint(
                e.changedTouches?.[0].clientX,
                e.changedTouches?.[0].clientY
            ));
            const linkEl = el?.closest('[data-link]');
            if (linkEl) {
                window.location.href = linkEl.dataset.link;
                return;
            }
        }

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

    /* ── Wheel → horizontal ── */
    container.addEventListener('wheel', (e) => {
        if (currentView !== 'shelf') return;
        e.preventDefault();
        cancelMomentum();
        hideInstruction();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        container.scrollLeft += delta * 0.9;
    }, { passive: false });

    /* ── Mouse events ── */
    container.addEventListener('mousedown', onDragStart);
    window.addEventListener   ('mousemove', onDragMove);
    window.addEventListener   ('mouseup',   onDragEnd);

    /* ── Touch events ── */
    container.addEventListener('touchstart', onDragStart, { passive: true  });
    container.addEventListener('touchmove',  onDragMove,  { passive: false });
    window.addEventListener   ('touchend',   onDragEnd);

    /* ── Grid item 클릭 ── */
    gridContainer.addEventListener('click', (e) => {
        const linkEl = e.target.closest('[data-link]');
        if (linkEl) window.location.href = linkEl.dataset.link;
    });

    /* ── Auto-fade instruction ── */
    setTimeout(hideInstruction, 3000);

});
