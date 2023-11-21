var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
import { createEffect, createRoot, on } from 'solid-js';
import { attribute, element } from '@lume/element';
import { XYZNumberValues } from '../xyz-values/XYZNumberValues.js';
import { Sizeable } from './Sizeable.js';
const position = new WeakMap();
const rotation = new WeakMap();
const scale = new WeakMap();
const origin = new WeakMap();
const alignPoint = new WeakMap();
const mountPoint = new WeakMap();
/**
 * @class Transformable - A class containing transform-related features for all
 * `Element3D` and `Scene` elements: rotation, position, scale, mount-point,
 * align-point, and origin. Note that Transforms have no effect on Scene
 * elements, but Scenes still use the features from Sizeable (the base class of
 * Transformable) for sizing.
 *
 * The properties of `Transformable` all follow a common usage pattern,
 * described in the [`Common Attributes`](../../guide/common-attributes) doc.
 *
 * @extends Sizeable
 */
let Transformable = (() => {
    let _classDecorators = [element];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Sizeable;
    let _instanceExtraInitializers = [];
    let _set_position_decorators;
    let _set_rotation_decorators;
    let _set_scale_decorators;
    let _set_origin_decorators;
    let _set_alignPoint_decorators;
    let _set_mountPoint_decorators;
    var Transformable = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _set_position_decorators = [attribute];
            _set_rotation_decorators = [attribute];
            _set_scale_decorators = [attribute];
            _set_origin_decorators = [attribute];
            _set_alignPoint_decorators = [attribute];
            _set_mountPoint_decorators = [attribute];
            __esDecorate(this, null, _set_position_decorators, { kind: "setter", name: "position", static: false, private: false, access: { has: obj => "position" in obj, set: (obj, value) => { obj.position = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _set_rotation_decorators, { kind: "setter", name: "rotation", static: false, private: false, access: { has: obj => "rotation" in obj, set: (obj, value) => { obj.rotation = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _set_scale_decorators, { kind: "setter", name: "scale", static: false, private: false, access: { has: obj => "scale" in obj, set: (obj, value) => { obj.scale = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _set_origin_decorators, { kind: "setter", name: "origin", static: false, private: false, access: { has: obj => "origin" in obj, set: (obj, value) => { obj.origin = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _set_alignPoint_decorators, { kind: "setter", name: "alignPoint", static: false, private: false, access: { has: obj => "alignPoint" in obj, set: (obj, value) => { obj.alignPoint = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _set_mountPoint_decorators, { kind: "setter", name: "mountPoint", static: false, private: false, access: { has: obj => "mountPoint" in obj, set: (obj, value) => { obj.mountPoint = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Transformable = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor() {
            super();
            __runInitializers(this, _instanceExtraInitializers);
            // TODO remove this, it causes confusion with infinite loops when doing
            // this.position.x = 123 in an effect, requiring untrack.
            createRoot(() => {
                // NOTE REACTIVITY When sub-properties of the XYZValues objects change,
                // trigger reactivity for the respective properties. See also NOTE REACTIVITY
                // in Sizeable.
                createEffect(on(this.position.asDependency, () => (this.position = this.position)));
                createEffect(on(this.rotation.asDependency, () => (this.rotation = this.rotation)));
                createEffect(on(this.scale.asDependency, () => (this.scale = this.scale)));
                createEffect(on(this.origin.asDependency, () => (this.origin = this.origin)));
                createEffect(on(this.alignPoint.asDependency, () => (this.alignPoint = this.alignPoint)));
                createEffect(on(this.mountPoint.asDependency, () => (this.mountPoint = this.mountPoint)));
            });
        }
        // TODO readem's JSDoc parser can not handle the following type if it is
        // split onto multiple lines.
        /**
         * @property {string | [x?: number, y?: number, z?: number] | {x?: number, y?: number, z?: number} | XYZNumberValues | null} position -
         *
         * *attribute*
         *
         * Default: <code>new [XYZNumberValues](../xyz-values/XYZNumberValues)(0, 0, 0)</code>
         *
         * Set the position of the object in 3D space, relative to its
         * parent, by specifying X, Y, and Z coordinates.
         */
        // TODO evalute being able to set reactive arrays or objects and
        // re-rendering based on updates to those arrays.
        set position(newValue) {
            if (!position.has(this))
                position.set(this, new XYZNumberValues(0, 0, 0));
            this._setPropertyXYZ('position', position.get(this), newValue);
        }
        get position() {
            if (!position.has(this))
                position.set(this, new XYZNumberValues(0, 0, 0));
            return position.get(this);
        }
        /**
         * @property {string | [x?: number, y?: number, z?: number] | {x?: number, y?: number, z?: number} | XYZNumberValues | null} rotation -
         *
         * *attribute*
         *
         * Default: <code>new [XYZNumberValues](../xyz-values/XYZNumberValues)(0, 0, 0)</code>
         *
         * Set the orientation of the object in 3D space, relative to its
         * parent, by specifying rotation in degrees around the X, Y, and Z axes.
         * Rotation direction is left-handed, meaning that if you point your thumb
         * along the positive direction of an axis, your other four fingers wrap
         * around that axis in the direction of positive rotation. A value of `[0,
         * 30, 0]` will rotate the object 30 degrees around the Y axis. The rotation
         * order is X, Y, Z, meaning that an X rotation rotates the object's Y and Z
         * axes, and a Y rotation rotates the object's Z axis.
         */
        set rotation(newValue) {
            if (!rotation.has(this))
                rotation.set(this, new XYZNumberValues(0, 0, 0));
            this._setPropertyXYZ('rotation', rotation.get(this), newValue);
        }
        get rotation() {
            if (!rotation.has(this))
                rotation.set(this, new XYZNumberValues(0, 0, 0));
            return rotation.get(this);
        }
        /**
         * @property {string | [x?: number, y?: number, z?: number] | {x?: number, y?: number, z?: number} | XYZNumberValues | null} scale -
         *
         * *attribute*
         *
         * Default: <code>new [XYZNumberValues](../xyz-values/XYZNumberValues)(1, 1, 1)</code>
         *
         * Set the scale of the object in 3D space, relative to its parent,
         * by specifying scale along the X, Y, and Z axes.
         */
        set scale(newValue) {
            if (!scale.has(this))
                scale.set(this, new XYZNumberValues(1, 1, 1));
            this._setPropertyXYZ('scale', scale.get(this), newValue);
        }
        get scale() {
            if (!scale.has(this))
                scale.set(this, new XYZNumberValues(1, 1, 1));
            return scale.get(this);
        }
        /**
         * @property {string | [x?: number, y?: number, z?: number] | {x?: number, y?: number, z?: number} | XYZNumberValues | null} origin -
         *
         * *attribute*
         *
         * Default: <code>new [XYZNumberValues](../xyz-values/XYZNumberValues)(0.5, 0.5, 0.5)</code>
         *
         * Set the rotational origin of the object in 3D space, relative to
         * itself, by specifying origin along the X, Y, and Z axes.
         *
         * The origin is the point within the object's [`size`](./Sizeable#size)
         * space about which it rotates when a [`rotation`](#rotation) is specified.
         * No matter what rotation the object has, this point does not move.
         *
         * The value for each axis is a portion of the object's size on the same
         * axis. For example, a value of `0 0 0` places the origin at top/left/rear
         * corner of the object's size space, a value of `0.5 0.5 0.5` places the
         * origin in the center of the object's size space, and a value of `1 1 1`
         * places the origin at the bottom/right/front of the object's size space.
         *
         * This example shows different values of origin. The pink dots are placed
         * at each origin point on each cube. All cubes are initially oriented the
         * same, but as you move the sliders, each cube rotates around their
         * specific origin.
         *
         * <div id="originExample"></div>
         * <script type="application/javascript">
         *   new Vue({
         *     el: '#originExample',
         *     template: '<live-code class="full" :template="code" mode="html>iframe" :debounce="200" />',
         *     data: { code: originExample },
         *   })
         * </script>
         */
        set origin(newValue) {
            if (!origin.has(this))
                origin.set(this, new XYZNumberValues(0.5, 0.5, 0.5));
            this._setPropertyXYZ('origin', origin.get(this), newValue);
        }
        get origin() {
            if (!origin.has(this))
                origin.set(this, new XYZNumberValues(0.5, 0.5, 0.5));
            return origin.get(this);
        }
        /**
         * @property {string | [x?: number, y?: number, z?: number] | {x?: number, y?: number, z?: number} | XYZNumberValues | null} alignPoint -
         *
         * *attribute*
         *
         * Default: <code>new [XYZNumberValues](../xyz-values/XYZNumberValues)(0, 0, 0)</code>
         *
         * Set the align point of the object in 3D space, relative to its
         * parent, by specifying values along the X, Y, and Z axes.
         *
         * The align point is the point within the object's parent's
         * [`size`](./Sizeable#size) space at which the object's position is 0,0,0.
         *
         * The value for each axis is a portion of the object's parent size on the
         * same axis. For example, a value of `0 0 0` places the align point at
         * top/left/rear corner of the object's parent's size space, a value of `0.5
         * 0.5 0.5` places the align point in the center of the parent's size space,
         * and a value of `1 1 1` places the origin at the bottom/right/front of the
         * parent's size space.
         */
        set alignPoint(newValue) {
            if (!alignPoint.has(this))
                alignPoint.set(this, new XYZNumberValues(0, 0, 0));
            this._setPropertyXYZ('alignPoint', alignPoint.get(this), newValue);
        }
        get alignPoint() {
            if (!alignPoint.has(this))
                alignPoint.set(this, new XYZNumberValues(0, 0, 0));
            return alignPoint.get(this);
        }
        /**
         * @property {string | [x?: number, y?: number, z?: number] | {x?: number, y?: number, z?: number} | XYZNumberValues | null} mountPoint -
         *
         * *attribute*
         *
         * Default: <code>new [XYZNumberValues](../xyz-values/XYZNumberValues)(0, 0, 0)</code>
         *
         * Set the mount point of the object in 3D space, relative to itself,
         * by specifying values along the X, Y, and Z axes.
         *
         * The mount point is the point within the object's
         * [`size`](./Sizeable#size) space that is placed at the location specified
         * by [`position`](#position).
         *
         * The value for each axis is a portion of the object's size on the
         * same axis. For example, a value of `0 0 0` places the align point at
         * top/left/rear corner of the object's size space, a value of `0.5
         * 0.5 0.5` places the align point in the center of the object's size space,
         * and a value of `1 1 1` places the origin at the bottom/right/front of the
         * object's size space.
         */
        set mountPoint(newValue) {
            if (!mountPoint.has(this))
                mountPoint.set(this, new XYZNumberValues(0, 0, 0));
            this._setPropertyXYZ('mountPoint', mountPoint.get(this), newValue);
        }
        get mountPoint() {
            if (!mountPoint.has(this))
                mountPoint.set(this, new XYZNumberValues(0, 0, 0));
            return mountPoint.get(this);
        }
    };
    return Transformable = _classThis;
})();
export { Transformable };
//# sourceMappingURL=Transformable.js.map