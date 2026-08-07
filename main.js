/**
 * "the play ground" — Gallery Engine
 *
 * Features:
 *  - Shelf view: mouse drag + touch swipe with momentum / inertia
 *  - Grid view: all items visible at once
 *  - View toggle with smooth crossfade
 *  - Vertical wheel → horizontal scroll (shelf mode)
 *  - Drag vs click 구분 (5px 이하 이동 = 클릭으로 판정, 링크 허용)
 *  - Instruction hint auto-fade
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
    let didDrag      = false;   // 실제로 움직였는지 (클릭 판정용)
    let startX       = 0;
    let scrollOrigin = 0;
    let velX         = 0;
    let lastX        = 0;
    let lastTime     = 0;
    let rafId        = null;

    const FRICTION       = 0.92;
    const STOP_THRESHOLD = 0.4;
    const DRAG_THRESHOLD = 5;   // px — 이 이상 움직여야 드래그로 판정

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
        startX       = getPageX(e) - container.offsetLeft;
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
        const walk = cx - container.offsetLeft - startX;

        // 드래그 임계값 넘으면 data-dragging 활성화 (hover/링크 억제)
        if (Math.abs(cx - (startX + container.offsetLeft)) > DRAG_THRESHOLD) {
            if (!didDrag) {
                didDrag = true;
                document.body.setAttribute('data-dragging', '');
            }
        }

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
    container.addEventListener('mousedown',  onDragStart);
    window.addEventListener   ('mousemove',  onDragMove);
    window.addEventListener   ('mouseup',    onDragEnd);
    container.addEventListener('mouseleave', onDragEnd);

    /* ── Touch events ── */
    container.addEventListener('touchstart', onDragStart, { passive: true  });
    container.addEventListener('touchmove',  onDragMove,  { passive: false });
    window.addEventListener   ('touchend',   onDragEnd);

    /* ── Auto-fade instruction ── */
    setTimeout(hideInstruction, 3000);

});
