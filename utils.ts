export const randRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min) + min)
}

export enum Faces {
  FRONT,
  BACK,
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
}

const positionsInAtlas = {
  grassSide: {
    column: 1,
    row: 1,
  },
  gravel: {
    column: 2,
    row: 1,
  },
  grassTop: {
    column: 1,
    row: 2,
  },
  dirt: {
    column: 1,
    row: 3,
  },
  sand: {
    column: 1,
    row: 4,
  },
  cobblestone: {
    column: 2,
    row: 2,
  }
}

export const getTextureCoords = (textureName: string): Array<number> => {
  if (!positionsInAtlas[textureName]) {
    return []
  }

  const positionData = positionsInAtlas[textureName]

  const numColumns = 2
  const numRows = 4
  const columnOffset = 1 / numColumns
  const rowOffset = 1 / numRows

  const x1 = (positionData.column / numColumns) - columnOffset
  const x2 = 1 - (positionData.row / numRows) + rowOffset

  const x3 = x1 + columnOffset
  const x4 = x2

  const y1 = x1
  const y2 = 1 - (positionData.row / numRows)

  const y3 = y1 + columnOffset
  const y4 = y2

  const topLeft = [x1, x2]
  const bottomLeft = [y1, y2]
  const topRight = [x3, x4]
  const bottomRight = [y3, y4]

  const map = [
    ...topLeft,
    ...bottomLeft,
    ...topRight,
    ...bottomLeft,
    ...bottomRight,
    ...topRight,
  ]

  return map
}

const blockTextureParts = {
  grass: ['grassSide', 'grassSide', 'grassTop', 'dirt', 'grassSide', 'grassSide'],
  dirt: ['dirt'],
  sand: ['sand'],
  gravel: ['gravel'],
  cobblestone: ['cobblestone'],
}

export const getUvMapForBlock = (blockName: string): Array<number> => {
  const parts = blockTextureParts[blockName]
  if (!parts || parts.length === 0) {
    return []
  }
  const maps: Array<number> = []

  if (parts.length === 1) {
    for (let i = 0; i < 6; i++) {
      maps.push(...getTextureCoords(parts[0]))
    }

    return maps
  }

  parts.forEach((p) => {
    maps.push(...getTextureCoords(p))
  })

  return maps
}
