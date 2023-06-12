import * as THREE from 'three'
import { CHUNK_HEIGHT, CHUNK_WIDTH } from './constants'
import Block from './block'
import { v4 } from 'uuid'
import { Faces } from './utils'

export default class Chunk {
  public id: v4

  public object: THREE.Object3D

  public blocks: Array<Array<Block>> = []

  private scene: THREE.Scene

  public indices: {
    i: number
    j: number
  }

  // Creates the 3D object and adds blocks to it
  constructor (scene: THREE.Scene, x: number, y: number, z: number) {
    this.scene = scene
    this.id = v4()

    this.object = new THREE.Group()
    this.object.position.set(x * CHUNK_WIDTH, y, z * CHUNK_WIDTH)

    for (let k = 1; k <= CHUNK_HEIGHT; k++) {
      const row: Array<Block> = []

      for (let i = 1; i <= CHUNK_WIDTH; i++) {
        for (let j = 1; j <= CHUNK_WIDTH; j++) {
          const position = new THREE.Vector3(i, k, j)
          const block = new Block(scene, this, position.x, position.y, position.z)
          block.indices = Object.assign(block.indices, {
            chunkRow: k,
            columnIndex: i,
            rowIndex: j,
            arrayIndex: row.length,
          })

          this.object.add(block.object)
          row.push(block)
        }
      }

      this.blocks.push(row)
    }
  }

  // Renders blocks in the chunk based on some conditions
  conditionallyRenderBlock (chunkRow: Array<Block>, rowIndex: number, block: Block, blockIndex: number) {
    // Figure out if this block is obscured by one on each side
    const blockToLeft: Block = chunkRow[blockIndex - CHUNK_WIDTH]
    const blockToRight: Block = chunkRow[blockIndex + CHUNK_WIDTH]
    const blockToFront: Block | null = (blockIndex % CHUNK_WIDTH) !== CHUNK_WIDTH - 1 && chunkRow[blockIndex + 1] ? chunkRow[blockIndex + 1] : null
    const blockToBack: Block | null = (blockIndex % CHUNK_WIDTH) !== 0 && chunkRow[blockIndex - 1] ? chunkRow[blockIndex - 1] : null
    const blockAbove: Block | null = this.blocks[rowIndex + 1] ? this.blocks[rowIndex + 1][blockIndex] : null
    const blockBelow: Block | null = this.blocks[rowIndex - 1] ? this.blocks[rowIndex - 1][blockIndex] : null

    // If the block is obscured by a block on each side, we don't need to render it
    // Do we need to add it to the scene at all? Probably for updates to blocks
    if (
      blockToLeft &&
      blockToRight &&
      blockToFront &&
      blockToBack &&
      blockAbove &&
      blockBelow
    ) {
      block.hide()
    }

    block.render(blockAbove)

    // Now we need to see which block faces we need to hide
    // Faces should be hidden if they point to another block
    // Although we don't want to hide anything if the other block is air
    // we also don't need to do it for left and right since we'll manipulate the other blocks face here too
    if (blockToLeft && blockToLeft.type !== 'air') {
      block.hideFace(Faces.LEFT)
      blockToLeft.hideFace(Faces.RIGHT)
    }
    if (blockToFront && blockToFront.type !== 'air') {
      block.hideFace(Faces.FRONT)
      blockToFront.hideFace(Faces.BACK)
    }
    if (blockAbove && blockAbove.type !== 'air') {
      block.hideFace(Faces.TOP)
      blockAbove.hideFace(Faces.BOTTOM)
    }

    // Now we need to re-show faces if they've been hidden and the opposite block
    // no longer exists. Imagine a 2x2 where the faces are hidden if they are opposite.
    // If you delete one of the blocks, you want to show the face that was hidden on the other block
  }

  // Calls the render method
  render ({
    front, right
  }) {
    this.blocks.forEach((row, rowIndex) => {
      row.forEach((block, blockIndex) => {
        // For now, when blocks are deleted, their space in the array is nullified
        if (!block) {
          return
        }
        this.conditionallyRenderBlock(row, rowIndex, block, blockIndex)

        // Now we need to some further conditional rendering based on the chunks around
        // However, we need to know if this block is on the edge of its chunk, and which edge
        const isOnFrontOfChunk = block.indices.rowIndex === CHUNK_WIDTH
        if (isOnFrontOfChunk && front) {
          block.hideFace(Faces.FRONT)
          // For the chunk that's in front, we need to hide the face of every block that's at the back of the chunk
          front.blocks.forEach((row: Array<Block>) => {
            const backBlocks = row.filter((_b: Block, index: number) => index % CHUNK_WIDTH === 0)
            backBlocks.forEach((block: Block) => {
              block.hideFace(Faces.BACK)
            })
          })
        }

        const isOnRightOfChunk = block.indices.columnIndex === CHUNK_WIDTH
        if (isOnRightOfChunk && right) {
          block.hideFace(Faces.RIGHT)
          right.blocks.forEach((row: Array<Block>) => {
            const leftBlocks = row.filter((b: Block) => b.indices.columnIndex === 1)
            leftBlocks.forEach((block: Block) => {
              block.hideFace(Faces.LEFT)
            })
          })
        }
      })
    })
  }
}
