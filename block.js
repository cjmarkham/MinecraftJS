import * as THREE from 'three'

import { randRange } from './utils'
import { MAX_TERRAIN_HEIGHT } from './constants'

export default class Block {
  chunkBack = false
  chunkFront = false
  chunkLeft = false
  chunkRight = false
  chunkTop = false
  chunkBottom = false
  chunkRow = 0
  type = 'ground'
  colors = ['red', 'green', 'blue', 'yellow', 'white', 'pink', 'orange', 'gray']
  textures = {}

  constructor (x, y, z, textures) {
    this.position = { x, y, z }
    this.textures = textures
    this.color = this.colors[randRange(0, this.colors.length)]

    // * 2 because each block is 2 high
    if (y > MAX_TERRAIN_HEIGHT) {
      this.type = 'air'
    }

    this.object = new THREE.Object3D()
    this.geometry = new THREE.BoxGeometry(1, 1, 1)
  }

  toggleWireframe () {
    this.material.wireframe = !this.material.wireframe
  }

  log () {
    return {
      color: this.color,
      chunkData: this.chunkData,
    }
  }

  render () {
    const sideMaterial = new THREE.MeshBasicMaterial({ map: this.textures.grassSide })

    sideMaterial.minFilter = THREE.NearestFilter
    sideMaterial.magFilter = THREE.NearestFilter
    const topMaterial = new THREE.MeshBasicMaterial({ map: this.textures.grassTop })
    topMaterial.minFilter = THREE.NearestFilter
    topMaterial.magFilter = THREE.NearestFilter
    const bottomMaterial = new THREE.MeshBasicMaterial({ map: this.textures.dirt })
    if (this.type === 'air') {
      this.visible = false
    }

    const mesh = new THREE.Mesh(this.geometry, [sideMaterial, sideMaterial, topMaterial, bottomMaterial, sideMaterial, sideMaterial])
    this.object.add(mesh)
    this.object.position.set(this.position.x, this.position.y, this.position.z)
  }

  get visible () {
    return this.object.visible
  }

  set visible (value) {
    this.object.visible = value
  }

  hideFace (faceDescriptor) {
    let start // The start index in the geometry position array
    switch (faceDescriptor) {
      case 'front':
        start = 48
        break
      case 'back':
        start = 60
        break
      case 'left':
        start = 12
        break
      case 'right':
        start = 0
        break
      case 'top':
        start = 24
        break
      case 'bottom':
        start = 36
        break
    }

    for (let i = start; i < start + 12; i++) {
      this.geometry.attributes.position.array[i] = 0
    }
  }
}
