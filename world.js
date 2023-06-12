
import * as THREE from 'three'
import Chunk from './chunk'
import Block from './block'
import { CHUNK_HEIGHT, CHUNK_WIDTH, MAX_CHUNKS } from './constants'
import { randRange } from './utils'

export default class World {
  chunks = []
  textures = {}

  constructor (textures) {
    this.textures = textures
  }

  generateChunks () {
    for (let i = 1; i <= MAX_CHUNKS; i++) {
      for (let j = 1; j <= MAX_CHUNKS; j++) {
        const chunk = this.generateChunk(i, 0, j)
        chunk.row = i - 1
        chunk.column = j - 1

        this.chunks.push(chunk)
      }
    }
  }

  generateChunk (x, y, z) {
    const chunk = new Chunk(x * CHUNK_WIDTH, y, z * CHUNK_WIDTH)

    for (let k = 1; k <= CHUNK_HEIGHT; k++) {
      const row = {}

      for (let i = 1; i <= CHUNK_WIDTH; i++) {
        for (let j = 1; j <= CHUNK_WIDTH; j++) {
          const position = new THREE.Vector3(i, k, j)
          console.log(position)

          const block = new Block(position.x, position.y, position.z, this.textures)

          block.chunkData = {
            rowInChunk: k - 1,
            columnInChunk: j - 1,
            chunkRow: x - 1,
            chunkColumn: z - 1,
          }

          const types = ['ground', 'air']
          block.type = types[randRange(0, types.length)]

          if (i === 1) {
            block.chunkLeft = true
          }
          if (i === CHUNK_WIDTH) {
            block.chunkRight = true
          }
          if (k === 1) {
            block.chunkBottom = true
          }
          if (k === CHUNK_HEIGHT) {
            block.chunkTop = true
          }
          if (j === 1) {
            block.chunkBack = true
          }
          if (j === CHUNK_WIDTH) {
            block.chunkFront = true
          }

          if (!row[i - 1]) {
            row[i - 1] = []
          }
          row[i - 1].push(block)
        }
      }
      chunk.rows[k - 1] = row
    }

    return chunk
  }
}
