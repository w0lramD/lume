var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { createEffect, onCleanup, untrack } from 'solid-js';
import html from 'solid-js/html';
import { element, numberAttribute, autorun, booleanAttribute, reactive } from '@lume/element';
import { autoDefineElements } from '../LumeConfig.js';
import { Element3D } from '../core/Element3D.js';
import { FlingRotation, ScrollFling, PinchFling } from '../interaction/index.js';
let CameraRig = class CameraRig extends Element3D {
    hasShadow = true;
    verticalAngle = 0;
    get initialPolarAngle() {
        return this.verticalAngle;
    }
    set initialPolarAngle(value) {
        this.verticalAngle = value;
    }
    minVerticalAngle = -90;
    get minPolarAngle() {
        return this.minVerticalAngle;
    }
    set minPolarAngle(value) {
        this.minVerticalAngle = value;
    }
    maxVerticalAngle = 90;
    get maxPolarAngle() {
        return this.maxVerticalAngle;
    }
    set maxPolarAngle(value) {
        this.maxVerticalAngle = value;
    }
    horizontalAngle = 0;
    minHorizontalAngle = -Infinity;
    maxHorizontalAngle = Infinity;
    distance = 1000;
    get initialDistance() {
        return this.distance;
    }
    set initialDistance(value) {
        this.distance = value;
    }
    minDistance = 200;
    maxDistance = 2000;
    active = true;
    dollySpeed = 1;
    interactive = true;
    cam;
    rotationYTarget;
    template = () => html `
		<lume-element3d
			id="cameraY"
			ref=${(el) => (this.rotationYTarget = el)}
			size="1 1 1"
			size-mode="proportional proportional proportional"
			rotation=${() => untrack(() => [0, this.horizontalAngle, 0])}
		>
			<lume-element3d
				id="cameraX"
				size="1 1 1"
				rotation=${() => untrack(() => [this.verticalAngle, 0, 0])}
				size-mode="proportional proportional proportional"
			>
				<slot
					name="camera"
					TODO="determine semantics for overriding the internal camera (this slot is not documented yet)"
				>
					<lume-perspective-camera
						ref=${(cam) => (this.cam = cam)}
						active=${() => this.active}
						position=${[0, 0, this.distance]}
						align-point="0.5 0.5 0.5"
						far="10000"
					>
						<slot name="camera-child"></slot>
					</lume-perspective-camera>
				</slot>
			</lume-element3d>
		</lume-element3d>

		<slot></slot>
	`;
    flingRotation = null;
    scrollFling = null;
    pinchFling = null;
    autorunStoppers;
    #startedInteraction = false;
    startInteraction() {
        if (this.#startedInteraction)
            return;
        this.#startedInteraction = true;
        this.autorunStoppers = [];
        this.autorunStoppers.push(autorun(() => {
            if (!(this.scene && this.rotationYTarget))
                return;
            console.log('WTF', this.minVerticalAngle);
            console.log('WTF', this.maxVerticalAngle);
            const flingRotation = (this.flingRotation = new FlingRotation({
                interactionInitiator: this.scene,
                rotationYTarget: this.rotationYTarget,
                minFlingRotationX: this.minVerticalAngle,
                maxFlingRotationX: this.maxVerticalAngle,
                minFlingRotationY: this.minHorizontalAngle,
                maxFlingRotationY: this.maxHorizontalAngle,
            }).start());
            createEffect(() => {
                if (this.interactive && !this.pinchFling?.interacting)
                    flingRotation.start();
                else
                    flingRotation.stop();
            });
            onCleanup(() => flingRotation?.stop());
        }), autorun(() => {
            if (!this.scene)
                return;
            const scrollFling = (this.scrollFling = new ScrollFling({
                target: this.scene,
                y: this.distance,
                minY: this.minDistance,
                maxY: this.maxDistance,
                scrollFactor: this.dollySpeed,
            }).start());
            const pinchFling = (this.pinchFling = new PinchFling({
                target: this.scene,
                x: this.distance,
                minX: this.minDistance,
                maxX: this.maxDistance,
                factor: this.dollySpeed,
            }).start());
            createEffect(() => {
                const cam = this.cam;
                if (!cam)
                    return;
                untrack(() => cam.position).z = scrollFling.y;
            });
            createEffect(() => {
                const cam = this.cam;
                if (!cam)
                    return;
                untrack(() => cam.position).z = pinchFling.x;
            });
            createEffect(() => {
                if (this.interactive) {
                    scrollFling.start();
                    pinchFling.start();
                }
                else {
                    scrollFling.stop();
                    pinchFling.stop();
                }
            });
            onCleanup(() => {
                scrollFling.stop();
                pinchFling.stop();
            });
        }));
    }
    stopInteraction() {
        if (!this.#startedInteraction)
            return;
        this.#startedInteraction = false;
        if (this.autorunStoppers)
            for (const stop of this.autorunStoppers)
                stop();
    }
    _loadGL() {
        if (!super._loadGL())
            return false;
        this.startInteraction();
        return true;
    }
    _loadCSS() {
        if (!super._loadCSS())
            return false;
        this.startInteraction();
        return true;
    }
    _unloadGL() {
        if (!super._unloadGL())
            return false;
        if (!this.glLoaded && !this.cssLoaded)
            this.stopInteraction();
        return true;
    }
    _unloadCSS() {
        if (!super._unloadCSS())
            return false;
        if (!this.glLoaded && !this.cssLoaded)
            this.stopInteraction();
        return true;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.stopInteraction();
    }
};
__decorate([
    numberAttribute(0)
], CameraRig.prototype, "verticalAngle", void 0);
__decorate([
    numberAttribute(0)
], CameraRig.prototype, "initialPolarAngle", null);
__decorate([
    numberAttribute(-90)
], CameraRig.prototype, "minVerticalAngle", void 0);
__decorate([
    numberAttribute(-90)
], CameraRig.prototype, "minPolarAngle", null);
__decorate([
    numberAttribute(90)
], CameraRig.prototype, "maxVerticalAngle", void 0);
__decorate([
    numberAttribute(90)
], CameraRig.prototype, "maxPolarAngle", null);
__decorate([
    numberAttribute(0)
], CameraRig.prototype, "horizontalAngle", void 0);
__decorate([
    numberAttribute(-Infinity)
], CameraRig.prototype, "minHorizontalAngle", void 0);
__decorate([
    numberAttribute(Infinity)
], CameraRig.prototype, "maxHorizontalAngle", void 0);
__decorate([
    numberAttribute(1000)
], CameraRig.prototype, "distance", void 0);
__decorate([
    numberAttribute(1000)
], CameraRig.prototype, "initialDistance", null);
__decorate([
    numberAttribute(200)
], CameraRig.prototype, "minDistance", void 0);
__decorate([
    numberAttribute(2000)
], CameraRig.prototype, "maxDistance", void 0);
__decorate([
    booleanAttribute(true)
], CameraRig.prototype, "active", void 0);
__decorate([
    numberAttribute(1)
], CameraRig.prototype, "dollySpeed", void 0);
__decorate([
    booleanAttribute(true)
], CameraRig.prototype, "interactive", void 0);
__decorate([
    reactive
], CameraRig.prototype, "cam", void 0);
__decorate([
    reactive
], CameraRig.prototype, "rotationYTarget", void 0);
__decorate([
    reactive
], CameraRig.prototype, "flingRotation", void 0);
__decorate([
    reactive
], CameraRig.prototype, "scrollFling", void 0);
__decorate([
    reactive
], CameraRig.prototype, "pinchFling", void 0);
CameraRig = __decorate([
    element('lume-camera-rig', autoDefineElements)
], CameraRig);
export { CameraRig };
//# sourceMappingURL=CameraRig.js.map