// TODO: write a test that imports public interfaces in every possible
// permutation to detect circular dependency errors.
// See: https://esdiscuss.org/topic/how-to-solve-this-basic-es6-module-circular-dependency-problem

import {autorun, booleanAttribute, attribute, numberAttribute, untrack, element} from '@lume/element'
import {emits} from '@lume/eventful'
import {Scene as ThreeScene} from 'three/src/scenes/Scene.js'
import {PerspectiveCamera as ThreePerspectiveCamera} from 'three/src/cameras/PerspectiveCamera.js'
// import {AmbientLight} from 'three/src/lights/AmbientLight.js'
import {Color} from 'three/src/math/Color.js'
import {WebGLRendererThree, ShadowMapTypeString} from '../renderers/WebGLRendererThree.js'
import {CSS3DRendererThree} from '../renderers/CSS3DRendererThree.js'
import {HTMLScene as HTMLInterface} from './HTMLScene.js'
import {documentBody, thro, trim} from './utils.js'
import {possiblyPolyfillResizeObserver} from './ResizeObserver.js'
import {isDisposable} from '../utils/three.js'

import type {ImperativeBase} from './ImperativeBase.js'
import type {TColor} from '../utils/three.js'
import type {PerspectiveCamera} from '../cameras/PerspectiveCamera.js'
import type {XYZValuesObject} from '../xyz-values/XYZValues.js'
import type {Sizeable} from './Sizeable.js'
import type {SizeableAttributes} from './Sizeable.js'
import type {TreeNode} from './TreeNode.js'

export type SceneAttributes =
	// Don't expost TransformableAttributes here for now (although they exist). What should modifying those on a Scene do?
	| SizeableAttributes
	| 'shadowmapType'
	| 'vr'
	| 'webgl'
	| 'enableCss'
	| 'backgroundColor'
	| 'backgroundOpacity'
	| 'background'
	| 'equirectangularBackground'
	| 'environment'
	| 'perspective'

/**
 * @class Scene - This is the backing class for `<lume-scene>` elements. All
 * [`Node`](TODO) elements must be inside of a `<lume-scene>` element. A `Scene`
 * establishes a visual area in a web application where a 3D scene will be
 * rendered.
 *
 * A Scene has some properties that apply to the scene as a whole and will have an effect on all LUME elements in the scene.
 *
 * The following example shows how to begin making a LUME scene within an HTML
 * file. To learn more about how to get started, see the [install guide](TODO).
 *
 * <div id="example1"></div> <script type="application/javascript">
 *   new Vue({
 *     el: '#example1',
 *     template: '<live-code :template="code" mode="html>iframe" :debounce="200" />',
 *     data: {
 *       code:
 * `<script src="${location.origin+location.pathname}global.js"><\/script>
 *
 * <lume-scene id="scene">
 *   <lume-node size="100 100" align-point="0.5 0.5" mount-point="0.5 0.5" rotation="0 30 0">
 *   	I am centered in the scene, and I am rotated a bit.
 *   </lume-node>
 * </lume-scene>
 *
 * <style>
 *   html, body {
 *     margin: 0; padding: 0;
 *     height: 100%; width: 100%;
 *   }
 *   lume-node {
 *     padding: 5px;
 *     border: 1px solid skyblue;
 *   }
 * </style>
 *
 * <script>
 *   // Make sure you register LUME's custom elements with the
 *   // browser, or nothing will happen.
 *   LUME.useDefaultNames()
 * <\/script>
 * `
 *     },
 *   })
 * </script>
 *
 * @extends HTMLScene
 */
// NOTE For now, we assume Scene is mixed with its HTMLInterface.
@element
export class Scene extends HTMLInterface {
	static defaultElementName = 'lume-scene'

	/**
	 * @readonly
	 * @property {true} isNode - Always true for things that are or inherit from `Scene`.
	 */
	readonly isScene = true

	/** @property {'pcf' | 'pcfsoft' | 'basic'} shadowmapType */
	@emits('propertychange') @attribute shadowmapType: ShadowMapTypeString = 'basic'

	/** @property {boolean} vr */
	@emits('propertychange') @booleanAttribute(false) vr = false

	/** @property {boolean} webgl */
	@emits('propertychange') @booleanAttribute(false) webgl = false

	/** @property {boolean} enableCss */
	@emits('propertychange') @booleanAttribute(true) enableCss = true

	/**
	 * @property {Color | string | number} backgroundColor - The color of
	 * the scene's background when WebGL rendering is enabled. If the
	 * [`background`](TODO) property is set also, then `backgroundColor` is ignored.
	 */
	@emits('propertychange') @attribute backgroundColor: TColor = new Color('white')

	/**
	 * @property {number} backgroundOpacity - A number between `0` and `1`
	 * that defines the opacity of the `backgroundColor` WebGL is enabled.
	 * If the value is less than 1, it means that any DOM contend behind
	 * the `<lume-scene>` element will be visible. This is ignored if the
	 * [`background`](TODO) property is set.
	 */
	@emits('propertychange') @numberAttribute(0) backgroundOpacity = 0

	/**
	 * @property {string} background - Set an image as the scene's
	 * background. If the image is an [equirectangular environment
	 * map](TODO), then set the value of
	 * [`equirectangularBackground`](TODO) to `true`, otherwise the image
	 * will be treated as a 2D background image. The value should be a path
	 * to a jpeg, jpg, or png. Other types not supported yet. This value
	 * takes priority over the [`backgroundColor`](TODO) and
	 * [`backgroundOpacity`](TODO) properties; those properties will be
	 * ignored. Any transparent parts of the image will be rendered
	 * as color white.
	 */
	@emits('propertychange') @attribute background = ''

	/**
	 * @property {string} equirectangularBackground - If the `background`
	 * is equirectangular, set this to `true` so use it like a skybox,
	 * otherwise the image will be used as a regular 2D background image.
	 */
	@emits('propertychange') @booleanAttribute(false) equirectangularBackground = false

	/**
	 * @property {string} environment - The environment can be a path to a
	 * jpeg, jpg, or png (other format not yet supported). It is assumed to
	 * be an equirectangular image used for env maps for things like
	 * reflections on metallic objects in the scene.
	 */
	@emits('propertychange') @attribute environment = ''

	@numberAttribute(400)
	set perspective(value) {
		this.#perspective = value
		this._updateCameraPerspective()
		this._updateCameraProjection()
		this.needsUpdate()
	}
	get perspective() {
		return this.#perspective
	}

	#perspective = 400

	get threeCamera(): ThreePerspectiveCamera {
		return this.#threeCamera
	}

	#threeCamera!: ThreePerspectiveCamera

	// Used by the `scene` getter in ImperativeBase
	_scene: this | null = this

	constructor() {
		super()

		// this.sizeMode and this.size have to be overriden here inside the
		// constructor in TS 4. This is because class properties on a
		// subclass are no longer allowed to be defined outside the
		// constructor if a base class has the same properties as
		// accessors.

		/**
		 * @override
		 * @property {XYZSizeModeValues} sizeMode - This overrides the
		 * [`Sizeable.sizeMode`](TODO) property to make the default values for the X and
		 * Y axes both "proportional".
		 */
		this.getSizeMode().set('proportional', 'proportional', 'literal')

		/**
		 * @override
		 *
		 * @property {XYZNonNegativeValues} size - This overrides the
		 * [`Sizeable.size`](TODO) property to make the default values for the
		 * X and Y axes both `1`.
		 */
		this.getSize().set(1, 1, 0)

		// The scene should always render CSS properties (it needs to always
		// be rendered or resized, for example, because it contains the
		// WebGL canvas which also needs to be resized). Namely, we still
		// want to apply size values to the scene so that it can size
		// relative to it's parent container, or literally if size mode is
		// "literal".
		this._elementOperations.shouldRender = true

		// size of the element where the Scene is mounted
		// NOTE: z size is always 0, since native DOM elements are always flat.
		this._elementParentSize = {x: 0, y: 0, z: 0}

		this._cameraSetup()

		this._calcSize()
		this.needsUpdate()
	}

	drawScene() {
		this.#glRenderer && this.#glRenderer.drawScene(this)
		this.#cssRenderer && this.#cssRenderer.drawScene(this)
	}

	/**
	 * Mount the scene into the given target.
	 * Resolves the Scene's mountPromise, which can be use to do something once
	 * the scene is mounted.
	 *
	 * @param {string|HTMLElement} [mountPoint=document.body] If a string selector is provided,
	 * the mount point will be selected from the DOM. If an HTMLElement is
	 * provided, that will be the mount point. If no mount point is provided,
	 * the scene will be mounted into document.body.
	 */
	// TODO move some mount/unmount logic to connected/disconnectedCallback.
	// mount() is just a tool for specifying where to connect the scene
	// element to.
	async mount(mountPoint?: string | Element | null) {
		// if no mountPoint was provided, just mount onto the <body> element.
		if (mountPoint === undefined) {
			if (!document.body) await documentBody()
			mountPoint = document.body
		}

		// if the user supplied a selector, mount there.
		else if (typeof mountPoint === 'string') {
			const selector = mountPoint

			mountPoint = document.querySelector(selector)
			if (!mountPoint && document.readyState === 'loading') {
				// maybe the element wasn't parsed yet, check again when the
				// document is ready.
				await documentReady()
				mountPoint = document.querySelector(selector)
			}
		}

		// At this point we should have an actual mount point (the user may have passed it in)
		if (!(mountPoint instanceof HTMLElement || mountPoint instanceof ShadowRoot)) {
			throw new Error(
				trim(`
						Invalid mount point specified in Scene.mount() call
						(${mountPoint}). Pass a selector or an HTMLElement. Not
						passing any argument will cause the Scene to be mounted
						to the <body>.
					`),
			)
		}

		// The user can mount to a new location without calling unmount
		// first. Call it automatically in that case.
		if (this._mounted) this.unmount()

		if (mountPoint !== this.parentNode) mountPoint.appendChild(this)

		this._mounted = true

		// this.__startOrStopParentSizeObservation()
	}

	/**
	 * Unmount the scene from it's mount point. Resets the Scene's
	 * mountPromise.
	 */
	unmount() {
		if (!this._mounted) return

		this.#stopParentSizeObservation()

		if (this.parentNode) this.parentNode.removeChild(this)

		this._mounted = false
	}

	connectedCallback() {
		super.connectedCallback()

		this._stopFns.push(
			autorun(() => {
				if (this.webgl) this._triggerLoadGL()
				else this._triggerUnloadGL()

				// TODO Need this?
				this.needsUpdate()
			}),
			autorun(() => {
				if (!this.webgl || !this.background) {
					if (isDisposable(this.three.background)) this.three.background.dispose()
					this.#glRenderer?.disableBackground(this)
					return
				}

				if (this.background.match(/\.(jpg|jpeg|png)$/)) {
					// Dispose each time we switch to a new one.
					if (isDisposable(this.three.background)) this.three.background.dispose()

					// destroy the previous one, if any.
					this.#glRenderer!.disableBackground(this)

					this.#glRenderer!.enableBackground(this, this.equirectangularBackground, texture => {
						this.three.background = texture || null
						this.needsUpdate()

						// TODO emit background load event.
					})
				} else {
					console.warn(
						`<${this.tagName.toLowerCase()}> background attribute ignored, the given image type is not currently supported.`,
					)
				}
			}),
			autorun(() => {
				if (!this.webgl || !this.environment) {
					if (isDisposable(this.three.environment)) this.three.environment.dispose()
					this.#glRenderer?.disableEnvironment(this)
					return
				}

				if (this.environment.match(/\.(jpg|jpeg|png)$/)) {
					// Dispose each time we switch to a new one.
					if (isDisposable(this.three.environment)) this.three.environment.dispose()

					// destroy the previous one, if any.
					this.#glRenderer!.disableEnvironment(this)

					this.#glRenderer!.enableEnvironment(this, texture => {
						this.three.environment = texture
						this.needsUpdate()

						// TODO emit background load event.
					})
				} else {
					console.warn(
						`<${this.tagName.toLowerCase()}> environment attribute ignored, the given image type is not currently supported.`,
					)
				}
			}),
			autorun(() => {
				if (this.enableCss) this._triggerLoadCSS()
				else this._triggerUnloadCSS()

				// Do we need this? Doesn't hurt to have it just in case.
				this.needsUpdate()
			}),
			autorun(() => {
				this.sizeMode
				this.#startOrStopParentSizeObservation()
			}),
		)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.#stopParentSizeObservation()
	}

	_mounted = false
	_elementParentSize: XYZValuesObject<number>

	makeThreeObject3d() {
		return new ThreeScene()
	}

	makeThreeCSSObject() {
		return new ThreeScene()
	}

	_cameraSetup() {
		// this.__threeCamera holds the active camera. There can be many
		// cameras in the scene tree, but the last one with active="true"
		// will be the one referenced here.
		// If there are no cameras in the tree, a virtual default camera is
		// referenced here, who's perspective is that of the scene's
		// perspective attribute.
		// this.__threeCamera = null
		this._createDefaultCamera()
	}

	_createDefaultCamera() {
		// Use untrack so this method is non-reactive.
		untrack(() => {
			const size = this.calculatedSize
			// THREE-COORDS-TO-DOM-COORDS
			// We apply Three perspective the same way as CSS3D perspective here.
			// TODO CAMERA-DEFAULTS, get defaults from somewhere common.
			// TODO the "far" arg will be auto-calculated to encompass the furthest objects (like CSS3D).
			// TODO update with calculatedSize in autorun
			this.#threeCamera = new ThreePerspectiveCamera(45, size.x / size.y || 1, 0.1, 10000)
			this.perspective = this.perspective
		})
	}

	// TODO can this be moved to a render task like _calcSize? It depends
	// on size values.
	_updateCameraPerspective() {
		const perspective = this.#perspective
		this.#threeCamera.fov = (180 * (2 * Math.atan(this.calculatedSize.y / 2 / perspective))) / Math.PI
		this.#threeCamera.position.z = perspective
	}

	_updateCameraAspect() {
		this.#threeCamera.aspect = this.calculatedSize.x / this.calculatedSize.y || 1
	}

	_updateCameraProjection() {
		this.#threeCamera.updateProjectionMatrix()
	}

	// holds active cameras found in the DOM tree (if this is empty, it
	// means no camera elements are in the DOM, but this.__threeCamera
	// will still have a reference to the default camera that scenes
	// are rendered with when no camera elements exist).
	#activeCameras: Set<PerspectiveCamera> = new Set()

	_addCamera(camera: PerspectiveCamera) {
		this.#activeCameras.add(camera)
		this.#setCamera(camera)
	}

	_removeCamera(camera: PerspectiveCamera) {
		this.#activeCameras.delete(camera)

		if (this.#activeCameras.size) {
			// get the last camera in the Set
			this.#activeCameras.forEach(c => (camera = c))
			this.#setCamera(camera)
		} else {
			this.#setCamera()
		}
	}

	/** @override */
	_getParentSize(): XYZValuesObject<number> {
		return this.parent ? (this.parent as Sizeable).calculatedSize : this._elementParentSize
	}

	// For now, use the same program (with shaders) for all objects.
	// Basically it has position, frag colors, point light, directional
	// light, and ambient light.
	_loadGL() {
		// THREE
		// maybe keep this in sceneState in WebGLRendererThree
		if (!super._loadGL()) return false

		this._composedChildren

		// We don't let Three update any matrices, we supply our own world
		// matrices.
		this.three.autoUpdate = false

		// TODO: default ambient light when no AmbientLight elements are
		// present in the Scene.
		//const ambientLight = new AmbientLight( 0x353535 )
		//this.three.add( ambientLight )

		this.#glRenderer = this.#getGLRenderer('three')

		this._glStopFns.push(
			autorun(() => {
				// if this.webgl is true, then _loadGL will have fired,
				// therefore this.__glRenderer must be defined.
				this.#glRenderer!.setClearColor(this, this.backgroundColor, this.backgroundOpacity)
				this.needsUpdate()
			}),
			autorun(() => {
				this.#glRenderer!.setClearAlpha(this, this.backgroundOpacity)
				this.needsUpdate()
			}),
			autorun(() => {
				this.#glRenderer!.setShadowMapType(this, this.shadowmapType)
				this.needsUpdate()
			}),
			autorun(() => {
				// TODO Update to WebXR
				// this.__glRenderer!.enableVR(this, this.vr)
				// if (this.vr) {
				// 	Motor.setFrameRequester(fn => this.__glRenderer!.requestFrame(this, fn))
				// 	this.__glRenderer!.createDefaultWebVREntryUI(this)
				// } else {
				// 	// TODO else return back to normal requestAnimationFrame
				// }
			}),
		)

		this.traverse((node: TreeNode) => {
			// skip `this`, we already handled it above
			if (node === this) return

			if (isImperativeBase(node)) node._triggerLoadGL()
		})

		return true
	}

	_unloadGL() {
		if (!super._unloadGL()) return false

		if (this.#glRenderer) {
			this.#glRenderer.uninitialize(this)
			this.#glRenderer = null
		}

		this.traverse((node: TreeNode) => {
			// skip `this`, we already handled it above
			if (node === this) return

			if (isImperativeBase(node)) node._triggerUnloadGL()
		})

		// Not all things are loaded in _loadGL (they may be loaded
		// depending on property/attribute values), but all things, if any, should
		// still be disposed in _unloadGL.
		{
			this.three.environment?.dispose()
			if (isDisposable(this.three.background)) this.three.background.dispose()
		}

		return true
	}

	_loadCSS() {
		if (!super._loadCSS()) return false

		this.#cssRenderer = this.#getCSSRenderer('three')

		this.traverse((node: TreeNode) => {
			// skip `this`, we already handled it above
			if (node === this) return

			if (isImperativeBase(node)) node._loadCSS()
		})

		return true
	}

	_unloadCSS() {
		if (!super._unloadCSS()) return false

		if (this.#cssRenderer) {
			this.#cssRenderer.uninitialize(this)
			this.#cssRenderer = null
		}

		this.traverse((node: TreeNode) => {
			// skip `this`, we already handled it above
			if (node === this) return

			if (isImperativeBase(node)) node._unloadCSS()
		})

		return true
	}

	#glRenderer: WebGLRendererThree | null = null
	#cssRenderer: CSS3DRendererThree | null = null

	// The idea here is that in the future we might have "babylon",
	// "playcanvas", etc, on a per scene basis. We'd needed to abstract the
	// renderer more, have abstract base classes to define the common
	// interfaces.
	#getGLRenderer(type: 'three'): WebGLRendererThree {
		if (this.#glRenderer) return this.#glRenderer

		let renderer: WebGLRendererThree

		if (type === 'three') renderer = WebGLRendererThree.singleton()
		else throw new Error('invalid WebGL renderer')

		renderer.initialize(this)

		return renderer
	}

	#getCSSRenderer(type: 'three') {
		if (this.#cssRenderer) return this.#cssRenderer

		let renderer: CSS3DRendererThree

		if (type === 'three') renderer = CSS3DRendererThree.singleton()
		else throw new Error('invalid CSS renderer. The only type supported is currently "three" (i.e. Three.js).')

		renderer.initialize(this)

		return renderer
	}

	#setCamera(camera?: PerspectiveCamera) {
		if (!camera) {
			this._createDefaultCamera()
		} else {
			// TODO?: implement an changecamera event/method and emit/call
			// that here, then move this logic to the renderer
			// handler/method?
			this.#threeCamera = camera.three
			this._updateCameraAspect()
			this._updateCameraProjection()
			this.needsUpdate()
		}
	}

	// TODO move the following parent size change stuff to a separate re-usable class.

	#parentSize: XYZValuesObject<number> = {x: 0, y: 0, z: 0}

	// HTM-API
	#startOrStopParentSizeObservation() {
		if (
			// If we will be rendering something...
			(this.enableCss || this.webgl) &&
			// ...and if one size dimension is proportional...
			(this.getSizeMode().x == 'proportional' || this.getSizeMode().y == 'proportional')
			// Note, we don't care about the Z dimension, because Scenes are flat surfaces.
		) {
			// ...then observe the parent element size (it may not be a LUME
			// element, so we observe with ResizeObserver).
			this.#startParentSizeObservation()
		} else {
			this.#stopParentSizeObservation()
		}
	}

	#resizeObserver: ResizeObserver | null = null

	// observe size changes on the scene element.
	// HTM-API
	#startParentSizeObservation() {
		const parent =
			this.parentNode instanceof HTMLElement
				? this.parentNode
				: this.parentNode instanceof ShadowRoot
				? this.parentNode.host
				: thro('A Scene can only be child of an HTMLElement or ShadowRoot (and f.e. not an SVGElement).')

		// TODO use a single ResizeObserver for all scenes.

		possiblyPolyfillResizeObserver()

		this.#resizeObserver = new ResizeObserver(changes => {
			for (const change of changes) {
				// Use the newer API if available.
				// NOTE We care about the contentBoxSize (not the
				// borderBoxSize) because the content box is the area in
				// which we're rendering visuals.
				if (change.contentBoxSize) {
					// If change.contentBoxSize is an array with more than
					// one item, it means the observed element is split
					// across multiple CSS columns.
					// TODO If the Scene is used as display:inline{-block},
					// ensure that it is the size of the column in which it
					// is located.
					// TODO fix ResizeObserver types in TypeScript lib.dom
					const {inlineSize, blockSize} = Array.isArray(change.contentBoxSize)
						? (change.contentBoxSize[0] as ResizeObserverEntryBoxSize)
						: ((change.contentBoxSize as unknown) as ResizeObserverEntryBoxSize)

					const isHorizontal = getComputedStyle(parent).writingMode.includes('horizontal')

					// If the text writing mode is horizontal, then inlinSize is
					// the width, otherwise in vertical modes it is the height.
					// For more details: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/contentBoxSize#Syntax
					if (isHorizontal) this.#checkSize(inlineSize, blockSize)
					else this.#checkSize(blockSize, inlineSize)
				}
				// Otherwise use the older API (possibly polyfilled)
				else {
					const {width, height} = change.contentRect
					this.#checkSize(width, height)
				}
			}
		})

		this.#resizeObserver.observe(parent)
	}

	// HTM-API
	#stopParentSizeObservation() {
		this.#resizeObserver?.disconnect()
		this.#resizeObserver = null
	}

	// NOTE, the Z dimension of a scene doesn't matter, it's a flat plane, so
	// we haven't taken that into consideration here.
	// HTM-API
	#checkSize(x: number, y: number) {
		const parentSize = this.#parentSize

		// if we have a size change, emit parentsizechange
		if (parentSize.x != x || parentSize.y != y) {
			parentSize.x = x
			parentSize.y = y

			this.#onElementParentSizeChange(parentSize)
		}
	}

	// HTM-API
	#onElementParentSizeChange(newSize: XYZValuesObject<number>) {
		this._elementParentSize = newSize
		// TODO #66 defer _calcSize to an animation frame (via needsUpdate),
		// unless explicitly requested by a user (f.e. they read a prop so
		// the size must be calculated). https://github.com/lume/lume/issues/66
		this._calcSize()
		this.needsUpdate()
	}
}

function isImperativeBase(_n: TreeNode): _n is ImperativeBase {
	// TODO make sure instanceof works. For all intents and purposes, we assume
	// to always have an ImperativeNode where we use this.
	// return n instanceof ImperativeBase
	return true
}

import type {ElementAttributes} from '@lume/element'

declare module '@lume/element' {
	namespace JSX {
		interface IntrinsicElements {
			'lume-scene': ElementAttributes<Scene, SceneAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'lume-scene': Scene
	}
}

function documentReady() {
	if (document.readyState === 'loading') {
		return new Promise<void>(resolve => {
			document.addEventListener('DOMContentLoaded', () => resolve())
		})
	}

	return Promise.resolve()
}
