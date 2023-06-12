import * as THREE from 'three'

export default class Chunk {
  row = 0
  column = 0
  rows = {}
  position = {}
  object = {}

  chunkFront = {}
  chunkRight = {}

  // Debugging
  blocks = []

  constructor (x, y, z) {
    this.position = { x, y, z }
  }

  // TODO: Don't pass world chunks here
  // We need to pass in chunks that are adjacent
  render (worldChunks) {
    console.log('render chunk')
    this.object = new THREE.Object3D()
    this.object.position.set(this.position.x, this.position.y, this.position.z)

    for (let row of Object.keys(this.rows)) {
      row = parseInt(row, 10)
      let rowAbove = false
      let rowBelow = false

      let blockFront = false
      let blockBack = false
      let blockLeft = false
      let blockRight = false
      let blockTop = false
      let blockBottom = false

      if (this.rows[row - 1]) {
        rowBelow = this.rows[row - 1]
      }
      if (this.rows[row + 1]) {
        rowAbove = this.rows[row + 1]
      }

      for (let column of Object.keys(this.rows[row])) {
        column = parseInt(column, 10)

        this.rows[row][column].forEach((block, index) => {
          if (block.type === 'air') {
            this.object.add(block.object)
            return
          }

          blockBack = this.rows[row][column][index - 1]
          blockFront = this.rows[row][column][index + 1]
          blockLeft = this.rows[row][column - 1] && this.rows[row][column - 1][index]
          blockRight = this.rows[row][column + 1] && this.rows[row][column + 1][index]
          blockTop = rowAbove && rowAbove[column][index]
          blockBottom = rowBelow && rowBelow[column][index]

          // Hide the block if it's surrounded by other blocks
          if (rowBelow && rowAbove) {
            if (blockFront && blockBack && blockLeft && blockRight) {
              // Don't hide it if the any of the blocks around it are air
              if (
                blockFront.type !== 'air' &&
                blockBack.type !== 'air' &&
                blockLeft.type !== 'air' &&
                blockRight.type !== 'air' &&
                blockTop.type !== 'air' &&
                blockBottom.type !== 'air'
              ) {
                return
              }
            }
          }

          // Now that we've hidden blocks that won't be seen, we need to hide the faces of
          // others where that face points to another block's face
          if (blockLeft && blockLeft.type !== 'air') {
            block.hideFace('left')
            blockLeft.hideFace('right')
          }
          if (blockRight && blockRight.type !== 'air') {
            block.hideFace('right')
            blockRight.hideFace('left')
          }
          if (blockFront && blockFront.type !== 'air') {
            block.hideFace('front')
            blockFront.hideFace('back')
          }
          if (blockBack && blockBack.type !== 'air') {
            block.hideFace('back')
            blockBack.hideFace('front')
          }
          if (blockTop && blockTop.type !== 'air') {
            block.hideFace('top')
            blockTop.hideFace('bottom')
          }
          if (blockBottom && blockBottom.type !== 'air') {
            block.hideFace('bottom')
            blockBottom.hideFace('top')
          }

          // Now that we've hidden faces that are facing another block
          // we need to do the same for blocks that are on a chunk boundary
          // If they are, we need to see if there's a chunk next to it, so we can hide the face
          // of the block facing the chunk
          if (block.chunkRight && block.type !== 'air') {
            // This block is on the right side edge of the chunk
            // Now we need to figure out if there's a chunk to the right
            const chunkRight = worldChunks.find((c) => {
              return c.row === block.chunkData.chunkRow + 1 && c.column === block.chunkData.chunkColumn
            })

            if (chunkRight) {
              // Now that we know there is a chunk to the right
              // we need to get the block in that chunk that is directly to the right of this block
              const rightBlock = chunkRight.rows[row][0][index]

              // if the block is an air block, we don't need to do anything
              if (rightBlock.type !== 'air') {
                rightBlock.hideFace('left')
                block.hideFace('right')
              }
            }
          }

          if (block.chunkFront && block.type !== 'air') {
            const chunkFront = worldChunks.find((c) => {
              return c.row === block.chunkData.chunkRow && c.column === block.chunkData.chunkColumn + 1
            })

            if (chunkFront) {
              const frontBlock = chunkFront.rows[row][column][0]

              if (frontBlock.type !== 'air') {
                frontBlock.hideFace('back')
                block.hideFace('front')
              }
            }
          }

          block.render()
          this.blocks.push(block)
          this.object.add(block.object)
        })
      }
    }
  }
}
