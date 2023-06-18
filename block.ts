import * as THREE from 'three'

import Chunk from './chunk'
import { getTextureCoords, getUvMapForBlock } from './utils'

interface FaceMap {
  left?: boolean
  right?: boolean
  top?: boolean
  bottom?: boolean
  front?: boolean
  back?: boolean
}

export default class Block {
  public vertices = [
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5
  ]

  public type = 'ground'

  public visible: boolean = true

  public facesToHide: FaceMap = {}

  public chunk: Chunk

  // The Vector3 position in the chunk
  private position: THREE.Vector3

  public meta: any = {}

  constructor (type: string, x: number, y: number, z: number) {
    this.type = type
    this.position = new THREE.Vector3(x, y, z)
  }

  // Returns an array of positions and indices making the 
  // geometry for this model
  public getGeometryData (t: THREE.Texture): THREE.BufferGeometry | null {
    if (this.type === 'air') {
      return null
    }

    const uvs = getUvMapForBlock(this.type)

    const box = new THREE.BoxGeometry().toNonIndexed()

    box.translate(this.position.x, this.position.y, this.position.z)
    const pos = box.getAttribute('position').clone()

    const rightStart = 0
    const leftStart = 18
    const topIndex = 36
    const bottomStart = 54
    const frontStart = 72
    const backStart = 90

    if (this.facesToHide.right) {
      for (let i = rightStart; i < rightStart + 18; i++) {
        pos.array[i] = 0
      }
    }

    if (this.facesToHide.left) {
      for (let i = leftStart; i < leftStart + 18; i++) {
        pos.array[i] = 0
      }
    }

    if (this.facesToHide.top) {
      for (let i = topIndex; i < topIndex + 18; i++) {
        pos.array[i] = 0
      }
    }

    if (this.facesToHide.bottom) {
      for (let i = bottomStart; i < bottomStart + 18; i++) {
        pos.array[i] = 0
      }
    }

    if (this.facesToHide.front) {
      for (let i = frontStart; i < frontStart + 18; i++) {
        pos.array[i] = 0
      }
    }

    if (this.facesToHide.back) {
      for (let i = backStart; i < backStart + 18; i++) {
        pos.array[i] = 0
      }
    }

    box.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    box.setAttribute('position', pos)
    return box
  }
}
