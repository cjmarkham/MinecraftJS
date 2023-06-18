import * as THREE from 'three'
import { CHUNK_HEIGHT, CHUNK_WIDTH } from './constants'
import Block from './block'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { randRange } from './utils'

export default class Chunk {
  public object: THREE.Object3D

  public blocks: Array<Array<Block>> = []

  public material: THREE.MeshBasicMaterial

  public color: string

  private zValue: number = 0

  public indices: {
    i: number
    j: number
  }

  // Creates the 3D object and adds blocks to it
  constructor (x: number, y: number, z: number) {
    this.object = new THREE.Group()
    this.object.position.set(x * CHUNK_WIDTH, y, z * CHUNK_WIDTH)

    this.zValue += 1.0 / 60.0

    for (let k = 0; k < CHUNK_HEIGHT; k++) {
      const row: Array<Block> = []

      for (let i = 0; i < CHUNK_WIDTH; i++) {
        for (let j = 0; j < CHUNK_WIDTH; j++) {
          const position = new THREE.Vector3(i, k, j)
          const types = ['grass', 'air', 'sand', 'cobblestone', 'air', 'air']
          const type = types[randRange(0, types.length)]
          const block = new Block(type, position.x, position.y, position.z)
          block.meta = Object.assign(block.meta, {
            chunkRow: k,
            columnIndex: i,
            rowIndex: j,
            arrayIndex: row.length,
          })

          row.push(block)
        }
      }

      this.blocks.push(row)
    }
  }

  getFacesToHide (chunkRow: Array<Block>, block: Block, chunkMeta: any) {
    // Figure out if this block is obscured by one on each side
    const hasBlockLeft = chunkRow.hasOwnProperty(block.meta.arrayIndex - CHUNK_WIDTH) && chunkRow[block.meta.arrayIndex - CHUNK_WIDTH].type !== 'air'
    const hasBlockRight = chunkRow.hasOwnProperty(block.meta.arrayIndex + CHUNK_WIDTH) && chunkRow[block.meta.arrayIndex + CHUNK_WIDTH].type !== 'air'

    const hasBlockFront = block.meta.rowIndex !== CHUNK_WIDTH - 1 && chunkRow.hasOwnProperty(block.meta.arrayIndex + 1) && chunkRow[block.meta.arrayIndex + 1].type !== 'air'
    const hasBlockBack = block.meta.rowIndex !== 0 && chunkRow.hasOwnProperty(block.meta.arrayIndex - 1) && chunkRow[block.meta.arrayIndex - 1].type !== 'air'

    const hasBlockAbove = this.blocks.hasOwnProperty(block.meta.chunkRow + 1) &&
      this.blocks[block.meta.chunkRow + 1].hasOwnProperty(block.meta.arrayIndex) &&
      this.blocks[block.meta.chunkRow + 1][block.meta.arrayIndex].type !== 'air'

    const hasBlockBelow = this.blocks.hasOwnProperty(block.meta.chunkRow - 1) &&
      this.blocks[block.meta.chunkRow - 1].hasOwnProperty(block.meta.arrayIndex) &&
      this.blocks[block.meta.chunkRow - 1][block.meta.arrayIndex].type !== 'air'

    // If the block is obscured by a block on each side, we don't need to render it
    // Do we need to add it to the scene at all? Probably for updates to blocks
    if (
      hasBlockLeft &&
      hasBlockRight &&
      hasBlockFront &&
      hasBlockBack &&
      hasBlockAbove &&
      hasBlockBelow
    ) {
      block.visible = false
    }

    const isOnFrontOfChunk = block.meta.rowIndex === CHUNK_WIDTH - 1
    const isOnBackOfChunk = block.meta.rowIndex === 0
    const isOnRightOfChunk = block.meta.columnIndex === CHUNK_WIDTH - 1
    const isOnLeftOfChunk = block.meta.columnIndex === 0

    // Now we need to see which block faces we need to hide
    // Faces should be hidden if they point to another block
    // Although we don't want to hide anything if the other block is air
    // we also don't need to do it for left and right since we'll manipulate the other blocks face here too
    if (hasBlockLeft || (isOnLeftOfChunk && chunkMeta.leftChunk)) {
      if (chunkMeta.leftChunk && isOnLeftOfChunk) {
        const index = block.meta.arrayIndex + ((CHUNK_WIDTH * CHUNK_WIDTH) - CHUNK_WIDTH)
        const otherBlock = chunkMeta.leftChunk.blocks[block.meta.chunkRow] && chunkMeta.leftChunk.blocks[block.meta.chunkRow].hasOwnProperty(index) ? chunkMeta.leftChunk.blocks[block.meta.chunkRow][index] : null
        if (otherBlock && otherBlock.type !== 'air') {
          block.facesToHide.left = true
        }
      }

      if (hasBlockLeft) {
        block.facesToHide.left = true
      }
    }

    if (hasBlockRight || (isOnRightOfChunk && chunkMeta.rightChunk)) {
      if (chunkMeta.rightChunk && isOnRightOfChunk) {
        const index = block.meta.arrayIndex - ((CHUNK_WIDTH * CHUNK_WIDTH) - CHUNK_WIDTH)
        const otherBlock = chunkMeta.rightChunk.blocks[block.meta.chunkRow] && chunkMeta.rightChunk.blocks[block.meta.chunkRow].hasOwnProperty(index) ? chunkMeta.rightChunk.blocks[block.meta.chunkRow][index] : null
        if (otherBlock && otherBlock.type !== 'air') {
          block.facesToHide.right = true
        }
      }
      if (hasBlockRight) {
        block.facesToHide.right = true
      }
    }

    if (hasBlockFront || (isOnFrontOfChunk && chunkMeta.frontChunk)) {
      // We need to know if the block in the other chunk is air or not
      if (chunkMeta.frontChunk && isOnFrontOfChunk) {
        const index = block.meta.arrayIndex - (CHUNK_WIDTH - 1)
        const otherBlock = chunkMeta.frontChunk.blocks[block.meta.chunkRow] ? chunkMeta.frontChunk.blocks[block.meta.chunkRow][index] : null
        if (otherBlock && otherBlock.type !== 'air') {
          block.facesToHide.front = true
        }
      }
      if (hasBlockFront) {
        block.facesToHide.front = true
      }
    }

    if (hasBlockBack || (isOnBackOfChunk && chunkMeta.backChunk)) {
      if (chunkMeta.backChunk && isOnBackOfChunk) {
        const index = block.meta.arrayIndex + (CHUNK_WIDTH - 1)
        const otherBlock = chunkMeta.backChunk.blocks[block.meta.chunkRow] ? chunkMeta.backChunk.blocks[block.meta.chunkRow][index] : null
        if (otherBlock && otherBlock.type !== 'air') {
          block.facesToHide.back = true
        }
      }
      if (hasBlockBack) {
        block.facesToHide.back = true
      }
    }

    if (hasBlockAbove) {
      if (block.type === 'grass') {
        block.type = 'dirt'
      }
      block.facesToHide.top = true
    }
    if (hasBlockBelow) {
      block.facesToHide.bottom = true
    }
  }

  render (chunkMeta: any, textureMap: THREE.Texture) {
    const geometries: Array<THREE.BufferGeometry> = []

    this.blocks.forEach((row, rowIndex) => {
      row.forEach((block, blockIndex) => {
        this.getFacesToHide(row, block, chunkMeta)

        const geometry = block.getGeometryData(textureMap)
        if (geometry !== null) {
          geometries.push(geometry)
        }
      })
    })

    const colors = ['red', 'green', 'blue', 'yellow', 'pink']
    const color = colors[randRange(0, colors.length)]
    this.color = color // debugging
    this.material = new THREE.MeshStandardMaterial({ map: textureMap })

    // This only happens if every block in the chunk is air
    if (geometries.length === 0) {
      return
    }
    const geometry = BufferGeometryUtils.mergeGeometries(geometries, true)

    const mesh = new THREE.Mesh(geometry, this.material)
    mesh.userData = {
      chunk: this,
    }
    mesh.receiveShadow = true
    mesh.castShadow = true

    this.object.add(mesh)
  }

  public toggleWireframe () {
    this.material.wireframe = !this.material.wireframe
  }
}
