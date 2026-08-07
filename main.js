/**
 * "the play ground" — Gallery Engine
 *
 * Features:
 *  - Mouse drag + touch swipe with momentum / inertia
 *  - Vertical wheel → horizontal scroll
 *  - Hover suppression while dragging (prevents flicker)
 *  - Instruction hint auto-fade on first interaction
 */

document.addEventListener('DOMContentLoaded', () => {

    const container   = document.getElementById('gallery-container');
    const instruction = document.querySelector('.gallery-instruction');
    const navItems    = document.querySelectorAll('.nav-item');
    const items       = document.querySelectorAll('.gallery-item');

    if (!container) return;

    /* ── State ── */
    let isDragging   = false;
    let startX       = 0;
    let scrollOrigin = 0;   // scrollLeft at drag start

    let velX      = 0;      // px / frame (~16 ms)
    let lastX     = 0;
    let lastTime  = 0;
    let rafId     = null;

    const FRICTION       = 0.92;   // deceleration (0 = instant stop, 1 = no stop)
    const STOP_THRESHOLD = 0.4;    // px/frame — below this, stop momentum
    const DRAG_CLASS     = 'is-dragging';

    /* ── Helpers ── */
    const cancelMomentum = () => {
        cancelAnimationFrame(rafId);
        rafId = null;
    };

    const hideInstruction = () => {
        instruction?.classList.add('fade-out');
    };

    const pageX = (e) =>
        e.touches ? e.touches[0].pageX : e.pageX;

    /* ── Drag start ── */
    const onDragStart = (e) => {
        cancelMomentum();
        isDragging   = true;
        startX       = pageX(e) - container.offsetLeft;
        scrollOrigin = container.scrollLeft;
        lastX        = pageX(e);
        lastTime     = performance.now();
        velX         = 0;

        container.classList.add(DRAG_CLASS);
        /* suppress CSS hover while dragging */
        document.body.setAttribute('data-dragging', '');
        hideInstruction();
    };

    /* ── Drag move ── */
    const onDragMove = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();

        const cx   = pageX(e);
        const walk = cx - container.offsetLeft - startX;
        container.scrollLeft = scrollOrigin - walk;

        /* velocity (px per ~16ms frame) */
        const now = performance.now();
        const dt  = now - lastTime;
        if (dt > 0) {
            velX = ((cx - lastX) / dt) * 16;
        }
        lastX    = cx;
        lastTime = now;
    };

    /* ── Drag end ── */
    const onDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        container.classList.remove(DRAG_CLASS);
        document.body.removeAttribute('data-dragging');

        if (Math.abs(velX) > STOP_THRESHOLD) {
            applyMomentum();
        }
    };

    /* ── Momentum loop ── */
    const applyMomentum = () => {
        velX              *= FRICTION;
        container.scrollLeft -= velX;

        if (Math.abs(velX) > STOP_THRESHOLD) {
            rafId = requestAnimationFrame(applyMomentum);
        } else {
            rafId = null;
        }
    };

    /* ── Wheel → horizontal ── */
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        cancelMomentum();
        hideInstruction();

        /* prefer deltaX (trackpad horizontal), fall back to deltaY (scroll wheel) */
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

    /* ── Nav active state ── */
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    /* ── Auto-fade instruction after 3 s ── */
    setTimeout(hideInstruction, 3000);

});
