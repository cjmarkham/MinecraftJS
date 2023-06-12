export const randRange = (min, max) => {
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
