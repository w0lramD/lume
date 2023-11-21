import { clamp } from '../math/clamp.js';
export class FlingRotation {
    /** The object that will be rotated on Y. Required. */
    rotationYTarget;
    /**
     * The object that will be rotated on X. Defaults to the element inside the
     * rotationYTarget (it's like a gimball).
     */
    rotationXTarget;
    /**
     * The element on which the pointer should be placed down on in order to
     * initiate drag tracking. This defaults to rotationXTarget.
     */
    interactionInitiator;
    /**
     * The X rotation can not go below this value. Defaults to -90 which means
     * facing straight up.
     */
    minFlingRotationX = -90;
    /**
     * The X rotation can not go above this value. Defaults to 90 which means
     * facing straight down.
     */
    maxFlingRotationX = 90;
    /**
     * The Y rotation can not go below this value. Defaults to -Infinity which
     * means the camera can keep rotating laterally around the focus point
     * indefinitely.
     */
    minFlingRotationY = -Infinity;
    /**
     * The Y rotation can not go below this value. Defaults to Infinity which
     * means the camera can keep rotating laterally around the focus point
     * indefinitely.
     */
    maxFlingRotationY = Infinity;
    /**
     * The area in which drag tacking will happen. Defaults to document because
     * usually you want to track in the whole viewport, otherwise if the pointer
     * comes up outside of this area it will leave things in a bad state.
     */
    interactionContainer = document;
    factor = 1;
    #aborter = new AbortController();
    constructor(options) {
        Object.assign(this, options);
        // FlingRotation is dependent on tree structure (unless otherwise
        // specified by the input options), at least for now.
        if (!this.rotationXTarget)
            this.rotationXTarget = this.rotationYTarget.children[0];
        if (!this.interactionInitiator)
            this.interactionInitiator = this.rotationXTarget;
    }
    #onMove;
    #onPointerUp;
    #mainPointer = -1;
    #pointerCount = 0;
    // The last X/Y only for a single pointer (the rest are ignored).
    #lastX = 0;
    #lastY = 0;
    #onPointerDown = (event) => {
        this.#pointerCount++;
        if (this.#pointerCount === 1)
            this.#mainPointer = event.pointerId;
        else
            return;
        // Stop rotation if any.
        this.rotationXTarget.rotation = () => false;
        this.rotationYTarget.rotation = () => false;
        this.#lastX = event.x;
        this.#lastY = event.y;
        let deltaX = 0;
        let deltaY = 0;
        this.#onMove = (event) => {
            if (event.pointerId !== this.#mainPointer)
                return;
            // We're not simply using event.movementX and event.movementY
            // because of a Safari bug:
            // https://bugs.webkit.org/show_bug.cgi?id=248119
            const movementX = event.x - this.#lastX;
            const movementY = event.y - this.#lastY;
            this.#lastX = event.x;
            this.#lastY = event.y;
            deltaX = movementY * 0.15 * this.factor;
            this.rotationXTarget.rotation.x = clamp(this.rotationXTarget.rotation.x + deltaX, this.minFlingRotationX, this.maxFlingRotationX);
            deltaY = -movementX * 0.15 * this.factor;
            this.rotationYTarget.rotation.y = clamp(this.rotationYTarget.rotation.y + deltaY, this.minFlingRotationY, this.maxFlingRotationY);
        };
        // @ts-expect-error, whyyyy TypeScript TODO fix TypeScript lib.dom types.
        this.interactionContainer.addEventListener('pointermove', this.#onMove, { signal: this.#aborter.signal });
        this.interactionContainer.addEventListener('pointerup', (this.#onPointerUp = () => {
            this.#pointerCount--;
            // TODO this is good enough, but letting go of the main pointer
            // should fall back to another pointer for to continue rotation.
            const mainPointer = this.#mainPointer;
            if (this.#pointerCount === 0) {
                this.#mainPointer = -1;
                // @ts-expect-error, whyyyy TypeScript TODO fix TypeScript lib.dom types.
                this.interactionContainer.removeEventListener('pointerup', this.#onPointerUp);
            }
            if (event.pointerId !== mainPointer)
                return;
            // stop dragging
            // @ts-expect-error, whyyyy TypeScript TODO fix TypeScript lib.dom types.
            this.interactionContainer.removeEventListener('pointermove', this.#onMove);
            if (deltaX === 0 && deltaY === 0)
                return;
            // slow the rotation down based on former drag speed
            this.rotationXTarget.rotation = (x, y, z) => {
                deltaX = deltaX * 0.95;
                // stop rotation once the delta is small enough that we
                // no longer notice the rotation.
                if (Math.abs(deltaX) < 0.01)
                    return false;
                return [clamp(x + deltaX, this.minFlingRotationX, this.maxFlingRotationX), y, z];
            };
            this.rotationYTarget.rotation = (x, y, z) => {
                deltaY = deltaY * 0.95;
                // stop rotation once the delta is small enough that we
                // no longer notice the rotation.
                if (Math.abs(deltaY) < 0.01)
                    return false;
                return [x, clamp(y + deltaY, this.minFlingRotationY, this.maxFlingRotationY), z];
            };
        }), { signal: this.#aborter.signal });
    };
    #onDragStart = (event) => event.preventDefault();
    #isStarted = false;
    start() {
        if (this.#isStarted)
            return this;
        this.#isStarted = true;
        // @ts-expect-error, whyyyy TypeScript TODO fix TypeScript lib.dom types.
        this.interactionInitiator.addEventListener('pointerdown', this.#onPointerDown, { signal: this.#aborter.signal });
        // Hack needed for Chrome (works fine in Firefox) otherwise
        // pointercancel breaks the drag handling. See
        // https://crbug.com/1166044
        // @ts-expect-error, whyyyy TypeScript TODO fix TypeScript lib.dom types.
        this.interactionInitiator.addEventListener('dragstart', this.#onDragStart, { signal: this.#aborter.signal });
        this.interactionInitiator.addEventListener('pointercancel', () => {
            throw new Error('Pointercancel should not be happening. If so, please open a bug report.');
        }, { signal: this.#aborter.signal });
        return this;
    }
    stop() {
        if (!this.#isStarted)
            return this;
        this.#isStarted = false;
        this.#mainPointer = -1;
        this.#pointerCount = 0;
        // Stop any current animation.
        this.rotationXTarget.rotation = () => false;
        this.rotationYTarget.rotation = () => false;
        this.#aborter.abort();
        return this;
    }
}
//# sourceMappingURL=FlingRotation.js.map