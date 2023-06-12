
import * as THREE from 'three'
import Chunk from './chunk'
import { MAX_CHUNKS } from './constants'
import Block from './block'

export default class World {
  public chunks: Array<Array<Chunk>> = []

  public static textures: {
    [key: string]: THREE.Texture
  } = {}

  public scene: THREE.Scene

  constructor (scene: THREE.Scene) {
    this.scene = scene
    for (let i = 1; i <= MAX_CHUNKS; i++) {
      const row: Array<Chunk> = []

      for (let j = 1; j <= MAX_CHUNKS; j++) {
        const chunk = new Chunk(scene, i, 0, j)
        chunk.indices = {
          i: i - 1,
          j: j - 1,
        }
        row.push(chunk)
      }

      this.chunks.push(row)
    }
  }

  public static LoadTextures () {
    const loader = new THREE.TextureLoader()

    this.textures.grassSide = loader.load('./textures/grass_block_side.png')
    this.textures.grassSide.magFilter = THREE.NearestFilter
    this.textures.grassTop = loader.load('./textures/grass_block_top.png')
    this.textures.grassTop.magFilter = THREE.NearestFilter
    this.textures.dirt = loader.load('./textures/dirt.png')
    this.textures.dirt.magFilter = THREE.NearestFilter
  }

  render () {
    this.chunks.forEach((row: Array<Chunk>, rowIndex: number) => {
      row.forEach((chunk: Chunk, chunkIndex: number) => {
        const chunkFront = (chunkIndex % MAX_CHUNKS) !== MAX_CHUNKS - 1 && this.chunks[rowIndex][chunkIndex + 1] ? this.chunks[rowIndex][chunkIndex + 1] : null
        const chunkRight = this.chunks[rowIndex + 1] ? this.chunks[rowIndex + 1][chunkIndex] : null

        chunk.render({
          right: chunkRight,
          front: chunkFront,
        })
      })
    })

    Block.Single(this.scene)
  }

  updateChunk (chunk: Chunk) {
    const { i, j } = chunk.indices
    const chunkFront = (j % MAX_CHUNKS) !== MAX_CHUNKS - 1 && this.chunks[i][j + 1] ? this.chunks[i][j + 1] : null
    const chunkRight = this.chunks[i + 1] ? this.chunks[i + 1][j] : null

    chunk.render({
      right: chunkRight,
      front: chunkFront,
    })
  }
}
