// TODO material arrays are not handled. Any LUME elements have one material. If
// a user make a subclass or provides a custom three objects with a material
// array, we set properties onto each material, assuming they're all the same
// type. Perhaps we need an HTML syntax for multiple materials on an element.

import {TextureLoader} from 'three/src/loaders/TextureLoader.js'
import {Color} from 'three/src/math/Color.js'
import {DoubleSide, FrontSide, BackSide, Side} from 'three/src/constants.js'
import {Material} from 'three/src/materials/Material.js'
import {reactive, booleanAttribute, stringAttribute, numberAttribute} from '../../attribute.js'
import {onCleanup} from 'solid-js'
import {GeometryOrMaterialBehavior} from '../GeometryOrMaterialBehavior.js'
// import {isDisposable} from '../../../utils/three.js'

import type {MeshComponentType} from '../MeshBehavior.js'
import type {MeshPhongMaterial, Texture} from 'three'
import type {ClipPlanesBehavior} from '../ClipPlanesBehavior.js'

export type MaterialBehaviorAttributes =
	| 'alphaTest'
	| 'clipIntersection'
	| 'colorWrite'
	| 'depthTest'
	| 'depthWrite'
	| 'dithering'
	| 'wireframe'
	| 'sidedness'
	| 'color'

/**
 * @class MaterialBehavior -
 * > :construction: :hammer: Under construction! :hammer: :construction:
 *
 * Base class for material behaviors.
 *
 * @extends GeometryOrMaterialBehavior
 */
@reactive
export class MaterialBehavior extends GeometryOrMaterialBehavior {
	type: MeshComponentType = 'material'

	/**
	 * Sets the alpha value to be used when running an alpha test. Default is 0.
	 * @default 0
	 */
	@numberAttribute(0) alphaTest = 0
	@booleanAttribute(false) clipIntersection = false
	// @booleanAttribute(true) clipShadows = true // located in ClipPlanesBehavior instead
	@booleanAttribute(true) colorWrite = true
	// defines
	// depthFunc
	@booleanAttribute(true) depthTest = true
	@booleanAttribute(true) depthWrite = true
	@booleanAttribute(false) dithering = false
	@booleanAttribute(true) fog = true

	// TODO wireframe works with -geometry behaviors, but not with obj-model
	// because obj-model doesn't inherit from geometry. We should share common
	// props like wireframe...
	@booleanAttribute(false) wireframe = false

	/**
	 * @property {'front' | 'back' | 'double'} sidedness - Whether to render
	 * one side or the other of any polygons, or both sides.  If the side that
	 * isn't rendered is facing towards the camera, the polygon will be
	 * invisible. Use "both" if you want the polygons to always be visible no
	 * matter which side faces the camera.
	 */
	@stringAttribute('front') sidedness: 'front' | 'back' | 'double' = 'front'

	@stringAttribute('deeppink')
	get color(): Color {
		return this.#color
	}
	set color(val: string | number | Color) {
		val = val ?? ''
		if (typeof val === 'string') this.#color.set(val)
		else if (typeof val === 'number') this.#color.set(val)
		else this.#color = val
	}

	#color = new Color('deeppink')

	get transparent(): boolean {
		if (this.element.opacity < 1) return true
		else return false
	}

	override loadGL() {
		super.loadGL()

		const mat = this.meshComponent!

		this.createEffect(() => {
			mat.alphaTest = this.alphaTest
			mat.clipIntersection = this.clipIntersection
			mat.colorWrite = this.colorWrite
			mat.depthTest = this.depthTest
			mat.depthWrite = this.depthWrite
			mat.dithering = this.dithering
			this.element.needsUpdate()
		})

		// TODO Better taxonomy organization, no any types, to avoid the below
		// conditional checks.

		// Only some materials have wireframe.
		if ('wireframe' in mat) {
			this.createEffect(() => {
				;(mat as MeshPhongMaterial).wireframe = this.wireframe
				this.element.needsUpdate()
			})
		}

		if ('side' in mat) {
			this.createEffect(() => {
				let side: Side

				switch (this.sidedness) {
					case 'front':
						side = FrontSide
						break
					case 'back':
						side = BackSide
						break
					case 'double':
						side = DoubleSide
						break
				}

				mat.side = side

				this.element.needsUpdate()
			})
		}

		if ('color' in mat) {
			this.createEffect(() => {
				;(mat as MeshPhongMaterial).color = this.color
				this.element.needsUpdate()
			})
		}

		this.createEffect(() => {
			mat.opacity = this.element.opacity
			mat.transparent = this.transparent

			this.element.needsUpdate()
		})
	}

	override _createComponent(): Material {
		super._createComponent
		return new Material()
	}

	override resetMeshComponent() {
		super.resetMeshComponent()

		// TODO CLIP PLANES REACTIVITY HACK, This triggers the
		// ClipPlanesBehavior effect in case the material changed. TODO: Make
		// element.behaviors reactive so that the dependent code can react to
		// material changes instead.
		const clipPlanes = this.element.behaviors.get('clip-planes') as ClipPlanesBehavior | undefined
		if (!clipPlanes) return
		console.log('PLANES trigger clipShadows', clipPlanes.clipPlanes)
		clipPlanes.clipShadows = clipPlanes.clipShadows
	}

	// Any time a texture is loaded, this gets set with the loaded Texture
	// instance.
	@reactive _actualTexture: Texture | null = null

	_handleTexture(textureUrl: () => string, setTexture: (t: Texture | null) => void) {
		const mat = this.meshComponent

		this.createEffect(() => {
			const url = textureUrl() // this is a dependency of the effect

			if (url) {
				// TODO The default material color (if not specified) when
				// there's a texture should be white

				// @ts-ignore
				const texture = new TextureLoader().load(url, () => {
					this.element.needsUpdate()
					this._actualTexture = texture
				})

				onCleanup(() => {
					texture.dispose()
				})

				// TODO handle Material[] arrays
				setTexture(texture)
			} else {
				setTexture(null)
			}

			mat!.needsUpdate = true // Three.js needs to update the material in the GPU
			this.element.needsUpdate() // LUME needs to re-render
		})
	}
}
