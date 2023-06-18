
import * as THREE from 'three'
import Chunk from './chunk'
import { MAX_CHUNKS } from './constants'

export default class World {
  public chunks: Array<Array<Chunk>> = []

  private scene: THREE.Scene

  private texture: THREE.Texture

  constructor (scene: THREE.Scene) {
    this.scene = scene

    // TODO: Put this somewhere else
    this.texture = new THREE.TextureLoader().load('./textures/map.png')
    this.texture.magFilter = THREE.NearestFilter
    this.texture.minFilter = THREE.NearestFilter
    this.texture.anisotropy = 0

    for (let i = 0; i < MAX_CHUNKS; i++) {
      const row: Array<Chunk> = []

      for (let j = 0; j < MAX_CHUNKS; j++) {
        const chunk = new Chunk(i, 0, j)
        chunk.indices = {
          i: i - 1,
          j: j - 1,
        }
        row.push(chunk)
      }

      this.chunks.push(row)
    }
  }

  render () {
    this.chunks.forEach((row: Array<Chunk>, rowIndex: number) => {
      row.forEach((chunk: Chunk, chunkIndex: number) => {
        const chunkMeta = {
          frontChunk: this.chunks[rowIndex][chunkIndex + 1],
          backChunk: this.chunks[rowIndex][chunkIndex - 1],
          leftChunk: this.chunks[rowIndex - 1] && this.chunks[rowIndex - 1][chunkIndex],
          rightChunk: this.chunks[rowIndex + 1] && this.chunks[rowIndex + 1][chunkIndex],
        }

        chunk.render(chunkMeta, this.texture)
        this.scene.add(chunk.object)
      })
    })

    const light = new THREE.AmbientLight(0x404040, 17)
    this.scene.add(light)
  }
}
