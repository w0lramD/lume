var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { createSignal, untrack } from 'solid-js';
import { reactive, signal } from 'classy-solid';
import { Motor } from '../core/Motor.js';
import { clamp } from '../math/clamp.js';
let PinchFling = (() => {
    let _classDecorators = [reactive];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _x_decorators;
    let _x_initializers = [];
    var PinchFling = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _x_decorators = [signal];
            __esDecorate(null, null, _x_decorators, { kind: "field", name: "x", static: false, private: false, access: { has: obj => "x" in obj, get: obj => obj.x, set: (obj, value) => { obj.x = value; } }, metadata: _metadata }, _x_initializers, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PinchFling = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        /**
         * During pinch, this value will change. It is a signal so that it can be
         * observed. Set this value initially if you want to start at a certain
         * value.
         */
        x = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _x_initializers, 0));
        minX = -Infinity;
        maxX = Infinity;
        target = document;
        factor = 1;
        #task;
        #interacting = (() => {
            const { 0: get, 1: set } = createSignal(false);
            return { get, set };
        })();
        get interacting() {
            return this.#interacting.get();
        }
        #isStarted = (() => {
            const { 0: get, 1: set } = createSignal(false);
            return { get, set };
        })();
        get isStarted() {
            return this.#isStarted.get();
        }
        #aborter = new AbortController();
        constructor(options) {
            Object.assign(this, options);
        }
        #onPinch = (dx) => {
            dx = dx * this.factor;
            this.x = clamp(this.x + dx, this.minX, this.maxX);
            if (dx === 0)
                return;
            if (this.#task)
                Motor.removeRenderTask(this.#task);
            // slow the rotation down based on former drag speed
            this.#task = Motor.addRenderTask(() => {
                dx = dx * 0.95;
                this.x = clamp(this.x + dx, this.minX, this.maxX);
                // Stop the rotation update loop once the deltas are small enough
                // that we no longer notice a change.
                if (Math.abs(dx) < 0.01)
                    return false;
            });
        };
        #pointers = new Map();
        #onDown = (event) => {
            event.clientX;
            this.#pointers.set(event.pointerId, {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
            });
            if (this.#pointers.size === 2) {
                // go two fingers
                document.addEventListener('pointermove', this.#onMove, { signal: this.#aborter.signal });
                this.#interacting.set(true);
            }
        };
        #lastDistance = -1;
        #onMove = (event) => {
            if (!this.#pointers.has(event.pointerId))
                return;
            if (this.#pointers.size < 2)
                return;
            const [one, two] = this.#pointers.values();
            if (event.pointerId === one.id) {
                one.x = event.clientX;
                one.y = event.clientY;
            }
            else {
                two.x = event.clientX;
                two.y = event.clientY;
            }
            const distance = Math.abs(Math.sqrt((two.x - one.x) ** 2 + (two.y - one.y) ** 2));
            if (this.#lastDistance === -1)
                this.#lastDistance = distance;
            const dx = this.#lastDistance - distance;
            this.#onPinch(dx);
            this.#lastDistance = distance;
        };
        #onUp = (event) => {
            if (!this.#pointers.has(event.pointerId))
                return;
            this.#pointers.delete(event.pointerId);
            this.#lastDistance = -1;
            if (this.#pointers.size === 1) {
                document.removeEventListener('pointermove', this.#onMove);
                this.#interacting.set(false);
            }
        };
        start() {
            if (untrack(this.#isStarted.get))
                return this;
            this.#isStarted.set(true);
            // @ts-expect-error, whyyyyy TypeScript
            this.target.addEventListener('pointerdown', this.#onDown, { signal: this.#aborter.signal });
            // @ts-expect-error, whyyyyy TypeScript
            this.target.addEventListener('pointerup', this.#onUp, { signal: this.#aborter.signal });
            return this;
        }
        stop() {
            if (!untrack(this.#isStarted.get))
                return this;
            this.#isStarted.set(false);
            // Stop any current animation, if any.
            if (this.#task)
                Motor.removeRenderTask(this.#task);
            this.#aborter.abort();
            return this;
        }
    };
    return PinchFling = _classThis;
})();
export { PinchFling };
//# sourceMappingURL=PinchFling.js.map