var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PointLight as ThreePointLight } from 'three/src/lights/PointLight.js';
import { numberAttribute, element } from '@lume/element';
import { LightWithShadow } from './LightWithShadow.js';
import { autoDefineElements } from '../LumeConfig.js';
let PointLight = class PointLight extends LightWithShadow {
    shadowCameraFov = 90;
    constructor() {
        super();
        this.intensity = 1;
    }
    distance = 0;
    decay = 1;
    get power() {
        return this.intensity * 4 * Math.PI;
    }
    set power(power) {
        this.intensity = power / (4 * Math.PI);
    }
    _loadGL() {
        if (!super._loadGL())
            return false;
        this.createGLEffect(() => {
            const light = this.three;
            light.distance = this.distance;
            light.decay = this.decay;
            this.needsUpdate();
        });
        return true;
    }
    makeThreeObject3d() {
        return new ThreePointLight();
    }
};
__decorate([
    numberAttribute(90)
], PointLight.prototype, "shadowCameraFov", void 0);
__decorate([
    numberAttribute(0)
], PointLight.prototype, "distance", void 0);
__decorate([
    numberAttribute(1)
], PointLight.prototype, "decay", void 0);
__decorate([
    numberAttribute(1 * 4 * Math.PI)
], PointLight.prototype, "power", null);
PointLight = __decorate([
    element('lume-point-light', autoDefineElements)
], PointLight);
export { PointLight };
//# sourceMappingURL=PointLight.js.map