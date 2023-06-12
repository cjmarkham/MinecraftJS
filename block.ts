import * as THREE from 'three'

import { randRange, Faces } from './utils'
import { MAX_TERRAIN_HEIGHT } from './constants'
import Chunk from './chunk'

import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'

interface Indices {
  chunkRow?: number
  columnIndex?: number
  rowIndex?: number
  arrayIndex?: number
}

export default class Block {
  private colors = ['red', 'green', 'blue', 'yellow', 'white', 'pink', 'orange', 'gray']

  private materials: Array<THREE.MeshBasicMaterial>

  public type = 'ground'

  public indices: Indices = {}

  public position: THREE.Vector3

  public color: string

  public object: THREE.Object3D

  private geometry: THREE.BoxGeometry

  private scene: THREE.Scene

  public chunk: Chunk

  private mesh: THREE.Mesh

  private blockAbove: Block | null

  private defaultGemoetryAttributes: THREE.BufferAttribute | THREE.InterleavedBufferAttribute

  constructor (scene: THREE.Scene, chunk: Chunk, x: number, y: number, z: number) {
    this.scene = scene
    this.chunk = chunk
    this.position = new THREE.Vector3(x, y, z)
    this.color = this.colors[randRange(0, this.colors.length)]

    if (y > MAX_TERRAIN_HEIGHT) {
      this.type = 'air'
    }

    this.object = new THREE.Object3D()
    this.geometry = new THREE.BoxGeometry(1, 1, 1)

    this.materials = [
      // new THREE.MeshBasicMaterial({ map: World.textures.grassSide }),
      // new THREE.MeshBasicMaterial({ map: World.textures.grassTop, color: '#9ccb6c' }),
      // new THREE.MeshBasicMaterial({ map: World.textures.dirt }),
      new THREE.MeshBasicMaterial({ color: this.color }),
      new THREE.MeshBasicMaterial({ color: this.color }),
      new THREE.MeshBasicMaterial({ color: this.color }),
    ]
  }

  toggleWireframe () {
    this.materials.forEach((m) => {
      m.wireframe = !m.wireframe
    })
  }

  hide () {
    this.object.visible = false
  }

  render (blockAbove: Block | null) {
    this.blockAbove = blockAbove

    if (this.type === 'air') {
      this.object.visible = false
    }

    this.initMesh()
    this.object.position.set(this.position.x, this.position.y, this.position.z)
  }

  initMesh () {
    const meshMaterials = [
      this.blockAbove ? this.materials[2] : this.materials[0],
      this.blockAbove ? this.materials[2] : this.materials[0],
      this.materials[1],
      this.materials[2],
      this.blockAbove ? this.materials[2] : this.materials[0],
      this.blockAbove ? this.materials[2] : this.materials[0],
    ]

    this.mesh = new THREE.Mesh(this.geometry, meshMaterials)
    this.mesh.userData = {
      chunk: this.chunk,
      indices: this.indices,
    }
    this.object.add(this.mesh)
  }

  // Resets the position attributes of the geometry (unhiding faces)
  reset () {
    console.log('reset')
    this.object.remove(this.mesh)
    this.geometry.setAttribute('position', this.defaultGemoetryAttributes)
    this.initMesh()
  }





  static Single (scene: THREE.Scene) {
    const rightGeo = new THREE.BufferGeometry()
    const frontGeo = new THREE.BufferGeometry()
    const topGeo = new THREE.BufferGeometry()
    const verts = {
      front: [
        -1, -1, 1, 1, -1, 1, -1, 1, 1,
        -1, 1, 1, 1, -1, 1, 1, 1, 1,
      ],
      back: [
        1, -1, -1, -1, -1, -1, 1, 1, -1,
        1, 1, -1, -1, -1, -1, -1, 1, -1,
      ],
      left: [
        -1, -1, -1, -1, -1, 1, -1, 1, -1,
        -1, 1, -1, -1, -1, 1, -1, 1, 1,
      ],
      right: [
        1, -1, 1, 1, -1, -1, 1, 1, 1,
        1, 1, 1, 1, -1, -1, 1, 1, -1,
      ],
      top: [
        1, 1, -1, -1, 1, -1, 1, 1, 1,
        1, 1, 1, -1, 1, -1, -1, 1, 1,
      ],
      bottom: [
        1, -1, 1, -1, -1, 1, 1, -1, -1,
        1, -1, -1, -1, -1, 1, -1, -1, -1,
      ],
    }
    rightGeo.setAttribute('position', new THREE.Float32BufferAttribute(rightVerts, 3))
    frontGeo.setAttribute('position', new THREE.Float32BufferAttribute(frontVerts, 3))
    topGeo.setAttribute('position', new THREE.Float32BufferAttribute(topVerts, 3))

    const geometries = [rightGeo, frontGeo]

    const geometry = BufferGeometryUtils.mergeGeometries(geometries)
    console.log(geometry)

    const material = new THREE.MeshBasicMaterial({ color: 'red' })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const n = BufferGeometryUtils.mergeGeometries([rightGeo, topGeo, frontGeo])
    mesh.geometry = n
  }










  hideFace (faceDescriptor: Faces) {
    let start: number // The start index in the geometry position array
    switch (faceDescriptor) {
      case Faces.FRONT:
        start = 48
        break
      case Faces.BACK:
        start = 60
        break
      case Faces.LEFT:
        start = 12
        break
      case Faces.RIGHT:
        start = 0
        break
      case Faces.TOP:
        start = 24
        break
      case Faces.BOTTOM:
        start = 36
        break
    }

    for (let i = start; i < start + 12; i++) {
      const position = this.geometry.getAttribute('position')
      // @ts-ignore
      position.array[i] = 0
      this.geometry.setAttribute('position', position)
    }
  }
}
